"""
Tags Views
─────────────────────────────────────────────────────────────────────────────
List all tags used by the current user with counts.
Delete a tag from all cards.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from taggit.models import Tag
from django.db.models import Count


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tags_list_view(request):
    """
    GET /api/tags/
    
    Returns all tags used by the current user with usage counts.
    Sorted by usage count (descending).
    """
    user = request.user
    
    # Get all tags used in user's cards
    tags = Tag.objects.filter(
        taggit_taggeditem_items__content_type__model="card",
        taggit_taggeditem_items__object_id__in=user.cards.values_list("id", flat=True),
    ).annotate(
        count=Count("taggit_taggeditem_items")
    ).order_by("-count")
    
    data = [
        {
            "name": tag.name,
            "slug": tag.slug,
            "count": tag.count,
        }
        for tag in tags
    ]
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def tag_delete_view(request, slug):
    """
    DELETE /api/tags/{slug}/
    
    Removes the tag from all of the user's cards.
    Does not delete the tag globally (other users may still use it).
    """
    user = request.user
    
    try:
        tag = Tag.objects.get(slug=slug)
    except Tag.DoesNotExist:
        return Response(
            {"error": "Tag not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    
    # Remove tag from all user's cards
    user_cards = user.cards.filter(tags=tag)
    for card in user_cards:
        card.tags.remove(tag)
    
    count = user_cards.count()
    
    return Response(
        {"message": f"Tag '{tag.name}' removed from {count} cards."},
        status=status.HTTP_200_OK,
    )
