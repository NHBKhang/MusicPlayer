from rest_framework import serializers
from music.models import *


class PublicUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url if instance.avatar else ''

        return rep

    def get_name(self, user):
        # if user.user_info and user.user_info.display_name:
        #     return user.user_info.display_name
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
        fields = '__all__'


class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = '__all__'
