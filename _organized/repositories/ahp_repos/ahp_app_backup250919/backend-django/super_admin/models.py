"""
Super Admin Models for AHP Platform
Complete user management, payment system, and project tracking
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import EmailValidator, MinLengthValidator
from decimal import Decimal
import uuid


class CustomUser(AbstractUser):
    """확장된 사용자 모델 - 모든 사용자 유형 통합"""
    
    USER_TYPES = (
        ('super_admin', '슈퍼 관리자'),
        ('admin', '관리자'),
        ('personal_service', '개인서비스 이용자'),
        ('evaluator', '평가자'),
        ('enterprise', '기업 사용자'),
    )
    
    SUBSCRIPTION_TIERS = (
        ('free', '무료'),
        ('basic', '기본'),
        ('professional', '전문가'),
        ('enterprise', '기업'),
        ('unlimited', '무제한'),
    )
    
    # 기본 정보
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='personal_service')
    
    # groups와 user_permissions의 related_name 설정으로 충돌 해결
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    
    # 프로필 정보
    phone = models.CharField(max_length=15, blank=True)
    organization = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    
    # 구독 정보
    subscription_tier = models.CharField(max_length=20, choices=SUBSCRIPTION_TIERS, default='free')
    subscription_start = models.DateTimeField(null=True, blank=True)
    subscription_end = models.DateTimeField(null=True, blank=True)
    
    # 사용량 제한
    monthly_project_limit = models.IntegerField(default=3)
    monthly_evaluator_limit = models.IntegerField(default=10)
    storage_limit_mb = models.IntegerField(default=100)  # MB 단위
    
    # 계정 상태
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    
    # 메타데이터
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = '사용자'
        verbose_name_plural = '사용자 관리'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email}) - {self.get_user_type_display()}"
    
    @property
    def is_super_admin(self):
        return self.user_type == 'super_admin'
    
    @property 
    def is_premium_user(self):
        return self.subscription_tier in ['professional', 'enterprise', 'unlimited']


class PaymentPlan(models.Model):
    """결제 플랜 관리"""
    
    PLAN_TYPES = (
        ('monthly', '월간'),
        ('yearly', '연간'),
        ('lifetime', '평생'),
    )
    
    name = models.CharField(max_length=100)
    tier = models.CharField(max_length=20, choices=CustomUser.SUBSCRIPTION_TIERS)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    
    # 가격 정보
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KRW')
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # 제한사항
    project_limit = models.IntegerField()
    evaluator_limit = models.IntegerField()
    storage_limit_mb = models.IntegerField()
    
    # 기능 제한
    advanced_analytics = models.BooleanField(default=False)
    api_access = models.BooleanField(default=False)
    priority_support = models.BooleanField(default=False)
    
    # 상태
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '결제 플랜'
        verbose_name_plural = '결제 플랜 관리'
        ordering = ['price']
    
    def __str__(self):
        return f"{self.name} ({self.get_plan_type_display()}) - {self.price:,}원"


class PaymentTransaction(models.Model):
    """결제 거래 내역"""
    
    PAYMENT_STATUS = (
        ('pending', '대기중'),
        ('processing', '처리중'),
        ('completed', '완료'),
        ('failed', '실패'),
        ('cancelled', '취소'),
        ('refunded', '환불'),
    )
    
    PAYMENT_METHODS = (
        ('card', '신용카드'),
        ('bank_transfer', '계좌이체'),
        ('mobile', '휴대폰 결제'),
        ('paypal', 'PayPal'),
        ('kakaopay', '카카오페이'),
        ('naverpay', '네이버페이'),
    )
    
    # 기본 정보
    transaction_id = models.UUIDField(default=uuid.uuid4, unique=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='payments')
    plan = models.ForeignKey(PaymentPlan, on_delete=models.CASCADE)
    
    # 결제 정보
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KRW')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    
    # 상태 정보
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    external_transaction_id = models.CharField(max_length=200, blank=True)  # 외부 결제 시스템 ID
    
    # 날짜 정보
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # 메모
    notes = models.TextField(blank=True)
    failure_reason = models.TextField(blank=True)
    
    class Meta:
        verbose_name = '결제 거래'
        verbose_name_plural = '결제 거래 관리'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.name} ({self.amount:,}원) - {self.get_status_display()}"


class AHPProject(models.Model):
    """AHP 프로젝트 관리"""
    
    PROJECT_STATUS = (
        ('draft', '초안'),
        ('active', '진행중'),
        ('evaluation', '평가중'),
        ('completed', '완료'),
        ('archived', '보관됨'),
    )
    
    # 기본 정보
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='super_admin_owned_projects')
    
    # 프로젝트 설정
    criteria = models.JSONField(default=list)  # 평가 기준들
    alternatives = models.JSONField(default=list)  # 대안들
    evaluation_matrix = models.JSONField(default=dict)  # 평가 매트릭스
    
    # 결과 데이터
    final_weights = models.JSONField(default=dict)
    consistency_ratio = models.FloatField(null=True, blank=True)
    
    # 협업자
    evaluators = models.ManyToManyField(
        CustomUser, 
        through='ProjectEvaluator', 
        related_name='evaluation_projects'
    )
    
    # 상태 정보
    status = models.CharField(max_length=20, choices=PROJECT_STATUS, default='draft')
    is_public = models.BooleanField(default=False)
    
    # 날짜 정보
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deadline = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'AHP 프로젝트'
        verbose_name_plural = 'AHP 프로젝트 관리'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.owner.get_full_name()}"


class ProjectEvaluator(models.Model):
    """프로젝트 평가자 관리"""
    
    INVITATION_STATUS = (
        ('pending', '초대 대기'),
        ('accepted', '수락됨'),
        ('declined', '거절됨'),
        ('completed', '평가 완료'),
    )
    
    project = models.ForeignKey(AHPProject, on_delete=models.CASCADE)
    evaluator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    # 초대 정보
    invited_at = models.DateTimeField(auto_now_add=True)
    invitation_token = models.UUIDField(default=uuid.uuid4)
    status = models.CharField(max_length=20, choices=INVITATION_STATUS, default='pending')
    
    # 평가 정보
    evaluation_data = models.JSONField(default=dict)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['project', 'evaluator']
        verbose_name = '프로젝트 평가자'
        verbose_name_plural = '프로젝트 평가자 관리'
    
    def __str__(self):
        return f"{self.project.title} - {self.evaluator.get_full_name()}"


class SystemSettings(models.Model):
    """시스템 설정"""
    
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '시스템 설정'
        verbose_name_plural = '시스템 설정 관리'
    
    def __str__(self):
        return f"{self.key}: {self.value[:50]}"


class ActivityLog(models.Model):
    """활동 로그"""
    
    LOG_LEVELS = (
        ('info', '정보'),
        ('warning', '경고'),
        ('error', '오류'),
        ('critical', '치명적'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True, related_name='super_admin_activity_logs')
    action = models.CharField(max_length=100)
    description = models.TextField()
    level = models.CharField(max_length=20, choices=LOG_LEVELS, default='info')
    
    # 메타데이터
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    extra_data = models.JSONField(default=dict)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '활동 로그'
        verbose_name_plural = '활동 로그 관리'
        ordering = ['-timestamp']
    
    def __str__(self):
        user_str = self.user.email if self.user else 'Anonymous'
        return f"{user_str} - {self.action} ({self.timestamp})"


class SystemBackup(models.Model):
    """시스템 백업 관리"""
    
    BACKUP_TYPES = (
        ('full', '전체 백업'),
        ('database', '데이터베이스 백업'),
        ('files', '파일 백업'),
        ('incremental', '증분 백업'),
    )
    
    BACKUP_STATUS = (
        ('pending', '대기중'),
        ('running', '진행중'),
        ('completed', '완료'),
        ('failed', '실패'),
    )
    
    # 기본 정보
    name = models.CharField(max_length=200)
    backup_type = models.CharField(max_length=20, choices=BACKUP_TYPES)
    status = models.CharField(max_length=20, choices=BACKUP_STATUS, default='pending')
    
    # 백업 파일 정보
    file_path = models.CharField(max_length=500, blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)  # bytes
    
    # 실행 정보
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # 추가 정보
    description = models.TextField(blank=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        verbose_name = '시스템 백업'
        verbose_name_plural = '시스템 백업 관리'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_backup_type_display()}) - {self.get_status_display()}"


class SecurityLog(models.Model):
    """보안 로그"""
    
    SECURITY_EVENTS = (
        ('login_success', '로그인 성공'),
        ('login_failed', '로그인 실패'),
        ('password_changed', '비밀번호 변경'),
        ('account_locked', '계정 잠금'),
        ('suspicious_activity', '의심스러운 활동'),
        ('unauthorized_access', '무권한 접근'),
        ('privilege_escalation', '권한 상승'),
        ('data_breach_attempt', '데이터 유출 시도'),
    )
    
    THREAT_LEVELS = (
        ('low', '낮음'),
        ('medium', '보통'),
        ('high', '높음'),
        ('critical', '치명적'),
    )
    
    # 기본 정보
    event_type = models.CharField(max_length=50, choices=SECURITY_EVENTS)
    threat_level = models.CharField(max_length=20, choices=THREAT_LEVELS)
    description = models.TextField()
    
    # 사용자 정보
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    
    # 추가 메타데이터
    extra_data = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # 처리 상태
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='resolved_security_logs'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = '보안 로그'
        verbose_name_plural = '보안 로그 관리'
        ordering = ['-timestamp']
    
    def __str__(self):
        user_str = self.user.email if self.user else 'Unknown'
        return f"{self.get_event_type_display()} - {user_str} ({self.threat_level})"


class AccessControl(models.Model):
    """접근 제어 관리"""
    
    RESOURCE_TYPES = (
        ('page', '페이지'),
        ('api', 'API'),
        ('feature', '기능'),
        ('data', '데이터'),
    )
    
    # 리소스 정보
    resource_name = models.CharField(max_length=200)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    resource_path = models.CharField(max_length=500)
    
    # 권한 설정
    required_user_types = models.JSONField(default=list)  # ['admin', 'super_admin']
    allowed_users = models.ManyToManyField(
        CustomUser, 
        blank=True, 
        related_name='allowed_access_controls'
    )
    
    # 제한 설정
    is_active = models.BooleanField(default=True)
    ip_whitelist = models.JSONField(default=list, blank=True)
    ip_blacklist = models.JSONField(default=list, blank=True)
    
    # 시간 제한
    time_restrictions = models.JSONField(default=dict, blank=True)  # {'start': '09:00', 'end': '18:00'}
    
    # 메타데이터
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='created_access_controls'
    )
    
    class Meta:
        verbose_name = '접근 제어'
        verbose_name_plural = '접근 제어 관리'
        unique_together = ['resource_name', 'resource_type']
    
    def __str__(self):
        return f"{self.resource_name} ({self.get_resource_type_display()})"


class DataMigration(models.Model):
    """데이터 마이그레이션 관리"""
    
    MIGRATION_TYPES = (
        ('import', '데이터 가져오기'),
        ('export', '데이터 내보내기'),
        ('sync', '데이터 동기화'),
        ('transform', '데이터 변환'),
    )
    
    MIGRATION_STATUS = (
        ('pending', '대기중'),
        ('running', '진행중'),
        ('completed', '완료'),
        ('failed', '실패'),
        ('cancelled', '취소됨'),
    )
    
    # 기본 정보
    name = models.CharField(max_length=200)
    migration_type = models.CharField(max_length=20, choices=MIGRATION_TYPES)
    status = models.CharField(max_length=20, choices=MIGRATION_STATUS, default='pending')
    
    # 소스/타겟 정보
    source_type = models.CharField(max_length=100)  # 'csv', 'json', 'database', etc.
    target_type = models.CharField(max_length=100)
    source_config = models.JSONField(default=dict)
    target_config = models.JSONField(default=dict)
    
    # 진행 상황
    total_records = models.IntegerField(default=0)
    processed_records = models.IntegerField(default=0)
    success_records = models.IntegerField(default=0)
    failed_records = models.IntegerField(default=0)
    
    # 실행 정보
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # 로그 및 오류
    log_messages = models.JSONField(default=list)
    error_messages = models.JSONField(default=list)
    
    class Meta:
        verbose_name = '데이터 마이그레이션'
        verbose_name_plural = '데이터 마이그레이션 관리'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_migration_type_display()}) - {self.get_status_display()}"
    
    @property
    def progress_percentage(self):
        if self.total_records == 0:
            return 0
        return (self.processed_records / self.total_records) * 100