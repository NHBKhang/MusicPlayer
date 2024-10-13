from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .dialogflow_service import detect_intent_texts
from support.models import *
from support import serializers
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


class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.all()
    serializer_class = serializers.SupportTicketSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(user=self.request.user)
        serializer = self.get_serializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class FeedbackViewSet(viewsets.ViewSet, generics.ListCreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = serializers.FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(user=self.request.user)
        serializer = self.get_serializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
