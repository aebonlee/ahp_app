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
    
    # ===== 슈퍼관리자 10개 페이지 API 엔드포인트 =====
    path('api/system/settings/', views.system_settings_api, name='system_settings_api'),
    path('api/audit/logs/', views.audit_logs_api, name='audit_logs_api'),
    path('api/backup/restore/', views.backup_restore_api, name='backup_restore_api'),
    path('api/database/', views.database_management_api, name='database_management_api'),
    path('api/migration/', views.data_migration_api, name='data_migration_api'),
    path('api/security/settings/', views.security_settings_api, name='security_settings_api'),
    path('api/access/control/', views.access_control_api, name='access_control_api'),
    path('api/security/logs/', views.security_logs_api, name='security_logs_api'),
    path('api/dashboard/stats/', views.dashboard_stats_api, name='dashboard_stats_api'),
]