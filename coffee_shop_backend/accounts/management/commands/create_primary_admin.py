import os

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command

from accounts.permissions import MANAGER_GROUP


class Command(BaseCommand):
    help = "Create or update the primary site owner from environment credentials."

    def handle(self, *args, **options):
        username = os.environ.get("BUFFIE_OWNER_USERNAME", "balf")
        password = os.environ.get("BUFFIE_OWNER_PASSWORD")
        if not password:
            raise CommandError("Set BUFFIE_OWNER_PASSWORD before running this command.")

        call_command("setup_access_roles")
        manager_group = Group.objects.get(name=MANAGER_GROUP)
        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(username=username)
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        for former_owner in user_model.objects.filter(is_superuser=True).exclude(
            pk=user.pk
        ):
            former_owner.is_superuser = False
            former_owner.is_staff = True
            former_owner.user_permissions.clear()
            former_owner.save(update_fields=("is_superuser", "is_staff"))
            former_owner.groups.add(manager_group)

        action = "Created" if created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"{action} primary administrator '{username}'."
            )
        )
