from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DialogflowViewSet

router = DefaultRouter()
router.register(r'dialogflow', DialogflowViewSet, basename='dialogflow')

urlpatterns = [
    path('', include(router.urls)),
]