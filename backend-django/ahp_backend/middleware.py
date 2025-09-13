"""
Django Session Management Middleware
Advanced session handling with role-based timeout and automatic cleanup
"""

from django.utils import timezone
from django.contrib.auth import logout
from django.http import JsonResponse
import datetime
import logging

logger = logging.getLogger(__name__)


class SessionManagementMiddleware:
    """
    고급 세션 관리 미들웨어
    - 역할별 세션 시간 제한
    - 자동 세션 만료 처리
    - 보안 로깅
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # 세션 상태 확인 및 관리
        self.manage_session(request)
        
        response = self.get_response(request)
        
        # 응답 후 세션 업데이트
        self.update_session_activity(request)
        
        return response
    
    def manage_session(self, request):
        """세션 관리 로직"""
        
        if not request.user.is_authenticated:
            return
            
        # 세션 시간 제한 확인
        if self.is_session_expired(request):
            self.handle_session_expiry(request)
            return
            
        # 보안 체크
        self.security_check(request)
    
    def is_session_expired(self, request):
        """세션 만료 여부 확인"""
        
        last_activity = request.session.get('last_activity')
        if not last_activity:
            # 첫 로그인시 현재 시간 설정
            request.session['last_activity'] = timezone.now().isoformat()
            return False
            
        last_activity_time = timezone.datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
        
        # 역할별 세션 타임아웃 설정
        user = request.user
        
        # Aebon 특별 권한: 8시간
        if (user.username.lower() == 'aebon' or 
            'aebon' in user.email.lower() or
            user.first_name.lower() == 'aebon'):
            timeout_hours = 8
        # 관리자: 4시간
        elif user.is_superuser or user.is_staff:
            timeout_hours = 4
        # 프리미엄 사용자: 3시간
        elif hasattr(user, 'subscription_tier') and user.subscription_tier in ['professional', 'enterprise', 'unlimited']:
            timeout_hours = 3
        # 일반 사용자: 2시간
        else:
            timeout_hours = 2
            
        session_duration = timezone.now() - last_activity_time
        max_duration = datetime.timedelta(hours=timeout_hours)
        
        if session_duration > max_duration:
            logger.info(f"Session expired for user {user.email} after {session_duration}")
            return True
            
        return False
    
    def handle_session_expiry(self, request):
        """세션 만료 처리"""
        
        user_email = request.user.email
        
        # 활동 로그 기록
        try:
            from super_admin.models import ActivityLog
            ActivityLog.objects.create(
                user=request.user,
                action='session_expired',
                description=f'세션 만료로 인한 자동 로그아웃: {user_email}',
                level='info',
                ip_address=self.get_client_ip(request)
            )
        except Exception as e:
            logger.error(f"Failed to log session expiry: {e}")
        
        # 로그아웃 처리
        logout(request)
        
        # API 요청인 경우 JSON 응답
        if request.path.startswith('/api/'):
            return JsonResponse({
                'success': False,
                'message': '세션이 만료되었습니다. 다시 로그인해주세요.',
                'error_code': 'SESSION_EXPIRED'
            }, status=401)
        
        logger.info(f"Session expired and user logged out: {user_email}")
    
    def security_check(self, request):
        """보안 검사"""
        
        # IP 주소 변경 감지
        current_ip = self.get_client_ip(request)
        session_ip = request.session.get('login_ip')
        
        if session_ip and session_ip != current_ip:
            logger.warning(f"IP address changed for user {request.user.email}: {session_ip} -> {current_ip}")
            
            # 의심스러운 활동 로그
            try:
                from super_admin.models import ActivityLog
                ActivityLog.objects.create(
                    user=request.user,
                    action='ip_change_detected',
                    description=f'IP 주소 변경 감지: {session_ip} -> {current_ip}',
                    level='warning',
                    ip_address=current_ip
                )
            except Exception as e:
                logger.error(f"Failed to log IP change: {e}")
        
        # 세션에 현재 IP 저장
        request.session['login_ip'] = current_ip
    
    def update_session_activity(self, request):
        """세션 활동 시간 업데이트"""
        
        if request.user.is_authenticated:
            request.session['last_activity'] = timezone.now().isoformat()
            
            # 주기적으로 사용자 로그인 시간 업데이트 (5분마다)
            last_update = request.session.get('last_login_update')
            if not last_update:
                request.user.last_login = timezone.now()
                request.user.save(update_fields=['last_login'])
                request.session['last_login_update'] = timezone.now().isoformat()
            else:
                last_update_time = timezone.datetime.fromisoformat(last_update.replace('Z', '+00:00'))
                if timezone.now() - last_update_time > datetime.timedelta(minutes=5):
                    request.user.last_login = timezone.now()
                    request.user.save(update_fields=['last_login'])
                    request.session['last_login_update'] = timezone.now().isoformat()
    
    def get_client_ip(self, request):
        """클라이언트 IP 주소 추출"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class APIAuthenticationMiddleware:
    """
    API 요청 인증 미들웨어
    프론트엔드와 백엔드 간의 인증 상태 동기화
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # API 요청에 대한 특별 처리
        if request.path.startswith('/api/'):
            # CORS 헤더 추가
            response = self.get_response(request)
            
            # 인증 상태를 헤더에 추가
            if request.user.is_authenticated:
                response['X-User-Authenticated'] = 'true'
                response['X-User-Role'] = 'admin' if (request.user.is_staff or request.user.is_superuser) else 'user'
                response['X-Session-Expires'] = self.get_session_expiry(request)
            else:
                response['X-User-Authenticated'] = 'false'
                
            return response
        
        return self.get_response(request)
    
    def get_session_expiry(self, request):
        """세션 만료 시간 계산"""
        last_activity = request.session.get('last_activity')
        if not last_activity:
            return ''
            
        last_activity_time = timezone.datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
        
        # 역할별 세션 시간
        user = request.user
        if user.username.lower() == 'aebon' or 'aebon' in user.email.lower():
            timeout_hours = 8
        elif user.is_superuser or user.is_staff:
            timeout_hours = 4
        else:
            timeout_hours = 2
            
        expiry_time = last_activity_time + datetime.timedelta(hours=timeout_hours)
        return expiry_time.isoformat()