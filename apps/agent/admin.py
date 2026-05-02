from django.contrib import admin
from .models import Conversation, Message, PersonalFact, AgentSettings


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'message_count', 'created_at', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['title', 'user__username']
    readonly_fields = ['id', 'created_at', 'updated_at']

    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = 'Messages'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['role', 'content_preview', 'conversation', 'tokens_used', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['content', 'conversation__user__username']
    readonly_fields = ['id', 'created_at']

    def content_preview(self, obj):
        return obj.content[:80]
    content_preview.short_description = 'Content'


@admin.register(PersonalFact)
class PersonalFactAdmin(admin.ModelAdmin):
    list_display = ['fact_preview', 'category', 'user', 'confidence', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['fact', 'user__username']
    readonly_fields = ['id', 'created_at', 'updated_at']

    def fact_preview(self, obj):
        return obj.fact[:80]
    fact_preview.short_description = 'Fact'


@admin.register(AgentSettings)
class AgentSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'llm_provider', 'llm_model', 'aria_name', 'memory_enabled', 'total_indexed']
    list_filter = ['llm_provider', 'memory_enabled']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at', 'last_indexed_at']
    exclude = ['api_key']  # Never show API keys in admin
