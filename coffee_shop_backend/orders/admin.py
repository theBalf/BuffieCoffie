from django.contrib import admin
from accounts.permissions import is_catalog_admin
from .models import CafeTable, Order, OrderItem


@admin.register(CafeTable)
class CafeTableAdmin(admin.ModelAdmin):
    list_display = ["table_number", "is_occupied", "qr_token"]
    list_filter = ["is_occupied"]
    readonly_fields = ["qr_token"]
    ordering = ["table_number"]

    def has_add_permission(self, request):
        return is_catalog_admin(request.user)

    def has_change_permission(self, request, obj=None):
        return is_catalog_admin(request.user)

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['unit_price', 'total_price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'phone', 'order_type', 'status', 'total_price', 'created_at']
    list_filter = ['status', 'order_type', 'created_at']
    search_fields = ['customer_name', 'phone']
    list_editable = ['status']
    date_hierarchy = 'created_at'
    inlines = [OrderItemInline]

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return is_catalog_admin(request.user)

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser:
            return []
        return [
            field.name
            for field in self.model._meta.fields
            if field.name != "status"
        ]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'unit_price', 'total_price']
    search_fields = ['product__name', 'order__customer_name']

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
