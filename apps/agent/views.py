"""
ARIA Agent API Views
─────────────────────────────────────────────────────────────────────────────
Endpoints:
  POST /api/agent/chat/                  — main chat
  GET  /api/agent/conversations/         — list conversations
  GET  /api/agent/conversations/{id}/    — get messages
  DELETE /api/agent/conversations/{id}/  — delete conversation
  GET|PATCH /api/agent/memory/           — personal facts
  GET|PATCH /api/agent/settings/         — agent settings
  POST /api/agent/reindex/               — reindex vault
  GET  /api/agent/status/                — LLM connection status
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .agent import run_agent
from .models import Conversation, Message, PersonalFact, AgentSettings
from .memory import get_personal_facts, get_collection_count


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    """
    POST /api/agent/chat/
    Body: {message: str, conversation_id?: str}

    Main ARIA chat endpoint. Runs the agent and returns the response.
    """
    message = request.data.get('message', '').strip()
    conversation_id = request.data.get('conversation_id')

    if not message:
        return Response({'error': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if len(message) > 4000:
        return Response({'error': 'Message too long (max 4000 characters).'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = run_agent(request.user, message, conversation_id)
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Agent error: {e}", exc_info=True)
        return Response(
            {
                'error': str(e),
                'response': 'I encountered an unexpected error. Please try again.',
                'tool_calls': [],
                'cards_referenced': [],
                'conversation_id': conversation_id or '',
                'actions': [],
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversations_list(request):
    """
    GET /api/agent/conversations/
    Returns the user's 20 most recent conversations.
    """
    convs = Conversation.objects.filter(user=request.user)[:20]
    return Response([
        {
            'id': str(c.id),
            'title': c.title or 'New conversation',
            'created_at': c.created_at,
            'updated_at': c.updated_at,
            'message_count': c.messages.count(),
        }
        for c in convs
    ])


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def conversation_detail(request, conversation_id):
    """
    GET    /api/agent/conversations/{id}/ — get messages
    DELETE /api/agent/conversations/{id}/ — delete conversation
    """
    try:
        conv = Conversation.objects.get(id=conversation_id, user=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        conv.delete()
        return Response({'status': 'deleted'})

    msgs = conv.messages.order_by('created_at')
    return Response({
        'id': str(conv.id),
        'title': conv.title or 'New conversation',
        'messages': [
            {
                'id': str(m.id),
                'role': m.role,
                'content': m.content,
                'tool_calls': m.tool_calls,
                'created_at': m.created_at,
                'cards_cited': [str(c.id) for c in m.cards_cited.all()],
            }
            for m in msgs
        ],
    })


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def memory_facts(request):
    """
    GET   /api/agent/memory/ — list personal facts
    PATCH /api/agent/memory/ — update or delete a fact
    """
    if request.method == 'GET':
        facts = PersonalFact.objects.filter(user=request.user, is_active=True)
        return Response([
            {
                'id': str(f.id),
                'category': f.category,
                'fact': f.fact,
                'confidence': f.confidence,
                'source': f.source,
                'created_at': f.created_at,
            }
            for f in facts
        ])

    # PATCH: edit or delete a fact
    fact_id = request.data.get('id')
    action = request.data.get('action')

    if not fact_id:
        return Response({'error': 'id required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        fact = PersonalFact.objects.get(id=fact_id, user=request.user)
    except PersonalFact.DoesNotExist:
        return Response({'error': 'Fact not found.'}, status=status.HTTP_404_NOT_FOUND)

    if action == 'delete':
        fact.is_active = False
        fact.save(update_fields=['is_active'])
    elif action == 'edit':
        new_text = request.data.get('fact', '').strip()
        if new_text:
            fact.fact = new_text
            fact.save(update_fields=['fact', 'updated_at'])
    else:
        return Response({'error': "action must be 'edit' or 'delete'"}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'status': 'ok'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_memory_fact(request):
    """
    POST /api/agent/memory/add/
    Body: {fact: str, category: str}
    Manually add a personal fact.
    """
    fact_text = request.data.get('fact', '').strip()
    category = request.data.get('category', 'context')

    if not fact_text:
        return Response({'error': 'fact is required'}, status=status.HTTP_400_BAD_REQUEST)

    fact, created = PersonalFact.objects.get_or_create(
        user=request.user,
        fact=fact_text,
        defaults={
            'category': category,
            'source': 'Added manually',
            'confidence': 1.0,
        },
    )

    return Response({
        'id': str(fact.id),
        'category': fact.category,
        'fact': fact.fact,
        'created': created,
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def agent_settings_view(request):
    """
    GET   /api/agent/settings/ — get settings
    PATCH /api/agent/settings/ — update settings
    """
    settings, _ = AgentSettings.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response({
            'llm_provider': settings.llm_provider,
            'llm_model': settings.llm_model,
            'ollama_url': settings.ollama_url,
            'has_api_key': bool(settings.api_key),
            'auto_tag_cards': settings.auto_tag_cards,
            'auto_summarise': settings.auto_summarise,
            'daily_briefing': settings.daily_briefing,
            'briefing_time': settings.briefing_time,
            'proactive_reminders': settings.proactive_reminders,
            'memory_enabled': settings.memory_enabled,
            'aria_name': settings.aria_name,
            'language_preference': settings.language_preference,
            'last_indexed_at': settings.last_indexed_at,
            'total_indexed': settings.total_indexed,
        })

    # PATCH: update settings
    updatable = [
        'llm_provider', 'llm_model', 'ollama_url', 'aria_name',
        'language_preference', 'auto_tag_cards', 'auto_summarise',
        'daily_briefing', 'proactive_reminders', 'memory_enabled',
    ]
    for field in updatable:
        if field in request.data:
            setattr(settings, field, request.data[field])

    # API key: only update if provided (don't clear it)
    if request.data.get('api_key'):
        settings.api_key = request.data['api_key']

    settings.save()
    return Response({'status': 'saved'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reindex_vault(request):
    """
    POST /api/agent/reindex/
    Reindex all user's cards into ChromaDB.
    Runs as a background Celery task.
    """
    from .tasks import reindex_user_vault
    task = reindex_user_vault.delay(request.user.id)
    return Response({
        'status': 'started',
        'task_id': task.id,
        'message': 'Reindexing started in background. This may take a minute.',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def agent_status(request):
    """
    GET /api/agent/status/
    Check LLM connection status and vault index stats.
    """
    settings, _ = AgentSettings.objects.get_or_create(user=request.user)

    # Test LLM connection
    try:
        from .llm import get_llm_provider
        llm = get_llm_provider(settings)
        is_available, status_msg = llm.is_available()
    except Exception as e:
        is_available = False
        status_msg = str(e)

    # Vault index stats
    indexed_count = get_collection_count(str(request.user.id))
    total_cards = request.user.cards.filter(is_archived=False).count()
    facts_count = PersonalFact.objects.filter(user=request.user, is_active=True).count()

    return Response({
        'llm_available': is_available,
        'llm_status': status_msg,
        'llm_provider': settings.llm_provider,
        'llm_model': settings.llm_model,
        'indexed_cards': indexed_count,
        'total_cards': total_cards,
        'facts_count': facts_count,
        'memory_enabled': settings.memory_enabled,
    })
