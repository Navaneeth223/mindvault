"""
Metadata Scraping Views
─────────────────────────────────────────────────────────────────────────────
Endpoints for scraping URL metadata (title, OG image, favicon).
Used by the quick capture modal to show live previews.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def scrape_url_view(request):
    """
    POST /api/meta/scrape/
    Body: {"url": "https://example.com"}
    
    Scrapes URL metadata: title, description, OG image, favicon.
    Returns immediately (synchronous) for quick preview in UI.
    """
    url = request.data.get("url")
    if not url:
        return Response(
            {"error": "URL is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        # Detect card type from URL
        card_type = detect_card_type(url)
        
        # Fetch and parse HTML
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Extract metadata
        metadata = {
            "url": url,
            "type": card_type,
            "title": extract_title(soup),
            "description": extract_description(soup),
            "og_image": extract_og_image(soup, url),
            "favicon": extract_favicon(soup, url),
            "domain": urlparse(url).netloc,
        }
        
        return Response(metadata, status=status.HTTP_200_OK)
    
    except requests.RequestException as e:
        return Response(
            {"error": f"Failed to fetch URL: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        return Response(
            {"error": f"Failed to parse URL: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def youtube_metadata_view(request):
    """
    POST /api/meta/youtube/
    Body: {"url": "https://youtube.com/watch?v=..."}
    
    Extracts YouTube video metadata using yt-dlp.
    """
    url = request.data.get("url")
    if not url:
        return Response(
            {"error": "URL is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        import yt_dlp
        
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "extract_flat": False,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            metadata = {
                "type": "youtube",
                "url": url,
                "title": info.get("title", ""),
                "description": info.get("description", "")[:500],  # truncate
                "thumbnail": info.get("thumbnail", ""),
                "duration": info.get("duration", 0),
                "channel": info.get("uploader", ""),
                "view_count": info.get("view_count", 0),
                "video_id": info.get("id", ""),
                "embed_url": f"https://www.youtube.com/embed/{info.get('id', '')}",
            }
            
            return Response(metadata, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {"error": f"Failed to extract YouTube metadata: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def github_metadata_view(request):
    """
    POST /api/meta/github/
    Body: {"url": "https://github.com/user/repo"}
    
    Extracts GitHub repository metadata using GitHub API.
    """
    url = request.data.get("url")
    if not url:
        return Response(
            {"error": "URL is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    # Parse owner and repo from URL
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", url)
    if not match:
        return Response(
            {"error": "Invalid GitHub URL."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    owner, repo = match.groups()
    repo = repo.rstrip("/")  # remove trailing slash
    
    try:
        from django.conf import settings
        
        # GitHub API request
        api_url = f"https://api.github.com/repos/{owner}/{repo}"
        headers = {"Accept": "application/vnd.github.v3+json"}
        
        # Add token if available (increases rate limit)
        if settings.GITHUB_TOKEN:
            headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"
        
        response = requests.get(api_url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Fetch README preview (first 500 chars)
        readme_url = f"https://api.github.com/repos/{owner}/{repo}/readme"
        readme_response = requests.get(readme_url, headers=headers, timeout=5)
        readme_preview = ""
        if readme_response.status_code == 200:
            import base64
            readme_content = base64.b64decode(
                readme_response.json().get("content", "")
            ).decode("utf-8")
            readme_preview = readme_content[:500]
        
        metadata = {
            "type": "github",
            "url": url,
            "title": data.get("full_name", ""),
            "description": data.get("description", ""),
            "stars": data.get("stargazers_count", 0),
            "language": data.get("language", ""),
            "topics": data.get("topics", []),
            "owner": data.get("owner", {}).get("login", ""),
            "repo": data.get("name", ""),
            "readme_preview": readme_preview,
        }
        
        return Response(metadata, status=status.HTTP_200_OK)
    
    except requests.RequestException as e:
        return Response(
            {"error": f"Failed to fetch GitHub data: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )


# ─── Helper Functions ─────────────────────────────────────────────────────────

def detect_card_type(url):
    """Detect card type from URL pattern."""
    url_lower = url.lower()
    
    if "youtube.com" in url_lower or "youtu.be" in url_lower:
        return "youtube"
    elif "github.com" in url_lower:
        return "github"
    elif "instagram.com" in url_lower or "tiktok.com" in url_lower:
        return "reel"
    else:
        return "link"


def extract_title(soup):
    """Extract page title (OG title → <title> → fallback)."""
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        return og_title["content"]
    
    title_tag = soup.find("title")
    if title_tag:
        return title_tag.get_text().strip()
    
    return "Untitled"


def extract_description(soup):
    """Extract page description (OG description → meta description)."""
    og_desc = soup.find("meta", property="og:description")
    if og_desc and og_desc.get("content"):
        return og_desc["content"]
    
    meta_desc = soup.find("meta", attrs={"name": "description"})
    if meta_desc and meta_desc.get("content"):
        return meta_desc["content"]
    
    return ""


def extract_og_image(soup, base_url):
    """Extract Open Graph image URL."""
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        return urljoin(base_url, og_image["content"])
    return ""


def extract_favicon(soup, base_url):
    """Extract favicon URL."""
    # Try various favicon link tags
    favicon = soup.find("link", rel=lambda x: x and "icon" in x.lower())
    if favicon and favicon.get("href"):
        return urljoin(base_url, favicon["href"])
    
    # Fallback to /favicon.ico
    parsed = urlparse(base_url)
    return f"{parsed.scheme}://{parsed.netloc}/favicon.ico"
