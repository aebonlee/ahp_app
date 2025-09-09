"""
Django Backend URLs with Simple Service API
"""
from django.contrib import admin
from django.contrib.auth import authenticate, login
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.routers import DefaultRouter
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

@csrf_exempt
def create_admin_api(request):
    """임시 관리자 생성 API (배포 후 즉시 제거 필요)"""
    if request.method == 'POST':
        try:
            from django.contrib.auth.models import User
            
            # 기존 admin 사용자 삭제하고 새로 생성
            existing_admin = User.objects.filter(username='admin')
            if existing_admin.exists():
                existing_admin.delete()
                print("✅ 기존 admin 계정 삭제")
            
            # 새 superuser 관리자 생성
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@ahp-platform.com',
                password='ahp2025admin',
                first_name='Admin',
                last_name='User'
            )
            
            return JsonResponse({
                'success': True,
                'message': '관리자 계정이 생성되었습니다!',
                'admin': {
                    'username': admin.username,
                    'email': admin.email,
                    'is_superuser': admin.is_superuser,
                    'is_staff': admin.is_staff
                },
                'credentials': {
                    'username': 'admin',
                    'password': 'ahp2025admin'
                },
                'database_stats': {
                    'total_users': User.objects.count(),
                    'admin_users': User.objects.filter(is_superuser=True).count()
                }
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'관리자 생성 실패: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'message': '관리자 계정 생성 API',
        'method': 'POST',
        'note': '임시 API - 생성 후 즉시 제거 예정'
    })

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API 엔드포인트
    path('api/login/', login_api, name='login'),
    path('api/register/', register_api, name='register'),
    path('api/user/', user_info_api, name='user_info'),
    path('api/create-admin/', create_admin_api, name='create_admin'),  # 임시 API
    
    
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
            'admin': '/admin/'
        },
        'test_credentials': {
            'username': 'admin',
            'password': 'ahp2025admin',
            'email': 'admin@ahp-platform.com'
        }
    })),
]