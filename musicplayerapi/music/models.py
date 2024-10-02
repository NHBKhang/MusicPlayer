from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import TemporaryUploadedFile
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.conf import settings
from django.utils import timezone
from music.validate import validate_audio_file, validate_video_file
from datetime import datetime
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
        return self.get_name()

    def clean(self):
        super().clean()
        if self.avatar and isinstance(self.avatar, TemporaryUploadedFile):
            file_type = imghdr.what(self.avatar.file)
            if file_type not in ['jpeg', 'png', 'gif']:
                raise ValidationError("File uploaded must be an image (JPEG, PNG, or GIF).")

    def has_purchased(self, song):
        return SongTransaction.objects.filter(user=self, song=song, status=Transaction.COMPLETED).exists()

    def get_name(self):
        if self.info and self.info.display_name:
            return self.info.display_name
        if self.first_name:
            if self.last_name:
                return f'{self.last_name} {self.first_name}'
            else:
                return self.first_name
        return self.username

    # def save(self, *args, **kwargs):
    #     if self.password:
    #         self.password = make_password(self.password)
    #     super().save(*args, **kwargs)


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
    PRIVATE = 1
    PUBLIC = 2
    SCHEDULED = 3

    IS_PUBLIC_CHOICES = [
        (PRIVATE, 'Private'),
        (PUBLIC, 'Public'),
        (SCHEDULED, 'Scheduled'),
    ]

    title = models.CharField(max_length=255, null=False, blank=False)
    uploader = models.ForeignKey(User, related_name='songs', on_delete=models.CASCADE, blank=False)
    file = models.FileField(upload_to='songs/', validators=[validate_audio_file])
    artists = models.CharField(max_length=100, null=True, blank=True)
    genres = models.ManyToManyField(Genre, related_name='songs', blank=True)
    lyrics = models.TextField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    is_public = models.IntegerField(choices=IS_PUBLIC_CHOICES, default=PUBLIC)
    release_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.artists is None or self.artists.strip() == '':
            self.artists = 'Various artists'
        if self.is_public == self.SCHEDULED:
            if not self.release_date:
                raise ValidationError("Release date must be provided when the song is scheduled.")
        else:
            self.release_date = None

        super().save(*args, **kwargs)

    def clean(self):
        if self.is_public == self.SCHEDULED and not self.release_date:
            raise ValidationError("Release date is required when the song is scheduled.")
        if self.is_public != self.SCHEDULED and self.release_date:
            self.release_date = None

        super().clean()

    def has_purchased(self, user):
        return SongTransaction.objects.filter(user=user, song=self, status=Transaction.COMPLETED).exists()


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
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists', null=False, blank=False)
    description = models.TextField(blank=True, null=True)
    genres = models.ManyToManyField(Genre, related_name='playlists')
    is_public = models.BooleanField(default=True)
    playlist_type = models.IntegerField(choices=PLAYLIST_TYPE_CHOICES, default=PLAYLIST)
    published_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.get_playlist_type_display()})"

    def get_type(self):
        type_dict = dict(self.PLAYLIST_TYPE_CHOICES)
        return type_dict.get(self.playlist_type, None)


class PlaylistDetails(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name='details')
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='playlists')
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']
        unique_together = [['playlist', 'song', 'order']]
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


class SongAccess(models.Model):
    song = models.OneToOneField(Song, on_delete=models.CASCADE, related_name='access')
    is_downloadable = models.BooleanField(default=False)
    is_free = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=0, null=True, blank=True, help_text="Price in VND")

    def clean(self):
        if self.is_downloadable:
            if self.is_free and self.price is not None:
                raise ValidationError("Price must be null if the song is free.")
            if not self.is_free and self.price is None:
                raise ValidationError("Price is required if the song is not free.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Access for {self.song.title}"


class Transaction(models.Model):
    CREATED = 1
    COMPLETED = 2
    FAILED = 3

    TRANSACTIONS_CHOICES = [
        (CREATED, 'Created'),
        (COMPLETED, 'Completed'),
        (FAILED, 'Failed'),
    ]

    transaction_id = models.CharField(max_length=50, null=False, blank=False)
    transaction_date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(null=True, blank=True)
    status = models.IntegerField(choices=TRANSACTIONS_CHOICES, default=CREATED)
    payment_method = models.CharField(max_length=20, null=True, blank=True)
    amount_in_vnd = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta:
        abstract = True


class SongTransaction(Transaction):
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='transactions', default=11)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)

    def __str__(self):
        return f'{self.payment_method} - {str(self.transaction_id)} - {self.song.title}'


class Follow(BaseModel):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    followed = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('follower', 'followed')
        verbose_name = 'Follow'
        verbose_name_plural = 'Follows'

    def __str__(self):
        return f"{self.follower} theo dõi {self.followed}"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    verb = models.CharField(max_length=10, default='default')

    def __str__(self):
        return f"Notification for {self.user.username} - {self.message[:20]}"

    class Meta:
        ordering = ['-created_date']


class Video(BaseModel, ImageBaseModel):
    PRIVATE = 1
    PUBLIC = 2
    SCHEDULED = 3

    IS_PUBLIC_CHOICES = [
        (PRIVATE, 'Private'),
        (PUBLIC, 'Public'),
        (SCHEDULED, 'Scheduled'),
    ]

    uploader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_videos')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_public = models.IntegerField(choices=IS_PUBLIC_CHOICES, default=PUBLIC)
    release_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.is_public == self.SCHEDULED:
            if not self.release_date:
                raise ValidationError("Release date must be provided when the song is scheduled.")
        else:
            self.release_date = None

        super().save(*args, **kwargs)

    def clean(self):
        if self.is_public == self.SCHEDULED and not self.release_date:
            raise ValidationError("Release date is required when the song is scheduled.")
        if self.is_public != self.SCHEDULED and self.release_date:
            self.release_date = None

        super().clean()

    class Meta:
        ordering = ['-created_at']
        abstract = True


class MusicVideo(Video):
    file = models.FileField(upload_to='videos/', validators=[validate_video_file])
    song = models.OneToOneField(Song, on_delete=models.CASCADE, related_name='mv')

    class Meta:
        verbose_name = 'Music Video'
        verbose_name_plural = 'Music Videos'


class LiveStream(models.Model):
    session_id = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, null=True, blank=True)
    file = models.FileField(upload_to='live_streams/', null=True, blank=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Live Stream {self.session_id} by {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.title:
            self.title = self.__str__()
        super().save(*args, **kwargs)


class LiveStreamChat(models.Model):
    content = models.CharField(max_length=512)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='live_stream_chats')
    live_stream = models.ForeignKey(LiveStream, on_delete=models.CASCADE, related_name='live_stream_chats')

    def __str__(self):
        return f"{self.user.get_name()} chat in {self.live_stream.session_id}"


class PremiumSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='premium_subscription')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.get_name()} - Premium Subscription"

    def check_is_active(self):
        if self.end_date and self.end_date < timezone.now():
            self.is_active = False
            self.save()
        return self.is_active

    def extend_subscription(self, subscription_type):
        if subscription_type == 'daily':
            duration_days = 1
        elif subscription_type == 'monthly':
            duration_days = 30
        elif subscription_type == 'yearly':
            duration_days = 365
        else:
            raise ValueError("Invalid subscription type. Must be 'daily', 'monthly', or 'yearly'.")

        if self.end_date:
            self.end_date += timezone.timedelta(days=duration_days)
        else:
            self.end_date = timezone.now() + timezone.timedelta(days=duration_days)

        self.is_active = True
        self.save()

    def get_remaining_days(self):
        if self.end_date:
            return max((self.end_date - timezone.now()).days, 0)
        return 0


class PremiumTransaction(Transaction):
    premium_subscription = models.ForeignKey(PremiumSubscription, on_delete=models.CASCADE, related_name='transactions',
                                             null=True, blank=True)
    type = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return f'{self.payment_method} - {str(self.transaction_id)} - Premium Subscription'
