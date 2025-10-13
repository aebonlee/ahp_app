"""
안정화된 Simple Service Models - 2차 개발용
PostgreSQL과 완벽하게 호환되는 모델
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import json


def get_default_user():
    """기본 사용자 ID 반환 (시스템 사용자)"""
    return 1


class SimpleProject(models.Model):
    """
    AHP 프로젝트 모델 - 2차 개발 안정화 버전
    - created_by를 선택적으로 만들어 DB 제약 문제 해결
    - 모든 필드에 기본값 설정
    """
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
    
    # 필수 필드
    title = models.CharField(max_length=200)
    
    # 선택적 필드 (모두 기본값 있음)
    description = models.TextField(blank=True, default='')
    objective = models.TextField(blank=True, default='', help_text="프로젝트의 목적과 목표")
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='private', db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    is_public = models.BooleanField(default=False, db_index=True)
    
    # 사용자 관계 (선택적, 기본값 있음)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_DEFAULT,
        default=get_default_user,
        null=True,
        blank=True,
        related_name='created_projects'
    )
    
    # 타임스탬프
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        db_table = 'simple_projects'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['created_by', 'status']),
        ]
        
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """저장 전 기본값 처리"""
        if not self.created_by_id:
            self.created_by_id = 1  # 시스템 사용자
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


class SimpleCriteria(models.Model):
    """AHP 평가기준 모델 - 안정화 버전"""
    TYPE_CHOICES = [
        ('criteria', '평가기준'),
        ('alternative', '대안'),
    ]
    
    # 필수 필드
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='criteria', db_index=True)
    name = models.CharField(max_length=200, db_index=True)
    
    # 선택적 필드
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
        ]
        
    def __str__(self):
        return f"{self.project.title} - {self.name}"


class SimpleComparison(models.Model):
    """AHP 쌍대비교 모델 - 안정화 버전"""
    # 필수 필드
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='comparisons', db_index=True)
    criteria_a = models.ForeignKey(SimpleCriteria, on_delete=models.CASCADE, related_name='comparisons_as_a', db_index=True)
    criteria_b = models.ForeignKey(SimpleCriteria, on_delete=models.CASCADE, related_name='comparisons_as_b', db_index=True)
    
    # 선택적 필드
    value = models.FloatField(default=1.0, validators=[MinValueValidator(1/9), MaxValueValidator(9)], db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_DEFAULT,
        default=get_default_user,
        null=True,
        blank=True,
        db_index=True
    )
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    
    class Meta:
        db_table = 'simple_comparisons'
        unique_together = ['project', 'criteria_a', 'criteria_b']
        indexes = [
            models.Index(fields=['project', 'created_by']),
            models.Index(fields=['-created_at']),
        ]
        
    def __str__(self):
        return f"{self.criteria_a.name} vs {self.criteria_b.name}: {self.value}"
    
    def save(self, *args, **kwargs):
        """저장 전 기본값 처리"""
        if not self.created_by_id:
            self.created_by_id = 1  # 시스템 사용자
        super().save(*args, **kwargs)


class SimpleResult(models.Model):
    """AHP 결과 모델 - 안정화 버전"""
    # 필수 필드
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='results', db_index=True)
    criteria = models.ForeignKey(SimpleCriteria, on_delete=models.CASCADE, db_index=True)
    weight = models.FloatField(db_index=True)
    rank = models.IntegerField(db_index=True)
    
    # 선택적 필드
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_DEFAULT,
        default=get_default_user,
        null=True,
        blank=True,
        db_index=True
    )
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    
    class Meta:
        db_table = 'simple_results'
        ordering = ['rank']
        unique_together = ['project', 'criteria']
        indexes = [
            models.Index(fields=['project', 'rank']),
            models.Index(fields=['-created_at']),
        ]
        
    def __str__(self):
        return f"{self.criteria.name}: {self.weight:.4f} (#{self.rank})"
    
    def save(self, *args, **kwargs):
        """저장 전 기본값 처리"""
        if not self.created_by_id:
            self.created_by_id = 1  # 시스템 사용자
        super().save(*args, **kwargs)


class SimpleData(models.Model):
    """프로젝트 데이터 저장 모델 - 안정화 버전"""
    # 필수 필드
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='data', db_index=True)
    key = models.CharField(max_length=100, db_index=True)
    
    # 선택적 필드
    value = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'simple_data'
        unique_together = ['project', 'key']
        indexes = [
            models.Index(fields=['project', 'key']),
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