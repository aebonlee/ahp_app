"""
수정된 Simple Service Models - PostgreSQL 호환성 개선
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import json


class SimpleProject(models.Model):
    """AHP 프로젝트 모델 - PostgreSQL 최적화"""
    STATUS_CHOICES = [
        ('draft', '초안'),
        ('active', '진행중'),
        ('completed', '완료'),
        ('archived', '보관됨'),
    ]
    
    VISIBILITY_CHOICES = [
        ('private', '비공개'),
        ('team', '팀 공개'),
        ('public', '전체 공개'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    objective = models.TextField(blank=True, default='', help_text="프로젝트의 목적과 목표")
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='private', db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    
    # PostgreSQL 호환성을 위해 NULL 허용 및 기본값 설정
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL,  # CASCADE 대신 SET_NULL 사용
        null=True,  # NULL 허용
        blank=True,
        default=1,  # 기본값을 시스템 사용자(ID=1)로 설정
        related_name='projects'
    )
    
    is_public = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        db_table = 'simple_projects'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_by', 'status']),
            models.Index(fields=['title', 'status']),
            models.Index(fields=['-created_at', 'status']),
        ]
        
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """저장시 created_by가 없으면 시스템 사용자로 설정"""
        if not self.created_by_id:
            User = get_user_model()
            system_user, created = User.objects.get_or_create(
                id=1,
                defaults={
                    'username': 'system',
                    'email': 'system@ahp.com',
                    'first_name': 'System',
                    'last_name': 'User',
                    'is_staff': True,
                    'is_active': True
                }
            )
            self.created_by = system_user
        super().save(*args, **kwargs)
    
    @property
    def criteria_count(self):
        return self.criteria.count()
    
    @property
    def completion_rate(self):
        """프로젝트 완성도 계산"""
        total_criteria = self.criteria.count()
        if total_criteria == 0:
            return 0
        completed_comparisons = self.comparisons.count()
        max_comparisons = total_criteria * (total_criteria - 1) // 2
        return min(100, (completed_comparisons / max(max_comparisons, 1)) * 100)


# 나머지 모델들은 동일하게 유지...
class SimpleCriteria(models.Model):
    """AHP 평가기준 모델 - 성능 최적화"""
    TYPE_CHOICES = [
        ('criteria', '평가기준'),
        ('alternative', '대안'),
    ]
    
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='criteria', db_index=True)
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True, default='')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='criteria', db_index=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', db_index=True)
    order = models.PositiveIntegerField(default=0, db_index=True)
    weight = models.FloatField(default=0.0)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'simple_criteria'
        ordering = ['order']
        unique_together = ['project', 'name']
        indexes = [
            models.Index(fields=['project', 'type', 'order']),
            models.Index(fields=['parent', 'order']),
            models.Index(fields=['weight']),
        ]
        
    def __str__(self):
        return f"{self.project.title} - {self.name}"


class SimpleComparison(models.Model):
    """AHP 쌍대비교 모델 - 성능 최적화"""
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='comparisons', db_index=True)
    criteria_a = models.ForeignKey(SimpleCriteria, on_delete=models.CASCADE, related_name='comparisons_as_a', db_index=True)
    criteria_b = models.ForeignKey(SimpleCriteria, on_delete=models.CASCADE, related_name='comparisons_as_b', db_index=True)
    value = models.FloatField(default=1.0, validators=[MinValueValidator(1/9), MaxValueValidator(9)], db_index=True)
    
    # created_by도 NULL 허용으로 변경
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        default=1,
        db_index=True
    )
    
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    
    class Meta:
        db_table = 'simple_comparisons'
        unique_together = ['project', 'criteria_a', 'criteria_b']
        indexes = [
            models.Index(fields=['project', 'created_by']),
            models.Index(fields=['criteria_a', 'criteria_b']),
            models.Index(fields=['-created_at']),
        ]
        
    def __str__(self):
        return f"{self.criteria_a.name} vs {self.criteria_b.name}: {self.value}"


class SimpleResult(models.Model):
    """AHP 결과 모델 - 성능 최적화"""
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='results', db_index=True)
    criteria = models.ForeignKey(SimpleCriteria, on_delete=models.CASCADE, db_index=True)
    weight = models.FloatField(db_index=True)
    rank = models.IntegerField(db_index=True)
    
    # created_by도 NULL 허용으로 변경
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        default=1,
        db_index=True
    )
    
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    
    class Meta:
        db_table = 'simple_results'
        ordering = ['rank']
        unique_together = ['project', 'criteria']
        indexes = [
            models.Index(fields=['project', 'rank']),
            models.Index(fields=['weight', 'rank']),
            models.Index(fields=['-created_at']),
        ]
        
    def __str__(self):
        return f"{self.criteria.name}: {self.weight:.4f} (#{self.rank})"


class SimpleData(models.Model):
    """프로젝트 데이터 저장 모델 - 성능 최적화"""
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='data', db_index=True)
    key = models.CharField(max_length=100, db_index=True)
    value = models.TextField()
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'simple_data'
        unique_together = ['project', 'key']
        indexes = [
            models.Index(fields=['project', 'key']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['-updated_at']),
        ]
        
    def __str__(self):
        return f"{self.project.title} - {self.key}"
    
    def get_json_value(self):
        """값을 JSON으로 파싱"""
        try:
            return json.loads(self.value)
        except (json.JSONDecodeError, TypeError):
            return self.value
    
    def set_json_value(self, data):
        """데이터를 JSON으로 저장"""
        try:
            self.value = json.dumps(data, ensure_ascii=False)
        except (TypeError, ValueError):
            self.value = str(data)