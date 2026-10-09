from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Category, Product


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
    ]

    list_filter = [
        "category",
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
        "price",
        "stock",
        "is_available",
        "is_featured",
    ]