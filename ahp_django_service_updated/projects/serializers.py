from rest_framework import serializers
from .models import (
    Project, Criteria, Alternative, Evaluator, 
    Comparison, ComparisonMatrix, Result, SensitivityAnalysis
)
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class CriteriaSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Criteria
        fields = ['id', 'project', 'name', 'description', 'parent', 'level', 
                  'order_index', 'weight', 'local_weight', 'children', 'created_at']
        read_only_fields = ['created_at']
    
    def get_children(self, obj):
        if obj.children.exists():
            return CriteriaSerializer(obj.children.all(), many=True).data
        return []


class AlternativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alternative
        fields = ['id', 'project', 'name', 'description', 'order_index', 
                  'final_score', 'rank', 'created_at']
        read_only_fields = ['created_at', 'final_score', 'rank']


class EvaluatorSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Evaluator
        fields = ['id', 'project', 'user', 'user_details', 'name', 'email', 'role', 
                  'access_key', 'is_invited', 'invitation_sent_at', 'evaluation_started_at',
                  'evaluation_completed_at', 'progress_percentage', 'created_at']
        read_only_fields = ['created_at', 'access_key']
    
    def create(self, validated_data):
        # Auto-generate access key
        import uuid
        validated_data['access_key'] = str(uuid.uuid4())[:20]
        return super().create(validated_data)


class ComparisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comparison
        fields = ['id', 'project', 'evaluator', 'criteria', 'left_item_id', 'right_item_id',
                  'left_item_name', 'right_item_name', 'value', 'is_criteria_comparison',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ComparisonMatrixSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComparisonMatrix
        fields = ['id', 'project', 'evaluator', 'criteria', 'matrix_type', 'matrix_data',
                  'consistency_ratio', 'is_consistent', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ResultSerializer(serializers.ModelSerializer):
    alternative_name = serializers.CharField(source='alternative.name', read_only=True)
    evaluator_name = serializers.CharField(source='evaluator.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Result
        fields = ['id', 'project', 'evaluator', 'evaluator_name', 'alternative', 
                  'alternative_name', 'score', 'rank', 'is_group_result', 
                  'criteria_scores', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class SensitivityAnalysisSerializer(serializers.ModelSerializer):
    criteria_name = serializers.CharField(source='criteria.name', read_only=True)
    
    class Meta:
        model = SensitivityAnalysis
        fields = ['id', 'project', 'criteria', 'criteria_name', 'original_weight',
                  'modified_weight', 'results_data', 'created_at']
        read_only_fields = ['created_at']


class ProjectSerializer(serializers.ModelSerializer):
    owner_details = UserSerializer(source='owner', read_only=True)
    criteria_count = serializers.SerializerMethodField()
    alternatives_count = serializers.SerializerMethodField()
    evaluators_count = serializers.SerializerMethodField()
    criteria = CriteriaSerializer(many=True, read_only=True)
    alternatives = AlternativeSerializer(many=True, read_only=True)
    evaluators = EvaluatorSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'objective', 'owner', 'owner_details',
                  'status', 'criteria_count', 'alternatives_count', 'evaluators_count',
                  'criteria', 'alternatives', 'evaluators', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_criteria_count(self, obj):
        return obj.criteria.count()
    
    def get_alternatives_count(self, obj):
        return obj.alternatives.count()
    
    def get_evaluators_count(self, obj):
        return obj.evaluators.count()