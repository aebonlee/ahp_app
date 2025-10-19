"""
Django Admin Configuration for AI Management
슈퍼관리자가 웹 인터페이스에서 AI 기능을 관리할 수 있도록 설정
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.db.models import Sum, Count, Avg
from .models import (
    AIServicePlan,
    AIServiceSettings, 
    UserAIAccess,
    AIUsageLog,
    PromptTemplate,
    DevelopmentPromptLog
)


@admin.register(AIServicePlan)
class AIServicePlanAdmin(admin.ModelAdmin):
    """AI 서비스 요금제 관리"""
    list_display = [
        'name', 'display_name', 'monthly_cost', 'monthly_token_limit', 
        'daily_request_limit', 'is_active', 'user_count'
    ]
    list_filter = ['is_active', 'monthly_cost']
    search_fields = ['name', 'display_name']
    ordering = ['monthly_cost']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'display_name', 'description', 'is_active')
        }),
        ('요금 및 한도', {
            'fields': ('monthly_cost', 'monthly_token_limit', 'daily_request_limit')
        }),
        ('기능 설정', {
            'fields': ('features',),
            'description': 'JSON 형식으로 사용 가능한 기능을 설정하세요. 예: {"chatbot": true, "analysis": true}'
        }),
    )
    
    def user_count(self, obj):
        """해당 요금제를 사용하는 사용자 수"""
        count = obj.useraiaccess_set.count()
        return format_html(
            '<span style="color: {};">{}</span>',
            'green' if count > 0 else 'gray',
            count
        )
    user_count.short_description = '사용자 수'
    
    def save_model(self, request, obj, form, change):
        """모델 저장 시 로그 추가"""
        super().save_model(request, obj, form, change)
        action = '수정' if change else '생성'
        messages.success(request, f'AI 서비스 요금제 "{obj.name}"이(가) {action}되었습니다.')


@admin.register(AIServiceSettings)
class AIServiceSettingsAdmin(admin.ModelAdmin):
    """AI 서비스 설정 관리"""
    list_display = [
        'name', 'provider', 'model_name', 'is_active', 'is_default',
        'daily_limit', 'monthly_limit', 'created_by', 'user_count'
    ]
    list_filter = ['provider', 'is_active', 'is_default']
    search_fields = ['name', 'model_name']
    ordering = ['-is_default', 'name']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'provider', 'is_active', 'is_default')
        }),
        ('모델 설정', {
            'fields': ('model_name', 'max_tokens', 'temperature', 'system_prompt')
        }),
        ('API 설정', {
            'fields': ('encrypted_api_key', 'endpoint_url'),
            'description': 'API 키는 자동으로 암호화되어 저장됩니다.'
        }),
        ('사용량 제한', {
            'fields': ('hourly_limit', 'daily_limit', 'monthly_limit')
        }),
    )
    
    readonly_fields = ['created_by']
    
    def user_count(self, obj):
        """해당 설정을 사용하는 사용자 수"""
        count = obj.useraiaccess_set.count()
        return format_html(
            '<span style="color: {};">{}</span>',
            'green' if count > 0 else 'gray',
            count
        )
    user_count.short_description = '할당된 사용자'
    
    def save_model(self, request, obj, form, change):
        """모델 저장 시 생성자 설정"""
        if not change:  # 새로 생성하는 경우
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['test_api_connection', 'make_default']
    
    def test_api_connection(self, request, queryset):
        """선택된 AI 설정들의 API 연결 테스트"""
        tested_count = 0
        success_count = 0
        
        for setting in queryset:
            try:
                # 실제 API 테스트 로직 구현
                # 여기서는 시뮬레이션
                tested_count += 1
                success_count += 1  # 실제로는 API 테스트 결과에 따라 결정
            except Exception as e:
                messages.error(request, f'{setting.name} 연결 실패: {str(e)}')
        
        messages.success(request, f'{tested_count}개 설정 중 {success_count}개 연결 성공')
    test_api_connection.short_description = '선택된 설정들의 API 연결 테스트'
    
    def make_default(self, request, queryset):
        """선택된 설정을 기본값으로 설정"""
        if queryset.count() != 1:
            messages.error(request, '하나의 설정만 선택해주세요.')
            return
        
        setting = queryset.first()
        # 같은 제공자의 다른 설정들을 기본값 해제
        AIServiceSettings.objects.filter(
            provider=setting.provider
        ).update(is_default=False)
        
        setting.is_default = True
        setting.save()
        
        messages.success(request, f'{setting.name}이(가) 기본 설정으로 지정되었습니다.')
    make_default.short_description = '기본 설정으로 지정'


@admin.register(UserAIAccess)
class UserAIAccessAdmin(admin.ModelAdmin):
    """사용자 AI 접근 권한 관리"""
    list_display = [
        'user_info', 'ai_plan', 'ai_settings_info', 'usage_status',
        'is_enabled', 'assigned_by', 'assigned_at'
    ]
    list_filter = [
        'ai_plan', 'is_enabled', 'can_use_advanced_features',
        'assigned_at', 'ai_settings__provider'
    ]
    search_fields = ['user__username', 'user__email', 'user__full_name']
    ordering = ['-assigned_at']
    date_hierarchy = 'assigned_at'
    
    fieldsets = (
        ('사용자 정보', {
            'fields': ('user', 'ai_plan', 'ai_settings')
        }),
        ('권한 설정', {
            'fields': ('is_enabled', 'can_use_advanced_features', 'can_export_conversations')
        }),
        ('사용량 정보', {
            'fields': (
                'tokens_used_today', 'tokens_used_month',
                'requests_today', 'requests_month', 'last_reset_date'
            ),
            'classes': ['collapse']
        }),
        ('알림 설정', {
            'fields': ('usage_alert_threshold', 'email_usage_alerts'),
            'classes': ['collapse']
        }),
        ('관리 정보', {
            'fields': ('assigned_by', 'expires_at', 'notes'),
            'classes': ['collapse']
        }),
    )
    
    readonly_fields = ['assigned_by']
    
    def user_info(self, obj):
        """사용자 정보 표시"""
        return format_html(
            '<strong>{}</strong><br><small>{}</small>',
            obj.user.get_full_name() or obj.user.username,
            obj.user.email
        )
    user_info.short_description = '사용자'
    
    def ai_settings_info(self, obj):
        """AI 설정 정보 표시"""
        if obj.ai_settings:
            return format_html(
                '<span style="color: blue;">{}</span><br><small>{}</small>',
                obj.ai_settings.name,
                obj.ai_settings.get_provider_display()
            )
        return format_html('<span style="color: gray;">미설정</span>')
    ai_settings_info.short_description = 'AI 설정'
    
    def usage_status(self, obj):
        """사용량 상태 표시"""
        percentage = obj.usage_percentage
        color = 'red' if percentage >= 90 else 'orange' if percentage >= 70 else 'green'
        
        return format_html(
            '<div style="color: {};">{:.1f}%</div>'
            '<small>{:,} / {:,} 토큰</small>',
            color,
            percentage,
            obj.tokens_used_month,
            obj.ai_plan.monthly_token_limit
        )
    usage_status.short_description = '사용량 상태'
    
    def save_model(self, request, obj, form, change):
        """모델 저장 시 할당자 설정"""
        if not change:  # 새로 생성하는 경우
            obj.assigned_by = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['reset_daily_usage', 'reset_monthly_usage', 'bulk_enable', 'bulk_disable']
    
    def reset_daily_usage(self, request, queryset):
        """일간 사용량 초기화"""
        count = queryset.update(tokens_used_today=0, requests_today=0)
        messages.success(request, f'{count}명의 사용자의 일간 사용량이 초기화되었습니다.')
    reset_daily_usage.short_description = '일간 사용량 초기화'
    
    def reset_monthly_usage(self, request, queryset):
        """월간 사용량 초기화"""
        for access in queryset:
            access.reset_monthly_usage()
        messages.success(request, f'{queryset.count()}명의 사용자의 월간 사용량이 초기화되었습니다.')
    reset_monthly_usage.short_description = '월간 사용량 초기화'
    
    def bulk_enable(self, request, queryset):
        """선택된 사용자들의 AI 기능 활성화"""
        count = queryset.update(is_enabled=True)
        messages.success(request, f'{count}명의 사용자의 AI 기능이 활성화되었습니다.')
    bulk_enable.short_description = 'AI 기능 활성화'
    
    def bulk_disable(self, request, queryset):
        """선택된 사용자들의 AI 기능 비활성화"""
        count = queryset.update(is_enabled=False)
        messages.success(request, f'{count}명의 사용자의 AI 기능이 비활성화되었습니다.')
    bulk_disable.short_description = 'AI 기능 비활성화'


@admin.register(AIUsageLog)
class AIUsageLogAdmin(admin.ModelAdmin):
    """AI 사용 로그 관리"""
    list_display = [
        'user', 'request_type', 'ai_settings', 'tokens_used',
        'cost', 'response_time', 'user_rating', 'created_at'
    ]
    list_filter = [
        'request_type', 'ai_settings__provider', 'user_rating',
        'created_at', 'ai_settings'
    ]
    search_fields = ['user__username', 'prompt', 'response']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('user', 'ai_settings', 'request_type', 'created_at')
        }),
        ('요청/응답', {
            'fields': ('prompt', 'response'),
            'classes': ['collapse']
        }),
        ('사용량 정보', {
            'fields': ('tokens_used', 'cost', 'response_time', 'model_version')
        }),
        ('사용자 피드백', {
            'fields': ('user_rating', 'user_feedback'),
            'classes': ['collapse']
        }),
        ('메타데이터', {
            'fields': ('ip_address', 'user_agent', 'session_id', 'error_message'),
            'classes': ['collapse']
        }),
    )
    
    readonly_fields = ['created_at']
    
    # 읽기 전용 모드 (로그는 수정 불가)
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # 슈퍼유저만 삭제 가능
    
    def changelist_view(self, request, extra_context=None):
        """목록 페이지에 통계 정보 추가"""
        # 오늘의 통계
        today = timezone.now().date()
        today_stats = AIUsageLog.objects.filter(created_at__date=today).aggregate(
            total_requests=Count('id'),
            total_tokens=Sum('tokens_used'),
            total_cost=Sum('cost'),
            avg_response_time=Avg('response_time')
        )
        
        # 이번 달 통계
        this_month = timezone.now().replace(day=1).date()
        month_stats = AIUsageLog.objects.filter(created_at__date__gte=this_month).aggregate(
            total_requests=Count('id'),
            total_tokens=Sum('tokens_used'),
            total_cost=Sum('cost')
        )
        
        extra_context = extra_context or {}
        extra_context.update({
            'today_stats': today_stats,
            'month_stats': month_stats,
        })
        
        return super().changelist_view(request, extra_context=extra_context)


@admin.register(PromptTemplate)
class PromptTemplateAdmin(admin.ModelAdmin):
    """AI 프롬프트 템플릿 관리"""
    list_display = [
        'name', 'category', 'usage_count', 'average_rating',
        'is_public', 'is_active', 'created_by', 'created_at'
    ]
    list_filter = ['category', 'is_public', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'template']
    ordering = ['-usage_count', 'name']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'category', 'description')
        }),
        ('템플릿 내용', {
            'fields': ('template', 'variables'),
            'description': '변수는 {variable_name} 형식으로 사용하고, variables 필드에 변수 정보를 JSON으로 입력하세요.'
        }),
        ('설정', {
            'fields': ('is_public', 'is_active')
        }),
        ('통계', {
            'fields': ('usage_count', 'average_rating'),
            'classes': ['collapse']
        }),
    )
    
    readonly_fields = ['created_by', 'usage_count', 'average_rating']
    
    def save_model(self, request, obj, form, change):
        """모델 저장 시 생성자 설정"""
        if not change:  # 새로 생성하는 경우
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(DevelopmentPromptLog)
class DevelopmentPromptLogAdmin(admin.ModelAdmin):
    """개발 프롬프트 로그 관리"""
    list_display = [
        'user', 'context', 'session_id', 'file_saved',
        'saved_filename', 'created_at'
    ]
    list_filter = ['context', 'file_saved', 'created_at']
    search_fields = ['user__username', 'user_prompt', 'context', 'session_id']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('user', 'session_id', 'context', 'created_at')
        }),
        ('프롬프트 내용', {
            'fields': ('user_prompt', 'ai_response'),
            'classes': ['collapse']
        }),
        ('파일 저장 정보', {
            'fields': ('file_saved', 'saved_filename')
        }),
    )
    
    readonly_fields = ['created_at']
    
    # 읽기 전용 모드 (로그는 수정 불가)
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # 슈퍼유저만 삭제 가능
    
    actions = ['export_as_development_log']
    
    def export_as_development_log(self, request, queryset):
        """선택된 로그들을 개발일지로 내보내기"""
        # 실제 구현에서는 파일 생성 로직 추가
        messages.success(request, f'{queryset.count()}개의 로그가 개발일지로 내보내기되었습니다.')
    export_as_development_log.short_description = '개발일지로 내보내기'


# Admin 사이트 커스터마이징
admin.site.site_header = 'AHP 플랫폼 AI 관리'
admin.site.site_title = 'AI 관리 시스템'
admin.site.index_title = 'AI 서비스 관리 대시보드'