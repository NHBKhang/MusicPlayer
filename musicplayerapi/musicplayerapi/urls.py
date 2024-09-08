"""
URL configuration for musicplayerapi project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from music.admin import admin_site
from oauth2_provider.views import AuthorizationView, TokenView, RevokeTokenView

urlpatterns = [
    path('', include('music.urls')),
    path('admin/', admin_site.urls),
    path('paypal/', include('paypal.urls')),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
]
