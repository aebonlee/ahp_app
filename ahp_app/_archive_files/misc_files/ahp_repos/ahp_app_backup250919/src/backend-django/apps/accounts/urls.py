"""
URLs for Account API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Basic authentication endpoints only
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
]