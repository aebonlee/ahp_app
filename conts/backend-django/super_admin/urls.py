"""
URL Configuration for Super Admin App
Django admin system and REST API endpoints
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# REST API Router 설정
router = DefaultRouter()
router.register(r'users', views.CustomUserViewSet, basename='user')
router.register(r'payments', views.PaymentTransactionViewSet, basename='payment')
router.register(r'projects', views.AHPProjectViewSet, basename='project')

app_name = 'super_admin'

urlpatterns = [
    # 웹 관리자 페이지
    path('', views.admin_dashboard, name='dashboard'),
    path('users/', views.user_management, name='user_management'),
    path('payments/', views.payment_management, name='payment_management'),
    path('projects/', views.project_management, name='project_management'),
    
    # REST API 엔드포인트
    path('api/', include(router.urls)),
    
    # 추가 API 엔드포인트
    path('api/dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('api/activities/recent/', views.recent_activities, name='recent_activities'),
    path('api/users/bulk-action/', views.bulk_user_action, name='bulk_user_action'),
    path('api/system/health/', views.system_health, name='system_health'),
    
    # 통계 및 리포트 API
    path('api/stats/users/', views.user_statistics, name='user_statistics'),
    path('api/stats/payments/', views.payment_statistics, name='payment_statistics'),
    path('api/stats/projects/', views.project_statistics, name='project_statistics'),
    
    # 관리 작업 API
    path('api/admin/export-users/', views.export_users, name='export_users'),
    path('api/admin/system-backup/', views.system_backup, name='system_backup'),
]