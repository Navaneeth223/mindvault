"""
Search URLs
"""
from django.urls import path
from .views import search_view, search_suggestions_view

app_name = "search"

urlpatterns = [
    path("", search_view, name="search"),
    path("suggestions/", search_suggestions_view, name="suggestions"),
]
