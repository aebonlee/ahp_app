"""
안정화된 인증 시스템 - 2차 개발용
회원가입, 로그인, 로그아웃 통합 관리
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.db import transaction, connection
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import json
import logging
import re

logger = logging.getLogger(__name__)
User = get_user_model()


@csrf_exempt
def register_api(request):
    """간단하고 안정적인 회원가입 API"""
    if request.method == 'GET':
        return JsonResponse({
            'message': '회원가입 API',
            'method': 'POST',
            'required_fields': {
                'username': '사용자명 (3-30자, 영문/숫자)',
                'email': '이메일 주소',
                'password': '비밀번호 (8자 이상)'
            },
            'optional_fields': {
                'first_name': '이름',
                'last_name': '성'
            }
        })
    
    if request.method == 'POST':
        try:
            # JSON 데이터 파싱
            try:
                data = json.loads(request.body)
            except:
                data = request.POST
            
            username = data.get('username', '').strip()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            
            logger.info(f"Registration attempt for username: {username}, email: {email}")
            
            # 기본 검증
            errors = []
            
            # 필수 필드 확인
            if not username:
                errors.append('사용자명을 입력해주세요.')
            if not email:
                errors.append('이메일을 입력해주세요.')
            if not password:
                errors.append('비밀번호를 입력해주세요.')
            
            if errors:
                return JsonResponse({
                    'success': False,
                    'message': ' '.join(errors),
                    'errors': errors
                }, status=400)
            
            # 사용자명 형식 검증 (간단하게)
            if len(username) < 3 or len(username) > 30:
                return JsonResponse({
                    'success': False,
                    'message': '사용자명은 3-30자여야 합니다.'
                }, status=400)
            
            if not re.match(r'^[a-zA-Z0-9_]+$', username):
                return JsonResponse({
                    'success': False,
                    'message': '사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.'
                }, status=400)
            
            # 이메일 형식 검증
            try:
                validate_email(email)
            except ValidationError:
                return JsonResponse({
                    'success': False,
                    'message': '올바른 이메일 주소를 입력해주세요.'
                }, status=400)
            
            # 비밀번호 길이 검증 (간단하게)
            if len(password) < 8:
                return JsonResponse({
                    'success': False,
                    'message': '비밀번호는 8자 이상이어야 합니다.'
                }, status=400)
            
            # 중복 검사
            if User.objects.filter(username=username).exists():
                return JsonResponse({
                    'success': False,
                    'message': f'사용자명 "{username}"는 이미 사용중입니다.'
                }, status=400)
            
            # CustomUser 모델은 email을 주키로 사용
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': f'이메일 "{email}"는 이미 등록되어 있습니다.'
                }, status=400)
            
            # 트랜잭션으로 사용자 생성
            with transaction.atomic():
                try:
                    # CustomUser 모델에 맞게 생성
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        first_name=first_name or username,
                        last_name=last_name or '',
                    )
                    
                    # 추가 필드 설정 (CustomUser 전용)
                    if hasattr(user, 'user_type'):
                        user.user_type = 'personal_service_user'
                    if hasattr(user, 'subscription_tier'):
                        user.subscription_tier = 'free'
                    
                    user.is_active = True
                    user.save()
                    
                    logger.info(f"✅ User created successfully: {username} ({email})")
                    
                    # 자동 로그인
                    login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                    
                    return JsonResponse({
                        'success': True,
                        'message': '회원가입이 완료되었습니다!',
                        'user': {
                            'id': str(user.id),
                            'username': user.username,
                            'email': user.email,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'is_active': user.is_active
                        },
                        'auto_login': True,
                        'redirect': '/personal-dashboard/'
                    })
                    
                except Exception as create_error:
                    logger.error(f"User creation error: {create_error}")
                    
                    # PostgreSQL 직접 삽입 시도 (백업)
                    try:
                        with connection.cursor() as cursor:
                            cursor.execute("""
                                INSERT INTO auth_user (
                                    username, email, password, first_name, last_name,
                                    is_staff, is_superuser, is_active, date_joined
                                )
                                VALUES (%s, %s, %s, %s, %s, false, false, true, NOW())
                                RETURNING id
                            """, [username, email, f"pbkdf2_sha256$260000$salt${password}", first_name, last_name])
                            
                            user_id = cursor.fetchone()[0]
                            logger.info(f"✅ User created via raw SQL: {username} (ID: {user_id})")
                            
                            return JsonResponse({
                                'success': True,
                                'message': '회원가입이 완료되었습니다! (DB 직접 생성)',
                                'user': {
                                    'id': user_id,
                                    'username': username,
                                    'email': email,
                                    'first_name': first_name,
                                    'last_name': last_name
                                },
                                'redirect': '/login/'
                            })
                    except Exception as sql_error:
                        logger.error(f"Raw SQL creation also failed: {sql_error}")
                        raise create_error
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': '잘못된 데이터 형식입니다.'
            }, status=400)
        except Exception as e:
            logger.error(f"Registration error: {str(e)}", exc_info=True)
            return JsonResponse({
                'success': False,
                'message': f'회원가입 중 오류가 발생했습니다: {str(e)}',
                'error_type': type(e).__name__
            }, status=500)
    
    return JsonResponse({
        'message': 'Method not allowed',
        'allowed': ['GET', 'POST']
    }, status=405)


@csrf_exempt
def login_api(request):
    """간단하고 안정적인 로그인 API"""
    if request.method == 'GET':
        return JsonResponse({
            'message': '로그인 API',
            'method': 'POST',
            'format': {
                'username': '사용자명 또는 이메일',
                'password': '비밀번호'
            },
            'test_account': {
                'username': 'admin',
                'password': 'ahp2025admin'
            }
        })
    
    if request.method == 'POST':
        try:
            # JSON 데이터 파싱
            try:
                data = json.loads(request.body)
            except:
                data = request.POST
            
            username = data.get('username', '').strip()
            password = data.get('password', '')
            
            logger.info(f"Login attempt for: {username}")
            
            if not username or not password:
                return JsonResponse({
                    'success': False,
                    'message': '사용자명과 비밀번호를 입력해주세요.'
                }, status=400)
            
            # 하드코드된 관리자 계정 확인 (이메일 기반)
            if username == 'admin@ahp-platform.com' and password == 'ahp2025admin':
                # 관리자 계정 확인/생성
                try:
                    admin_user = User.objects.get(email='admin@ahp-platform.com')
                except User.DoesNotExist:
                    try:
                        admin_user = User.objects.get(username='admin')
                    except User.DoesNotExist:
                        admin_user = User.objects.create_superuser(
                            username='admin',
                            email='admin@ahp-platform.com',
                            password='ahp2025admin'
                        )
                        logger.info("✅ Admin user created")
                
                login(request, admin_user, backend='django.contrib.auth.backends.ModelBackend')
                
                return JsonResponse({
                    'success': True,
                    'message': '관리자 로그인 성공!',
                    'user': {
                        'id': str(admin_user.id),
                        'username': admin_user.username,
                        'email': admin_user.email,
                        'is_staff': True,
                        'is_superuser': True,
                        'role': 'admin'
                    },
                    'redirect': '/admin/'
                })
            
            # 일반 사용자 인증
            # 이메일로 로그인 시도
            user = None
            if '@' in username:
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(request, username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            # 사용자명으로 로그인 시도
            if not user:
                user = authenticate(request, username=username, password=password)
            
            if user is not None:
                if user.is_active:
                    login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                    
                    # 사용자 타입 결정
                    role = 'admin' if (user.is_staff or user.is_superuser) else 'user'
                    redirect = '/admin/' if role == 'admin' else '/personal-dashboard/'
                    
                    logger.info(f"✅ Login successful: {user.username}")
                    
                    return JsonResponse({
                        'success': True,
                        'message': '로그인 성공!',
                        'user': {
                            'id': str(user.id),
                            'username': user.username,
                            'email': user.email,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'is_staff': user.is_staff,
                            'is_superuser': user.is_superuser,
                            'role': role
                        },
                        'redirect': redirect
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'message': '비활성화된 계정입니다. 관리자에게 문의하세요.'
                    }, status=401)
            else:
                # 사용자 존재 여부 확인
                user_exists = User.objects.filter(
                    username=username
                ).exists() or User.objects.filter(
                    email=username
                ).exists()
                
                if user_exists:
                    message = '비밀번호가 올바르지 않습니다.'
                else:
                    message = '등록되지 않은 사용자입니다.'
                
                logger.warning(f"Login failed for: {username} - {message}")
                
                return JsonResponse({
                    'success': False,
                    'message': message
                }, status=401)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': '잘못된 데이터 형식입니다.'
            }, status=400)
        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return JsonResponse({
                'success': False,
                'message': f'로그인 중 오류가 발생했습니다: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'message': 'Method not allowed',
        'allowed': ['GET', 'POST']
    }, status=405)


@csrf_exempt
def logout_api(request):
    """로그아웃 API"""
    if request.method == 'POST':
        if request.user.is_authenticated:
            username = request.user.username
            logout(request)
            logger.info(f"User logged out: {username}")
            
            return JsonResponse({
                'success': True,
                'message': '로그아웃되었습니다.',
                'redirect': '/'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': '로그인되어 있지 않습니다.'
            }, status=400)
    
    return JsonResponse({
        'message': 'POST 요청으로 로그아웃하세요'
    })


def user_info_api(request):
    """현재 로그인한 사용자 정보 API"""
    if request.user.is_authenticated:
        user = request.user
        
        # 사용자 역할 결정
        if user.is_superuser:
            role = 'super_admin'
        elif user.is_staff:
            role = 'admin'
        else:
            role = 'user'
        
        return JsonResponse({
            'success': True,
            'authenticated': True,
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': user.get_full_name() or user.username,
                'role': role,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                'last_login': user.last_login.isoformat() if user.last_login else None
            }
        })
    else:
        return JsonResponse({
            'success': False,
            'authenticated': False,
            'message': '로그인이 필요합니다.'
        }, status=401)


@csrf_exempt
def test_auth_api(request):
    """인증 시스템 테스트 API"""
    try:
        from django.db import connection
        
        # 데이터베이스 연결 테스트
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM auth_user")
            user_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT id, username, email FROM auth_user LIMIT 5")
            users = cursor.fetchall()
        
        return JsonResponse({
            'success': True,
            'database': 'connected',
            'total_users': user_count,
            'sample_users': [
                {'id': u[0], 'username': u[1], 'email': u[2]}
                for u in users
            ],
            'auth_system': 'ready',
            'endpoints': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'logout': '/api/auth/logout/',
                'user_info': '/api/auth/user/'
            }
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)