from django.db import models
from cloudinary.models import CloudinaryField


class ImageBaseModel(models.Model):
    image = CloudinaryField(null=True)

    class Meta:
        abstract = True


class User(AbstractUser):
    avatar = CloudinaryField(null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    display_name = models.CharField(max_length=30, null=True, blank=True)

    def __str__(self):
        return self.username


class BaseModel(models.Model):
    updated_date = models.DateTimeField(auto_now=True)
    created_date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True
        ordering = ['-id']

    def __str__(self):
        if self.name:
            return self.name


class Category(BaseModel):
    name = models.CharField(max_length=25, unique=True)


class Song(models.Model):
    title = models.CharField(max_length=250, null=False, blank=False)

    def __str__(self):
        return self.title


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
