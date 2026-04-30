"""
Tags URLs
"""
from django.urls import path
from .tag_views import tags_list_view, tag_delete_view

app_name = "tags"

urlpatterns = [
    path("", tags_list_view, name="list"),
    path("<slug:slug>/", tag_delete_view, name="delete"),
]
