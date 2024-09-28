"""
ASGI config for musicplayerapi project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import re_path
from music.consumers import LiveStreamConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'musicplayerapi.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            re_path(r'ws/live/(?P<session_id>[^/]+)/$', LiveStreamConsumer.as_asgi()),
        ])
    ),
})
