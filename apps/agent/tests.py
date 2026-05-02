"""
ARIA Agent Tests
─────────────────────────────────────────────────────────────────────────────
Tests for agent tools, memory, and API endpoints.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from .models import AgentSettings, PersonalFact, Conversation, Message
from .tools import ARIAToolExecutor

User = get_user_model()


class ToolExecutorTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', email='test@test.com', password='testpass123'
        )
        self.executor = ARIAToolExecutor(self.user)

    def test_get_vault_stats_empty(self):
        result = self.executor.tool_get_vault_stats()
        self.assertIn('0 cards', result)

    def test_list_reminders_empty(self):
        result = self.executor.tool_list_reminders()
        self.assertIn('No upcoming reminders', result)

    def test_remember_fact(self):
        result = self.executor.tool_remember_fact(
            fact='User wants to become a developer',
            category='goal'
        )
        self.assertIn('Remembered', result)
        self.assertTrue(
            PersonalFact.objects.filter(user=self.user, category='goal').exists()
        )

    def test_remember_fact_duplicate(self):
        self.executor.tool_remember_fact('User is from Kerala', 'context')
        result = self.executor.tool_remember_fact('User is from Kerala', 'context')
        self.assertIn('Already knew', result)

    def test_create_note(self):
        result = self.executor.tool_create_note(
            title='Test Note',
            body='# Hello\nThis is a test note.',
            tags=['test', 'note']
        )
        self.assertIn('Test Note', result)
        from apps.cards.models import Card
        self.assertTrue(Card.objects.filter(user=self.user, title='Test Note').exists())

    def test_set_reminder_tomorrow(self):
        result = self.executor.tool_set_reminder(
            what='Study Django signals',
            when='tomorrow 9am'
        )
        self.assertIn('Reminder set', result)
        self.assertIn('Study Django signals', result)

    def test_set_reminder_in_hours(self):
        result = self.executor.tool_set_reminder(
            what='Review code',
            when='in 2 hours'
        )
        self.assertIn('Reminder set', result)

    def test_start_timer_returns_magic_string(self):
        result = self.executor.tool_start_timer(minutes=25, label='Django study')
        self.assertTrue(result.startswith('__START_TIMER__'))
        self.assertIn('25', result)

    @patch('apps.agent.tools.httpx.get')
    def test_web_search(self, mock_get):
        mock_response = MagicMock()
        mock_response.text = '''
            <div class="result">
                <a class="result__title">Django Tutorial</a>
                <a class="result__snippet">Learn Django step by step</a>
                <span class="result__url">djangoproject.com</span>
            </div>
        '''
        mock_get.return_value = mock_response
        result = self.executor.tool_web_search(query='Django tutorial')
        # Should not crash even with simplified HTML
        self.assertIsInstance(result, str)


class AgentAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='apiuser', email='api@test.com', password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_get_settings(self):
        response = self.client.get('/api/agent/settings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('llm_provider', response.data)
        self.assertEqual(response.data['llm_provider'], 'ollama')

    def test_update_settings(self):
        response = self.client.patch('/api/agent/settings/', {
            'aria_name': 'NOVA',
            'language_preference': 'ml',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        settings = AgentSettings.objects.get(user=self.user)
        self.assertEqual(settings.aria_name, 'NOVA')
        self.assertEqual(settings.language_preference, 'ml')

    def test_get_memory_empty(self):
        response = self.client.get('/api/agent/memory/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_add_memory_fact(self):
        response = self.client.post('/api/agent/memory/add/', {
            'fact': 'User is learning Django',
            'category': 'skill',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(PersonalFact.objects.filter(user=self.user).exists())

    def test_delete_memory_fact(self):
        fact = PersonalFact.objects.create(
            user=self.user, fact='Test fact', category='context'
        )
        response = self.client.patch('/api/agent/memory/', {
            'id': str(fact.id), 'action': 'delete'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        fact.refresh_from_db()
        self.assertFalse(fact.is_active)

    def test_list_conversations_empty(self):
        response = self.client.get('/api/agent/conversations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_agent_status(self):
        response = self.client.get('/api/agent/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('llm_available', response.data)
        self.assertIn('indexed_cards', response.data)

    @patch('apps.agent.views.run_agent')
    def test_chat_endpoint(self, mock_run_agent):
        mock_run_agent.return_value = {
            'response': 'Hello! How can I help?',
            'tool_calls': [],
            'cards_referenced': [],
            'conversation_id': '00000000-0000-0000-0000-000000000001',
            'actions': [],
        }
        response = self.client.post('/api/agent/chat/', {
            'message': 'Hello ARIA'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['response'], 'Hello! How can I help?')

    def test_chat_empty_message(self):
        response = self.client.post('/api/agent/chat/', {'message': ''})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_isolation(self):
        """User A cannot access User B's conversations."""
        other_user = User.objects.create_user(
            username='other', email='other@test.com', password='pass'
        )
        conv = Conversation.objects.create(user=other_user, title='Private')
        response = self.client.get(f'/api/agent/conversations/{conv.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
