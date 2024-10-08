from django.urls import path, include
from rest_framework.routers import DefaultRouter
from support import views

router = DefaultRouter()
router.register(r'dialogflow', views.DialogflowViewSet, basename='dialogflow')
router.register(r'tickets', views.SupportTicketViewSet, basename='tickets')
router.register(r'feedback', views.FeedbackViewSet, basename='feedback')

urlpatterns = [
    path('', include(router.urls)),
]