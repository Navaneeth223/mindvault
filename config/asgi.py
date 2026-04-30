"""
MindVault ASGI Configuration
─────────────────────────────────────────────────────────────────────────────
Routes HTTP requests to Django and WebSocket connections to Django Channels.
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

# Get the standard Django ASGI app for HTTP requests
django_asgi_app = get_asgi_application()

# Import WebSocket URL patterns after Django setup
from apps.cards.consumers import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        # Standard HTTP → Django views
        "http": django_asgi_app,
        # WebSocket → Django Channels
        # AllowedHostsOriginValidator checks the Origin header against ALLOWED_HOSTS
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(
                URLRouter(websocket_urlpatterns)
            )
        ),
    }
)
