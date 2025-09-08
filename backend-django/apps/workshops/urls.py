"""
URLs for Workshop API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'workshops', views.WorkshopViewSet, basename='workshop')
router.register(r'sessions', views.WorkshopSessionViewSet, basename='workshop-session')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]