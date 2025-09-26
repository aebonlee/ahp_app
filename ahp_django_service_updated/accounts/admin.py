from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, UserActivityLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'is_verified', 'can_create_projects', 'created_at']
    list_filter = ['role', 'is_verified', 'can_create_projects', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'organization']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('역할 및 권한', {
            'fields': ('role', 'is_verified', 'can_create_projects', 'max_projects')
        }),
        ('조직 정보', {
            'fields': ('organization', 'department', 'position', 'phone')
        }),
        ('프로필', {
            'fields': ('profile_image', 'bio')
        }),
        ('추가 정보', {
            'fields': ('last_login_ip', 'created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'language', 'timezone', 'total_evaluations', 'total_projects_owned']
    list_filter = ['language', 'email_notifications']
    search_fields = ['user__username', 'user__email']


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'ip_address', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['user__username', 'description']
    readonly_fields = ['created_at']