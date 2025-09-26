from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """슈퍼 관리자 권한"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'super_admin'


class IsServiceAdmin(permissions.BasePermission):
    """서비스 관리자 권한"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['super_admin', 'service_admin']


class IsServiceUser(permissions.BasePermission):
    """서비스 사용자 권한"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['super_admin', 'service_admin', 'service_user']


class IsProjectOwner(permissions.BasePermission):
    """프로젝트 소유자 권한"""
    def has_object_permission(self, request, view, obj):
        # obj가 Project 모델인 경우
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        # obj가 Project와 관련된 모델인 경우 (Criteria, Alternative 등)
        if hasattr(obj, 'project'):
            return obj.project.owner == request.user
        return False


class CanCreateProject(permissions.BasePermission):
    """프로젝트 생성 권한"""
    def has_permission(self, request, view):
        if request.method != 'POST':
            return True
        return request.user and request.user.is_authenticated and request.user.can_create_new_project()


class IsEvaluatorOrOwner(permissions.BasePermission):
    """평가자 또는 프로젝트 소유자 권한"""
    def has_object_permission(self, request, view, obj):
        # 프로젝트 소유자인 경우
        if hasattr(obj, 'project') and obj.project.owner == request.user:
            return True
        
        # 평가자인 경우
        if hasattr(obj, 'evaluator') and obj.evaluator.user == request.user:
            return True
        
        # Evaluator 모델 자체인 경우
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        
        return False