# Generated by Django 5.1.1 on 2024-09-23 17:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0035_livestream'),
    ]

    operations = [
        migrations.AlterField(
            model_name='livestream',
            name='stream_file',
            field=models.FileField(blank=True, null=True, upload_to='live_streams/'),
        ),
    ]
