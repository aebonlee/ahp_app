"""
Serializers for Workshop API
"""
from rest_framework import serializers
from .models import WorkshopSession, WorkshopParticipant


class WorkshopSessionSerializer(serializers.ModelSerializer):
    """Serializer for WorkshopSession model"""
    
    facilitator_name = serializers.CharField(source='facilitator.full_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    participants_count = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkshopSession
        fields = [
            'id', 'title', 'description', 'facilitator', 'facilitator_name',
            'project', 'project_title', 'max_participants', 'workshop_code',
            'scheduled_at', 'started_at', 'ended_at', 'duration_minutes',
            'status', 'is_anonymous', 'allow_late_join', 'consensus_method',
            'consensus_achieved', 'participants_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'workshop_code', 'created_at', 'updated_at']
    
    def get_participants_count(self, obj):
        """Get count of participants"""
        return obj.participants.count()


class WorkshopParticipantSerializer(serializers.ModelSerializer):
    """Serializer for WorkshopParticipant model"""
    
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    workshop_title = serializers.CharField(source='workshop.title', read_only=True)
    
    class Meta:
        model = WorkshopParticipant
        fields = [
            'id', 'workshop', 'workshop_title', 'user', 'user_name',
            'email', 'name', 'organization', 'department', 'role',
            'status', 'joined_at', 'left_at', 'completion_rate',
            'last_activity', 'created_at'
        ]
        read_only_fields = ['id', 'access_token', 'created_at']


class WorkshopSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating workshop sessions"""
    
    class Meta:
        model = WorkshopSession
        fields = [
            'title', 'description', 'project', 'max_participants',
            'scheduled_at', 'duration_minutes', 'is_anonymous',
            'allow_late_join', 'consensus_method'
        ]
    
    def create(self, validated_data):
        """Create workshop session and generate code"""
        workshop = super().create(validated_data)
        workshop.generate_workshop_code()
        return workshop


class WorkshopParticipantCreateSerializer(serializers.ModelSerializer):
    """Serializer for adding participants to workshops"""
    
    class Meta:
        model = WorkshopParticipant
        fields = ['workshop', 'user', 'email', 'name', 'organization', 'department', 'role']
    
    def validate(self, data):
        """Validate participant data"""
        if not data.get('user') and not data.get('email'):
            raise serializers.ValidationError("Either user or email must be provided")
        return data