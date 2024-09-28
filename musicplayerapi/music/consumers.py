from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.files.base import ContentFile
from urllib.parse import parse_qs
import json
from datetime import datetime

# Biến toàn cục lưu buffer của toàn bộ phiên phát trực tiếp
stream_buffers = {}

class LiveStreamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.group_name = f'live_stream_group_{self.session_id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        query_string = self.scope['query_string'].decode('utf-8')
        query_params = parse_qs(query_string)
        self.user_id = query_params.get('user_id', [None])[0]
        if self.user_id:
            await self.start_live_stream()
        else:
            await self.send_existing_stream()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

        if self.user_id:
            await self.stop_live_stream()

    async def receive(self, text_data=None, bytes_data=None):
        if bytes_data:
            stream_buffers[self.session_id].extend(bytes_data)

            await self.channel_layer.group_send(self.group_name, {
                'type': 'stream_data',
                'data': bytes_data
            })

    async def stream_data(self, event):
        data = bytes(event['data'])
        await self.send(bytes_data=data)

    async def send_existing_stream(self):
        if self.session_id in stream_buffers:
            await self.send(bytes_data=bytes(stream_buffers[self.session_id]))

    @database_sync_to_async
    def start_live_stream(self):
        from music.models import LiveStream

        LiveStream.objects.create(session_id=self.session_id, user_id=self.user_id)

        if self.session_id not in stream_buffers:
            stream_buffers[self.session_id] = bytearray()

    @database_sync_to_async
    def stop_live_stream(self):
        from music.models import LiveStream

        live_stream = LiveStream.objects.get(session_id=self.session_id)
        live_stream.file.save(f'{self.session_id}.webm', ContentFile(bytes(stream_buffers[self.session_id])))
        live_stream.is_active = False
        live_stream.end_time = datetime.now()
        live_stream.save()

        del stream_buffers[self.session_id]
