from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from google.auth.transport import requests
from google.oauth2 import id_token
from django.contrib.auth import get_user_model
from oauth2_provider.settings import oauth2_settings
from auth import utils
from music.models import User


class GoogleViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], url_name='')
    def google_auth(self, request):
        id_token_from_client = request.data.get('id_token')
        if not id_token_from_client:
            return Response({'detail': 'Mã xác thực không được cung cấp'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = id_token.verify_oauth2_token(id_token_from_client, requests.Request())

            user_email = idinfo.get('email')
            user_name = idinfo.get('name')
            user_picture = idinfo.get('picture')

            if not user_email:
                return Response({'detail': 'Không tìm thấy email trong mã xác thực'}, status=status.HTTP_400_BAD_REQUEST)

            user, created = User.objects.get_or_create(
                username=user_email,
                defaults={'first_name': user_name, 'email': user_email,
                          'avatar': utils.upload_image_from_url(user_picture)}
            )

            access_token, refresh_token = utils.create_user_token(user=user)

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
            return Response({'detail': 'Xác thực không thành công', 'details': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
