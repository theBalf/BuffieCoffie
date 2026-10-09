from django.db import models
from menu.models import Product


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PREPARING = 'preparing', 'Preparing'
        READY = 'ready', 'Ready'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'

    class OrderType(models.TextChoices):
        DINE_IN = 'dine_in', 'Dine in'
        TAKEAWAY = 'takeaway', 'Takeaway'
        DELIVERY = 'delivery', 'Delivery'

    customer_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=30)
    order_type = models.CharField(max_length=20, choices=OrderType.choices, default=OrderType.TAKEAWAY)
    table_number = models.PositiveIntegerField(null=True, blank=True)
    address = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    note = models.TextField(blank=True)
    total_price = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "سفارش"
        verbose_name_plural = "سفارشات"


    def calculate_total(self):
        total = sum(item.total_price for item in self.items.all())
        self.total_price = total
        self.save(update_fields=['total_price'])
        return total

    def __str__(self):
        return f'Order #{self.id} - {self.customer_name}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.PositiveIntegerField(default=0)
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = "آیتم سفارش"
        verbose_name_plural = "آیتم‌های سفارش"


    @property
    def total_price(self):
        return self.unit_price * self.quantity

    def save(self, *args, **kwargs):
        if not self.unit_price and self.product_id:
            self.unit_price = self.product.price
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.quantity} × {self.product.name}'
