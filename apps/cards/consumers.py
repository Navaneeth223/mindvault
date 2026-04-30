"""
WebSocket Consumers
─────────────────────────────────────────────────────────────────────────────
Real-time notifications for:
- Transcription completion
- Thumbnail generation
- Background task updates
"""
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications.
    
    Frontend connects to: ws://localhost:8000/ws/notifications/
    """
    
    async def connect(self):
        """Accept WebSocket connection and add to user's notification group."""
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            await self.close()
            return
        
        # Each user has their own notification channel
        self.group_name = f"notifications_{self.user.id}"
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        """Remove from notification group on disconnect."""
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name,
            )
    
    async def receive_json(self, content):
        """Handle incoming messages from client (ping/pong for keepalive)."""
        message_type = content.get("type")
        
        if message_type == "ping":
            await self.send_json({"type": "pong"})
    
    async def notification_message(self, event):
        """
        Send notification to client.
        Called when a message is sent to the group.
        """
        await self.send_json({
            "type": "notification",
            "data": event["data"],
        })


# WebSocket URL patterns (imported in asgi.py)
from django.urls import path

websocket_urlpatterns = [
    path("ws/notifications/", NotificationConsumer.as_asgi()),
]
