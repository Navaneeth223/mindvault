"""
Celery application configuration for MindVault.

Tasks are auto-discovered from each app's tasks.py module.
Queues:
  - default: general tasks (URL scraping, GitHub, metadata)
  - media:   heavy tasks (audio transcription, thumbnail generation)
"""
import os
from celery import Celery

# Tell Celery which Django settings module to use
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

app = Celery("mindvault")

# Load config from Django settings, using the CELERY_ namespace prefix
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks.py in all INSTALLED_APPS
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Utility task for testing Celery connectivity."""
    print(f"Request: {self.request!r}")
