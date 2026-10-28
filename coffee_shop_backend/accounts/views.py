import logging

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.core.exceptions import ImproperlyConfigured
from django.db.models import Q
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .turnstile import TurnstileUnavailable, verify_turnstile
from .models import CustomerProfile
from .serializers import (
    CustomerProfileSerializer,
    RegistrationSerializer,
    normalize_phone,
)

User = get_user_model()
logger = logging.getLogger(__name__)


def user_response(user):
    profile, _ = CustomerProfile.objects.get_or_create(user=user)
    return CustomerProfileSerializer(profile).data


class CsrfTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"csrfToken": get_token(request)})


class CurrentUserView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"user": None})
        return Response({"user": user_response(request.user)})


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @method_decorator(csrf_protect)
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user, backend="django.contrib.auth.backends.ModelBackend")
        return Response(
            {"user": user_response(user)},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @method_decorator(csrf_protect)
    def post(self, request):
        captcha_token = request.data.get("captcha_token", "")
        try:
            challenge_valid = verify_turnstile(captcha_token)
        except ImproperlyConfigured:
            logger.exception("Turnstile is required but is not configured.")
            return Response(
                {"detail": "سرویس امنیتی ورود در سرور پیکربندی نشده است."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except TurnstileUnavailable:
            return Response(
                {"detail": "بررسی امنیتی موقتاً در دسترس نیست. دوباره تلاش کنید."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        if not challenge_valid:
            return Response(
                {"detail": "تأیید امنیتی کامل نشد. دوباره تلاش کنید."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        identifier = request.data.get("identifier", "")
        password = request.data.get("password", "")
        if (
            not isinstance(identifier, str)
            or not isinstance(password, str)
            or not identifier.strip()
            or not password
        ):
            return Response(
                {"detail": "نام کاربری/شماره تماس و رمز عبور الزامی است."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        identifier = identifier.strip()
        normalized_phone = normalize_phone(identifier)
        user_match = User.objects.filter(
            Q(username__iexact=identifier)
            | Q(email__iexact=identifier)
            | Q(customer_profile__phone=normalized_phone)
        ).first()
        user = (
            authenticate(request, username=user_match.username, password=password)
            if user_match
            else None
        )
        if user is None:
            return Response(
                {"detail": "نام کاربری یا رمز عبور اشتباه است."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)
        return Response({"user": user_response(user)})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CustomerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"user": user_response(request.user)})

    def patch(self, request):
        profile, _ = CustomerProfile.objects.get_or_create(user=request.user)
        serializer = CustomerProfileSerializer(
            profile,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"user": serializer.data})
