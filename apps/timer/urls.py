"""
Timer URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TimerSessionViewSet

router = DefaultRouter()
router.register('sessions', TimerSessionViewSet, basename='timer-session')

urlpatterns = [
    path('', include(router.urls)),
]
