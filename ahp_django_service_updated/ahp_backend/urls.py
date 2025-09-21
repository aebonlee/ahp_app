"""
AHP Backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
import os


def check_database_status():
    """Check database connection and table status"""
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            
            # Check if tables exist
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            return {
                'connection': 'OK',
                'tables_count': len(tables),
                'tables': tables[:10],  # First 10 tables
                'has_migrations': 'django_migrations' in tables
            }
    except Exception as e:
        return {
            'connection': 'FAILED',
            'error': str(e)
        }

# API URL patterns
api_patterns = [
    # Authentication
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Apps
    path('accounts/', include('apps.accounts.urls')),
    path('projects/', include('apps.projects.urls')),
    path('evaluations/', include('apps.evaluations.urls')),
    path('analysis/', include('apps.analysis.urls')),
]

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API v1 (legacy compatibility)
    path('api/v1/', include(api_patterns)),
    
    # API service (new frontend endpoints)
    path('api/service/', include(api_patterns)),
    
    # Health check for Render.com
    path('health/', lambda request: JsonResponse({'status': 'healthy'})),
    
    # Database status check
    path('db-status/', lambda request: JsonResponse({
        'database': check_database_status(),
        'env_vars': {
            'DEBUG': os.environ.get('DEBUG', 'Not set'),
            'DATABASE_URL': 'Set' if os.environ.get('DATABASE_URL') else 'Not set',
            'POSTGRES_DB': 'Set' if os.environ.get('POSTGRES_DB') else 'Not set',
            'POSTGRES_USER': 'Set' if os.environ.get('POSTGRES_USER') else 'Not set',
            'POSTGRES_PASSWORD': 'Set' if os.environ.get('POSTGRES_PASSWORD') else 'Not set',
        }
    })),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Admin site customization
admin.site.site_header = "AHP Platform Admin"
admin.site.site_title = "AHP Admin Portal"
admin.site.index_title = "Welcome to AHP Platform Administration"