"""
구독 관리 API 시리얼라이저
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    SubscriptionPlan, UserSubscription, PaymentMethod,
    PaymentRecord, SubscriptionUsage, UsageAlert, CouponCode
)

User = get_user_model()


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """구독 플랜 시리얼라이저"""
    
    features_list = serializers.ReadOnlyField()
    is_unlimited = serializers.ReadOnlyField()
    subscription_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'plan_id', 'name', 'description', 'plan_type',
            'price', 'currency', 'duration_months',
            'max_personal_admins', 'max_projects_per_admin',
            'max_surveys_per_project', 'max_evaluators_per_project',
            'max_criteria_per_project', 'max_alternatives_per_project',
            'storage_limit_gb', 'ai_features_enabled', 'advanced_analytics',
            'group_ahp_enabled', 'api_access', 'custom_branding',
            'priority_support', 'is_active', 'is_popular', 'is_featured',
            'features_list', 'is_unlimited', 'subscription_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_subscription_count(self, obj):
        return obj.subscriptions.filter(status='active').count()


class PaymentMethodSerializer(serializers.ModelSerializer):
    """결제 수단 시리얼라이저"""
    
    display_info = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'payment_type', 'card_last_four', 'card_brand',
            'card_expiry_month', 'card_expiry_year', 'bank_name',
            'account_last_four', 'account_holder_name', 'is_primary',
            'is_active', 'display_info', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_display_info(self, obj):
        if obj.payment_type == 'card':
            return f"{obj.card_brand} ****{obj.card_last_four}"
        elif obj.payment_type == 'bank_transfer':
            return f"{obj.bank_name} ****{obj.account_last_four}"
        return obj.get_payment_type_display()


class SubscriptionUsageSerializer(serializers.ModelSerializer):
    """구독 사용량 시리얼라이저"""
    
    class Meta:
        model = SubscriptionUsage
        fields = [
            'current_personal_admins', 'current_projects', 'current_surveys',
            'current_evaluators', 'storage_used_gb', 'monthly_ai_requests',
            'monthly_api_calls', 'monthly_email_sends', 'total_projects_created',
            'total_evaluations_completed', 'total_ai_requests', 'last_reset_date',
            'updated_at'
        ]
        read_only_fields = ['last_reset_date', 'updated_at']


class PaymentRecordSerializer(serializers.ModelSerializer):
    """결제 기록 시리얼라이저"""
    
    total_amount = serializers.ReadOnlyField()
    net_amount = serializers.ReadOnlyField()
    payment_method_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentRecord
        fields = [
            'id', 'payment_type', 'amount', 'currency', 'status',
            'transaction_id', 'coupon_code', 'discount_amount',
            'tax_amount', 'fee_amount', 'refund_amount', 'refund_reason',
            'billing_period_start', 'billing_period_end', 'description',
            'total_amount', 'net_amount', 'payment_method_display',
            'created_at', 'updated_at', 'paid_at'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'total_amount', 'net_amount',
            'created_at', 'updated_at', 'paid_at'
        ]
    
    def get_payment_method_display(self, obj):
        if obj.payment_method:
            return obj.payment_method.display_info
        return None


class UserSubscriptionSerializer(serializers.ModelSerializer):
    """사용자 구독 시리얼라이저"""
    
    plan = SubscriptionPlanSerializer(read_only=True)
    usage = SubscriptionUsageSerializer(read_only=True)
    payment_records = PaymentRecordSerializer(many=True, read_only=True)
    
    is_active = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    effective_max_projects = serializers.ReadOnlyField()
    effective_max_evaluators = serializers.ReadOnlyField()
    effective_ai_enabled = serializers.ReadOnlyField()
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = [
            'id', 'user', 'user_email', 'plan', 'plan_name', 'status',
            'start_date', 'end_date', 'trial_end_date', 'auto_renew',
            'next_billing_date', 'custom_max_projects', 'custom_max_evaluators',
            'custom_ai_enabled', 'notes', 'usage', 'payment_records',
            'is_active', 'days_remaining', 'effective_max_projects',
            'effective_max_evaluators', 'effective_ai_enabled',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UsageAlertSerializer(serializers.ModelSerializer):
    """사용량 알림 시리얼라이저"""
    
    user_email = serializers.CharField(source='subscription.user.email', read_only=True)
    
    class Meta:
        model = UsageAlert
        fields = [
            'id', 'alert_type', 'severity', 'resource_type',
            'current_usage', 'limit_amount', 'threshold_percentage',
            'title', 'message', 'action_required', 'action_url',
            'is_read', 'is_resolved', 'user_email',
            'created_at', 'read_at', 'resolved_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'read_at', 'resolved_at', 'user_email'
        ]


class CouponCodeSerializer(serializers.ModelSerializer):
    """쿠폰 코드 시리얼라이저"""
    
    applicable_plans = SubscriptionPlanSerializer(many=True, read_only=True)
    is_valid = serializers.ReadOnlyField()
    
    class Meta:
        model = CouponCode
        fields = [
            'id', 'code', 'name', 'description', 'discount_type',
            'discount_value', 'max_discount_amount', 'max_uses',
            'max_uses_per_user', 'current_uses', 'applicable_plans',
            'valid_from', 'valid_until', 'is_active', 'is_valid',
            'created_at'
        ]
        read_only_fields = ['id', 'current_uses', 'created_at']


class PaymentRequestSerializer(serializers.Serializer):
    """결제 요청 시리얼라이저"""
    
    plan_id = serializers.CharField()
    payment_method_type = serializers.ChoiceField(
        choices=['card', 'bank_transfer', 'paypal', 'virtual_account']
    )
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    
    # 카드 결제 정보
    card_number = serializers.CharField(required=False, allow_blank=True)
    card_expiry_month = serializers.IntegerField(required=False, min_value=1, max_value=12)
    card_expiry_year = serializers.IntegerField(required=False, min_value=2024)
    card_cvv = serializers.CharField(required=False, allow_blank=True, max_length=4)
    card_holder_name = serializers.CharField(required=False, allow_blank=True)
    
    # 계좌이체 정보
    bank_name = serializers.CharField(required=False, allow_blank=True)
    account_number = serializers.CharField(required=False, allow_blank=True)
    account_holder_name = serializers.CharField(required=False, allow_blank=True)
    
    # 청구 주소
    billing_country = serializers.CharField(default='KR')
    billing_city = serializers.CharField(required=False, allow_blank=True)
    billing_address = serializers.CharField(required=False, allow_blank=True)
    billing_postal_code = serializers.CharField(required=False, allow_blank=True)
    
    # 사용자 정의 제한사항 (슈퍼 관리자용)
    target_user_id = serializers.CharField(required=False, allow_blank=True)
    custom_max_projects = serializers.IntegerField(required=False, min_value=1)
    custom_max_evaluators = serializers.IntegerField(required=False, min_value=1)
    custom_ai_enabled = serializers.BooleanField(required=False)
    
    def validate(self, data):
        payment_method = data.get('payment_method_type')
        
        # 카드 결제 필수 필드 확인
        if payment_method == 'card':
            required_fields = ['card_number', 'card_expiry_month', 'card_expiry_year', 'card_cvv', 'card_holder_name']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: '카드 결제 시 필수 입력 항목입니다.'})
        
        # 계좌이체 필수 필드 확인
        elif payment_method == 'bank_transfer':
            required_fields = ['bank_name', 'account_number', 'account_holder_name']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: '계좌이체 시 필수 입력 항목입니다.'})
        
        # 플랜 존재 확인
        plan_id = data.get('plan_id')
        if not SubscriptionPlan.objects.filter(plan_id=plan_id, is_active=True).exists():
            raise serializers.ValidationError({'plan_id': '존재하지 않거나 비활성화된 플랜입니다.'})
        
        # 쿠폰 코드 유효성 확인
        coupon_code = data.get('coupon_code')
        if coupon_code:
            try:
                coupon = CouponCode.objects.get(code=coupon_code, is_active=True)
                if not coupon.is_valid:
                    raise serializers.ValidationError({'coupon_code': '유효하지 않은 쿠폰 코드입니다.'})
            except CouponCode.DoesNotExist:
                raise serializers.ValidationError({'coupon_code': '존재하지 않는 쿠폰 코드입니다.'})
        
        return data


class SubscriptionStatsSerializer(serializers.Serializer):
    """구독 통계 시리얼라이저"""
    
    total_active_subscriptions = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    plan_distribution = serializers.DictField()
    monthly_growth = serializers.FloatField()
    revenue_by_month = serializers.ListField()
    user_acquisition_rate = serializers.FloatField()
    churn_rate = serializers.FloatField()
    average_revenue_per_user = serializers.DecimalField(max_digits=10, decimal_places=2)


class LimitCheckSerializer(serializers.Serializer):
    """제한사항 확인 시리얼라이저"""
    
    resource_type = serializers.ChoiceField(
        choices=['projects', 'evaluators', 'surveys', 'storage', 'ai_requests']
    )
    required_amount = serializers.IntegerField(default=1, min_value=1)
    
    def validate_resource_type(self, value):
        valid_resources = ['projects', 'evaluators', 'surveys', 'storage', 'ai_requests']
        if value not in valid_resources:
            raise serializers.ValidationError(f'유효하지 않은 리소스 타입입니다. 가능한 값: {valid_resources}')
        return value