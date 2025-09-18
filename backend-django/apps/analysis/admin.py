"""
Admin configuration for Analysis models
"""
from django.contrib import admin
from .models import AnalysisResult, WeightVector, ConsensusMetrics

@admin.register(AnalysisResult)
class AnalysisResultAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'type', 'status', 'created_by', 'created_at')
    list_filter = ('type', 'status', 'created_at')
    search_fields = ('title', 'description', 'project__title')

@admin.register(WeightVector)
class WeightVectorAdmin(admin.ModelAdmin):
    list_display = ('criteria', 'project', 'weight', 'rank', 'method')
    list_filter = ('method', 'is_final')
    search_fields = ('criteria__name', 'project__title')

@admin.register(ConsensusMetrics)
class ConsensusMetricsAdmin(admin.ModelAdmin):
    list_display = ('project', 'consensus_level', 'total_evaluators', 'calculated_at')
    list_filter = ('consensus_level', 'calculated_at')
    search_fields = ('project__title',)