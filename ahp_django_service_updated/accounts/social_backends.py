# 향후 소셜 로그인 확장을 위한 준비 파일
"""
소셜 로그인 백엔드 설정 (향후 구현)

필요한 패키지:
- django-allauth (통합 소셜 로그인)
- 또는 개별 구현

지원 예정:
- 구글 로그인 (OAuth 2.0)
- 네이버 로그인 (OAuth 2.0) 
- 카카오 로그인 (OAuth 2.0)

설정 예시:
INSTALLED_APPS += [
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.naver',
    'allauth.socialaccount.providers.kakao',
]

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
    },
    'naver': {
        'SCOPE': ['profile', 'email'],
    },
    'kakao': {
        'SCOPE': ['profile_nickname', 'account_email'],
    }
}
"""

class SocialAuthMixin:
    """소셜 로그인 공통 기능"""
    
    def create_social_user(self, email, provider, social_id, **extra_data):
        """소셜 로그인으로 사용자 생성"""
        from .models import User
        
        # 이메일로 기존 사용자 확인
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': f"{provider}_{social_id}",
                'provider': provider,
                'social_id': social_id,
                'is_verified': True,  # 소셜 로그인은 자동 인증
                'role': 'evaluator',  # 기본 일반 회원
                **extra_data
            }
        )
        
        return user, created
    
    def link_social_account(self, user, provider, social_id):
        """기존 계정에 소셜 계정 연결"""
        user.provider = provider
        user.social_id = social_id
        user.save()
        return user


# Google OAuth Backend (향후 구현)
class GoogleOAuthBackend:
    pass

# Naver OAuth Backend (향후 구현)  
class NaverOAuthBackend:
    pass

# Kakao OAuth Backend (향후 구현)
class KakaoOAuthBackend:
    pass