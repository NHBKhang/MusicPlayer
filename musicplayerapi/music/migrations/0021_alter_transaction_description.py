# Generated by Django 5.0.7 on 2024-08-24 17:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0020_alter_playlist_published_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
    ]
