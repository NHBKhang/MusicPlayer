# Generated by Django 5.0.7 on 2024-08-11 17:10

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0011_alter_stream_user'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_id', models.BigIntegerField()),
                ('transaction_date', models.DateTimeField(auto_now_add=True)),
                ('bank_code', models.CharField(max_length=20)),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Playlist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('updated_date', models.DateTimeField(auto_now=True, null=True)),
                ('created_date', models.DateTimeField(auto_now_add=True, null=True)),
                ('active', models.BooleanField(default=True)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('is_public', models.BooleanField(default=True)),
                ('playlist_type', models.IntegerField(choices=[(1, 'Album'), (2, 'Single'), (3, 'EP'), (4, 'Playlist')], default=4)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playlists', to=settings.AUTH_USER_MODEL)),
                ('genres', models.ManyToManyField(related_name='playlists', to='music.genre')),
            ],
            options={
                'ordering': ['-id'],
                'abstract': False,
            },
        ),
    ]
