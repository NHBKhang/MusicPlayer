# Generated by Django 5.0.7 on 2024-08-08 16:19

import music.validate
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0006_stream_comment_like'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='duration',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='song',
            name='lyrics',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='song',
            name='file',
            field=models.FileField(upload_to='songs/', validators=[music.validate.validate_audio_file]),
        ),
    ]
