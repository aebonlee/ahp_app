"""
Admin configuration for Project models
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Project, ProjectMember, Criteria, ProjectTemplate


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
    """Criteria admin"""
    list_display = ('name', 'project', 'type', 'parent', 'level', 'order', 'is_active')
    list_filter = ('type', 'level', 'is_active', 'project')
    search_fields = ('name', 'description', 'project__title')
    list_editable = ('order', 'is_active')
    
    fieldsets = (
        (None, {
            'fields': ('project', 'name', 'description', 'type')
        }),
        ('Hierarchy', {
            'fields': ('parent', 'order', 'level')
        }),
        ('Settings', {
            'fields': ('weight', 'is_active')
        }),
    )


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