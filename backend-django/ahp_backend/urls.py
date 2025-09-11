"""
Django Backend URLs with Simple Service API
"""
from django.contrib import admin
from django.contrib.auth import authenticate, login, get_user_model
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.routers import DefaultRouter
import json

User = get_user_model()

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

def determine_user_type(user):
    """사용자 타입 결정 함수"""
    # 1. 슈퍼유저 확인
    if user.is_superuser:
        return 'super_admin'
    
    # 2. 스태프 확인  
    if user.is_staff:
        return 'admin'
    
    # 3. CustomUser 모델의 user_type 사용
    if hasattr(user, 'user_type'):
        return user.user_type
    
    # 4. 사용자명 기반 타입 결정
    username_lower = user.username.lower()
    email_lower = user.email.lower()
    
    # 관리자 계정들
    admin_usernames = ['admin', 'administrator', 'aebon', 'testadmin', 'system_admin']
    if any(admin in username_lower for admin in admin_usernames) or 'admin@' in email_lower:
        return 'admin'
    
    # 평가자 계정들
    evaluator_usernames = ['evaluator', 'eval']
    if any(eval_name in username_lower for eval_name in evaluator_usernames):
        return 'evaluator'
    
    # 기본값: 개인서비스 사용자
    return 'personal_service_user'

def get_redirect_url_by_user_type(user_type, user):
    """사용자 타입별 리다이렉트 URL 결정"""
    
    base_urls = {
        'super_admin': '/super-admin/',
        'admin': '/admin/',
        'evaluator': '/evaluator-dashboard/',
        'personal_service_user': '/personal-dashboard/',
        'enterprise': '/enterprise-dashboard/'
    }
    
    # 특별한 사용자들 (aebon 등)
    if user.username.lower() == 'aebon' or 'aebon' in user.email.lower():
        return '/super-admin/'
    
    # 일반적인 타입별 라우팅
    return base_urls.get(user_type, '/personal-dashboard/')

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
                from django.contrib.auth import get_user_model
                User = get_user_model()
                try:
                    user_obj = User.objects.get(email=username)
                    username = user_obj.username
                except User.DoesNotExist:
                    logger.warning(f"Login attempt with non-existent email: {username}")
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                if user.is_active:
                    login(request, user)
                    
                    # AEBON SPECIAL HANDLING - Ultimate Super Admin privileges
                    is_aebon = (user.username.lower() == 'aebon' or 
                               user.first_name.lower() == 'aebon' or 
                               'aebon' in user.email.lower())
                    
                    if is_aebon:
                        # Ensure aebon has ultimate admin privileges
                        if not user.is_superuser or not user.is_staff:
                            user.is_superuser = True
                            user.is_staff = True
                            user.save()
                        logger.info(f"👑 AEBON ULTIMATE ADMIN LOGIN: {user.username}")
                    else:
                        logger.info(f"Successful login: {user.username} from {request.META.get('REMOTE_ADDR')}")
                    
                    # 사용자 권한 및 타입 결정
                    user_type = determine_user_type(user)
                    redirect_url = get_redirect_url_by_user_type(user_type, user)
                    
                    # Enhanced user data with role-based information
                    user_data = {
                        'id': str(user.id),
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser,
                        'last_login': user.last_login.isoformat() if user.last_login else None,
                        'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                        'user_type': user_type,
                        'redirect_url': redirect_url
                    }
                    
                    # Add user type specific data
                    if hasattr(user, 'user_type'):
                        user_data['user_type_display'] = user.get_user_type_display()
                        user_data['subscription_tier'] = getattr(user, 'subscription_tier', 'free')
                        user_data['subscription_tier_display'] = getattr(user, 'get_subscription_tier_display', lambda: 'Free')()
                    
                    # Add aebon special flags
                    if is_aebon:
                        user_data.update({
                            'role': 'super_admin',
                            'admin_type': 'super',
                            'canSwitchModes': True,
                            'isAebon': True,
                            'sessionDuration': '8_hours'
                        })
                    
                    return JsonResponse({
                        'success': True,
                        'message': f'로그인 성공!' + (' 👑 AEBON ULTIMATE ACCESS' if is_aebon else f' - {user_type} 권한'),
                        'user': user_data,
                        'redirect': redirect_url
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
def list_users_api(request):
    """회원 DB 내역 조회 API"""
    if request.method == 'GET':
        try:
            from django.contrib.auth import get_user_model
            from super_admin.models import CustomUser
            
            User = get_user_model()
            
            # 전체 사용자 정보 조회
            users = []
            for user in User.objects.all().order_by('-date_joined'):
                # 사용자 타입 결정
                if user.is_superuser:
                    user_type = 'super_admin'
                elif user.is_staff:
                    user_type = 'admin'
                elif hasattr(user, 'user_type'):
                    user_type = user.user_type
                else:
                    user_type = 'personal_service'
                
                users.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'full_name': user.get_full_name(),
                    'user_type': user_type,
                    'subscription_tier': getattr(user, 'subscription_tier', 'free'),
                    'is_active': user.is_active,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                })
            
            # 통계 정보
            stats = {
                'total_users': User.objects.count(),
                'active_users': User.objects.filter(is_active=True).count(),
                'staff_users': User.objects.filter(is_staff=True).count(),
                'super_users': User.objects.filter(is_superuser=True).count(),
            }
            
            # 타입별 통계
            type_stats = {}
            if hasattr(CustomUser, 'USER_TYPES'):
                for user_type, display_name in CustomUser.USER_TYPES:
                    count = User.objects.filter(user_type=user_type).count()
                    type_stats[user_type] = {
                        'name': display_name,
                        'count': count
                    }
            
            return JsonResponse({
                'success': True,
                'users': users,
                'stats': stats,
                'type_stats': type_stats,
                'total': len(users)
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'회원 조회 실패: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'message': '회원 DB 조회 API',
        'method': 'GET'
    })

@csrf_exempt
def create_admin_api(request):
    """임시 관리자 생성 API (배포 후 즉시 제거 필요)"""
    if request.method in ['POST', 'GET']:
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
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
    
    # GET 요청일 때도 관리자 생성
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # 기존 admin 사용자 확인
        if User.objects.filter(username='admin').exists():
            admin = User.objects.get(username='admin')
            return JsonResponse({
                'success': True,
                'message': '관리자 계정이 이미 존재합니다!',
                'admin': {
                    'username': admin.username,
                    'email': admin.email,
                    'is_superuser': admin.is_superuser,
                    'is_staff': admin.is_staff
                },
                'credentials': {
                    'username': 'admin',
                    'email': 'admin@ahp-platform.com',
                    'password': 'ahp2025admin'
                }
            })
        
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
            'message': 'GET 요청으로 관리자 계정이 생성되었습니다!',
            'admin': {
                'username': admin.username,
                'email': admin.email,
                'is_superuser': admin.is_superuser,
                'is_staff': admin.is_staff
            },
            'credentials': {
                'username': 'admin',
                'email': 'admin@ahp-platform.com',
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
            'message': f'GET 요청 관리자 생성 실패: {str(e)}',
            'error': str(e)
        }, status=500)

urlpatterns = [
    # Admin - Super Admin System
    path('admin/', admin.site.urls),
    path('super-admin/', include('super_admin.urls')),
    
    # Dashboard Routes - Role-based Access
    path('personal-dashboard/', include(('dashboards.urls', 'dashboards'), namespace='personal')),
    path('evaluator-dashboard/', include(('dashboards.urls', 'dashboards'), namespace='evaluator')),
    path('enterprise-dashboard/', include(('dashboards.urls', 'dashboards'), namespace='enterprise')),
    path('dashboard/', include(('dashboards.urls', 'dashboards'), namespace='dashboard')),  # Generic dashboard redirect
    
    # API 엔드포인트
    path('api/login/', login_api, name='login'),
    path('api/register/', register_api, name='register'),
    path('api/logout/', logout_api, name='logout'),
    path('api/user/', user_info_api, name='user_info'),
    path('api/create-admin/', create_admin_api, name='create_admin'),  # 임시 API - 로그인 테스트용 활성화
    path('api/users/list/', list_users_api, name='list_users'),  # 회원 DB 조회 API
    
    
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
    
    # Users info endpoint - 회원 DB 간단 조회
    path('users-info/', lambda request: JsonResponse({
        'message': '회원 DB 현황',
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'staff_users': User.objects.filter(is_staff=True).count(),
        'superusers': User.objects.filter(is_superuser=True).count(),
        'recent_users': [
            {
                'username': u.username,
                'email': u.email,
                'joined': u.date_joined.isoformat() if u.date_joined else None
            } for u in User.objects.order_by('-date_joined')[:5]
        ]
    }) if request.method == 'GET' else JsonResponse({'error': 'Method not allowed'}, status=405)),
    
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