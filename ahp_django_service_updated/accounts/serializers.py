from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile, UserActivityLog


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['email_notifications', 'evaluation_reminders', 'project_updates',
                  'language', 'timezone', 'total_evaluations', 'total_projects_owned',
                  'total_projects_participated']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    project_count = serializers.SerializerMethodField()
    can_create_project = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                  'phone', 'organization', 'department', 'position', 'is_verified',
                  'can_create_projects', 'max_projects', 'profile', 'project_count',
                  'can_create_project', 'created_at', 'last_login']
        read_only_fields = ['id', 'created_at', 'last_login']
    
    def get_project_count(self, obj):
        return obj.get_project_count()
    
    def get_can_create_project(self, obj):
        return obj.can_create_new_project()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name',
                  'phone', 'organization', 'department', 'position', 'role']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "비밀번호가 일치하지 않습니다."})
        
        # 이메일 중복 확인
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "이미 사용 중인 이메일입니다."})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        
        # role이 없으면 기본값 설정
        if 'role' not in validated_data:
            validated_data['role'] = 'service_user'
        
        # service_admin과 service_user는 프로젝트 생성 권한 부여
        if validated_data['role'] in ['service_admin', 'service_user']:
            validated_data['can_create_projects'] = True
        
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserActivityLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserActivityLog
        fields = ['id', 'user', 'user_username', 'action', 'description',
                  'ip_address', 'user_agent', 'metadata', 'created_at']
        read_only_fields = ['created_at']


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "비밀번호가 일치하지 않습니다."})
        return attrs