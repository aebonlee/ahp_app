"""
URLs for Common API endpoints
"""
from django.urls import path
from . import health_views

urlpatterns = [
    # Health check endpoints
    path('health/', health_views.health_check, name='health-check'),
    path('db-status/', health_views.db_status, name='db-status'),
    path('status/', health_views.api_status, name='api-status'),
]