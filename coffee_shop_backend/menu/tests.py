from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from orders.models import Order, OrderItem
from .models import Category, DiscountGroup, Product, ProductRating

User = get_user_model()


class ProductDiscountTests(APITestCase):
    def setUp(self):
        category = Category.objects.create(name="Coffee")
        self.product = Product.objects.create(
            name="Latte",
            price=100000,
            category=category,
        )

    def test_product_api_returns_discounted_price_and_percentage(self):
        discount_group = DiscountGroup.objects.create(
            name="Caffeinated drinks",
            discount_percentage=25,
        )
        discount_group.products.add(self.product)

        response = self.client.get(reverse("product-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        product_data = response.data["results"][0]
        self.assertEqual(product_data["price"], 100000)
        self.assertEqual(product_data["discount_percentage"], 25)
        self.assertEqual(product_data["discounted_price"], 75000)

    def test_products_have_seeded_half_star_ratings(self):
        response = self.client.get(reverse("product-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rating = response.data["results"][0]["rating"]
        self.assertGreaterEqual(rating, 3.0)
        self.assertLessEqual(rating, 5.0)
        self.assertEqual(rating * 2, int(rating * 2))

    def test_customer_can_rate_a_product_in_their_order_and_rating_rounds_up(self):
        first_user = User.objects.create_user(username="first-rater", password="test")
        second_user = User.objects.create_user(username="second-rater", password="test")
        for user, score in ((first_user, 4), (second_user, 4.5)):
            order = Order.objects.create(
                user=user,
                customer_name=user.username,
                phone="09120000000",
                status=Order.Status.DELIVERED,
            )
            OrderItem.objects.create(
                order=order,
                product=self.product,
                quantity=1,
                unit_price=self.product.price,
            )
            self.client.force_authenticate(user=user)
            response = self.client.post(
                reverse("product-rate", kwargs={"slug": self.product.slug}),
                {"rating": score},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(response.data["rating"], 4.5)
        self.assertEqual(
            ProductRating.objects.filter(product=self.product).count(),
            2,
        )
        orders_response = self.client.get(
            reverse("order-list"),
            {"mine": "true"},
        )
        self.assertEqual(orders_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            orders_response.data["results"][0]["items"][0]["user_rating"],
            "4.5",
        )

    def test_customer_cannot_rate_a_product_they_have_not_ordered(self):
        user = User.objects.create_user(username="non-buyer", password="test")
        self.client.force_authenticate(user=user)

        response = self.client.post(
            reverse("product-rate", kwargs={"slug": self.product.slug}),
            {"rating": 5},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(ProductRating.objects.exists())

    def test_rating_requires_half_star_increment_and_updates_existing_vote(self):
        user = User.objects.create_user(username="rater", password="test")
        order = Order.objects.create(
            user=user,
            customer_name=user.username,
            phone="09120000000",
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=1,
            unit_price=self.product.price,
        )
        self.client.force_authenticate(user=user)
        url = reverse("product-rate", kwargs={"slug": self.product.slug})

        invalid_response = self.client.post(
            url,
            {"rating": 3.2},
            format="json",
        )
        self.assertEqual(invalid_response.status_code, status.HTTP_400_BAD_REQUEST)

        for score in (3.5, 5):
            response = self.client.post(
                url,
                {"rating": score},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            ProductRating.objects.filter(product=self.product, user=user).count(),
            1,
        )
        self.assertEqual(
            ProductRating.objects.get(product=self.product, user=user).rating,
            5,
        )