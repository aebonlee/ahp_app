"""
User Account Models for AHP Platform
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Extended User model with additional AHP platform specific fields"""
    
    # Profile fields
    full_name = models.CharField(max_length=100, blank=True)
    organization = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # System fields
    is_evaluator = models.BooleanField(default=False)
    is_project_manager = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    
    # Settings
    language = models.CharField(max_length=10, default='ko', choices=[
        ('ko', '한국어'),
        ('en', 'English'),
    ])
    timezone = models.CharField(max_length=50, default='Asia/Seoul')
    
    class Meta:
        app_label = 'accounts'
        db_table = 'users'
        
    def __str__(self):
        return f"{self.username} ({self.full_name})"
        
    def update_last_activity(self):
        """Update user's last activity timestamp"""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])


class UserProfile(models.Model):
    """Additional profile information for users"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    
    # Research fields
    expertise_areas = models.JSONField(default=list, blank=True)
    research_interests = models.TextField(blank=True)
    publications = models.TextField(blank=True)
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    project_updates = models.BooleanField(default=True)
    evaluation_reminders = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        app_label = 'accounts'
        db_table = 'user_profiles'
        
    def __str__(self):
        return f"Profile of {self.user.username}"