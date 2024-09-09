from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from music.models import Transaction
import paypalrestsdk

paypalrestsdk.configure({
    'mode': settings.PAYPAL_MODE,
    'client_id': settings.PAYPAL_CLIENT_ID,
    'client_secret': settings.PAYPAL_CLIENT_SECRET
})


class PayPalViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], url_path='create-order')
    def create_order(self, request):
        try:
            data = request.data
            amount = data.get('amount')
            return_url = data.get('return_url')
            cancel_url = data.get('cancel_url')
            txn_ref = data.get('txn_ref')
            order_info = data.get('order_info')

            exchange_rate = 24000
            amount_usd = round(float(amount) / exchange_rate, 2)

            payment = paypalrestsdk.Payment({
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": return_url,
                    "cancel_url": cancel_url
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": order_info,
                            "sku": txn_ref,
                            "price": str(amount_usd),
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "total": str(amount_usd),
                        "currency": "USD"
                    },
                    "description": "Thanh toán cho bài hát trên SoundScape."
                }]
            })

            if payment.create():
                approval_url = next(link.href for link in payment.links if link.rel == "approval_url")

                Transaction.objects.create(
                    transaction_id=payment.id,
                    payment_method='PayPal',
                    description=order_info,
                    status=Transaction.CREATED,
                    amount_in_vnd=float(amount),
                    song_id=data.get('song_id'),
                    user_id=data.get('user_id')
                )

                return Response({'approval_url': approval_url}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': payment.error.get('message')}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='payment-success')
    def verify_payment(self, request):
        try:
            data = request.data
            payment_id = data.get('paymentId')
            payer_id = data.get('PayerID')

            transaction = Transaction.objects.get(transaction_id=payment_id)
            if transaction.status == Transaction.COMPLETED:
                return Response({'detail': 'Giao dịch đã được hoàn tất.'},
                                status=status.HTTP_400_BAD_REQUEST)

            payment = paypalrestsdk.Payment.find(payment_id)
            if payment.execute({"payer_id": payer_id}):
                transaction = Transaction.objects.get(transaction_id=payment_id)
                if transaction.status == Transaction.COMPLETED:
                    return Response({'detail': 'Thanh toán bài hát thành công.'},
                                    status=status.HTTP_400_BAD_REQUEST)

                transaction.status = Transaction.COMPLETED
                transaction.save()

                return Response({
                    'message': 'Payment successful!',
                    'song': {
                        'id': transaction.song.id,
                        'title': transaction.song.title,
                        'transaction_id': transaction.transaction_id,
                        'amount': transaction.amount_in_vnd,
                        'transaction_date': transaction.transaction_date,
                        'method': transaction.payment_method
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Thực hiện thanh toán không thành công.'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
