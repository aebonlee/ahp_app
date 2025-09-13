"""
Enhanced Admin configuration for Account models
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from django.utils.html import format_html
from django.utils import timezone
from .models import UserProfile

User = get_user_model()

# Note: User model is already registered in super_admin app
# Uncomment below if you want to replace super_admin's User admin
# @admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    """Enhanced User Admin with AHP platform specific features"""
    
    list_display = ('username', 'email', 'full_name', 'user_type_badge', 'is_active_badge', 'last_login', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'is_evaluator', 'is_project_manager', 'language', 'date_joined')
    search_fields = ('username', 'email', 'full_name', 'organization', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile Information', {
            'fields': ('full_name', 'organization', 'department', 'position', 'phone')
        }),
        ('Platform Roles', {
            'fields': ('is_evaluator', 'is_project_manager')
        }),
        ('Platform Settings', {
            'fields': ('language', 'timezone')
        }),
        ('Activity', {
            'fields': ('last_activity', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_activity')
    
    def user_type_badge(self, obj):
        """Display user type with badge"""
        badges = []
        if obj.is_superuser:
            badges.append('<span style="background-color: #dc3545; color: white; padding: 2px 6px; border-radius: 3px; margin-right: 3px;">SUPER</span>')
        if obj.is_staff:
            badges.append('<span style="background-color: #fd7e14; color: white; padding: 2px 6px; border-radius: 3px; margin-right: 3px;">STAFF</span>')
        if obj.is_project_manager:
            badges.append('<span style="background-color: #0d6efd; color: white; padding: 2px 6px; border-radius: 3px; margin-right: 3px;">PM</span>')
        if obj.is_evaluator:
            badges.append('<span style="background-color: #198754; color: white; padding: 2px 6px; border-radius: 3px; margin-right: 3px;">EVAL</span>')
        
        if not badges:
            badges.append('<span style="background-color: #6c757d; color: white; padding: 2px 6px; border-radius: 3px;">USER</span>')
            
        return format_html(''.join(badges))
    user_type_badge.short_description = 'Type'
    user_type_badge.admin_order_field = 'is_superuser'
    
    def is_active_badge(self, obj):
        """Active status badge"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #198754; color: white; padding: 2px 6px; border-radius: 3px;">활성</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 2px 6px; border-radius: 3px;">비활성</span>'
        )
    is_active_badge.short_description = 'Status'
    is_active_badge.admin_order_field = 'is_active'
    
    actions = ['activate_users', 'deactivate_users', 'make_evaluator', 'remove_evaluator']
    
    def activate_users(self, request, queryset):
        """Activate selected users"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated}명의 사용자가 활성화되었습니다.')
    activate_users.short_description = '선택된 사용자 활성화'
    
    def deactivate_users(self, request, queryset):
        """Deactivate selected users"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated}명의 사용자가 비활성화되었습니다.')
    deactivate_users.short_description = '선택된 사용자 비활성화'
    
    def make_evaluator(self, request, queryset):
        """Make users evaluators"""
        updated = queryset.update(is_evaluator=True)
        self.message_user(request, f'{updated}명의 사용자가 평가자로 설정되었습니다.')
    make_evaluator.short_description = '평가자로 설정'
    
    def remove_evaluator(self, request, queryset):
        """Remove evaluator role"""
        updated = queryset.update(is_evaluator=False)
        self.message_user(request, f'{updated}명의 사용자에서 평가자 역할이 제거되었습니다.')
    remove_evaluator.short_description = '평가자 역할 제거'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Enhanced User Profile admin"""
    list_display = ('user', 'organization_info', 'notification_settings', 'expertise_count', 'created_at')
    list_filter = ('email_notifications', 'project_updates', 'evaluation_reminders', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__full_name', 'bio', 'research_interests')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('사용자 정보', {
            'fields': ('user', 'avatar', 'bio')
        }),
        ('연구 분야', {
            'fields': ('expertise_areas', 'research_interests', 'publications'),
            'classes': ('collapse',)
        }),
        ('알림 설정', {
            'fields': ('email_notifications', 'project_updates', 'evaluation_reminders')
        }),
        ('메타데이터', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def organization_info(self, obj):
        """Display organization information"""
        user = obj.user
        parts = []
        if user.organization:
            parts.append(user.organization)
        if user.department:
            parts.append(user.department)
        if user.position:
            parts.append(f"({user.position})")
        return ' '.join(parts) if parts else 'N/A'
    organization_info.short_description = 'Organization'
    
    def notification_settings(self, obj):
        """Display notification settings"""
        settings = []
        if obj.email_notifications:
            settings.append('이메일')
        if obj.project_updates:
            settings.append('프로젝트')
        if obj.evaluation_reminders:
            settings.append('평가')
        
        if settings:
            return format_html(
                '<span style="color: #198754;">✓ {}</span>',
                ', '.join(settings)
            )
        return format_html('<span style="color: #dc3545;">✗ 모두 비활성</span>')
    notification_settings.short_description = 'Notifications'
    
    def expertise_count(self, obj):
        """Count expertise areas"""
        if obj.expertise_areas:
            count = len(obj.expertise_areas)
            return f"{count}개 분야"
        return "미설정"
    expertise_count.short_description = 'Expertise'