"""
Admin configuration for Project models
"""
from django.contrib import admin
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
    """Project admin"""
    inlines = [ProjectMemberInline, CriteriaInline]
    
    list_display = (
        'title', 'owner', 'status', 'visibility', 'created_at', 'updated_at'
    )
    list_filter = ('status', 'visibility', 'created_at')
    search_fields = ('title', 'description', 'owner__username')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'objective', 'owner')
        }),
        ('Settings', {
            'fields': ('status', 'visibility', 'consistency_ratio_threshold', 'deadline')
        }),
        ('Metadata', {
            'fields': ('tags', 'settings'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


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