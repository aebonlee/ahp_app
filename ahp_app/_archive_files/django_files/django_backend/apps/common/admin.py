"""
Admin configuration for Common/System models
공통 시스템 모델 관리자 설정
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import (
    ActivityLog, Notification, SystemSettings,
    APIKey, FileUpload
)

User = get_user_model()


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    """활동 로그 관리"""
    list_display = [
        'user_email', 'action_badge', 'level_badge',
        'ip_address', 'user_agent_short', 'timestamp_display'
    ]
    list_filter = [
        'action', 'level', 'timestamp',
        ('user', admin.RelatedOnlyFieldListFilter)
    ]
    search_fields = ['user__email', 'action', 'message', 'ip_address']
    readonly_fields = [
        'user', 'action', 'level', 'content_type', 'object_id',
        'message', 'details', 'ip_address', 'user_agent', 'request_path', 'timestamp'
    ]
    ordering = ['-timestamp']
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('활동 정보', {
            'fields': ('user', 'action', 'level', 'message')
        }),
        ('대상 정보', {
            'fields': ('content_type', 'object_id')
        }),
        ('상세 정보', {
            'fields': ('details',),
            'classes': ('collapse',)
        }),
        ('접속 정보', {
            'fields': ('ip_address', 'user_agent', 'request_path', 'timestamp')
        }),
    )
    
    def user_email(self, obj):
        if obj.user:
            return format_html(
                '<a href="/admin/accounts/user/{}/change/">{}</a>',
                obj.user.id, obj.user.email
            )
        return '익명'
    user_email.short_description = '사용자'
    
    def action_badge(self, obj):
        action_colors = {
            'login': '#28a745',
            'logout': '#6c757d',
            'create': '#007bff',
            'update': '#ffc107',
            'delete': '#dc3545',
            'view': '#17a2b8',
            'export': '#6f42c1',
            'error': '#dc3545'
        }
        color = action_colors.get(obj.action, '#6c757d')
        icon = {
            'login': '🔐',
            'logout': '🔓',
            'create': '➕',
            'update': '✏️',
            'delete': '🗑️',
            'view': '👁️',
            'export': '💾',
            'error': '❌'
        }.get(obj.action, '📝')
        
        return format_html(
            '{} <span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            icon, color, obj.action
        )
    action_badge.short_description = '활동'
    
    def level_badge(self, obj):
        level_colors = {
            'info': '#17a2b8',
            'warning': '#ffc107',
            'error': '#dc3545',
            'debug': '#6c757d'
        }
        color = level_colors.get(obj.level, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_level_display()
        )
    level_badge.short_description = '레벨'
    
    def user_agent_short(self, obj):
        if obj.user_agent:
            # 브라우저 정보만 간단히 표시
            if 'Chrome' in obj.user_agent:
                return '🌐 Chrome'
            elif 'Firefox' in obj.user_agent:
                return '🦊 Firefox'
            elif 'Safari' in obj.user_agent:
                return '🧭 Safari'
            elif 'Edge' in obj.user_agent:
                return '🌊 Edge'
            else:
                return obj.user_agent[:20] + '...'
        return '-'
    user_agent_short.short_description = '브라우저'
    
    def timestamp_display(self, obj):
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    timestamp_display.short_description = '시간'
    
    def has_add_permission(self, request):
        # 로그는 수동으로 추가할 수 없음
        return False
    
    def has_change_permission(self, request, obj=None):
        # 로그는 수정할 수 없음
        return False


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """알림 관리"""
    list_display = [
        'recipient_email', 'type_badge', 'title_short',
        'is_read_badge', 'is_important_badge', 'created_date'
    ]
    list_filter = [
        'type', 'is_read', 'is_important',
        'created_at', 'read_at'
    ]
    search_fields = ['recipient__email', 'recipient__username', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('수신자 정보', {
            'fields': ('recipient', 'type', 'is_important')
        }),
        ('알림 내용', {
            'fields': ('title', 'message', 'action_url', 'action_label')
        }),
        ('관련 객체', {
            'fields': ('content_type', 'object_id'),
            'classes': ('collapse',)
        }),
        ('상태', {
            'fields': ('is_read', 'read_at', 'created_at', 'expires_at')
        }),
    )
    
    def recipient_email(self, obj):
        return obj.recipient.email if obj.recipient else '전체'
    recipient_email.short_description = '수신자'
    
    def type_badge(self, obj):
        type_info = {
            'info': ('ℹ️', '#17a2b8'),
            'success': ('✅', '#28a745'),
            'warning': ('⚠️', '#ffc107'),
            'error': ('❌', '#dc3545')
        }
        icon, color = type_info.get(obj.type, ('📢', '#6c757d'))
        return format_html(
            '{} <span style="color: {};">{}</span>',
            icon, color, obj.get_type_display()
        )
    type_badge.short_description = '유형'
    
    def title_short(self, obj):
        return obj.title[:30] + '...' if len(obj.title) > 30 else obj.title
    title_short.short_description = '제목'
    
    def is_read_badge(self, obj):
        if obj.is_read:
            return format_html('<span style="color: #6c757d;">📭 읽음</span>')
        return format_html('<span style="color: #007bff; font-weight: bold;">📬 안읽음</span>')
    is_read_badge.short_description = '상태'
    
    def is_important_badge(self, obj):
        if obj.is_important:
            return format_html('<span style="color: #dc3545;">⭐ 중요</span>')
        return format_html('<span style="color: #6c757d;">☆ 일반</span>')
    is_important_badge.short_description = '중요도'
    
    def created_date(self, obj):
        # 오늘이면 시간만, 아니면 날짜 표시
        if obj.created_at.date() == timezone.now().date():
            return obj.created_at.strftime('%H:%M')
        return obj.created_at.strftime('%m/%d')
    created_date.short_description = '생성'
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True, read_at=timezone.now())
        self.message_user(request, f'{updated}개의 알림을 읽음으로 표시했습니다.')
    mark_as_read.short_description = '선택된 알림을 읽음으로 표시'
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False, read_at=None)
        self.message_user(request, f'{updated}개의 알림을 안읽음으로 표시했습니다.')
    mark_as_unread.short_description = '선택된 알림을 안읽음으로 표시'


@admin.register(SystemSettings)
class SystemSettingAdmin(admin.ModelAdmin):
    """시스템 설정 관리"""
    list_display = [
        'key', 'value_display', 'category_badge',
        'is_editable_badge', 'updated_date'
    ]
    list_filter = ['category', 'is_editable', 'is_public', 'updated_at']
    search_fields = ['key', 'value', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['category', 'key']
    
    fieldsets = (
        ('설정 정보', {
            'fields': ('key', 'value', 'category', 'value_type')
        }),
        ('설명', {
            'fields': ('name', 'description')
        }),
        ('상태', {
            'fields': ('is_editable', 'is_public')
        }),
        ('메타데이터', {
            'fields': ('validation_rules', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def value_display(self, obj):
        if obj.value_type == 'boolean':
            return '✅' if obj.value.lower() == 'true' else '❌'
        elif 'password' in obj.key.lower():
            return '●●●●●●●●'
        elif len(obj.value) > 50:
            return obj.value[:50] + '...'
        return obj.value
    value_display.short_description = '값'
    
    def category_badge(self, obj):
        categories = {
            'general': ('⚙️', '#6c757d'),
            'email': ('✉️', '#007bff'),
            'security': ('🔒', '#dc3545'),
            'analytics': ('📊', '#28a745'),
            'ui': ('🎨', '#ffc107')
        }
        icon, color = categories.get(obj.category, ('📋', '#6c757d'))
        return format_html(
            '{} <span style="color: {};">{}</span>',
            icon, color, obj.category
        )
    category_badge.short_description = '카테고리'
    
    def is_editable_badge(self, obj):
        if obj.is_editable:
            return format_html('<span style="color: #28a745;">✏️ 수정가능</span>')
        return format_html('<span style="color: #dc3545;">🔒 읽기전용</span>')
    is_editable_badge.short_description = '편집'
    
    def updated_date(self, obj):
        return obj.updated_at.strftime('%Y-%m-%d %H:%M')
    updated_date.short_description = '수정일'


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    """API 키 관리"""
    list_display = [
        'name', 'user_email', 'key_preview', 'is_active_badge',
        'rate_limit_display', 'usage_count', 'last_used_display', 'expires_display'
    ]
    list_filter = ['is_active', 'created_at', 'expires_at']
    search_fields = ['name', 'user__email', 'user__username']
    readonly_fields = ['key', 'usage_count', 'last_used_at', 'created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'user')
        }),
        ('API 키', {
            'fields': ('key', 'permissions', 'rate_limit')
        }),
        ('사용 정보', {
            'fields': ('usage_count', 'last_used_at')
        }),
        ('유효기간', {
            'fields': ('is_active', 'expires_at')
        }),
        ('시간 정보', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email if obj.user else '시스템'
    user_email.short_description = '소유자'
    
    def key_preview(self, obj):
        # API 키의 일부만 표시
        if obj.key:
            return f'{obj.key[:8]}...{obj.key[-4:]}'
        return '-'
    key_preview.short_description = 'API 키'
    
    def is_active_badge(self, obj):
        if not obj.is_active:
            return format_html('<span style="color: #dc3545;">❌ 비활성</span>')
        elif obj.expires_at and obj.expires_at < timezone.now():
            return format_html('<span style="color: #ffc107;">⏰ 만료됨</span>')
        return format_html('<span style="color: #28a745;">✅ 활성</span>')
    is_active_badge.short_description = '상태'
    
    def rate_limit_display(self, obj):
        return format_html(
            '<span style="color: #007bff;">{} req/h</span>',
            obj.rate_limit
        )
    rate_limit_display.short_description = '제한'
    
    def last_used_display(self, obj):
        if obj.last_used_at:
            days_ago = (timezone.now() - obj.last_used_at).days
            if days_ago == 0:
                return '오늘'
            elif days_ago == 1:
                return '어제'
            elif days_ago < 7:
                return f'{days_ago}일 전'
            else:
                return obj.last_used_at.strftime('%m/%d')
        return '미사용'
    last_used_display.short_description = '마지막 사용'
    
    def expires_display(self, obj):
        if obj.expires_at:
            if obj.expires_at < timezone.now():
                return format_html('<span style="color: #dc3545;">만료됨</span>')
            days_left = (obj.expires_at - timezone.now()).days
            if days_left < 7:
                return format_html('<span style="color: #ffc107;">{} 일 남음</span>', days_left)
            return obj.expires_at.strftime('%Y-%m-%d')
        return '무제한'
    expires_display.short_description = '만료일'
    
    actions = ['activate_keys', 'deactivate_keys']
    
    def activate_keys(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated}개의 API 키를 활성화했습니다.')
    activate_keys.short_description = '선택된 API 키 활성화'
    
    def deactivate_keys(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated}개의 API 키를 비활성화했습니다.')
    deactivate_keys.short_description = '선택된 API 키 비활성화'


@admin.register(FileUpload)
class FileUploadAdmin(admin.ModelAdmin):
    """파일 업로드 관리"""
    list_display = [
        'filename_display', 'upload_type_badge', 'file_size_display',
        'uploaded_by_email', 'upload_status_badge', 'uploaded_date'
    ]
    list_filter = ['upload_type', 'status', 'created_at']
    search_fields = ['original_name', 'uploaded_by__email']
    readonly_fields = ['id', 'file_path', 'file_size', 'mime_type', 'created_at', 'completed_at']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('파일 정보', {
            'fields': ('original_name', 'file_path', 'upload_type', 'mime_type')
        }),
        ('파일 상세', {
            'fields': ('file_size', 'status')
        }),
        ('업로드 정보', {
            'fields': ('uploaded_by',)
        }),
        ('처리 결과', {
            'fields': ('processing_results', 'error_message'),
            'classes': ('collapse',)
        }),
        ('메타데이터', {
            'fields': ('id', 'metadata', 'created_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def filename_display(self, obj):
        icon = {
            'project_import': '📥',
            'data_export': '📤',
            'user_avatar': '👤',
            'document': '📄'
        }.get(obj.upload_type, '📎')
        return format_html('{} {}', icon, obj.original_name[:30])
    filename_display.short_description = '파일명'
    
    def upload_type_badge(self, obj):
        type_colors = {
            'project_import': '#28a745',
            'data_export': '#007bff',
            'user_avatar': '#ffc107',
            'document': '#6c757d'
        }
        color = type_colors.get(obj.upload_type, '#6c757d')
        type_labels = {
            'project_import': '프로젝트',
            'data_export': '내보내기',
            'user_avatar': '아바타',
            'document': '문서'
        }
        label = type_labels.get(obj.upload_type, obj.upload_type)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            color, label
        )
    upload_type_badge.short_description = '유형'
    
    def file_size_display(self, obj):
        if obj.file_size:
            size = obj.file_size
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024.0:
                    return f'{size:.1f} {unit}'
                size /= 1024.0
            return f'{size:.1f} TB'
        return '-'
    file_size_display.short_description = '크기'
    
    def uploaded_by_email(self, obj):
        return obj.uploaded_by.email if obj.uploaded_by else '시스템'
    uploaded_by_email.short_description = '업로더'
    
    def upload_status_badge(self, obj):
        status_info = {
            'uploading': ('⏳', '#ffc107', '업로드중'),
            'completed': ('✅', '#28a745', '완료'),
            'failed': ('❌', '#dc3545', '실패')
        }
        icon, color, text = status_info.get(obj.status, ('❓', '#6c757d', '알수없음'))
        return format_html(
            '{} <span style="color: {};">{}</span>',
            icon, color, text
        )
    upload_status_badge.short_description = '상태'
    
    def uploaded_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M')
    uploaded_date.short_description = '업로드일'
    
    actions = ['mark_as_completed', 'mark_as_failed']
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status='completed', completed_at=timezone.now())
        self.message_user(request, f'{updated}개 파일을 완료 상태로 변경했습니다.')
    mark_as_completed.short_description = '선택된 파일을 완료 상태로 변경'
    
    def mark_as_failed(self, request, queryset):
        updated = queryset.update(status='failed')
        self.message_user(request, f'{updated}개 파일을 실패 상태로 변경했습니다.')
    mark_as_failed.short_description = '선택된 파일을 실패 상태로 변경'