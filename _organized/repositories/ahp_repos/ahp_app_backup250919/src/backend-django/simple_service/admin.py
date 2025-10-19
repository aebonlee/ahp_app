"""
Simple Service Admin
"""
from django.contrib import admin
from .models import SimpleProject, SimpleData


@admin.register(SimpleProject)
class SimpleProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at')
    list_filter = ('created_at', 'created_by')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at',)


@admin.register(SimpleData)
class SimpleDataAdmin(admin.ModelAdmin):
    list_display = ('project', 'key', 'created_at')
    list_filter = ('created_at', 'project')
    search_fields = ('key', 'value')
    readonly_fields = ('created_at',)