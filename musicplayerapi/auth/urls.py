from django.urls import path, include
from auth import google, facebook, views


urlpatterns = [
    path('google/', google.GoogleViewSet.as_view({'post': 'google_auth'}), name='google'),
    path('facebook/', facebook.FacebookViewSet.as_view({'post': 'facebook_auth'}), name='facebook'),
    path('set-password/', views.SetPasswordViewSet.as_view({'post': 'set_password'}), name='set_password'),
]
