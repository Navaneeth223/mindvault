"""
Collections Views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Collection
from .serializers import CollectionSerializer, CollectionListSerializer


class CollectionViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for collections.

    GET    /api/collections/          → List all user's collections
    POST   /api/collections/          → Create new collection
    GET    /api/collections/{id}/     → Retrieve collection
    PATCH  /api/collections/{id}/     → Update collection
    DELETE /api/collections/{id}/     → Delete collection
    POST   /api/collections/reorder/  → Bulk update sort_order
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CollectionSerializer

    def get_queryset(self):
        """Only return collections owned by the current user."""
        return Collection.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == "list":
            return CollectionListSerializer
        return CollectionSerializer

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """
        POST /api/collections/reorder/
        Body: [{"id": "uuid", "sort_order": 0}, {"id": "uuid", "sort_order": 1}, ...]

        Bulk update sort_order for multiple collections.
        """
        items = request.data
        if not isinstance(items, list):
            return Response(
                {"error": "Expected a list of {id, sort_order} objects."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_count = 0
        for item in items:
            collection_id = item.get("id")
            sort_order = item.get("sort_order")

            if collection_id is None or sort_order is None:
                continue

            try:
                collection = Collection.objects.get(id=collection_id, user=request.user)
                collection.sort_order = sort_order
                collection.save(update_fields=["sort_order"])
                updated_count += 1
            except Collection.DoesNotExist:
                continue

        return Response(
            {"message": f"Updated {updated_count} collections."},
            status=status.HTTP_200_OK,
        )
