"""
Serializers for Export API
"""
from rest_framework import serializers
from .models import ExportJob, ExportTemplate


class ExportJobSerializer(serializers.ModelSerializer):
    """Serializer for ExportJob model"""
    
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = ExportJob
        fields = [
            'id', 'project', 'project_title', 'export_type', 'format',
            'status', 'file_url', 'file_size', 'created_by', 'created_by_name',
            'created_at', 'completed_at', 'error_message'
        ]
        read_only_fields = [
            'id', 'file_url', 'file_size', 'status', 'created_at',
            'completed_at', 'error_message'
        ]


class ExportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for ExportTemplate model"""
    
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    usage_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ExportTemplate
        fields = [
            'id', 'name', 'description', 'template_type', 'config',
            'is_public', 'usage_count', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at']


class ExportJobCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating export jobs"""
    
    class Meta:
        model = ExportJob
        fields = ['project', 'export_type', 'format']


class ExportTemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating export templates"""
    
    class Meta:
        model = ExportTemplate
        fields = ['name', 'description', 'template_type', 'config', 'is_public']