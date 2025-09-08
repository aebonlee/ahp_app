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
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

@api_view(['GET'])
def api_root(request):
    """API Root endpoint"""
    return Response({
        'message': 'AHP Platform Django API v1.0 - PRODUCTION READY',
        'status': 'Complete AHP Platform - All Features Enabled',
        'version': '1.0.0',
        'deployment': 'Stage 4 Final - All Apps Active',
        'endpoints': {
            'auth': {
                'token': '/api/v1/auth/token/',
                'refresh': '/api/v1/auth/token/refresh/',
                'verify': '/api/v1/auth/token/verify/',
            },
            'accounts': '/api/v1/accounts/',
            'common': '/api/v1/common/',
            'projects': '/api/v1/projects/',
            'evaluations': '/api/v1/evaluations/',
            'analysis': '/api/v1/analysis/',
            'workshops': '/api/v1/workshops/',
            'exports': '/api/v1/exports/',
        },
        'features': [
            'User Management & Authentication',
            'AHP Project Management',
            'Pairwise Comparison Evaluations',
            'Advanced AHP Analysis & Calculations',
            'Workshop & Collaboration Tools',
            'Data Export & Reporting'
        ]
    }
    })

# API 패턴 - 기본 기능만 활성화
api_patterns = [
    # API Root
    path('', api_root, name='api_root'),
    
    # Authentication
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # App URLs - 🎉 Stage 4 FINAL: Complete AHP Platform
    path('accounts/', include('apps.accounts.urls')),   # ✅ Stage 1
    path('common/', include('apps.common.urls')),       # ✅ Stage 2
    path('projects/', include('apps.projects.urls')),   # ✅ Stage 2
    path('evaluations/', include('apps.evaluations.urls')),  # ✅ Stage 3
    path('analysis/', include('apps.analysis.urls')),   # ✅ Stage 3
    path('workshops/', include('apps.workshops.urls')), # ✅ Stage 4
    path('exports/', include('apps.exports.urls')),     # ✅ Stage 4
]

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API
    path('api/v1/', include(api_patterns)),
    
    # Health check for Render.com
    path('health/', lambda request: JsonResponse({'status': 'healthy'})),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Admin site customization
admin.site.site_header = "AHP Platform Admin"
admin.site.site_title = "AHP Admin Portal"
admin.site.index_title = "Welcome to AHP Platform Administration"