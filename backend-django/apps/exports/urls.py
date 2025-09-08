"""
URLs for Export API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'jobs', views.ExportViewSet, basename='export-job')
router.register(r'templates', views.ExportTemplateViewSet, basename='export-template')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]