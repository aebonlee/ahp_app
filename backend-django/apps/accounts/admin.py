"""
Admin configuration for Account models - Simplified for basic User model compatibility
"""
from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User Profile admin"""
    list_display = ('user', 'created_at', 'email_notifications')
    list_filter = ('email_notifications', 'project_updates', 'evaluation_reminders')
    search_fields = ('user__username', 'user__email', 'bio')
    readonly_fields = ('created_at', 'updated_at')