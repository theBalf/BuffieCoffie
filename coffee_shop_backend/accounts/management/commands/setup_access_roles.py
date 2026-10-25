from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand
from django.contrib.contenttypes.models import ContentType

from menu.models import Category, DiscountGroup, Product
from orders.models import Order, OrderItem

from accounts.permissions import ADMIN_GROUP, MANAGER_GROUP


class Command(BaseCommand):
    help = "Create the manager and operations-admin groups with scoped permissions."

    def handle(self, *args, **options):
        admin_group, _ = Group.objects.get_or_create(name=ADMIN_GROUP)
        manager_group, _ = Group.objects.get_or_create(name=MANAGER_GROUP)

        operational_permissions = []
        for model, actions in (
            (Category, ("view",)),
            (Product, ("view", "change")),
            (Order, ("view", "change")),
            (OrderItem, ("view",)),
        ):
            content_type = ContentType.objects.get_for_model(model)
            for action in actions:
                operational_permissions.append(
                    Permission.objects.get(
                        content_type=content_type,
                        codename=f"{action}_{model._meta.model_name}",
                    )
                )
        admin_group.permissions.set(operational_permissions)

        manager_permissions = []
        for model in (Category, Product, DiscountGroup, Order, OrderItem):
            content_type = ContentType.objects.get_for_model(model)
            manager_permissions.extend(
                Permission.objects.filter(content_type=content_type)
            )
        user_content_type = ContentType.objects.get(
            app_label="auth",
            model="user",
        )
        manager_permissions.extend(
            Permission.objects.filter(
                content_type=user_content_type,
                codename__in=(
                    "add_user",
                    "change_user",
                    "delete_user",
                    "view_user",
                ),
            )
        )
        manager_group.permissions.set(manager_permissions)

        self.stdout.write(
            self.style.SUCCESS(
                "Configured manager and operations-admin access roles."
            )
        )
