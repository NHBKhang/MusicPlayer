from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers


class PasswordChangeSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)


class SetPasswordViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='set-password')
    def set_password(self, request):
        user = request.user

        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            new_password = serializer.validated_data['new_password']

            user.set_password(new_password)
            user.save()

            update_session_auth_hash(request, user)

            return Response({'response': 'Mật khẩu đã được cập nhật'}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
