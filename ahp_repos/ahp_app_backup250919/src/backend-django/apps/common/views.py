"""
Views for Common API
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import ActivityLog, SystemSettings, Notification


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing activity logs"""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter activity logs based on user permissions"""
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return ActivityLog.objects.all().order_by('-timestamp')
        
        # Regular users can only see their own activities
        return ActivityLog.objects.filter(user=user).order_by('-timestamp')
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        from .serializers import ActivityLogSerializer
        return ActivityLogSerializer


class SystemSettingsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for system settings"""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get public system settings or admin settings"""
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return SystemSettings.objects.all()
        
        # Regular users can only see public settings
        return SystemSettings.objects.filter(is_public=True)
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        from .serializers import SystemSettingsSerializer
        return SystemSettingsSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for user notifications"""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get notifications for the current user"""
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        from .serializers import NotificationSerializer
        return NotificationSerializer
    
    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['patch'])
    def mark_all_read(self, request):
        """Mark all notifications as read for the user"""
        notifications = self.get_queryset().filter(is_read=False)
        notifications.update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'{notifications.count()} notifications marked as read'
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})