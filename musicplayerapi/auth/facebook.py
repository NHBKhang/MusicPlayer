from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
import requests
from django.contrib.auth import get_user_model
from oauth2_provider.settings import oauth2_settings
from auth import utils
from music.models import User


class FacebookViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], url_path='')
    def facebook_auth(self, request):
        access_token_from_client = request.data.get('access_token')
        if not access_token_from_client:
            return Response({'detail': 'Access token not provided'}, status=status.HTTP_400_BAD_REQUEST)

        facebook_url = f'https://graph.facebook.com/me?access_token={access_token_from_client}&fields=id,name,email,picture'

        response = requests.get(facebook_url)
        if response.status_code != 200:
            return Response({'error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)

        user_info = response.json()
        user_email = user_info.get('email')
        user_name = user_info.get('name')
        user_picture = user_info.get('picture', {}).get('data', {}).get('url')

        if not user_email:
            return Response({'detail': 'Email not found in access token'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            username=user_email,
            defaults={'first_name': user_name, 'email': user_email, 'avatar': utils.upload_image_from_url(user_picture)}
        )

        access_token, refresh_token = utils.create_user_token(user=user)

        return Response({
            'created': created,
            'token': {
                'access_token': access_token.token,
                'expires_in': oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS,
                'refresh_token': refresh_token.token,
                'token_type': 'Bearer',
                'scope': access_token.scope,
            }
        })
