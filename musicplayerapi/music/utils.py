import requests
import cloudinary.uploader
from io import BytesIO
from django.core.files.base import ContentFile


def upload_image_from_url(image_url):
    # Tải ảnh từ URL
    response = requests.get(image_url)
    if response.status_code == 200:
        image_data = BytesIO(response.content)
        upload_response = cloudinary.uploader.upload(image_data, use_filename=True, unique_filename=False)
        return upload_response['secure_url']
    return None
