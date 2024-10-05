# Generated by Django 5.1.1 on 2024-10-05 08:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('music', '0045_song_music_song_title_29a1e4_idx_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='playlist',
            options={},
        ),
        migrations.AlterModelOptions(
            name='user',
            options={},
        ),
        migrations.AddIndex(
            model_name='playlist',
            index=models.Index(fields=['title'], name='playlist_title_idx'),
        ),
        migrations.AddIndex(
            model_name='playlist',
            index=models.Index(fields=['creator'], name='playlist_creator_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['username'], name='user_username_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['email'], name='user_email_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['first_name'], name='user_first_name_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['last_name'], name='user_last_name_idx'),
        ),
    ]
