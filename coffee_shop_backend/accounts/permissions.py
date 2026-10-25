from rest_framework.permissions import SAFE_METHODS, BasePermission

MANAGER_GROUP = "مدیر فروشگاه"
ADMIN_GROUP = "ادمین عملیاتی"


def is_manager(user):
    return user.is_authenticated and (
        user.is_superuser or user.groups.filter(name=MANAGER_GROUP).exists()
    )


def is_catalog_admin(user):
    return user.is_authenticated and (
        user.is_superuser
        or user.groups.filter(name__in=(MANAGER_GROUP, ADMIN_GROUP)).exists()
    )


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        if is_manager(request.user):
            return True
        return (
            view.basename == "product"
            and request.method in ("PUT", "PATCH")
            and is_catalog_admin(request.user)
        )


class OrderAccessPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method == "POST":
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        return request.method in SAFE_METHODS or is_catalog_admin(request.user)
