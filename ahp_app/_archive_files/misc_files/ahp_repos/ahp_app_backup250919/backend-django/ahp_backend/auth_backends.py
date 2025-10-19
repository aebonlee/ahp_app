"""
Custom Authentication Backends for AHP Platform
Django 기본 User 모델 호환 이메일 인증 백엔드
"""
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailOrUsernameModelBackend(BaseBackend):
    """
    Django 기본 User 모델 호환 이메일 또는 사용자명 인증 백엔드
    CustomUser 대신 Django 기본 User 모델 사용
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        if username is None or password is None:
            return None
        
        try:
            # 1. 이메일로 사용자 찾기
            if '@' in username:
                user = User.objects.get(email=username)
            else:
                # 2. 사용자명으로 사용자 찾기
                user = User.objects.get(username=username)
                
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
                
        except User.DoesNotExist:
            # 타이밍 공격을 방지하기 위해 패스워드 검증을 실행
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            # 여러 사용자가 있는 경우 None 반환
            return None
            
    def user_can_authenticate(self, user):
        """
        사용자가 인증 가능한지 확인
        """
        is_active = getattr(user, 'is_active', None)
        return is_active or is_active is None

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
        return user if self.user_can_authenticate(user) else None