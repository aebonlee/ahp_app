from django.contrib import admin
from .models import (
    Project, Criteria, Alternative, Evaluator,
    Comparison, ComparisonMatrix, Result, SensitivityAnalysis
)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description']


@admin.register(Criteria)
class CriteriaAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'level', 'weight', 'order_index']
    list_filter = ['level', 'project']
    search_fields = ['name', 'description']


@admin.register(Alternative)
class AlternativeAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'final_score', 'rank', 'order_index']
    list_filter = ['project']
    search_fields = ['name', 'description']


@admin.register(Evaluator)
class EvaluatorAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'project', 'role', 'progress_percentage', 'is_invited']
    list_filter = ['role', 'is_invited', 'project']
    search_fields = ['name', 'email']


@admin.register(Comparison)
class ComparisonAdmin(admin.ModelAdmin):
    list_display = ['project', 'evaluator', 'left_item_name', 'right_item_name', 'value']
    list_filter = ['project', 'evaluator', 'is_criteria_comparison']
    search_fields = ['left_item_name', 'right_item_name']


@admin.register(ComparisonMatrix)
class ComparisonMatrixAdmin(admin.ModelAdmin):
    list_display = ['project', 'evaluator', 'matrix_type', 'consistency_ratio', 'is_consistent']
    list_filter = ['project', 'evaluator', 'matrix_type', 'is_consistent']


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ['project', 'alternative', 'evaluator', 'score', 'rank', 'is_group_result']
    list_filter = ['project', 'is_group_result']
    search_fields = ['alternative__name']


@admin.register(SensitivityAnalysis)
class SensitivityAnalysisAdmin(admin.ModelAdmin):
    list_display = ['project', 'criteria', 'original_weight', 'modified_weight']
    list_filter = ['project']
    search_fields = ['criteria__name']