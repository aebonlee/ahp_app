from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, UserProfile, UserActivityLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """사용자 관리 어드민"""
    
    # 목록 페이지 설정
    list_display = (
        'email', 'username', 'role_badge', 'provider_badge', 
        'can_create_projects', 'project_count', 'is_verified', 
        'is_active', 'last_login', 'created_at'
    )
    list_filter = (
        'role', 'provider', 'is_verified', 'can_create_projects', 
        'is_active', 'is_staff', 'created_at'
    )
    search_fields = ('email', 'username', 'organization')
    ordering = ('-created_at',)
    
    # 상세 페이지 설정
    fieldsets = (
        ('기본 정보', {
            'fields': ('username', 'email', 'password')
        }),
        ('개인 정보', {
            'fields': ('first_name', 'last_name', 'phone', 'organization', 'department', 'position')
        }),
        ('권한 및 등급', {
            'fields': ('role', 'can_create_projects', 'max_projects', 'is_verified', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('소셜 로그인', {
            'fields': ('provider', 'social_id'),
            'classes': ('collapse',)
        }),
        ('프로필', {
            'fields': ('profile_image', 'bio'),
            'classes': ('collapse',)
        }),
        ('시간 정보', {
            'fields': ('last_login', 'last_login_ip', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # 사용자 추가 시 필드
    add_fieldsets = (
        ('기본 정보', {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
        ('권한 설정', {
            'fields': ('role', 'can_create_projects', 'max_projects'),
        }),
    )
    
    readonly_fields = ('last_login', 'created_at', 'updated_at', 'last_login_ip')
    
    def role_badge(self, obj):
        """역할을 컬러 뱃지로 표시"""
        colors = {
            'super_admin': '#dc3545',  # 빨강
            'service_admin': '#007bff',  # 파랑
            'evaluator': '#28a745',  # 초록
        }
        color = colors.get(obj.role, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">{}</span>',
            color, obj.get_role_display()
        )
    role_badge.short_description = '회원 등급'
    
    def provider_badge(self, obj):
        """로그인 방식을 뱃지로 표시"""
        colors = {
            'email': '#6c757d',  # 회색
            'google': '#db4437',  # 구글 빨강
            'naver': '#03c75a',  # 네이버 초록
            'kakao': '#fee500',  # 카카오 노랑
        }
        color = colors.get(obj.provider, '#6c757d')
        text_color = 'black' if obj.provider == 'kakao' else 'white'
        return format_html(
            '<span style="background-color: {}; color: {}; padding: 3px 8px; border-radius: 3px; font-size: 12px;">{}</span>',
            color, text_color, obj.get_provider_display()
        )
    provider_badge.short_description = '로그인 방식'
    
    def project_count(self, obj):
        """보유 프로젝트 수"""
        try:
            count = obj.get_project_count()
            return f"{count}/{obj.max_projects}"
        except:
            return "0/0"
    project_count.short_description = '프로젝트 (현재/최대)'
    
    # 액션 추가
    actions = ['make_service_admin', 'make_evaluator', 'verify_users']
    
    def make_service_admin(self, request, queryset):
        """선택된 사용자를 결제 회원으로 승격"""
        updated = queryset.update(role='service_admin', can_create_projects=True, max_projects=10)
        self.message_user(request, f'{updated}명의 사용자를 결제 회원으로 승격했습니다.')
    make_service_admin.short_description = '선택된 사용자를 결제 회원으로 승격'
    
    def make_evaluator(self, request, queryset):
        """선택된 사용자를 일반 회원으로 변경"""
        updated = queryset.update(role='evaluator', can_create_projects=False, max_projects=0)
        self.message_user(request, f'{updated}명의 사용자를 일반 회원으로 변경했습니다.')
    make_evaluator.short_description = '선택된 사용자를 일반 회원으로 변경'
    
    def verify_users(self, request, queryset):
        """선택된 사용자 이메일 인증 완료 처리"""
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated}명의 사용자 이메일 인증을 완료했습니다.')
    verify_users.short_description = '선택된 사용자 이메일 인증 완료'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """사용자 프로필 어드민"""
    
    list_display = ('user', 'language', 'timezone', 'total_projects_owned', 'total_evaluations', 'updated_at')
    list_filter = ('language', 'email_notifications', 'evaluation_reminders')
    search_fields = ('user__email', 'user__username')
    
    fieldsets = (
        ('알림 설정', {
            'fields': ('email_notifications', 'evaluation_reminders', 'project_updates')
        }),
        ('언어 및 지역', {
            'fields': ('language', 'timezone')
        }),
        ('통계', {
            'fields': ('total_evaluations', 'total_projects_owned', 'total_projects_participated'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    """사용자 활동 로그 어드민"""
    
    list_display = ('user', 'action_badge', 'description', 'ip_address', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('user__email', 'user__username', 'description')
    ordering = ('-created_at',)
    
    readonly_fields = ('user', 'action', 'description', 'ip_address', 'user_agent', 'metadata', 'created_at')
    
    def action_badge(self, obj):
        """액션을 컬러 뱃지로 표시"""
        colors = {
            'login': '#28a745',  # 초록
            'logout': '#6c757d',  # 회색
            'create_project': '#007bff',  # 파랑
            'delete_project': '#dc3545',  # 빨강
            'start_evaluation': '#ffc107',  # 노랑
            'complete_evaluation': '#17a2b8',  # 청록
        }
        color = colors.get(obj.action, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">{}</span>',
            color, obj.get_action_display()
        )
    action_badge.short_description = '활동'
    
    def has_add_permission(self, request):
        """로그는 수동 추가 불가"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """로그는 수정 불가"""
        return False


# 어드민 사이트 커스터마이징
admin.site.site_header = 'AHP 플랫폼 관리'
admin.site.site_title = 'AHP Admin'
admin.site.index_title = 'AHP 플랫폼 관리자 페이지'