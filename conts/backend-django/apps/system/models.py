"""
System Management Models for AHP Platform
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

# Use settings.AUTH_USER_MODEL for foreign key references


class SystemSettings(models.Model):
    """Global system settings"""
    
    SETTING_TYPES = [
        ('string', 'String'),
        ('integer', 'Integer'),
        ('float', 'Float'),
        ('boolean', 'Boolean'),
        ('json', 'JSON'),
    ]
    
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    setting_type = models.CharField(max_length=20, choices=SETTING_TYPES, default='string')
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, default='general')
    
    is_public = models.BooleanField(default=False, help_text="공개 API에서 접근 가능한지 여부")
    is_editable = models.BooleanField(default=True, help_text="관리자가 수정 가능한지 여부")
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='apps_updated_settings')
    
    class Meta:
        db_table = 'apps_system_settings'
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'
        
    def __str__(self):
        return f"{self.key}: {self.value}"
        
    def get_typed_value(self):
        """Return value in appropriate type"""
        if self.setting_type == 'integer':
            return int(self.value)
        elif self.setting_type == 'float':
            return float(self.value)
        elif self.setting_type == 'boolean':
            return self.value.lower() in ('true', '1', 'yes', 'on')
        elif self.setting_type == 'json':
            import json
            return json.loads(self.value)
        return self.value


class SystemLog(models.Model):
    """System activity and error logs"""
    
    LOG_LEVELS = [
        ('debug', 'Debug'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    
    LOG_CATEGORIES = [
        ('auth', 'Authentication'),
        ('project', 'Project Management'),
        ('evaluation', 'Evaluation'),
        ('system', 'System'),
        ('api', 'API'),
        ('security', 'Security'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(default=timezone.now)
    level = models.CharField(max_length=20, choices=LOG_LEVELS)
    category = models.CharField(max_length=50, choices=LOG_CATEGORIES)
    
    message = models.TextField()
    details = models.JSONField(default=dict, blank=True)
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='apps_system_logs')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Request context
    request_method = models.CharField(max_length=10, blank=True)
    request_path = models.TextField(blank=True)
    response_status = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'apps_system_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['level']),
            models.Index(fields=['category']),
            models.Index(fields=['user']),
        ]
        
    def __str__(self):
        return f"[{self.level.upper()}] {self.category}: {self.message[:50]}"


class MaintenanceMode(models.Model):
    """System maintenance mode control"""
    
    is_enabled = models.BooleanField(default=False)
    message = models.TextField(
        default="시스템 점검 중입니다. 잠시 후 다시 시도해주세요.",
        help_text="사용자에게 표시될 메시지"
    )
    allowed_ips = models.JSONField(
        default=list, 
        blank=True,
        help_text="점검 중에도 접근 가능한 IP 주소 목록"
    )
    
    # 점검 일정
    scheduled_start = models.DateTimeField(null=True, blank=True)
    scheduled_end = models.DateTimeField(null=True, blank=True)
    
    # 메타 정보
    enabled_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='apps_maintenance_modes')
    enabled_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'apps_maintenance_mode'
        verbose_name = 'Maintenance Mode'
        verbose_name_plural = 'Maintenance Mode'
        
    def __str__(self):
        status = "활성" if self.is_enabled else "비활성"
        return f"점검 모드: {status}"
        
    def save(self, *args, **kwargs):
        # Only allow one maintenance mode record
        if not self.pk and MaintenanceMode.objects.exists():
            raise ValueError("Only one maintenance mode record is allowed")
        super().save(*args, **kwargs)


class SystemStatistics(models.Model):
    """Daily system statistics"""
    
    date = models.DateField(unique=True)
    
    # User statistics
    total_users = models.PositiveIntegerField(default=0)
    active_users_today = models.PositiveIntegerField(default=0)
    new_users_today = models.PositiveIntegerField(default=0)
    
    # Project statistics
    total_projects = models.PositiveIntegerField(default=0)
    active_projects = models.PositiveIntegerField(default=0)
    completed_projects_today = models.PositiveIntegerField(default=0)
    
    # Evaluation statistics
    evaluations_today = models.PositiveIntegerField(default=0)
    total_evaluations = models.PositiveIntegerField(default=0)
    
    # System performance
    avg_response_time = models.FloatField(default=0.0, help_text="평균 응답 시간 (초)")
    error_count = models.PositiveIntegerField(default=0)
    
    # Storage
    storage_used_mb = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'apps_system_statistics'
        ordering = ['-date']
        
    def __str__(self):
        return f"Statistics for {self.date}"


class BackupRecord(models.Model):
    """Database backup records"""
    
    BACKUP_TYPES = [
        ('full', 'Full Backup'),
        ('incremental', 'Incremental Backup'),
        ('manual', 'Manual Backup'),
    ]
    
    BACKUP_STATUS = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    backup_type = models.CharField(max_length=20, choices=BACKUP_TYPES)
    status = models.CharField(max_length=20, choices=BACKUP_STATUS, default='pending')
    
    # Backup info
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField(null=True, blank=True, help_text="파일 크기 (bytes)")
    file_path = models.TextField(blank=True)
    
    # Timing
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Details
    tables_backed_up = models.JSONField(default=list, blank=True)
    error_message = models.TextField(blank=True)
    
    # User info
    initiated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='apps_backup_records')
    
    class Meta:
        db_table = 'apps_backup_records'
        ordering = ['-started_at']
        
    def __str__(self):
        return f"{self.backup_type} backup - {self.status} ({self.started_at.date()})"
        
    @property
    def duration(self):
        """Return backup duration if completed"""
        if self.completed_at and self.started_at:
            return self.completed_at - self.started_at
        return None


class APIUsageLog(models.Model):
    """API endpoint usage tracking"""
    
    endpoint = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='apps_api_usage_logs')
    
    # Request details
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    
    # Response details
    status_code = models.PositiveIntegerField()
    response_time_ms = models.PositiveIntegerField(help_text="응답 시간 (milliseconds)")
    
    # Metadata
    request_size = models.PositiveIntegerField(default=0, help_text="요청 크기 (bytes)")
    response_size = models.PositiveIntegerField(default=0, help_text="응답 크기 (bytes)")
    
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'apps_api_usage_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['endpoint']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['user']),
            models.Index(fields=['status_code']),
        ]
        
    def __str__(self):
        return f"{self.method} {self.endpoint} - {self.status_code} ({self.timestamp})"


class SystemNotification(models.Model):
    """System-wide notifications for administrators"""
    
    NOTIFICATION_TYPES = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('success', 'Success'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS, default='medium')
    
    # Targeting
    target_users = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='apps_system_notifications')
    target_all_admins = models.BooleanField(default=False)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_dismissible = models.BooleanField(default=True)
    auto_dismiss_after = models.DurationField(null=True, blank=True, help_text="자동 해제 시간")
    
    # Metadata
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='apps_created_notifications')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Display settings
    show_on_login = models.BooleanField(default=False)
    show_in_header = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'apps_system_notifications'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"[{self.notification_type.upper()}] {self.title}"