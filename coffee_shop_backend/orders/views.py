from rest_framework import viewsets
from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related('items__product').all()
    serializer_class = OrderSerializer
    filterset_fields = ['status', 'order_type', 'phone']
    search_fields = ['customer_name', 'phone']
    ordering_fields = ['created_at', 'total_price']
