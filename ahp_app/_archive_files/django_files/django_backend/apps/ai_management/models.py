"""
AI Management Models for AHP Platform
관리자가 사용자별 AI 기능을 관리할 수 있는 모델들
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from cryptography.fernet import Fernet
from django.conf import settings
import json

User = get_user_model()


class AIServicePlan(models.Model):
    """AI 서비스 요금제"""
    PLAN_CHOICES = [
        ('free', '무료 (제한적)'),
        ('basic', '기본형 ($10/월)'),
        ('premium', '프리미엄 ($30/월)'),
        ('enterprise', '기업형 ($100/월)'),
    ]
    
    name = models.CharField(
        max_length=50, 
        choices=PLAN_CHOICES, 
        unique=True,
        verbose_name='요금제명'
    )
    display_name = models.CharField(
        max_length=100,
        verbose_name='표시명'
    )
    monthly_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name='월 요금 ($)'
    )
    monthly_token_limit = models.IntegerField(
        validators=[MinValueValidator(0)],
        verbose_name='월간 토큰 한도'
    )
    daily_request_limit = models.IntegerField(
        validators=[MinValueValidator(0)],
        verbose_name='일간 요청 한도'
    )
    features = models.JSONField(
        default=dict,
        verbose_name='사용 가능 기능',
        help_text='예: {"chatbot": true, "analysis": true, "generation": false}'
    )
    description = models.TextField(
        blank=True,
        verbose_name='요금제 설명'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='활성 상태'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        app_label = 'ai_management'
        db_table = 'ai_service_plans'
        verbose_name = 'AI 서비스 요금제'
        verbose_name_plural = 'AI 서비스 요금제'
        ordering = ['monthly_cost']
    
    def __str__(self):
        return f"{self.get_name_display()} - ${self.monthly_cost}/월"


class AIServiceSettings(models.Model):
    """AI 서비스 설정 (관리자가 관리하는 API 키 등)"""
    PROVIDER_CHOICES = [
        ('openai', 'OpenAI'),
        ('claude', 'Claude (Anthropic)'),
        ('gemini', 'Google Gemini'),
        ('azure_openai', 'Azure OpenAI'),
    ]
    
    name = models.CharField(
        max_length=100,
        verbose_name='설정 이름'
    )
    provider = models.CharField(
        max_length=20, 
        choices=PROVIDER_CHOICES,
        verbose_name='AI 제공자'
    )
    encrypted_api_key = models.TextField(
        verbose_name='암호화된 API 키'
    )
    model_name = models.CharField(
        max_length=50, 
        default='gpt-3.5-turbo',
        verbose_name='모델명'
    )
    max_tokens = models.IntegerField(
        default=1000,
        validators=[MinValueValidator(1), MaxValueValidator(4000)],
        verbose_name='최대 토큰 수'
    )
    temperature = models.FloatField(
        default=0.7,
        validators=[MinValueValidator(0.0), MaxValueValidator(2.0)],
        verbose_name='창의성 (Temperature)'
    )
    
    # 사용량 제한
    hourly_limit = models.IntegerField(
        default=100,
        validators=[MinValueValidator(0)],
        verbose_name='시간당 요청 한도'
    )
    daily_limit = models.IntegerField(
        default=1000,
        validators=[MinValueValidator(0)],
        verbose_name='일간 요청 한도'
    )
    monthly_limit = models.IntegerField(
        default=10000,
        validators=[MinValueValidator(0)],
        verbose_name='월간 요청 한도'
    )
    
    # 추가 설정
    system_prompt = models.TextField(
        blank=True,
        verbose_name='시스템 프롬프트',
        help_text='AI가 항상 따라야 할 기본 지침'
    )
    endpoint_url = models.URLField(
        blank=True,
        verbose_name='커스텀 엔드포인트 URL'
    )
    
    # 관리 정보
    is_active = models.BooleanField(
        default=True,
        verbose_name='활성 상태'
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name='기본 설정'
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        verbose_name='생성자'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        app_label = 'ai_management'
        db_table = 'ai_service_settings'
        verbose_name = 'AI 서비스 설정'
        verbose_name_plural = 'AI 서비스 설정'
        ordering = ['-is_default', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_provider_display()})"
    
    def set_api_key(self, api_key):
        """API 키를 암호화하여 저장"""
        if not hasattr(settings, 'AI_ENCRYPTION_KEY'):
            raise ValueError("AI_ENCRYPTION_KEY가 설정되지 않았습니다.")
        
        f = Fernet(settings.AI_ENCRYPTION_KEY.encode())
        self.encrypted_api_key = f.encrypt(api_key.encode()).decode()
    
    def get_api_key(self):
        """암호화된 API 키를 복호화하여 반환"""
        if not self.encrypted_api_key:
            return None
            
        if not hasattr(settings, 'AI_ENCRYPTION_KEY'):
            raise ValueError("AI_ENCRYPTION_KEY가 설정되지 않았습니다.")
        
        f = Fernet(settings.AI_ENCRYPTION_KEY.encode())
        return f.decrypt(self.encrypted_api_key.encode()).decode()
    
    def save(self, *args, **kwargs):
        # 기본 설정이 여러 개 있으면 다른 것들은 False로 변경
        if self.is_default:
            AIServiceSettings.objects.filter(
                provider=self.provider, 
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class UserAIAccess(models.Model):
    """사용자별 AI 접근 권한"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='ai_access',
        verbose_name='사용자'
    )
    ai_plan = models.ForeignKey(
        AIServicePlan, 
        on_delete=models.CASCADE,
        verbose_name='AI 요금제'
    )
    ai_settings = models.ForeignKey(
        AIServiceSettings, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        verbose_name='AI 설정'
    )
    
    # 사용량 추적
    tokens_used_today = models.IntegerField(
        default=0,
        verbose_name='오늘 사용 토큰'
    )
    tokens_used_month = models.IntegerField(
        default=0,
        verbose_name='이번 달 사용 토큰'
    )
    requests_today = models.IntegerField(
        default=0,
        verbose_name='오늘 요청 수'
    )
    requests_month = models.IntegerField(
        default=0,
        verbose_name='이번 달 요청 수'
    )
    last_reset_date = models.DateField(
        default=timezone.now,
        verbose_name='마지막 초기화 날짜'
    )
    
    # 권한 설정
    is_enabled = models.BooleanField(
        default=True,
        verbose_name='활성 상태'
    )
    can_use_advanced_features = models.BooleanField(
        default=False,
        verbose_name='고급 기능 사용 가능'
    )
    can_export_conversations = models.BooleanField(
        default=True,
        verbose_name='대화 내보내기 가능'
    )
    
    # 알림 설정
    usage_alert_threshold = models.IntegerField(
        default=80,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='사용량 알림 임계값 (%)'
    )
    email_usage_alerts = models.BooleanField(
        default=True,
        verbose_name='사용량 알림 이메일 발송'
    )
    
    # 관리 정보
    assigned_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='assigned_ai_access',
        verbose_name='할당자'
    )
    assigned_at = models.DateTimeField(auto_now_add=True, verbose_name='할당일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    expires_at = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name='만료일'
    )
    notes = models.TextField(
        blank=True,
        verbose_name='메모'
    )
    
    class Meta:
        app_label = 'ai_management'
        db_table = 'user_ai_access'
        verbose_name = '사용자 AI 접근 권한'
        verbose_name_plural = '사용자 AI 접근 권한'
        ordering = ['-assigned_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.ai_plan.get_name_display()}"
    
    @property
    def usage_percentage(self):
        """이번 달 사용량 퍼센티지"""
        if self.ai_plan.monthly_token_limit > 0:
            return round((self.tokens_used_month / self.ai_plan.monthly_token_limit) * 100, 2)
        return 0
    
    @property
    def is_over_limit(self):
        """한도 초과 여부"""
        return (self.tokens_used_month >= self.ai_plan.monthly_token_limit or 
                self.requests_today >= self.ai_plan.daily_request_limit)
    
    @property
    def should_send_alert(self):
        """사용량 알림 발송 여부"""
        return (self.email_usage_alerts and 
                self.usage_percentage >= self.usage_alert_threshold)
    
    def reset_daily_usage(self):
        """일간 사용량 초기화"""
        self.tokens_used_today = 0
        self.requests_today = 0
        self.save(update_fields=['tokens_used_today', 'requests_today'])
    
    def reset_monthly_usage(self):
        """월간 사용량 초기화"""
        self.tokens_used_month = 0
        self.requests_month = 0
        self.last_reset_date = timezone.now().date()
        self.save(update_fields=['tokens_used_month', 'requests_month', 'last_reset_date'])


class AIUsageLog(models.Model):
    """AI 사용 로그"""
    REQUEST_TYPE_CHOICES = [
        ('chatbot', '챗봇 대화'),
        ('analysis', '데이터 분석'),
        ('generation', '콘텐츠 생성'),
        ('translation', '번역'),
        ('summary', '요약'),
        ('evaluation', '평가 지원'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        verbose_name='사용자'
    )
    ai_settings = models.ForeignKey(
        AIServiceSettings, 
        on_delete=models.CASCADE,
        verbose_name='AI 설정'
    )
    
    # 요청 정보
    request_type = models.CharField(
        max_length=50,
        choices=REQUEST_TYPE_CHOICES,
        verbose_name='요청 유형'
    )
    prompt = models.TextField(verbose_name='프롬프트')
    response = models.TextField(verbose_name='응답')
    
    # 사용량 정보
    tokens_used = models.IntegerField(verbose_name='사용 토큰 수')
    cost = models.DecimalField(
        max_digits=10, 
        decimal_places=4,
        verbose_name='비용 ($)'
    )
    response_time = models.FloatField(verbose_name='응답 시간 (초)')
    
    # 품질 정보
    user_rating = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='사용자 평점 (1-5)'
    )
    user_feedback = models.TextField(
        blank=True,
        verbose_name='사용자 피드백'
    )
    
    # 메타데이터
    ip_address = models.GenericIPAddressField(verbose_name='IP 주소')
    user_agent = models.TextField(verbose_name='User Agent')
    session_id = models.CharField(
        max_length=100,
        verbose_name='세션 ID'
    )
    
    # 시스템 정보
    model_version = models.CharField(
        max_length=50,
        verbose_name='모델 버전'
    )
    error_message = models.TextField(
        blank=True,
        verbose_name='오류 메시지'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    
    class Meta:
        app_label = 'ai_management'
        db_table = 'ai_usage_logs'
        verbose_name = 'AI 사용 로그'
        verbose_name_plural = 'AI 사용 로그'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['request_type', 'created_at']),
            models.Index(fields=['ai_settings', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_request_type_display()} ({self.created_at})"


class PromptTemplate(models.Model):
    """AI 프롬프트 템플릿"""
    CATEGORY_CHOICES = [
        ('research', '연구 지원'),
        ('analysis', '분석'),
        ('writing', '작성'),
        ('evaluation', '평가'),
        ('general', '일반'),
    ]
    
    name = models.CharField(
        max_length=100,
        verbose_name='템플릿 이름'
    )
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        verbose_name='카테고리'
    )
    description = models.TextField(
        verbose_name='설명'
    )
    template = models.TextField(
        verbose_name='프롬프트 템플릿',
        help_text='변수는 {variable_name} 형식으로 사용'
    )
    variables = models.JSONField(
        default=list,
        verbose_name='변수 목록',
        help_text='예: [{"name": "topic", "description": "분석 주제", "required": true}]'
    )
    
    # 사용 통계
    usage_count = models.IntegerField(
        default=0,
        verbose_name='사용 횟수'
    )
    average_rating = models.FloatField(
        default=0.0,
        verbose_name='평균 평점'
    )
    
    # 관리 정보
    is_public = models.BooleanField(
        default=True,
        verbose_name='공개 템플릿'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='활성 상태'
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        verbose_name='생성자'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        app_label = 'ai_management'
        db_table = 'prompt_templates'
        verbose_name = 'AI 프롬프트 템플릿'
        verbose_name_plural = 'AI 프롬프트 템플릿'
        ordering = ['-usage_count', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"
    
    def increment_usage(self):
        """사용 횟수 증가"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])


class DevelopmentPromptLog(models.Model):
    """개발 프롬프트 로그 (자동 저장)"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        verbose_name='사용자'
    )
    session_id = models.CharField(
        max_length=100,
        verbose_name='세션 ID'
    )
    context = models.CharField(
        max_length=100,
        default='general',
        verbose_name='컨텍스트'
    )
    user_prompt = models.TextField(verbose_name='사용자 프롬프트')
    ai_response = models.TextField(
        blank=True,
        verbose_name='AI 응답'
    )
    
    # 메타데이터
    file_saved = models.BooleanField(
        default=False,
        verbose_name='파일 저장 완료'
    )
    saved_filename = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='저장된 파일명'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    
    class Meta:
        app_label = 'ai_management'
        db_table = 'development_prompt_logs'
        verbose_name = '개발 프롬프트 로그'
        verbose_name_plural = '개발 프롬프트 로그'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.context} ({self.created_at})"