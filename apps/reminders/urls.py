"""
Reminders URLs
"""
from django.urls import path
from .views import reminders_list_view, reminder_update_view

app_name = "reminders"

urlpatterns = [
    path("", reminders_list_view, name="list"),
    path("<uuid:card_id>/", reminder_update_view, name="update"),
]
