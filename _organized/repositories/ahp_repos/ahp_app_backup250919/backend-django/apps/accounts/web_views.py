"""
Web Frontend Integration Views for React App
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from django.utils import timezone
from .serializers import UserSerializer, UserRegistrationSerializer
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def web_login(request):
    """
    Web frontend login endpoint
    Compatible with existing React login form
    """
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'success': False,
                'message': '사용자명과 비밀번호를 모두 입력해주세요.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if user:
            if not user.is_active:
                return Response({
                    'success': False,
                    'message': '계정이 비활성화되었습니다.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Update last activity
            user.update_last_activity()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Prepare user data for frontend
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'fullName': user.full_name or user.get_full_name(),
                'organization': user.organization,
                'department': user.department,
                'position': user.position,
                'isEvaluator': user.is_evaluator,
                'isProjectManager': user.is_project_manager,
                'isAdmin': user.is_staff,
                'language': user.language,
                'lastActivity': user.last_activity,
            }
            
            return Response({
                'success': True,
                'message': '로그인 성공',
                'user': user_data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': '사용자명 또는 비밀번호가 올바르지 않습니다.'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response({
            'success': False,
            'message': '로그인 처리 중 오류가 발생했습니다.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def web_register(request):
    """
    Web frontend registration endpoint
    """
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                user = serializer.save()
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'fullName': user.full_name or user.get_full_name(),
                    'organization': user.organization,
                    'isEvaluator': user.is_evaluator,
                    'isProjectManager': user.is_project_manager,
                }
                
                return Response({
                    'success': True,
                    'message': '회원가입이 완료되었습니다.',
                    'user': user_data,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    }
                }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'message': '입력 정보를 확인해주세요.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return Response({
            'success': False,
            'message': '회원가입 처리 중 오류가 발생했습니다.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def web_logout(request):
    """
    Web frontend logout endpoint
    """
    try:
        refresh_token = request.data.get('refresh_token')
        
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            
        return Response({
            'success': True,
            'message': '로그아웃 되었습니다.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response({
            'success': True,
            'message': '로그아웃 되었습니다.'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
def web_profile(request):
    """
    Get current user profile for web frontend
    """
    try:
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'message': '인증이 필요합니다.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        user = request.user
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'fullName': user.full_name or user.get_full_name(),
            'organization': user.organization,
            'department': user.department,
            'position': user.position,
            'phone': user.phone,
            'isEvaluator': user.is_evaluator,
            'isProjectManager': user.is_project_manager,
            'isAdmin': user.is_staff,
            'language': user.language,
            'timezone': user.timezone,
            'lastActivity': user.last_activity,
            'dateJoined': user.date_joined,
        }
        
        return Response({
            'success': True,
            'user': user_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Profile error: {str(e)}")
        return Response({
            'success': False,
            'message': '프로필 조회 중 오류가 발생했습니다.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def web_profile_update(request):
    """
    Update user profile for web frontend
    """
    try:
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'message': '인증이 필요합니다.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        user = request.user
        
        # Update allowed fields
        allowed_fields = [
            'full_name', 'organization', 'department', 'position', 
            'phone', 'language', 'timezone'
        ]
        
        updated_fields = []
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
                updated_fields.append(field)
        
        if updated_fields:
            user.save(update_fields=updated_fields)
            
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'fullName': user.full_name or user.get_full_name(),
            'organization': user.organization,
            'department': user.department,
            'position': user.position,
            'phone': user.phone,
            'language': user.language,
            'timezone': user.timezone,
        }
        
        return Response({
            'success': True,
            'message': '프로필이 업데이트되었습니다.',
            'user': user_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        return Response({
            'success': False,
            'message': '프로필 업데이트 중 오류가 발생했습니다.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_sample_users(request):
    """
    Create sample users for testing (development only)
    """
    try:
        # Check if running in debug mode
        from django.conf import settings
        if not settings.DEBUG:
            return Response({
                'success': False,
                'message': '개발 모드에서만 사용 가능합니다.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        users_created = []
        
        # Create sample admin user
        if not User.objects.filter(username='testadmin').exists():
            admin_user = User.objects.create_user(
                username='testadmin',
                email='admin@ahp-test.com',
                password='test123!',
                full_name='테스트 관리자',
                organization='AHP 연구소',
                department='개발팀',
                is_staff=True,
                is_project_manager=True
            )
            users_created.append('testadmin')
        
        # Create sample evaluator user
        if not User.objects.filter(username='testevaluator').exists():
            eval_user = User.objects.create_user(
                username='testevaluator',
                email='evaluator@ahp-test.com',
                password='test123!',
                full_name='테스트 평가자',
                organization='AHP 연구소',
                department='평가팀',
                is_evaluator=True
            )
            users_created.append('testevaluator')
        
        # Create sample regular user
        if not User.objects.filter(username='testuser').exists():
            regular_user = User.objects.create_user(
                username='testuser',
                email='user@ahp-test.com',
                password='test123!',
                full_name='일반 사용자',
                organization='테스트 기업'
            )
            users_created.append('testuser')
        
        return Response({
            'success': True,
            'message': f'테스트 사용자 {len(users_created)}명이 생성되었습니다.',
            'users_created': users_created,
            'credentials': {
                'testadmin': 'test123! (관리자)',
                'testevaluator': 'test123! (평가자)',
                'testuser': 'test123! (일반사용자)'
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Sample users creation error: {str(e)}")
        return Response({
            'success': False,
            'message': '테스트 사용자 생성 중 오류가 발생했습니다.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)