"""
MindVault User Model
─────────────────────────────────────────────────────────────────────────────
Extends Django's AbstractUser to add MindVault-specific profile fields.
Using a custom user model from the start avoids painful migrations later.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for MindVault.

    Adds profile fields for personalisation (theme, accent colour, speech language)
    and tracks usage stats (total cards, last active).
    """

    # ── Profile ───────────────────────────────────────────────────────────────
    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
        help_text="Profile picture",
    )
    bio = models.TextField(blank=True, max_length=500)

    # ── Preferences ───────────────────────────────────────────────────────────
    THEME_CHOICES = [
        ("dark", "Dark"),
        ("light", "Light"),
        ("system", "System"),
    ]
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default="dark")

    ACCENT_CHOICES = [
        ("#00f5d4", "Electric Cyan"),
        ("#6366f1", "Indigo"),
        ("#f5a623", "Warm Amber"),
        ("#10b981", "Emerald"),
        ("#ef4444", "Red"),
        ("#8b5cf6", "Violet"),
    ]
    accent_colour = models.CharField(max_length=7, default="#00f5d4")

    VIEW_CHOICES = [
        ("grid", "Grid"),
        ("list", "List"),
        ("timeline", "Timeline"),
    ]
    default_view = models.CharField(max_length=10, choices=VIEW_CHOICES, default="grid")

    # Speech recognition language preference
    SPEECH_LANG_CHOICES = [
        ("en-US", "English"),
        ("ml-IN", "Malayalam"),
    ]
    speech_language = models.CharField(
        max_length=10, choices=SPEECH_LANG_CHOICES, default="en-US"
    )

    # ── Notifications ─────────────────────────────────────────────────────────
    notifications_enabled = models.BooleanField(default=True)

    # ── Timestamps ────────────────────────────────────────────────────────────
    last_active_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email or self.username

    @property
    def display_name(self):
        """Return full name if available, otherwise username."""
        return self.get_full_name() or self.username

    @property
    def card_count(self):
        """Total number of non-archived cards."""
        return self.cards.filter(is_archived=False).count()
