from django_filters.rest_framework import FilterSet, filters
from rest_framework import viewsets
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']


class ProductFilter(FilterSet):
    category = filters.CharFilter(field_name='category__slug')
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    available = filters.BooleanFilter(field_name='is_available')
    featured = filters.BooleanFilter(field_name='is_featured')
    temperature = filters.CharFilter(field_name='temperature')

    class Meta:
        model = Product
        fields = ['category', 'available', 'featured', 'temperature', 'has_caffeine']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'created_at', 'name', 'preparation_time']
