"""
Enhanced Project Admin configuration with comprehensive management features
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Count, Q
from .models import Project, ProjectMember, Criteria, ProjectTemplate


class CriteriaInline(admin.TabularInline):
    """Enhanced Criteria inline with better display"""
    model = Criteria
    extra = 0
    fields = ('name', 'type', 'parent', 'order', 'level', 'weight', 'is_active')
    readonly_fields = ('weight',)
    ordering = ['level', 'order']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('parent')


class ProjectMemberInline(admin.TabularInline):
    """Enhanced Project Member inline"""
    model = ProjectMember
    extra = 0
    fields = ('user', 'role', 'can_edit_structure', 'can_manage_evaluators', 'can_view_results', 'joined_at')
    readonly_fields = ('joined_at',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """Enhanced Project admin with comprehensive features"""
    inlines = [ProjectMemberInline, CriteriaInline]
    
    list_display = (
        'title', 'owner', 'status_badge', 'visibility_badge', 'member_count', 
        'criteria_count', 'progress_info', 'created_at'
    )
    list_filter = ('status', 'visibility', 'created_at', 'deadline')
    search_fields = ('title', 'description', 'objective', 'owner__username', 'owner__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'member_count_display', 'criteria_summary')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'title', 'description', 'objective', 'owner')
        }),
        ('프로젝트 설정', {
            'fields': ('status', 'visibility', 'consistency_ratio_threshold', 'deadline')
        }),
        ('통계 정보', {
            'fields': ('member_count_display', 'criteria_summary'),
            'classes': ('collapse',)
        }),
        ('메타데이터', {
            'fields': ('tags', 'settings'),
            'classes': ('collapse',)
        }),
        ('타임스탬프', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_active', 'mark_as_completed', 'archive_projects', 'clone_projects']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('owner').prefetch_related('collaborators', 'criteria')
    
    def status_badge(self, obj):
        """Status badge with colors"""
        colors = {
            'draft': '#6c757d',
            'active': '#17a2b8',
            'evaluation': '#ffc107',
            'completed': '#28a745',
            'archived': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
    
    def visibility_badge(self, obj):
        """Visibility badge"""
        colors = {
            'private': '#dc3545',
            'team': '#ffc107', 
            'public': '#28a745'
        }
        icons = {
            'private': '🔒',
            'team': '👥',
            'public': '🌐'
        }
        color = colors.get(obj.visibility, '#6c757d')
        icon = icons.get(obj.visibility, '📄')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{} {}</span>',
            color, icon, obj.get_visibility_display()
        )
    visibility_badge.short_description = 'Visibility'
    visibility_badge.admin_order_field = 'visibility'
    
    def member_count(self, obj):
        """Member count"""
        count = obj.collaborators.count()
        return f"{count + 1}명"  # +1 for owner
    member_count.short_description = 'Members'
    
    def criteria_count(self, obj):
        """Criteria count with breakdown"""
        criteria_qs = obj.criteria.all()
        total = criteria_qs.count()
        criteria = criteria_qs.filter(type='criteria').count()
        alternatives = criteria_qs.filter(type='alternative').count()
        
        if total == 0:
            return "미설정"
        return f"{total}개 (기준:{criteria}, 대안:{alternatives})"
    criteria_count.short_description = 'Criteria'
    
    def progress_info(self, obj):
        """Project progress information"""
        if obj.deadline:
            days_left = (obj.deadline.date() - timezone.now().date()).days
            if days_left < 0:
                return format_html('<span style="color: #dc3545;">⚠️ {}일 지연</span>', abs(days_left))
            elif days_left <= 7:
                return format_html('<span style="color: #ffc107;">⏰ {}일 남음</span>', days_left)
            else:
                return format_html('<span style="color: #28a745;">📅 {}일 남음</span>', days_left)
        return "기한 미설정"
    progress_info.short_description = 'Progress'
    
    def member_count_display(self, obj):
        """Detailed member count"""
        members = obj.projectmember_set.all()
        roles = {}
        for member in members:
            role = member.get_role_display()
            roles[role] = roles.get(role, 0) + 1
        
        role_str = ', '.join([f"{role}: {count}명" for role, count in roles.items()])
        return f"총 {len(members) + 1}명 (소유자 포함) - {role_str}"
    member_count_display.short_description = 'Member Details'
    
    def criteria_summary(self, obj):
        """Detailed criteria summary"""
        criteria_qs = obj.criteria.all()
        if not criteria_qs.exists():
            return "평가 기준이 설정되지 않음"
        
        by_level = {}
        for criterion in criteria_qs:
            level = criterion.level
            by_level[level] = by_level.get(level, 0) + 1
        
        level_str = ', '.join([f"Level {level}: {count}개" for level, count in sorted(by_level.items())])
        return f"총 {criteria_qs.count()}개 기준 - {level_str}"
    criteria_summary.short_description = 'Criteria Summary'
    
    # Actions
    def mark_as_active(self, request, queryset):
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated}개 프로젝트가 활성 상태로 변경되었습니다.')
    mark_as_active.short_description = '활성 상태로 변경'
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated}개 프로젝트가 완료 상태로 변경되었습니다.')
    mark_as_completed.short_description = '완료 상태로 변경'
    
    def archive_projects(self, request, queryset):
        updated = queryset.update(status='archived')
        self.message_user(request, f'{updated}개 프로젝트가 보관되었습니다.')
    archive_projects.short_description = '프로젝트 보관'


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    """Project Member Admin"""
    list_display = ('user', 'project', 'role_badge', 'permissions_summary', 'joined_at', 'invited_by')
    list_filter = ('role', 'can_edit_structure', 'can_manage_evaluators', 'joined_at')
    search_fields = ('user__username', 'user__email', 'project__title')
    readonly_fields = ('joined_at',)
    
    fieldsets = (
        ('멤버십 정보', {
            'fields': ('project', 'user', 'role', 'invited_by')
        }),
        ('권한 설정', {
            'fields': ('can_edit_structure', 'can_manage_evaluators', 'can_view_results')
        }),
        ('메타데이터', {
            'fields': ('joined_at',),
            'classes': ('collapse',)
        })
    )
    
    def role_badge(self, obj):
        """Role badge with colors"""
        colors = {
            'owner': '#dc3545',
            'manager': '#fd7e14',
            'evaluator': '#198754',
            'viewer': '#6c757d'
        }
        color = colors.get(obj.role, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            color, obj.get_role_display()
        )
    role_badge.short_description = 'Role'
    role_badge.admin_order_field = 'role'
    
    def permissions_summary(self, obj):
        """Permission summary"""
        perms = []
        if obj.can_edit_structure:
            perms.append('구조편집')
        if obj.can_manage_evaluators:
            perms.append('평가자관리')
        if obj.can_view_results:
            perms.append('결과조회')
        
        if perms:
            return format_html('<span style="color: #198754;">✓ {}</span>', ', '.join(perms))
        return format_html('<span style="color: #dc3545;">권한 없음</span>')
    permissions_summary.short_description = 'Permissions'


@admin.register(Criteria)
class CriteriaAdmin(admin.ModelAdmin):
    """Enhanced Criteria admin"""
    list_display = ('name', 'project', 'type_badge', 'hierarchy_path', 'level', 'order', 'weight_display', 'is_active')
    list_filter = ('type', 'level', 'is_active', 'project__status')
    search_fields = ('name', 'description', 'project__title')
    list_editable = ('order', 'is_active')
    readonly_fields = ('created_at', 'updated_at', 'full_path')
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('project', 'name', 'description', 'type')
        }),
        ('계층 구조', {
            'fields': ('parent', 'level', 'order', 'full_path')
        }),
        ('가중치 및 설정', {
            'fields': ('weight', 'is_active')
        }),
        ('타임스탬프', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('project', 'parent')
    
    def type_badge(self, obj):
        """Type badge"""
        colors = {
            'criteria': '#0d6efd',
            'alternative': '#198754'
        }
        color = colors.get(obj.type, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
            color, obj.get_type_display()
        )
    type_badge.short_description = 'Type'
    type_badge.admin_order_field = 'type'
    
    def hierarchy_path(self, obj):
        """Show hierarchy path"""
        path = obj.full_path
        if len(path) > 50:
            return f"...{path[-47:]}"
        return path
    hierarchy_path.short_description = 'Path'
    
    def weight_display(self, obj):
        """Weight with percentage"""
        if obj.weight > 0:
            return f"{obj.weight:.3f} ({obj.weight*100:.1f}%)"
        return "미설정"
    weight_display.short_description = 'Weight'
    weight_display.admin_order_field = 'weight'


@admin.register(ProjectTemplate)
class ProjectTemplateAdmin(admin.ModelAdmin):
    """Enhanced Project Template admin"""
    list_display = ('name', 'category', 'created_by', 'is_public_badge', 'usage_count', 'created_at')
    list_filter = ('category', 'is_public', 'created_at')
    search_fields = ('name', 'description', 'category')
    readonly_fields = ('usage_count', 'created_at', 'structure_preview')
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'description', 'category', 'created_by')
        }),
        ('템플릿 데이터', {
            'fields': ('structure_preview', 'structure', 'default_settings'),
            'classes': ('collapse',)
        }),
        ('설정', {
            'fields': ('is_public', 'usage_count', 'created_at')
        }),
    )
    
    def is_public_badge(self, obj):
        """Public status badge"""
        if obj.is_public:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 2px 6px; border-radius: 3px;">공개</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 2px 6px; border-radius: 3px;">비공개</span>'
        )
    is_public_badge.short_description = 'Public'
    is_public_badge.admin_order_field = 'is_public'
    
    def structure_preview(self, obj):
        """Structure preview"""
        if obj.structure:
            import json
            try:
                structure_str = json.dumps(obj.structure, indent=2, ensure_ascii=False)
                if len(structure_str) > 500:
                    structure_str = structure_str[:497] + "..."
                return format_html('<pre>{}</pre>', structure_str)
            except:
                return "Invalid JSON structure"
        return "No structure defined"
    structure_preview.short_description = 'Structure Preview'