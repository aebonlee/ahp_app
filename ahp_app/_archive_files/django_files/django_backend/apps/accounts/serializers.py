"""
Serializers for Account API
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import UserProfile

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'avatar', 'bio', 'expertise_areas', 'research_interests',
            'publications', 'email_notifications', 'project_updates',
            'evaluation_reminders', 'created_at', 'updated_at'
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'organization', 'department', 'position', 'phone', 'is_evaluator',
            'is_project_manager', 'language', 'timezone', 'date_joined',
            'last_activity', 'profile', 'password'
        ]
        read_only_fields = ['id', 'date_joined', 'last_activity']
        
    def create(self, validated_data):
        """Create user with encrypted password"""
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user
    
    def update(self, instance, validated_data):
        """Update user, handling password separately"""
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 'first_name',
            'last_name', 'full_name', 'organization', 'department', 'position'
        ]
        
    def validate(self, data):
        """Validate password confirmation"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        """Create new user account"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Validate login credentials - supports both username and email login"""
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        # Require either username or email
        if not (username or email) or not password:
            raise serializers.ValidationError('Must include (username or email) and password')
        
        # Try to authenticate
        user = None
        
        # First try with username
        if username:
            user = authenticate(username=username, password=password)
        
        # If no user found and email provided, try finding user by email
        if not user and email:
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        # Check authentication result
        if user:
            if user.is_active:
                data['user'] = user
            else:
                raise serializers.ValidationError('User account is disabled')
        else:
            raise serializers.ValidationError('Invalid credentials')
        
        return data


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'avatar', 'bio', 'expertise_areas', 'research_interests',
            'publications', 'email_notifications', 'project_updates',
            'evaluation_reminders'
        ]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, data):
        """Validate password change"""
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return data
    
    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class UserSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for user lists"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'organization', 'is_evaluator']


class BasicUserSerializer(serializers.ModelSerializer):
    """Basic Django User Model Serializer for API"""
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser', 'date_joined',
            'last_login', 'password'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def create(self, validated_data):
        """Create user with encrypted password"""
        password = validated_data.pop('password', None)
        user = DjangoUser.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        """Update user"""
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class EvaluatorStatsSerializer(serializers.Serializer):
    """Serializer for evaluator statistics"""
    total_evaluations = serializers.IntegerField()
    completed_evaluations = serializers.IntegerField()
    active_evaluations = serializers.IntegerField()
    pending_invitations = serializers.IntegerField()
    average_consistency = serializers.FloatField()
    total_projects = serializers.IntegerField()
    recent_activity = serializers.ListField()
    
    def to_representation(self, user):
        """Build evaluator statistics"""
        from apps.evaluations.models import Evaluation, EvaluationInvitation
        
        evaluations = Evaluation.objects.filter(evaluator=user)
        
        return {
            'total_evaluations': evaluations.count(),
            'completed_evaluations': evaluations.filter(status='completed').count(),
            'active_evaluations': evaluations.filter(status__in=['pending', 'in_progress']).count(),
            'pending_invitations': EvaluationInvitation.objects.filter(
                evaluator=user, status='pending'
            ).count(),
            'average_consistency': evaluations.filter(
                consistency_ratio__isnull=False
            ).aggregate(
                avg=models.Avg('consistency_ratio')
            )['avg'] or 0.0,
            'total_projects': evaluations.values('project').distinct().count(),
            'recent_activity': []  # TODO: Implement recent activity tracking
        }