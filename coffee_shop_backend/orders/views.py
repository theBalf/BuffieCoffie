from datetime import timedelta
from uuid import uuid4

from django.db import transaction
from django.db.models import DecimalField, OuterRef, Prefetch, Q, Subquery
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from accounts.permissions import (
    ADMIN_GROUP,
    MANAGER_GROUP,
    OrderAccessPermission,
    is_catalog_admin,
)
from accounts.models import CustomerProfile
from accounts.serializers import normalize_phone
from .models import CafeTable, Order, OrderItem
from menu.models import ProductRating
from .serializers import (
    CafeTableSerializer,
    OrderSerializer,
    PublicCafeTableSerializer,
)

class GuestOrderClaimItemSerializer(serializers.Serializer):
    id = serializers.IntegerField(min_value=1)
    guest_claim_token = serializers.UUIDField()


class GuestOrderClaimSerializer(serializers.Serializer):
    orders = serializers.ListField(
        child=GuestOrderClaimItemSerializer(),
        allow_empty=True,
        max_length=50,
    )


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [OrderAccessPermission]
    filterset_fields = ['status', 'order_type', 'phone']
    search_fields = ['customer_name', 'phone']
    ordering_fields = ['created_at', 'total_price']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            item_queryset = OrderItem.objects.annotate(
                current_user_rating=Subquery(
                    ProductRating.objects.filter(
                        product_id=OuterRef("product_id"),
                        user=user,
                    ).values("rating")[:1],
                    output_field=DecimalField(max_digits=2, decimal_places=1),
                )
            ).select_related("product")
            queryset = queryset.prefetch_related(
                Prefetch("items", queryset=item_queryset)
            )
        else:
            queryset = queryset.prefetch_related("items__product")
        if (
            user.is_authenticated
            and user.is_staff
            and self.request.query_params.get('mine') != 'true'
            and (
                user.is_superuser
                or user.groups.filter(
                    name__in=(MANAGER_GROUP, ADMIN_GROUP)
                ).exists()
            )
        ):
            return queryset
        return queryset.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if not request.user.is_authenticated:
            response.data["guest_claim_token"] = self._created_guest_claim_token
        return response

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        url_path="claim-guests",
    )
    def claim_guests(self, request):
        serializer = GuestOrderClaimSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile, _ = CustomerProfile.objects.get_or_create(user=request.user)
        account_phone = normalize_phone(profile.phone)
        claimed_ids = []

        if account_phone:
            with transaction.atomic():
                for guest_order in serializer.validated_data["orders"]:
                    order = Order.objects.select_for_update().filter(
                        pk=guest_order["id"],
                        guest_claim_token=guest_order["guest_claim_token"],
                        user__isnull=True,
                    ).first()
                    if order and normalize_phone(order.phone) == account_phone:
                        order.user = request.user
                        order.guest_claim_token = None
                        order.save(update_fields=["user", "guest_claim_token"])
                        claimed_ids.append(order.pk)

        return Response({"claimed_ids": claimed_ids})

    @action(detail=False, methods=["get"])
    def attention(self, request):
        if not is_catalog_admin(request.user):
            raise PermissionDenied("اجازهٔ مشاهدهٔ سفارش‌های نیازمند پیگیری را ندارید.")

        delayed_cutoff = timezone.now() - timedelta(minutes=5)
        queryset = self.get_queryset().filter(
            Q(status=Order.Status.READY)
            | Q(
                status__in=(Order.Status.PENDING, Order.Status.PREPARING),
                created_at__lte=delayed_cutoff,
            )
        )
        return Response(self.get_serializer(queryset, many=True).data)

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        if user is None:
            order = serializer.save(user=None, guest_claim_token=uuid4())
            self._created_guest_claim_token = str(order.guest_claim_token)
            return
        serializer.save(user=user, guest_claim_token=None)

    def perform_update(self, serializer):
        instance = self.get_object()
        next_status = serializer.validated_data.get("status", instance.status)
        terminal_statuses = (Order.Status.DELIVERED, Order.Status.CANCELLED)

        with transaction.atomic():
            table = None
            if instance.order_type == Order.OrderType.DINE_IN:
                table = CafeTable.objects.select_for_update().filter(
                    table_number=instance.table_number
                ).first()

            if (
                table
                and instance.status in terminal_statuses
                and next_status not in terminal_statuses
                and table.is_occupied
            ):
                raise ValidationError({
                    "status": "میز این سفارش اکنون در اختیار سفارش دیگری است."
                })

            serializer.save()
            if table:
                table.is_occupied = next_status not in terminal_statuses
                table.save(update_fields=["is_occupied"])


class CafeTableListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.query_params.get("manage") == "true":
            if not is_catalog_admin(request.user):
                raise PermissionDenied("اجازهٔ مدیریت میزهای کافه را ندارید.")
            serializer = CafeTableSerializer(CafeTable.objects.all(), many=True)
            return Response(serializer.data)

        tables = CafeTable.objects.all()
        serializer = PublicCafeTableSerializer(tables, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not is_catalog_admin(request.user):
            raise PermissionDenied("اجازهٔ ساخت میز جدید را ندارید.")

        serializer = CafeTableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CafeTableDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not is_catalog_admin(request.user):
            raise PermissionDenied("اجازهٔ مدیریت میزهای کافه را ندارید.")

        if set(request.data) != {"is_occupied"}:
            raise ValidationError({
                "detail": "فقط وضعیت اشغال میز قابل تغییر است."
            })

        with transaction.atomic():
            table = get_object_or_404(
                CafeTable.objects.select_for_update(),
                pk=pk,
            )
            serializer = CafeTableSerializer(
                table,
                data={"is_occupied": request.data["is_occupied"]},
                partial=True,
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(serializer.data)


class CafeTableQrLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            table = CafeTable.objects.get(qr_token=token)
        except CafeTable.DoesNotExist as exc:
            raise ValidationError({"table_token": "QR میز معتبر نیست."}) from exc

        return Response({
            "table_number": table.table_number,
            "is_occupied": table.is_occupied,
        })
