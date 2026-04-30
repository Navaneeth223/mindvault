"""
Cards URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CardViewSet

app_name = "cards"

router = DefaultRouter()
router.register(r"", CardViewSet, basename="card")

urlpatterns = [
    path("", include(router.urls)),
]
