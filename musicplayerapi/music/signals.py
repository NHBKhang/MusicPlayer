from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from .models import UserInfo, User, Song, Playlist
import cloudinary
import cloudinary.uploader
import boto3


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        UserInfo.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.info.save()


@receiver(post_delete, sender=Song)
def delete_song_image(sender, instance, **kwargs):
    if hasattr(instance.image, 'public_id'):
        public_id = instance.image.public_id
        cloudinary.uploader.destroy(public_id, resource_type='image')

@receiver(post_delete, sender=Playlist)
def delete_playlist_image(sender, instance, **kwargs):
    if hasattr(instance.image, 'public_id'):
        public_id = instance.image.public_id
        cloudinary.uploader.destroy(public_id, resource_type='image')


@receiver(post_delete, sender=User)
def delete_cloudinary_avatar(sender, instance, **kwargs):
    if hasattr(instance, 'avatar') and instance.avatar:
        CloudinaryImage(instance.avatar).delete()


@receiver(post_delete, sender=Song)
def delete_s3_file(sender, instance, **kwargs):
    if instance.file:
        s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                          region_name=settings.AWS_S3_REGION_NAME)
        s3.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=instance.file.name)
