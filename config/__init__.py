# This file makes 'config' a Python package.
# Celery app is imported here so it's loaded when Django starts.
try:
    from .celery import app as celery_app
    __all__ = ("celery_app",)
except ImportError:
    # Celery not installed in local dev mode
    pass
