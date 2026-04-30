"""
MindVault Production Settings
─────────────────────────────────────────────────────────────────────────────
Extends base settings with production hardening:
- DEBUG = False
- Strict CORS
- Secure cookies
- HSTS headers
"""
from .base import *  # noqa: F401, F403
import os

DEBUG = False

# In production, ALLOWED_HOSTS must be explicitly set via env var
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")

# Also allow Render's internal hostname
RENDER_EXTERNAL_HOSTNAME = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# ─── Security Headers ─────────────────────────────────────────────────────────
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# HTTPS enforcement (enable when behind SSL termination)
SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "False") == "True"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# HSTS: tell browsers to always use HTTPS for 1 year
SECURE_HSTS_SECONDS = 31_536_000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# ─── Static Files ─────────────────────────────────────────────────────────────
# WhiteNoise serves compressed static files with long cache headers
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ─── Logging ──────────────────────────────────────────────────────────────────
# In production, only log WARNING and above to reduce noise
LOGGING["root"]["level"] = "WARNING"  # noqa: F405
