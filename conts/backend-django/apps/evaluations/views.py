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

from .models import Evaluation, PairwiseComparison, EvaluationInvitation, EvaluationSession
from .serializers import (
    EvaluationSerializer, EvaluationCreateSerializer, PairwiseComparisonSerializer,
    EvaluationInvitationSerializer, EvaluationProgressSerializer, EvaluatorDashboardSerializer
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