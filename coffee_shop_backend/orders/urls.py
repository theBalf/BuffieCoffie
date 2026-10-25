from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    CafeTableDetailView,
    CafeTableListView,
    CafeTableQrLookupView,
    OrderViewSet,
)

router = DefaultRouter()
router.register('', OrderViewSet, basename='order')

urlpatterns = [
    path('tables/', CafeTableListView.as_view(), name='cafe-table-list'),
    path('tables/<int:pk>/', CafeTableDetailView.as_view(), name='cafe-table-detail'),
    path('tables/qr/<uuid:token>/', CafeTableQrLookupView.as_view(), name='cafe-table-qr'),
    *router.urls,
]
