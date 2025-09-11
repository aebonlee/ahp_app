"""
Advanced Admin configuration for System Management
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db import models
from django.forms import TextInput, Textarea
from .models import (
    SystemSettings, SystemLog, MaintenanceMode, SystemStatistics, 
    BackupRecord, APIUsageLog, SystemNotification
)


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    """Enhanced System Settings Admin"""
    list_display = ('key', 'setting_type', 'category', 'value_preview', 'is_public', 'is_editable', 'updated_at')
    list_filter = ('setting_type', 'category', 'is_public', 'is_editable')
    search_fields = ('key', 'description', 'value')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('key', 'setting_type', 'category', 'description')
        }),
        ('값 설정', {
            'fields': ('value',),
            'classes': ('wide',)
        }),
        ('권한 설정', {
            'fields': ('is_public', 'is_editable')
        }),
        ('메타데이터', {
            'fields': ('created_at', 'updated_at', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows': 4, 'cols': 80})},
    }
    
    def value_preview(self, obj):
        """Show abbreviated value"""
        if len(obj.value) > 50:
            return f"{obj.value[:47]}..."
        return obj.value
    value_preview.short_description = 'Value Preview'
    
    def save_model(self, request, obj, form, change):
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    """System Log Admin with advanced filtering"""
    list_display = ('timestamp', 'level_badge', 'category', 'message_preview', 'user', 'ip_address')
    list_filter = ('level', 'category', 'timestamp', 'response_status')
    search_fields = ('message', 'user__username', 'ip_address', 'request_path')
    readonly_fields = ('timestamp', 'details_formatted')
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('로그 정보', {
            'fields': ('timestamp', 'level', 'category', 'message')
        }),
        ('사용자 정보', {
            'fields': ('user', 'ip_address', 'user_agent')
        }),
        ('요청 정보', {
            'fields': ('request_method', 'request_path', 'response_status'),
            'classes': ('collapse',)
        }),
        ('상세 정보', {
            'fields': ('details_formatted',),
            'classes': ('collapse',)
        })
    )
    
    def level_badge(self, obj):
        """Colored level badge"""
        colors = {
            'debug': '#6c757d',
            'info': '#17a2b8',
            'warning': '#ffc107',
            'error': '#dc3545',
            'critical': '#721c24'
        }
        color = colors.get(obj.level, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">{}</span>',
            color, obj.level.upper()
        )
    level_badge.short_description = 'Level'
    
    def message_preview(self, obj):
        """Show abbreviated message"""
        if len(obj.message) > 60:
            return f"{obj.message[:57]}..."
        return obj.message
    message_preview.short_description = 'Message'
    
    def details_formatted(self, obj):
        """Formatted JSON details"""
        if obj.details:
            import json
            return format_html('<pre>{}</pre>', json.dumps(obj.details, indent=2, ensure_ascii=False))
        return "No details"
    details_formatted.short_description = 'Details'
    
    def has_add_permission(self, request):
        return False  # Logs are created automatically


@admin.register(MaintenanceMode)
class MaintenanceModeAdmin(admin.ModelAdmin):
    """Maintenance Mode Admin"""
    list_display = ('status_badge', 'message_preview', 'scheduled_period', 'enabled_by', 'updated_at')
    readonly_fields = ('enabled_at', 'created_at', 'updated_at')
    
    fieldsets = (
        ('점검 모드 설정', {
            'fields': ('is_enabled', 'message'),
            'classes': ('wide',)
        }),
        ('접근 제어', {
            'fields': ('allowed_ips',),
            'description': 'JSON 배열 형태로 입력하세요. 예: ["127.0.0.1", "192.168.1.100"]'
        }),
        ('일정 관리', {
            'fields': ('scheduled_start', 'scheduled_end'),
            'classes': ('collapse',)
        }),
        ('메타데이터', {
            'fields': ('enabled_by', 'enabled_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def status_badge(self, obj):
        """Status badge"""
        if obj.is_enabled:
            return format_html(
                '<span style="background-color: #dc3545; color: white; padding: 2px 8px; border-radius: 3px;">활성</span>'
            )
        return format_html(
            '<span style="background-color: #28a745; color: white; padding: 2px 8px; border-radius: 3px;">비활성</span>'
        )
    status_badge.short_description = 'Status'
    
    def message_preview(self, obj):
        if len(obj.message) > 50:
            return f"{obj.message[:47]}..."
        return obj.message
    message_preview.short_description = 'Message'
    
    def scheduled_period(self, obj):
        if obj.scheduled_start and obj.scheduled_end:
            return f"{obj.scheduled_start.strftime('%Y-%m-%d %H:%M')} ~ {obj.scheduled_end.strftime('%Y-%m-%d %H:%M')}"
        return "미설정"
    scheduled_period.short_description = 'Scheduled Period'
    
    def save_model(self, request, obj, form, change):
        if obj.is_enabled and not obj.enabled_at:
            obj.enabled_by = request.user
            obj.enabled_at = timezone.now()
        elif not obj.is_enabled:
            obj.enabled_at = None
        super().save_model(request, obj, form, change)


@admin.register(SystemStatistics)
class SystemStatisticsAdmin(admin.ModelAdmin):
    """System Statistics Admin"""
    list_display = ('date', 'total_users', 'active_users_today', 'total_projects', 'evaluations_today', 'error_count')
    list_filter = ('date',)
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'date'
    
    fieldsets = (
        ('날짜', {
            'fields': ('date',)
        }),
        ('사용자 통계', {
            'fields': ('total_users', 'active_users_today', 'new_users_today')
        }),
        ('프로젝트 통계', {
            'fields': ('total_projects', 'active_projects', 'completed_projects_today')
        }),
        ('평가 통계', {
            'fields': ('evaluations_today', 'total_evaluations')
        }),
        ('시스템 성능', {
            'fields': ('avg_response_time', 'error_count', 'storage_used_mb')
        }),
        ('메타데이터', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(BackupRecord)
class BackupRecordAdmin(admin.ModelAdmin):
    """Backup Record Admin"""
    list_display = ('started_at', 'backup_type', 'status_badge', 'file_name', 'file_size_mb', 'duration_display', 'initiated_by')
    list_filter = ('backup_type', 'status', 'started_at')
    search_fields = ('file_name', 'initiated_by__username')
    readonly_fields = ('started_at', 'completed_at', 'duration_display', 'file_size_mb')
    
    fieldsets = (
        ('백업 정보', {
            'fields': ('backup_type', 'status', 'file_name')
        }),
        ('파일 정보', {
            'fields': ('file_size', 'file_size_mb', 'file_path')
        }),
        ('실행 정보', {
            'fields': ('started_at', 'completed_at', 'duration_display', 'initiated_by')
        }),
        ('상세 정보', {
            'fields': ('tables_backed_up', 'error_message'),
            'classes': ('collapse',)
        })
    )
    
    def status_badge(self, obj):
        """Status badge with colors"""
        colors = {
            'pending': '#6c757d',
            'running': '#17a2b8', 
            'completed': '#28a745',
            'failed': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def file_size_mb(self, obj):
        """File size in MB"""
        if obj.file_size:
            return f"{obj.file_size / (1024*1024):.2f} MB"
        return "Unknown"
    file_size_mb.short_description = 'File Size'
    
    def duration_display(self, obj):
        """Duration display"""
        if obj.duration:
            return str(obj.duration)
        return "N/A"
    duration_display.short_description = 'Duration'


@admin.register(APIUsageLog)
class APIUsageLogAdmin(admin.ModelAdmin):
    """API Usage Log Admin"""
    list_display = ('timestamp', 'method', 'endpoint', 'status_badge', 'user', 'response_time_ms', 'ip_address')
    list_filter = ('method', 'status_code', 'timestamp')
    search_fields = ('endpoint', 'user__username', 'ip_address')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('요청 정보', {
            'fields': ('timestamp', 'method', 'endpoint', 'user')
        }),
        ('응답 정보', {
            'fields': ('status_code', 'response_time_ms')
        }),
        ('클라이언트 정보', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('크기 정보', {
            'fields': ('request_size', 'response_size'),
            'classes': ('collapse',)
        })
    )
    
    def status_badge(self, obj):
        """HTTP status badge"""
        if 200 <= obj.status_code < 300:
            color = '#28a745'
        elif 300 <= obj.status_code < 400:
            color = '#17a2b8'
        elif 400 <= obj.status_code < 500:
            color = '#ffc107'
        else:
            color = '#dc3545'
            
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            color, obj.status_code
        )
    status_badge.short_description = 'Status'
    
    def has_add_permission(self, request):
        return False


@admin.register(SystemNotification)
class SystemNotificationAdmin(admin.ModelAdmin):
    """System Notification Admin"""
    list_display = ('title', 'notification_type_badge', 'priority_badge', 'is_active', 'created_by', 'created_at')
    list_filter = ('notification_type', 'priority', 'is_active', 'target_all_admins')
    search_fields = ('title', 'message', 'created_by__username')
    readonly_fields = ('created_at', 'updated_at')
    filter_horizontal = ('target_users',)
    
    fieldsets = (
        ('알림 내용', {
            'fields': ('title', 'message', 'notification_type', 'priority')
        }),
        ('대상 설정', {
            'fields': ('target_all_admins', 'target_users')
        }),
        ('표시 설정', {
            'fields': ('is_active', 'is_dismissible', 'auto_dismiss_after', 'show_on_login', 'show_in_header')
        }),
        ('메타데이터', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def notification_type_badge(self, obj):
        """Type badge"""
        colors = {
            'info': '#17a2b8',
            'warning': '#ffc107',
            'error': '#dc3545',
            'success': '#28a745'
        }
        color = colors.get(obj.notification_type, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            color, obj.get_notification_type_display()
        )
    notification_type_badge.short_description = 'Type'
    
    def priority_badge(self, obj):
        """Priority badge"""
        colors = {
            'low': '#6c757d',
            'medium': '#17a2b8',
            'high': '#ffc107',
            'critical': '#dc3545'
        }
        color = colors.get(obj.priority, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_badge.short_description = 'Priority'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# Admin site customization
admin.site.site_header = "AHP Platform Super Admin"
admin.site.site_title = "AHP Super Admin"
admin.site.index_title = "Super Admin Dashboard"