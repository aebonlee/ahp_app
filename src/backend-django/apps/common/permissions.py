"""
Custom permissions for AHP Platform
"""
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object.
        return obj.owner == request.user


class IsEvaluatorOrProjectMember(permissions.BasePermission):
    """
    Permission to allow evaluators to access their evaluations
    or project members to view evaluations for their projects.
    """
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Allow evaluators to access their own evaluations
        if hasattr(obj, 'evaluator') and obj.evaluator == user:
            return True
        
        # Allow project owners and members to view evaluations
        if hasattr(obj, 'project'):
            project = obj.project
            if project.owner == user:
                return True
            if project.projectmember_set.filter(user=user).exists():
                return True
        
        return False


class IsProjectMemberOrReadOnly(permissions.BasePermission):
    """
    Permission to allow project members to edit based on their role permissions.
    """
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Read permissions for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user is project owner
        if hasattr(obj, 'project'):
            project = obj.project
            if project.owner == user:
                return True
            
            # Check member permissions
            try:
                member = project.projectmember_set.get(user=user)
                if request.method in ['POST', 'PUT', 'PATCH']:
                    return member.can_edit_structure
                elif request.method == 'DELETE':
                    return member.role in ['owner', 'manager']
            except:
                pass
        
        return False


class IsEvaluatorOnly(permissions.BasePermission):
    """
    Permission for evaluator-only actions.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_evaluator
        )


class IsAdminOrOwner(permissions.BasePermission):
    """
    Permission for admin or object owner.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admins can do anything
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Owners can manage their objects
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return False


class CanManageEvaluators(permissions.BasePermission):
    """
    Permission to manage evaluators in a project.
    """
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        if hasattr(obj, 'project'):
            project = obj.project
            
            # Project owner can manage evaluators
            if project.owner == user:
                return True
            
            # Members with evaluator management permission
            try:
                member = project.projectmember_set.get(user=user)
                return member.can_manage_evaluators
            except:
                pass
        
        return False