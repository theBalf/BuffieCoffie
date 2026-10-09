from django.db import transaction
from django.db.models import BooleanField, Case, F, Value, When
from rest_framework import serializers
from menu.models import Product
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image_url = serializers.CharField(source='product.image_url', read_only=True)
    total_price = serializers.IntegerField(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image_url', 'quantity', 'unit_price', 'total_price', 'note']
        read_only_fields = ['unit_price','id']

    quantity = serializers.IntegerField(min_value=1)

    def validate_product(self, product: Product):
        if not product.is_available or product.stock <= 0:
            raise serializers.ValidationError('This product is not available.')
        return product


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'phone', 'order_type', 'table_number', 'address',
            'status', 'note', 'total_price', 'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['total_price', 'status']

    def validate(self, attrs):
        order_type = attrs.get('order_type', Order.OrderType.TAKEAWAY)
        if order_type == Order.OrderType.DINE_IN and not attrs.get('table_number'):
            raise serializers.ValidationError({
                'table_number': 'A table number is required for dine-in orders.'
            })
        if order_type == Order.OrderType.DELIVERY and not attrs.get('address', '').strip():
            raise serializers.ValidationError({
                'address': 'An address is required for delivery orders.'
            })
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        quantities_by_product = {}
        products_by_id = {}

        for item_data in items_data:
            product = item_data['product']
            quantity = item_data.get('quantity', 1)
            products_by_id[product.pk] = product
            quantities_by_product[product.pk] = (
                quantities_by_product.get(product.pk, 0) + quantity
            )

        for product_id, quantity in quantities_by_product.items():
            product = products_by_id[product_id]
            updated_count = Product.objects.filter(
                pk=product_id,
                is_available=True,
                stock__gte=quantity,
            ).update(
                stock=F('stock') - quantity,
                is_available=Case(
                    When(stock=quantity, then=Value(False)),
                    default=F('is_available'),
                    output_field=BooleanField(),
                ),
            )
            if not updated_count:
                raise serializers.ValidationError({
                    'items': (
                        f'Insufficient stock for {product.name}. '
                        'Please update your cart and try again.'
                    )
                })

        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data.get('quantity', 1)
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=product.price,
                note=item_data.get('note', ''),
            )

        order.calculate_total()
        return order
