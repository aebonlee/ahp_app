from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class Criteria(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='criteria')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    weight = models.FloatField(default=1.0)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subcriteria')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.project.name} - {self.name}"


class Alternative(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='alternatives')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.project.name} - {self.name}"


class Comparison(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comparisons')
    criteria = models.ForeignKey(Criteria, on_delete=models.CASCADE, related_name='comparisons')
    left_item = models.CharField(max_length=100)
    right_item = models.CharField(max_length=100)
    value = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.left_item} vs {self.right_item}: {self.value}"