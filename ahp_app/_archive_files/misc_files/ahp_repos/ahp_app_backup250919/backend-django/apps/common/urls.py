"""
URLs for Common API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'activity-logs', views.ActivityLogViewSet, basename='activitylog')
router.register(r'settings', views.SystemSettingsViewSet, basename='systemsettings')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]