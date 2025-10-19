"""
AI Management App URLs
AI 관리 시스템의 URL 라우팅 설정
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AIServicePlanViewSet,
    AIServiceSettingsViewSet,
    UserAIAccessViewSet,
    AIUsageLogViewSet,
    PromptTemplateViewSet,
    DevelopmentPromptLogViewSet,
    UserManagementViewSet,
    PublicAIInfoViewSet
)

app_name = 'ai_management'

# DRF Router 설정
router = DefaultRouter()
router.register(r'plans', AIServicePlanViewSet, basename='ai-service-plans')
router.register(r'settings', AIServiceSettingsViewSet, basename='ai-service-settings')
router.register(r'user-access', UserAIAccessViewSet, basename='user-ai-access')
router.register(r'usage-logs', AIUsageLogViewSet, basename='ai-usage-logs')
router.register(r'templates', PromptTemplateViewSet, basename='prompt-templates')
router.register(r'dev-logs', DevelopmentPromptLogViewSet, basename='development-prompt-logs')
router.register(r'users', UserManagementViewSet, basename='user-management')
router.register(r'public', PublicAIInfoViewSet, basename='public-ai-info')

urlpatterns = [
    # API 엔드포인트
    path('api/', include(router.urls)),
    
    # 커스텀 API 엔드포인트들
    path('api/stats/dashboard/', AIUsageLogViewSet.as_view({'get': 'daily_stats'}), name='dashboard-stats'),
    path('api/stats/monthly/', AIUsageLogViewSet.as_view({'get': 'monthly_stats'}), name='monthly-stats'),
    path('api/users/summary/', UserManagementViewSet.as_view({'get': 'usage_summary'}), name='user-usage-summary'),
    path('api/users/without-access/', UserManagementViewSet.as_view({'get': 'without_ai_access'}), name='users-without-access'),
    path('api/access/overview/', UserAIAccessViewSet.as_view({'get': 'usage_overview'}), name='access-overview'),
    path('api/public/plans/', PublicAIInfoViewSet.as_view({'get': 'available_plans'}), name='public-plans'),
    path('api/public/templates/', PublicAIInfoViewSet.as_view({'get': 'public_templates'}), name='public-templates'),
]

# URL 패턴 이름 매핑 (편의를 위한)
URL_PATTERNS = {
    # AI 서비스 요금제
    'plans_list': 'ai_management:ai-service-plans-list',
    'plans_detail': 'ai_management:ai-service-plans-detail',
    'plans_active': 'ai_management:ai-service-plans-active-plans',
    
    # AI 서비스 설정
    'settings_list': 'ai_management:ai-service-settings-list',
    'settings_detail': 'ai_management:ai-service-settings-detail',
    'settings_test': 'ai_management:ai-service-settings-test-connection',
    'settings_default': 'ai_management:ai-service-settings-make-default',
    
    # 사용자 AI 접근 권한
    'access_list': 'ai_management:user-ai-access-list',
    'access_detail': 'ai_management:user-ai-access-detail',
    'access_bulk_enable': 'ai_management:user-ai-access-bulk-enable',
    'access_bulk_disable': 'ai_management:user-ai-access-bulk-disable',
    'access_reset_usage': 'ai_management:user-ai-access-reset-usage',
    'access_overview': 'ai_management:access-overview',
    
    # AI 사용 로그
    'logs_list': 'ai_management:ai-usage-logs-list',
    'logs_detail': 'ai_management:ai-usage-logs-detail',
    'logs_daily_stats': 'ai_management:dashboard-stats',
    'logs_monthly_stats': 'ai_management:monthly-stats',
    
    # 프롬프트 템플릿
    'templates_list': 'ai_management:prompt-templates-list',
    'templates_detail': 'ai_management:prompt-templates-detail',
    'templates_use': 'ai_management:prompt-templates-use-template',
    
    # 개발 프롬프트 로그
    'dev_logs_list': 'ai_management:development-prompt-logs-list',
    'dev_logs_detail': 'ai_management:development-prompt-logs-detail',
    'dev_logs_export': 'ai_management:development-prompt-logs-export-logs',
    
    # 사용자 관리
    'users_list': 'ai_management:user-management-list',
    'users_detail': 'ai_management:user-management-detail',
    'users_without_access': 'ai_management:users-without-access',
    'users_summary': 'ai_management:user-usage-summary',
    
    # 공개 정보
    'public_plans': 'ai_management:public-plans',
    'public_templates': 'ai_management:public-templates',
}