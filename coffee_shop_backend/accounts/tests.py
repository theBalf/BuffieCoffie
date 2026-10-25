from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .permissions import ADMIN_GROUP, MANAGER_GROUP
from .models import CustomerProfile

User = get_user_model()


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
