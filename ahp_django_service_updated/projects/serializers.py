from rest_framework import serializers
from .models import Project, Criteria, Alternative, Comparison


class CriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criteria
        fields = ['id', 'name', 'description', 'weight', 'parent', 'created_at']
        read_only_fields = ['created_at']


class AlternativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alternative
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['created_at']


class ComparisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comparison
        fields = ['id', 'criteria', 'left_item', 'right_item', 'value', 'created_at']
        read_only_fields = ['created_at']


class ProjectSerializer(serializers.ModelSerializer):
    criteria = CriteriaSerializer(many=True, read_only=True)
    alternatives = AlternativeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'criteria', 'alternatives', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']