# Generated by Django 5.1.1 on 2024-10-02 12:58

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0037_rename_stream_file_livestream_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='livestream',
            name='title',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='userinfo',
            name='is_artist',
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name='LiveStreamChat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.CharField(max_length=512)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('live_stream', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='live_stream_chats', to='music.livestream')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='live_stream_chats', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
