"""
Reminders Views
─────────────────────────────────────────────────────────────────────────────
List upcoming reminders and update reminder status (snooze, done).
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from apps.cards.models import Card
from apps.cards.serializers import CardListSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reminders_list_view(request):
    """
    GET /api/reminders/
    
    Returns all upcoming reminders (not done, reminder_at >= now).
    Sorted by reminder_at (soonest first).
    """
    user = request.user
    now = timezone.now()
    
    cards_with_reminders = Card.objects.filter(
        user=user,
        reminder_at__isnull=False,
        reminder_done=False,
        reminder_at__gte=now,
        is_archived=False,
    ).order_by("reminder_at")
    
    serializer = CardListSerializer(
        cards_with_reminders,
        many=True,
        context={"request": request},
    )
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def reminder_update_view(request, card_id):
    """
    PATCH /api/reminders/{card_id}/
    Body: {"action": "done" | "snooze", "snooze_duration": "1h" | "1d" | "1w"}
    
    Mark reminder as done or snooze it.
    """
    try:
        card = Card.objects.get(id=card_id, user=request.user)
    except Card.DoesNotExist:
        return Response(
            {"error": "Card not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    
    action = request.data.get("action")
    
    if action == "done":
        card.reminder_done = True
        card.save(update_fields=["reminder_done"])
        return Response(
            {"message": "Reminder marked as done."},
            status=status.HTTP_200_OK,
        )
    
    elif action == "snooze":
        snooze_duration = request.data.get("snooze_duration", "1h")
        
        # Parse snooze duration
        duration_map = {
            "1h": timedelta(hours=1),
            "3h": timedelta(hours=3),
            "1d": timedelta(days=1),
            "1w": timedelta(weeks=1),
        }
        
        delta = duration_map.get(snooze_duration, timedelta(hours=1))
        card.reminder_at = timezone.now() + delta
        card.save(update_fields=["reminder_at"])
        
        return Response(
            {
                "message": f"Reminder snoozed for {snooze_duration}.",
                "new_reminder_at": card.reminder_at,
            },
            status=status.HTTP_200_OK,
        )
    
    else:
        return Response(
            {"error": "Invalid action. Use 'done' or 'snooze'."},
            status=status.HTTP_400_BAD_REQUEST,
        )
