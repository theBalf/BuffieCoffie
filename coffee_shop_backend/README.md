# Brewly Cafe Backend

Django + Django REST Framework backend for an online cafe menu.

## Features

- Django Admin for adding, editing, deleting products and categories
- REST API for categories, products and orders
- Customer registration, session login, and editable customer profiles
- Staff-only product/category management and order status updates
- Cafe table management with table-bound QR ordering and occupancy tracking
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
- Account API: http://127.0.0.1:8000/api/accounts/

The React account page supports public registration and login. Customers can
save their name, email, phone number, and address and view their own orders.
Orders submitted while signed in are associated with that account. Staff
accounts are separated into two roles: operations admins can view prices and
reports and update inventory, availability, featured status, preparation time,
and order status; store managers can also manage prices, discounts, and other
staff accounts. The primary owner is a separate superuser and cannot be
managed by store managers. Regular accounts cannot access staff APIs or Django
Admin.

The orders API creates eight test cafe tables during migration. Customers can
select an available table for dine-in orders, or scan its table-specific QR
code to lock the order to that table. An active dine-in order occupies its
table until it is delivered or cancelled. Staff can manage tables and their
QR codes from the dashboard.

Account API endpoints:

```txt
GET  /api/accounts/csrf/
GET  /api/accounts/me/
POST /api/accounts/register/
POST /api/accounts/login/
POST /api/accounts/logout/
GET  /api/accounts/profile/
PATCH /api/accounts/profile/
GET  /api/orders/tables/
GET  /api/orders/tables/qr/<table-token>/
GET  /api/orders/tables/?manage=true  (staff)
POST /api/orders/tables/              (staff)
PATCH /api/orders/tables/<id>/        (staff; update occupied status)
```

Products have a persisted initial half-star rating, and customers can update
their rating in the account page for products included in their orders. Each
customer has one rating per product (0.5 to 5 in half-star increments); product
ratings show the average of customer votes rounded up to the nearest half star.
Cancelled orders cannot be used to rate a product.

After applying migrations, create/update the access groups and the primary
owner account from environment variables (PowerShell):

```powershell
$env:BUFFIE_OWNER_PASSWORD = "<choose-a-strong-password>"
python manage.py create_primary_admin
Remove-Item Env:BUFFIE_OWNER_PASSWORD
```

The command creates the `balf` primary owner and demotes any previous
superusers to store managers, preserving their existing passwords. Use the
manager account to create additional staff and assign either the store manager
or operations admin group. Do not reuse the development password in a
deployed environment.

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
