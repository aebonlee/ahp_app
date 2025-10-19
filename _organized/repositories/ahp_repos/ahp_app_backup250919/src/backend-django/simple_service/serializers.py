"""
Simple Service Serializers
"""
from rest_framework import serializers
from .models import SimpleProject, SimpleData, SimpleCriteria, SimpleComparison, SimpleResult


class SimpleProjectSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    criteria_count = serializers.SerializerMethodField()
    comparisons_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SimpleProject
        fields = ['id', 'title', 'description', 'status', 'created_by', 'created_by_username', 'created_at', 'updated_at', 'criteria_count', 'comparisons_count']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_criteria_count(self, obj):
        return obj.criteria.count()
    
    def get_comparisons_count(self, obj):
        return obj.comparisons.count()


class SimpleCriteriaSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    
    class Meta:
        model = SimpleCriteria
        fields = ['id', 'project', 'project_title', 'name', 'description', 'type', 'parent', 'parent_name', 'order', 'weight', 'created_at']
        read_only_fields = ['id', 'created_at', 'weight']


class SimpleComparisonSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    criteria_a_name = serializers.CharField(source='criteria_a.name', read_only=True)
    criteria_b_name = serializers.CharField(source='criteria_b.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = SimpleComparison
        fields = ['id', 'project', 'project_title', 'criteria_a', 'criteria_a_name', 'criteria_b', 'criteria_b_name', 'value', 'created_by', 'created_by_username', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']


class SimpleResultSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    criteria_name = serializers.CharField(source='criteria.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = SimpleResult
        fields = ['id', 'project', 'project_title', 'criteria', 'criteria_name', 'weight', 'rank', 'created_by', 'created_by_username', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']


class SimpleDataSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = SimpleData
        fields = ['id', 'project', 'project_title', 'key', 'value', 'created_at']
        read_only_fields = ['id', 'created_at']