from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'healthy'})

def home(request):
    return JsonResponse({'message': 'AHP Backend is working'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/v1/', include('projects.urls')),
    path('health/', health_check),
    path('', home),
]