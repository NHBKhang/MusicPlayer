# Generated by Django 5.0.7 on 2024-08-09 11:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0007_song_duration_song_lyrics_alter_song_file'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='song',
            name='duration',
        ),
    ]
