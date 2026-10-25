from django.db.models import OuterRef, Subquery
from django.db import transaction
from django.db.models import BooleanField, Case, F, Value, When
from rest_framework import serializers
from menu.models import Product
from menu.models import ProductRating
from .models import CafeTable, Order, OrderItem


class CafeTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = CafeTable
        fields = ["id", "table_number", "is_occupied", "qr_token"]
        read_only_fields = ["id", "qr_token"]


class PublicCafeTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = CafeTable
        fields = ["id", "table_number", "is_occupied"]


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    product_image_url = serializers.CharField(source='product.image_url', read_only=True)
    total_price = serializers.IntegerField(read_only=True)
    user_rating = serializers.DecimalField(
        source="current_user_rating",
        max_digits=2,
        decimal_places=1,
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_slug', 'product_name', 'product_image_url', 'quantity', 'unit_price', 'total_price', 'note', 'user_rating']
        read_only_fields = ['unit_price','id']

    quantity = serializers.IntegerField(min_value=1)

    def validate_product(self, product: Product):
        if not product.is_available or product.stock <= 0:
            raise serializers.ValidationError('This product is not available.')
        return product


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    table_token = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'phone', 'order_type', 'table_number', 'address',
            'status', 'note', 'total_price', 'items', 'table_token',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['total_price']

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if (
            request
            and request.user.is_authenticated
            and request.user.is_staff
            and not request.user.is_superuser
        ):
            for field_name, field in fields.items():
                if field_name != "status" or not request.user.groups.filter(
                    name__in=("مدیر فروشگاه", "ادمین عملیاتی")
                ).exists():
                    field.read_only = True
        return fields

    def validate(self, attrs):
        if self.instance is None:
            attrs.pop('status', None)
        order_type = attrs.get('order_type', Order.OrderType.TAKEAWAY)
        table_token = attrs.get("table_token")
        table_number = attrs.get("table_number")
        if order_type == Order.OrderType.DINE_IN:
            if table_token:
                try:
                    table = CafeTable.objects.get(qr_token=table_token)
                except CafeTable.DoesNotExist as exc:
                    raise serializers.ValidationError({
                        "table_token": "QR میز معتبر نیست."
                    }) from exc
                if table_number is not None and table_number != table.table_number:
                    raise serializers.ValidationError({
                        "table_number": "شماره میز با QR اسکن‌شده مطابقت ندارد."
                    })
                attrs["table_number"] = table.table_number
            elif table_number is None:
                raise serializers.ValidationError({
                    "table_number": "برای سفارش حضوری، انتخاب میز الزامی است."
                })
        elif table_token or table_number is not None:
            raise serializers.ValidationError({
                "table_number": "انتخاب میز فقط برای سفارش حضوری مجاز است."
            })
        if order_type == Order.OrderType.DINE_IN and not attrs.get('table_number'):
            raise serializers.ValidationError({
                'table_number': 'برای سفارش حضوری، انتخاب میز الزامی است.'
            })
        if order_type == Order.OrderType.DELIVERY and not attrs.get('address', '').strip():
            raise serializers.ValidationError({
                'address': 'An address is required for delivery orders.'
            })
        request = self.context.get("request")
        if (
            order_type == Order.OrderType.DELIVERY
            and request
            and not request.user.is_authenticated
        ):
            raise serializers.ValidationError({
                "order_type": "برای سفارش با پیک، ابتدا وارد حساب کاربری شوید."
            })
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        table_token = validated_data.pop("table_token", None)
        selected_table = None
        if validated_data.get("order_type") == Order.OrderType.DINE_IN:
            selected_table = CafeTable.objects.select_for_update().filter(
                table_number=validated_data.get("table_number")
            ).first()
            if selected_table is None:
                raise serializers.ValidationError({
                    "table_number": "میز انتخاب‌شده وجود ندارد."
                })
            if table_token and str(selected_table.qr_token) != str(table_token):
                raise serializers.ValidationError({
                    "table_token": "QR میز با میز انتخاب‌شده مطابقت ندارد."
                })
            if selected_table.is_occupied:
                raise serializers.ValidationError({
                    "table_number": "این میز در حال حاضر اشغال است."
                })

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
                unit_price=product.discounted_price,
                note=item_data.get('note', ''),
            )

        order.calculate_total()
        if selected_table is not None:
            selected_table.is_occupied = True
            selected_table.save(update_fields=["is_occupied"])
        return order
