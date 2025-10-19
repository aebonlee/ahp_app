"""
Simple URL configuration for debugging
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

def simple_api_root(request):
    return JsonResponse({
        'status': 'working',
        'message': 'AHP API is running',
        'endpoints': {
            'auth_token': '/api/auth/token/',
            'projects': '/api/projects/',
            'accounts': '/api/accounts/',
        }
    })

def health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'AHP Backend'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check),
    path('api/', simple_api_root),
    path('api/auth/token/', TokenObtainPairView.as_view()),
    path('api/auth/token/refresh/', TokenRefreshView.as_view()),
    path('api/auth/token/verify/', TokenVerifyView.as_view()),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/projects/', include('apps.projects.urls')),
    path('api/evaluations/', include('apps.evaluations.urls')),
    path('api/analysis/', include('apps.analysis.urls')),
    path('', lambda request: JsonResponse({'service': 'AHP Backend', 'status': 'running'})),
]