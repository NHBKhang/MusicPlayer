from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from django_otp.plugins.otp_totp.models import TOTPDevice
import pyotp
import qrcode
from io import BytesIO
import base64
from urllib.parse import quote, urlencode


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(write_only=True)


class SetPasswordViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='set-password')
    def set_password(self, request):
        user = request.user
        serializer = PasswordChangeSerializer(data=request.data)

        if serializer.is_valid():
            current_password = serializer.validated_data['current_password']
            if not check_password(current_password, user.password):
                return Response({'detail': 'Mật khẩu hiện tại không đúng.'}, status=status.HTTP_400_BAD_REQUEST)

            new_password = serializer.validated_data['new_password']

            user.set_password(new_password)
            user.save()

            update_session_auth_hash(request, user)

            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TwoFactorAuthViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='enable')
    def enable_2fa(self, request):
        user = request.user

        try:
            if TOTPDevice.objects.filter(user=user).exists():
                return Response({"detail": "2FA is already enabled."}, status=status.HTTP_202_ACCEPTED)

            device = TOTPDevice.objects.create(user=user, name="SoundScape")

            url = self.create_2fa_url(device, user)
            img = qrcode.make(url)
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

            return Response({
                    "qr_code": f"data:image/png;base64,{img_str}"
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response({"detail": "An error occurred while enabling 2FA."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='verify')
    def verify_2fa(self, request):
        user = request.user
        token = request.data.get('token')

        device = TOTPDevice.objects.filter(user=user).first()
        if not device:
            return Response({"detail": "No TOTP device found."}, status=status.HTTP_404_NOT_FOUND)

        if device.verify_token(token):
            return Response({"status": "verified"}, status=status.HTTP_200_OK)
        else:
            return Response({"status": "invalid"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='disable')
    def disable_2fa(self, request):
        user = request.user

        try:
            device = TOTPDevice.objects.filter(user=user).first()
            device.confirm = False
            device.save()

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(e)
            return Response({"detail": "An error occurred while enabling 2FA."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='resend-qr')
    def resend_qr(self, request):
        user = request.user

        try:
            device, created = TOTPDevice.objects.get_or_create(user=user, name="SoundScape")

            img = qrcode.make(self.create_2fa_url(device, user))
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

            return Response({
                "qr_code": f"data:image/png;base64,{img_str}"
            }, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            print(e)
            return Response({"detail": "An error occurred while enabling 2FA."}, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def create_2fa_url(device, user):
        custom_label = "SoundScape"
        params = {
            'secret': base64.b32encode(device.bin_key).decode('utf-8'),
            'algorithm': 'SHA1',
            'digits': device.digits,
            'period': device.step,
        }
        urlencoded_params = urlencode(params)

        issuer = "SoundScape"
        label = f"{custom_label}:{user.username}"
        url = f"otpauth://totp/{quote(label)}?{urlencoded_params}&issuer={quote(issuer)}"

        return url
