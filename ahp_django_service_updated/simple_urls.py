from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

def health_check(request):
    return JsonResponse({'status': 'healthy'})

def api_health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'AHP Backend API'})

def home(request):
    return JsonResponse({
        'message': 'AHP Backend is working',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api_auth': '/api/auth/',
            'api_health': '/api/health',
            'health': '/health/',
            'projects': '/api/v1/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Projects endpoints
    path('api/v1/', include('apps.projects.urls')),
    
    # Health check endpoints
    path('health/', health_check),
    path('api/health', api_health_check),
    
    # Root
    path('', home),
]