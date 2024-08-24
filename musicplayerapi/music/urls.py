from rest_framework.routers import DefaultRouter
from django.urls import path, include
from music import views

r = DefaultRouter()
r.register('users', views.UserViewSet, basename='users')
r.register('genres', views.GenreViewSet, basename='genres')
r.register('songs', views.SongViewSet, basename='songs')
r.register('playlists', views.PlaylistViewSet, basename='playlists')

urlpatterns = [
    path('', include(r.urls)),
    path('auth/google/', views.google_login, name='google-login'),
    path('auth/facebook/', views.facebook_login, name='google-login'),
    path('auth/set-password/', views.set_password, name='set-password'),
    path('search/', views.MixedSearchView.as_view(), name='mixed-search'),
]
