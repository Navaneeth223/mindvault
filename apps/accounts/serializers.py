"""
Accounts Serializers
─────────────────────────────────────────────────────────────────────────────
Handles user registration, profile read/update, and password change.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    User registration serializer.
    Validates password strength and ensures email uniqueness.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "password", "password_confirm",
        ]
        extra_kwargs = {
            "email": {"required": True},
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate_email(self, value):
        """Ensure email is unique (case-insensitive)."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        """Ensure both passwords match."""
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Full user profile — returned on /api/auth/me/ and after login.
    Includes computed fields like display_name and card_count.
    """
    display_name = serializers.ReadOnlyField()
    card_count = serializers.ReadOnlyField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "display_name", "avatar", "avatar_url", "bio",
            "theme", "accent_colour", "default_view", "speech_language",
            "notifications_enabled", "card_count",
            "date_joined", "last_active_at",
        ]
        read_only_fields = ["id", "date_joined", "last_active_at"]
        extra_kwargs = {
            "avatar": {"write_only": True},  # write via form, read via avatar_url
        }

    def get_avatar_url(self, obj):
        """Return absolute URL for avatar image."""
        if obj.avatar:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.avatar.url)
        return None


class ChangePasswordSerializer(serializers.Serializer):
    """Handles password change for authenticated users."""
    old_password = serializers.CharField(required=True, style={"input_type": "password"})
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    new_password_confirm = serializers.CharField(
        required=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password": "New passwords do not match."}
            )
        return attrs

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
