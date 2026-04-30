"""
Celery Tasks for Cards
─────────────────────────────────────────────────────────────────────────────
Async tasks for:
- URL metadata scraping
- YouTube video info extraction
- GitHub repo info extraction
- Audio transcription (Whisper)
- Thumbnail generation
"""
from celery import shared_task
from django.core.files.base import ContentFile
from django.conf import settings
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import os
import tempfile


@shared_task(bind=True, max_retries=3)
def scrape_url_metadata(self, card_id):
    """
    Scrape URL metadata and update card.
    Extracts: title, description, OG image, favicon.
    """
    from .models import Card
    
    try:
        card = Card.objects.get(id=card_id)
    except Card.DoesNotExist:
        return {"error": "Card not found"}
    
    if not card.url:
        return {"error": "No URL to scrape"}
    
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(card.url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Extract title
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            card.title = og_title["content"]
        elif soup.title:
            card.title = soup.title.get_text().strip()
        
        # Extract description
        og_desc = soup.find("meta", property="og:description")
        if og_desc and og_desc.get("content"):
            card.description = og_desc["content"]
        else:
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc and meta_desc.get("content"):
                card.description = meta_desc["content"]
        
        # Extract OG image
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            card.og_image_url = urljoin(card.url, og_image["content"])
        
        # Extract favicon
        favicon = soup.find("link", rel=lambda x: x and "icon" in x.lower())
        if favicon and favicon.get("href"):
            card.favicon_url = urljoin(card.url, favicon["href"])
        else:
            parsed = urlparse(card.url)
            card.favicon_url = f"{parsed.scheme}://{parsed.netloc}/favicon.ico"
        
        card.save()
        
        return {"status": "success", "card_id": str(card.id)}
    
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=2)
def process_youtube(self, card_id, youtube_url):
    """
    Extract YouTube video metadata using yt-dlp.
    Updates card with title, thumbnail, channel, duration, etc.
    """
    from .models import Card
    
    try:
        card = Card.objects.get(id=card_id)
    except Card.DoesNotExist:
        return {"error": "Card not found"}
    
    try:
        import yt_dlp
        
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            
            card.title = info.get("title", card.title)
            card.description = info.get("description", "")[:1000]  # truncate
            
            # Download and save thumbnail
            thumbnail_url = info.get("thumbnail")
            if thumbnail_url:
                try:
                    thumb_response = requests.get(thumbnail_url, timeout=10)
                    thumb_response.raise_for_status()
                    
                    filename = f"youtube_{info.get('id', 'thumb')}.jpg"
                    card.thumbnail.save(
                        filename,
                        ContentFile(thumb_response.content),
                        save=False,
                    )
                except Exception:
                    pass  # Thumbnail download failed, continue anyway
            
            # Store metadata
            card.metadata = {
                "channel": info.get("uploader", ""),
                "duration": info.get("duration", 0),
                "view_count": info.get("view_count", 0),
                "video_id": info.get("id", ""),
                "embed_url": f"https://www.youtube.com/embed/{info.get('id', '')}",
            }
            
            card.save()
            
            return {"status": "success", "card_id": str(card.id)}
    
    except Exception as exc:
        raise self.retry(exc=exc, countdown=120)


@shared_task(bind=True, max_retries=2)
def process_github(self, card_id, github_url):
    """
    Extract GitHub repository metadata using GitHub API.
    Updates card with repo info, stars, language, topics.
    """
    from .models import Card
    import re
    
    try:
        card = Card.objects.get(id=card_id)
    except Card.DoesNotExist:
        return {"error": "Card not found"}
    
    # Parse owner and repo from URL
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", github_url)
    if not match:
        return {"error": "Invalid GitHub URL"}
    
    owner, repo = match.groups()
    repo = repo.rstrip("/")
    
    try:
        api_url = f"https://api.github.com/repos/{owner}/{repo}"
        headers = {"Accept": "application/vnd.github.v3+json"}
        
        if settings.GITHUB_TOKEN:
            headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"
        
        response = requests.get(api_url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        card.title = data.get("full_name", card.title)
        card.description = data.get("description", "")
        
        # Fetch README preview
        readme_url = f"https://api.github.com/repos/{owner}/{repo}/readme"
        readme_response = requests.get(readme_url, headers=headers, timeout=5)
        readme_preview = ""
        if readme_response.status_code == 200:
            import base64
            readme_content = base64.b64decode(
                readme_response.json().get("content", "")
            ).decode("utf-8")
            readme_preview = readme_content[:500]
        
        card.metadata = {
            "stars": data.get("stargazers_count", 0),
            "language": data.get("language", ""),
            "topics": data.get("topics", []),
            "owner": data.get("owner", {}).get("login", ""),
            "repo": data.get("name", ""),
            "readme_preview": readme_preview,
        }
        
        card.save()
        
        return {"status": "success", "card_id": str(card.id)}
    
    except Exception as exc:
        raise self.retry(exc=exc, countdown=120)


@shared_task(bind=True)
def transcribe_audio(self, card_id, audio_file_path):
    """
    Transcribe audio file using Whisper.
    Updates card.transcript with the result.
    """
    from .models import Card
    
    try:
        card = Card.objects.get(id=card_id)
    except Card.DoesNotExist:
        return {"error": "Card not found"}
    
    try:
        import whisper
        
        # Load Whisper model (cached after first load)
        model_name = settings.WHISPER_MODEL
        model = whisper.load_model(model_name)
        
        # Get full file path
        full_path = os.path.join(settings.MEDIA_ROOT, audio_file_path)
        
        # Transcribe
        result = model.transcribe(full_path, language=card.metadata.get("language", "en"))
        
        card.transcript = result["text"]
        card.save(update_fields=["transcript"])
        
        return {"status": "success", "transcript": result["text"]}
    
    except Exception as exc:
        return {"error": str(exc)}


@shared_task
def transcribe_audio_file(audio_path, language="en"):
    """
    Standalone transcription task (not tied to a card).
    Used by upload_audio endpoint.
    Returns transcript text.
    """
    try:
        import whisper
        
        model_name = settings.WHISPER_MODEL
        model = whisper.load_model(model_name)
        
        full_path = os.path.join(settings.MEDIA_ROOT, audio_path)
        
        # Map language codes
        lang_map = {"en": "en", "ml": "ml"}
        whisper_lang = lang_map.get(language, "en")
        
        result = model.transcribe(full_path, language=whisper_lang)
        
        return result["text"]
    
    except Exception as e:
        raise Exception(f"Transcription failed: {str(e)}")


@shared_task
def generate_thumbnail(card_id):
    """
    Generate thumbnail for image or PDF cards.
    """
    from .models import Card
    from PIL import Image
    import io
    
    try:
        card = Card.objects.get(id=card_id)
    except Card.DoesNotExist:
        return {"error": "Card not found"}
    
    if not card.file:
        return {"error": "No file to process"}
    
    try:
        if card.type == "image":
            # Resize image to thumbnail
            img = Image.open(card.file.path)
            img.thumbnail((400, 300), Image.Resampling.LANCZOS)
            
            # Save thumbnail
            thumb_io = io.BytesIO()
            img.save(thumb_io, format="JPEG", quality=85)
            thumb_io.seek(0)
            
            filename = f"thumb_{card.id}.jpg"
            card.thumbnail.save(filename, ContentFile(thumb_io.read()), save=True)
        
        elif card.type == "pdf":
            # Convert first page of PDF to image
            from pdf2image import convert_from_path
            
            images = convert_from_path(
                card.file.path,
                first_page=1,
                last_page=1,
                dpi=150,
            )
            
            if images:
                img = images[0]
                img.thumbnail((400, 300), Image.Resampling.LANCZOS)
                
                thumb_io = io.BytesIO()
                img.save(thumb_io, format="JPEG", quality=85)
                thumb_io.seek(0)
                
                filename = f"thumb_{card.id}.jpg"
                card.thumbnail.save(filename, ContentFile(thumb_io.read()), save=True)
        
        return {"status": "success"}
    
    except Exception as e:
        return {"error": str(e)}
