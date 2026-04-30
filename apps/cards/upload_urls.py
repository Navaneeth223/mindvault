"""
Upload URLs
"""
from django.urls import path
from .upload_views import upload_file_view, upload_audio_view, transcription_status_view

app_name = "upload"

urlpatterns = [
    path("", upload_file_view, name="upload_file"),
    path("audio/", upload_audio_view, name="upload_audio"),
    path("audio/status/<str:task_id>/", transcription_status_view, name="transcription_status"),
]
