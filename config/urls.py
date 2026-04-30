"""
MindVault Root URL Configuration
─────────────────────────────────────────────────────────────────────────────
All API routes are namespaced under /api/.
Media files are served by Django in development (Nginx handles this in prod).
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # ── Authentication ────────────────────────────────────────────────────────
    path("api/auth/", include("apps.accounts.urls")),

    # ── Core Resources ────────────────────────────────────────────────────────
    path("api/cards/", include("apps.cards.urls")),
    path("api/collections/", include("apps.collections.urls")),
    path("api/reminders/", include("apps.reminders.urls")),

    # ── Search ────────────────────────────────────────────────────────────────
    path("api/search/", include("apps.search.urls")),

    # ── URL Metadata Scraping ─────────────────────────────────────────────────
    path("api/meta/", include("apps.cards.meta_urls")),

    # ── File Upload ───────────────────────────────────────────────────────────
    path("api/upload/", include("apps.cards.upload_urls")),

    # ── Tags ──────────────────────────────────────────────────────────────────
    path("api/tags/", include("apps.cards.tag_urls")),

    # ── Export / Import ───────────────────────────────────────────────────────
    path("api/", include("apps.cards.export_urls")),
]

# Serve media files in development
# In production, Nginx handles /media/ directly from the volume
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
