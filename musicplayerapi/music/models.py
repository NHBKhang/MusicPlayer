from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import TemporaryUploadedFile
from django.db import models
from django.conf import settings
from music.validate import validate_audio_file
import imghdr


class ImageBaseModel(models.Model):
    image = CloudinaryField(null=True, resource_type='image', blank=True)

    class Meta:
        abstract = True

    def clean(self):
        super().clean()
        if self.image and isinstance(self.image, TemporaryUploadedFile):
            file_type = imghdr.what(self.image.file)
            if file_type not in ['jpeg', 'png', 'gif']:
                raise ValidationError("File uploaded must be an image (JPEG, PNG, or GIF).")


class User(AbstractUser):
    avatar = CloudinaryField(null=True, blank=True, resource_type='image')

    def __str__(self):
        if self.username:
            return self.username

    def clean(self):
        super().clean()
        if self.avatar and isinstance(self.avatar, TemporaryUploadedFile):
            file_type = imghdr.what(self.avatar.file)
            if file_type not in ['jpeg', 'png', 'gif']:
                raise ValidationError("File uploaded must be an image (JPEG, PNG, or GIF).")


class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='info')
    display_name = models.CharField(max_length=30, null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    verified = models.BooleanField(default=False)

    def __str__(self):
        if self.display_name:
            return self.display_name

        return super().__str__()


class BaseModel(models.Model):
    updated_date = models.DateTimeField(auto_now=True, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True
        ordering = ['-id']

    def __str__(self):
        if self.name:
            return self.name


class Genre(BaseModel):
    name = models.CharField(max_length=25, unique=True)

    def __str__(self):
        return self.name


class Song(ImageBaseModel, BaseModel):
    title = models.CharField(max_length=255, null=False, blank=False)
    uploader = models.ForeignKey(User, related_name='songs', on_delete=models.CASCADE, null=False, blank=False)
    file = models.FileField(upload_to='songs/', validators=[validate_audio_file])
    artists = models.CharField(max_length=100, null=True, blank=True)
    genres = models.ManyToManyField(Genre, related_name='songs', null=True, blank=True)
    lyrics = models.TextField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.artists is None or self.artists.strip() == '':
            self.artists = 'Various artists'

        super().save(*args, **kwargs)


class Playlist(BaseModel, ImageBaseModel):
    ALBUM = 1
    SINGLE = 2
    EP = 3
    PLAYLIST = 4

    PLAYLIST_TYPE_CHOICES = [
        (ALBUM, 'Album'),
        (SINGLE, 'Single'),
        (EP, 'EP'),
        (PLAYLIST, 'Playlist'),
    ]

    title = models.CharField(max_length=255, null=False, blank=False)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists')
    description = models.TextField(blank=True, null=True)
    genres = models.ManyToManyField(Genre, related_name='playlists')
    is_public = models.BooleanField(default=True)
    playlist_type = models.IntegerField(choices=PLAYLIST_TYPE_CHOICES, default=PLAYLIST)
    published_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.get_playlist_type_display()})"


class PlaylistDetails(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name='details')
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='playlists')
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']
        unique_together = [['playlist', 'song']]
        verbose_name = "playlist detail"
        verbose_name_plural = "playlists details"

    def __str__(self):
        return f"{self.song.title} thuộc {self.playlist.title} ở vị trí {self.order}"


class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)

    class Meta:
        abstract = True
        ordering = ('-created_date',)
        unique_together = ('song', 'user')


class Stream(models.Model):
    streamed_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='streams')

    def __str__(self):
        return f"{self.song.title} đã phát trực tuyến vào {self.streamed_at}"

    class Meta:
        ordering = ('-streamed_at',)


class Comment(Interaction):
    content = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.user} đã bình luận {self.song}'


class Like(Interaction):
    def __str__(self):
        return f'{self.user} đã thích {self.song}'


class Transaction(models.Model):
    transaction_id = models.BigIntegerField(null=False, blank=False)
    transaction_date = models.DateTimeField(auto_now_add=True)
    bank_code = models.CharField(max_length=20, null=False, blank=False)
    description = models.TextField(null=False)

    def __str__(self):
        return self.bank_code + str(self.transaction_id)


class Follow(BaseModel):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    followed = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('follower', 'followed')
        verbose_name = 'Follow'
        verbose_name_plural = 'Follows'

    def __str__(self):
        return f"{self.follower} theo dõi {self.followed}"
