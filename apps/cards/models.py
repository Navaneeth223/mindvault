"""
Cards Model
─────────────────────────────────────────────────────────────────────────────
The Card is the core entity in MindVault — every piece of captured knowledge
is a card with a type (link, youtube, note, voice, etc.).
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from taggit.managers import TaggableManager
from taggit.models import TaggedItemBase, GenericUUIDTaggedItemBase

User = get_user_model()


class UUIDTaggedItem(GenericUUIDTaggedItemBase, TaggedItemBase):
    """Custom through model to support UUID primary keys with taggit."""
    class Meta:
        verbose_name = "Tag"
        verbose_name_plural = "Tags"


class CardType(models.TextChoices):
    """All supported card types."""
    LINK = "link", "Link"
    YOUTUBE = "youtube", "YouTube"
    GITHUB = "github", "GitHub"
    NOTE = "note", "Note"
    IMAGE = "image", "Image"
    PDF = "pdf", "PDF"
    VOICE = "voice", "Voice Note"
    CODE = "code", "Code Snippet"
    REEL = "reel", "Reel / Short"
    CHAT = "chat", "Chat Excerpt"
    FILE = "file", "File"
    MUSIC = "music", "Music"
    VOICE = "voice", "Voice Note"
    CODE = "code", "Code Snippet"
    REEL = "reel", "Reel / Short"
    CHAT = "chat", "Chat Excerpt"
    FILE = "file", "File"


class Card(models.Model):
    """
    A card represents any piece of captured knowledge.

    Fields vary by type:
    - LINK: url, title, description, og_image_url, favicon_url
    - YOUTUBE: url, title, thumbnail, metadata={channel, duration, video_id}
    - GITHUB: url, title, description, metadata={stars, language, topics}
    - NOTE: title, body (markdown)
    - IMAGE: file, thumbnail, description, metadata={ocr_text}
    - PDF: file, thumbnail, title
    - VOICE: file, transcript, metadata={duration, language}
    - CODE: body, metadata={language}
    - REEL: url, title, thumbnail
    - CHAT: body, title
    - FILE: file, title
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="cards",
    )
    type = models.CharField(
        max_length=20,
        choices=CardType.choices,
        default=CardType.LINK,
    )

    # ── Content ───────────────────────────────────────────────────────────────
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    body = models.TextField(
        blank=True,
        help_text="Markdown content for notes, code snippets, chat excerpts",
    )
    url = models.URLField(max_length=2000, blank=True)

    # ── Files ─────────────────────────────────────────────────────────────────
    file = models.FileField(
        upload_to="cards/files/%Y/%m/",
        blank=True,
        null=True,
        help_text="Uploaded file (image, PDF, audio, etc.)",
    )
    thumbnail = models.ImageField(
        upload_to="cards/thumbnails/%Y/%m/",
        blank=True,
        null=True,
        help_text="Auto-generated thumbnail",
    )

    # ── Metadata ──────────────────────────────────────────────────────────────
    favicon_url = models.URLField(max_length=500, blank=True)
    og_image_url = models.URLField(max_length=2000, blank=True)
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Type-specific data: channel, stars, duration, language, etc.",
    )
    transcript = models.TextField(
        blank=True,
        help_text="Speech-to-text output for voice notes",
    )

    # ── Organisation ──────────────────────────────────────────────────────────
    collection = models.ForeignKey(
        "collections.Collection",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cards",
    )
    tags = TaggableManager(through=UUIDTaggedItem, blank=True)

    # ── Flags ─────────────────────────────────────────────────────────────────
    is_favourite = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)

    # ── Reminders ─────────────────────────────────────────────────────────────
    reminder_at = models.DateTimeField(null=True, blank=True)
    reminder_done = models.BooleanField(default=False)

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_viewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "type"]),
            models.Index(fields=["user", "is_favourite"]),
            models.Index(fields=["user", "is_archived"]),
            models.Index(fields=["user", "collection"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["reminder_at"]),
            models.Index(fields=["user", "is_archived", "-created_at"]),
        ]

    def __str__(self):
        return f"[{self.get_type_display()}] {self.title[:60]}"

    @property
    def domain(self):
        """Extract domain from URL (e.g. 'github.com')."""
        if not self.url:
            return None
        try:
            from urllib.parse import urlparse
            return urlparse(self.url).netloc
        except Exception:
            return None
