"""ARIA Agent Serializers"""
from rest_framework import serializers
from .models import Conversation, Message, PersonalFact, AgentSettings


class MessageSerializer(serializers.ModelSerializer):
    cards_cited = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'tool_calls', 'created_at', 'cards_cited']

    def get_cards_cited(self, obj):
        return [str(c.id) for c in obj.cards_cited.all()]


class ConversationSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'created_at', 'updated_at', 'message_count']

    def get_message_count(self, obj):
        return obj.messages.count()


class PersonalFactSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalFact
        fields = ['id', 'category', 'fact', 'confidence', 'source', 'created_at']


class AgentSettingsSerializer(serializers.ModelSerializer):
    has_api_key = serializers.SerializerMethodField()

    class Meta:
        model = AgentSettings
        fields = [
            'llm_provider', 'llm_model', 'ollama_url', 'has_api_key',
            'auto_tag_cards', 'auto_summarise', 'daily_briefing',
            'proactive_reminders', 'memory_enabled', 'aria_name',
            'language_preference', 'last_indexed_at', 'total_indexed',
        ]

    def get_has_api_key(self, obj):
        return bool(obj.api_key)
