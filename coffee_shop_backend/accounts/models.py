from django.conf import settings
from django.db import models
from django.db.models import Q


class CustomerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_profile",
    )
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("phone",),
                condition=~Q(phone=""),
                name="unique_nonempty_customer_phone",
            ),
        ]

    def __str__(self):
        return self.user.get_username()
