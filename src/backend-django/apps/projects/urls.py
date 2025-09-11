"""
URLs for Project API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'criteria', views.CriteriaViewSet, basename='criteria')
router.register(r'templates', views.ProjectTemplateViewSet, basename='template')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]