"""
URLs for Account API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import social_views
from . import user_views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'users', user_views.UserViewSet, basename='user')
router.register(r'public-users', user_views.PublicUserViewSet, basename='public-user')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Social authentication endpoints
    path('social/urls/', social_views.social_login_urls, name='social-login-urls'),
    path('social/login/', social_views.social_login_token, name='social-login-token'),
    path('social/google/', social_views.GoogleLogin.as_view(), name='google-login'),
    path('social/kakao/', social_views.KakaoLogin.as_view(), name='kakao-login'),
    path('social/naver/', social_views.NaverLogin.as_view(), name='naver-login'),
    
    # User data endpoints
    path('dashboard/', views.user_dashboard, name='user-dashboard'),
    path('search/', views.search_users, name='search-users'),
]