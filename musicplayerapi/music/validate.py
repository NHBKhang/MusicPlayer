from django.core.exceptions import ValidationError


def validate_audio_file(value):
    audio_extensions = ['mp3', 'wav', 'ogg', 'flac']
    if not value.name.split('.')[-1].lower() in audio_extensions:
        raise ValidationError('File không phải là định dạng âm thanh hợp lệ. Hãy upload file .mp3, .wav, .ogg, hoặc .flac.')


def validate_video_file(value):
    if not value.name.endswith(('.mp4', '.avi', '.mov', '.mkv')):
        raise ValidationError('File không phải là định dạng âm video hợp lệ. Hãy upload file .mp4, .avi, .mov, hoặc .mkv.')

    if value.size > 104857600:
        raise ValidationError('Video file size exceeds the limit of 100 MB.')
