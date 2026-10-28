import io
import json
from urllib.error import URLError
from urllib.parse import parse_qs
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from config.settings import build_database_config
from .permissions import ADMIN_GROUP, MANAGER_GROUP
from .models import CustomerProfile

User = get_user_model()


class DatabaseSecuritySettingsTests(SimpleTestCase):
    database_url = "postgresql://coffee:secret@db.example.com:5432/coffee"

    def test_production_requires_verified_tls(self):
        for sslmode in (None, "require", "verify-ca"):
            with self.subTest(sslmode=sslmode):
                with self.assertRaisesMessage(
                    ImproperlyConfigured,
                    "DATABASE_SSLMODE must be verify-full",
                ):
                    build_database_config(self.database_url, False, sslmode)

    def test_production_database_config_uses_verified_tls_and_ca_bundle(self):
        database = build_database_config(
            self.database_url,
            False,
            "verify-full",
            "/etc/ssl/provider-ca.pem",
        )

        self.assertEqual(database["OPTIONS"], {
            "sslmode": "verify-full",
            "sslrootcert": "/etc/ssl/provider-ca.pem",
        })
        self.assertEqual(database["HOST"], "db.example.com")

    def test_development_can_use_local_database_without_tls(self):
        database = build_database_config(self.database_url, True)

        self.assertEqual(database["OPTIONS"], {})


@override_settings(TURNSTILE_REQUIRED=False)
class AccountApiTests(APITestCase):
    def test_register_creates_customer_profile_and_session(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "new-customer",
                "phone": "۰۹۱۲۱۲۳۴۵۶۷",
                "password": "Coffee-Password-2026!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["username"], "new-customer")
        self.assertEqual(response.data["user"]["phone"], "09121234567")
        self.assertFalse(response.data["user"]["is_staff"])
        self.assertTrue(
            CustomerProfile.objects.filter(user__username="new-customer").exists()
        )
        self.assertEqual(self.client.get(reverse("current-user")).data["user"]["username"], "new-customer")

    def test_registration_rejects_duplicate_phone_number(self):
        existing_user = User.objects.create_user(
            username="existing-customer",
            password="Coffee-Password-2026!",
        )
        CustomerProfile.objects.create(
            user=existing_user,
            phone="09121234567",
        )

        response = self.client.post(
            reverse("register"),
            {
                "username": "duplicate-phone",
                "phone": "+98 912 123 4567",
                "password": "Coffee-Password-2026!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("شماره تماس قبلاً ثبت شده", str(response.data))

    def test_customer_can_login_with_phone_number(self):
        user = User.objects.create_user(
            username="phone-customer",
            password="Coffee-Password-2026!",
        )
        CustomerProfile.objects.create(user=user, phone="09121234567")

        response = self.client.post(
            reverse("login"),
            {
                "identifier": "+98 912 123 4567",
                "password": "Coffee-Password-2026!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["username"], "phone-customer")

    def test_login_requires_a_valid_csrf_token(self):
        user = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="Coffee-Password-2026!",
        )
        CustomerProfile.objects.create(user=user)
        client = APIClient(enforce_csrf_checks=True)
        csrf_response = client.get(reverse("csrf-token"))

        response = client.post(
            reverse("login"),
            {"identifier": "customer@example.com", "password": "Coffee-Password-2026!"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_response.data["csrfToken"],
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(client.get(reverse("current-user")).data["user"]["username"], "customer")

    def test_login_without_csrf_token_is_rejected(self):
        client = APIClient(enforce_csrf_checks=True)

        response = client.post(
            reverse("login"),
            {"identifier": "customer", "password": "incorrect"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_registration_without_csrf_token_is_rejected(self):
        client = APIClient(enforce_csrf_checks=True)

        response = client.post(
            reverse("register"),
            {
                "username": "csrf-registration",
                "phone": "09121234567",
                "password": "Coffee-Password-2026!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_logout_without_csrf_token_is_rejected(self):
        user = User.objects.create_user(username="csrf-logout", password="Coffee-Password-2026!")
        client = APIClient(enforce_csrf_checks=True)
        client.force_login(user)

        response = client.post(reverse("logout"), format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_profile_update_without_csrf_token_is_rejected(self):
        user = User.objects.create_user(username="csrf-profile", password="Coffee-Password-2026!")
        CustomerProfile.objects.create(user=user)
        client = APIClient(enforce_csrf_checks=True)
        client.force_login(user)

        response = client.patch(
            reverse("customer-profile"),
            {"address": "Tehran"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_uses_same_error_for_unknown_user_and_wrong_password(self):
        User.objects.create_user(
            username="known-user",
            email="known@example.com",
            password="Coffee-Password-2026!",
        )
        responses = [
            self.client.post(
                reverse("login"),
                {"identifier": identifier, "password": password},
                format="json",
            )
            for identifier, password in (
                ("missing-user", "any-password"),
                ("known-user", "incorrect-password"),
            )
        ]

        self.assertEqual(
            [response.status_code for response in responses],
            [status.HTTP_400_BAD_REQUEST, status.HTTP_400_BAD_REQUEST],
        )
        self.assertEqual(
            [response.data["detail"] for response in responses],
            ["نام کاربری یا رمز عبور اشتباه است."] * 2,
        )

    def test_profile_update_changes_only_account_profile_fields(self):
        user = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="Coffee-Password-2026!",
        )
        profile = CustomerProfile.objects.create(user=user)
        self.client.force_authenticate(user=user)

        response = self.client.patch(
            reverse("customer-profile"),
            {
                "first_name": "Sara",
                "last_name": "Coffee",
                "phone": "09120000000",
                "address": "Tehran",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        profile.refresh_from_db()
        self.assertEqual(user.first_name, "Sara")
        self.assertEqual(profile.phone, "09120000000")
        self.assertEqual(profile.address, "Tehran")

    def test_customer_cannot_promote_themselves_to_staff(self):
        user = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="Coffee-Password-2026!",
        )
        CustomerProfile.objects.create(user=user)
        self.client.force_authenticate(user=user)

        response = self.client.patch(
            reverse("customer-profile"),
            {"is_staff": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertFalse(user.is_staff)

    def test_regular_customer_cannot_create_categories(self):
        user = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="Coffee-Password-2026!",
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            reverse("category-list"),
            {"name": "New category"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_operations_admin_can_update_stock_but_not_price(self):
        from menu.models import Category, Product

        user = User.objects.create_user(
            username="operations",
            password="Coffee-Password-2026!",
            is_staff=True,
        )
        user.groups.create(name=ADMIN_GROUP)
        category = Category.objects.create(name="Coffee")
        product = Product.objects.create(
            name="Latte",
            price=80000,
            category=category,
            stock=5,
        )
        self.client.force_authenticate(user=user)

        response = self.client.patch(
            reverse("product-detail", kwargs={"slug": product.slug}),
            {"price": 100000, "stock": 2, "preparation_time": 8},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertEqual(product.price, 80000)
        self.assertEqual(product.stock, 2)
        self.assertEqual(product.preparation_time, 8)

    def test_only_store_manager_can_change_price(self):
        from menu.models import Category, Product

        manager = User.objects.create_user(
            username="manager",
            password="Coffee-Password-2026!",
            is_staff=True,
        )
        manager.groups.create(name=MANAGER_GROUP)
        category = Category.objects.create(name="Coffee")
        product = Product.objects.create(
            name="Latte",
            price=80000,
            category=category,
            stock=5,
        )
        self.client.force_authenticate(user=manager)

        response = self.client.patch(
            reverse("product-detail", kwargs={"slug": product.slug}),
            {"price": 100000},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertEqual(product.price, 100000)

    def test_regular_customer_cannot_access_django_admin(self):
        user = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="Coffee-Password-2026!",
        )
        self.client.force_login(user)

        response = self.client.get("/admin/")

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertIn("/admin/login/", response["Location"])


@override_settings(
    TURNSTILE_REQUIRED=True,
    TURNSTILE_SECRET_KEY="test-secret",
    TURNSTILE_ALLOWED_HOSTNAMES=[],
)
class TurnstileLoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="turnstile-customer",
            password="Coffee-Password-2026!",
        )

    def test_login_verifies_turnstile_token_with_cloudflare(self):
        response_body = io.BytesIO(
            json.dumps({"success": True, "hostname": "example.com"}).encode()
        )
        with patch("accounts.turnstile.urlopen", return_value=response_body) as request:
            response = self.client.post(
                reverse("login"),
                {
                    "identifier": self.user.username,
                    "password": "Coffee-Password-2026!",
                    "captcha_token": "one-time-challenge-token",
                },
                format="json",
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        submitted_data = parse_qs(request.call_args.args[0].data.decode())
        self.assertEqual(submitted_data["secret"], ["test-secret"])
        self.assertEqual(
            submitted_data["response"],
            ["one-time-challenge-token"],
        )

    def test_login_rejects_missing_turnstile_token(self):
        response = self.client.post(
            reverse("login"),
            {
                "identifier": self.user.username,
                "password": "Coffee-Password-2026!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["detail"],
            "تأیید امنیتی کامل نشد. دوباره تلاش کنید.",
        )

    def test_login_returns_service_unavailable_if_cloudflare_cannot_be_reached(self):
        with patch(
            "accounts.turnstile.urlopen",
            side_effect=URLError("Cloudflare is unavailable"),
        ):
            response = self.client.post(
                reverse("login"),
                {
                    "identifier": self.user.username,
                    "password": "Coffee-Password-2026!",
                    "captcha_token": "one-time-challenge-token",
                },
                format="json",
            )

        self.assertEqual(
            response.status_code,
            status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@override_settings(
    CORS_ALLOWED_ORIGINS=["https://shop.example.com"],
    CORS_ALLOW_ALL_ORIGINS=False,
    CORS_ALLOW_CREDENTIALS=True,
)
class CorsConfigurationTests(APITestCase):
    def test_allowed_frontend_origin_can_make_credentialed_requests(self):
        response = self.client.get(
            reverse("csrf-token"),
            HTTP_ORIGIN="https://shop.example.com",
        )

        self.assertEqual(
            response["Access-Control-Allow-Origin"],
            "https://shop.example.com",
        )
        self.assertEqual(response["Access-Control-Allow-Credentials"], "true")

    def test_unlisted_origin_is_not_allowed(self):
        response = self.client.get(
            reverse("csrf-token"),
            HTTP_ORIGIN="https://untrusted.example",
        )

        self.assertNotIn("Access-Control-Allow-Origin", response)


@override_settings(
    CSRF_COOKIE_SECURE=True,
    SESSION_COOKIE_SECURE=True,
)
class SecureCookieTests(APITestCase):
    def test_csrf_and_session_cookies_are_secure(self):
        user = User.objects.create_user(
            username="secure-cookie-customer",
            password="Coffee-Password-2026!",
        )
        client = APIClient(enforce_csrf_checks=True)
        csrf_response = client.get(reverse("csrf-token"), secure=True)
        response = client.post(
            reverse("login"),
            {
                "identifier": user.username,
                "password": "Coffee-Password-2026!",
            },
            format="json",
            HTTP_X_CSRFTOKEN=csrf_response.data["csrfToken"],
            HTTP_REFERER="https://testserver/",
            secure=True,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.cookies["csrftoken"]["secure"])
        self.assertTrue(response.cookies["sessionid"]["secure"])
