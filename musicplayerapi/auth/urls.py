from django.urls import path, include
from rest_framework.routers import DefaultRouter
from auth import google, facebook, views

router = DefaultRouter()
router.register(r'2fa', views.TwoFactorAuthViewSet, basename='two-factor-auth')

urlpatterns = [
    path('', include(router.urls)),
    path('google/', google.GoogleViewSet.as_view({'post': 'google_auth'}), name='google'),
    path('facebook/', facebook.FacebookViewSet.as_view({'post': 'facebook_auth'}), name='facebook'),
    path('set-password/', views.SetPasswordViewSet.as_view({'post': 'set_password'}), name='set_password'),
]
