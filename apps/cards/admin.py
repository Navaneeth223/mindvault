"""
Cards Admin
"""
from django.contrib import admin
from .models import Card


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "type",
        "user",
        "collection",
        "is_favourite",
        "is_archived",
        "created_at",
    ]
    list_filter = ["type", "is_favourite", "is_archived", "created_at"]
    search_fields = ["title", "description", "body", "transcript", "user__username"]
    readonly_fields = ["id", "created_at", "updated_at", "last_viewed_at"]
    
    fieldsets = (
        ("Basic Info", {
            "fields": ("id", "user", "type", "title", "description", "body", "url")
        }),
        ("Files", {
            "fields": ("file", "thumbnail", "favicon_url", "og_image_url")
        }),
        ("Metadata", {
            "fields": ("metadata", "transcript")
        }),
        ("Organization", {
            "fields": ("collection", "tags")
        }),
        ("Flags", {
            "fields": ("is_favourite", "is_archived", "is_pinned")
        }),
        ("Reminders", {
            "fields": ("reminder_at", "reminder_done")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at", "last_viewed_at")
        }),
    )
