"""
Serializers for Evaluation API
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Evaluation, PairwiseComparison, EvaluationInvitation, EvaluationSession
from apps.projects.serializers import ProjectSerializer, CriteriaSerializer

User = get_user_model()


class PairwiseComparisonSerializer(serializers.ModelSerializer):
    criteria_a_name = serializers.CharField(source='criteria_a.name', read_only=True)
    criteria_b_name = serializers.CharField(source='criteria_b.name', read_only=True)
    
    class Meta:
        model = PairwiseComparison
        fields = [
            'id', 'criteria_a', 'criteria_b', 'criteria_a_name', 'criteria_b_name',
            'value', 'comment', 'confidence', 'answered_at', 'time_spent'
        ]
        read_only_fields = ['answered_at']
        
    def validate(self, data):
        """Validate pairwise comparison data"""
        if data['criteria_a'] == data['criteria_b']:
            raise serializers.ValidationError("Cannot compare criteria with itself")
            
        if not (1/9 <= data['value'] <= 9):
            raise serializers.ValidationError("Comparison value must be between 1/9 and 9")
            
        return data


class EvaluationSessionSerializer(serializers.ModelSerializer):
    duration_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = EvaluationSession
        fields = [
            'id', 'started_at', 'ended_at', 'duration', 'duration_minutes',
            'page_views', 'interactions', 'user_agent', 'ip_address'
        ]
        read_only_fields = ['duration', 'ended_at']
        
    def get_duration_minutes(self, obj):
        """Get duration in minutes"""
        return round(obj.duration / 60, 2) if obj.duration else 0


class EvaluationSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    evaluator_name = serializers.CharField(source='evaluator.get_full_name', read_only=True)
    evaluator_username = serializers.CharField(source='evaluator.username', read_only=True)
    pairwise_comparisons = PairwiseComparisonSerializer(many=True, read_only=True)
    sessions = EvaluationSessionSerializer(many=True, read_only=True)
    total_comparisons = serializers.SerializerMethodField()
    completed_comparisons = serializers.SerializerMethodField()
    
    class Meta:
        model = Evaluation
        fields = [
            'id', 'project', 'project_title', 'evaluator', 'evaluator_name', 'evaluator_username',
            'title', 'instructions', 'status', 'progress', 'started_at', 'completed_at',
            'expires_at', 'consistency_ratio', 'is_consistent', 'created_at', 'updated_at',
            'metadata', 'pairwise_comparisons', 'sessions', 'total_comparisons', 
            'completed_comparisons'
        ]
        read_only_fields = [
            'consistency_ratio', 'is_consistent', 'created_at', 'updated_at'
        ]
        
    def get_total_comparisons(self, obj):
        """Calculate total number of required comparisons"""
        criteria_count = obj.project.criteria.filter(type='criteria').count()
        # n(n-1)/2 for pairwise comparisons
        return criteria_count * (criteria_count - 1) // 2 if criteria_count > 1 else 0
        
    def get_completed_comparisons(self, obj):
        """Get number of completed comparisons"""
        return obj.pairwise_comparisons.count()


class EvaluationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating evaluations"""
    
    class Meta:
        model = Evaluation
        fields = ['project', 'evaluator', 'title', 'instructions', 'expires_at']
        
    def create(self, validated_data):
        """Create evaluation and generate required comparisons"""
        evaluation = super().create(validated_data)
        
        # Generate pairwise comparison pairs
        criteria = evaluation.project.criteria.filter(type='criteria', is_active=True)
        comparisons = []
        
        for i, criteria_a in enumerate(criteria):
            for criteria_b in criteria[i+1:]:
                comparison = PairwiseComparison(
                    evaluation=evaluation,
                    criteria_a=criteria_a,
                    criteria_b=criteria_b,
                    value=1.0  # Default neutral value
                )
                comparisons.append(comparison)
                
        PairwiseComparison.objects.bulk_create(comparisons)
        return evaluation


class EvaluationInvitationSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    evaluator_name = serializers.CharField(source='evaluator.get_full_name', read_only=True)
    invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)
    invitation_url = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = EvaluationInvitation
        fields = [
            'id', 'project', 'project_title', 'evaluator', 'evaluator_name',
            'invited_by', 'invited_by_name', 'message', 'status', 'sent_at',
            'responded_at', 'expires_at', 'token', 'invitation_url', 'is_expired'
        ]
        read_only_fields = ['token', 'sent_at', 'responded_at']
        
    def get_invitation_url(self, obj):
        """Generate invitation URL"""
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/evaluations/invitation/{obj.token}/')
        return f'/evaluations/invitation/{obj.token}/'


class EvaluationProgressSerializer(serializers.Serializer):
    """Serializer for evaluation progress updates"""
    comparisons = PairwiseComparisonSerializer(many=True)
    auto_save = serializers.BooleanField(default=True)
    
    def update(self, instance, validated_data):
        """Update evaluation with comparison data"""
        comparisons_data = validated_data.get('comparisons', [])
        
        for comp_data in comparisons_data:
            comparison_id = comp_data.get('id')
            if comparison_id:
                try:
                    comparison = instance.pairwise_comparisons.get(id=comparison_id)
                    for field, value in comp_data.items():
                        if field not in ['id', 'criteria_a', 'criteria_b']:
                            setattr(comparison, field, value)
                    comparison.save()
                except PairwiseComparison.DoesNotExist:
                    pass
                    
        # Update evaluation progress
        total_comparisons = instance.pairwise_comparisons.count()
        completed_comparisons = instance.pairwise_comparisons.exclude(value=1.0).count()
        
        if total_comparisons > 0:
            instance.progress = (completed_comparisons / total_comparisons) * 100
            
        # Update status
        if instance.status == 'pending':
            instance.start_evaluation()
        elif instance.progress == 100 and instance.status == 'in_progress':
            instance.complete_evaluation()
            
        # Calculate consistency ratio
        instance.calculate_consistency_ratio()
        instance.save()
        
        return instance


class EvaluatorDashboardSerializer(serializers.Serializer):
    """Serializer for evaluator dashboard data"""
    active_evaluations = EvaluationSerializer(many=True, read_only=True)
    completed_evaluations = EvaluationSerializer(many=True, read_only=True)
    pending_invitations = EvaluationInvitationSerializer(many=True, read_only=True)
    statistics = serializers.DictField(read_only=True)
    
    def to_representation(self, instance):
        """Build dashboard data for evaluator"""
        user = instance
        
        active_evals = Evaluation.objects.filter(
            evaluator=user,
            status__in=['pending', 'in_progress']
        ).select_related('project')
        
        completed_evals = Evaluation.objects.filter(
            evaluator=user,
            status='completed'
        ).select_related('project')[:10]  # Latest 10
        
        pending_invitations = EvaluationInvitation.objects.filter(
            evaluator=user,
            status='pending'
        ).select_related('project', 'invited_by')
        
        # Statistics
        stats = {
            'total_evaluations': Evaluation.objects.filter(evaluator=user).count(),
            'completed_evaluations': completed_evals.count(),
            'active_evaluations': active_evals.count(),
            'pending_invitations': pending_invitations.count(),
            'average_consistency': completed_evals.aggregate(
                avg_consistency=models.Avg('consistency_ratio')
            )['avg_consistency'] or 0,
            'total_projects': Evaluation.objects.filter(evaluator=user).values('project').distinct().count()
        }
        
        return {
            'active_evaluations': EvaluationSerializer(active_evals, many=True, context=self.context).data,
            'completed_evaluations': EvaluationSerializer(completed_evals, many=True, context=self.context).data,
            'pending_invitations': EvaluationInvitationSerializer(pending_invitations, many=True, context=self.context).data,
            'statistics': stats
        }