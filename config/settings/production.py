"""
MindVault Production Settings
─────────────────────────────────────────────────────────────────────────────
Extends base settings with production hardening.
"""
from .base import *  # noqa: F401, F403
import os

DEBUG = False

# ─── Hosts ────────────────────────────────────────────────────────────────────
# Render sets RENDER_EXTERNAL_HOSTNAME automatically
RENDER_EXTERNAL_HOSTNAME = os.environ.get("RENDER_EXTERNAL_HOSTNAME", "")

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("ALLOWED_HOSTS", "").split(",")
    if h.strip()
]

# Always allow Render's auto-assigned hostname
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Fallback: allow all *.onrender.com subdomains
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ["*"]

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Allow the Vercel frontend + any configured origins
_cors_env = os.environ.get("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_env.split(",") if o.strip()]

# Also allow all vercel.app subdomains (covers preview deployments)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://.*\.onrender\.com$",
]

CORS_ALLOW_CREDENTIALS = True

# ─── Security Headers ─────────────────────────────────────────────────────────
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "SAMEORIGIN"  # Allow iframes from same origin (PDF viewer)

# Render handles SSL termination — don't redirect internally
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# HSTS
SECURE_HSTS_SECONDS = 31_536_000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# ─── Static Files ─────────────────────────────────────────────────────────────
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ─── Logging ──────────────────────────────────────────────────────────────────
LOGGING["root"]["level"] = "WARNING"  # noqa: F405
