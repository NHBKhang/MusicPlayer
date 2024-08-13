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


class PublicUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

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

    class Meta:
        model = User
        fields = ['id', 'name', 'avatar', 'username']


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
                  ['first_name', 'last_name', 'email', 'password', 'last_login'])
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


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
        fields = ['id', 'title', 'uploader', 'image', 'artists', 'file', 'likes', 'streams']


class AuthenticatedSongSerializer(SongSerializer):
    liked = serializers.SerializerMethodField()

    def get_liked(self, song):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return song.like_set.filter(user=request.user, active=True).exists()
        return False

    class Meta:
        model = SongSerializer.Meta.model
        fields = SongSerializer.Meta.fields + ['liked', ]


class SongDetailsSerializer(SongSerializer):
    genres = GenreSerializer(many=True)
    comments = serializers.SerializerMethodField()

    def get_comments(self, song):
        return song.comment_set.count()

    class Meta:
        model = SongSerializer.Meta.model
        fields = SongSerializer.Meta.fields + ['created_date', 'genres', 'comments', 'lyrics', 'description']


class AuthenticatedSongDetailsSerializer(SongDetailsSerializer, AuthenticatedSongSerializer):
    class Meta:
        model = SongDetailsSerializer.Meta.model
        fields = SongDetailsSerializer.Meta.fields + AuthenticatedSongSerializer.Meta.fields


class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ['id', 'title', 'description', 'creator', ]


class CommentSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'song', 'content', 'created_date', ]
