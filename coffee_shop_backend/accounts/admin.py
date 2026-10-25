from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.models import Group

from .models import CustomerProfile
from .permissions import ADMIN_GROUP, MANAGER_GROUP, is_manager

User = get_user_model()


class ManagedUserAdmin(DjangoUserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("اطلاعات شخصی", {"fields": ("first_name", "last_name", "email")}),
        ("دسترسی", {"fields": ("is_active", "is_staff", "groups")}),
        ("تاریخ‌ها", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "password1",
                    "password2",
                    "is_staff",
                    "groups",
                ),
            },
        ),
    )
    list_display = ("username", "email", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active", "groups")
    search_fields = ("username", "email", "first_name", "last_name")

    def has_module_permission(self, request):
        return is_manager(request.user)

    def has_view_permission(self, request, obj=None):
        return is_manager(request.user) and (
            obj is None or request.user.is_superuser or not obj.is_superuser
        )

    def has_add_permission(self, request):
        return is_manager(request.user)

    def has_change_permission(self, request, obj=None):
        if not is_manager(request.user):
            return False
        if obj is None:
            return True
        if obj.is_superuser:
            return request.user.is_superuser
        return request.user.is_superuser or obj.pk != request.user.pk

    def has_delete_permission(self, request, obj=None):
        if not is_manager(request.user):
            return False
        if obj is None:
            return True
        return request.user.is_superuser or (
            not obj.is_superuser and obj.pk != request.user.pk
        )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if request.user.is_superuser:
            return queryset
        return queryset.filter(is_superuser=False)

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if obj and obj.pk == request.user.pk and not request.user.is_superuser:
            return tuple(
                (
                    title,
                    {
                        **options,
                        "fields": tuple(
                            field
                            for field in options["fields"]
                            if field != "groups"
                        ),
                    },
                )
                for title, options in fieldsets
            )
        return fieldsets

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "groups" and not request.user.is_superuser:
            kwargs["queryset"] = Group.objects.filter(
                name__in=(ADMIN_GROUP, MANAGER_GROUP)
            )
        return super().formfield_for_manytomany(db_field, request, **kwargs)


admin.site.unregister(User)
admin.site.register(User, ManagedUserAdmin)


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone")
    search_fields = ("user__username", "user__email", "phone")

    def has_module_permission(self, request):
        return is_manager(request.user)

    def has_view_permission(self, request, obj=None):
        return is_manager(request.user)

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
