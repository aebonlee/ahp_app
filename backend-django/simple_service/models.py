"""
Simple Service Models - 최소한의 AHP 기능
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class SimpleProject(models.Model):
    """간단한 프로젝트 모델"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'simple_projects'
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title


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