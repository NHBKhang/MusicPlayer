from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from .models import UserInfo, User, Song, Playlist, Like, Follow, Comment, Notification
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


@receiver(post_save, sender=Like)
def create_like_notification(sender, instance, **kwargs):
    if instance.user == instance.song.uploader:
        return

    if instance.active:
        content_type = ContentType.objects.get_for_model(instance.song)
        notification = Notification.objects.filter(
            user=instance.song.uploader,
            content_type=content_type,
            object_id=instance.song.id,
            verb='like'
        ).first()

        if notification:
            notification.message = f'{instance.user} và những người khác đã thích bài hát của bạn.'
            notification.save()
        else:
            Notification.objects.create(
                user=instance.song.uploader,
                message=f'{instance.user} đã thích bài hát của bạn.',
                verb='like',
                content_type=content_type,
                object_id=instance.song.id,
                content_object=instance.song
            )


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, **kwargs):
    if instance.user == instance.song.uploader:
        return

    if instance.active:
        content_type = ContentType.objects.get_for_model(instance.song)
        notification = Notification.objects.filter(
            user=instance.song.uploader,
            content_type=content_type,
            object_id=instance.song.id,
            verb='comment'
        ).first()

        if notification:
            notification.message = f'{instance.user} và những người khác đã bình luận bài hát của bạn.'
            notification.save()
        else:
            Notification.objects.create(
                user=instance.song.uploader,
                message=f'{instance.user} đã bình luận bài hát của bạn.',
                verb='comment',
                content_type=content_type,
                object_id=instance.song.id,
                content_object=instance.song
            )


@receiver(post_save, sender=Follow)
def create_follow_notification(sender, instance, **kwargs):
    if instance.active:
        content_type = ContentType.objects.get_for_model(instance.followed)
        notification = Notification.objects.filter(
            user=instance.followed,
            content_type=content_type,
            object_id=instance.followed.id,
            verb='comment'
        ).first()

        if notification:
            notification.message = f'{instance.follower} và những người khác đã theo dõi bạn.'
            notification.save()
        else:
            Notification.objects.create(
                user=instance.followed,
                message=f'{instance.follower} đã theo dõi bạn.',
                verb='comment',
                content_type=content_type,
                object_id=instance.followed.id,
                content_object=instance.followed
            )
