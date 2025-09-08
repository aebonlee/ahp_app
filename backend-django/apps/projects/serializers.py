"""
Serializers for Project API
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember, Criteria, ProjectTemplate

User = get_user_model()


class CriteriaSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    full_path = serializers.CharField(read_only=True)
    
    class Meta:
        model = Criteria
        fields = [
            'id', 'name', 'description', 'type', 'parent', 'order', 'level',
            'weight', 'is_active', 'created_at', 'updated_at', 'children', 'full_path'
        ]
        
    def get_children(self, obj):
        """Get child criteria"""
        children = obj.children.filter(is_active=True).order_by('order')
        return CriteriaSerializer(children, many=True).data


class ProjectMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ProjectMember
        fields = [
            'id', 'user', 'user_name', 'user_username', 'user_email', 'role',
            'can_edit_structure', 'can_manage_evaluators', 'can_view_results',
            'joined_at', 'invited_by'
        ]
        read_only_fields = ['joined_at']


class ProjectSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    criteria = CriteriaSerializer(many=True, read_only=True)
    members = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    evaluation_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'objective', 'owner', 'owner_name',
            'status', 'visibility', 'consistency_ratio_threshold', 'created_at',
            'updated_at', 'deadline', 'tags', 'settings', 'criteria', 'members',
            'member_count', 'evaluation_count', 'is_active'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_active']
        
    def get_member_count(self, obj):
        """Get total number of project members"""
        return obj.collaborators.count()
        
    def get_evaluation_count(self, obj):
        """Get number of evaluations for this project"""
        return obj.evaluations.count()


class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating projects"""
    
    class Meta:
        model = Project
        fields = [
            'title', 'description', 'objective', 'visibility',
            'consistency_ratio_threshold', 'deadline', 'tags', 'settings'
        ]
        
    def create(self, validated_data):
        """Create project and add owner as member"""
        validated_data['owner'] = self.context['request'].user
        project = super().create(validated_data)
        
        # Add owner as project member with full permissions
        ProjectMember.objects.create(
            project=project,
            user=project.owner,
            role='owner',
            can_edit_structure=True,
            can_manage_evaluators=True,
            can_view_results=True
        )
        
        return project


class ProjectTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ProjectTemplate
        fields = [
            'id', 'name', 'description', 'category', 'structure',
            'default_settings', 'created_by', 'created_by_name', 'is_public',
            'usage_count', 'created_at'
        ]
        read_only_fields = ['created_by', 'usage_count', 'created_at']


class ProjectSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for project lists"""
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'owner', 'owner_name', 'status',
            'created_at', 'updated_at', 'deadline', 'tags'
        ]