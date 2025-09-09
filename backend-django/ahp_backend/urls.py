"""
Django Backend URLs with Simple Service API
"""
from django.contrib import admin
from django.contrib.auth import authenticate, login
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
import json

# Simple Service API Router
router = DefaultRouter()
from simple_service.views import (
    SimpleProjectViewSet, SimpleDataViewSet, SimpleCriteriaViewSet, 
    SimpleComparisonViewSet, SimpleResultViewSet, service_status
)
router.register(r'projects', SimpleProjectViewSet)
router.register(r'criteria', SimpleCriteriaViewSet)
router.register(r'comparisons', SimpleComparisonViewSet)
router.register(r'results', SimpleResultViewSet)
router.register(r'data', SimpleDataViewSet)

@csrf_exempt
def login_api(request):
    """간단한 로그인 API"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            # 이메일로도 로그인 가능
            if '@' in username:
                from django.contrib.auth.models import User
                try:
                    user_obj = User.objects.get(email=username)
                    username = user_obj.username
                except User.DoesNotExist:
                    pass
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'success': True,
                    'message': '로그인 성공!',
                    'user': {
                        'username': user.username,
                        'email': user.email,
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser
                    }
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': '아이디 또는 비밀번호가 올바르지 않습니다.'
                }, status=401)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=400)
    
    return JsonResponse({
        'message': 'POST 요청으로 로그인하세요',
        'format': {
            'username': 'admin 또는 admin@ahp-platform.com',
            'password': 'ahp2025admin'
        }
    })

@csrf_exempt
def register_api(request):
    """간단한 회원가입 API"""
    if request.method == 'POST':
        try:
            from django.contrib.auth.models import User
            data = json.loads(request.body)
            
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            
            if User.objects.filter(username=username).exists():
                return JsonResponse({
                    'success': False,
                    'message': '이미 존재하는 사용자명입니다.'
                }, status=400)
            
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': '이미 등록된 이메일입니다.'
                }, status=400)
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            
            return JsonResponse({
                'success': True,
                'message': '회원가입 성공!',
                'user': {
                    'username': user.username,
                    'email': user.email
                }
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=400)
    
    return JsonResponse({
        'message': 'POST 요청으로 회원가입하세요',
        'format': {
            'username': '사용자명',
            'email': '이메일',
            'password': '비밀번호'
        }
    })

def user_info_api(request):
    """현재 로그인한 사용자 정보"""
    if request.user.is_authenticated:
        return JsonResponse({
            'authenticated': True,
            'user': {
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser
            }
        })
    else:
        return JsonResponse({
            'authenticated': False,
            'message': '로그인이 필요합니다.'
        })

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API 엔드포인트
    path('api/login/', login_api, name='login'),
    path('api/register/', register_api, name='register'),
    path('api/user/', user_info_api, name='user_info'),
    
    # JWT 토큰 엔드포인트 (프론트엔드용)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Health check for Render.com
    path('health/', lambda request: JsonResponse({'status': 'healthy'})),
    
    # Success endpoint
    path('success/', lambda request: JsonResponse({
        'message': 'DEPLOYMENT SUCCESSFUL!',
        'status': 'SUCCESS',
        'timestamp': '2025-09-09',
        'ready_for_payment': True
    })),
    
    # Simple Service API
    path('api/service/', include(router.urls)),
    path('api/service/status/', service_status, name='service_status'),
    
    # Root endpoint
    path('', lambda request: JsonResponse({
        'message': 'Django Backend - Simple AHP Service',
        'status': 'SUCCESS',
        'deployment': 'SUCCESSFUL',
        'features': {
            'authentication': 'Basic Login/Register + JWT',
            'projects': 'AHP Project Management',
            'criteria': 'Evaluation Criteria Management',
            'comparisons': 'Pairwise Comparisons',
            'weight_calculation': 'Automated Weight Calculation',
            'results': 'AHP Results & Rankings',
            'data_storage': 'Key-Value Data Storage',
            'cors_enabled': 'Frontend Integration Ready'
        },
        'api_endpoints': {
            'login': '/api/login/',
            'register': '/api/register/',
            'user_info': '/api/user/',
            'service_status': '/api/service/status/',
            'projects': '/api/service/projects/',
            'criteria': '/api/service/criteria/',
            'comparisons': '/api/service/comparisons/',
            'results': '/api/service/results/',
            'data': '/api/service/data/',
            'jwt_token': '/api/token/',
            'jwt_refresh': '/api/token/refresh/',
            'admin': '/admin/'
        },
        'test_credentials': {
            'username': 'admin',
            'password': 'ahp2025admin',
            'email': 'admin@ahp-platform.com'
        }
    })),
]