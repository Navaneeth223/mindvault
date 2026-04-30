"""
File Upload Views
─────────────────────────────────────────────────────────────────────────────
Handles file uploads (images, PDFs, audio) with optional processing.
"""
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_file_view(request):
    """
    POST /api/upload/
    Multipart form data with 'file' field.
    
    Generic file upload endpoint.
    Returns file URL that can be used when creating a card.
    """
    file_obj = request.FILES.get("file")
    if not file_obj:
        return Response(
            {"error": "No file provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        # Generate unique filename
        ext = os.path.splitext(file_obj.name)[1]
        filename = f"uploads/{uuid.uuid4()}{ext}"
        
        # Save file
        path = default_storage.save(filename, ContentFile(file_obj.read()))
        file_url = default_storage.url(path)
        
        # Build absolute URL
        absolute_url = request.build_absolute_uri(file_url)
        
        return Response(
            {
                "message": "File uploaded successfully.",
                "file_url": absolute_url,
                "filename": file_obj.name,
                "size": file_obj.size,
            },
            status=status.HTTP_201_CREATED,
        )
    
    except Exception as e:
        return Response(
            {"error": f"Upload failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_audio_view(request):
    """
    POST /api/upload/audio/
    Multipart form data with 'audio' field and optional 'language' field.
    
    Uploads audio file and triggers Celery task for transcription.
    Returns immediately with task_id — frontend can poll for result.
    """
    audio_file = request.FILES.get("audio")
    language = request.data.get("language", "en")  # en or ml
    
    if not audio_file:
        return Response(
            {"error": "No audio file provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        # Save audio file
        ext = os.path.splitext(audio_file.name)[1]
        filename = f"audio/{uuid.uuid4()}{ext}"
        path = default_storage.save(filename, ContentFile(audio_file.read()))
        file_url = default_storage.url(path)
        absolute_url = request.build_absolute_uri(file_url)
        
        # Trigger transcription task (async)
        from .tasks import transcribe_audio_file
        task = transcribe_audio_file.delay(path, language)
        
        return Response(
            {
                "message": "Audio uploaded. Transcription in progress.",
                "file_url": absolute_url,
                "task_id": task.id,
            },
            status=status.HTTP_202_ACCEPTED,
        )
    
    except Exception as e:
        return Response(
            {"error": f"Upload failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def transcription_status_view(request, task_id):
    """
    GET /api/upload/audio/status/{task_id}/
    
    Check transcription task status.
    Returns: {status: 'PENDING'|'SUCCESS'|'FAILURE', transcript: '...'}
    """
    from celery.result import AsyncResult
    
    task = AsyncResult(task_id)
    
    response_data = {
        "task_id": task_id,
        "status": task.status,
    }
    
    if task.status == "SUCCESS":
        response_data["transcript"] = task.result
    elif task.status == "FAILURE":
        response_data["error"] = str(task.info)
    
    return Response(response_data, status=status.HTTP_200_OK)
