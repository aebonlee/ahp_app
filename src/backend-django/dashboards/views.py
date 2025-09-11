"""
Role-based Dashboard Views
권한별 대시보드 뷰
"""

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth import get_user_model

User = get_user_model()


@login_required
def personal_dashboard(request):
    """개인서비스 사용자 대시보드"""
    user = request.user
    
    context = {
        'user': user,
        'dashboard_type': 'personal',
        'title': 'AHP Platform - 개인서비스',
        'user_projects': [],  # TODO: 사용자 프로젝트 조회
        'recent_activity': [],  # TODO: 최근 활동 조회
    }
    
    return render(request, 'dashboards/personal_dashboard.html', context)


@login_required
def evaluator_dashboard(request):
    """평가자 대시보드"""
    user = request.user
    
    context = {
        'user': user,
        'dashboard_type': 'evaluator',
        'title': 'AHP Platform - 평가자',
        'evaluation_projects': [],  # TODO: 평가 프로젝트 조회
        'pending_evaluations': [],  # TODO: 대기중인 평가 조회
    }
    
    return render(request, 'dashboards/evaluator_dashboard.html', context)


@login_required
def enterprise_dashboard(request):
    """기업 사용자 대시보드"""
    user = request.user
    
    context = {
        'user': user,
        'dashboard_type': 'enterprise',
        'title': 'AHP Platform - 기업 서비스',
        'team_projects': [],  # TODO: 팀 프로젝트 조회
        'team_members': [],  # TODO: 팀 멤버 조회
    }
    
    return render(request, 'dashboards/enterprise_dashboard.html', context)


def dashboard_redirect(request):
    """로그인 후 권한별 대시보드 리다이렉트"""
    if not request.user.is_authenticated:
        return redirect('/admin/login/')
    
    user = request.user
    
    # 슈퍼유저는 Super Admin으로
    if user.is_superuser:
        return redirect('/super-admin/')
    
    # 스태프는 Django Admin으로
    if user.is_staff:
        return redirect('/admin/')
    
    # CustomUser 모델의 user_type 확인
    if hasattr(user, 'user_type'):
        user_type = user.user_type
        if user_type == 'super_admin':
            return redirect('/super-admin/')
        elif user_type == 'admin':
            return redirect('/admin/')
        elif user_type == 'evaluator':
            return redirect('/evaluator-dashboard/')
        elif user_type == 'enterprise':
            return redirect('/enterprise-dashboard/')
    
    # 사용자명 기반 타입 결정
    username_lower = user.username.lower()
    
    # 관리자 계정들
    admin_usernames = ['admin', 'administrator', 'aebon', 'testadmin']
    if any(admin in username_lower for admin in admin_usernames):
        return redirect('/admin/')
    
    # 평가자 계정들
    evaluator_usernames = ['evaluator', 'eval']
    if any(eval_name in username_lower for eval_name in evaluator_usernames):
        return redirect('/evaluator-dashboard/')
    
    # 기본값: 개인서비스 대시보드
    return redirect('/personal-dashboard/')


@login_required
def api_dashboard_info(request):
    """현재 사용자의 대시보드 정보 API"""
    user = request.user
    
    # 사용자 타입 결정
    if user.is_superuser:
        user_type = 'super_admin'
        dashboard_url = '/super-admin/'
    elif user.is_staff:
        user_type = 'admin' 
        dashboard_url = '/admin/'
    elif hasattr(user, 'user_type'):
        user_type = user.user_type
        dashboard_url = {
            'super_admin': '/super-admin/',
            'admin': '/admin/',
            'evaluator': '/evaluator-dashboard/',
            'enterprise': '/enterprise-dashboard/',
            'personal_service': '/personal-dashboard/'
        }.get(user_type, '/personal-dashboard/')
    else:
        user_type = 'personal_service'
        dashboard_url = '/personal-dashboard/'
    
    return JsonResponse({
        'user': {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'full_name': user.get_full_name(),
            'user_type': user_type,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        },
        'dashboard': {
            'type': user_type,
            'url': dashboard_url,
            'title': {
                'super_admin': 'Super Admin Dashboard',
                'admin': 'Django Admin',
                'evaluator': '평가자 대시보드',
                'enterprise': '기업 대시보드',
                'personal_service': '개인서비스 대시보드'
            }.get(user_type, '개인서비스 대시보드')
        }
    })