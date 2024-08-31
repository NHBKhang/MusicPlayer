from rest_framework import serializers
from music.models import *
import cloudinary


class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = ['bio', 'verified']


class PublicUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    info = UserInfoSerializer()
    followers = serializers.SerializerMethodField()
    following = serializers.SerializerMethodField()
    songs = serializers.SerializerMethodField()

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url if instance.avatar else \
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlfqFFx7I61FM-RVN76_PLzbkZ-oWWvdxvNA&s'

        return rep

    def get_name(self, user):
        if user.info and user.info.display_name:
            return user.info.display_name
        if user.first_name:
            if user.last_name:
                return f'{user.last_name} {user.first_name}'
            else:
                return user.first_name

        return user.username

    def get_followers(self, user):
        return user.followers.filter(active=True).count()

    def get_following(self, user):
        return user.following.filter(active=True).count()

    def get_songs(self, user):
        return user.songs.filter(active=True).count()

    class Meta:
        model = User
        fields = ['id', 'name', 'avatar', 'username', 'first_name', 'last_name', 'info', 'followers', 'following',
                  'songs', 'last_login']


class UserSerializer(PublicUserSerializer):
    def create(self, validated_data):
        data = validated_data.copy()

        user = User(**data)
        user.set_password(data["password"])
        user.save()

        return user

    class Meta:
        model = PublicUserSerializer.Meta.model
        fields = (PublicUserSerializer.Meta.fields +
                  ['email', 'password'])
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


class AuthenticatedUserSerializer(PublicUserSerializer):
    followed = serializers.SerializerMethodField()

    def get_followed(self, user):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return user.followers.filter(follower=request.user, active=True).exists()
        return False

    class Meta:
        model = PublicUserSerializer.Meta.model
        fields = PublicUserSerializer.Meta.fields + ['followed']


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']


class SongSerializer(serializers.ModelSerializer):
    uploader = PublicUserSerializer(read_only=True)
    likes = serializers.SerializerMethodField()
    streams = serializers.SerializerMethodField()

    def get_likes(self, song):
        return song.like_set.filter(active=True).count()

    def get_streams(self, song):
        return song.streams.count()

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if type(instance.image) is cloudinary.CloudinaryResource:
            rep['image'] = instance.image.url
        elif instance.uploader.avatar:
            rep['image'] = instance.uploader.avatar.url
        else:
            rep['image'] = 'https://static.vecteezy.com/system/resources/previews/021/693/323/non_2x/a-logo-for-a-music-company-that-is-made-by-song-brand-vector.jpg'

        return rep

    class Meta:
        model = Song
        fields = ['id', 'title', 'uploader', 'image', 'artists', 'file', 'likes', 'streams', 'created_date']


class AuthenticatedSongSerializer(SongSerializer):
    liked = serializers.SerializerMethodField()
    followed = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    def get_liked(self, song):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return song.like_set.filter(user=request.user, active=True).exists()
        return False

    def get_followed(self, song):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return song.uploader.followers.filter(follower=request.user, active=True).exists()
        return False

    def get_is_owner(self, song):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return song.uploader == request.user
        return False

    class Meta:
        model = SongSerializer.Meta.model
        fields = SongSerializer.Meta.fields + ['liked', 'followed', 'is_owner']


class SongDetailsSerializer(SongSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    genre_ids = serializers.ListField(write_only=True, child=serializers.IntegerField(), required=False)
    uploader_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='uploader', write_only=True, required=False)
    comments = serializers.SerializerMethodField(read_only=True)

    def get_comments(self, song):
        return song.comment_set.count()

    def create(self, validated_data):
        genre_ids = validated_data.pop('genre_ids', [])
        uploader_id = validated_data.pop('uploader_id', None)
        if uploader_id:
            validated_data['uploader'] = uploader_id
        song = super().create(validated_data)
        if genre_ids:
            song.genres.set(genre_ids)

        return song

    def update(self, instance, validated_data):
        genre_ids = validated_data.pop('genre_ids', [])
        instance = super().update(instance, validated_data)
        if genre_ids:
            instance.genres.set(genre_ids)

        return instance

    class Meta:
        model = SongSerializer.Meta.model
        fields = SongSerializer.Meta.fields + ['genres', 'genre_ids', 'comments', 'lyrics', 'description',
                                               'uploader_id']


class AuthenticatedSongDetailsSerializer(SongDetailsSerializer, AuthenticatedSongSerializer):
    class Meta:
        model = SongDetailsSerializer.Meta.model
        fields = SongDetailsSerializer.Meta.fields + AuthenticatedSongSerializer.Meta.fields


class PlaylistDetailsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    song = serializers.SerializerMethodField()

    def get_song(self, detail):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return AuthenticatedSongSerializer(detail.song, context={'request': request}).data

        return SongSerializer(detail.song).data

    class Meta:
        model = PlaylistDetails
        fields = ['id', 'song', 'order']


class PlaylistSerializer(serializers.ModelSerializer):
    creator = PublicUserSerializer(read_only=True)
    creator_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='creator', write_only=True, required=False)
    details = PlaylistDetailsSerializer(many=True, required=False)
    details_list = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    type = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    def get_is_owner(self, playlist):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return playlist.creator == request.user
        return False

    def get_type(self, playlist):
        if playlist.playlist_type:
            return playlist.get_type()
        return None

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if type(instance.image) is cloudinary.CloudinaryResource:
            rep['image'] = instance.image.url
        elif instance.details.count() == 0:
            rep['image'] = 'https://cdn.getmidnight.com/b5a0b552ae89a91aa34705031852bd16/2022/08/1_1---2022-08-24T165236.013-1.png'

        return rep

    class Meta:
        model = Playlist
        fields = ['id', 'title', 'image', 'creator_id', 'creator', 'details', 'is_public', 'is_owner', 'type',
                  'playlist_type', 'details_list']

    def create(self, validated_data):
        creator_id = validated_data.pop('creator_id', None)
        details = validated_data.pop('details_list', [])
        if creator_id:
            validated_data['creator'] = creator_id
        playlist = super().create(validated_data)

        if details:
            for detail_data in details:
                if isinstance(detail_data, str):
                    import json
                    detail_data = json.loads(detail_data)

                song_id = detail_data.get('song')
                if song_id:
                    try:
                        song = Song.objects.get(id=song_id)
                    except Song.DoesNotExist:
                        continue

                    PlaylistDetails.objects.create(
                        playlist=playlist,
                        song=song,
                        order=detail_data.get('order', 1))
                else:
                    continue

        return playlist


class PlaylistSongsSerializer(PlaylistSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    genre_ids = serializers.ListField(write_only=True, child=serializers.IntegerField(), required=False)

    def create(self, validated_data):
        genre_ids = validated_data.pop('genre_ids', [])
        playlist = super().create(validated_data)

        if genre_ids:
            playlist.genres.set(genre_ids)

        return playlist

    def update(self, instance, validated_data):
        genre_ids = validated_data.pop('genre_ids', [])
        details = validated_data.pop('details_list', [])
        published_date = validated_data.pop('published_date', None)
        instance = super().update(instance, validated_data)

        if genre_ids:
            instance.genres.set(genre_ids)
        instance.published_date = published_date
        instance.save()

        if details:
            updated_ids = []
            for detail_data in details:
                if isinstance(detail_data, str):
                    import json
                    detail_data = json.loads(detail_data)
                detail_id = detail_data.get('id')
                if detail_id:
                    try:
                        playlist_detail = PlaylistDetails.objects.get(id=detail_id, playlist=instance)
                        playlist_detail.song_id = detail_data.get('song_id', playlist_detail.song_id)
                        playlist_detail.order = detail_data.get('order', playlist_detail.order)
                        playlist_detail.save()
                        updated_ids.append(detail_id)
                    except PlaylistDetails.DoesNotExist:
                        pass
                else:
                    PlaylistDetails.objects.create(playlist=instance, **detail_data)

            PlaylistDetails.objects.filter(playlist=instance).exclude(id__in=updated_ids).delete()

        return instance

    class Meta:
        model = PlaylistSerializer.Meta.model
        fields = PlaylistSerializer.Meta.fields + ['genres', 'genre_ids', 'description', 'created_date',
                                                   'published_date']


class CommentSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'song', 'content', 'created_date', ]
