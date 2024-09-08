from django.urls import path
from paypal.views import *

urlpatterns = [
    path('create-order/', CreatePayPalOrderView.as_view(), name='create-paypal-order'),
    path('payment-success/', VerifyPayPalPaymentView.as_view(), name='payment-success'),
]