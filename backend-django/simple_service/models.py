"""
Simple Service Models - 완전한 AHP 기능
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import json


class SimpleProject(models.Model):
    """간단한 프로젝트 모델"""
    STATUS_CHOICES = [
        ('draft', '초안'),
        ('active', '진행중'),
        ('completed', '완료'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'simple_projects'
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title


class SimpleCriteria(models.Model):
    """간단한 AHP 평가기준"""
    TYPE_CHOICES = [
        ('criteria', '평가기준'),
        ('alternative', '대안'),
    ]
    
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='criteria')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='criteria')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    order = models.PositiveIntegerField(default=0)
    weight = models.FloatField(default=0.0)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'simple_criteria'
        ordering = ['order']
        unique_together = ['project', 'name']
        
    def __str__(self):
        return f"{self.project.title} - {self.name}"


class SimpleComparison(models.Model):
    """간단한 쌍대비교"""
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='comparisons')
    criteria_a = models.ForeignKey(SimpleCriteria, on_delete=models.CASCADE, related_name='comparisons_as_a')
    criteria_b = models.ForeignKey(SimpleCriteria, on_delete=models.CASCADE, related_name='comparisons_as_b')
    value = models.FloatField(default=1.0, validators=[MinValueValidator(1/9), MaxValueValidator(9)])
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'simple_comparisons'
        unique_together = ['project', 'criteria_a', 'criteria_b']
        
    def __str__(self):
        return f"{self.criteria_a.name} vs {self.criteria_b.name}: {self.value}"


class SimpleResult(models.Model):
    """간단한 AHP 결과"""
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='results')
    criteria = models.ForeignKey(SimpleCriteria, on_delete=models.CASCADE)
    weight = models.FloatField()
    rank = models.IntegerField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'simple_results'
        ordering = ['rank']
        unique_together = ['project', 'criteria']
        
    def __str__(self):
        return f"{self.criteria.name}: {self.weight:.4f} (#{self.rank})"


class SimpleData(models.Model):
    """간단한 데이터 저장"""
    project = models.ForeignKey(SimpleProject, on_delete=models.CASCADE, related_name='data')
    key = models.CharField(max_length=100)
    value = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'simple_data'
        unique_together = ['project', 'key']
        
    def __str__(self):
        return f"{self.project.title} - {self.key}"
    
    def get_json_value(self):
        """값을 JSON으로 파싱"""
        try:
            return json.loads(self.value)
        except:
            return self.value