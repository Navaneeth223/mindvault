"""
ARIA Agent URLs
"""
from django.urls import path
from . import views

app_name = 'agent'

urlpatterns = [
    # Main chat endpoint
    path('chat/', views.chat, name='chat'),

    # Conversation management
    path('conversations/', views.conversations_list, name='conversations'),
    path('conversations/<uuid:conversation_id>/', views.conversation_detail, name='conversation_detail'),

    # Memory (personal facts)
    path('memory/', views.memory_facts, name='memory'),
    path('memory/add/', views.add_memory_fact, name='memory_add'),

    # Settings
    path('settings/', views.agent_settings_view, name='settings'),

    # Vault indexing
    path('reindex/', views.reindex_vault, name='reindex'),

    # Status check
    path('status/', views.agent_status, name='status'),
]
