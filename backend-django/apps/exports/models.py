"""
Export and Reporting Models
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class ExportTemplate(models.Model):
    """Export template configurations"""
    
    FORMAT_CHOICES = [
        ('excel', 'Excel'),
        ('pdf', 'PDF'),
        ('word', 'Word'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
    ]
    
    TEMPLATE_TYPE_CHOICES = [
        ('executive_summary', '경영진 요약'),
        ('detailed_analysis', '상세 분석'),
        ('comparison_report', '비교 보고서'),
        ('sensitivity_report', '민감도 보고서'),
        ('workshop_report', '워크샵 보고서'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    template_type = models.CharField(max_length=30, choices=TEMPLATE_TYPE_CHOICES)
    
    # Template configuration
    include_sections = models.JSONField(default=dict)
    styling_options = models.JSONField(default=dict)
    
    # Branding
    logo_url = models.URLField(blank=True)
    header_text = models.CharField(max_length=200, blank=True)
    footer_text = models.CharField(max_length=200, blank=True)
    
    # Settings
    is_default = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'export_templates'
        
    def __str__(self):
        return f"{self.name} ({self.format})"


class ExportHistory(models.Model):
    """Track export history"""
    
    STATUS_CHOICES = [
        ('pending', '대기중'),
        ('processing', '처리중'),
        ('completed', '완료'),
        ('failed', '실패'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Export details
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='exports')
    template = models.ForeignKey(ExportTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    format = models.CharField(max_length=10)
    
    # User info
    exported_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # File info
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500, blank=True)
    file_size = models.IntegerField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True)
    
    # Timing
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Download tracking
    download_count = models.IntegerField(default=0)
    last_downloaded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'export_history'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.file_name} - {self.exported_by.username}"


class ReportSchedule(models.Model):
    """Scheduled report generation"""
    
    FREQUENCY_CHOICES = [
        ('once', '한번'),
        ('daily', '매일'),
        ('weekly', '매주'),
        ('monthly', '매월'),
    ]
    
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='report_schedules')
    template = models.ForeignKey(ExportTemplate, on_delete=models.CASCADE)
    
    # Schedule settings
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)
    next_run = models.DateTimeField()
    last_run = models.DateTimeField(null=True, blank=True)
    
    # Recipients
    recipients = models.JSONField(default=list)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'report_schedules'
        
    def __str__(self):
        return f"{self.project.title} - {self.frequency}"