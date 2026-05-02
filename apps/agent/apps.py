from django.apps import AppConfig


class AgentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.agent'
    verbose_name = 'ARIA Agent'

    def ready(self):
        """Connect signals when app is ready."""
        import apps.agent.signals  # noqa: F401
