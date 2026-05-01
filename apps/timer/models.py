"""
Timer Session Model
─────────────────────────────────────────────────────────────────────────────
Tracks focus sessions (Pomodoro / deep work) with stats.
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class TimerSession(models.Model):
    class SessionType(models.TextChoices):
        FOCUS       = 'focus',       'Focus'
        SHORT_BREAK = 'short_break', 'Short Break'
        LONG_BREAK  = 'long_break',  'Long Break'

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='timer_sessions')
    session_type = models.CharField(max_length=20, choices=SessionType.choices, default=SessionType.FOCUS)
    duration     = models.IntegerField()            # planned seconds
    actual_time  = models.IntegerField(default=0)   # seconds actually completed
    completed    = models.BooleanField(default=False)
    abandoned    = models.BooleanField(default=False)
    linked_card  = models.ForeignKey(
        'cards.Card', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='timer_sessions'
    )
    note         = models.TextField(blank=True)     # what were you working on
    started_at   = models.DateTimeField()
    ended_at     = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', 'started_at']),
            models.Index(fields=['user', 'completed']),
        ]

    def __str__(self):
        return f"{self.user.username} — {self.session_type} {self.duration}s"

    @property
    def completion_percentage(self):
        if self.duration == 0:
            return 0
        return round((self.actual_time / self.duration) * 100)
