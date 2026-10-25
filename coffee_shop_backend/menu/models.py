import random
from decimal import Decimal

from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils.text import slugify


def random_initial_rating():
    return Decimal(random.choice(("3.0", "3.5", "4.0", "4.5", "5.0")))


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    class Temperature(models.TextChoices):
        HOT = "hot", "گرم"
        COLD = "cold", "سرد"
        BOTH = "both", "گرم و سرد"
        NONE = "none", "ندارد"

    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    description = models.TextField(blank=True)
    price = models.PositiveIntegerField(help_text='Price in toman')
    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
    )
    image_url = models.URLField(blank=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.PROTECT)

    temperature = models.CharField(max_length=10, choices=Temperature.choices, default=Temperature.NONE)
    has_caffeine = models.BooleanField(default=False)
    calories = models.PositiveIntegerField(default=0)
    preparation_time = models.PositiveIntegerField(default=5, help_text='Minutes')

    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    stock = models.PositiveIntegerField(default=100)
    initial_rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=random_initial_rating,
        validators=[
            MinValueValidator(Decimal("0.5")),
            MaxValueValidator(Decimal("5.0")),
        ],
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category__name", "name"]
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name, allow_unicode=True)
            slug = base_slug
            counter = 2
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def discount_percentage(self):
        return max(
            (
                group.discount_percentage
                for group in self.discount_groups.all()
                if group.is_active
            ),
            default=0,
        )

    @property
    def discounted_price(self):
        percentage = self.discount_percentage
        return (self.price * (100 - percentage) + 50) // 100


class DiscountGroup(models.Model):
    name = models.CharField(max_length=120, unique=True, verbose_name="نام گروه")
    description = models.TextField(blank=True, verbose_name="توضیحات")
    discount_percentage = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        verbose_name="درصد تخفیف",
        help_text="اگر محصول در چند گروه فعال باشد، بیشترین درصد تخفیف اعمال می‌شود.",
    )
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    products = models.ManyToManyField(
        Product,
        related_name="discount_groups",
        blank=True,
        verbose_name="محصولات",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "گروه تخفیف"
        verbose_name_plural = "گروه‌های تخفیف"

    def __str__(self):
        return f"{self.name} ({self.discount_percentage}%)"


class ProductRating(models.Model):
    product = models.ForeignKey(
        Product,
        related_name="ratings",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="product_ratings",
        on_delete=models.CASCADE,
    )
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[
            MinValueValidator(Decimal("0.5")),
            MaxValueValidator(Decimal("5.0")),
        ],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=("product", "user"),
                name="unique_product_rating_per_user",
            ),
            models.CheckConstraint(
                condition=models.Q(rating__gte=0.5, rating__lte=5.0),
                name="product_rating_within_bounds",
            ),
        ]

    def __str__(self):
        return f"{self.user} rated {self.product}: {self.rating}"
