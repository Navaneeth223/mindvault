"""
Metadata Scraping URLs
"""
from django.urls import path
from .meta_views import scrape_url_view, youtube_metadata_view, github_metadata_view

app_name = "meta"

urlpatterns = [
    path("scrape/", scrape_url_view, name="scrape"),
    path("youtube/", youtube_metadata_view, name="youtube"),
    path("github/", github_metadata_view, name="github"),
]
