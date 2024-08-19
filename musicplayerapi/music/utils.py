import requests
import cloudinary.uploader
from io import BytesIO
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Q
from oauth2_provider.models import AccessToken, RefreshToken, Application
from oauth2_provider.settings import oauth2_settings
from oauthlib.common import generate_token
from datetime import timedelta
from music.models import Genre, Stream


def upload_image_from_url(image_url):
    response = requests.get(image_url)
    if response.status_code == 200:
        image_data = BytesIO(response.content)
        upload_response = cloudinary.uploader.upload(image_data, use_filename=True, unique_filename=False)
        return upload_response['secure_url']
    return None


def create_user_token(user):
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

    return access_token, refresh_token


def stats():
    return Genre.objects.annotate(counter=Count('songs')).values('id', 'name', 'counter')


def streams_stats(month=None, date=None):
    filter_conditions = Q()

    if month:
        try:
            year, month_number = map(int, month.split('-'))
            filter_conditions &= Q(streamed_at__year=year, streamed_at__month=month_number)
        except ValueError:
            pass

    if date:
        try:
            year, month_number, day_number = map(int, date.split('-'))
            filter_conditions &= Q(streamed_at__year=year, streamed_at__month=month_number, streamed_at__day=day_number)
        except ValueError:
            pass

    streams = Stream.objects.filter(filter_conditions)

    return streams.values('song__title').annotate(counter=Count('id')).order_by('-counter')[:20]
