"""
Accounts Views
─────────────────────────────────────────────────────────────────────────────
Handles user registration, profile retrieval/update, and password change.
JWT tokens are issued via simplejwt's built-in views (imported in urls.py).
"""
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Public endpoint — creates a new user account.
    Returns the created user profile (without tokens — user must login separately).
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Return user profile
        profile_serializer = UserProfileSerializer(user, context={"request": request})
        return Response(
            {
                "message": "Registration successful. Please log in.",
                "user": profile_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """
    GET /api/auth/me/
    Returns the authenticated user's profile.

    PATCH /api/auth/me/
    Updates the authenticated user's profile.
    """
    user = request.user

    if request.method == "GET":
        # Update last_active_at timestamp
        user.last_active_at = timezone.now()
        user.save(update_fields=["last_active_at"])

        serializer = UserProfileSerializer(user, context={"request": request})
        return Response(serializer.data)

    elif request.method == "PATCH":
        serializer = UserProfileSerializer(
            user,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    POST /api/auth/change-password/
    Changes the authenticated user's password.
    Requires: old_password, new_password, new_password_confirm
    """
    serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)

    user = request.user
    user.set_password(serializer.validated_data["new_password"])
    user.save()

    return Response(
        {"message": "Password changed successfully."},
        status=status.HTTP_200_OK,
    )
