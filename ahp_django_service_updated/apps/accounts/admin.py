"""
Admin configuration for Account models
"""
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile

User = get_user_model()


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Extended User admin"""
    inlines = (UserProfileInline,)
    
    list_display = (
        'username', 'email', 'full_name', 'organization', 
        'is_evaluator', 'is_project_manager', 'is_active', 'date_joined'
    )
    list_filter = (
        'is_evaluator', 'is_project_manager', 'is_active', 'is_staff', 
        'organization', 'date_joined'
    )
    search_fields = ('username', 'email', 'full_name', 'organization')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('AHP Platform Info', {
            'fields': (
                'full_name', 'organization', 'department', 'position', 
                'phone', 'is_evaluator', 'is_project_manager'
            )
        }),
        ('Preferences', {
            'fields': ('language', 'timezone')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('AHP Platform Info', {
            'fields': (
                'email', 'full_name', 'organization', 'department', 
                'position', 'phone', 'is_evaluator', 'is_project_manager'
            )
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User Profile admin"""
    list_display = ('user', 'created_at', 'email_notifications')
    list_filter = ('email_notifications', 'project_updates', 'evaluation_reminders')
    search_fields = ('user__username', 'user__email', 'bio')
    readonly_fields = ('created_at', 'updated_at')