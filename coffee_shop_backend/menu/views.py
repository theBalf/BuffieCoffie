from django.db.models import Avg
from django_filters.rest_framework import FilterSet, filters
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import IsAdminOrReadOnly
from orders.models import Order, OrderItem
from .models import Category, Product, ProductRating
from .serializers import CategorySerializer, ProductRatingSerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
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
    permission_classes = [IsAdminOrReadOnly]
    queryset = (
        Product.objects.select_related('category')
        .prefetch_related('discount_groups')
        .annotate(average_rating=Avg("ratings__rating"))
        .order_by(*Product._meta.ordering)
        .all()
    )
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'created_at', 'name', 'preparation_time']

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        url_path="rate",
    )
    def rate(self, request, slug=None):
        product = self.get_object()
        can_rate = OrderItem.objects.filter(
            product=product,
            order__user=request.user,
        ).exclude(order__status=Order.Status.CANCELLED).exists()
        if not can_rate:
            return Response(
                {"detail": "برای امتیاز دادن باید این محصول را در یک سفارش ثبت کرده باشید."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ProductRatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ProductRating.objects.update_or_create(
            product=product,
            user=request.user,
            defaults={"rating": serializer.validated_data["rating"]},
        )

        response_product = Product.objects.filter(pk=product.pk).annotate(
            average_rating=Avg("ratings__rating")
        ).get()
        return Response(
            {
                "rating": ProductSerializer(response_product).data["rating"],
                "user_rating": float(serializer.validated_data["rating"]),
            }
        )
