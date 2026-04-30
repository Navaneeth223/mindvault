from django.contrib import admin
from .models import Collection


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "icon", "colour", "is_smart", "card_count", "sort_order", "created_at"]
    list_filter = ["is_smart", "created_at"]
    search_fields = ["name", "user__username", "user__email"]
    ordering = ["user", "sort_order", "name"]
