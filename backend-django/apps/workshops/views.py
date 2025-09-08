"""
Views for Workshop API
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction, models

from .models import Workshop, WorkshopSession, WorkshopParticipant
from apps.common.permissions import IsOwnerOrReadOnly


class WorkshopViewSet(viewsets.ModelViewSet):
    """ViewSet for managing workshops"""
    
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Filter workshops based on user permissions"""
        user = self.request.user
        if user.is_superuser:
            return Workshop.objects.all()
        
        # Users can see workshops they organize or participate in
        return Workshop.objects.filter(
            models.Q(organizer=user) |
            models.Q(participants=user)
        ).distinct().select_related('organizer', 'project')
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        from .serializers import WorkshopSerializer
        return WorkshopSerializer
    
    def perform_create(self, serializer):
        """Set workshop organizer"""
        serializer.save(organizer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def start_session(self, request, pk=None):
        """Start a workshop session"""
        workshop = self.get_object()
        
        if workshop.organizer != request.user:
            return Response(
                {'error': 'Only the organizer can start the session'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if there's already an active session
        active_session = workshop.sessions.filter(
            status='active'
        ).first()
        
        if active_session:
            return Response(
                {'error': 'Workshop already has an active session'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create new session
        session = WorkshopSession.objects.create(
            workshop=workshop,
            started_by=request.user,
            status='active'
        )
        
        workshop.status = 'active'
        workshop.save()
        
        from .serializers import WorkshopSessionSerializer
        return Response(
            WorkshopSessionSerializer(session).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a workshop as participant"""
        workshop = self.get_object()
        
        if workshop.status != 'scheduled':
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
        participants = workshop.participants_detail.select_related('user')
        
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
            models.Q(workshop__organizer=user) |
            models.Q(workshop__participants=user)
        ).distinct().select_related('workshop', 'started_by')
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        from .serializers import WorkshopSessionSerializer
        return WorkshopSessionSerializer
    
    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        """End a workshop session"""
        session = self.get_object()
        
        if session.workshop.organizer != request.user:
            return Response(
                {'error': 'Only the organizer can end the session'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.status != 'active':
            return Response(
                {'error': 'Session is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.status = 'completed'
        session.ended_at = timezone.now()
        session.save()
        
        # Update workshop status if this was the last active session
        workshop = session.workshop
        if not workshop.sessions.filter(status='active').exists():
            workshop.status = 'completed'
            workshop.save()
        
        return Response({'message': 'Session ended successfully'})