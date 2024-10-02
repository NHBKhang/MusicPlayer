from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from music.models import SongTransaction, Transaction, PremiumTransaction, PremiumSubscription
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

                SongTransaction.objects.create(
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

    @action(detail=False, methods=['post'], url_path='subscribe-premium')
    def subscribe_premium(self, request):
        try:
            data = request.data
            amount_usd = data.get('amount')
            return_url = data.get('return_url')
            cancel_url = data.get('cancel_url')
            txn_ref = data.get('txn_ref')
            order_info = data.get('order_info')
            user_id = data.get('user_id')
            type = data.get("type")

            exchange_rate = 24000

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
                    "description": "Thanh toán cho gói đăng ký Premium trên SoundScape."
                }]
            })

            if payment.create():
                approval_url = next(link.href for link in payment.links if link.rel == "approval_url")

                subscription, created = PremiumSubscription.objects.get_or_create(user_id=user_id)
                PremiumTransaction.objects.create(
                    transaction_id=payment.id,
                    payment_method='PayPal',
                    description=order_info,
                    status=Transaction.CREATED,
                    amount_in_vnd=float(amount_usd * exchange_rate),
                    premium_subscription=subscription,
                    type=type
                )

                return Response({'approval_url': approval_url}, status=status.HTTP_200_OK)
            else:
                print(payment.error)
                return Response({'detail': payment.error.get('message')}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='payment-success')
    def verify_payment(self, request):
        data = request.data
        payment_id = data.get('paymentId')
        payer_id = data.get('PayerID')

        try:
            transaction = SongTransaction.objects.filter(transaction_id=payment_id).first() or \
                          PremiumTransaction.objects.filter(transaction_id=payment_id).first()

            if not transaction:
                return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

            transaction_type = 'song' if isinstance(transaction, SongTransaction) else 'premium'

            if transaction_type == 'song':
                transaction = SongTransaction.objects.get(transaction_id=payment_id)
                return self.verify_song_payment(transaction, payer_id)
            elif transaction_type == 'premium':
                transaction = PremiumTransaction.objects.get(transaction_id=payment_id)
                return self.verify_premium_payment(transaction, payer_id)
            else:
                return Response({'detail': 'Transaction type not recognized.'}, status=status.HTTP_400_BAD_REQUEST)

        except (SongTransaction.DoesNotExist, PremiumTransaction.DoesNotExist):
            return Response({'detail': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def verify_song_payment(self, transaction, payer_id):
        if transaction.status == Transaction.COMPLETED:
            return Response({'detail': 'Giao dịch đã được hoàn tất.'}, status=status.HTTP_400_BAD_REQUEST)

        payment = paypalrestsdk.Payment.find(transaction.transaction_id)
        if payment.execute({"payer_id": payer_id}):
            transaction.status = Transaction.COMPLETED
            transaction.save()

            return Response({
                'message': 'Song payment successful!',
                'data': {
                    'id': transaction.song.id,
                    'title': transaction.song.title,
                    'transaction_id': transaction.transaction_id,
                    'amount': transaction.amount_in_vnd,
                    'transaction_date': transaction.transaction_date,
                    'method': transaction.payment_method
                }
            }, status=status.HTTP_200_OK)
        else:
            transaction.status = TransactionStatus.FAILED
            transaction.save()
            return Response({'detail': 'Thực hiện thanh toán không thành công.'}, status=status.HTTP_400_BAD_REQUEST)

    def verify_premium_payment(self, transaction, payer_id):
        if transaction.status == Transaction.COMPLETED:
            return Response({'detail': 'Giao dịch đã được hoàn tất.'}, status=status.HTTP_400_BAD_REQUEST)

        payment = paypalrestsdk.Payment.find(transaction.transaction_id)
        if payment.execute({"payer_id": payer_id}):
            transaction.status = Transaction.COMPLETED
            transaction.save()

            subscription = PremiumSubscription.objects.get(user_id=transaction.premium_subscription.user.id)
            subscription.extend_subscription(transaction.type)

            return Response({
                'message': 'Premium payment successful!',
                'data': {
                    'id': subscription.id,
                    'start_date': subscription.start_date,
                    'end_date': subscription.end_date,
                    'type': transaction.type,
                    'transaction_id': transaction.transaction_id,
                    'transaction_date': transaction.transaction_date,
                    'amount': transaction.amount_in_vnd,
                    'method': transaction.payment_method
                }
            }, status=status.HTTP_200_OK)
        else:
            transaction.status = TransactionStatus.FAILED
            transaction.save()
            return Response({'detail': 'Thực hiện thanh toán không thành công.'}, status=status.HTTP_400_BAD_REQUEST)
