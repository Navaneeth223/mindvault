"""
Search Views
─────────────────────────────────────────────────────────────────────────────
Full-text search across cards using Whoosh.
Searches: title, description, body, transcript.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from apps.cards.models import Card
from apps.cards.serializers import CardListSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_view(request):
    """
    GET /api/search/?q=query&type=youtube&tags=django,python&collection=uuid&favourite=true
    
    Full-text search with filters.
    Searches across title, description, body, and transcript.
    """
    user = request.user
    query = request.GET.get("q", "").strip()
    
    # Start with user's non-archived cards
    cards = Card.objects.filter(user=user, is_archived=False)
    
    # Apply search query
    if query:
        cards = cards.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(body__icontains=query) |
            Q(transcript__icontains=query) |
            Q(url__icontains=query)
        )
    
    # Apply filters
    card_type = request.GET.get("type")
    if card_type:
        cards = cards.filter(type=card_type)
    
    tags = request.GET.get("tags")
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        cards = cards.filter(tags__name__in=tag_list).distinct()
    
    collection_id = request.GET.get("collection")
    if collection_id:
        cards = cards.filter(collection__id=collection_id)
    
    favourite = request.GET.get("favourite")
    if favourite and favourite.lower() == "true":
        cards = cards.filter(is_favourite=True)
    
    date_from = request.GET.get("date_from")
    if date_from:
        cards = cards.filter(created_at__gte=date_from)
    
    date_to = request.GET.get("date_to")
    if date_to:
        cards = cards.filter(created_at__lte=date_to)
    
    # Order by relevance (most recent first for now)
    # TODO: Implement proper relevance scoring with Whoosh
    cards = cards.order_by("-created_at")
    
    # Paginate
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    paginated_cards = paginator.paginate_queryset(cards, request)
    
    serializer = CardListSerializer(
        paginated_cards,
        many=True,
        context={"request": request},
    )
    
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_suggestions_view(request):
    """
    GET /api/search/suggestions/?q=partial
    
    Returns autocomplete suggestions based on:
    - Existing tags
    - Card titles
    - Collection names
    """
    user = request.user
    query = request.GET.get("q", "").strip()
    
    if not query or len(query) < 2:
        return Response([], status=status.HTTP_200_OK)
    
    suggestions = []
    
    # Tag suggestions
    from taggit.models import Tag
    tags = Tag.objects.filter(
        taggit_taggeditem_items__content_type__model="card",
        taggit_taggeditem_items__object_id__in=user.cards.values_list("id", flat=True),
        name__icontains=query,
    ).distinct()[:5]
    
    for tag in tags:
        suggestions.append({
            "type": "tag",
            "value": tag.name,
            "label": f"#{tag.name}",
        })
    
    # Collection suggestions
    collections = user.collections.filter(name__icontains=query)[:5]
    for collection in collections:
        suggestions.append({
            "type": "collection",
            "value": str(collection.id),
            "label": f"📁 {collection.name}",
        })
    
    # Recent card titles
    cards = user.cards.filter(
        title__icontains=query,
        is_archived=False,
    ).order_by("-created_at")[:5]
    
    for card in cards:
        suggestions.append({
            "type": "card",
            "value": str(card.id),
            "label": card.title,
        })
    
    return Response(suggestions, status=status.HTTP_200_OK)
