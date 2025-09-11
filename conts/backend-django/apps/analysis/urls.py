"""
URLs for Analysis API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'analysis', views.AnalysisViewSet, basename='analysis')
router.register(r'sensitivity', views.SensitivityAnalysisViewSet, basename='sensitivity')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]