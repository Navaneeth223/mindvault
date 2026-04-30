"""
Accounts URLs
─────────────────────────────────────────────────────────────────────────────
Authentication endpoints:
- POST /api/auth/register/          → Create account
- POST /api/auth/login/             → Get JWT tokens
- POST /api/auth/token/refresh/     → Refresh access token
- POST /api/auth/logout/            → Blacklist refresh token
- GET  /api/auth/me/                → Get current user profile
- PATCH /api/auth/me/               → Update profile
- POST /api/auth/change-password/   → Change password
"""
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from .views import RegisterView, user_profile_view, change_password_view

app_name = "accounts"

urlpatterns = [
    # Registration
    path("register/", RegisterView.as_view(), name="register"),

    # JWT token endpoints (provided by simplejwt)
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", TokenBlacklistView.as_view(), name="logout"),

    # User profile
    path("me/", user_profile_view, name="profile"),

    # Password management
    path("change-password/", change_password_view, name="change_password"),
]
