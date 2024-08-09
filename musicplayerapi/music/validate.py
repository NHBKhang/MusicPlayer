from django.core.exceptions import ValidationError


def validate_audio_file(value):
    audio_extensions = ['mp3', 'wav', 'ogg', 'flac']
    if not value.name.split('.')[-1].lower() in audio_extensions:
        raise ValidationError('File không phải là định dạng âm thanh hợp lệ.')
