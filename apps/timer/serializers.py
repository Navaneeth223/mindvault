"""
Timer Serializers
"""
from rest_framework import serializers
from .models import TimerSession


class TimerSessionSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.ReadOnlyField()
    linked_card_title = serializers.SerializerMethodField()

    class Meta:
        model = TimerSession
        fields = [
            'id', 'session_type', 'duration', 'actual_time',
            'completed', 'abandoned', 'linked_card', 'linked_card_title',
            'note', 'started_at', 'ended_at', 'created_at',
            'completion_percentage',
        ]
        read_only_fields = ['id', 'created_at', 'completion_percentage']

    def get_linked_card_title(self, obj):
        return obj.linked_card.title if obj.linked_card else None

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
