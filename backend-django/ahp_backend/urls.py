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
    SimpleComparisonViewSet, SimpleResultViewSet, service_status, health_check
)
router.register(r'projects', SimpleProjectViewSet)
router.register(r'criteria', SimpleCriteriaViewSet)
router.register(r'comparisons', SimpleComparisonViewSet)
router.register(r'results', SimpleResultViewSet)
router.register(r'data', SimpleDataViewSet)

from django_ratelimit.decorators import ratelimit
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@ratelimit(key='ip', rate='5/m', method='POST', block=True)
def login_api(request):
    """보안이 강화된 로그인 API"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            password = data.get('password', '')
            
            if not username or not password:
                return JsonResponse({
                    'success': False,
                    'message': '사용자명과 비밀번호를 모두 입력해주세요.'
                }, status=400)
            
            # 이메일로도 로그인 가능
            original_username = username
            if '@' in username:
                from django.contrib.auth.models import User
                try:
                    user_obj = User.objects.get(email=username)
                    username = user_obj.username
                except User.DoesNotExist:
                    logger.warning(f"Login attempt with non-existent email: {username}")
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                if user.is_active:
                    login(request, user)
                    logger.info(f"Successful login: {user.username} from {request.META.get('REMOTE_ADDR')}")
                    return JsonResponse({
                        'success': True,
                        'message': '로그인 성공!',
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'email': user.email,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'is_staff': user.is_staff,
                            'is_superuser': user.is_superuser,
                            'last_login': user.last_login,
                            'date_joined': user.date_joined
                        }
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'message': '비활성화된 계정입니다. 관리자에게 문의하세요.'
                    }, status=401)
            else:
                logger.warning(f"Failed login attempt: {original_username} from {request.META.get('REMOTE_ADDR')}")
                return JsonResponse({
                    'success': False,
                    'message': '아이디 또는 비밀번호가 올바르지 않습니다.'
                }, status=401)
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': '잘못된 JSON 형식입니다.'
            }, status=400)
        except Exception as e:
            logger.error(f"Login API error: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': '서버 오류가 발생했습니다.'
            }, status=500)
    
    return JsonResponse({
        'message': 'POST 요청으로 로그인하세요',
        'format': {
            'username': 'admin 또는 admin@ahp-platform.com',
            'password': 'ahp2025admin'
        }
    })

@csrf_exempt
@ratelimit(key='ip', rate='3/m', method='POST', block=True)
def register_api(request):
    """보안이 강화된 회원가입 API"""
    if request.method == 'POST':
        try:
            from django.contrib.auth.models import User
            from django.contrib.auth.password_validation import validate_password
            from django.core.validators import validate_email
            from django.core.exceptions import ValidationError
            import re
            
            data = json.loads(request.body)
            
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            
            # 입력값 검증
            if not username or not email or not password:
                return JsonResponse({
                    'success': False,
                    'message': '사용자명, 이메일, 비밀번호는 필수 항목입니다.'
                }, status=400)
            
            # 사용자명 형식 검증 (영숫자, 언더스코어만 허용)
            if not re.match(r'^[a-zA-Z0-9_]{3,30}$', username):
                return JsonResponse({
                    'success': False,
                    'message': '사용자명은 3-30자의 영문, 숫자, 언더스코어만 사용 가능합니다.'
                }, status=400)
            
            # 이메일 형식 검증
            try:
                validate_email(email)
            except ValidationError:
                return JsonResponse({
                    'success': False,
                    'message': '올바른 이메일 주소를 입력해주세요.'
                }, status=400)
            
            # 비밀번호 강도 검증
            try:
                validate_password(password)
            except ValidationError as e:
                return JsonResponse({
                    'success': False,
                    'message': f'비밀번호 요구사항: {", ".join(e.messages)}'
                }, status=400)
            
            # 중복 검사
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
            
            # 사용자 생성
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            logger.info(f"New user registered: {username} ({email}) from {request.META.get('REMOTE_ADDR')}")
            
            return JsonResponse({
                'success': True,
                'message': '회원가입이 완료되었습니다! 로그인해주세요.',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'date_joined': user.date_joined
                }
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': '잘못된 JSON 형식입니다.'
            }, status=400)
        except Exception as e:
            logger.error(f"Registration API error: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': '서버 오류가 발생했습니다.'
            }, status=500)
    
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
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser,
                'last_login': request.user.last_login,
                'date_joined': request.user.date_joined
            }
        })
    else:
        return JsonResponse({
            'authenticated': False,
            'message': '로그인이 필요합니다.'
        })

@csrf_exempt
def logout_api(request):
    """로그아웃 API"""
    if request.method == 'POST':
        if request.user.is_authenticated:
            username = request.user.username
            from django.contrib.auth import logout
            logout(request)
            logger.info(f"User logged out: {username}")
            return JsonResponse({
                'success': True,
                'message': '로그아웃되었습니다.'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': '로그인되어 있지 않습니다.'
            }, status=400)
    
    return JsonResponse({
        'message': 'POST 요청으로 로그아웃하세요'
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
    path('api/logout/', logout_api, name='logout'),
    path('api/user/', user_info_api, name='user_info'),
    # path('api/create-admin/', create_admin_api, name='create_admin'),  # 임시 API - 보안상 비활성화
    
    
    # Health checks
    path('health/', lambda request: JsonResponse({'status': 'healthy'})),  # Simple health check for Render.com
    path('api/health/', health_check, name='health_check'),  # Detailed health check
    
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