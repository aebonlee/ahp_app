"""
URLs for Workshop API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'sessions', views.WorkshopSessionViewSet, basename='workshop-session')
router.register(r'participants', views.WorkshopParticipantViewSet, basename='workshop-participant')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]