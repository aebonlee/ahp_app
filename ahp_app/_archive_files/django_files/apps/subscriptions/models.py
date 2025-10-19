"""
구독 및 결제 관리 모델
AHP 플랫폼의 구독, 결제, 사용량 추적을 위한 Django 모델
"""
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid

User = get_user_model()


class SubscriptionPlan(models.Model):
    """구독 플랜 모델 - 다양한 구독 옵션 정의"""
    
    PLAN_TYPES = [
        ('basic', '기본 플랜'),
        ('professional', '프로페셔널 플랜'),
        ('enterprise', '엔터프라이즈 플랜'),
        ('custom', '맞춤형 플랜'),
    ]
    
    CURRENCIES = [
        ('KRW', '한국 원'),
        ('USD', '미국 달러'),
        ('EUR', '유로'),
        ('JPY', '일본 엔'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan_id = models.CharField(max_length=50, unique=True, verbose_name='플랜 ID')
    name = models.CharField(max_length=100, verbose_name='플랜명')
    description = models.TextField(verbose_name='설명')
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, verbose_name='플랜 타입')
    
    # 가격 정보
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='월 요금')
    currency = models.CharField(max_length=3, choices=CURRENCIES, default='KRW', verbose_name='통화')
    duration_months = models.PositiveIntegerField(default=1, verbose_name='기간(개월)')
    
    # 제한사항
    max_personal_admins = models.IntegerField(default=5, verbose_name='최대 개인 관리자 수', 
                                            help_text='-1은 무제한을 의미')
    max_projects_per_admin = models.IntegerField(default=3, verbose_name='관리자당 최대 프로젝트 수',
                                                help_text='-1은 무제한을 의미')
    max_surveys_per_project = models.IntegerField(default=50, verbose_name='프로젝트당 최대 설문 수',
                                                 help_text='-1은 무제한을 의미')
    max_evaluators_per_project = models.IntegerField(default=10, verbose_name='프로젝트당 최대 평가자 수',
                                                    help_text='-1은 무제한을 의미')
    max_criteria_per_project = models.IntegerField(default=15, verbose_name='프로젝트당 최대 기준 수',
                                                  help_text='-1은 무제한을 의미')
    max_alternatives_per_project = models.IntegerField(default=10, verbose_name='프로젝트당 최대 대안 수',
                                                      help_text='-1은 무제한을 의미')
    storage_limit_gb = models.IntegerField(default=1, verbose_name='저장소 제한(GB)',
                                          help_text='-1은 무제한을 의미')
    
    # 기능 제한
    ai_features_enabled = models.BooleanField(default=False, verbose_name='AI 기능 사용 가능')
    advanced_analytics = models.BooleanField(default=False, verbose_name='고급 분석 기능')
    group_ahp_enabled = models.BooleanField(default=False, verbose_name='그룹 AHP 기능')
    api_access = models.BooleanField(default=False, verbose_name='API 접근 권한')
    custom_branding = models.BooleanField(default=False, verbose_name='커스텀 브랜딩')
    priority_support = models.BooleanField(default=False, verbose_name='우선 지원')
    
    # 상태 및 메타데이터
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    is_popular = models.BooleanField(default=False, verbose_name='인기 플랜')
    is_featured = models.BooleanField(default=False, verbose_name='추천 플랜')
    sort_order = models.PositiveIntegerField(default=0, verbose_name='정렬 순서')
    
    created_at = models.DateTimeField(default=timezone.now, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                  related_name='created_plans', verbose_name='생성자')
    
    class Meta:
        app_label = 'subscriptions'
        db_table = 'subscription_plans'
        verbose_name = '구독 플랜'
        verbose_name_plural = '구독 플랜들'
        ordering = ['sort_order', 'price']
    
    def __str__(self):
        return f"{self.name} (₩{self.price:,}/월)"
    
    @property
    def is_unlimited(self):
        """무제한 플랜인지 확인"""
        return (self.max_personal_admins == -1 or 
                self.max_projects_per_admin == -1 or 
                self.max_surveys_per_project == -1)
    
    @property
    def features_list(self):
        """활성화된 기능 목록 반환"""
        features = []
        if self.ai_features_enabled:
            features.append('AI 기능')
        if self.advanced_analytics:
            features.append('고급 분석')
        if self.group_ahp_enabled:
            features.append('그룹 AHP')
        if self.api_access:
            features.append('API 접근')
        if self.custom_branding:
            features.append('커스텀 브랜딩')
        if self.priority_support:
            features.append('우선 지원')
        return features


class UserSubscription(models.Model):
    """사용자 구독 정보"""
    
    STATUS_CHOICES = [
        ('pending', '결제 대기'),
        ('active', '활성'),
        ('cancelled', '취소됨'),
        ('expired', '만료됨'),
        ('suspended', '일시정지'),
        ('trial', '체험판'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription', 
                               verbose_name='사용자')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, 
                            related_name='subscriptions', verbose_name='구독 플랜')
    
    # 구독 상태 및 기간
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending',
                             verbose_name='구독 상태')
    start_date = models.DateTimeField(verbose_name='시작일')
    end_date = models.DateTimeField(verbose_name='종료일')
    trial_end_date = models.DateTimeField(null=True, blank=True, verbose_name='체험판 종료일')
    
    # 결제 및 갱신
    auto_renew = models.BooleanField(default=True, verbose_name='자동 갱신')
    next_billing_date = models.DateTimeField(null=True, blank=True, verbose_name='다음 결제일')
    
    # 사용자 정의 제한사항 (플랜 기본값 오버라이드)
    custom_max_projects = models.IntegerField(null=True, blank=True, verbose_name='커스텀 최대 프로젝트 수')
    custom_max_evaluators = models.IntegerField(null=True, blank=True, verbose_name='커스텀 최대 평가자 수')
    custom_ai_enabled = models.BooleanField(null=True, blank=True, verbose_name='커스텀 AI 기능')
    
    # 메타데이터
    notes = models.TextField(blank=True, verbose_name='관리자 노트')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                  related_name='created_subscriptions', verbose_name='생성자')
    
    class Meta:
        app_label = 'subscriptions'
        db_table = 'user_subscriptions'
        verbose_name = '사용자 구독'
        verbose_name_plural = '사용자 구독들'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.name} ({self.get_status_display()})"
    
    @property
    def is_active(self):
        """구독이 활성 상태인지 확인"""
        return (self.status == 'active' and 
                self.start_date <= timezone.now() <= self.end_date)
    
    @property
    def days_remaining(self):
        """남은 일수 계산"""
        if self.end_date:
            delta = self.end_date - timezone.now()
            return max(0, delta.days)
        return 0
    
    @property
    def effective_max_projects(self):
        """실제 적용되는 최대 프로젝트 수"""
        return self.custom_max_projects if self.custom_max_projects is not None else self.plan.max_projects_per_admin
    
    @property
    def effective_max_evaluators(self):
        """실제 적용되는 최대 평가자 수"""
        return self.custom_max_evaluators if self.custom_max_evaluators is not None else self.plan.max_evaluators_per_project
    
    @property
    def effective_ai_enabled(self):
        """실제 적용되는 AI 기능 활성화 여부"""
        return self.custom_ai_enabled if self.custom_ai_enabled is not None else self.plan.ai_features_enabled


class PaymentMethod(models.Model):
    """결제 수단 정보"""
    
    PAYMENT_TYPES = [
        ('card', '신용카드'),
        ('bank_transfer', '계좌이체'),
        ('paypal', 'PayPal'),
        ('virtual_account', '가상계좌'),
        ('mobile', '휴대폰 결제'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods',
                            verbose_name='사용자')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES, verbose_name='결제 유형')
    
    # 카드 정보 (암호화된 형태로 저장)
    card_last_four = models.CharField(max_length=4, blank=True, verbose_name='카드 끝자리')
    card_brand = models.CharField(max_length=20, blank=True, verbose_name='카드 브랜드')
    card_expiry_month = models.PositiveIntegerField(null=True, blank=True, 
                                                   validators=[MinValueValidator(1), MaxValueValidator(12)],
                                                   verbose_name='카드 만료월')
    card_expiry_year = models.PositiveIntegerField(null=True, blank=True, verbose_name='카드 만료년')
    
    # 계좌 정보
    bank_name = models.CharField(max_length=100, blank=True, verbose_name='은행명')
    account_last_four = models.CharField(max_length=4, blank=True, verbose_name='계좌 끝자리')
    account_holder_name = models.CharField(max_length=100, blank=True, verbose_name='예금주명')
    
    # 결제 게이트웨이 정보
    gateway_id = models.CharField(max_length=255, blank=True, verbose_name='게이트웨이 ID')
    gateway_data = models.JSONField(default=dict, blank=True, verbose_name='게이트웨이 데이터')
    
    # 상태
    is_primary = models.BooleanField(default=False, verbose_name='기본 결제수단')
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    
    created_at = models.DateTimeField(default=timezone.now, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        app_label = 'subscriptions'
        db_table = 'payment_methods'
        verbose_name = '결제 수단'
        verbose_name_plural = '결제 수단들'
        ordering = ['-is_primary', '-created_at']
    
    def __str__(self):
        if self.payment_type == 'card':
            return f"{self.card_brand} ****{self.card_last_four}"
        elif self.payment_type == 'bank_transfer':
            return f"{self.bank_name} ****{self.account_last_four}"
        return f"{self.get_payment_type_display()}"


class PaymentRecord(models.Model):
    """결제 기록"""
    
    STATUS_CHOICES = [
        ('pending', '결제 대기'),
        ('processing', '결제 처리중'),
        ('completed', '결제 완료'),
        ('failed', '결제 실패'),
        ('cancelled', '결제 취소'),
        ('refunded', '환불 완료'),
        ('partial_refund', '부분 환불'),
    ]
    
    PAYMENT_TYPES = [
        ('subscription', '구독 결제'),
        ('upgrade', '플랜 업그레이드'),
        ('addon', '추가 기능'),
        ('one_time', '일회성 결제'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(UserSubscription, on_delete=models.CASCADE,
                                   related_name='payment_records', verbose_name='구독')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True,
                                     verbose_name='결제 수단')
    
    # 결제 정보
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES, verbose_name='결제 유형')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='결제 금액')
    currency = models.CharField(max_length=3, default='KRW', verbose_name='통화')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending',
                             verbose_name='결제 상태')
    
    # 결제 게이트웨이 정보
    transaction_id = models.CharField(max_length=255, blank=True, verbose_name='거래 ID')
    gateway_response = models.JSONField(default=dict, blank=True, verbose_name='게이트웨이 응답')
    
    # 할인 및 쿠폰
    coupon_code = models.CharField(max_length=50, blank=True, verbose_name='쿠폰 코드')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                        verbose_name='할인 금액')
    
    # 세금 및 수수료
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                   verbose_name='세금')
    fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                   verbose_name='수수료')
    
    # 환불 정보
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                      verbose_name='환불 금액')
    refund_reason = models.TextField(blank=True, verbose_name='환불 사유')
    
    # 기간 정보
    billing_period_start = models.DateTimeField(null=True, blank=True, verbose_name='청구 기간 시작')
    billing_period_end = models.DateTimeField(null=True, blank=True, verbose_name='청구 기간 종료')
    
    # 메타데이터
    description = models.TextField(blank=True, verbose_name='설명')
    notes = models.TextField(blank=True, verbose_name='관리자 노트')
    
    created_at = models.DateTimeField(default=timezone.now, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name='결제 완료일')
    
    class Meta:
        app_label = 'subscriptions'
        db_table = 'payment_records'
        verbose_name = '결제 기록'
        verbose_name_plural = '결제 기록들'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.subscription.user.email} - ₩{self.amount:,} ({self.get_status_display()})"
    
    @property
    def total_amount(self):
        """총 결제 금액 (세금 및 수수료 포함)"""
        return self.amount + self.tax_amount + self.fee_amount
    
    @property
    def net_amount(self):
        """순 결제 금액 (할인 적용 후)"""
        return self.amount - self.discount_amount


class SubscriptionUsage(models.Model):
    """구독 사용량 추적"""
    
    subscription = models.OneToOneField(UserSubscription, on_delete=models.CASCADE,
                                      related_name='usage', verbose_name='구독')
    
    # 현재 사용량
    current_personal_admins = models.PositiveIntegerField(default=0, verbose_name='현재 개인 관리자 수')
    current_projects = models.PositiveIntegerField(default=0, verbose_name='현재 프로젝트 수')
    current_surveys = models.PositiveIntegerField(default=0, verbose_name='현재 설문 수')
    current_evaluators = models.PositiveIntegerField(default=0, verbose_name='현재 평가자 수')
    storage_used_gb = models.DecimalField(max_digits=10, decimal_places=3, default=0,
                                        verbose_name='사용된 저장공간(GB)')
    
    # 월별 사용량 (리셋되는 수치들)
    monthly_ai_requests = models.PositiveIntegerField(default=0, verbose_name='월간 AI 요청 수')
    monthly_api_calls = models.PositiveIntegerField(default=0, verbose_name='월간 API 호출 수')
    monthly_email_sends = models.PositiveIntegerField(default=0, verbose_name='월간 이메일 발송 수')
    
    # 누적 사용량
    total_projects_created = models.PositiveIntegerField(default=0, verbose_name='총 생성된 프로젝트 수')
    total_evaluations_completed = models.PositiveIntegerField(default=0, verbose_name='총 완료된 평가 수')
    total_ai_requests = models.PositiveIntegerField(default=0, verbose_name='총 AI 요청 수')
    
    # 사용량 리셋 정보
    last_reset_date = models.DateTimeField(default=timezone.now, verbose_name='마지막 리셋일')
    
    updated_at = models.DateTimeField(auto_now=True, verbose_name='업데이트일')
    
    class Meta:
        app_label = 'subscriptions'
        db_table = 'subscription_usage'
        verbose_name = '구독 사용량'
        verbose_name_plural = '구독 사용량들'
    
    def __str__(self):
        return f"{self.subscription.user.email} 사용량"
    
    def check_limit(self, resource_type, required_amount=1):
        """리소스 제한 확인"""
        subscription = self.subscription
        
        if resource_type == 'projects':
            limit = subscription.effective_max_projects
            current = self.current_projects
        elif resource_type == 'evaluators':
            limit = subscription.effective_max_evaluators
            current = self.current_evaluators
        elif resource_type == 'surveys':
            limit = subscription.plan.max_surveys_per_project
            current = self.current_surveys
        elif resource_type == 'storage':
            limit = subscription.plan.storage_limit_gb
            current = float(self.storage_used_gb)
        else:
            return True  # 알 수 없는 리소스는 허용
        
        # -1은 무제한을 의미
        if limit == -1:
            return True
        
        return (current + required_amount) <= limit
    
    def reset_monthly_usage(self):
        """월간 사용량 리셋"""
        self.monthly_ai_requests = 0
        self.monthly_api_calls = 0
        self.monthly_email_sends = 0
        self.last_reset_date = timezone.now()
        self.save()


class UsageAlert(models.Model):
    """사용량 알림"""
    
    ALERT_TYPES = [
        ('warning', '경고'),
        ('limit_reached', '한도 도달'),
        ('upgrade_needed', '업그레이드 필요'),
        ('billing_failure', '결제 실패'),
        ('subscription_expiring', '구독 만료 예정'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', '낮음'),
        ('medium', '보통'),
        ('high', '높음'),
        ('critical', '긴급'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(UserSubscription, on_delete=models.CASCADE,
                                   related_name='alerts', verbose_name='구독')
    
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPES, verbose_name='알림 유형')
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS, verbose_name='심각도')
    
    resource_type = models.CharField(max_length=50, blank=True, verbose_name='리소스 유형')
    current_usage = models.IntegerField(default=0, verbose_name='현재 사용량')
    limit_amount = models.IntegerField(default=0, verbose_name='제한량')
    threshold_percentage = models.IntegerField(default=80, verbose_name='임계값 퍼센티지')
    
    title = models.CharField(max_length=200, verbose_name='제목')
    message = models.TextField(verbose_name='메시지')
    action_required = models.BooleanField(default=False, verbose_name='조치 필요')
    action_url = models.URLField(blank=True, verbose_name='조치 URL')
    
    is_read = models.BooleanField(default=False, verbose_name='읽음 여부')
    is_resolved = models.BooleanField(default=False, verbose_name='해결 여부')
    
    created_at = models.DateTimeField(default=timezone.now, verbose_name='생성일')
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='읽은 시간')
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name='해결 시간')
    
    class Meta:
        app_label = 'subscriptions'
        db_table = 'usage_alerts'
        verbose_name = '사용량 알림'
        verbose_name_plural = '사용량 알림들'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.subscription.user.email} - {self.title}"
    
    def mark_as_read(self):
        """알림을 읽음으로 표시"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
    
    def mark_as_resolved(self):
        """알림을 해결됨으로 표시"""
        if not self.is_resolved:
            self.is_resolved = True
            self.resolved_at = timezone.now()
            self.save()


class CouponCode(models.Model):
    """쿠폰 코드 관리"""
    
    DISCOUNT_TYPES = [
        ('percentage', '퍼센트 할인'),
        ('fixed', '고정 금액 할인'),
        ('free_trial', '무료 체험'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, verbose_name='쿠폰 코드')
    name = models.CharField(max_length=100, verbose_name='쿠폰명')
    description = models.TextField(blank=True, verbose_name='설명')
    
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, verbose_name='할인 유형')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='할인값')
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                            verbose_name='최대 할인 금액')
    
    # 사용 제한
    max_uses = models.PositiveIntegerField(null=True, blank=True, verbose_name='최대 사용 횟수')
    max_uses_per_user = models.PositiveIntegerField(default=1, verbose_name='사용자당 최대 사용 횟수')
    current_uses = models.PositiveIntegerField(default=0, verbose_name='현재 사용 횟수')
    
    # 적용 가능 플랜
    applicable_plans = models.ManyToManyField(SubscriptionPlan, blank=True,
                                            verbose_name='적용 가능 플랜')
    
    # 유효 기간
    valid_from = models.DateTimeField(verbose_name='유효 시작일')
    valid_until = models.DateTimeField(verbose_name='유효 종료일')
    
    # 상태
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    
    created_at = models.DateTimeField(default=timezone.now, verbose_name='생성일')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,
                                  related_name='created_coupons', verbose_name='생성자')
    
    class Meta:
        app_label = 'subscriptions'
        db_table = 'coupon_codes'
        verbose_name = '쿠폰 코드'
        verbose_name_plural = '쿠폰 코드들'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    @property
    def is_valid(self):
        """쿠폰이 유효한지 확인"""
        now = timezone.now()
        return (self.is_active and 
                self.valid_from <= now <= self.valid_until and
                (self.max_uses is None or self.current_uses < self.max_uses))
    
    def can_be_used_by_user(self, user):
        """특정 사용자가 사용할 수 있는지 확인"""
        if not self.is_valid:
            return False
        
        user_uses = PaymentRecord.objects.filter(
            subscription__user=user,
            coupon_code=self.code
        ).count()
        
        return user_uses < self.max_uses_per_user
    
    def calculate_discount(self, amount):
        """할인 금액 계산"""
        if self.discount_type == 'percentage':
            discount = amount * (self.discount_value / 100)
            if self.max_discount_amount:
                discount = min(discount, self.max_discount_amount)
        elif self.discount_type == 'fixed':
            discount = min(self.discount_value, amount)
        else:
            discount = Decimal('0')
        
        return discount