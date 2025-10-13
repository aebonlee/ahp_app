"""
Admin configuration for Project models
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import (
    Project, ProjectMember, Criteria, ProjectTemplate
)


class CriteriaInline(admin.TabularInline):
    model = Criteria
    extra = 0
    fields = ('name', 'description', 'type', 'parent', 'order', 'level', 'is_active')


class ProjectMemberInline(admin.TabularInline):
    model = ProjectMember
    extra = 0
    fields = ('user', 'role', 'can_edit_structure', 'can_manage_evaluators', 'can_view_results')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """프로젝트 관리 어드민"""
    inlines = [ProjectMemberInline, CriteriaInline]
    
    list_display = (
        'title', 'owner', 'status_badge', 'evaluation_mode_badge',
        'criteria_count', 'alternatives_count', 'visibility',
        'created_at', 'updated_at'
    )
    list_filter = (
        'status', 'evaluation_mode', 'visibility', 'workflow_stage', 'created_at'
    )
    search_fields = ('title', 'description', 'owner__email', 'owner__username')
    ordering = ('-created_at',)
    readonly_fields = ('criteria_count', 'alternatives_count', 'created_at', 'updated_at')
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('title', 'description', 'objective', 'owner')
        }),
        ('설정', {
            'fields': ('status', 'visibility', 'evaluation_mode', 'workflow_stage')
        }),
        ('AHP 설정', {
            'fields': ('consistency_ratio_threshold', 'deadline')
        }),
        ('카운트 (자동)', {
            'fields': ('criteria_count', 'alternatives_count'),
            'classes': ('collapse',)
        }),
        ('메타데이터', {
            'fields': ('tags', 'settings'),
            'classes': ('collapse',)
        }),
        ('시간 정보', {
            'fields': ('created_at', 'updated_at', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj):
        """상태를 컬러 뱃지로 표시"""
        colors = {
            'draft': '#6c757d',      # 회색
            'active': '#007bff',     # 파랑
            'evaluation': '#ffc107', # 노랑
            'completed': '#28a745',  # 초록
            'archived': '#17a2b8',   # 청록
            'deleted': '#dc3545',    # 빨강
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = '상태'
    
    def evaluation_mode_badge(self, obj):
        """평가 모드를 뱃지로 표시"""
        colors = {
            'practical': '#28a745',     # 초록
            'theoretical': '#007bff',   # 파랑
            'direct_input': '#ffc107',  # 노랑
            'fuzzy_ahp': '#6f42c1',     # 보라
        }
        color = colors.get(obj.evaluation_mode, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">{}</span>',
            color, obj.get_evaluation_mode_display()
        )
    evaluation_mode_badge.short_description = '평가 모드'
    
    # 액션 추가
    actions = ['activate_projects', 'archive_projects', 'soft_delete_projects']
    
    def activate_projects(self, request, queryset):
        """선택된 프로젝트를 활성화"""
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated}개의 프로젝트를 활성화했습니다.')
    activate_projects.short_description = '선택된 프로젝트 활성화'
    
    def archive_projects(self, request, queryset):
        """선택된 프로젝트를 보관"""
        updated = queryset.update(status='archived')
        self.message_user(request, f'{updated}개의 프로젝트를 보관했습니다.')
    archive_projects.short_description = '선택된 프로젝트 보관'
    
    def soft_delete_projects(self, request, queryset):
        """선택된 프로젝트를 소프트 삭제"""
        from django.utils import timezone
        updated = queryset.update(status='deleted', deleted_at=timezone.now())
        self.message_user(request, f'{updated}개의 프로젝트를 삭제했습니다.')
    soft_delete_projects.short_description = '선택된 프로젝트 삭제'


@admin.register(Criteria)
class CriteriaAdmin(admin.ModelAdmin):
    """기준(Criteria) 관리 어드민"""
    list_display = [
        'name',
        'project_link', 
        'type_badge',
        'level_display',
        'parent_display',
        'order_display',
        'weight_display',
        'active_badge'
    ]
    list_filter = [
        'project',
        'type', 
        'level',
        'is_active',
        'created_at'
    ]
    search_fields = ['name', 'description', 'project__title']
    list_editable = []
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('project', 'name', 'description', 'type')
        }),
        ('계층 구조', {
            'fields': ('parent', 'level', 'order'),
            'description': '계층 구조를 설정합니다. Level 1이 최상위입니다.'
        }),
        ('설정', {
            'fields': ('weight', 'is_active'),
            'description': '가중치는 계산 완료 후 자동으로 업데이트됩니다.'
        }),
        ('시스템 정보', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def project_link(self, obj):
        """프로젝트 링크"""
        if obj.project:
            return format_html(
                '<a href="{}" style="color: #007bff; text-decoration: none;">{}</a>',
                f'/admin/projects/project/{obj.project.id}/change/',
                obj.project.title
            )
        return '-'
    project_link.short_description = '프로젝트'
    
    def type_badge(self, obj):
        """유형 뱃지"""
        if obj.type == 'criteria':
            return format_html(
                '<span style="background-color: #007bff; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">📋 기준</span>'
            )
        elif obj.type == 'alternative':
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">🎯 대안</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">❓ 미정</span>'
        )
    type_badge.short_description = '유형'
    
    def level_display(self, obj):
        """계층 표시"""
        level_icons = {1: '🥇', 2: '🥈', 3: '🥉'}
        icon = level_icons.get(obj.level, '📍')
        return f'{icon} Level {obj.level}'
    level_display.short_description = '계층'
    
    def parent_display(self, obj):
        """상위 기준 표시"""
        if obj.parent:
            return format_html(
                '<a href="{}" style="color: #007bff;">↗️ {}</a>',
                f'/admin/projects/criteria/{obj.parent.id}/change/',
                obj.parent.name
            )
        return '🏠 최상위'
    parent_display.short_description = '상위 기준'
    
    def order_display(self, obj):
        """순서 표시"""
        return f'#{obj.order}' if obj.order else '#0'
    order_display.short_description = '순서'
    
    def weight_display(self, obj):
        """가중치 표시"""
        if obj.weight and obj.weight > 0:
            return f'{obj.weight:.3f} ({obj.weight*100:.1f}%)'
        return '미계산'
    weight_display.short_description = '가중치'
    
    def active_badge(self, obj):
        """활성화 상태 뱃지"""
        if obj.is_active:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">✅ 활성</span>'
            )
        return format_html(
            '<span style="color: #dc3545; font-weight: bold;">❌ 비활성</span>'
        )
    active_badge.short_description = '상태'
    
    # 액션 추가
    actions = ['activate_criteria', 'deactivate_criteria', 'reset_weights']
    
    def activate_criteria(self, request, queryset):
        """선택된 기준 활성화"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated}개의 기준을 활성화했습니다.')
    activate_criteria.short_description = '선택된 기준 활성화'
    
    def deactivate_criteria(self, request, queryset):
        """선택된 기준 비활성화"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated}개의 기준을 비활성화했습니다.')
    deactivate_criteria.short_description = '선택된 기준 비활성화'
    
    def reset_weights(self, request, queryset):
        """선택된 기준의 가중치 초기화"""
        updated = queryset.update(weight=0.0)
        self.message_user(request, f'{updated}개의 기준 가중치를 초기화했습니다.')
    reset_weights.short_description = '선택된 기준 가중치 초기화'


@admin.register(ProjectTemplate)
class ProjectTemplateAdmin(admin.ModelAdmin):
    """Project Template admin"""
    list_display = ('name', 'category', 'created_by', 'is_public', 'usage_count', 'created_at')
    list_filter = ('category', 'is_public', 'created_at')
    search_fields = ('name', 'description', 'category')
    readonly_fields = ('usage_count', 'created_at')
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'category', 'created_by')
        }),
        ('Template Data', {
            'fields': ('structure', 'default_settings')
        }),
        ('Settings', {
            'fields': ('is_public', 'usage_count', 'created_at')
        }),
    )


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    """프로젝트 멤버 관리"""
    list_display = [
        'project_name', 'user_email', 'role_badge', 'joined_date',
        'permissions_display', 'is_active_badge'
    ]
    list_filter = ['role', 'joined_at', 'can_edit_structure', 'can_manage_evaluators']
    search_fields = ['project__title', 'user__email', 'user__username']
    ordering = ['-joined_at']
    
    fieldsets = (
        ('프로젝트 정보', {
            'fields': ('project', 'user', 'role')
        }),
        ('권한 설정', {
            'fields': (
                'can_edit_structure',
                'can_manage_evaluators', 
                'can_view_results',
                'can_export_results'
            )
        }),
        ('활동 정보', {
            'fields': ('joined_at', 'last_accessed', 'invited_by'),
            'classes': ('collapse',)
        }),
    )
    
    def project_name(self, obj):
        return format_html(
            '<a href="/admin/projects/project/{}/change/">{}</a>',
            obj.project.id, obj.project.title[:30]
        )
    project_name.short_description = '프로젝트'
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = '사용자'
    
    def role_badge(self, obj):
        colors = {
            'owner': '#dc3545',
            'admin': '#fd7e14',
            'evaluator': '#007bff',
            'viewer': '#6c757d'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            colors.get(obj.role, '#6c757d'), obj.get_role_display()
        )
    role_badge.short_description = '역할'
    
    def joined_date(self, obj):
        return obj.joined_at.strftime('%Y-%m-%d')
    joined_date.short_description = '참여일'
    
    def permissions_display(self, obj):
        perms = []
        if obj.can_edit_structure: perms.append('✏️')
        if obj.can_manage_evaluators: perms.append('👥')
        if obj.can_view_results: perms.append('📊')
        if obj.can_export_results: perms.append('💾')
        return ' '.join(perms) if perms else '❌'
    permissions_display.short_description = '권한'
    
    def is_active_badge(self, obj):
        if obj.last_accessed:
            days_ago = (timezone.now() - obj.last_accessed).days
            if days_ago < 7:
                return format_html('<span style="color: #28a745;">● 활성</span>')
            elif days_ago < 30:
                return format_html('<span style="color: #ffc107;">● 최근</span>')
        return format_html('<span style="color: #dc3545;">● 비활성</span>')
    is_active_badge.short_description = '활동'