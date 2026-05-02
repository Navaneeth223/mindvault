from django.contrib import admin
from .models import TimerSession


@admin.register(TimerSession)
class TimerSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'session_type', 'duration_display', 'completed', 'abandoned', 'started_at']
    list_filter = ['session_type', 'completed', 'abandoned', 'started_at']
    search_fields = ['user__username', 'note']
    readonly_fields = ['id', 'created_at', 'completion_percentage']

    def duration_display(self, obj):
        mins = obj.duration // 60
        return f"{mins}m"
    duration_display.short_description = 'Duration'
