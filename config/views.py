"""
MindVault Config Views
─────────────────────────────────────────────────────────────────────────────
Health check and utility views.
"""
import time
from django.http import JsonResponse
from django.db import connection


def health_check(request):
    """
    Health check endpoint — no auth required.
    Used by dual-server auto-detection and keep-alive pings.
    """
    start = time.time()
    db_ok = False
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        pass

    response_ms = round((time.time() - start) * 1000)

    return JsonResponse({
        "status": "ok" if db_ok else "degraded",
        "db": db_ok,
        "response_ms": response_ms,
        "version": "1.0.0",
        "server": "MindVault API",
    })
