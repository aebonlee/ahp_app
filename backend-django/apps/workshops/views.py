"""
Views for Workshop API
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction, models

from .models import WorkshopSession, WorkshopParticipant
from apps.common.permissions import IsOwnerOrReadOnly


class WorkshopViewSet(viewsets.ModelViewSet):
    """ViewSet for managing workshops"""
    
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Filter workshops based on user permissions"""
        user = self.request.user
        if user.is_superuser:
            return WorkshopSession.objects.all()
        
        # Users can see workshops they organize or participate in
        return WorkshopSession.objects.filter(
            models.Q(facilitator=user) |
            models.Q(participants__user=user)
        ).distinct().select_related('facilitator', 'project')
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        from .serializers import WorkshopSessionSerializer
        return WorkshopSessionSerializer
    
    def perform_create(self, serializer):
        """Set workshop facilitator"""
        serializer.save(facilitator=self.request.user)
    
    @action(detail=True, methods=['post'])
    def start_session(self, request, pk=None):
        """Start a workshop session"""
        workshop = self.get_object()
        
        if workshop.facilitator != request.user:
            return Response(
                {'error': 'Only the organizer can start the session'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if workshop is already active
        if workshop.status == 'in_progress':
            return Response(
                {'error': 'Workshop is already in progress'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Start the workshop session
        workshop.status = 'in_progress'
        workshop.started_at = timezone.now()
        workshop.save()
        
        from .serializers import WorkshopSessionSerializer
        return Response(
            WorkshopSessionSerializer(workshop).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a workshop as participant"""
        workshop = self.get_object()
        
        if workshop.status != 'preparation':
            return Response(
                {'error': 'Workshop is not available for joining'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is already a participant
        participant, created = WorkshopParticipant.objects.get_or_create(
            workshop=workshop,
            user=request.user,
            defaults={'joined_at': timezone.now()}
        )
        
        if not created:
            return Response(
                {'message': 'Already joined this workshop'},
                status=status.HTTP_200_OK
            )
        
        from .serializers import WorkshopParticipantSerializer
        return Response(
            WorkshopParticipantSerializer(participant).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        """Get workshop participants"""
        workshop = self.get_object()
        participants = workshop.participants.select_related('user')
        
        from .serializers import WorkshopParticipantSerializer
        serializer = WorkshopParticipantSerializer(participants, many=True)
        return Response(serializer.data)


class WorkshopSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing workshop sessions"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter sessions based on workshop permissions"""
        user = self.request.user
        return WorkshopSession.objects.filter(
            models.Q(facilitator=user) |
            models.Q(participants__user=user)
        ).distinct().select_related('facilitator', 'project')
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        from .serializers import WorkshopSessionSerializer
        return WorkshopSessionSerializer
    
    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        """End a workshop session"""
        session = self.get_object()
        
        if session.workshop.facilitator != request.user:
            return Response(
                {'error': 'Only the organizer can end the session'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.status != 'in_progress':
            return Response(
                {'error': 'Session is not in progress'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.status = 'completed'
        session.ended_at = timezone.now()
        session.save()
        
        return Response({'message': 'Session ended successfully'})