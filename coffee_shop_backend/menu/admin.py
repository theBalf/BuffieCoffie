from django.contrib import admin
from accounts.permissions import is_manager
from unfold.admin import ModelAdmin

from .models import Category, DiscountGroup, Product


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = [
        "name",
        "slug",
        "is_active",
        "created_at",
    ]

    list_filter = [
        "is_active",
    ]

    search_fields = [
        "name",
        "slug",
    ]

    prepopulated_fields = {
        "slug": ("name",),
    }

    def has_add_permission(self, request):
        return is_manager(request.user)

    def has_change_permission(self, request, obj=None):
        return is_manager(request.user)

    def has_delete_permission(self, request, obj=None):
        return is_manager(request.user)


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = [
        "name",
        "category",
        "price",
        "stock",
        "is_available",
        "is_featured",
        "temperature",
        "preparation_time",
    ]

    list_filter = [
        "category",
        "discount_groups",
        "is_available",
        "is_featured",
        "temperature",
        "has_caffeine",
    ]

    search_fields = [
        "name",
        "description",
        "category__name",
    ]

    prepopulated_fields = {
        "slug": ("name",),
    }

    list_editable = [
        "stock",
        "is_available",
        "is_featured",
        "preparation_time",
    ]

    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(super().get_readonly_fields(request, obj))
        if not is_manager(request.user):
            readonly_fields.extend(["price", "discount_groups"])
        return readonly_fields

    def has_add_permission(self, request):
        return is_manager(request.user)

    def has_delete_permission(self, request, obj=None):
        return is_manager(request.user)


@admin.register(DiscountGroup)
class DiscountGroupAdmin(ModelAdmin):
    list_display = [
        "name",
        "discount_percentage",
        "is_active",
        "product_count",
        "updated_at",
    ]
    list_filter = ["is_active"]
    search_fields = ["name", "description", "products__name"]
    filter_horizontal = ["products"]

    @admin.display(description="تعداد محصولات")
    def product_count(self, obj):
        return obj.products.count()

    def has_add_permission(self, request):
        return is_manager(request.user)

    def has_change_permission(self, request, obj=None):
        return is_manager(request.user)

    def has_delete_permission(self, request, obj=None):
        return is_manager(request.user)