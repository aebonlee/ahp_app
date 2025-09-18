"""
인증 시스템 URL 설정
"""
from django.urls import path
from .auth_views import (
    register_api,
    login_api,
    logout_api,
    user_info_api,
    test_auth_api
)

urlpatterns = [
    # 메인 인증 엔드포인트
    path('register/', register_api, name='auth_register'),
    path('login/', login_api, name='auth_login'),
    path('logout/', logout_api, name='auth_logout'),
    path('user/', user_info_api, name='auth_user_info'),
    path('test/', test_auth_api, name='auth_test'),
    
    # 호환성을 위한 별칭
    path('signup/', register_api, name='auth_signup'),
    path('me/', user_info_api, name='auth_me'),
]