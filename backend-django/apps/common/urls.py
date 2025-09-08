"""
URLs for Common API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Create router and register viewsets
router = DefaultRouter()

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]