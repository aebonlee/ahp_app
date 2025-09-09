"""
Simple Service Serializers
"""
from rest_framework import serializers
from .models import SimpleProject, SimpleData


class SimpleProjectSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = SimpleProject
        fields = ['id', 'title', 'description', 'created_by', 'created_by_username', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']


class SimpleDataSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = SimpleData
        fields = ['id', 'project', 'project_title', 'key', 'value', 'created_at']
        read_only_fields = ['id', 'created_at']