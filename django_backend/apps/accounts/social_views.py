"""
Social Authentication Views
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.kakao.views import KakaoOAuth2Adapter
from allauth.socialaccount.providers.naver.views import NaverOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
import logging

logger = logging.getLogger(__name__)


class GoogleLogin(SocialLoginView):
    """Google OAuth2 Login"""
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:3000/auth/google/callback"
    client_class = None


class KakaoLogin(SocialLoginView):
    """Kakao OAuth2 Login"""
    adapter_class = KakaoOAuth2Adapter
    callback_url = "http://localhost:3000/auth/kakao/callback"
    client_class = None


class NaverLogin(SocialLoginView):
    """Naver OAuth2 Login"""
    adapter_class = NaverOAuth2Adapter
    callback_url = "http://localhost:3000/auth/naver/callback"
    client_class = None


@api_view(['GET'])
@permission_classes([AllowAny])
def social_login_urls(request):
    """
    Get social login URLs for frontend
    """
    base_url = request.build_absolute_uri('/')
    
    return Response({
        'google': {
            'auth_url': f'{base_url}api/auth/social/google/login/',
            'callback_url': f'{base_url}api/auth/social/google/callback/',
            'client_id': getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', ''),
        },
        'kakao': {
            'auth_url': f'{base_url}api/auth/social/kakao/login/',
            'callback_url': f'{base_url}api/auth/social/kakao/callback/',
            'client_id': getattr(settings, 'KAKAO_REST_API_KEY', ''),
        },
        'naver': {
            'auth_url': f'{base_url}api/auth/social/naver/login/',
            'callback_url': f'{base_url}api/auth/social/naver/callback/',
            'client_id': getattr(settings, 'NAVER_CLIENT_ID', ''),
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def social_login_token(request):
    """
    Handle social login with token from frontend
    """
    provider = request.data.get('provider')
    access_token = request.data.get('access_token')
    
    if not provider or not access_token:
        return Response({
            'error': 'Provider and access_token are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if provider == 'google':
            view = GoogleLogin()
        elif provider == 'kakao':
            view = KakaoLogin()
        elif provider == 'naver':
            view = NaverLogin()
        else:
            return Response({
                'error': f'Unsupported provider: {provider}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set up the request data
        request.data['access_token'] = access_token
        view.request = request
        
        # Process the login
        response = view.post(request)
        
        logger.info(f"Social login successful for provider: {provider}")
        return response
        
    except Exception as e:
        logger.error(f"Social login error for provider {provider}: {str(e)}")
        return Response({
            'error': 'Social login failed',
            'detail': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)