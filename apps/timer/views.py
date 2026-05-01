"""
Timer Views
─────────────────────────────────────────────────────────────────────────────
CRUD for timer sessions + stats endpoint.
"""
from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta, date

from .models import TimerSession
from .serializers import TimerSessionSerializer


class TimerSessionViewSet(viewsets.ModelViewSet):
    serializer_class = TimerSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TimerSession.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Return focus stats for today / this week / this month."""
        user = request.user
        period = request.query_params.get('period', 'today')
        now = timezone.now()

        if period == 'today':
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'week':
            start = now - timedelta(days=now.weekday())
            start = start.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'month':
            start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        sessions = TimerSession.objects.filter(
            user=user,
            session_type=TimerSession.SessionType.FOCUS,
            started_at__gte=start,
        )

        total_focus = sessions.filter(completed=True).aggregate(
            total=Sum('actual_time')
        )['total'] or 0

        completed_count = sessions.filter(completed=True).count()
        abandoned_count = sessions.filter(abandoned=True).count()

        # Calculate streak (consecutive days with at least 1 completed session)
        streak = self._calculate_streak(user)

        return Response({
            'period': period,
            'total_focus_seconds': total_focus,
            'total_focus_minutes': round(total_focus / 60),
            'completed_sessions': completed_count,
            'abandoned_sessions': abandoned_count,
            'streak_days': streak,
        })

    def _calculate_streak(self, user):
        """Count consecutive days with at least one completed focus session."""
        streak = 0
        check_date = date.today()

        for _ in range(365):  # max 1 year streak
            has_session = TimerSession.objects.filter(
                user=user,
                session_type=TimerSession.SessionType.FOCUS,
                completed=True,
                started_at__date=check_date,
            ).exists()

            if has_session:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break

        return streak
