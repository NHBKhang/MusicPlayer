from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.files.base import ContentFile
from urllib.parse import parse_qs
import json
from datetime import datetime

stream_buffers = {}
viewers_count = {}


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
            viewer = query_params.get('viewer', [None])[0]
            if viewer:
                if self.session_id not in viewers_count:
                    viewers_count[self.session_id] = []

                if viewer not in viewers_count[self.session_id]:
                    viewers_count[self.session_id].append(viewer)

                await self.send_existing_stream()
                await self.update_viewers_count()

    async def disconnect(self, close_code):
        if self.user_id:
            await self.stop_live_stream()
        else:
            query_string = self.scope['query_string'].decode('utf-8')
            query_params = parse_qs(query_string)
            viewer = query_params.get('viewer', [None])[0]
            if self.session_id in viewers_count and viewer in viewers_count[self.session_id]:
                viewers_count[self.session_id].remove(viewer)
                await self.update_viewers_count()

        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            message_data = json.loads(text_data)
            message_type = message_data.get('type')

            if message_type == 'chat_message':
                message = message_data.get('message')
                username = message_data.get('username')

                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'chat_data',
                        'message': message,
                        'username': username,
                    }
                )
        if bytes_data:
            stream_buffers[self.session_id].extend(bytes_data)

            await self.channel_layer.group_send(self.group_name, {
                'type': 'stream_data',
                'data': bytes_data
            })

    async def send_existing_stream(self):
        if self.session_id in stream_buffers:
            await self.send(bytes_data=bytes(stream_buffers[self.session_id]))

    async def update_viewers_count(self):
        viewers = viewers_count.get(self.session_id, [])
        await self.channel_layer.group_send(self.group_name, {
            'type': 'viewers_count_data',
            'viewers_count': len(viewers)
        })

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

        if self.session_id in stream_buffers:
            del stream_buffers[self.session_id]
        if self.session_id in viewers_count:
            del viewers_count[self.session_id]

    async def stream_data(self, event):
        try:
            data = bytes(event['data'])
            await self.send(bytes_data=data)
        except Exception as e:
            print(f"Error sending stream data: {e}")

    async def chat_data(self, event):
        try:
            message = event['message']
            username = event['username']
            await self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': message,
                'username': username
            }))
        except Exception as e:
            print(f"Error sending chat data: {e}")

    async def viewers_count_data(self, event):
        try:
            viewers_count = event['viewers_count']
            await self.send(text_data=json.dumps({'viewers_count': viewers_count}))
        except Exception as e:
            print(f"Error sending viewers count: {e}")
