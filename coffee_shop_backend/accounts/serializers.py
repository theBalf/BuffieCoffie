from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
import re

from .models import CustomerProfile

User = get_user_model()


def normalize_phone(value):
    persian_digits = "۰۱۲۳۴۵۶۷۸۹"
    arabic_digits = "٠١٢٣٤٥٦٧٨٩"
    translation = str.maketrans(
        persian_digits + arabic_digits,
        "0123456789" * 2,
    )
    digits = re.sub(r"\D", "", value.translate(translation))
    if digits.startswith("0098"):
        digits = f"0{digits[4:]}"
    elif digits.startswith("98") and len(digits) == 12:
        digits = f"0{digits[2:]}"
    return digits


class RegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("این نام کاربری قبلاً ثبت شده است.")
        return value

    def validate_phone(self, value):
        phone = normalize_phone(value)
        if not 10 <= len(phone) <= 15:
            raise serializers.ValidationError("شماره تماس معتبر وارد کنید.")
        if CustomerProfile.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("این شماره تماس قبلاً ثبت شده است.")
        return phone

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        phone = validated_data.pop("phone")
        user = User.objects.create_user(email="", **validated_data)
        CustomerProfile.objects.create(user=user, phone=phone)
        return user


class CustomerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email")
    first_name = serializers.CharField(
        source="user.first_name", required=False, allow_blank=True
    )
    last_name = serializers.CharField(
        source="user.last_name", required=False, allow_blank=True
    )
    is_staff = serializers.BooleanField(source="user.is_staff", read_only=True)

    class Meta:
        model = CustomerProfile
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "address",
            "is_staff",
        )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exclude(
            pk=self.instance.user_id
        ).exists():
            raise serializers.ValidationError("این ایمیل قبلاً ثبت شده است.")
        return value

    def validate_phone(self, value):
        if not value:
            return value
        phone = normalize_phone(value)
        if not 10 <= len(phone) <= 15:
            raise serializers.ValidationError("شماره تماس معتبر وارد کنید.")
        if CustomerProfile.objects.filter(phone=phone).exclude(
            pk=self.instance.pk
        ).exists():
            raise serializers.ValidationError("این شماره تماس قبلاً ثبت شده است.")
        return phone

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for field, value in user_data.items():
            setattr(instance.user, field, value)
        if user_data:
            instance.user.save(update_fields=list(user_data))
        return super().update(instance, validated_data)
