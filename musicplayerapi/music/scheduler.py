from apscheduler.schedulers.background import BackgroundScheduler
from django.utils import timezone
from music.models import Song, MusicVideo


def release_scheduled_items():
    now = timezone.now()

    scheduled_songs = Song.objects.filter(is_public=Song.SCHEDULED, release_date__lte=now)
    for song in scheduled_songs:
        song.is_public = Song.PUBLIC
        song.release_date = None
        song.save()


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(release_scheduled_items, 'interval', minutes=10)  # Runs every 10 minutes
    scheduler.start()
