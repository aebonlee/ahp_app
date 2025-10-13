"""
Temporary URL configuration - will transition to ahp_backend.urls
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
try:
    from apps.accounts.views import login_view as login_api, register as register_api
    from apps.accounts.jwt_views import custom_token_obtain_pair
    print("✅ Custom auth views imported successfully")
except ImportError as e:
    # Fallback if views are not available during migration
    print(f"⚠️ Custom auth views import failed: {e}")
    login_api = None
    register_api = None  
    custom_token_obtain_pair = None
import os
import sys
import django
from datetime import datetime


def check_database_status():
    """Check database connection and table status"""
    try:
        from django.db import connection
        from django.conf import settings
        
        db_engine = settings.DATABASES['default']['ENGINE']
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            
            # Check tables based on database type
            if 'postgresql' in db_engine:
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)
            else:  # SQLite
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%'
                """)
            
            tables = [row[0] for row in cursor.fetchall()]
            
            return {
                'connection': 'OK',
                'database_engine': db_engine,
                'tables_count': len(tables),
                'tables': tables,
                'has_migrations': 'django_migrations' in tables,
                'env_vars': {
                    'DEBUG': os.environ.get('DEBUG', 'Not set'),
                    'DATABASE_URL': 'Set' if os.environ.get('DATABASE_URL') else 'Not set',
                }
            }
    except Exception as e:
        return {
            'connection': 'FAILED',
            'error': str(e),
            'database_engine': 'Unknown'
        }


def test_projects_access():
    """Test direct access to projects without authentication"""
    try:
        from apps.projects.models import Project
        from django.db import connection
        
        # Test database connection first
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Try to count projects
        try:
            project_count = Project.objects.count()
            return {
                'status': 'SUCCESS',
                'project_count': project_count,
                'database_engine': connection.vendor,
                'message': 'Projects table accessible'
            }
        except Exception as db_error:
            # Try to see what tables actually exist
            with connection.cursor() as cursor:
                if connection.vendor == 'postgresql':
                    cursor.execute("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public'
                        ORDER BY table_name
                    """)
                else:  # SQLite
                    cursor.execute("""
                        SELECT name FROM sqlite_master 
                        WHERE type='table' AND name NOT LIKE 'sqlite_%'
                        ORDER BY name
                    """)
                
                tables = [row[0] for row in cursor.fetchall()]
                
                return {
                    'status': 'DB_ERROR',
                    'error': str(db_error),
                    'database_engine': connection.vendor,
                    'existing_tables': tables,
                    'looking_for': 'ahp_projects'
                }
        
    except Exception as e:
        return {
            'status': 'FAILED',
            'error': str(e),
            'connection_failed': True
        }


# API root view
def api_root(request):
    return JsonResponse({
        'message': 'AHP Platform API',
        'version': '1.0.0',
        'status': 'operational',
        'endpoints': {
            'auth': {
                'token': request.build_absolute_uri('/api/auth/token/'),
                'refresh': request.build_absolute_uri('/api/auth/token/refresh/'),
                'verify': request.build_absolute_uri('/api/auth/token/verify/')
            },
            'apps': {
                'accounts': request.build_absolute_uri('/api/accounts/'),
                'projects': request.build_absolute_uri('/api/projects/'),
                'evaluations': request.build_absolute_uri('/api/evaluations/'),
                'analysis': request.build_absolute_uri('/api/analysis/')
            }
        },
        'service_endpoints': {
            'auth': {
                'token': request.build_absolute_uri('/api/service/auth/token/'),
                'refresh': request.build_absolute_uri('/api/service/auth/token/refresh/'),
                'verify': request.build_absolute_uri('/api/service/auth/token/verify/')
            },
            'apps': {
                'accounts': request.build_absolute_uri('/api/service/accounts/'),
                'projects': request.build_absolute_uri('/api/service/projects/'),
                'evaluations': request.build_absolute_uri('/api/service/evaluations/'),
                'analysis': request.build_absolute_uri('/api/service/analysis/')
            }
        },
        'documentation': {
            'admin': request.build_absolute_uri('/admin/'),
            'health': request.build_absolute_uri('/health/'),
            'db_status': request.build_absolute_uri('/db-status/')
        }
    })


def health_check(request):
    return JsonResponse({'status': 'healthy'})


def api_health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'AHP Backend API'})


def home(request):
    return JsonResponse({
        'service': 'AHP Django Backend',
        'status': 'running',
        'deployment': 'SUCCESSFUL',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health/',
            'admin': '/admin/',
            'api_v1': '/api/v1/',
            'api_service': '/api/service/',
            'api_default': '/api/',
            'database_status': '/db-status/',
            'test_projects': '/test-projects/'
        },
        'features': [
            'User Authentication (JWT)',
            'Project Management',
            'AHP Evaluations',
            'Results Analysis',
            'Workshop Management',
            'Data Export'
        ]
    })


# API URL patterns
api_patterns = [
    # API root
    path('', api_root, name='api_root'),
    
    # JWT Authentication - Custom view that supports email/username
    path('auth/token/', custom_token_obtain_pair if custom_token_obtain_pair else TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Social Authentication
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/social/', include('allauth.socialaccount.urls')),
    
    # Apps  
    path('accounts/', include('apps.accounts.urls')),  # Re-enabled with correct path
    path('projects/', include('apps.projects.urls')),
    path('evaluations/', include('apps.evaluations.urls')),
    path('analysis/', include('apps.analysis.urls')),
]

# Add custom auth endpoints if available
if login_api and register_api:
    api_patterns += [
        path('auth/login/', login_api, name='api_login'),
        path('auth/register/', register_api, name='api_register'),
    ]

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Root API (default)
    path('api/', include(api_patterns)),
    
    # API v1 (legacy compatibility)  
    path('api/v1/', include(api_patterns)),
    
    # API service (new frontend endpoints)
    path('api/service/', include(api_patterns)),
    
    # Health check for Render.com
    path('health/', health_check),
    
    # Database status check  
    path('db-status/', lambda request: JsonResponse(check_database_status())),
    
    # Test projects without authentication
    path('test-projects/', lambda request: JsonResponse(test_projects_access())),
    
    # Simple deployment test
    path('test-deploy/', lambda request: JsonResponse({
        'status': 'success',
        'message': 'Backend is running',
        'django_version': django.get_version() if 'django' in sys.modules else 'unknown',
        'timestamp': datetime.now().isoformat() if 'datetime' in dir() else 'unknown'
    })),
    
    # Debug endpoints 
    path('debug/urls/', lambda request: JsonResponse({
        'available_patterns': [
            '/api/', '/api/v1/', '/api/service/',
            '/health/', '/db-status/', '/test-projects/',
            '/admin/', '/debug/urls/'
        ],
        'current_request': {
            'path': request.path,
            'method': request.method,
            'headers': dict(request.headers)
        }
    })),
    
    # Root endpoint with service info
    path('', home),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Admin site customization
admin.site.site_header = "AHP Platform Admin"
admin.site.site_title = "AHP Admin Portal"
admin.site.index_title = "Welcome to AHP Platform Administration"