"""
Project Models for AHP Platform
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

User = get_user_model()


class Project(models.Model):
    """AHP Project model"""
    
    STATUS_CHOICES = [
        ('draft', '초안'),
        ('active', '진행중'),
        ('evaluation', '평가중'),
        ('completed', '완료'),
        ('archived', '보관'),
        ('deleted', '삭제됨'),
    ]
    
    EVALUATION_MODE_CHOICES = [
        ('practical', '실용적'),
        ('theoretical', '이론적'),
        ('direct_input', '직접입력'),
        ('fuzzy_ahp', '퍼지 AHP'),
    ]
    
    WORKFLOW_STAGE_CHOICES = [
        ('creating', '생성중'),
        ('waiting', '대기중'),
        ('evaluating', '평가중'),
        ('completed', '완료'),
    ]
    
    VISIBILITY_CHOICES = [
        ('private', '비공개'),
        ('team', '팀 공개'),
        ('public', '공개'),
    ]
    
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    objective = models.TextField(help_text="프로젝트의 목적과 목표")
    
    # Owner and collaborators
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects', null=True, blank=True)
    collaborators = models.ManyToManyField(User, through='ProjectMember', through_fields=('project', 'user'), related_name='collaborated_projects')
    
    # Status and settings
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='private')
    evaluation_mode = models.CharField(max_length=20, choices=EVALUATION_MODE_CHOICES, default='practical')
    workflow_stage = models.CharField(max_length=20, choices=WORKFLOW_STAGE_CHOICES, default='creating')
    
    # AHP specific settings
    consistency_ratio_threshold = models.FloatField(default=0.1, validators=[
        MinValueValidator(0.0), MaxValueValidator(1.0)
    ])
    
    # Dates
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    
    # Counts for frontend
    criteria_count = models.PositiveIntegerField(default=0)
    alternatives_count = models.PositiveIntegerField(default=0)
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    
    class Meta:
        app_label = 'projects'
        db_table = 'ahp_projects'
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title
        
    @property
    def is_active(self):
        return self.status in ['active', 'evaluation']
        
    def get_absolute_url(self):
        return f"/projects/{self.id}/"


class ProjectMember(models.Model):
    """Project membership with roles"""
    
    ROLE_CHOICES = [
        ('owner', '소유자'),
        ('manager', '관리자'),
        ('evaluator', '평가자'),
        ('viewer', '뷰어'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    # Permissions
    can_edit_structure = models.BooleanField(default=False)
    can_manage_evaluators = models.BooleanField(default=False)
    can_view_results = models.BooleanField(default=True)
    
    # Dates
    joined_at = models.DateTimeField(default=timezone.now)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='invited_members')
    
    class Meta:
        app_label = 'projects'
        db_table = 'project_members'
        unique_together = ['project', 'user']
        
    def __str__(self):
        return f"{self.user.username} - {self.project.title} ({self.role})"


class Criteria(models.Model):
    """AHP Criteria/Alternative model with hierarchical structure"""
    
    TYPE_CHOICES = [
        ('criteria', '평가기준'),
        ('alternative', '대안'),
    ]
    
    # Basic information
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='criteria')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Hierarchical structure
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    order = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=0)
    
    # Metadata
    weight = models.FloatField(default=0.0)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        app_label = 'projects'
        db_table = 'criteria'
        ordering = ['level', 'order']
        unique_together = ['project', 'name']
        
    def __str__(self):
        return f"{self.project.title} - {self.name}"
        
    @property
    def full_path(self):
        """Get full hierarchical path"""
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name


class ProjectTemplate(models.Model):
    """Predefined project templates"""
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    
    # Template data
    structure = models.JSONField(help_text="Template structure data")
    default_settings = models.JSONField(default=dict)
    
    # Meta
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_public = models.BooleanField(default=False)
    usage_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        app_label = 'projects'
        db_table = 'project_templates'
        
    def __str__(self):
        return self.name