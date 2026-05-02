"""
ARIA Agent Models
─────────────────────────────────────────────────────────────────────────────
Conversation history, personal memory, and per-user agent configuration.
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Conversation(models.Model):
    """A session of messages between user and ARIA."""
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    title      = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title or 'Untitled'} ({self.user.username})"


class Message(models.Model):
    class Role(models.TextChoices):
        USER      = 'user',      'User'
        ASSISTANT = 'assistant', 'Assistant'
        TOOL      = 'tool',      'Tool Result'
        SYSTEM    = 'system',    'System'

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role         = models.CharField(max_length=20, choices=Role.choices)
    content      = models.TextField()
    # Tools ARIA decided to call and their results
    tool_calls   = models.JSONField(default=list, blank=True)
    tool_results = models.JSONField(default=dict, blank=True)
    # Cards ARIA referenced in this response
    cards_cited  = models.ManyToManyField('cards.Card', blank=True)
    tokens_used  = models.IntegerField(default=0)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.role}] {self.content[:60]}"


class PersonalFact(models.Model):
    """
    Things ARIA has learned about the user over time.
    Extracted automatically from conversations or added manually.
    """
    class Category(models.TextChoices):
        GOAL        = 'goal',        'Goal'
        SKILL       = 'skill',       'Skill'
        PREFERENCE  = 'preference',  'Preference'
        CONTEXT     = 'context',     'Context'
        ACHIEVEMENT = 'achievement', 'Achievement'
        HABIT       = 'habit',       'Habit'

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='personal_facts')
    category   = models.CharField(max_length=20, choices=Category.choices, default=Category.CONTEXT)
    fact       = models.TextField()
    source     = models.CharField(max_length=200, blank=True)
    confidence = models.FloatField(default=1.0)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = [['user', 'fact']]

    def __str__(self):
        return f"[{self.category}] {self.fact[:80]}"


class AgentSettings(models.Model):
    """Per-user ARIA configuration — LLM provider, behaviour, persona."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_settings')

    # LLM Provider
    llm_provider = models.CharField(
        max_length=20,
        choices=[
            ('ollama', 'Ollama (Local/Free)'),
            ('openai', 'OpenAI (GPT-4o)'),
            ('claude', 'Claude (Anthropic)'),
            ('gemini', 'Gemini'),
        ],
        default='ollama',
    )
    llm_model  = models.CharField(max_length=100, default='llama3.2')
    api_key    = models.CharField(max_length=500, blank=True)
    ollama_url = models.URLField(default='http://localhost:11434')

    # Behaviour toggles
    auto_tag_cards      = models.BooleanField(default=True)
    auto_summarise      = models.BooleanField(default=True)
    daily_briefing      = models.BooleanField(default=True)
    briefing_time       = models.TimeField(default='09:00')
    proactive_reminders = models.BooleanField(default=True)

    # Memory
    memory_enabled   = models.BooleanField(default=True)
    max_memory_items = models.IntegerField(default=1000)

    # Persona
    aria_name           = models.CharField(max_length=50, default='ARIA')
    language_preference = models.CharField(
        max_length=10, default='en',
        choices=[('en', 'English'), ('ml', 'Malayalam')],
    )

    # Indexing metadata
    last_indexed_at  = models.DateTimeField(null=True, blank=True)
    total_indexed    = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"AgentSettings({self.user.username}, {self.llm_provider}/{self.llm_model})"
