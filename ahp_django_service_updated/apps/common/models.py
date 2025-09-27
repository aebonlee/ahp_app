"""
Common Models for AHP Platform
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class TimeStampedModel(models.Model):
    """Abstract base model with timestamp fields"""
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class ActivityLog(models.Model):
    """System activity logging"""
    
    ACTION_CHOICES = [
        ('create', '생성'),
        ('update', '수정'),
        ('delete', '삭제'),
        ('view', '조회'),
        ('export', '내보내기'),
        ('import', '가져오기'),
        ('login', '로그인'),
        ('logout', '로그아웃'),
    ]
    
    LEVEL_CHOICES = [
        ('info', '정보'),
        ('warning', '경고'),
        ('error', '오류'),
        ('debug', '디버그'),
    ]
    
    # Activity details
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='info')
    
    # Target object
    content_type = models.ForeignKey('contenttypes.ContentType', on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=255, null=True, blank=True)
    
    # Details
    message = models.TextField()
    details = models.JSONField(default=dict, blank=True)
    
    # Request context
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    request_path = models.CharField(max_length=500, blank=True)
    
    # Timing
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'activity_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
        ]
        
    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"


class SystemSettings(models.Model):
    """System configuration settings"""
    
    CATEGORY_CHOICES = [
        ('general', '일반'),
        ('security', '보안'),
        ('email', '이메일'),
        ('analytics', '분석'),
        ('ui', '사용자 인터페이스'),
    ]
    
    TYPE_CHOICES = [
        ('string', '문자열'),
        ('integer', '정수'),
        ('float', '실수'),
        ('boolean', '불린'),
        ('json', 'JSON'),
    ]
    
    # Setting identification
    key = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # Value and type
    value = models.TextField()
    value_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='string')
    
    # Metadata
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    is_editable = models.BooleanField(default=True)
    
    # Validation
    validation_rules = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'system_settings'
        
    def __str__(self):
        return f"{self.key}: {self.value}"
        
    def get_typed_value(self):
        """Return value converted to appropriate Python type"""
        if self.value_type == 'integer':
            return int(self.value)
        elif self.value_type == 'float':
            return float(self.value)
        elif self.value_type == 'boolean':
            return self.value.lower() in ('true', '1', 'yes')
        elif self.value_type == 'json':
            import json
            return json.loads(self.value)
        return self.value


class FileUpload(models.Model):
    """File upload tracking"""
    
    STATUS_CHOICES = [
        ('uploading', '업로드 중'),
        ('completed', '완료'),
        ('failed', '실패'),
    ]
    
    TYPE_CHOICES = [
        ('project_import', '프로젝트 가져오기'),
        ('data_export', '데이터 내보내기'),
        ('user_avatar', '사용자 아바타'),
        ('document', '문서'),
    ]
    
    # File information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    
    # Upload context
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    upload_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploading')
    
    # Processing results
    processing_results = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'file_uploads'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.original_name} - {self.uploaded_by.username}"
        
    def mark_completed(self):
        """Mark upload as completed"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
        
    def mark_failed(self, error_message=''):
        """Mark upload as failed"""
        self.status = 'failed'
        self.error_message = error_message
        self.save()


class Notification(models.Model):
    """User notifications"""
    
    TYPE_CHOICES = [
        ('info', '정보'),
        ('success', '성공'),
        ('warning', '경고'),
        ('error', '오류'),
    ]
    
    # Notification details
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='info')
    
    # Status
    is_read = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)
    
    # Optional action
    action_url = models.URLField(blank=True)
    action_label = models.CharField(max_length=50, blank=True)
    
    # Related object
    content_type = models.ForeignKey('contenttypes.ContentType', on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=255, null=True, blank=True)
    
    # Timing
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['created_at']),
        ]
        
    def __str__(self):
        return f"{self.recipient.username}: {self.title}"
        
    def mark_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class APIKey(models.Model):
    """API key management for external integrations"""
    
    # Key information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    key = models.CharField(max_length=64, unique=True)
    
    # Ownership
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='api_keys')
    
    # Permissions
    permissions = models.JSONField(default=list)
    rate_limit = models.IntegerField(default=1000, help_text="Requests per hour")
    
    # Status
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)
    
    # Timing
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'api_keys'
        
    def __str__(self):
        return f"{self.name} - {self.user.username}"
        
    def is_expired(self):
        """Check if API key is expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
        
    def record_usage(self):
        """Record API key usage"""
        self.last_used_at = timezone.now()
        self.usage_count += 1
        self.save(update_fields=['last_used_at', 'usage_count'])