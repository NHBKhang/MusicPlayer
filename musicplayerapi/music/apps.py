from django.apps import AppConfig
import os


class MusicConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'music'

    def ready(self):
        import music.signals
        if os.environ.get('RUN_MAIN', None) != 'true':
            return
        from music.scheduler import start_scheduler
        start_scheduler()
