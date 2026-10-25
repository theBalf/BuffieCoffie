from datetime import timedelta

from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomerProfile
from menu.models import Category, DiscountGroup, Product
from orders.models import CafeTable, Order


class OrderStockTests(APITestCase):
    def setUp(self):
        category = Category.objects.create(name='Coffee')
        self.product = Product.objects.create(
            name='Latte',
            price=80000,
            category=category,
            stock=5,
        )
        self.order_url = reverse('order-list')
        self.order_data = {
            'customer_name': 'Test Customer',
            'phone': '09120000000',
            'order_type': 'takeaway',
            'items': [{'product': self.product.pk, 'quantity': 2}],
        }
        self.table = CafeTable.objects.create(table_number=9)

    def test_creating_order_decrements_product_stock(self):
        response = self.client.post(
            self.order_url,
            self.order_data,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)
        self.assertEqual(response.data['total_price'], 160000)

    def test_guest_order_returns_a_claim_token_without_attaching_user(self):
        response = self.client.post(
            self.order_url,
            self.order_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(pk=response.data["id"])
        self.assertIsNone(order.user)
        self.assertTrue(response.data["guest_claim_token"])
        self.assertEqual(
            str(order.guest_claim_token),
            response.data["guest_claim_token"],
        )

    def test_guest_order_can_be_claimed_by_matching_phone_and_token(self):
        guest_order_data = {
            **self.order_data,
            "phone": "+98 912 000 0000",
        }
        create_response = self.client.post(
            self.order_url,
            guest_order_data,
            format="json",
        )
        customer = get_user_model().objects.create_user(
            username="guest-order-owner",
            password="Coffee-Password-2026!",
        )
        CustomerProfile.objects.create(user=customer, phone="09120000000")
        self.client.force_authenticate(user=customer)

        response = self.client.post(
            reverse("order-claim-guests"),
            {
                "orders": [{
                    "id": create_response.data["id"],
                    "guest_claim_token": create_response.data["guest_claim_token"],
                }]
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["claimed_ids"], [create_response.data["id"]])
        order = Order.objects.get(pk=create_response.data["id"])
        self.assertEqual(order.user, customer)
        self.assertIsNone(order.guest_claim_token)

    def test_guest_order_cannot_be_claimed_with_a_different_phone(self):
        create_response = self.client.post(
            self.order_url,
            self.order_data,
            format="json",
        )
        customer = get_user_model().objects.create_user(
            username="different-phone-owner",
            password="Coffee-Password-2026!",
        )
        CustomerProfile.objects.create(user=customer, phone="09129999999")
        self.client.force_authenticate(user=customer)

        response = self.client.post(
            reverse("order-claim-guests"),
            {
                "orders": [{
                    "id": create_response.data["id"],
                    "guest_claim_token": create_response.data["guest_claim_token"],
                }]
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["claimed_ids"], [])
        order = Order.objects.get(pk=create_response.data["id"])
        self.assertIsNone(order.user)
        self.assertTrue(order.guest_claim_token)

    def test_guest_cannot_place_delivery_order(self):
        self.order_data.update({
            "order_type": "delivery",
            "address": "Tehran",
        })

        response = self.client.post(
            self.order_url,
            self.order_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("order_type", response.data)
        self.assertEqual(Order.objects.count(), 0)

    def test_authenticated_customer_can_place_delivery_order(self):
        customer = get_user_model().objects.create_user(
            username="delivery-customer",
            password="Coffee-Password-2026!",
        )
        self.client.force_authenticate(user=customer)
        self.order_data.update({
            "order_type": "delivery",
            "address": "Tehran",
        })

        response = self.client.post(
            self.order_url,
            self.order_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(pk=response.data["id"])
        self.assertEqual(order.user, customer)
        self.assertIsNone(order.guest_claim_token)

    def test_authenticated_order_is_attached_to_customer_account(self):
        customer = get_user_model().objects.create_user(
            username="order-customer",
            password="Coffee-Password-2026!",
        )
        self.client.force_authenticate(user=customer)

        response = self.client.post(
            self.order_url,
            self.order_data,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.get(pk=response.data["id"]).user, customer)

    def test_ordering_more_than_available_stock_does_not_create_order(self):
        self.order_data['items'][0]['quantity'] = 6

        response = self.client.post(
            self.order_url,
            self.order_data,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)
        self.assertEqual(Order.objects.count(), 0)

    def test_ordering_all_remaining_stock_marks_product_unavailable(self):
        self.order_data['items'][0]['quantity'] = 5

        response = self.client.post(
            self.order_url,
            self.order_data,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 0)
        self.assertFalse(self.product.is_available)

    def test_insufficient_stock_rolls_back_all_product_decrements(self):
        second_product = Product.objects.create(
            name='Espresso',
            price=50000,
            category=self.product.category,
            stock=1,
        )
        self.order_data['items'].append({
            'product': second_product.pk,
            'quantity': 2,
        })

        response = self.client.post(
            self.order_url,
            self.order_data,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.product.refresh_from_db()
        second_product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)
        self.assertEqual(second_product.stock, 1)
        self.assertEqual(Order.objects.count(), 0)

    def test_order_applies_highest_active_product_discount(self):
        smaller_discount = DiscountGroup.objects.create(
            name="Caffeinated",
            discount_percentage=10,
        )
        larger_discount = DiscountGroup.objects.create(
            name="Desserts",
            discount_percentage=25,
        )
        inactive_discount = DiscountGroup.objects.create(
            name="Inactive campaign",
            discount_percentage=90,
            is_active=False,
        )
        for group in (smaller_discount, larger_discount, inactive_discount):
            group.products.add(self.product)

        response = self.client.post(
            self.order_url,
            self.order_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["items"][0]["unit_price"], 60000)
        self.assertEqual(response.data["total_price"], 120000)

    def test_customer_only_sees_their_own_orders(self):
        user_model = get_user_model()
        customer = user_model.objects.create_user(
            username="customer",
            password="Coffee-Password-2026!",
        )
        other_customer = user_model.objects.create_user(
            username="other-customer",
            password="Coffee-Password-2026!",
        )
        own_order = Order.objects.create(
            user=customer,
            customer_name="Customer",
            phone="09120000000",
        )
        Order.objects.create(
            user=other_customer,
            customer_name="Other Customer",
            phone="09121111111",
        )
        self.client.force_authenticate(user=customer)

        response = self.client.get(self.order_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data["results"]], [own_order.id])

    def test_anonymous_users_cannot_read_orders(self):
        response = self.client.get(self.order_url)

        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_customer_cannot_change_order_status(self):
        user = get_user_model().objects.create_user(
            username="customer",
            password="Coffee-Password-2026!",
        )
        order = Order.objects.create(
            user=user,
            customer_name="Customer",
            phone="09120000000",
        )
        self.client.force_authenticate(user=user)

        response = self.client.patch(
            f"{self.order_url}{order.pk}/",
            {"status": Order.Status.READY},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PENDING)

    def test_staff_can_change_order_status(self):
        staff_user = get_user_model().objects.create_user(
            username="staff",
            password="Coffee-Password-2026!",
            is_staff=True,
        )
        staff_user.groups.create(name="ادمین عملیاتی")
        order = Order.objects.create(
            customer_name="Customer",
            phone="09120000000",
        )
        self.client.force_authenticate(user=staff_user)

        response = self.client.patch(
            f"{self.order_url}{order.pk}/",
            {"status": Order.Status.READY},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Order.Status.READY)

    def test_dine_in_order_occupies_the_selected_table(self):
        self.order_data.update({
            "order_type": "dine_in",
            "table_number": self.table.table_number,
        })

        response = self.client.post(
            self.order_url,
            self.order_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.table.refresh_from_db()
        self.assertTrue(self.table.is_occupied)

    def test_dine_in_order_can_resolve_table_from_qr_token(self):
        self.order_data.update({
            "order_type": "dine_in",
            "table_token": str(self.table.qr_token),
        })

        response = self.client.post(
            self.order_url,
            self.order_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["table_number"], self.table.table_number)

    def test_dine_in_order_rejects_mismatched_qr_and_table_number(self):
        second_table = CafeTable.objects.create(table_number=10)
        self.order_data.update({
            "order_type": "dine_in",
            "table_number": second_table.table_number,
            "table_token": str(self.table.qr_token),
        })

        response = self.client.post(
            self.order_url,
            self.order_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_public_table_list_includes_eight_initial_test_tables(self):
        response = self.client.get(reverse("cafe-table-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        table_numbers = {table["table_number"] for table in response.data}
        self.assertTrue(set(range(1, 9)).issubset(table_numbers))
        self.assertIn(self.table.table_number, table_numbers)

    def test_qr_lookup_returns_bound_table_and_occupancy(self):
        response = self.client.get(
            reverse("cafe-table-qr", kwargs={"token": self.table.qr_token})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["table_number"], self.table.table_number)
        self.assertFalse(response.data["is_occupied"])

    def test_attention_endpoint_returns_ready_and_delayed_orders(self):
        old_pending = Order.objects.create(
            customer_name="Pending",
            phone="09120000001",
            status=Order.Status.PENDING,
        )
        old_preparing = Order.objects.create(
            customer_name="Preparing",
            phone="09120000002",
            status=Order.Status.PREPARING,
        )
        recent_pending = Order.objects.create(
            customer_name="Recent",
            phone="09120000003",
            status=Order.Status.PENDING,
        )
        ready = Order.objects.create(
            customer_name="Ready",
            phone="09120000004",
            status=Order.Status.READY,
        )
        Order.objects.filter(pk__in=(old_pending.pk, old_preparing.pk)).update(
            created_at=timezone.now() - timedelta(minutes=6)
        )
        staff_user = get_user_model().objects.create_user(
            username="attention-manager",
            password="Coffee-Password-2026!",
            is_staff=True,
        )
        staff_user.groups.create(name="ادمین عملیاتی")
        self.client.force_authenticate(user=staff_user)

        response = self.client.get(reverse("order-attention"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            {item["id"] for item in response.data},
            {old_pending.pk, old_preparing.pk, ready.pk},
        )
        self.assertNotIn(recent_pending.pk, {item["id"] for item in response.data})

    def test_staff_can_create_table_with_unique_qr_token(self):
        staff_user = get_user_model().objects.create_user(
            username="table-admin",
            password="test-password",
            is_staff=True,
        )
        staff_user.groups.create(name="ادمین عملیاتی")
        self.client.force_authenticate(user=staff_user)

        response = self.client.post(
            reverse("cafe-table-list"),
            {"table_number": 11},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["qr_token"])

    def test_staff_can_update_table_occupancy(self):
        staff_user = get_user_model().objects.create_user(
            username="table-status-admin",
            password="Coffee-Password-2026!",
            is_staff=True,
        )
        staff_user.groups.create(name="ادمین عملیاتی")
        self.client.force_authenticate(user=staff_user)

        response = self.client.patch(
            reverse("cafe-table-detail", kwargs={"pk": self.table.pk}),
            {"is_occupied": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_occupied"])
        self.table.refresh_from_db()
        self.assertTrue(self.table.is_occupied)

    def test_regular_customer_cannot_manage_tables(self):
        customer = get_user_model().objects.create_user(
            username="table-customer",
            password="test-password",
        )
        self.client.force_authenticate(user=customer)

        response = self.client.get(
            reverse("cafe-table-list"),
            {"manage": "true"},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_occupied_table_cannot_be_selected_for_another_order(self):
        self.table.is_occupied = True
        self.table.save(update_fields=["is_occupied"])
        self.order_data.update({
            "order_type": "dine_in",
            "table_number": self.table.table_number,
        })

        response = self.client.post(
            self.order_url,
            self.order_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_delivering_dine_in_order_releases_table(self):
        self.order_data.update({
            "order_type": "dine_in",
            "table_number": self.table.table_number,
        })
        create_response = self.client.post(
            self.order_url,
            self.order_data,
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.table.refresh_from_db()
        self.assertTrue(self.table.is_occupied)

        staff_user = get_user_model().objects.create_user(
            username="table-manager",
            password="test-password",
            is_staff=True,
        )
        staff_user.groups.create(name="ادمین عملیاتی")
        self.client.force_authenticate(user=staff_user)
        response = self.client.patch(
            f"{self.order_url}{create_response.data['id']}/",
            {"status": Order.Status.DELIVERED},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.table.refresh_from_db()
        self.assertFalse(self.table.is_occupied)
