"""
ARIA Agent Initial Migration
"""
import uuid
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cards', '0002_add_music_type'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Conversation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(blank=True, max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='conversations',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-updated_at']},
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('role', models.CharField(
                    choices=[('user', 'User'), ('assistant', 'Assistant'), ('tool', 'Tool Result'), ('system', 'System')],
                    max_length=20,
                )),
                ('content', models.TextField()),
                ('tool_calls', models.JSONField(blank=True, default=list)),
                ('tool_results', models.JSONField(blank=True, default=dict)),
                ('tokens_used', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('conversation', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='messages',
                    to='agent.conversation',
                )),
                ('cards_cited', models.ManyToManyField(blank=True, to='cards.card')),
            ],
            options={'ordering': ['created_at']},
        ),
        migrations.CreateModel(
            name='PersonalFact',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('category', models.CharField(
                    choices=[
                        ('goal', 'Goal'), ('skill', 'Skill'), ('preference', 'Preference'),
                        ('context', 'Context'), ('achievement', 'Achievement'), ('habit', 'Habit'),
                    ],
                    default='context',
                    max_length=20,
                )),
                ('fact', models.TextField()),
                ('source', models.CharField(blank=True, max_length=200)),
                ('confidence', models.FloatField(default=1.0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='personal_facts',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddConstraint(
            model_name='personalfact',
            constraint=models.UniqueConstraint(fields=['user', 'fact'], name='unique_user_fact'),
        ),
        migrations.CreateModel(
            name='AgentSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('llm_provider', models.CharField(
                    choices=[
                        ('ollama', 'Ollama (Local/Free)'), ('openai', 'OpenAI (GPT-4o)'),
                        ('claude', 'Claude (Anthropic)'), ('gemini', 'Gemini'),
                    ],
                    default='ollama',
                    max_length=20,
                )),
                ('llm_model', models.CharField(default='llama3.2', max_length=100)),
                ('api_key', models.CharField(blank=True, max_length=500)),
                ('ollama_url', models.URLField(default='http://localhost:11434')),
                ('auto_tag_cards', models.BooleanField(default=True)),
                ('auto_summarise', models.BooleanField(default=True)),
                ('daily_briefing', models.BooleanField(default=True)),
                ('briefing_time', models.TimeField(default='09:00')),
                ('proactive_reminders', models.BooleanField(default=True)),
                ('memory_enabled', models.BooleanField(default=True)),
                ('max_memory_items', models.IntegerField(default=1000)),
                ('aria_name', models.CharField(default='ARIA', max_length=50)),
                ('language_preference', models.CharField(
                    choices=[('en', 'English'), ('ml', 'Malayalam')],
                    default='en',
                    max_length=10,
                )),
                ('last_indexed_at', models.DateTimeField(blank=True, null=True)),
                ('total_indexed', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='agent_settings',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),
    ]
