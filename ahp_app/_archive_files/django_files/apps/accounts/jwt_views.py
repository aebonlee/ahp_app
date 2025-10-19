"""
Custom JWT views for email/username authentication
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import UserSerializer

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def custom_token_obtain_pair(request):
    """
    Custom token obtain pair view that supports both email and username login
    """
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not password:
        return Response(
            {'error': 'Password is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not (email or username):
        return Response(
            {'error': 'Email or username is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = None
    
    # Try email first
    if email:
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    
    # Try username if email didn't work
    if not user and username:
        user = authenticate(username=username, password=password)
    
    if user and user.is_active:
        # Update last activity
        user.update_last_activity()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    
    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )