from django.db import models
from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser


class ImageBaseModel(models.Model):
    image = CloudinaryField(null=True)

    class Meta:
        abstract = True


class User(AbstractUser):
    avatar = CloudinaryField(null=True, blank=True)

    def __str__(self):
        if self.username:
            return self.username


class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='info')
    display_name = models.CharField(max_length=30, null=True, blank=True)
    bio = models.TextField(blank=True, null=True)

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
    file = models.FileField(upload_to='songs/')
    artists = models.CharField(max_length=100, null=True, blank=True)
    genres = models.ManyToManyField(Genre, related_name='songs', null=True, blank=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.artists is None:
            self.artists = 'Various artists'
        return super(Song, self).save(*args, **kwargs)


class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        abstract = True
        ordering = ('-created_date',)


# class Comment(Interaction):
#     content = models.CharField(max_length=255)
#
#     def __str__(self):
#         return f'{self.user} đã bình luận {self}'
#
#
# class Like(Interaction):
#     class Meta:
#         unique_together = ('outline', 'user')
#
#     def __str__(self):
#         return f'{self.user} đã thích {self}'
