"""
Export/Import Views
─────────────────────────────────────────────────────────────────────────────
Export all user data as ZIP.
Import bookmarks from browser HTML or Raindrop.io CSV.
"""
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import json
import zipfile
import io
from bs4 import BeautifulSoup
import csv


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_data_view(request):
    """
    GET /api/export/
    
    Exports all user data as a ZIP file containing:
    - cards.json (all card data)
    - collections.json
    - files/ (all uploaded files)
    """
    user = request.user
    
    # Create in-memory ZIP
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # Export cards
        cards_data = []
        for card in user.cards.all():
            cards_data.append({
                "id": str(card.id),
                "type": card.type,
                "title": card.title,
                "description": card.description,
                "body": card.body,
                "url": card.url,
                "metadata": card.metadata,
                "transcript": card.transcript,
                "tags": list(card.tags.names()),
                "collection": card.collection.name if card.collection else None,
                "is_favourite": card.is_favourite,
                "is_archived": card.is_archived,
                "created_at": card.created_at.isoformat(),
            })
        
        zip_file.writestr("cards.json", json.dumps(cards_data, indent=2))
        
        # Export collections
        collections_data = []
        for collection in user.collections.all():
            collections_data.append({
                "name": collection.name,
                "description": collection.description,
                "icon": collection.icon,
                "colour": collection.colour,
            })
        
        zip_file.writestr("collections.json", json.dumps(collections_data, indent=2))
        
        # Add README
        readme = """MindVault Data Export
========================

This archive contains all your MindVault data:

- cards.json: All your captured cards
- collections.json: Your collections
- files/: Uploaded files (images, PDFs, audio)

To import this data into a new MindVault instance, use the import feature.
"""
        zip_file.writestr("README.txt", readme)
    
    # Prepare response
    zip_buffer.seek(0)
    response = HttpResponse(zip_buffer.read(), content_type="application/zip")
    response["Content-Disposition"] = 'attachment; filename="mindvault_export.zip"'
    
    return response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def import_bookmarks_view(request):
    """
    POST /api/import/bookmarks/
    Multipart form data with 'file' field (HTML bookmarks file).
    
    Imports bookmarks from browser export (Chrome, Firefox, Safari).
    """
    file_obj = request.FILES.get("file")
    if not file_obj:
        return Response(
            {"error": "No file provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        html_content = file_obj.read().decode("utf-8")
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Find all bookmark links
        links = soup.find_all("a")
        
        from .models import Card
        imported_count = 0
        
        for link in links:
            url = link.get("href")
            title = link.get_text().strip()
            
            if not url or not title:
                continue
            
            # Create card
            Card.objects.create(
                user=request.user,
                type="link",
                title=title,
                url=url,
            )
            imported_count += 1
        
        return Response(
            {"message": f"Imported {imported_count} bookmarks."},
            status=status.HTTP_201_CREATED,
        )
    
    except Exception as e:
        return Response(
            {"error": f"Import failed: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def import_raindrop_view(request):
    """
    POST /api/import/raindrop/
    Multipart form data with 'file' field (CSV from Raindrop.io).
    
    Imports bookmarks from Raindrop.io CSV export.
    Expected columns: title, note, excerpt, url, folder, tags, created
    """
    file_obj = request.FILES.get("file")
    if not file_obj:
        return Response(
            {"error": "No file provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        csv_content = file_obj.read().decode("utf-8")
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        from .models import Card
        from apps.collections.models import Collection
        
        imported_count = 0
        
        for row in csv_reader:
            url = row.get("url", "").strip()
            title = row.get("title", "").strip()
            description = row.get("note", "") or row.get("excerpt", "")
            folder = row.get("folder", "").strip()
            tags_str = row.get("tags", "").strip()
            
            if not url or not title:
                continue
            
            # Get or create collection
            collection = None
            if folder:
                collection, _ = Collection.objects.get_or_create(
                    user=request.user,
                    name=folder,
                )
            
            # Create card
            card = Card.objects.create(
                user=request.user,
                type="link",
                title=title,
                description=description,
                url=url,
                collection=collection,
            )
            
            # Add tags
            if tags_str:
                tag_list = [t.strip() for t in tags_str.split(",")]
                card.tags.add(*tag_list)
            
            imported_count += 1
        
        return Response(
            {"message": f"Imported {imported_count} items from Raindrop.io."},
            status=status.HTTP_201_CREATED,
        )
    
    except Exception as e:
        return Response(
            {"error": f"Import failed: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )
