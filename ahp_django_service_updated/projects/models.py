from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Project(models.Model):
    STATUS_CHOICES = [
        ('setup', '프로젝트 설정'),
        ('model_building', '모델 구축'),
        ('evaluator_assignment', '평가자 할당'),
        ('evaluation_in_progress', '평가 진행 중'),
        ('evaluation_complete', '평가 완료'),
        ('results_available', '결과 제공'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    objective = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='setup')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ahp_projects'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Criteria(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='criteria')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    level = models.IntegerField(default=1)
    order_index = models.IntegerField(default=0)
    weight = models.FloatField(default=0.0)  # Global weight
    local_weight = models.FloatField(default=0.0)  # Local weight within parent
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ahp_criteria'
        ordering = ['level', 'order_index']
        verbose_name_plural = 'Criteria'
    
    def __str__(self):
        return f"{self.project.title} - {self.name}"


class Alternative(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='alternatives')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order_index = models.IntegerField(default=0)
    final_score = models.FloatField(default=0.0)
    rank = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ahp_alternatives'
        ordering = ['order_index']
    
    def __str__(self):
        return f"{self.project.title} - {self.name}"


class Evaluator(models.Model):
    ROLE_CHOICES = [
        ('admin', '관리자'),
        ('evaluator', '평가자'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='evaluators')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='evaluations')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='evaluator')
    access_key = models.CharField(max_length=50, unique=True)
    is_invited = models.BooleanField(default=False)
    invitation_sent_at = models.DateTimeField(null=True, blank=True)
    evaluation_started_at = models.DateTimeField(null=True, blank=True)
    evaluation_completed_at = models.DateTimeField(null=True, blank=True)
    progress_percentage = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ahp_evaluators'
        unique_together = ['project', 'email']
    
    def __str__(self):
        return f"{self.name} ({self.project.title})"


class Comparison(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comparisons')
    evaluator = models.ForeignKey(Evaluator, on_delete=models.CASCADE, related_name='comparisons')
    criteria = models.ForeignKey(Criteria, on_delete=models.CASCADE, related_name='comparisons')
    left_item_id = models.CharField(max_length=50)
    right_item_id = models.CharField(max_length=50)
    left_item_name = models.CharField(max_length=200)
    right_item_name = models.CharField(max_length=200)
    value = models.FloatField(validators=[MinValueValidator(1/9), MaxValueValidator(9)])
    is_criteria_comparison = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ahp_comparisons'
        unique_together = ['project', 'evaluator', 'criteria', 'left_item_id', 'right_item_id']
    
    def __str__(self):
        return f"{self.left_item_name} vs {self.right_item_name}: {self.value}"


class ComparisonMatrix(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='matrices')
    evaluator = models.ForeignKey(Evaluator, on_delete=models.CASCADE, related_name='matrices')
    criteria = models.ForeignKey(Criteria, on_delete=models.CASCADE, null=True, blank=True, related_name='matrices')
    matrix_type = models.CharField(max_length=20)  # 'criteria' or 'alternatives'
    matrix_data = models.JSONField()
    consistency_ratio = models.FloatField(default=0.0)
    is_consistent = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ahp_comparison_matrices'
    
    def __str__(self):
        return f"{self.evaluator.name} - {self.matrix_type}"


class Result(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='results')
    evaluator = models.ForeignKey(Evaluator, on_delete=models.CASCADE, null=True, blank=True, related_name='results')
    alternative = models.ForeignKey(Alternative, on_delete=models.CASCADE, related_name='results')
    score = models.FloatField(default=0.0)
    rank = models.IntegerField(default=0)
    is_group_result = models.BooleanField(default=False)
    criteria_scores = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ahp_results'
        ordering = ['-score']
    
    def __str__(self):
        eval_name = self.evaluator.name if self.evaluator else "그룹"
        return f"{self.project.title} - {eval_name} - {self.alternative.name}: {self.score:.4f}"


class SensitivityAnalysis(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='sensitivity_analyses')
    criteria = models.ForeignKey(Criteria, on_delete=models.CASCADE, related_name='sensitivity_analyses')
    original_weight = models.FloatField()
    modified_weight = models.FloatField()
    results_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ahp_sensitivity_analyses'
    
    def __str__(self):
        return f"{self.project.title} - {self.criteria.name}"