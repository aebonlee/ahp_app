"""
Views for Evaluation API
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction, models
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Evaluation, PairwiseComparison, EvaluationInvitation, EvaluationSession, DemographicSurvey
from .serializers import (
    EvaluationSerializer, EvaluationCreateSerializer, PairwiseComparisonSerializer,
    EvaluationInvitationSerializer, EvaluationProgressSerializer, EvaluatorDashboardSerializer,
    DemographicSurveySerializer, DemographicSurveyCreateSerializer, DemographicSurveyListSerializer
)
from apps.common.permissions import IsOwnerOrReadOnly, IsEvaluatorOrProjectMember

User = get_user_model()


class EvaluationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing evaluations"""
    
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated, IsEvaluatorOrProjectMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'project', 'evaluator']
    search_fields = ['title', 'project__title']
    ordering_fields = ['created_at', 'updated_at', 'progress']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter evaluations based on user permissions"""
        user = self.request.user
        if user.is_superuser:
            return Evaluation.objects.all()
            
        # Users can see evaluations they are assigned to or projects they own/collaborate on
        return Evaluation.objects.filter(
            models.Q(evaluator=user) |
            models.Q(project__owner=user) |
            models.Q(project__collaborators=user)
        ).distinct().select_related('project', 'evaluator')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return EvaluationCreateSerializer
        elif self.action == 'update_progress':
            return EvaluationProgressSerializer
        return EvaluationSerializer
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start an evaluation"""
        evaluation = self.get_object()
        
        if evaluation.evaluator != request.user:
            return Response(
                {'error': 'Only the assigned evaluator can start this evaluation'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if evaluation.status != 'pending':
            return Response(
                {'error': 'Evaluation is not in pending status'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        evaluation.start_evaluation()
        
        # Create evaluation session
        EvaluationSession.objects.create(
            evaluation=evaluation,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({'message': 'Evaluation started successfully'})
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete an evaluation"""
        evaluation = self.get_object()
        
        if evaluation.evaluator != request.user:
            return Response(
                {'error': 'Only the assigned evaluator can complete this evaluation'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if evaluation.status != 'in_progress':
            return Response(
                {'error': 'Evaluation is not in progress'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if all comparisons are completed
        total_comparisons = evaluation.pairwise_comparisons.count()
        completed_comparisons = evaluation.pairwise_comparisons.exclude(value=1.0).count()
        
        if completed_comparisons < total_comparisons:
            return Response(
                {'error': 'Not all pairwise comparisons are completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        evaluation.complete_evaluation()
        evaluation.calculate_consistency_ratio()
        
        return Response({
            'message': 'Evaluation completed successfully',
            'consistency_ratio': evaluation.consistency_ratio,
            'is_consistent': evaluation.is_consistent
        })
    
    @action(detail=True, methods=['patch'])
    def update_progress(self, request, pk=None):
        """Update evaluation progress with comparison data"""
        evaluation = self.get_object()
        
        if evaluation.evaluator != request.user:
            return Response(
                {'error': 'Only the assigned evaluator can update this evaluation'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = self.get_serializer(evaluation, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        evaluation = serializer.save()
        
        return Response({
            'message': 'Progress updated successfully',
            'progress': evaluation.progress,
            'consistency_ratio': evaluation.consistency_ratio
        })
    
    @action(detail=True, methods=['get'])
    def comparisons(self, request, pk=None):
        """Get pairwise comparisons for an evaluation"""
        evaluation = self.get_object()
        comparisons = evaluation.pairwise_comparisons.select_related('criteria_a', 'criteria_b')
        serializer = PairwiseComparisonSerializer(comparisons, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get evaluator dashboard data"""
        serializer = EvaluatorDashboardSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class PairwiseComparisonViewSet(viewsets.ModelViewSet):
    """ViewSet for managing pairwise comparisons"""
    
    serializer_class = PairwiseComparisonSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['evaluation', 'criteria_a', 'criteria_b']
    ordering = ['criteria_a__order', 'criteria_b__order']
    
    def get_queryset(self):
        """Filter comparisons based on user permissions"""
        user = self.request.user
        return PairwiseComparison.objects.filter(
            models.Q(evaluation__evaluator=user) |
            models.Q(evaluation__project__owner=user) |
            models.Q(evaluation__project__collaborators=user)
        ).distinct().select_related('evaluation', 'criteria_a', 'criteria_b')
    
    def perform_update(self, serializer):
        """Update comparison and track timing"""
        instance = serializer.save()
        
        # Update evaluation progress
        evaluation = instance.evaluation
        total_comparisons = evaluation.pairwise_comparisons.count()
        completed_comparisons = evaluation.pairwise_comparisons.exclude(value=1.0).count()
        
        if total_comparisons > 0:
            evaluation.progress = (completed_comparisons / total_comparisons) * 100
            evaluation.save()


class EvaluationInvitationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing evaluation invitations"""
    
    serializer_class = EvaluationInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'project']
    search_fields = ['evaluator__username', 'evaluator__email']
    ordering = ['-sent_at']
    
    def get_queryset(self):
        """Filter invitations based on user permissions"""
        user = self.request.user
        return EvaluationInvitation.objects.filter(
            models.Q(evaluator=user) |  # Invitations for the user
            models.Q(invited_by=user) |  # Invitations sent by the user
            models.Q(project__owner=user) |  # User owns the project
            models.Q(project__collaborators=user)  # User collaborates on the project
        ).distinct().select_related('project', 'evaluator', 'invited_by')
    
    def perform_create(self, serializer):
        """Create invitation and set inviter"""
        serializer.save(invited_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept an evaluation invitation"""
        invitation = self.get_object()
        
        if invitation.evaluator != request.user:
            return Response(
                {'error': 'Only the invited evaluator can accept this invitation'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if invitation.status != 'pending':
            return Response(
                {'error': 'Invitation is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        evaluation = invitation.accept()
        if evaluation:
            return Response({
                'message': 'Invitation accepted successfully',
                'evaluation_id': evaluation.id
            })
        else:
            return Response(
                {'error': 'Failed to create evaluation'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """Decline an evaluation invitation"""
        invitation = self.get_object()
        
        if invitation.evaluator != request.user:
            return Response(
                {'error': 'Only the invited evaluator can decline this invitation'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if invitation.status != 'pending':
            return Response(
                {'error': 'Invitation is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        invitation.decline()
        return Response({'message': 'Invitation declined successfully'})
    
    @action(detail=False, methods=['get'])
    def by_token(self, request):
        """Get invitation by token (for anonymous access)"""
        token = request.query_params.get('token')
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        invitation = get_object_or_404(EvaluationInvitation, token=token)
        serializer = self.get_serializer(invitation)
        return Response(serializer.data)


class EvaluatorOnlyPermission(permissions.BasePermission):
    """Permission for evaluator-only actions"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_evaluator


@action(detail=False, methods=['get'], permission_classes=[EvaluatorOnlyPermission])
def evaluator_dashboard(request):
    """Dedicated endpoint for evaluator dashboard"""
    serializer = EvaluatorDashboardSerializer(request.user, context={'request': request})
    return Response(serializer.data)


@action(detail=False, methods=['get'])
def evaluation_statistics(request):
    """Get evaluation statistics"""
    user = request.user
    
    stats = {
        'total_evaluations': Evaluation.objects.filter(evaluator=user).count(),
        'completed_evaluations': Evaluation.objects.filter(
            evaluator=user, status='completed'
        ).count(),
        'active_evaluations': Evaluation.objects.filter(
            evaluator=user, status__in=['pending', 'in_progress']
        ).count(),
        'average_consistency': Evaluation.objects.filter(
            evaluator=user, consistency_ratio__isnull=False
        ).aggregate(
            avg_consistency=models.Avg('consistency_ratio')
        )['avg_consistency'] or 0,
        'projects_participated': Evaluation.objects.filter(
            evaluator=user
        ).values('project').distinct().count()
    }
    
    return Response(stats)


class DemographicSurveyViewSet(viewsets.ModelViewSet):
    """인구통계학적 설문조사 ViewSet"""
    
    serializer_class = DemographicSurveySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['project', 'is_completed', 'evaluator']
    search_fields = ['evaluator__username', 'evaluator__full_name', 'project__title']
    ordering_fields = ['created_at', 'updated_at', 'completion_timestamp']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """사용자별 권한에 따른 설문조사 필터링"""
        user = self.request.user
        
        if user.is_superuser:
            return DemographicSurvey.objects.all()
            
        # 프로젝트 관리자는 자신의 프로젝트 설문조사 확인 가능
        if user.is_project_manager:
            return DemographicSurvey.objects.filter(
                models.Q(evaluator=user) |
                models.Q(project__owner=user) |
                models.Q(project__collaborators=user)
            ).distinct().select_related('evaluator', 'project')
        
        # 일반 사용자는 자신의 설문조사만 확인 가능
        return DemographicSurvey.objects.filter(
            evaluator=user
        ).select_related('project')
    
    def get_serializer_class(self):
        """액션에 따른 적절한 시리얼라이저 반환"""
        if self.action == 'create':
            return DemographicSurveyCreateSerializer
        elif self.action == 'list':
            return DemographicSurveyListSerializer
        return DemographicSurveySerializer
    
    def perform_create(self, serializer):
        """설문조사 생성 시 evaluator 자동 설정"""
        serializer.save(evaluator=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_survey(self, request):
        """현재 사용자의 설문조사 조회"""
        project_id = request.query_params.get('project')
        
        if project_id:
            survey = DemographicSurvey.objects.filter(
                evaluator=request.user,
                project_id=project_id
            ).first()
        else:
            # 프로젝트가 지정되지 않은 경우 가장 최근 설문조사
            survey = DemographicSurvey.objects.filter(
                evaluator=request.user
            ).first()
            
        if survey:
            serializer = self.get_serializer(survey)
            return Response(serializer.data)
        else:
            return Response(
                {'detail': '설문조사를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def submit_survey(self, request):
        """설문조사 제출"""
        project_id = request.data.get('project')
        
        # 기존 설문조사가 있는지 확인
        existing_survey = None
        if project_id:
            existing_survey = DemographicSurvey.objects.filter(
                evaluator=request.user,
                project_id=project_id
            ).first()
        
        if existing_survey:
            # 기존 설문조사 업데이트
            serializer = DemographicSurveyCreateSerializer(
                existing_survey, 
                data=request.data, 
                context={'request': request}
            )
        else:
            # 새 설문조사 생성
            serializer = DemographicSurveyCreateSerializer(
                data=request.data, 
                context={'request': request}
            )
        
        if serializer.is_valid():
            survey = serializer.save(evaluator=request.user)
            
            response_serializer = DemographicSurveySerializer(survey)
            return Response(
                {
                    'message': '설문조사가 성공적으로 저장되었습니다.',
                    'data': response_serializer.data
                },
                status=status.HTTP_201_CREATED if not existing_survey else status.HTTP_200_OK
            )
        else:
            return Response(
                {
                    'message': '설문조사 저장에 실패했습니다.',
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """설문조사 통계"""
        user = request.user
        
        # 프로젝트별 통계 (프로젝트 관리자인 경우)
        if user.is_project_manager or user.is_superuser:
            project_stats = []
            
            # 사용자가 관리하는 프로젝트들
            projects = []
            if user.is_superuser:
                from apps.projects.models import Project
                projects = Project.objects.all()
            else:
                projects = user.owned_projects.all() | user.collaborating_projects.all()
            
            for project in projects.distinct():
                surveys = DemographicSurvey.objects.filter(project=project)
                project_stats.append({
                    'project_id': project.id,
                    'project_title': project.title,
                    'total_surveys': surveys.count(),
                    'completed_surveys': surveys.filter(is_completed=True).count(),
                    'completion_rate': (
                        surveys.filter(is_completed=True).count() / surveys.count() * 100
                        if surveys.count() > 0 else 0
                    )
                })
            
            return Response({
                'project_statistics': project_stats,
                'overall_stats': {
                    'total_surveys': DemographicSurvey.objects.count(),
                    'completed_surveys': DemographicSurvey.objects.filter(is_completed=True).count(),
                    'total_evaluators': DemographicSurvey.objects.values('evaluator').distinct().count()
                }
            })
        else:
            # 일반 사용자는 자신의 설문조사 통계만
            user_surveys = DemographicSurvey.objects.filter(evaluator=user)
            return Response({
                'my_surveys': user_surveys.count(),
                'completed_surveys': user_surveys.filter(is_completed=True).count(),
                'completion_rate': (
                    user_surveys.filter(is_completed=True).count() / user_surveys.count() * 100
                    if user_surveys.count() > 0 else 0
                )
            })