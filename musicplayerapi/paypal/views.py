import paypalrestsdk
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from music.models import Transaction

paypalrestsdk.configure({
    'mode': settings.PAYPAL_MODE,
    'client_id': settings.PAYPAL_CLIENT_ID,
    'client_secret': settings.PAYPAL_CLIENT_SECRET
})


class CreatePayPalOrderView(APIView):
    def post(self, request):
        try:
            data = request.data
            amount = data.get('amount')
            return_url = data.get('return_url')
            cancel_url = data.get('cancel_url')
            txn_ref = data.get('txn_ref')
            order_info = data.get('order_info')
            song_id = data.get('song_id')
            user_id = data.get('user_id')

            if Transaction.objects.filter(song_id=song_id, user_id=user_id, status=Transaction.COMPLETED).exists():
                return Response({'detail': 'Transaction already completed for this song.'},
                                status=status.HTTP_400_BAD_REQUEST)

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
                    "description": "Payment for song purchase."
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
                    song_id=song_id,
                    user_id=user_id
                )
                return Response({'approval_url': approval_url}, status=status.HTTP_200_OK)
            else:
                print(payment.error)
                return Response({'detail': payment.error.get('message')}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyPayPalPaymentView(APIView):
    def post(self, request):
        try:
            data = request.data
            payment_id = data.get('paymentId')
            payer_id = data.get('PayerID')

            transaction = Transaction.objects.get(transaction_id=payment_id)

            if transaction.status == Transaction.COMPLETED:
                return Response({'detail': 'Transaction has already been completed.'},
                                status=status.HTTP_400_BAD_REQUEST)

            payment = paypalrestsdk.Payment.find(payment_id)
            if payment.execute({"payer_id": payer_id}):
                transaction = Transaction.objects.get(transaction_id=payment_id)
                transaction.status = Transaction.COMPLETED
                transaction.save()

                return Response({'message': 'Thanh toán đã thành công!', 'song': {
                    'id': transaction.song.id,
                    'title': transaction.song.title,
                    'transaction_id': transaction.transaction_id,
                    'amount': transaction.amount_in_vnd,
                    'transaction_date': transaction.transaction_date,
                    'method': transaction.payment_method
                }}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Payment execution failed'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
