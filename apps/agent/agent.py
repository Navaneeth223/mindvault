"""
ARIA Agent Core
─────────────────────────────────────────────────────────────────────────────
Main agent loop: understand → recall → plan → use tools → respond → learn.

The agent runs up to MAX_TOOL_ROUNDS rounds of tool use before giving a
final response. This prevents infinite loops while allowing multi-step tasks.
"""
from __future__ import annotations
import logging
from typing import Optional

from .llm import get_llm_provider
from .memory import semantic_search, get_recent_conversation_context, get_personal_facts
from .tools import TOOL_DEFINITIONS, ARIAToolExecutor
from .prompts import build_system_prompt
from .models import AgentSettings, Conversation, Message

logger = logging.getLogger(__name__)

MAX_TOOL_ROUNDS = 4  # max tool-use iterations per request


def run_agent(
    user,
    user_message: str,
    conversation_id: Optional[str] = None,
) -> dict:
    """
    Main agent entry point.

    Args:
        user: Django User instance
        user_message: The user's input text
        conversation_id: Optional UUID string to continue an existing conversation

    Returns:
        {
            'response': str,           — ARIA's final text response
            'tool_calls': list,        — tools used with arguments and results
            'cards_referenced': list,  — card IDs ARIA found relevant
            'conversation_id': str,    — UUID of the conversation
            'actions': list,           — special frontend actions (start_timer, etc.)
        }
    """

    # ── 1. Get or create conversation ─────────────────────────────────────────
    if conversation_id:
        try:
            conversation = Conversation.objects.get(id=conversation_id, user=user)
        except Conversation.DoesNotExist:
            conversation = Conversation.objects.create(user=user)
    else:
        conversation = Conversation.objects.create(user=user)

    # ── 2. Load agent settings ─────────────────────────────────────────────────
    settings, _ = AgentSettings.objects.get_or_create(user=user)

    try:
        llm = get_llm_provider(settings)
    except (ValueError, Exception) as e:
        # LLM not configured — return helpful error
        error_msg = str(e)
        Message.objects.create(
            conversation=conversation, role='user', content=user_message
        )
        Message.objects.create(
            conversation=conversation, role='assistant',
            content=f"⚠️ {error_msg}\n\nGo to **Settings → ARIA** to configure your AI provider.",
        )
        return {
            'response': f"⚠️ {error_msg}\n\nGo to **Settings → ARIA** to configure your AI provider.",
            'tool_calls': [],
            'cards_referenced': [],
            'conversation_id': str(conversation.id),
            'actions': [],
        }

    executor = ARIAToolExecutor(user)

    # ── 3. Build context ───────────────────────────────────────────────────────
    personal_facts = get_personal_facts(user) if settings.memory_enabled else []
    relevant_cards = semantic_search(str(user.id), user_message, n_results=3)
    recent_context = get_recent_conversation_context(user, max_messages=8)

    # ── 4. Build system prompt ─────────────────────────────────────────────────
    system_prompt = build_system_prompt(
        aria_name=settings.aria_name,
        language=settings.language_preference,
        personal_facts=personal_facts,
        relevant_cards=relevant_cards,
    )

    # ── 5. Assemble message history ────────────────────────────────────────────
    messages = [{'role': 'system', 'content': system_prompt}]
    messages.extend(recent_context)
    messages.append({'role': 'user', 'content': user_message})

    # ── 6. Save user message ───────────────────────────────────────────────────
    Message.objects.create(
        conversation=conversation,
        role='user',
        content=user_message,
    )

    # ── 7. Agent loop ──────────────────────────────────────────────────────────
    tool_calls_log = []
    actions = []
    cards_referenced = [r['id'] for r in relevant_cards]

    for round_num in range(MAX_TOOL_ROUNDS):
        try:
            response = llm.complete(messages, tools=TOOL_DEFINITIONS)
        except Exception as e:
            logger.error(f"LLM error in round {round_num}: {e}")
            error_response = (
                f"I encountered an error connecting to the AI model: {str(e)}\n\n"
                "Please check your ARIA settings and ensure your AI provider is running."
            )
            _save_assistant_message(
                conversation, error_response, tool_calls_log, cards_referenced, user
            )
            return _build_result(
                error_response, tool_calls_log, cards_referenced,
                conversation, actions
            )

        tool_calls = response.get('tool_calls', [])

        if tool_calls:
            # Execute each tool call
            for tc in tool_calls:
                tool_name = tc.get('name', '')
                arguments = tc.get('arguments', {})

                logger.info(f"ARIA tool call: {tool_name}({arguments})")

                # Execute the tool
                tool_result = executor.execute(tool_name, arguments)

                # Detect special frontend actions (e.g. start_timer)
                if isinstance(tool_result, str) and tool_result.startswith('__START_TIMER__'):
                    parts = tool_result.split('__')
                    # parts: ['', 'START_TIMER', minutes, label, '']
                    try:
                        timer_minutes = int(parts[2])
                        timer_label = parts[3] if len(parts) > 3 else 'Focus session'
                    except (IndexError, ValueError):
                        timer_minutes = 25
                        timer_label = 'Focus session'
                    actions.append({
                        'type': 'start_timer',
                        'minutes': timer_minutes,
                        'label': timer_label,
                    })
                    tool_result = f"✓ Timer started: {timer_label} for {timer_minutes} minutes."

                tool_calls_log.append({
                    'tool': tool_name,
                    'arguments': arguments,
                    'result': tool_result,
                })

                # Add tool call + result to message history for next round
                messages.append({
                    'role': 'assistant',
                    'content': response.get('content', ''),
                    'tool_calls': [tc],
                })
                messages.append({
                    'role': 'tool',
                    'content': tool_result,
                    'tool_call_id': tc.get('id', tool_name),
                })

        else:
            # No more tool calls — this is the final response
            final_response = response.get('content', '').strip()

            if not final_response:
                final_response = "I've completed the requested actions. Is there anything else you need?"

            # Save assistant message with tool call history
            _save_assistant_message(
                conversation, final_response, tool_calls_log, cards_referenced, user,
                tokens=response.get('tokens', 0),
            )

            # Auto-update conversation title from first exchange
            if conversation.messages.count() <= 2 and not conversation.title:
                conversation.title = user_message[:80]
                conversation.save(update_fields=['title'])

            # Background: extract personal facts from this conversation
            if settings.memory_enabled:
                try:
                    from .tasks import extract_facts_background
                    extract_facts_background.delay(
                        user.id,
                        f"User: {user_message}\nARIA: {final_response}",
                    )
                except Exception as e:
                    logger.warning(f"Could not queue fact extraction: {e}")

            return _build_result(
                final_response, tool_calls_log, cards_referenced,
                conversation, actions
            )

    # Safety fallback — should rarely reach here
    fallback = "I've completed the requested actions. Is there anything else you need?"
    _save_assistant_message(conversation, fallback, tool_calls_log, cards_referenced, user)
    return _build_result(fallback, tool_calls_log, cards_referenced, conversation, actions)


def _save_assistant_message(
    conversation: Conversation,
    content: str,
    tool_calls: list,
    cards_referenced: list,
    user,
    tokens: int = 0,
) -> Message:
    """Save the assistant's response to the database."""
    msg = Message.objects.create(
        conversation=conversation,
        role='assistant',
        content=content,
        tool_calls=tool_calls,
        tokens_used=tokens,
    )
    if cards_referenced:
        from apps.cards.models import Card
        cited_cards = Card.objects.filter(id__in=cards_referenced, user=user)
        msg.cards_cited.set(cited_cards)
    return msg


def _build_result(
    response: str,
    tool_calls: list,
    cards_referenced: list,
    conversation: Conversation,
    actions: list,
) -> dict:
    """Build the standardised return dict."""
    return {
        'response': response,
        'tool_calls': tool_calls,
        'cards_referenced': cards_referenced,
        'conversation_id': str(conversation.id),
        'actions': actions,
    }
