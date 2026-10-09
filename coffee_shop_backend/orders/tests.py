from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from menu.models import Category, Product
from orders.models import Order


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
