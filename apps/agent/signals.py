"""
ARIA Signals
─────────────────────────────────────────────────────────────────────────────
Auto-index cards into ChromaDB when they are saved.
Auto-tag cards with AI when they are created (if enabled).
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


@receiver(post_save, sender='cards.Card')
def card_saved(sender, instance, created, **kwargs):
    """
    When a card is saved, index it into ChromaDB for semantic search.
    Also trigger auto-tagging for new cards.
    """
    # Skip archived cards
    if instance.is_archived:
        return

    try:
        from .tasks import index_card_async, auto_tag_card
        # Index asynchronously (don't block the save)
        index_card_async.delay(str(instance.id))

        # Auto-tag only new cards
        if created:
            auto_tag_card.delay(str(instance.id))
    except Exception:
        # Celery may not be running in dev — fall back to sync indexing
        try:
            from .memory import index_card
            index_card(instance)
        except Exception:
            pass  # Never crash a card save due to indexing failure


@receiver(post_delete, sender='cards.Card')
def card_deleted(sender, instance, **kwargs):
    """Remove card from ChromaDB when it's permanently deleted."""
    try:
        from .memory import remove_card_from_index
        remove_card_from_index(str(instance.id), str(instance.user_id))
    except Exception:
        pass  # Best-effort cleanup
