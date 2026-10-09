from django.db import models
from django.utils.text import slugify


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
