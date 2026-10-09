from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image_url', 'is_active', 'products_count', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        request = self.context.get("request")

        if obj.image:
            url = obj.image.url

            if request:
                return request.build_absolute_uri(url)

            return url

        return obj.image_url
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'image_url',
            'category', 'category_name', 'category_slug',
            'temperature', 'has_caffeine', 'calories', 'preparation_time',
            'is_available', 'is_featured', 'stock', 'created_at', 'updated_at',
        ]
