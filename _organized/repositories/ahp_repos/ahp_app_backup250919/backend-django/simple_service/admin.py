"""
Simple Service Admin
"""
from django.contrib import admin
from .models import SimpleProject, SimpleData


@admin.register(SimpleProject)
class SimpleProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by')
    list_filter = ('created_by',)
    search_fields = ('title', 'description')
    readonly_fields = ()


@admin.register(SimpleData)
class SimpleDataAdmin(admin.ModelAdmin):
    list_display = ('project', 'key')
    list_filter = ('project',)
    search_fields = ('key', 'value')
    readonly_fields = ()