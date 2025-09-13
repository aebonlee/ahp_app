"""
Analysis Models for AHP Platform
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid
import numpy as np

User = get_user_model()


class AnalysisResult(models.Model):
    """Analysis results for AHP projects"""
    
    TYPE_CHOICES = [
        ('individual', '개별 분석'),
        ('group', '그룹 분석'),
        ('sensitivity', '민감도 분석'),
        ('consensus', '합의도 분석'),
    ]
    
    STATUS_CHOICES = [
        ('processing', '처리중'),
        ('completed', '완료'),
        ('failed', '실패'),
    ]
    
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='analysis_results')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Analysis parameters
    parameters = models.JSONField(default=dict)
    
    # Results
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    results = models.JSONField(default=dict)
    summary = models.TextField(blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'analysis_results'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.project.title} - {self.get_type_display()}"
        
    def mark_completed(self):
        """Mark analysis as completed"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()


class WeightVector(models.Model):
    """Calculated weight vectors for criteria"""
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='weight_vectors')
    criteria = models.ForeignKey('projects.Criteria', on_delete=models.CASCADE, related_name='weight_vectors')
    evaluation = models.ForeignKey('evaluations.Evaluation', on_delete=models.CASCADE, null=True, blank=True)
    
    # Weight data
    weight = models.FloatField()
    normalized_weight = models.FloatField()
    rank = models.IntegerField()
    
    # Calculation method
    method = models.CharField(max_length=50, default='eigenvector')  # eigenvector, geometric_mean, etc.
    
    # Metadata
    calculated_at = models.DateTimeField(default=timezone.now)
    is_final = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'weight_vectors'
        ordering = ['rank']
        
    def __str__(self):
        return f"{self.criteria.name}: {self.weight:.4f}"


class ConsensusMetrics(models.Model):
    """Consensus analysis metrics for group evaluations"""
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='consensus_metrics')
    
    # Consensus measures
    kendall_w = models.FloatField(null=True, blank=True, help_text="Kendall's W coefficient")
    spearman_rho = models.FloatField(null=True, blank=True, help_text="Average Spearman's rho")
    consensus_index = models.FloatField(null=True, blank=True)
    
    # Group statistics
    total_evaluators = models.IntegerField()
    completed_evaluations = models.IntegerField()
    average_consistency = models.FloatField(null=True, blank=True)
    
    # Disagreement analysis
    high_disagreement_criteria = models.JSONField(default=list)
    outlier_evaluators = models.JSONField(default=list)
    
    # Results
    consensus_level = models.CharField(max_length=20, choices=[
        ('high', '높음'),
        ('medium', '보통'),
        ('low', '낮음'),
    ], null=True, blank=True)
    
    calculated_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'consensus_metrics'
        
    def __str__(self):
        return f"Consensus for {self.project.title}"


class SensitivityAnalysis(models.Model):
    """Sensitivity analysis for decision robustness"""
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='sensitivity_analyses')
    criteria = models.ForeignKey('projects.Criteria', on_delete=models.CASCADE)
    
    # Analysis parameters
    perturbation_range = models.FloatField(default=0.1)  # ±10% by default
    steps = models.IntegerField(default=20)
    
    # Results
    sensitivity_coefficient = models.FloatField()
    rank_reversals = models.JSONField(default=list)
    critical_values = models.JSONField(default=dict)
    
    # Visualization data
    chart_data = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'sensitivity_analyses'
        
    def __str__(self):
        return f"Sensitivity for {self.criteria.name} in {self.project.title}"


class ComparisonMatrix(models.Model):
    """Stored comparison matrices for analysis"""
    
    evaluation = models.ForeignKey('evaluations.Evaluation', on_delete=models.CASCADE, related_name='comparison_matrices')
    parent_criteria = models.ForeignKey('projects.Criteria', on_delete=models.CASCADE, null=True, blank=True)
    
    # Matrix data
    matrix_data = models.JSONField()  # Store as JSON array
    criteria_order = models.JSONField()  # Order of criteria in matrix
    
    # Matrix properties
    dimension = models.IntegerField()
    consistency_ratio = models.FloatField()
    eigenvalue_max = models.FloatField()
    
    # Derived weights
    priority_vector = models.JSONField()
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'comparison_matrices'
        
    def __str__(self):
        return f"Matrix for {self.evaluation} - {self.parent_criteria}"
        
    def calculate_priority_vector(self):
        """Calculate priority vector using eigenvector method"""
        matrix = np.array(self.matrix_data)
        
        # Calculate normalized weights
        eigenvalues, eigenvectors = np.linalg.eig(matrix)
        max_eigenvalue_index = np.argmax(eigenvalues.real)
        
        priority_vector = eigenvectors[:, max_eigenvalue_index].real
        priority_vector = priority_vector / np.sum(priority_vector)
        
        self.priority_vector = priority_vector.tolist()
        self.eigenvalue_max = eigenvalues[max_eigenvalue_index].real
        
        # Calculate consistency ratio
        n = len(matrix)
        ci = (self.eigenvalue_max - n) / (n - 1) if n > 1 else 0
        ri_values = {2: 0, 3: 0.52, 4: 0.89, 5: 1.11, 6: 1.25, 7: 1.35, 8: 1.40, 9: 1.45, 10: 1.49}
        ri = ri_values.get(n, 1.49)
        self.consistency_ratio = ci / ri if ri > 0 else 0
        
        self.save()
        return priority_vector


class ReportTemplate(models.Model):
    """Templates for generating analysis reports"""
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    # Template configuration
    template_type = models.CharField(max_length=50, choices=[
        ('executive_summary', '경영진 요약'),
        ('detailed_analysis', '상세 분석'),
        ('comparison_report', '비교 보고서'),
        ('sensitivity_report', '민감도 보고서'),
    ])
    
    template_content = models.JSONField()  # Template structure and formatting
    
    # Settings
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'report_templates'
        
    def __str__(self):
        return self.name