# Generated by Django 5.0.7 on 2024-09-04 17:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0022_song_is_public_alter_playlistdetails_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='is_downloadable',
            field=models.BooleanField(default=False),
        ),
    ]
