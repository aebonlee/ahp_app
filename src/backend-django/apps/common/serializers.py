"""
Serializers for Common API
"""
from rest_framework import serializers
from .models import ActivityLog, SystemSettings, Notification


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for ActivityLog model"""
    
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'action', 'model_name',
            'object_id', 'object_repr', 'changes', 'timestamp',
            'ip_address', 'user_agent'
        ]
        read_only_fields = ['id', 'timestamp']


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for SystemSettings model"""
    
    class Meta:
        model = SystemSettings
        fields = [
            'id', 'key', 'value', 'description', 'category',
            'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'sender', 'sender_name', 'title',
            'message', 'type', 'is_read', 'read_at',
            'action_url', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']