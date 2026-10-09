# Brewly Cafe Backend

Django + Django REST Framework backend for an online cafe menu.

## Features

- Django Admin for adding, editing, deleting products and categories
- REST API for categories, products and orders
- Filtering by category, price, available, featured, temperature, caffeine
- Search products by name/description/category
- Swagger API docs
- Seed command with many cafe products and image URLs

## Setup

```bash
python -m venv .venv
source .venv/bin/activate  # mac/linux
# .venv\Scripts\activate   # windows

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_menu
python manage.py runserver
```

## Important URLs

- Admin: http://127.0.0.1:8000/admin/
- Swagger: http://127.0.0.1:8000/api/docs/
- Categories: http://127.0.0.1:8000/api/menu/categories/
- Products: http://127.0.0.1:8000/api/menu/products/

## API Examples

```txt
GET /api/menu/products/
GET /api/menu/products/?category=coffee
GET /api/menu/products/?category=desserts
GET /api/menu/products/?search=latte
GET /api/menu/products/?featured=true
GET /api/menu/products/?min_price=90000&max_price=150000
GET /api/menu/products/?ordering=-price
```

Create order:

```json
POST /api/orders/
{
  "customer_name": "Ali",
  "phone": "09120000000",
  "order_type": "takeaway",
  "note": "No sugar please",
  "items": [
    {"product": 1, "quantity": 2},
    {"product": 5, "quantity": 1}
  ]
}
```

Creating an order checks each product's current availability and stock and
decrements stock in the same database transaction. If the requested quantity
is no longer available, the API returns `400 Bad Request` and does not create
the order or change any stock.

## Category Slugs

- coffee
- hot-drinks
- cold-drinks
- desserts
- equipment
- special-offers
