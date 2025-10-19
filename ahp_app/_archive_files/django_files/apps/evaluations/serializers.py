"""
Serializers for Evaluation API
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models as db_models
from .models import (
    Evaluation, PairwiseComparison, EvaluationInvitation, 
    EvaluationSession, DemographicSurvey, BulkInvitation,
    EvaluationTemplate, EvaluationAccessLog, EmailDeliveryStatus
)
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
                avg_consistency=db_models.Avg('consistency_ratio')
            )['avg_consistency'] or 0,
            'total_projects': Evaluation.objects.filter(evaluator=user).values('project').distinct().count()
        }
        
        return {
            'active_evaluations': EvaluationSerializer(active_evals, many=True, context=self.context).data,
            'completed_evaluations': EvaluationSerializer(completed_evals, many=True, context=self.context).data,
            'pending_invitations': EvaluationInvitationSerializer(pending_invitations, many=True, context=self.context).data,
            'statistics': stats
        }


class DemographicSurveySerializer(serializers.ModelSerializer):
    """인구통계학적 설문조사 Serializer"""
    evaluator_name = serializers.CharField(source='evaluator.get_full_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    completion_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = DemographicSurvey
        fields = [
            'id', 'evaluator', 'evaluator_name', 'project', 'project_title',
            'age', 'gender', 'education', 'occupation', 'experience',
            'department', 'position', 'project_experience', 'decision_role',
            'additional_info', 'created_at', 'updated_at', 'is_completed',
            'completion_timestamp', 'completion_percentage'
        ]
        read_only_fields = ['created_at', 'updated_at', 'completion_timestamp']
        
    def create(self, validated_data):
        """설문조사 생성"""
        # evaluator는 요청한 사용자로 설정
        request = self.context.get('request')
        if request and request.user:
            validated_data['evaluator'] = request.user
            
        survey = super().create(validated_data)
        
        # 모든 필수 필드가 채워지면 자동으로 완료 처리
        if survey.completion_percentage >= 100:
            survey.mark_completed()
            
        return survey
        
    def update(self, instance, validated_data):
        """설문조사 업데이트"""
        survey = super().update(instance, validated_data)
        
        # 업데이트 후 완성도 확인
        if survey.completion_percentage >= 100 and not survey.is_completed:
            survey.mark_completed()
            
        return survey


class DemographicSurveyCreateSerializer(serializers.ModelSerializer):
    """설문조사 생성용 간단한 Serializer"""
    
    class Meta:
        model = DemographicSurvey
        fields = [
            'age', 'gender', 'education', 'occupation', 'experience',
            'department', 'position', 'project_experience', 'decision_role',
            'additional_info', 'project'
        ]
        
    def validate(self, data):
        """데이터 유효성 검사"""
        # 최소한 필수 정보는 입력되어야 함
        required_fields = ['age', 'gender', 'education', 'occupation']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if len(missing_fields) > 2:  # 절반 이상은 입력되어야 함
            raise serializers.ValidationError(
                f"다음 필수 정보를 입력해주세요: {', '.join(missing_fields)}"
            )
            
        return data


class DemographicSurveyListSerializer(serializers.ModelSerializer):
    """설문조사 목록용 Serializer"""
    evaluator_info = serializers.SerializerMethodField()
    project_info = serializers.SerializerMethodField()
    
    class Meta:
        model = DemographicSurvey
        fields = [
            'id', 'evaluator_info', 'project_info', 'completion_percentage',
            'is_completed', 'created_at', 'updated_at'
        ]
        
    def get_evaluator_info(self, obj):
        """평가자 정보"""
        return {
            'id': obj.evaluator.id,
            'username': obj.evaluator.username,
            'full_name': obj.evaluator.get_full_name(),
            'organization': getattr(obj.evaluator, 'organization', ''),
            'department': getattr(obj.evaluator, 'department', '')
        }
        
    def get_project_info(self, obj):
        """프로젝트 정보"""
        if obj.project:
            return {
                'id': obj.project.id,
                'title': obj.project.title,
                'status': obj.project.status
            }
        return None


class BulkInvitationSerializer(serializers.ModelSerializer):
    """대량 초대 Serializer"""
    project_title = serializers.CharField(source='project.title', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    success_rate = serializers.ReadOnlyField()
    processing_time = serializers.ReadOnlyField()
    
    class Meta:
        model = BulkInvitation
        fields = [
            'id', 'project', 'project_title', 'created_by', 'created_by_name',
            'total_count', 'sent_count', 'failed_count', 'accepted_count',
            'status', 'celery_task_id', 'created_at', 'started_at', 'completed_at',
            'results', 'error_log', 'success_rate', 'processing_time'
        ]
        read_only_fields = [
            'celery_task_id', 'started_at', 'completed_at', 'results', 'error_log'
        ]


class BulkInvitationCreateSerializer(serializers.Serializer):
    """대량 초대 생성 Serializer"""
    project_id = serializers.IntegerField()
    evaluator_emails = serializers.ListField(
        child=serializers.EmailField(),
        allow_empty=False
    )
    template_id = serializers.IntegerField(required=False)
    custom_message = serializers.CharField(required=False, allow_blank=True)
    expiry_days = serializers.IntegerField(default=30, min_value=1, max_value=365)
    
    def validate_evaluator_emails(self, value):
        """이메일 유효성 검사"""
        if len(value) > 1000:
            raise serializers.ValidationError("최대 1000명까지 초대할 수 있습니다.")
        
        # 중복 이메일 제거
        unique_emails = list(set(value))
        if len(unique_emails) < len(value):
            self.context['duplicate_count'] = len(value) - len(unique_emails)
            
        return unique_emails
    
    def validate_project_id(self, value):
        """프로젝트 유효성 검사"""
        from apps.projects.models import Project
        try:
            project = Project.objects.get(id=value)
            request = self.context.get('request')
            if request and project.owner != request.user:
                raise serializers.ValidationError("프로젝트 소유자만 초대할 수 있습니다.")
        except Project.DoesNotExist:
            raise serializers.ValidationError("프로젝트를 찾을 수 없습니다.")
        return value


class EvaluationTemplateSerializer(serializers.ModelSerializer):
    """평가 템플릿 Serializer"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = EvaluationTemplate
        fields = [
            'id', 'name', 'description', 'instructions',
            'email_subject', 'email_body', 'reminder_subject', 'reminder_body',
            'auto_reminder', 'reminder_days', 'expiry_days',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
            'is_default', 'is_active'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        """템플릿 생성"""
        request = self.context.get('request')
        if request and request.user:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class EvaluationAccessLogSerializer(serializers.ModelSerializer):
    """평가 접근 로그 Serializer"""
    evaluation_info = serializers.SerializerMethodField()
    
    class Meta:
        model = EvaluationAccessLog
        fields = [
            'id', 'evaluation', 'evaluation_info', 'action', 'timestamp',
            'ip_address', 'user_agent', 'metadata'
        ]
        read_only_fields = ['timestamp']
    
    def get_evaluation_info(self, obj):
        """평가 정보"""
        return {
            'id': str(obj.evaluation.id),
            'project_title': obj.evaluation.project.title,
            'evaluator_name': obj.evaluation.evaluator.get_full_name()
        }


class EmailDeliveryStatusSerializer(serializers.ModelSerializer):
    """이메일 발송 상태 Serializer"""
    evaluator_email = serializers.CharField(source='invitation.evaluator.email', read_only=True)
    evaluator_name = serializers.CharField(source='invitation.evaluator.get_full_name', read_only=True)
    
    class Meta:
        model = EmailDeliveryStatus
        fields = [
            'id', 'invitation', 'bulk_invitation', 'evaluator_email', 'evaluator_name',
            'status', 'sent_at', 'delivered_at', 'opened_at', 'clicked_at',
            'error_message', 'retry_count', 'metadata'
        ]
        read_only_fields = [
            'sent_at', 'delivered_at', 'opened_at', 'clicked_at'
        ]


class EvaluatorAssignmentProgressSerializer(serializers.Serializer):
    """평가자 배정 진행률 Serializer"""
    project_id = serializers.IntegerField()
    total_evaluators = serializers.IntegerField()
    completed = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    pending = serializers.IntegerField()
    overall_progress = serializers.FloatField()
    evaluators = serializers.ListField(child=serializers.DictField())
    
    def to_representation(self, instance):
        """진행률 데이터 표현"""
        project = instance
        evaluations = Evaluation.objects.filter(project=project)
        
        total = evaluations.count()
        completed = evaluations.filter(status='completed').count()
        in_progress = evaluations.filter(status='in_progress').count()
        pending = evaluations.filter(status='pending').count()
        
        evaluator_progress = []
        for eval in evaluations.select_related('evaluator'):
            evaluator_progress.append({
                'evaluator_id': eval.evaluator.id,
                'evaluator_name': eval.evaluator.get_full_name(),
                'evaluator_email': eval.evaluator.email,
                'status': eval.status,
                'progress': eval.progress,
                'consistency_ratio': eval.consistency_ratio,
                'started_at': eval.started_at.isoformat() if eval.started_at else None,
                'completed_at': eval.completed_at.isoformat() if eval.completed_at else None
            })
        
        return {
            'project_id': project.id,
            'total_evaluators': total,
            'completed': completed,
            'in_progress': in_progress,
            'pending': pending,
            'overall_progress': (completed / total * 100) if total > 0 else 0,
            'evaluators': evaluator_progress
        }