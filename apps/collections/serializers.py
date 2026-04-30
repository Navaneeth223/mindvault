"""
Collections Serializers
"""
from rest_framework import serializers
from .models import Collection


class CollectionSerializer(serializers.ModelSerializer):
    """
    Full collection serializer with computed card_count.
    """
    card_count = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = [
            "id",
            "name",
            "description",
            "icon",
            "colour",
            "is_smart",
            "smart_filter",
            "sort_order",
            "card_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_card_count(self, obj):
        """Return number of non-archived cards in this collection."""
        if obj.is_smart:
            # For smart collections, we'd need to apply the filter
            # For now, return 0 (frontend can fetch separately if needed)
            return 0
        return obj.cards.filter(is_archived=False).count()

    def validate_name(self, value):
        """Ensure collection name is unique for this user."""
        user = self.context["request"].user
        qs = Collection.objects.filter(user=user, name__iexact=value)

        # Exclude current instance when updating
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "You already have a collection with this name."
            )
        return value

    def create(self, validated_data):
        """Automatically assign the current user."""
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class CollectionListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing collections in sidebar.
    """
    card_count = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = ["id", "name", "icon", "colour", "is_smart", "card_count", "sort_order"]

    def get_card_count(self, obj):
        if obj.is_smart:
            return 0
        return obj.cards.filter(is_archived=False).count()
