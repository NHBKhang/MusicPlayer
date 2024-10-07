from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .dialogflow_service import detect_intent_texts
import uuid


class DialogflowViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], url_path='response')
    def get_response(self, request):
        user_message = request.data.get('message', '')
        if not user_message:
            return Response({"error": "No message provided"}, status=400)

        # Tạo session_id duy nhất cho mỗi người dùng
        session_id = str(uuid.uuid4())
        project_id = 'soundscape-music'
        language_code = 'vi'

        # Gọi Dialogflow để lấy phản hồi
        dialogflow_response = detect_intent_texts(project_id, session_id, user_message, language_code)

        return Response({"response": dialogflow_response})
