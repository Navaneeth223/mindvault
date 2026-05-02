"""
ARIA Celery Tasks
─────────────────────────────────────────────────────────────────────────────
Background tasks:
  - extract_facts_background: extract personal facts after each conversation
  - index_card_async: index a card into ChromaDB after save
  - auto_tag_card: use LLM to suggest tags for a new card
  - send_daily_briefing: morning briefing for all users who opted in
  - reindex_user_vault: reindex all cards for a user
"""
from __future__ import annotations
import logging
import json
import re

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2)
def extract_facts_background(self, user_id: int, conversation_text: str):
    """
    Extract personal facts from a conversation and save them.
    Runs after every ARIA response — best-effort, never crashes the agent.
    """
    try:
        from django.contrib.auth import get_user_model
        from .models import AgentSettings
        from .llm import get_llm_provider
        from .memory import extract_and_save_facts

        User = get_user_model()
        user = User.objects.get(id=user_id)
        settings, _ = AgentSettings.objects.get_or_create(user=user)

        if not settings.memory_enabled:
            return

        llm = get_llm_provider(settings)
        count = extract_and_save_facts(user, conversation_text, llm)
        logger.info(f"Extracted {count} new facts for user {user_id}")
    except Exception as e:
        logger.warning(f"Fact extraction failed for user {user_id}: {e}")
        # Don't retry — fact extraction is best-effort


@shared_task(bind=True, max_retries=3)
def index_card_async(self, card_id: str):
    """
    Index a card into ChromaDB asynchronously.
    Called via Django signal after card save.
    """
    try:
        from apps.cards.models import Card
        from .memory import index_card

        card = Card.objects.get(id=card_id)
        success = index_card(card)
        if success:
            logger.debug(f"Indexed card {card_id}")
        else:
            logger.warning(f"Failed to index card {card_id}")
    except Exception as e:
        logger.error(f"index_card_async error for {card_id}: {e}")
        raise self.retry(exc=e, countdown=30)


@shared_task(bind=True, max_retries=2)
def auto_tag_card(self, card_id: str):
    """
    Use LLM to suggest and apply tags to a newly saved card.
    Only runs if auto_tag_cards is enabled in AgentSettings.
    """
    try:
        from apps.cards.models import Card
        from .models import AgentSettings
        from .llm import get_llm_provider
        from .prompts import build_auto_tag_prompt

        card = Card.objects.get(id=card_id)
        settings, _ = AgentSettings.objects.get_or_create(user=card.user)

        if not settings.auto_tag_cards:
            return

        llm = get_llm_provider(settings)
        content = f"{card.description}\n{card.body[:500]}"
        messages = build_auto_tag_prompt(card.title, content)

        response = llm.complete(messages)
        content_str = response.get('content', '')

        # Extract JSON array from response
        match = re.search(r'\[.*?\]', content_str, re.DOTALL)
        if match:
            tags = json.loads(match.group())
            valid_tags = [
                t.lower().strip()
                for t in tags
                if isinstance(t, str) and len(t) > 1
            ][:5]
            if valid_tags:
                card.tags.add(*valid_tags)
                logger.info(f"Auto-tagged card {card_id}: {valid_tags}")
    except Exception as e:
        logger.warning(f"auto_tag_card failed for {card_id}: {e}")
        # Don't retry — tagging is best-effort


@shared_task
def send_daily_briefing(user_id: int):
    """
    Generate and store a personalised morning briefing for a user.
    Scheduled via Celery Beat based on user's briefing_time preference.
    """
    try:
        from django.contrib.auth import get_user_model
        from django.utils import timezone
        from datetime import timedelta
        from apps.cards.models import Card
        from .models import AgentSettings, PersonalFact, Conversation, Message
        from .llm import get_llm_provider
        from .prompts import build_daily_briefing_prompt

        User = get_user_model()
        user = User.objects.get(id=user_id)
        settings, _ = AgentSettings.objects.get_or_create(user=user)

        if not settings.daily_briefing:
            return

        # Gather context
        recent_cards = list(
            Card.objects.filter(
                user=user,
                created_at__gte=timezone.now() - timedelta(days=7),
                is_archived=False,
            )
            .order_by('-created_at')
            .values_list('title', flat=True)[:5]
        )

        goals = list(
            PersonalFact.objects.filter(user=user, category='goal', is_active=True)
            .values_list('fact', flat=True)[:3]
        )

        due_reminders = list(
            Card.objects.filter(
                user=user,
                reminder_at__date=timezone.now().date(),
                reminder_done=False,
            )
            .values_list('title', flat=True)[:5]
        )

        # Generate briefing
        llm = get_llm_provider(settings)
        prompt = build_daily_briefing_prompt(
            aria_name=settings.aria_name,
            recent_cards=recent_cards,
            goals=goals,
            due_reminders=due_reminders,
            language=settings.language_preference,
        )

        response = llm.complete([
            {'role': 'system', 'content': prompt},
            {'role': 'user', 'content': 'Generate my morning briefing.'},
        ])

        briefing_text = response.get('content', '').strip()
        if not briefing_text:
            return

        # Store as a message in the "Daily Briefings" conversation
        conv, _ = Conversation.objects.get_or_create(
            user=user,
            title='Daily Briefings',
        )
        Message.objects.create(
            conversation=conv,
            role='assistant',
            content=f"🌅 **Good morning!**\n\n{briefing_text}",
        )

        logger.info(f"Daily briefing sent for user {user_id}")

    except Exception as e:
        logger.error(f"Daily briefing failed for user {user_id}: {e}")


@shared_task(bind=True)
def reindex_user_vault(self, user_id: int):
    """
    Reindex all cards for a user into ChromaDB.
    Called manually from the ARIA settings page.
    """
    try:
        from django.contrib.auth import get_user_model
        from apps.cards.models import Card
        from .memory import index_card
        from .models import AgentSettings
        from django.utils import timezone

        User = get_user_model()
        user = User.objects.get(id=user_id)

        cards = Card.objects.filter(user=user, is_archived=False)
        total = cards.count()
        indexed = 0

        for card in cards:
            if index_card(card):
                indexed += 1

        # Update last_indexed_at
        settings, _ = AgentSettings.objects.get_or_create(user=user)
        settings.last_indexed_at = timezone.now()
        settings.total_indexed = indexed
        settings.save(update_fields=['last_indexed_at', 'total_indexed'])

        logger.info(f"Reindexed {indexed}/{total} cards for user {user_id}")
        return {'indexed': indexed, 'total': total}

    except Exception as e:
        logger.error(f"reindex_user_vault failed for user {user_id}: {e}")
        raise
