"""
Custom API Permission Classes
API 엔드포인트별 세밀한 권한 제어
"""

from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    객체 소유자만 수정 가능, 나머지는 읽기만 가능
    """
    
    def has_object_permission(self, request, view, obj):
        # 읽기 권한은 모든 요청에 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 쓰기 권한은 소유자에게만 허용
        return obj.owner == request.user if hasattr(obj, 'owner') else False


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    스태프만 수정 가능, 나머지는 읽기만 가능
    """
    
    def has_permission(self, request, view):
        # 읽기 권한은 모든 요청에 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 쓰기 권한은 스태프에게만 허용
        return request.user and request.user.is_staff


class IsSuperuserOrReadOnly(permissions.BasePermission):
    """
    슈퍼유저만 수정 가능, 나머지는 읽기만 가능
    """
    
    def has_permission(self, request, view):
        # 읽기 권한은 모든 요청에 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 쓰기 권한은 슈퍼유저에게만 허용
        return request.user and request.user.is_superuser


class IsAuthenticatedOrWriteOnly(permissions.BasePermission):
    """
    인증된 사용자는 모든 권한, 미인증 사용자는 생성만 가능
    (회원가입 등에 사용)
    """
    
    def has_permission(self, request, view):
        # 생성(POST)는 누구나 가능
        if request.method == 'POST':
            return True
        
        # 나머지는 인증 필요
        return request.user and request.user.is_authenticated


class AllowOptionsRequest(permissions.BasePermission):
    """
    OPTIONS 요청은 항상 허용 (CORS preflight)
    """
    
    def has_permission(self, request, view):
        if request.method == 'OPTIONS':
            return True
        return True  # 다른 권한 클래스와 함께 사용


class PublicReadPrivateWrite(permissions.BasePermission):
    """
    읽기는 공개, 쓰기는 인증 필요
    """
    
    def has_permission(self, request, view):
        # 읽기는 모두 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 쓰기는 인증 필요
        return request.user and request.user.is_authenticated


class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Django admin 권한 사용자만 수정 가능
    """
    
    def has_permission(self, request, view):
        # 읽기는 모두 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 쓰기는 admin 권한 필요
        return request.user and (request.user.is_staff or request.user.is_superuser)