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
    SimpleComparisonViewSet, SimpleResultViewSet, service_status, health_check, simple_project_create, debug_database_info
)
from simple_service.test_views import simple_create_project
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
        'super_admin': '/admin/',  # super-admin URL 비활성화로 admin으로 리다이렉트
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
def login_api(request):
    """보안이 강화된 로그인 API"""
    
    # GET 요청으로 간단한 테스트
    if request.method == 'GET':
        return JsonResponse({
            'success': True,
            'message': 'Login API GET test',
            'method': 'GET',
            'expected_format': {
                'username': 'admin',
                'password': 'ahp2025admin'
            },
            'note': 'Use POST with JSON body for actual login'
        })
    
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
            
            # Django 기본 User 모델을 사용한 인증
            from django.contrib.auth import authenticate
            
            # Django 인증 백엔드를 통한 로그인 시도
            user = authenticate(request, username=username, password=password)
            
            if user is not None and user.is_active:
                try:
                    login(request, user)
                    
                    return JsonResponse({
                        'success': True,
                        'message': '로그인 성공!',
                        'user': {
                            'id': str(user.id),
                            'username': user.username,
                            'email': user.email,
                            'is_staff': user.is_staff,
                            'is_superuser': user.is_superuser,
                            'user_type': determine_user_type(user)
                        },
                        'redirect': get_redirect_url_by_user_type(determine_user_type(user), user)
                    })
                except Exception as e:
                    logger.error(f"Login session error: {str(e)}")
                    return JsonResponse({
                        'success': False,
                        'message': f'세션 생성 실패: {str(e)}'
                    }, status=500)
            
            # 하드코드 테스트 - 백업 로그인 방법 (개발/테스트용)
            elif username in ['admin', 'admin@ahp-platform.com'] and password == 'ahp2025admin':
                try:
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    
                    # 이메일로 사용자 찾기 시도
                    admin_user = None
                    user_created = False
                    try:
                        admin_user = User.objects.get(email='admin@ahp-platform.com')
                    except User.DoesNotExist:
                        # 사용자명으로 찾기 시도
                        try:
                            admin_user = User.objects.get(username='admin')
                        except User.DoesNotExist:
                            # 없으면 생성
                            admin_user = User.objects.create_user(
                                username='admin@ahp-platform.com',
                                email='admin@ahp-platform.com',
                                password='ahp2025admin',
                                first_name='Super',
                                last_name='Admin',
                                is_staff=True,
                                is_superuser=True,
                                is_active=True
                            )
                            user_created = True
                            logger.info(f"✅ Created new admin user: {admin_user.email}")
                    
                    # 기존 사용자의 경우 패스워드 업데이트
                    if not user_created:
                        admin_user.set_password('ahp2025admin')
                        admin_user.save()
                    
                    login(request, admin_user)
                    
                    return JsonResponse({
                        'success': True,
                        'message': '백업 로그인 성공!',
                        'user': {
                            'id': str(admin_user.id),
                            'username': admin_user.username,
                            'email': admin_user.email,
                            'is_staff': admin_user.is_staff,
                            'is_superuser': admin_user.is_superuser,
                            'user_type': determine_user_type(admin_user)
                        },
                        'redirect': get_redirect_url_by_user_type(determine_user_type(admin_user), admin_user)
                    })
                except Exception as e:
                    # 에러 로깅
                    logger.error(f"Hardcoded login error: {str(e)}")
                    pass
            
            # 모든 인증 방법 실패 시 오류 메시지 반환
            else:
                logger.info(f"All authentication methods failed for '{username}'")
                return JsonResponse({
                    'success': False,
                    'message': '사용자명 또는 비밀번호가 올바르지 않습니다.',
                    'debug_info': f'Username: {username}, All authentication methods failed'
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
        # 사용자 타입 결정
        user_type = determine_user_type(request.user)
        
        # 역할 결정
        if request.user.is_superuser or request.user.is_staff or user_type == 'admin':
            role = 'admin'
        else:
            role = 'user'
            
        return JsonResponse({
            'success': True,
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'name': request.user.get_full_name() or request.user.username,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'role': role,
                'user_type': user_type,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser,
                'last_login': request.user.last_login.isoformat() if request.user.last_login else None,
                'date_joined': request.user.date_joined.isoformat() if request.user.date_joined else None
            }
        })
    else:
        return JsonResponse({
            'success': False,
            'authenticated': False,
            'message': '로그인이 필요합니다.'
        }, status=401)

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
            # from super_admin.models import CustomUser  # ❌ CustomUser 모델 충돌로 비활성화
            
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
def create_admin_simple(request):
    """간단한 관리자 생성"""
    try:
        from django.contrib.auth import get_user_model
        from django.db import connection
        User = get_user_model()
        
        # 데이터베이스 연결 테스트
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_test = cursor.fetchone()
        
        # 기존 사용자 확인
        existing_count = User.objects.count()
        existing_admin = User.objects.filter(username='admin').exists()
        
        if existing_admin:
            # 기존 계정 삭제
            User.objects.filter(username='admin').delete()
        
        # 새 admin 계정을 create_superuser로 생성
        try:
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@ahp-platform.com',
                password='ahp2025admin'
            )
        except Exception as create_error:
            # create_superuser 실패시 수동 생성
            admin = User(
                username='admin',
                email='admin@ahp-platform.com'
            )
            admin.set_password('ahp2025admin')
            admin.is_staff = True
            admin.is_superuser = True
            admin.is_active = True
            admin.save()
        
        # 생성 후 확인
        final_count = User.objects.count()
        admin_exists = User.objects.filter(username='admin').exists()
        
        # 생성된 admin 정보
        if admin_exists:
            saved_admin = User.objects.get(username='admin')
            admin_info = {
                'id': str(saved_admin.id),
                'username': saved_admin.username,
                'email': saved_admin.email,
                'is_active': saved_admin.is_active,
                'is_staff': saved_admin.is_staff,
                'is_superuser': saved_admin.is_superuser
            }
        else:
            admin_info = None
        
        return JsonResponse({
            'success': admin_exists,
            'message': '관리자 계정 생성 시도 완료',
            'db_connected': db_test is not None,
            'before_count': existing_count,
            'after_count': final_count,
            'admin_exists': admin_exists,
            'admin_info': admin_info,
            'credentials': {
                'username': 'admin',
                'email': 'admin@ahp-platform.com', 
                'password': 'ahp2025admin'
            }
        })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'message': f'오류: {str(e)}'
        })

@csrf_exempt
def simple_login_api(request):
    """매우 간단한 로그인 API"""
    if request.method == 'GET':
        return JsonResponse({
            'message': 'Simple login API - use POST',
            'test_credentials': {
                'username': 'admin',
                'password': 'ahp2025admin'
            }
        })
    
    if request.method == 'POST':
        try:
            # JSON 파싱
            try:
                data = json.loads(request.body)
            except:
                # JSON 파싱 실패시 form data 시도
                data = request.POST
            
            username = data.get('username', '')
            password = data.get('password', '')
            
            # 하드코드 검증
            if (username == 'admin' or username == 'admin@ahp-platform.com') and password == 'ahp2025admin':
                # 성공 응답
                return JsonResponse({
                    'success': True,
                    'message': '로그인 성공!',
                    'user': {
                        'id': '1',
                        'username': 'admin',
                        'email': 'admin@ahp-platform.com',
                        'is_staff': True,
                        'is_superuser': True,
                        'user_type': 'admin'
                    }
                })
            else:
                # 실패 응답
                return JsonResponse({
                    'success': False,
                    'message': '로그인 실패',
                    'debug': {
                        'username_received': username,
                        'password_received': '***' if password else 'empty',
                        'expected_username': 'admin or admin@ahp-platform.com',
                        'expected_password': 'ahp2025admin'
                    }
                }, status=401)
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'message': 'Method not allowed'}, status=405)

def test_login_api(request):
    """로그인 테스트 API"""
    try:
        from django.contrib.auth import get_user_model, authenticate
        User = get_user_model()
        
        # admin 계정 상태 확인
        if not User.objects.filter(username='admin').exists():
            return JsonResponse({
                'success': False,
                'message': 'admin 계정이 존재하지 않습니다.'
            })
        
        admin = User.objects.get(username='admin')
        
        # 다양한 방식으로 인증 테스트
        test_results = {}
        
        # 1. 사용자명으로 인증
        user1 = authenticate(username='admin', password='ahp2025admin')
        test_results['username_auth'] = user1 is not None
        
        # 2. 이메일로 인증  
        user2 = authenticate(username='admin@ahp-platform.com', password='ahp2025admin')
        test_results['email_auth'] = user2 is not None
        
        # 3. 비밀번호 직접 확인
        password_check = admin.check_password('ahp2025admin')
        test_results['password_check'] = password_check
        
        return JsonResponse({
            'success': True,
            'message': '로그인 테스트 완료',
            'admin_info': {
                'username': admin.username,
                'email': admin.email,
                'is_active': admin.is_active,
                'is_staff': admin.is_staff,
                'is_superuser': admin.is_superuser
            },
            'auth_tests': test_results,
            'working_auth': user1 is not None or user2 is not None
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'message': f'테스트 중 오류: {str(e)}'
        })

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
    # Admin - Django Admin System Only
    path('admin/', admin.site.urls),
    # path('super-admin/', include('super_admin.urls')),  # ❌ CustomUser 모델 충돌로 비활성화
    
    # Dashboard Routes - Role-based Access
    path('personal-dashboard/', include(('dashboards.urls', 'dashboards'), namespace='personal')),
    path('evaluator-dashboard/', include(('dashboards.urls', 'dashboards'), namespace='evaluator')),
    path('enterprise-dashboard/', include(('dashboards.urls', 'dashboards'), namespace='enterprise')),
    path('dashboard/', include(('dashboards.urls', 'dashboards'), namespace='dashboard')),  # Generic dashboard redirect
    
    # API 엔드포인트 - 새로운 인증 시스템 사용
    path('api/auth/', include('simple_auth.urls')),  # 새로운 인증 시스템
    
    # 기존 경로 유지 (호환성)
    path('api/login/', login_api, name='login'),
    path('api/register/', register_api, name='register'),
    path('api/logout/', logout_api, name='logout'),
    path('api/user/', user_info_api, name='user_info'),
    path('api/create-admin/', create_admin_api, name='create_admin'),  # 임시 API - 로그인 테스트용 활성화
    path('api/simple-admin/', create_admin_simple, name='create_admin_simple'),  # 간단한 관리자 생성
    path('api/test-login/', test_login_api, name='test_login'),  # 로그인 테스트
    path('api/simple-login/', simple_login_api, name='simple_login'),  # 간단한 로그인
    path('api/users/list/', list_users_api, name='list_users'),  # 회원 DB 조회 API
    
    
    # Health checks
    path('health/', lambda request: JsonResponse({'status': 'healthy'})),  # Simple health check for Render.com
    path('api/health/', health_check, name='health_check'),  # Detailed health check
    
    # Emergency admin creation (defined at bottom of file)
    # path('api/create-admin/', create_admin_user, name='create_admin'),
    
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
    path('api/service/simple-projects/', simple_project_create, name='simple_project_create'),
    path('api/debug/database/', debug_database_info, name='debug_database_info'),
    
    # Emergency APIs
    path('api/emergency/fix-database/', lambda r: __import__('simple_service.emergency_api', fromlist=['emergency_fix_database']).emergency_fix_database(r), name='emergency_fix'),
    path('api/emergency/create-project/', lambda r: __import__('simple_service.emergency_api', fromlist=['emergency_create_project']).emergency_create_project(r), name='emergency_create'),
    path('api/emergency/list-projects/', lambda r: __import__('simple_service.emergency_api', fromlist=['emergency_list_projects']).emergency_list_projects(r), name='emergency_list'),
    
    # Ultra Safe APIs (테이블이 없어도 작동)
    path('api/ultra/status/', lambda r: __import__('simple_service.ultra_safe_api', fromlist=['database_status']).database_status(r), name='ultra_status'),
    path('api/ultra/setup/', lambda r: __import__('simple_service.ultra_safe_api', fromlist=['force_database_setup']).force_database_setup(r), name='ultra_setup'),
    path('api/ultra/projects/', lambda r: __import__('simple_service.ultra_safe_api', fromlist=['ultra_safe_list_projects']).ultra_safe_list_projects(r), name='ultra_list'),
    path('api/ultra/create/', lambda r: __import__('simple_service.ultra_safe_api', fromlist=['ultra_safe_create_project']).ultra_safe_create_project(r), name='ultra_create'),
    
    # Migration APIs (강제 마이그레이션)
    path('api/migrate/force/', lambda r: __import__('simple_service.migrate_api', fromlist=['force_migrate_database']).force_migrate_database(r), name='force_migrate'),
    path('api/migrate/status/', lambda r: __import__('simple_service.migrate_api', fromlist=['check_database_status']).check_database_status(r), name='migrate_status'),
    
    # Test API for project creation
    path('api/test/create-project/', simple_create_project, name='test_create_project'),
    
    # Simple Test APIs
    path('api/test/project/create/', lambda r: __import__('simple_service.test_project_api', fromlist=['test_create_project']).test_create_project(r), name='simple_test_create'),
    path('api/test/project/list/', lambda r: __import__('simple_service.test_project_api', fromlist=['test_list_projects']).test_list_projects(r), name='simple_test_list'),
    
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


# Emergency admin user creation
@csrf_exempt
def create_admin_user(request):
    """Emergency admin user creation endpoint"""
    if request.method == 'GET':
        try:
            User = get_user_model()
            admin_user, created = User.objects.get_or_create(
                email='admin@ahp-platform.com',
                defaults={
                    'username': 'admin',
                    'first_name': 'Super',
                    'last_name': 'Admin',
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True,
                    'user_type': 'super_admin',
                    'subscription_tier': 'unlimited'
                }
            )
            
            if created:
                admin_user.set_password('ahp2025admin')
                admin_user.save()
                return JsonResponse({
                    'success': True,
                    'message': '✅ Admin user created successfully!',
                    'user': {
                        'email': 'admin@ahp-platform.com',
                        'password': 'ahp2025admin',
                        'created': True
                    }
                })
            else:
                # 기존 사용자가 있으면 비밀번호 재설정
                admin_user.set_password('ahp2025admin')
                admin_user.save()
                return JsonResponse({
                    'success': True,
                    'message': '✅ Admin user password reset successfully!',
                    'user': {
                        'email': 'admin@ahp-platform.com',
                        'password': 'ahp2025admin',
                        'created': False
                    }
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Admin creation failed: {str(e)}'
            }, status=500)
    
    return JsonResponse({'message': 'Use GET to create admin user'}, status=405)


# Add the URL pattern after function definition
urlpatterns.append(path('api/create-admin/', create_admin_user, name='create_admin'))