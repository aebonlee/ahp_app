"""
Django REST Framework Serializers for AI Management
API 통신을 위한 직렬화기들
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    AIServicePlan,
    AIServiceSettings, 
    UserAIAccess,
    AIUsageLog,
    PromptTemplate,
    DevelopmentPromptLog
)

User = get_user_model()


class AIServicePlanSerializer(serializers.ModelSerializer):
    """AI 서비스 요금제 직렬화기"""
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AIServicePlan
        fields = [
            'id', 'name', 'display_name', 'monthly_cost', 
            'monthly_token_limit', 'daily_request_limit',
            'features', 'description', 'is_active',
            'user_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'user_count']
    
    def get_user_count(self, obj):
        """해당 요금제를 사용하는 사용자 수"""
        return obj.useraiaccess_set.count()


class AIServiceSettingsSerializer(serializers.ModelSerializer):
    """AI 서비스 설정 직렬화기"""
    provider_display = serializers.CharField(source='get_provider_display', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AIServiceSettings
        fields = [
            'id', 'name', 'provider', 'provider_display',
            'model_name', 'max_tokens', 'temperature',
            'hourly_limit', 'daily_limit', 'monthly_limit',
            'system_prompt', 'endpoint_url', 'is_active', 'is_default',
            'created_by', 'created_by_username', 'user_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_by', 'created_by_username', 'user_count',
            'created_at', 'updated_at', 'provider_display'
        ]
        # API 키는 보안상 직렬화에서 제외
    
    def get_user_count(self, obj):
        """해당 설정을 사용하는 사용자 수"""
        return obj.useraiaccess_set.count()


class AIServiceSettingsCreateSerializer(serializers.ModelSerializer):
    """AI 서비스 설정 생성용 직렬화기 (API 키 포함)"""
    api_key = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    class Meta:
        model = AIServiceSettings
        fields = [
            'name', 'provider', 'api_key', 'model_name', 
            'max_tokens', 'temperature', 'hourly_limit', 
            'daily_limit', 'monthly_limit', 'system_prompt', 
            'endpoint_url', 'is_active', 'is_default'
        ]
    
    def create(self, validated_data):
        """API 키를 암호화하여 저장"""
        api_key = validated_data.pop('api_key')
        instance = super().create(validated_data)
        instance.set_api_key(api_key)
        instance.save()
        return instance


class UserAIAccessSerializer(serializers.ModelSerializer):
    """사용자 AI 접근 권한 직렬화기"""
    user_info = serializers.SerializerMethodField()
    ai_plan_name = serializers.CharField(source='ai_plan.display_name', read_only=True)
    ai_settings_name = serializers.CharField(source='ai_settings.name', read_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True)
    usage_percentage = serializers.ReadOnlyField()
    is_over_limit = serializers.ReadOnlyField()
    
    class Meta:
        model = UserAIAccess
        fields = [
            'id', 'user', 'user_info', 'ai_plan', 'ai_plan_name',
            'ai_settings', 'ai_settings_name', 'tokens_used_today',
            'tokens_used_month', 'requests_today', 'requests_month',
            'last_reset_date', 'is_enabled', 'can_use_advanced_features',
            'can_export_conversations', 'usage_alert_threshold',
            'email_usage_alerts', 'assigned_by', 'assigned_by_username',
            'assigned_at', 'updated_at', 'expires_at', 'notes',
            'usage_percentage', 'is_over_limit'
        ]
        read_only_fields = [
            'assigned_by', 'assigned_by_username', 'assigned_at',
            'updated_at', 'usage_percentage', 'is_over_limit', 'user_info'
        ]
    
    def get_user_info(self, obj):
        """사용자 정보 반환"""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'full_name': obj.user.get_full_name() or obj.user.username
        }


class AIUsageLogSerializer(serializers.ModelSerializer):
    """AI 사용 로그 직렬화기"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    ai_settings_name = serializers.CharField(source='ai_settings.name', read_only=True)
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)
    
    class Meta:
        model = AIUsageLog
        fields = [
            'id', 'user', 'user_username', 'ai_settings', 'ai_settings_name',
            'request_type', 'request_type_display', 'tokens_used', 'cost',
            'response_time', 'user_rating', 'user_feedback',
            'ip_address', 'session_id', 'model_version', 'error_message',
            'created_at'
        ]
        read_only_fields = [
            'user_username', 'ai_settings_name', 'request_type_display', 'created_at'
        ]


class AIUsageLogCreateSerializer(serializers.ModelSerializer):
    """AI 사용 로그 생성용 직렬화기"""
    class Meta:
        model = AIUsageLog
        fields = [
            'user', 'ai_settings', 'request_type', 'prompt', 'response',
            'tokens_used', 'cost', 'response_time', 'ip_address',
            'user_agent', 'session_id', 'model_version', 'error_message'
        ]


class PromptTemplateSerializer(serializers.ModelSerializer):
    """AI 프롬프트 템플릿 직렬화기"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = PromptTemplate
        fields = [
            'id', 'name', 'category', 'category_display', 'description',
            'template', 'variables', 'usage_count', 'average_rating',
            'is_public', 'is_active', 'created_by', 'created_by_username',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'usage_count', 'average_rating', 'created_by', 'created_by_username',
            'created_at', 'updated_at', 'category_display'
        ]


class DevelopmentPromptLogSerializer(serializers.ModelSerializer):
    """개발 프롬프트 로그 직렬화기"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = DevelopmentPromptLog
        fields = [
            'id', 'user', 'user_username', 'session_id', 'context',
            'user_prompt', 'ai_response', 'file_saved', 'saved_filename',
            'created_at'
        ]
        read_only_fields = ['user_username', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    """사용자 정보 직렬화기"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    has_ai_access = serializers.SerializerMethodField()
    ai_plan_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'is_active', 'date_joined', 'has_ai_access',
            'ai_plan_name'
        ]
        read_only_fields = ['date_joined', 'full_name', 'has_ai_access', 'ai_plan_name']
    
    def get_has_ai_access(self, obj):
        """AI 접근 권한 여부"""
        return hasattr(obj, 'ai_access') and obj.ai_access.is_enabled
    
    def get_ai_plan_name(self, obj):
        """AI 요금제 이름"""
        if hasattr(obj, 'ai_access'):
            return obj.ai_access.ai_plan.display_name
        return None


# 통계용 직렬화기들
class AIUsageStatsSerializer(serializers.Serializer):
    """AI 사용량 통계 직렬화기"""
    total_requests = serializers.IntegerField()
    total_tokens = serializers.IntegerField()
    total_cost = serializers.DecimalField(max_digits=10, decimal_places=4)
    average_response_time = serializers.FloatField()
    unique_users = serializers.IntegerField()
    requests_by_type = serializers.DictField()
    daily_usage = serializers.ListField()


class UserUsageStatsSerializer(serializers.Serializer):
    """사용자별 사용량 통계 직렬화기"""
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    total_requests = serializers.IntegerField()
    total_tokens = serializers.IntegerField()
    usage_percentage = serializers.FloatField()
    plan_name = serializers.CharField()
    is_over_limit = serializers.BooleanField()