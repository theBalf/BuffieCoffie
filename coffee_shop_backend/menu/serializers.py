from decimal import Decimal, ROUND_HALF_UP
from rest_framework import serializers
from .models import Category, Product, ProductRating


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image_url', 'is_active', 'products_count', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    image_url = serializers.SerializerMethodField()
    discount_percentage = serializers.IntegerField(read_only=True)
    discounted_price = serializers.IntegerField(read_only=True)
    rating = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        request = self.context.get("request")

        if obj.image:
            url = obj.image.url

            if request:
                return request.build_absolute_uri(url)

            return url

        return obj.image_url

    def get_rating(self, obj):
        average = getattr(obj, "average_rating", None)
        if average is None:
            return float(obj.initial_rating)
        return float(
            (Decimal(average) * 2).quantize(
                Decimal("1"),
                rounding=ROUND_HALF_UP,
            )
            / 2
        )

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            from accounts.permissions import is_manager

            if not is_manager(request.user):
                fields["price"].read_only = True
        return fields
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'image_url',
            'category', 'category_name', 'category_slug',
            'temperature', 'has_caffeine', 'calories', 'preparation_time',
            'is_available', 'is_featured', 'stock', 'discount_percentage',
            'discounted_price', 'created_at', 'updated_at',
            'rating',
        ]


class ProductRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRating
        fields = ["rating"]

    def validate_rating(self, value):
        if value * 2 != int(value * 2):
            raise serializers.ValidationError(
                "امتیاز باید با گام‌های نیم‌ستاره‌ای از ۰٫۵ تا ۵ باشد."
            )
        return value
