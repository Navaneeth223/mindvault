"""
Cards Filters
─────────────────────────────────────────────────────────────────────────────
Advanced filtering for cards using django-filter.
Supports filtering by type, collection, tags, dates, favourites, etc.
"""
import django_filters
from .models import Card


class CardFilter(django_filters.FilterSet):
    """
    Filter cards by multiple criteria.
    
    Example queries:
    - /api/cards/?type=youtube
    - /api/cards/?is_favourite=true
    - /api/cards/?collection=uuid
    - /api/cards/?tags=django,python
    - /api/cards/?created_after=2024-01-01
    - /api/cards/?has_reminder=true
    """
    
    # Type filtering (exact or multiple)
    type = django_filters.MultipleChoiceFilter(
        choices=Card._meta.get_field("type").choices,
        help_text="Filter by card type (can specify multiple)",
    )
    
    # Boolean filters
    is_favourite = django_filters.BooleanFilter()
    is_archived = django_filters.BooleanFilter()
    is_pinned = django_filters.BooleanFilter()
    
    # Collection
    collection = django_filters.UUIDFilter(field_name="collection__id")
    
    # Tags (any of the specified tags)
    tags = django_filters.CharFilter(method="filter_tags")
    
    # Date range filters
    created_after = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="gte",
    )
    created_before = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="lte",
    )
    
    # Reminder filters
    has_reminder = django_filters.BooleanFilter(method="filter_has_reminder")
    reminder_upcoming = django_filters.BooleanFilter(method="filter_reminder_upcoming")
    
    # Search in title and description
    search = django_filters.CharFilter(method="filter_search")

    class Meta:
        model = Card
        fields = [
            "type",
            "is_favourite",
            "is_archived",
            "is_pinned",
            "collection",
            "tags",
            "created_after",
            "created_before",
            "has_reminder",
            "reminder_upcoming",
            "search",
        ]

    def filter_tags(self, queryset, name, value):
        """
        Filter by tags (comma-separated).
        Returns cards that have ANY of the specified tags.
        """
        if not value:
            return queryset
        
        tag_list = [tag.strip() for tag in value.split(",")]
        return queryset.filter(tags__name__in=tag_list).distinct()

    def filter_has_reminder(self, queryset, name, value):
        """Filter cards that have a reminder set."""
        if value:
            return queryset.filter(reminder_at__isnull=False)
        else:
            return queryset.filter(reminder_at__isnull=True)

    def filter_reminder_upcoming(self, queryset, name, value):
        """Filter cards with upcoming (not done) reminders."""
        from django.utils import timezone
        if value:
            return queryset.filter(
                reminder_at__isnull=False,
                reminder_done=False,
                reminder_at__gte=timezone.now(),
            )
        return queryset

    def filter_search(self, queryset, name, value):
        """
        Simple search in title, description, and transcript.
        For full-text search, use the dedicated search endpoint.
        """
        if not value:
            return queryset
        
        from django.db.models import Q
        return queryset.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(body__icontains=value) |
            Q(transcript__icontains=value)
        )
