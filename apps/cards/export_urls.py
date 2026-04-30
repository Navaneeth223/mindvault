"""
Export/Import URLs
"""
from django.urls import path
from .export_views import export_data_view, import_bookmarks_view, import_raindrop_view

app_name = "export"

urlpatterns = [
    path("export/", export_data_view, name="export"),
    path("import/bookmarks/", import_bookmarks_view, name="import_bookmarks"),
    path("import/raindrop/", import_raindrop_view, name="import_raindrop"),
]
