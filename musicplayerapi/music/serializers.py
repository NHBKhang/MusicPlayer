from rest_framework import serializers
from music.models import *
import cloudinary


class ImageSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if type(instance.image) is cloudinary.CloudinaryResource:
            rep['image'] = instance.image.url
        else:
            rep['image'] = instance.image

        return rep


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


class SongSerializer(ImageSerializer):
    uploader = PublicUserSerializer(read_only=True)
    likes = serializers.SerializerMethodField()
    streams = serializers.SerializerMethodField()

    def get_likes(self, song):
        return song.like_set.filter(active=True).count()

    def get_streams(self, song):
        return song.streams.count()

    class Meta:
        model = Song
        fields = ['id', 'title', 'uploader', 'image', 'artists', 'file', 'likes', 'streams', 'created_date']


class AuthenticatedSongSerializer(SongSerializer):
    liked = serializers.SerializerMethodField()
    followed = serializers.SerializerMethodField()

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

    class Meta:
        model = SongSerializer.Meta.model
        fields = SongSerializer.Meta.fields + ['liked', 'followed']


class SongDetailsSerializer(SongSerializer):
    genres = GenreSerializer(many=True)
    comments = serializers.SerializerMethodField()

    def get_comments(self, song):
        return song.comment_set.count()

    class Meta:
        model = SongSerializer.Meta.model
        fields = SongSerializer.Meta.fields + ['genres', 'comments', 'lyrics', 'description']


class AuthenticatedSongDetailsSerializer(SongDetailsSerializer, AuthenticatedSongSerializer):
    class Meta:
        model = SongDetailsSerializer.Meta.model
        fields = SongDetailsSerializer.Meta.fields + AuthenticatedSongSerializer.Meta.fields


class PlaylistDetailsSerializer(serializers.ModelSerializer):
    song = serializers.SerializerMethodField()

    def get_song(self, detail):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return AuthenticatedSongSerializer(detail.song, context={'request': request}).data

        return SongSerializer(detail.song).data

    class Meta:
        model = PlaylistDetails
        fields = ['id', 'song']


class PlaylistSerializer(ImageSerializer):
    creator = PublicUserSerializer(read_only=True)
    details = PlaylistDetailsSerializer(many=True)

    class Meta:
        model = Playlist
        fields = ['id', 'title', 'image', 'creator', 'details']


class PlaylistSongsSerializer(PlaylistSerializer):
    genres = GenreSerializer(many=True)

    class Meta:
        model = PlaylistSerializer.Meta.model
        fields = PlaylistSerializer.Meta.fields + ['genres', 'description', 'playlist_type', 'created_date',
                                                   'published_date', 'is_public']


class CommentSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'song', 'content', 'created_date', ]
