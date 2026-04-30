"""
Accounts Admin
─────────────────────────────────────────────────────────────────────────────
Registers the custom User model in Django admin with enhanced display.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced admin for custom User model."""

    list_display = [
        "username",
        "email",
        "display_name",
        "theme",
        "card_count",
        "is_staff",
        "date_joined",
    ]
    list_filter = ["is_staff", "is_superuser", "is_active", "theme", "date_joined"]
    search_fields = ["username", "email", "first_name", "last_name"]

    # Add custom fields to the admin form
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "MindVault Profile",
            {
                "fields": (
                    "avatar",
                    "bio",
                    "theme",
                    "accent_colour",
                    "default_view",
                    "speech_language",
                    "notifications_enabled",
                    "last_active_at",
                )
            },
        ),
    )

    readonly_fields = ["last_active_at", "date_joined"]
