"""
MindVault Development Settings
─────────────────────────────────────────────────────────────────────────────
Extends base settings with dev-friendly overrides:
- DEBUG = True
- Browsable API renderer enabled
- Relaxed CORS
- Console email backend
"""
from .base import *  # noqa: F401, F403

DEBUG = True

# Allow all hosts in development
ALLOWED_HOSTS = ["*"]

# Add browsable API renderer for DRF in development
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [  # noqa: F405
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
]

# Relax throttling in development so you're not blocked while testing
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {  # noqa: F405
    "anon": "10000/hour",
    "user": "100000/hour",
}

# Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Email: print to console instead of sending
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Django Debug Toolbar (optional — install separately if needed)
# INSTALLED_APPS += ["debug_toolbar"]
# MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")
# INTERNAL_IPS = ["127.0.0.1"]
