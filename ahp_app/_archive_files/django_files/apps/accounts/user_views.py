"""
사용자 관리 API Views
Django User 모델과 연동된 REST API 엔드포인트
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .serializers import BasicUserSerializer
from django.contrib.auth.hashers import make_password
from apps.common.api_permissions import IsAdminUserOrReadOnly

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    사용자 CRUD API
    """
    queryset = User.objects.all()
    serializer_class = BasicUserSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    
    def get_permissions(self):
        """
        action별 권한 설정
        - list, retrieve: 모든 인증된 사용자
        - create, update, destroy: 스태프 또는 슈퍼유저만
        - OPTIONS: 모두 허용 (CORS)
        """
        if self.request.method == 'OPTIONS':
            return [permissions.AllowAny()]
        elif self.action in ['list', 'retrieve', 'stats']:
            return [permissions.IsAuthenticated()]
        else:
            return [permissions.IsAdminUser()]
    
    def get_queryset(self):
        """
        쿼리셋 필터링
        """
        queryset = super().get_queryset()
        
        # 검색 파라미터
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # 역할 필터
        role = self.request.query_params.get('role', None)
        if role == 'superuser':
            queryset = queryset.filter(is_superuser=True)
        elif role == 'staff':
            queryset = queryset.filter(is_staff=True, is_superuser=False)
        elif role == 'normal':
            queryset = queryset.filter(is_staff=False, is_superuser=False)
        
        # 활성 상태 필터
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-date_joined')
    
    def create(self, request):
        """
        새 사용자 생성
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # 비밀번호 해싱
            password = serializer.validated_data.pop('password', None)
            user = serializer.save()
            
            if password:
                user.password = make_password(password)
                user.save()
            
            return Response(
                self.get_serializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """
        사용자 정보 수정
        """
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            # 비밀번호 처리
            password = serializer.validated_data.pop('password', None)
            user = serializer.save()
            
            if password:
                user.password = make_password(password)
                user.save()
            
            return Response(self.get_serializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        사용자 활성/비활성 토글
        """
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        return Response({
            'message': f"사용자가 {'활성화' if user.is_active else '비활성화'}되었습니다.",
            'is_active': user.is_active
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        사용자 통계
        """
        total = User.objects.count()
        active = User.objects.filter(is_active=True).count()
        superusers = User.objects.filter(is_superuser=True).count()
        staff = User.objects.filter(is_staff=True, is_superuser=False).count()
        normal = User.objects.filter(is_staff=False, is_superuser=False).count()
        
        return Response({
            'total': total,
            'active': active,
            'superusers': superusers,
            'staff': staff,
            'normal': normal
        })


class PublicUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    공개 사용자 조회 API (읽기 전용)
    인증 없이 기본 정보만 조회 가능
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = BasicUserSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_serializer(self, *args, **kwargs):
        """
        공개 API에서는 민감한 정보 제외
        """
        serializer = super().get_serializer(*args, **kwargs)
        if hasattr(serializer, 'fields'):
            # 민감한 필드 제거
            serializer.fields.pop('email', None)
            serializer.fields.pop('is_staff', None)
            serializer.fields.pop('is_superuser', None)
        return serializer