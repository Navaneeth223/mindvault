"""
Cards Views
─────────────────────────────────────────────────────────────────────────────
CRUD operations for cards with additional actions:
- favourite, archive, pin, view tracking
- random card discovery
- bulk operations
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
import random

from .models import Card
from .serializers import CardSerializer, CardListSerializer, CardCreateSerializer
from .filters import CardFilter


class CardViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for cards with filtering, search, and ordering.
    
    GET    /api/cards/              → List cards (paginated, filtered)
    POST   /api/cards/              → Create card
    GET    /api/cards/{id}/         → Retrieve card
    PATCH  /api/cards/{id}/         → Update card
    DELETE /api/cards/{id}/         → Soft delete (archive)
    DELETE /api/cards/{id}/destroy/ → Hard delete
    POST   /api/cards/{id}/favourite/ → Toggle favourite
    POST   /api/cards/{id}/archive/   → Toggle archive
    POST   /api/cards/{id}/pin/       → Toggle pin
    POST   /api/cards/{id}/view/      → Update last_viewed_at
    GET    /api/cards/random/         → Random undiscovered card
    """
    permission_classes = [IsAuthenticated]
    filterset_class = CardFilter
    search_fields = ["title", "description", "body", "transcript"]
    ordering_fields = ["created_at", "updated_at", "last_viewed_at", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Only return cards owned by the current user."""
        return Card.objects.filter(user=self.request.user).select_related(
            "collection"
        ).prefetch_related("tags")

    def get_serializer_class(self):
        """Use appropriate serializer based on action."""
        if self.action == "list":
            return CardListSerializer
        elif self.action == "create":
            return CardCreateSerializer
        return CardSerializer

    def perform_destroy(self, instance):
        """
        Default DELETE soft-deletes (archives) the card.
        Use /destroy/ action for hard delete.
        """
        instance.is_archived = True
        instance.save(update_fields=["is_archived"])

    @action(detail=True, methods=["delete"])
    def destroy_permanent(self, request, pk=None):
        """
        DELETE /api/cards/{id}/destroy/
        Permanently delete a card (cannot be undone).
        """
        card = self.get_object()
        card.delete()
        return Response(
            {"message": "Card permanently deleted."},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=True, methods=["post"])
    def favourite(self, request, pk=None):
        """
        POST /api/cards/{id}/favourite/
        Toggle favourite status.
        """
        card = self.get_object()
        card.is_favourite = not card.is_favourite
        card.save(update_fields=["is_favourite"])
        
        return Response(
            {
                "message": "Favourite toggled.",
                "is_favourite": card.is_favourite,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        """
        POST /api/cards/{id}/archive/
        Toggle archive status.
        """
        card = self.get_object()
        card.is_archived = not card.is_archived
        card.save(update_fields=["is_archived"])
        
        return Response(
            {
                "message": "Archive toggled.",
                "is_archived": card.is_archived,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def pin(self, request, pk=None):
        """
        POST /api/cards/{id}/pin/
        Toggle pin status.
        """
        card = self.get_object()
        card.is_pinned = not card.is_pinned
        card.save(update_fields=["is_pinned"])
        
        return Response(
            {
                "message": "Pin toggled.",
                "is_pinned": card.is_pinned,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def view(self, request, pk=None):
        """
        POST /api/cards/{id}/view/
        Update last_viewed_at timestamp.
        """
        card = self.get_object()
        card.last_viewed_at = timezone.now()
        card.save(update_fields=["last_viewed_at"])
        
        return Response(
            {"message": "View recorded."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def random(self, request):
        """
        GET /api/cards/random/
        Returns a random card that hasn't been viewed in 30+ days.
        Great for rediscovering old content.
        """
        from datetime import timedelta
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Cards not viewed recently (or never viewed)
        candidates = self.get_queryset().filter(
            Q(last_viewed_at__lt=thirty_days_ago) | Q(last_viewed_at__isnull=True),
            is_archived=False,
        )
        
        count = candidates.count()
        if count == 0:
            return Response(
                {"message": "No undiscovered cards found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Pick a random card
        random_index = random.randint(0, count - 1)
        card = candidates[random_index]
        
        serializer = self.get_serializer(card)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def bulk_delete(self, request):
        """
        POST /api/cards/bulk_delete/
        Body: {"ids": ["uuid1", "uuid2", ...], "permanent": false}
        
        Soft delete (archive) or permanently delete multiple cards.
        """
        ids = request.data.get("ids", [])
        permanent = request.data.get("permanent", False)
        
        if not ids:
            return Response(
                {"error": "No card IDs provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        cards = self.get_queryset().filter(id__in=ids)
        count = cards.count()
        
        if permanent:
            cards.delete()
            message = f"Permanently deleted {count} cards."
        else:
            cards.update(is_archived=True)
            message = f"Archived {count} cards."
        
        return Response(
            {"message": message, "count": count},
            status=status.HTTP_200_OK,
        )
