from rest_framework.routers import DefaultRouter
from django.urls import path, include
from payment.paypal import PayPalViewSet

r = DefaultRouter()
r.register(r'paypal', PayPalViewSet, basename='paypal')

urlpatterns = [
    path('', include(r.urls)),
]
