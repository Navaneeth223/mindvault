"""
Reminders Tasks
─────────────────────────────────────────────────────────────────────────────
Periodic task to check for due reminders and send notifications.
"""
from celery import shared_task
from django.utils import timezone
from apps.cards.models import Card


@shared_task
def check_reminders():
    """
    Runs every minute via Celery Beat.
    Finds cards with reminders that are due and sends notifications.
    """
    now = timezone.now()
    
    # Find cards with reminders due in the last minute
    one_minute_ago = now - timezone.timedelta(minutes=1)
    
    due_cards = Card.objects.filter(
        reminder_at__isnull=False,
        reminder_done=False,
        reminder_at__gte=one_minute_ago,
        reminder_at__lte=now,
        is_archived=False,
    )
    
    notifications_sent = 0
    
    for card in due_cards:
        # Send WebSocket notification to user
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            group_name = f"notifications_{card.user.id}"
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "notification_message",
                    "data": {
                        "type": "reminder",
                        "card_id": str(card.id),
                        "title": card.title,
                        "message": f"Reminder: {card.title}",
                    },
                },
            )
            
            notifications_sent += 1
        except Exception as e:
            # Log error but continue processing other reminders
            print(f"Failed to send notification for card {card.id}: {e}")
    
    return {
        "status": "success",
        "notifications_sent": notifications_sent,
    }
