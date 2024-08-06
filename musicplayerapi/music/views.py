from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from rest_framework import serializers as rest_serializers
from music.models import *
from music import serializers, paginators, perms
from music.utils import upload_image_from_url
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import update_session_auth_hash
from datetime import timedelta
from google.oauth2 import id_token
from google.auth.transport import requests
from oauth2_provider.models import AccessToken, RefreshToken, Application
from oauth2_provider.settings import oauth2_settings
from oauthlib.common import generate_token


@api_view(['POST'])
def google_login(request):
    id_token_from_client = request.data.get('id_token')
    if not id_token_from_client:
        return Response({'error': 'Mã xác thực không được cung cấp'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        idinfo = id_token.verify_oauth2_token(id_token_from_client, requests.Request())

        user_email = idinfo.get('email')
        user_name = idinfo.get('name')
        user_picture = idinfo.get('picture')
        if not user_email:
            return Response({'error': 'Không tìm thấy email trong mã xác thực'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            username=user_email,
            defaults={'first_name': user_name, 'email': user_email, 'avatar': upload_image_from_url(user_picture)})

        application = get_object_or_404(Application, name="SoundScapeMusicPlayer")
        expires = timezone.now() + timedelta(seconds=oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS)
        access_token = AccessToken.objects.create(
            user=user,
            scope='read write',
            expires=expires,
            token=generate_token(),
            application=application
        )

        refresh_token = RefreshToken.objects.create(
            user=user,
            token=generate_token(),
            application=application,
            access_token=access_token
        )

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.first_name,
            },
            'created': created,
            'token': {
                'access_token': access_token.token,
                'expires_in': oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS,
                'refresh_token': refresh_token.token,
                'token_type': 'Bearer',
                'scope': access_token.scope,
            }
        })
    except ValueError as e:
        print(e)
        return Response({'error': 'Xác thực không thành công', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeSerializer(rest_serializers.Serializer):
    new_password = rest_serializers.CharField(write_only=True)


@api_view(['POST'])
def set_password(request):
    user = request.user

    if not user.is_authenticated:
        return Response({'error': 'Người dùng không được xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = PasswordChangeSerializer(data=request.data)
    if serializer.is_valid():
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)
        return Response({'response': 'Mật khẩu đã được cập nhật'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def get_queryset(self):
        queries = self.queryset
        if self.request.user.is_authenticated:
            queries = queries.exclude(id=self.request.user.id)

        q = self.request.query_params.get('q')
        if q:
            queries = queries.filter(Q(first_name__icontains=q) |
                                     Q(last_name__icontains=q) |
                                     Q(username__icontains=q))

        return queries

    def get_permissions(self):
        if self.action in ['get_current_user', 'patch_current_user', 'list']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                if k == 'password':
                    user.set_password(v)
                else:
                    setattr(user, k, v)
            user.save()

        return Response(serializers.UserSerializer(user).data)


class GenreViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Genre.objects.filter(active=True).all()
    serializer_class = serializers.GenreSerializer


class SongViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Song.objects.filter(active=True).all()
    serializer_class = serializers.SongSerializer
