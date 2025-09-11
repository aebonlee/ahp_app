"""
Admin configuration for Evaluation models
"""
from django.contrib import admin
from .models import (
    Evaluation, PairwiseComparison, EvaluationSession, 
    EvaluationInvitation
)


class PairwiseComparisonInline(admin.TabularInline):
    model = PairwiseComparison
    extra = 0
    fields = ('criteria_a', 'criteria_b', 'value', 'confidence', 'answered_at')
    readonly_fields = ('answered_at',)


class EvaluationSessionInline(admin.TabularInline):
    model = EvaluationSession
    extra = 0
    fields = ('started_at', 'ended_at', 'duration', 'ip_address')
    readonly_fields = ('started_at', 'ended_at', 'duration')


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    """Evaluation admin"""
    inlines = [PairwiseComparisonInline, EvaluationSessionInline]
    
    list_display = (
        'project', 'evaluator', 'status', 'progress', 'consistency_ratio', 
        'is_consistent', 'created_at'
    )
    list_filter = ('status', 'is_consistent', 'created_at', 'project')
    search_fields = ('project__title', 'evaluator__username', 'title')
    readonly_fields = ('created_at', 'updated_at', 'consistency_ratio', 'is_consistent')
    
    fieldsets = (
        (None, {
            'fields': ('project', 'evaluator', 'title', 'instructions')
        }),
        ('Progress', {
            'fields': ('status', 'progress', 'started_at', 'completed_at', 'expires_at')
        }),
        ('Results', {
            'fields': ('consistency_ratio', 'is_consistent')
        }),
        ('Metadata', {
            'fields': ('metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PairwiseComparison)
class PairwiseComparisonAdmin(admin.ModelAdmin):
    """Pairwise Comparison admin"""
    list_display = ('evaluation', 'criteria_a', 'criteria_b', 'value', 'confidence', 'answered_at')
    list_filter = ('confidence', 'answered_at', 'evaluation__project')
    search_fields = ('evaluation__project__title', 'criteria_a__name', 'criteria_b__name')
    readonly_fields = ('answered_at',)


@admin.register(EvaluationInvitation)
class EvaluationInvitationAdmin(admin.ModelAdmin):
    """Evaluation Invitation admin"""
    list_display = (
        'project', 'evaluator', 'invited_by', 'status', 'sent_at', 'responded_at'
    )
    list_filter = ('status', 'sent_at', 'project')
    search_fields = ('project__title', 'evaluator__username', 'invited_by__username')
    readonly_fields = ('token', 'sent_at', 'responded_at')
    
    fieldsets = (
        (None, {
            'fields': ('project', 'evaluator', 'invited_by', 'message')
        }),
        ('Status', {
            'fields': ('status', 'sent_at', 'responded_at', 'expires_at')
        }),
        ('Security', {
            'fields': ('token',),
            'classes': ('collapse',)
        }),
    )


@admin.register(EvaluationSession)
class EvaluationSessionAdmin(admin.ModelAdmin):
    """Evaluation Session admin"""
    list_display = ('evaluation', 'started_at', 'ended_at', 'duration', 'ip_address')
    list_filter = ('started_at', 'ended_at')
    search_fields = ('evaluation__project__title', 'evaluation__evaluator__username')
    readonly_fields = ('started_at', 'ended_at', 'duration')