from rest_framework import serializers
from music.models import *


class ImageSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['image'] = instance.image.url

        return rep


class PublicUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url if instance.avatar else ''

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
    genres = GenreSerializer(many=True)
    likes = serializers.SerializerMethodField()
    streams = serializers.SerializerMethodField()

    def get_likes(self, song):
        return song.like_set.count()

    def get_streams(self,song):
        return song.streams.count()

    class Meta:
        model = Song
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'outline', 'content', 'created_date', 'updated_date']