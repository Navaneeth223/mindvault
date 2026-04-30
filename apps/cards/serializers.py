"""
Cards Serializers
─────────────────────────────────────────────────────────────────────────────
Handles serialization of Card model with nested relationships and computed fields.
"""
from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from .models import Card
from apps.collections.serializers import CollectionListSerializer
from django.utils import timezone


class CardSerializer(TaggitSerializer, serializers.ModelSerializer):
    """
    Full card serializer with all fields and nested relationships.
    """
    tags = TagListSerializerField(required=False)
    collection_detail = CollectionListSerializer(source="collection", read_only=True)
    
    # Computed fields
    card_type_display = serializers.CharField(source="get_type_display", read_only=True)
    domain = serializers.ReadOnlyField()
    time_since_created = serializers.SerializerMethodField()
    
    # Absolute URLs for files
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Card
        fields = [
            "id",
            "type",
            "card_type_display",
            "title",
            "description",
            "body",
            "url",
            "domain",
            "file",
            "file_url",
            "thumbnail",
            "thumbnail_url",
            "favicon_url",
            "og_image_url",
            "metadata",
            "transcript",
            "collection",
            "collection_detail",
            "tags",
            "is_favourite",
            "is_archived",
            "is_pinned",
            "reminder_at",
            "reminder_done",
            "created_at",
            "updated_at",
            "last_viewed_at",
            "time_since_created",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "domain"]
        extra_kwargs = {
            "file": {"write_only": True},
            "thumbnail": {"write_only": True},
        }

    def get_file_url(self, obj):
        """Return absolute URL for uploaded file."""
        if obj.file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None

    def get_thumbnail_url(self, obj):
        """Return absolute URL for thumbnail."""
        if obj.thumbnail:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
        elif obj.og_image_url:
            # Fallback to OG image for links
            return obj.og_image_url
        return None

    def get_time_since_created(self, obj):
        """Human-readable time since creation (e.g. '3 days ago')."""
        from django.utils.timesince import timesince
        return timesince(obj.created_at, timezone.now())

    def create(self, validated_data):
        """Automatically assign the current user."""
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class CardListSerializer(TaggitSerializer, serializers.ModelSerializer):
    """
    Lightweight serializer for card lists (grid/list views).
    Excludes heavy fields like body and transcript.
    """
    tags = TagListSerializerField(required=False)
    card_type_display = serializers.CharField(source="get_type_display", read_only=True)
    domain = serializers.ReadOnlyField()
    thumbnail_url = serializers.SerializerMethodField()
    collection_name = serializers.CharField(source="collection.name", read_only=True)
    collection_colour = serializers.CharField(source="collection.colour", read_only=True)

    class Meta:
        model = Card
        fields = [
            "id",
            "type",
            "card_type_display",
            "title",
            "description",
            "url",
            "domain",
            "thumbnail_url",
            "favicon_url",
            "metadata",
            "collection",
            "collection_name",
            "collection_colour",
            "tags",
            "is_favourite",
            "is_archived",
            "is_pinned",
            "reminder_at",
            "created_at",
        ]

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
        elif obj.og_image_url:
            return obj.og_image_url
        return None


class CardCreateSerializer(TaggitSerializer, serializers.ModelSerializer):
    """
    Serializer for creating cards with minimal required fields.
    Used by quick capture modal.
    """
    tags = TagListSerializerField(required=False)

    class Meta:
        model = Card
        fields = [
            "type",
            "title",
            "description",
            "body",
            "url",
            "file",
            "collection",
            "tags",
            "is_favourite",
            "reminder_at",
        ]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
