"""
ARIA Tool Definitions and Executor
─────────────────────────────────────────────────────────────────────────────
Tools are functions ARIA can call to take real actions:
search vault, save cards, set reminders, search web, create notes, etc.

Each tool has:
  - A JSON Schema definition (for LLM function calling)
  - An execute method in ARIAToolExecutor
"""
from __future__ import annotations
import logging
import re
from datetime import timedelta

import httpx
from bs4 import BeautifulSoup
from django.utils import timezone

logger = logging.getLogger(__name__)

# ── Tool Definitions (JSON Schema for LLM function calling) ───────────────────

TOOL_DEFINITIONS = [
    {
        'name': 'search_vault',
        'description': (
            "Search the user's knowledge vault for cards related to a topic. "
            "Use this when the user asks about something they may have saved before, "
            "or when you need to find relevant context from their saved knowledge."
        ),
        'parameters': {
            'type': 'object',
            'properties': {
                'query': {
                    'type': 'string',
                    'description': 'What to search for — use natural language',
                },
                'type': {
                    'type': 'string',
                    'enum': ['link', 'youtube', 'github', 'note', 'image', 'voice', 'code', 'music'],
                    'description': 'Optional: filter by card type',
                },
            },
            'required': ['query'],
        },
    },
    {
        'name': 'save_card',
        'description': (
            "Save something to the user's vault. "
            "Use when user says 'save this', 'remember this', 'add this to my vault'."
        ),
        'parameters': {
            'type': 'object',
            'properties': {
                'type': {
                    'type': 'string',
                    'enum': ['link', 'note', 'code'],
                    'description': 'Type of card to create',
                },
                'title': {'type': 'string', 'description': 'Card title'},
                'content': {
                    'type': 'string',
                    'description': 'URL for links, markdown text for notes, code text for code',
                },
                'tags': {
                    'type': 'array',
                    'items': {'type': 'string'},
                    'description': 'Tags to apply',
                },
                'collection_name': {
                    'type': 'string',
                    'description': 'Name of collection to add to (creates if not exists)',
                },
            },
            'required': ['type', 'title', 'content'],
        },
    },
    {
        'name': 'set_reminder',
        'description': (
            "Set a reminder for the user. "
            "Use when user says 'remind me', 'don't let me forget', 'set a reminder'."
        ),
        'parameters': {
            'type': 'object',
            'properties': {
                'what': {'type': 'string', 'description': 'What to remind about'},
                'when': {
                    'type': 'string',
                    'description': "When — natural language: 'tomorrow 9am', 'in 2 hours', 'next monday'",
                },
            },
            'required': ['what', 'when'],
        },
    },
    {
        'name': 'web_search',
        'description': (
            'Search the web for current information. '
            'Use when user asks about something not in their vault, '
            'or when you need up-to-date information.'
        ),
        'parameters': {
            'type': 'object',
            'properties': {
                'query': {'type': 'string', 'description': 'Search query'},
            },
            'required': ['query'],
        },
    },
    {
        'name': 'summarise_url',
        'description': 'Fetch and summarise a webpage or article.',
        'parameters': {
            'type': 'object',
            'properties': {
                'url': {'type': 'string', 'description': 'URL to fetch and summarise'},
            },
            'required': ['url'],
        },
    },
    {
        'name': 'create_note',
        'description': 'Create a structured markdown note and save it to the vault.',
        'parameters': {
            'type': 'object',
            'properties': {
                'title': {'type': 'string'},
                'body': {'type': 'string', 'description': 'Markdown content'},
                'tags': {
                    'type': 'array',
                    'items': {'type': 'string'},
                },
            },
            'required': ['title', 'body'],
        },
    },
    {
        'name': 'get_vault_stats',
        'description': "Get statistics about the user's vault: total cards, types, recent activity.",
        'parameters': {'type': 'object', 'properties': {}},
    },
    {
        'name': 'list_reminders',
        'description': "List the user's upcoming reminders.",
        'parameters': {'type': 'object', 'properties': {}},
    },
    {
        'name': 'remember_fact',
        'description': (
            'Explicitly remember a personal fact about the user. '
            "Use when user says 'remember that I...', 'my goal is...', 'I am...'."
        ),
        'parameters': {
            'type': 'object',
            'properties': {
                'fact': {'type': 'string', 'description': 'The fact to remember'},
                'category': {
                    'type': 'string',
                    'enum': ['goal', 'skill', 'preference', 'context', 'achievement', 'habit'],
                },
            },
            'required': ['fact', 'category'],
        },
    },
    {
        'name': 'start_timer',
        'description': (
            'Start a focus timer for the user. '
            "Use when user says 'start a timer', 'focus for X minutes', 'pomodoro'."
        ),
        'parameters': {
            'type': 'object',
            'properties': {
                'minutes': {'type': 'integer', 'description': 'Duration in minutes'},
                'label': {'type': 'string', 'description': 'What the user is working on'},
            },
            'required': ['minutes'],
        },
    },
]


# ── Tool Executor ─────────────────────────────────────────────────────────────

class ARIAToolExecutor:
    """
    Executes tool calls on behalf of ARIA.
    Each tool_* method corresponds to a tool in TOOL_DEFINITIONS.
    """

    def __init__(self, user):
        self.user = user

    def execute(self, tool_name: str, arguments: dict) -> str:
        """Dispatch tool call to the correct method."""
        method = getattr(self, f'tool_{tool_name}', None)
        if not method:
            return f"Tool '{tool_name}' not found."
        try:
            return method(**arguments)
        except TypeError as e:
            logger.error(f"Tool {tool_name} argument error: {e}")
            return f"Tool error (bad arguments): {str(e)}"
        except Exception as e:
            logger.error(f"Tool {tool_name} execution error: {e}")
            return f"Tool error: {str(e)}"

    # ── Individual Tools ──────────────────────────────────────────────────────

    def tool_search_vault(self, query: str, type: str = None) -> str:
        """Search the user's vault using semantic similarity."""
        from .memory import semantic_search
        results = semantic_search(
            str(self.user.id), query, n_results=5, filter_type=type
        )
        if not results:
            return (
                f"No relevant cards found in your vault for '{query}'. "
                "Your vault may be empty, or try different keywords."
            )
        lines = [f"Found {len(results)} relevant item(s) in your vault:\n"]
        for r in results:
            meta = r['metadata']
            card_type = meta.get('type', 'card').upper()
            title = meta.get('title', 'Untitled')
            snippet = r['text'][:150].replace('\n', ' ')
            relevance = r['relevance']
            card_id = r['id']
            lines.append(
                f"• [{card_type}] {title} (relevance: {relevance:.0%})\n"
                f"  {snippet}...\n"
                f"  card_id: {card_id}"
            )
        return '\n'.join(lines)

    def tool_save_card(
        self,
        type: str,
        title: str,
        content: str,
        tags: list = None,
        collection_name: str = None,
    ) -> str:
        """Save a new card to the vault."""
        from apps.cards.models import Card
        from apps.collections.models import Collection
        from .memory import index_card

        collection = None
        if collection_name:
            collection, _ = Collection.objects.get_or_create(
                user=self.user,
                name=collection_name,
                defaults={'icon': 'folder', 'colour': '#6366f1'},
            )

        card = Card.objects.create(
            user=self.user,
            type=type,
            title=title,
            body=content if type in ('note', 'code') else '',
            url=content if type == 'link' else '',
            collection=collection,
        )
        if tags:
            card.tags.add(*[t.lower().strip() for t in tags])

        # Index immediately so it's searchable right away
        index_card(card)

        collection_info = f" in '{collection_name}'" if collection_name else ''
        return f"✓ Saved to vault: \"{title}\" (type: {type}{collection_info}, id: {card.id})"

    def tool_set_reminder(self, what: str, when: str) -> str:
        """Set a reminder using natural language time parsing."""
        from apps.cards.models import Card

        dt = self._parse_natural_time(when)

        card = Card.objects.create(
            user=self.user,
            type='note',
            title=f'Reminder: {what}',
            description=what,
            reminder_at=dt,
        )

        formatted = dt.strftime('%A, %d %B %Y at %I:%M %p')
        return f"✓ Reminder set: \"{what}\" — {formatted} (card id: {card.id})"

    def tool_web_search(self, query: str) -> str:
        """Search the web using DuckDuckGo HTML (no API key needed)."""
        try:
            response = httpx.get(
                'https://html.duckduckgo.com/html/',
                params={'q': query},
                headers={
                    'User-Agent': (
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                        'AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
                    )
                },
                timeout=10.0,
                follow_redirects=True,
            )
            soup = BeautifulSoup(response.text, 'html.parser')
            results = []
            for r in soup.select('.result')[:5]:
                title_el = r.select_one('.result__title')
                snippet_el = r.select_one('.result__snippet')
                url_el = r.select_one('.result__url')
                if title_el and snippet_el:
                    title = title_el.get_text(strip=True)
                    snippet = snippet_el.get_text(strip=True)
                    url = url_el.get_text(strip=True) if url_el else ''
                    results.append(f"• **{title}**\n  {snippet}\n  {url}")
            if not results:
                return f"No web results found for '{query}'."
            return f"Web search results for '{query}':\n\n" + '\n\n'.join(results)
        except Exception as e:
            return f"Web search unavailable: {str(e)}"

    def tool_summarise_url(self, url: str) -> str:
        """Fetch and extract main text content from a URL."""
        try:
            response = httpx.get(
                url,
                headers={
                    'User-Agent': (
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                        'AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
                    )
                },
                timeout=15.0,
                follow_redirects=True,
            )
            soup = BeautifulSoup(response.text, 'html.parser')

            # Remove noise
            for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
                tag.decompose()

            # Try to get main content
            main = soup.find('main') or soup.find('article') or soup.find('body')
            text = main.get_text(separator=' ', strip=True) if main else soup.get_text()

            # Truncate to reasonable length
            text = ' '.join(text.split())[:4000]

            return f"Content from {url}:\n\n{text}"
        except Exception as e:
            return f"Could not fetch URL: {str(e)}"

    def tool_create_note(self, title: str, body: str, tags: list = None) -> str:
        """Create a markdown note and save to vault."""
        from apps.cards.models import Card
        from .memory import index_card

        card = Card.objects.create(
            user=self.user,
            type='note',
            title=title,
            body=body,
        )
        if tags:
            card.tags.add(*[t.lower().strip() for t in tags])

        index_card(card)
        return f"✓ Note created: \"{title}\" saved to your vault (id: {card.id})"

    def tool_get_vault_stats(self) -> str:
        """Return vault statistics."""
        from apps.cards.models import Card
        from django.db.models import Count

        total = Card.objects.filter(user=self.user, is_archived=False).count()
        archived = Card.objects.filter(user=self.user, is_archived=True).count()
        favourites = Card.objects.filter(user=self.user, is_favourite=True).count()

        by_type = (
            Card.objects.filter(user=self.user, is_archived=False)
            .values('type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        recent = (
            Card.objects.filter(user=self.user, is_archived=False)
            .order_by('-created_at')[:5]
        )

        lines = [
            f"**Your MindVault** — {total} cards total",
            f"  ⭐ {favourites} favourites · 📦 {archived} archived\n",
            "**By type:**",
        ]
        for t in by_type:
            lines.append(f"  {t['type']}: {t['count']}")

        lines.append("\n**Recently added:**")
        for c in recent:
            lines.append(f"  • [{c.type}] {c.title}")

        return '\n'.join(lines)

    def tool_list_reminders(self) -> str:
        """List upcoming reminders."""
        from apps.cards.models import Card

        reminders = (
            Card.objects.filter(
                user=self.user,
                reminder_at__gte=timezone.now(),
                reminder_done=False,
            )
            .order_by('reminder_at')[:8]
        )

        if not reminders:
            return "No upcoming reminders. You're all clear! 🎉"

        lines = [f"**Upcoming reminders** ({reminders.count()}):\n"]
        for r in reminders:
            formatted = r.reminder_at.strftime('%a %d %b, %I:%M %p')
            lines.append(f"• {r.title} — {formatted}")
        return '\n'.join(lines)

    def tool_remember_fact(self, fact: str, category: str) -> str:
        """Explicitly save a personal fact about the user."""
        from .models import PersonalFact

        _, created = PersonalFact.objects.get_or_create(
            user=self.user,
            fact=fact,
            defaults={
                'category': category,
                'source': 'User stated explicitly',
                'confidence': 1.0,
            },
        )
        if created:
            return f"✓ Remembered: \"{fact}\" (category: {category})"
        return f"Already knew: \"{fact}\""

    def tool_start_timer(self, minutes: int, label: str = 'Focus session') -> str:
        """
        Start a focus timer.
        Returns a magic string that the agent loop detects and converts
        into a frontend action (starts the timer UI).
        """
        # This magic string is parsed by agent.py to create a frontend action
        return f"__START_TIMER__{minutes}__{label}__"

    # ── Private helpers ───────────────────────────────────────────────────────

    def _parse_natural_time(self, when: str) -> object:
        """Parse natural language time expressions into a datetime."""
        now = timezone.now()
        when_lower = when.lower().strip()

        # "in X hours/minutes"
        in_match = re.search(r'in\s+(\d+)\s+(hour|minute|min|hr)', when_lower)
        if in_match:
            amount = int(in_match.group(1))
            unit = in_match.group(2)
            if 'hour' in unit or 'hr' in unit:
                return now + timedelta(hours=amount)
            else:
                return now + timedelta(minutes=amount)

        # "tomorrow [at] Xam/pm"
        if 'tomorrow' in when_lower:
            dt = now + timedelta(days=1)
            time_match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)', when_lower)
            if time_match:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2) or 0)
                if time_match.group(3) == 'pm' and hour < 12:
                    hour += 12
                elif time_match.group(3) == 'am' and hour == 12:
                    hour = 0
                return dt.replace(hour=hour, minute=minute, second=0, microsecond=0)
            return dt.replace(hour=9, minute=0, second=0, microsecond=0)

        # "next week / next monday"
        if 'next week' in when_lower:
            return (now + timedelta(weeks=1)).replace(hour=9, minute=0, second=0, microsecond=0)
        if 'next monday' in when_lower:
            days_ahead = 7 - now.weekday()
            return (now + timedelta(days=days_ahead)).replace(hour=9, minute=0, second=0, microsecond=0)

        # "today at X"
        if 'today' in when_lower:
            time_match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)', when_lower)
            if time_match:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2) or 0)
                if time_match.group(3) == 'pm' and hour < 12:
                    hour += 12
                return now.replace(hour=hour, minute=minute, second=0, microsecond=0)

        # Try dateutil as fallback
        try:
            from dateutil import parser as dateparser
            dt = dateparser.parse(when, fuzzy=True)
            if dt:
                # Make timezone-aware if needed
                if dt.tzinfo is None:
                    from django.utils.timezone import make_aware
                    dt = make_aware(dt)
                return dt
        except Exception:
            pass

        # Default: tomorrow 9am
        return (now + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
