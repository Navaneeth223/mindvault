"""
Collections Model
─────────────────────────────────────────────────────────────────────────────
Collections are user-defined folders/groups for organising cards.
Smart collections use saved filters to auto-populate (e.g. "Unwatched Videos").
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Collection(models.Model):
    """
    A collection groups related cards together.

    Regular collections: manually assigned cards.
    Smart collections: dynamically populated based on saved filters.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="collections",
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    # Visual customisation
    icon = models.CharField(
        max_length=50,
        blank=True,
        default="folder",
        help_text="Lucide icon name (e.g. 'folder', 'book', 'code')",
    )
    colour = models.CharField(
        max_length=7,
        blank=True,
        default="#6366f1",
        help_text="Hex colour code",
    )

    # Smart collections
    is_smart = models.BooleanField(
        default=False,
        help_text="If True, cards are auto-populated based on smart_filter",
    )
    smart_filter = models.JSONField(
        default=dict,
        blank=True,
        help_text="Saved filter config: {type: 'youtube', is_favourite: true, ...}",
    )

    # Ordering
    sort_order = models.IntegerField(
        default=0,
        help_text="Lower numbers appear first in sidebar",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]
        unique_together = [["user", "name"]]
        indexes = [
            models.Index(fields=["user", "sort_order"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    @property
    def card_count(self):
        """Number of cards in this collection (excluding archived)."""
        if self.is_smart:
            # Smart collections: apply saved filter
            # This is a simplified implementation — full filtering happens in views
            return 0  # Computed dynamically in serializer
        else:
            return self.cards.filter(is_archived=False).count()
