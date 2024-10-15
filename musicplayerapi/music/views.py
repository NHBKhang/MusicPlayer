from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from music.models import *
from music import serializers, paginators, perms, exceptions, utils
from django.conf import settings
from django.db.models import Count, Max, Q, Prefetch
from django.http import JsonResponse
from django.utils import timezone
from botocore.exceptions import NoCredentialsError
import boto3
import random


class UserViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True).order_by('id')
    serializer_class = serializers.PublicUserSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    pagination_class = paginators.UserPaginator

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return serializers.AuthenticatedUserSerializer

        return self.serializer_class

    def get_queryset(self):
        queries = self.queryset

        if self.request.user.is_authenticated and self.action in ['list']:
            queries = queries.exclude(id=self.request.user.id)

        q = self.request.query_params.get('q')
        if q:
            queries = queries.filter(Q(first_name__icontains=q) |
                                     Q(last_name__icontains=q) |
                                     Q(username__icontains=q) |
                                     Q(info__display_name__icontains=q))

        cate = self.request.query_params.get('cate')
        if cate == '1':
            queries = queries.annotate(num_songs=Count('songs')).order_by('-num_songs')

        follower = self.request.query_params.get('follower')
        if follower:
            queries = queries.filter(followers__follower_id=int(follower))

        return queries.distinct()

    def get_permissions(self):
        if self.action in ['get_current_user', 'patch_current_user']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        try:
            info = UserInfo.objects.get(user=user)
        except UserInfo.DoesNotExist:
            return Response({"detail": "User info not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            return Response(serializers.UserSerializer(user).data)

        if request.method == 'PATCH':
            for k, v in request.data.items():
                if k == 'password':
                    user.set_password(v)
                elif k == 'bio' or k == 'display_name':
                    setattr(info, k, v)
                else:
                    setattr(user, k, v)
            user.save()
            info.save()

            return Response(serializers.UserSerializer(user).data)
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

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
    queryset = Song.objects.filter(active=True, is_public=Song.PUBLIC).order_by('-id').all()
    serializer_class = serializers.SongSerializer
    pagination_class = paginators.SongPaginator
    permission_classes = [perms.SongOwner]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

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
        if self.action in ['like', 'add_comment', 'stream']:
            return [permissions.IsAuthenticated(), ]

        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        queryset = self.queryset.filter(active=True)
        user = self.request.user

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(Q(title__icontains=q) |
                                       Q(artists__icontains=q) |
                                       Q(lyrics__icontains=q))

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

        if self.request.user and self.request.user.is_authenticated:
            private_queryset = Song.objects.filter(
                Q(is_public=Song.PRIVATE) | Q(is_public=Song.SCHEDULED), uploader=self.request.user)
            queryset = queryset | private_queryset

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

    @action(methods=['post', 'patch'], url_path='access', detail=True)
    def song_access(self, request, pk=None):
        if not request.data:
            return Response({'detail': 'Nothing here'}, status=status.HTTP_204_NO_CONTENT)

        song = self.get_object()

        try:
            access = SongAccess.objects.filter(song=song).first()

            if request.method == 'POST' and access:
                return Response({'detail': 'Access already exists. Use PATCH to update.'},
                                status=status.HTTP_400_BAD_REQUEST)

            if request.method == 'POST':
                serializer = serializers.SongAccessSerializer(data=request.data)
            else:
                serializer = serializers.SongAccessSerializer(access, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save(song=song)
                status_code = status.HTTP_201_CREATED if request.method == 'POST' else status.HTTP_200_OK
                return Response(serializer.data, status=status_code)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        try:
            song = self.get_object()
            if request.user.is_authenticated:
                if song.uploader != request.user:
                    if not song.file:
                        return Response({"detail": "Song file not found."}, status=status.HTTP_404_NOT_FOUND)
                    if not song.access.is_downloadable:
                        raise exceptions.NotDownloadableException()
                    if not song.access.is_free and not request.user.has_purchased(song):
                        raise exceptions.PurchaseRequiredException()
            else:
                raise exceptions.AnonymousException()

            s3_bucket = settings.AWS_STORAGE_BUCKET_NAME
            s3_key = song.file.name
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': s3_bucket, 'Key': s3_key},
                ExpiresIn=3600
            )

            return JsonResponse({"download_url": presigned_url})
        except NoCredentialsError:
            return Response({"detail": "Invalid AWS credentials"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Song.DoesNotExist:
            return Response({"detail": "Song not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(e)
            error_message = e.default_detail if hasattr(e, 'default_detail') else str(e)
            error_status = e.status_code if hasattr(e, 'status_code') else status.HTTP_500_INTERNAL_SERVER_ERROR
            return Response({"detail": error_message}, status=error_status)


class PlaylistViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Playlist.objects.filter(active=True, is_public=True).order_by('-id').all()
    serializer_class = serializers.PlaylistSerializer
    pagination_class = paginators.PlaylistPaginator
    permission_classes = [perms.PlaylistOwner]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

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

    @action(methods=['get'], url_path='related', detail=True)
    def related(self, request, pk=None):
        try:
            playlist = Playlist.objects.get(pk=pk)
            user = self.request.user
        except Playlist.DoesNotExist:
            return Response({'detail': 'Playlist not found.'}, status=status.HTTP_404_NOT_FOUND)

        related_playlists = Playlist.objects.none()

        if user.is_authenticated:
            related_playlists = Playlist.objects.filter(creator=user).exclude(id=playlist.id)[:3]

        serializer = serializers.PlaylistSerializer(related_playlists, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


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

        random.shuffle(combined_results)

        paginator = paginators.CombinedResultsPaginator()
        paginated_results = paginator.paginate_queryset(combined_results, request)

        return Response(paginator.get_paginated_response(paginated_results).data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = serializers.NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.NotificationPagination

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(user=user)

    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = request.data.get('is_read', notification.is_read)
        notification.save()

        return Response({'status': 'Notification marked as read'}, status=status.HTTP_200_OK)


class MusicVideoViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = MusicVideo.objects.filter(active=True, is_public=MusicVideo.PUBLIC).order_by('-id').all()
    serializer_class = serializers.MusicVideoSerializer
    pagination_class = paginators.MusicVideoPaginator
    permission_classes = [perms.MusicVideoOwner]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update', 'retrieve', 'create']:
            if self.request.user.is_authenticated:
                return serializers.AuthenticatedMusicVideoSerializer
            return serializers.DetailsMusicVideoSerializer
        return self.serializer_class

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = self.queryset

        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(title__icontains=q)

        uploader = self.request.query_params.get('uploader')
        if uploader:
            queryset = queryset.filter(uploader_id=int(uploader))

        if self.request.user.is_authenticated:
            private_queryset = MusicVideo.objects.filter(
                Q(is_public=MusicVideo.SCHEDULED) |
                Q(is_public=MusicVideo.PRIVATE)
            ).filter(uploader=self.request.user)
            queryset = queryset | private_queryset

        return queryset.distinct()

    @action(detail=True, methods=['get'])
    def live(self, request, pk=None):
        try:
            from django.utils import timezone
            video = self.get_object()
            now = timezone.now()
            if video.is_public == MusicVideo.SCHEDULED and video.release_date <= now:
                video.is_public = MusicVideo.PUBLIC
                video.save()
                return Response({
                    "status": "live",
                    "video": serializers.DetailsMusicVideoSerializer(video).data
                })

            return Response({
                "status": "pending",
                "video": serializers.DetailsMusicVideoSerializer(video).data
            })
        except MusicVideo.DoesNotExist:
            return Response({"detail": "Video not found"}, status=404)

    @action(detail=False, methods=['get'], url_path='live-videos')
    def live_videos(self, request):
        now = timezone.now()
        live_videos = MusicVideo.objects.filter(
            is_public=MusicVideo.SCHEDULED, release_date__lte=now
        )
        serializer = serializers.DetailsMusicVideoSerializer(live_videos, many=True)
        return Response(serializer.data)

    @action(methods=['get'], url_path='related', detail=True)
    def related(self, request, pk=None):
        try:
            video = self.get_object()
        except MusicVideo.DoesNotExist:
            return Response({'detail': 'Video not found.'}, status=status.HTTP_404_NOT_FOUND)

        related_video_ids = set()

        if video.song and video.song.genres.exists():
            genre_related_videos = MusicVideo.objects.filter(
                song__genres__in=video.song.genres.all()
            ).exclude(id=video.id).values_list('id', flat=True)[:10]
            related_video_ids.update(genre_related_videos)

        if len(related_video_ids) < 3 and video.title:
            artist_related_videos = MusicVideo.objects.filter(
                title__icontains=video.title
            ).exclude(id=video.id).values_list('id', flat=True)[:3]
            related_video_ids.update(artist_related_videos)

        if len(related_video_ids) < 3:
            additional_videos_needed = 3 - len(related_video_ids)
            additional_videos = MusicVideo.objects.exclude(
                id__in=related_video_ids.union({video.id})
            ).values_list('id', flat=True)[:additional_videos_needed]
            related_video_ids.update(additional_videos)

        final_related_videos = MusicVideo.objects.filter(
            id__in=related_video_ids).distinct().order_by('-created_date')[:10]

        if self.request.user.is_authenticated:
            serializer = serializers.AuthenticatedMusicVideoSerializer(final_related_videos, many=True,
                                                                       context={'request': self.request})
        else:
            serializer = serializers.MusicVideoSerializer(final_related_videos, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class ReadOnlySongViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Song.objects.filter(active=True).order_by('-id').all()
    serializer_class = serializers.ReadOnlySongSerializer

    def get_queryset(self):
        queryset = self.queryset

        uploader = self.request.query_params.get('uploader')
        if uploader:
            queryset = queryset.filter(uploader_id=int(uploader))

        return queryset.distinct()


class LiveStreamViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveAPIView):
    queryset = LiveStream.objects.filter(is_active=True).order_by('-id').all()
    serializer_class = serializers.LiveStreamSerializer
    lookup_field = 'session_id'

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return serializers.LiveStreamDetailsSerializer

        return self.serializer_class
