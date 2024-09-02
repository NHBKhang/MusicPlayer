from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from rest_framework import serializers as rest_serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from music.models import *
from music import serializers, paginators, perms, utils
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.contrib.auth import update_session_auth_hash
from django.db.models import Count, Max, Q, Prefetch
from google.oauth2 import id_token
from google.auth.transport import requests as gg_requests
from oauth2_provider.settings import oauth2_settings
import requests


@api_view(['POST'])
def google_login(request):
    id_token_from_client = request.data.get('id_token')
    if not id_token_from_client:
        return Response({'error': 'Mã xác thực không được cung cấp'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        idinfo = id_token.verify_oauth2_token(id_token_from_client, gg_requests.Request())

        user_email = idinfo.get('email')
        user_name = idinfo.get('name')
        user_picture = idinfo.get('picture')
        if not user_email:
            return Response({'error': 'Không tìm thấy email trong mã xác thực'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            username=user_email,
            defaults={'first_name': user_name, 'email': user_email,
                      'avatar': utils.upload_image_from_url(user_picture)})

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
        return Response({'error': 'Xác thực không thành công', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def facebook_login(request):
    access_token = request.data.get('access_token')
    if not access_token:
        return Response({'error': 'Access token not provided'}, status=status.HTTP_400_BAD_REQUEST)

    facebook_url = f'https://graph.facebook.com/me?access_token={access_token}&fields=id,name,email,picture'

    response = requests.get(facebook_url)
    if response.status_code != 200:
        return Response({'error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)

    user_info = response.json()
    user_email = user_info.get('email')
    user_name = user_info.get('name')
    user_picture = user_info.get('picture', {}).get('data', {}).get('url')

    if not user_email:
        return Response({'error': 'Email not found in access token'}, status=status.HTTP_400_BAD_REQUEST)

    user, created = User.objects.get_or_create(
        username=user_email,
        defaults={'first_name': user_name, 'email': user_email, 'avatar': utils.upload_image_from_url(user_picture)})

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
    queryset = User.objects.filter(is_active=True).order_by('id')
    serializer_class = serializers.PublicUserSerializer
    parser_classes = [parsers.MultiPartParser, ]
    pagination_class = paginators.UserPaginator

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return serializers.AuthenticatedUserSerializer

        return serializers.UserSerializer

    def get_queryset(self):
        queries = self.queryset

        if self.request.user.is_authenticated:
            queries = queries.exclude(id=self.request.user.id)

        q = self.request.query_params.get('q')
        if q:
            queries = queries.filter(Q(first_name__icontains=q) |
                                     Q(last_name__icontains=q) |
                                     Q(username__icontains=q) |
                                     Q(info__display_name__icontains=q))

        follower = self.request.query_params.get('follower')
        if follower:
            queries = queries.filter(followers__follower_id=int(follower))

        return queries.distinct()

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

    @action(methods=['post'], url_path='follow', detail=True)
    def follow(self, request, pk=None):
        if not request.user.is_authenticated:
            raise AuthenticationFailed("User must be authenticated to like a song")

        user = self.get_object()
        fo, created = Follow.objects.get_or_create(follower=request.user, followed=user)

        fo.active = not fo.active
        if not created:
            fo.save()

        return Response(serializers.AuthenticatedUserSerializer(user, context={'request': request}).data)


class GenreViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Genre.objects.filter(active=True).all()
    serializer_class = serializers.GenreSerializer


class SongViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Song.objects.filter(active=True).order_by('-id').all()
    serializer_class = serializers.SongSerializer
    pagination_class = paginators.SongPaginator
    permission_classes = [perms.SongOwner]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update', 'create']:
            if self.request.user.is_authenticated:
                return serializers.AuthenticatedSongDetailsSerializer
            else:
                return serializers.SongDetailsSerializer
        else:
            if self.request.user.is_authenticated:
                return serializers.AuthenticatedSongSerializer
            else:
                return self.serializer_class

    def get_permissions(self):
        if self.action in ['like', 'add-comment', 'stream']:
            return [permissions.IsAuthenticated(), ]

        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        queryset = self.queryset.filter(active=True)
        user = self.request.user

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(Q(title__icontains=q) |
                                       Q(artists__icontains=q))

        genre = self.request.query_params.get('genre')
        if genre and genre != '0':
            queryset = queryset.filter(genres__exact=int(genre))

        if self.request.query_params.get('likes') and user.is_authenticated:
            queryset = queryset.filter(like__user=user).order_by('-like__created_date')

        cate = self.request.query_params.get('cate')
        if cate == '1':
            queryset = queryset.annotate(num_streams=Count('streams')).order_by('-num_streams')
        elif cate == '2' and user.is_authenticated:
            queryset = (queryset
                        .annotate(latest_streamed_at=Max('streams__streamed_at'))
                        .order_by('-latest_streamed_at'))

        uploader = self.request.query_params.get('uploader')
        if uploader:
            queryset = queryset.filter(uploader_id=uploader)

        return queryset.distinct()

    @action(methods=['post'], url_path='like', detail=True)
    def like(self, request, pk):
        if not request.user.is_authenticated:
            raise AuthenticationFailed("User must be authenticated to like a song")

        song = self.get_object()
        li, created = Like.objects.get_or_create(song=song, user=request.user)

        li.active = not li.active
        if not created:
            li.save()

        return Response(serializers.AuthenticatedSongDetailsSerializer(song, context={'request': request}).data)

    @action(methods=['get'], url_path='comments', detail=True)
    def get_comments(self, request, pk):
        comments = self.get_object().comment_set.select_related('user').all()

        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data,
                        status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='comment', detail=True)
    def add_comment(self, request, pk):
        c = self.get_object().comment_set.create(user=request.user, content=request.data.get('content'))

        return Response(serializers.CommentSerializer(c).data,
                        status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='stream', detail=True)
    def stream(self, request, pk=None):
        try:
            song = self.get_object()
            Stream.objects.create(song=song, user=self.request.user if self.request.user.is_authenticated else None)
            return Response({'message': 'Stream count incremented successfully'}, status=status.HTTP_200_OK)
        except Song.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['get'], url_path='next', detail=True)
    def next(self, request, pk=None):
        try:
            current_song = self.get_object()
            playlist_id = self.request.query_params.get('playlist')

            if playlist_id:
                current_detail = PlaylistDetails.objects.get(playlist_id=playlist_id, song_id=current_song.id)
                next_detail = (PlaylistDetails.objects.filter(playlist_id=playlist_id, order__gt=current_detail.order)
                               .order_by('order').first())

                if next_detail:
                    next_song = next_detail.song
                else:
                    if self.request.query_params.get('loop') == 'playlist':
                        next_song = (PlaylistDetails.objects.filter(playlist_id=playlist_id)
                                     .order_by('order').first().song)
                    else:
                        playlist_id = ''
                        next_song = Song.objects.filter(active=True, id__gt=current_song.id).first()
                        if not next_song:
                            next_song = Song.objects.filter(active=True).first()
            else:
                next_song = Song.objects.filter(active=True, id__gt=current_song.id).first()
                if not next_song:
                    next_song = Song.objects.filter(active=True).first()

            if next_song:
                return Response({
                    "song": self.get_serializer(next_song).data,
                    "playlist_id": playlist_id
                }, status=status.HTTP_200_OK)

            return Response({"detail": "No songs available."}, status=status.HTTP_404_NOT_FOUND)
        except Song.DoesNotExist:
            return Response({"detail": "Song not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['get'], url_path='previous', detail=True)
    def previous(self, request, pk=None):
        try:
            current_song = self.get_object()
            playlist_id = self.request.query_params.get('playlist')

            if playlist_id:
                current_detail = PlaylistDetails.objects.get(playlist_id=playlist_id, song_id=current_song.id)
                previous_detail = (PlaylistDetails.objects
                                   .filter(playlist_id=playlist_id, order__lt=current_detail.order)
                                   .order_by('order').last())

                if previous_detail:
                    previous_song = previous_detail.song
                else:
                    if self.request.query_params.get('loop') == 'playlist':
                        previous_song = (PlaylistDetails.objects.filter(playlist_id=playlist_id)
                                         .order_by('order').last().song)
                    else:
                        playlist_id = ''
                        previous_song = Song.objects.filter(active=True, id__lt=current_song.id).last()
                        if not previous_song:
                            previous_song = Song.objects.filter(active=True).last()
            else:
                previous_song = Song.objects.filter(active=True, id__lt=current_song.id).last()
                if not previous_song:
                    previous_song = Song.objects.filter(active=True).last()

            if previous_song:
                return Response({
                    "song": self.get_serializer(previous_song).data,
                    "playlist_id": playlist_id
                }, status=status.HTTP_200_OK)

            return Response({"detail": "No next song available."}, status=status.HTTP_404_NOT_FOUND)
        except Song.DoesNotExist:
            return Response({"detail": "Song not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['get'], url_path='related', detail=True)
    def related(self, request, pk=None):
        try:
            song = self.get_object()
        except Song.DoesNotExist:
            return Response({'detail': 'Song not found.'}, status=status.HTTP_404_NOT_FOUND)

        related_song_ids = set()

        if song.genres.exists():
            genre_related_songs = Song.objects.filter(
                genres__in=song.genres.all()
            ).exclude(id=song.id).values_list('id', flat=True)[:3]
            related_song_ids.update(genre_related_songs)

        if len(related_song_ids) < 3 and song.artists:
            artist_related_songs = Song.objects.filter(
                artists__icontains=song.artists
            ).exclude(id=song.id).values_list('id', flat=True)[:3]
            related_song_ids.update(artist_related_songs)

        if len(related_song_ids) < 3:
            additional_songs_needed = 3 - len(related_song_ids)
            additional_songs = Song.objects.exclude(
                id__in=related_song_ids.union({song.id})
            ).values_list('id', flat=True)[:additional_songs_needed]
            related_song_ids.update(additional_songs)

        final_related_songs = Song.objects.filter(id__in=related_song_ids).distinct().order_by('-created_date')[:3]

        if self.request.user.is_authenticated:
            serializer = serializers.AuthenticatedSongSerializer(final_related_songs, many=True,
                                                                 context={'request': self.request})
        else:
            serializer = serializers.SongSerializer(final_related_songs, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class PlaylistViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Playlist.objects.filter(active=True, is_public=True).all()
    serializer_class = serializers.PlaylistSerializer
    pagination_class = paginators.PlaylistPaginator
    permission_classes = [perms.PlaylistOwner]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return serializers.PlaylistSongsSerializer

        return self.serializer_class

    def get_queryset(self):
        if self.action == 'destroy':
            return Playlist.objects.all()

        queryset = self.queryset.prefetch_related(
            Prefetch('details', queryset=PlaylistDetails.objects.order_by('order')))

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(Q(title__icontains=q) | Q(creator__songs__title__icontains=q))

        creator = self.request.query_params.get('creator')
        if creator:
            queryset = queryset.filter(creator=int(creator))

        if self.request.user.is_authenticated:
            private_queryset = Playlist.objects.filter(is_public=False, creator=self.request.user)
            queryset = queryset | private_queryset

        type = self.request.query_params.get('type')
        if type and 1 <= int(type) <= 4:
            queryset = queryset.filter(playlist_type=int(type))
        else:
            if (self.action not in ['retrieve', 'update', 'partial_update']
                    and self.request.headers.get('Song-ID') is None):
                queryset = queryset.exclude(playlist_type=Playlist.PLAYLIST)

        return queryset.distinct()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['song_id'] = self.request.headers.get('Song-ID')
        return context


class MixedSearchView(APIView):
    def get(self, request, *args, **kwargs):
        user_id = self.request.query_params.get('user')
        user_id = int(user_id) if user_id else None

        song_viewset = SongViewSet()
        playlist_viewset = PlaylistViewSet()

        song_viewset.request = playlist_viewset.request = self.request
        song_viewset.action = playlist_viewset.action = 'get'

        songs = song_viewset.get_queryset().filter(uploader_id=user_id) \
            if user_id else song_viewset.get_queryset()
        song_serializer = song_viewset.get_serializer_class()(
            songs, many=True, context={'request': self.request})

        playlists = playlist_viewset.get_queryset().filter(creator_id=user_id) \
            if user_id else playlist_viewset.get_queryset()
        playlist_serializer = playlist_viewset.get_serializer_class()(
            playlists, many=True, context={'request': self.request})

        combined_results = [{'type': 'song', **item} for item in song_serializer.data] + \
                           [{'type': 'playlist', **item} for item in playlist_serializer.data]

        if not user_id:
            artist_viewset = UserViewSet()
            artist_viewset.request = self.request
            artist_viewset.action = 'get'

            artists = artist_viewset.get_queryset()
            artist_serializer = artist_viewset.get_serializer_class()(
                artists, many=True, context={'request': self.request})

            combined_results += [{'type': 'artist', **item} for item in artist_serializer.data]

        paginator = paginators.CombinedResultsPaginator()
        paginated_results = paginator.paginate_queryset(combined_results, request)

        return Response(paginator.get_paginated_response(paginated_results).data)