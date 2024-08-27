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
    uploader_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='uploader', write_only=True, required=False
    )
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
        fields = ['id', 'title', 'uploader', 'uploader_id', 'image', 'artists', 'file', 'likes', 'streams', 'created_date']

    def create(self, validated_data):
        uploader_id = validated_data.pop('uploader_id', None)
        if uploader_id:
            validated_data['uploader'] = uploader_id

        return super().create(validated_data)


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

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.uploader == request.user
        return False

    class Meta:
        model = SongSerializer.Meta.model
        fields = SongSerializer.Meta.fields + ['liked', 'followed', 'is_owner']


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


class PlaylistSerializer(serializers.ModelSerializer):
    creator = PublicUserSerializer(read_only=True)
    details = PlaylistDetailsSerializer(many=True)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if type(instance.image) is cloudinary.CloudinaryResource:
            rep['image'] = instance.image.url
        elif instance.details.count() == 0:
            rep[
                'image'] = 'https://cdn.getmidnight.com/b5a0b552ae89a91aa34705031852bd16/2022/08/1_1---2022-08-24T165236.013-1.png'

        return rep

    class Meta:
        model = Playlist
        fields = ['id', 'title', 'image', 'creator', 'details', 'is_public']


class PlaylistSongsSerializer(PlaylistSerializer):
    genres = GenreSerializer(many=True)

    class Meta:
        model = PlaylistSerializer.Meta.model
        fields = PlaylistSerializer.Meta.fields + ['genres', 'description', 'playlist_type', 'created_date',
                                                   'published_date']


class CommentSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'song', 'content', 'created_date', ]
