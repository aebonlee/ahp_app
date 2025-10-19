"""
Django REST Framework Serializers for Super Admin
API data serialization for user management, payments, and projects
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (
    CustomUser, PaymentPlan, PaymentTransaction, 
    AHPProject, ProjectEvaluator, SystemSettings, ActivityLog,
    SystemBackup, SecurityLog, AccessControl, DataMigration
)


class CustomUserSerializer(serializers.ModelSerializer):
    """사용자 정보 직렬화"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    full_name = serializers.SerializerMethodField()
    subscription_status = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'user_type', 'phone', 'organization', 'department', 'position', 'bio',
            'subscription_tier', 'subscription_start', 'subscription_end', 'subscription_status',
            'monthly_project_limit', 'monthly_evaluator_limit', 'storage_limit_mb',
            'is_verified', 'is_active', 'last_login', 'created_at',
            'password', 'password_confirm'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
            'last_login': {'read_only': True},
            'created_at': {'read_only': True},
        }
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email
    
    def get_subscription_status(self, obj):
        if obj.is_premium_user:
            return 'Premium'
        return 'Free'
    
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError("비밀번호가 일치하지 않습니다.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class CustomUserSummarySerializer(serializers.ModelSerializer):
    """간단한 사용자 정보 직렬화 (목록용)"""
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'user_type', 'is_active']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email


class PaymentPlanSerializer(serializers.ModelSerializer):
    """결제 플랜 직렬화"""
    
    display_price = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentPlan
        fields = [
            'id', 'name', 'tier', 'plan_type', 'price', 'display_price', 'currency',
            'discount_percent', 'project_limit', 'evaluator_limit', 'storage_limit_mb',
            'advanced_analytics', 'api_access', 'priority_support', 'features',
            'is_active', 'created_at'
        ]
    
    def get_display_price(self, obj):
        if obj.discount_percent > 0:
            discounted_price = obj.price * (1 - obj.discount_percent / 100)
            return f"{discounted_price:,.0f}원 (원가: {obj.price:,.0f}원)"
        return f"{obj.price:,.0f}원"
    
    def get_features(self, obj):
        features = []
        if obj.advanced_analytics:
            features.append('고급 분석')
        if obj.api_access:
            features.append('API 접근')
        if obj.priority_support:
            features.append('우선 지원')
        return features


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """결제 거래 직렬화"""
    
    user_info = CustomUserSummarySerializer(source='user', read_only=True)
    plan_info = serializers.SerializerMethodField()
    display_amount = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = PaymentTransaction
        fields = [
            'transaction_id', 'user_info', 'plan_info', 'amount', 'display_amount',
            'currency', 'payment_method', 'status', 'status_display',
            'external_transaction_id', 'created_at', 'processed_at',
            'notes', 'failure_reason'
        ]
    
    def get_plan_info(self, obj):
        return {
            'name': obj.plan.name,
            'tier': obj.plan.get_tier_display(),
            'type': obj.plan.get_plan_type_display()
        }
    
    def get_display_amount(self, obj):
        return f"{obj.amount:,.0f}원"


class ProjectEvaluatorSerializer(serializers.ModelSerializer):
    """프로젝트 평가자 직렬화"""
    
    evaluator_info = CustomUserSummarySerializer(source='evaluator', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ProjectEvaluator
        fields = [
            'id', 'evaluator_info', 'status', 'status_display',
            'invited_at', 'completed_at', 'evaluation_data'
        ]


class AHPProjectSerializer(serializers.ModelSerializer):
    """AHP 프로젝트 직렬화"""
    
    owner_info = CustomUserSummarySerializer(source='owner', read_only=True)
    evaluators_info = ProjectEvaluatorSerializer(
        source='projectevaluator_set', many=True, read_only=True
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    evaluator_count = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = AHPProject
        fields = [
            'id', 'title', 'description', 'owner_info', 'criteria', 'alternatives',
            'evaluation_matrix', 'final_weights', 'consistency_ratio',
            'evaluators_info', 'evaluator_count', 'completion_rate',
            'status', 'status_display', 'is_public', 'created_at', 'updated_at', 'deadline'
        ]
    
    def get_evaluator_count(self, obj):
        return obj.evaluators.count()
    
    def get_completion_rate(self, obj):
        total_evaluators = obj.evaluators.count()
        if total_evaluators == 0:
            return 0
        
        completed_evaluators = obj.projectevaluator_set.filter(status='completed').count()
        return round((completed_evaluators / total_evaluators) * 100, 1)


class AHPProjectSummarySerializer(serializers.ModelSerializer):
    """간단한 프로젝트 정보 직렬화 (목록용)"""
    
    owner_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    evaluator_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AHPProject
        fields = [
            'id', 'title', 'owner_name', 'status', 'status_display',
            'evaluator_count', 'is_public', 'created_at'
        ]
    
    def get_owner_name(self, obj):
        return obj.owner.get_full_name() or obj.owner.email
    
    def get_evaluator_count(self, obj):
        return obj.evaluators.count()


class SystemSettingsSerializer(serializers.ModelSerializer):
    """시스템 설정 직렬화"""
    
    class Meta:
        model = SystemSettings
        fields = ['id', 'key', 'value', 'description', 'created_at', 'updated_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    """활동 로그 직렬화"""
    
    user_info = CustomUserSummarySerializer(source='user', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user_info', 'action', 'description', 'level', 'level_display',
            'ip_address', 'user_agent', 'extra_data', 'timestamp'
        ]


class DashboardStatsSerializer(serializers.Serializer):
    """대시보드 통계 직렬화"""
    
    # 사용자 통계
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    premium_users = serializers.IntegerField()
    verified_users = serializers.IntegerField()
    user_growth_rate = serializers.FloatField(required=False)
    
    # 결제 통계
    monthly_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    pending_payments = serializers.IntegerField()
    revenue_growth_rate = serializers.FloatField(required=False)
    
    # 프로젝트 통계
    total_projects = serializers.IntegerField()
    active_projects = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    public_projects = serializers.IntegerField()
    project_growth_rate = serializers.FloatField(required=False)


class BulkUserActionSerializer(serializers.Serializer):
    """사용자 대량 작업 요청 직렬화"""
    
    ACTION_CHOICES = [
        ('activate', '활성화'),
        ('deactivate', '비활성화'),
        ('verify', '인증'),
        ('upgrade_premium', '프리미엄 업그레이드'),
        ('reset_password', '비밀번호 재설정'),
    ]
    
    user_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100
    )
    action = serializers.ChoiceField(choices=ACTION_CHOICES)
    reason = serializers.CharField(max_length=500, required=False)
    
    def validate_user_ids(self, value):
        """사용자 ID 유효성 검사"""
        existing_count = CustomUser.objects.filter(id__in=value).count()
        if existing_count != len(value):
            raise serializers.ValidationError(
                f"{len(value) - existing_count}개의 유효하지 않은 사용자 ID가 포함되어 있습니다."
            )
        return value


class UserSearchSerializer(serializers.Serializer):
    """사용자 검색 요청 직렬화"""
    
    search = serializers.CharField(max_length=200, required=False)
    user_type = serializers.ChoiceField(choices=CustomUser.USER_TYPES, required=False)
    subscription_tier = serializers.ChoiceField(choices=CustomUser.SUBSCRIPTION_TIERS, required=False)
    is_active = serializers.BooleanField(required=False)
    is_verified = serializers.BooleanField(required=False)
    date_from = serializers.DateTimeField(required=False)
    date_to = serializers.DateTimeField(required=False)
    
    def validate(self, data):
        if data.get('date_from') and data.get('date_to'):
            if data['date_from'] > data['date_to']:
                raise serializers.ValidationError("시작 날짜는 종료 날짜보다 이전이어야 합니다.")
        return data


class SystemBackupSerializer(serializers.ModelSerializer):
    """시스템 백업 직렬화"""
    
    created_by_info = CustomUserSummarySerializer(source='created_by', read_only=True)
    backup_type_display = serializers.CharField(source='get_backup_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    file_size_display = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemBackup
        fields = [
            'id', 'name', 'backup_type', 'backup_type_display', 
            'status', 'status_display', 'file_path', 'file_size', 'file_size_display',
            'created_by_info', 'started_at', 'completed_at', 'duration',
            'description', 'error_message'
        ]
    
    def get_file_size_display(self, obj):
        if not obj.file_size:
            return "N/A"
        
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"
    
    def get_duration(self, obj):
        if obj.started_at and obj.completed_at:
            duration = obj.completed_at - obj.started_at
            return str(duration).split('.')[0]  # Remove microseconds
        return None


class SecurityLogSerializer(serializers.ModelSerializer):
    """보안 로그 직렬화"""
    
    user_info = CustomUserSummarySerializer(source='user', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    threat_level_display = serializers.CharField(source='get_threat_level_display', read_only=True)
    resolved_by_info = CustomUserSummarySerializer(source='resolved_by', read_only=True)
    
    class Meta:
        model = SecurityLog
        fields = [
            'id', 'event_type', 'event_type_display', 'threat_level', 'threat_level_display',
            'description', 'user_info', 'ip_address', 'user_agent', 'extra_data',
            'timestamp', 'is_resolved', 'resolved_by_info', 'resolved_at'
        ]


class AccessControlSerializer(serializers.ModelSerializer):
    """접근 제어 직렬화"""
    
    created_by_info = CustomUserSummarySerializer(source='created_by', read_only=True)
    resource_type_display = serializers.CharField(source='get_resource_type_display', read_only=True)
    allowed_users_info = CustomUserSummarySerializer(source='allowed_users', many=True, read_only=True)
    
    class Meta:
        model = AccessControl
        fields = [
            'id', 'resource_name', 'resource_type', 'resource_type_display', 'resource_path',
            'required_user_types', 'allowed_users_info', 'is_active',
            'ip_whitelist', 'ip_blacklist', 'time_restrictions',
            'created_at', 'updated_at', 'created_by_info'
        ]


class DataMigrationSerializer(serializers.ModelSerializer):
    """데이터 마이그레이션 직렬화"""
    
    created_by_info = CustomUserSummarySerializer(source='created_by', read_only=True)
    migration_type_display = serializers.CharField(source='get_migration_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = DataMigration
        fields = [
            'id', 'name', 'migration_type', 'migration_type_display',
            'status', 'status_display', 'source_type', 'target_type',
            'source_config', 'target_config', 'total_records', 'processed_records',
            'success_records', 'failed_records', 'progress_percentage',
            'created_by_info', 'started_at', 'completed_at', 'duration',
            'log_messages', 'error_messages'
        ]
    
    def get_duration(self, obj):
        if obj.started_at and obj.completed_at:
            duration = obj.completed_at - obj.started_at
            return str(duration).split('.')[0]  # Remove microseconds
        return None