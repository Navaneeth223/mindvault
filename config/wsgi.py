"""
MindVault WSGI Configuration
Used by Gunicorn in production for standard HTTP serving.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

application = get_wsgi_application()
