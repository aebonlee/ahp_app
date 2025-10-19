"""
Views for Project API
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Project, ProjectMember, Criteria, ProjectTemplate
from .serializers import (
    ProjectSerializer, ProjectCreateSerializer, ProjectSummarySerializer,
    ProjectMemberSerializer, CriteriaSerializer, ProjectTemplateSerializer
)
from apps.common.permissions import IsOwnerOrReadOnly


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for managing projects"""
    
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'visibility', 'owner']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Override to always allow any request
        """
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        """Filter projects based on user permissions and visibility"""
        user = self.request.user
        
        # Exclude deleted projects by default
        base_queryset = Project.objects.filter(deleted_at__isnull=True)
        
        # 익명 사용자는 모든 프로젝트 조회 가능 (개발/테스트용)
        if not user.is_authenticated:
            return base_queryset.select_related('owner').prefetch_related('collaborators')
        
        if user.is_superuser:
            return base_queryset
            
        # Users can see projects they own, collaborate on, or are public
        return base_queryset.filter(
            models.Q(owner=user) |
            models.Q(collaborators=user) |
            models.Q(visibility='public')
        ).distinct().select_related('owner').prefetch_related('collaborators')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return ProjectCreateSerializer
        elif self.action == 'list':
            return ProjectSummarySerializer
        return ProjectSerializer
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the project"""
        project = self.get_object()
        
        # Check permission
        if not project.projectmember_set.filter(
            user=request.user,
            can_manage_evaluators=True
        ).exists() and project.owner != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ProjectMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check if user is already a member
        if project.projectmember_set.filter(user=serializer.validated_data['user']).exists():
            return Response(
                {'error': 'User is already a member of this project'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member = serializer.save(
            project=project,
            invited_by=request.user
        )
        
        return Response(
            ProjectMemberSerializer(member).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['patch'])
    def update_member(self, request, pk=None):
        """Update a project member's role or permissions"""
        project = self.get_object()
        member_id = request.data.get('member_id')
        
        if not member_id:
            return Response(
                {'error': 'member_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            member = project.projectmember_set.get(id=member_id)
        except ProjectMember.DoesNotExist:
            return Response(
                {'error': 'Member not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission
        if not project.projectmember_set.filter(
            user=request.user,
            can_manage_evaluators=True
        ).exists() and project.owner != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ProjectMemberSerializer(member, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def remove_member(self, request, pk=None):
        """Remove a member from the project"""
        project = self.get_object()
        member_id = request.query_params.get('member_id')
        
        if not member_id:
            return Response(
                {'error': 'member_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            member = project.projectmember_set.get(id=member_id)
        except ProjectMember.DoesNotExist:
            return Response(
                {'error': 'Member not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission
        if not project.projectmember_set.filter(
            user=request.user,
            can_manage_evaluators=True
        ).exists() and project.owner != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Cannot remove owner
        if member.role == 'owner':
            return Response(
                {'error': 'Cannot remove project owner'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.delete()
        return Response({'message': 'Member removed successfully'})
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get project members"""
        project = self.get_object()
        members = project.projectmember_set.select_related('user').all()
        serializer = ProjectMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def criteria(self, request, pk=None):
        """Get project criteria hierarchy"""
        project = self.get_object()
        # Get root criteria (no parent)
        criteria = project.criteria.filter(parent=None, is_active=True).order_by('order')
        serializer = CriteriaSerializer(criteria, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_criteria(self, request, pk=None):
        """Add criteria to the project"""
        project = self.get_object()
        
        # Check permission
        if not project.projectmember_set.filter(
            user=request.user,
            can_edit_structure=True
        ).exists() and project.owner != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CriteriaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        criteria = serializer.save(project=project)
        
        return Response(
            CriteriaSerializer(criteria).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['delete'])
    def soft_delete(self, request, pk=None):
        """소프트 삭제 (휴지통으로 이동)"""
        project = self.get_object()
        
        # Check permission - only owner can delete
        if project.owner != request.user and not request.user.is_superuser:
            return Response(
                {'error': 'Permission denied. Only project owner can delete.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project.status = 'deleted'
        project.deleted_at = timezone.now()
        project.save(update_fields=['status', 'deleted_at'])
        
        return Response(
            {'message': 'Project moved to trash successfully'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """휴지통에서 복원"""
        # Get project including deleted ones
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission
        if project.owner != request.user and not request.user.is_superuser:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        project.status = 'draft'
        project.deleted_at = None
        project.save(update_fields=['status', 'deleted_at'])
        
        return Response(
            ProjectSerializer(project, context={'request': request}).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def trash(self, request):
        """휴지통 목록 조회"""
        user = request.user
        
        # Get deleted projects
        trashed_projects = Project.objects.filter(
            owner=user,
            deleted_at__isnull=False
        ).order_by('-deleted_at')
        
        serializer = ProjectSerializer(trashed_projects, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        """영구 삭제"""
        # Get project including deleted ones
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission - only owner or superuser can permanently delete
        if project.owner != request.user and not request.user.is_superuser:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only allow permanent deletion of already deleted projects
        if not project.deleted_at:
            return Response(
                {'error': 'Project must be moved to trash first'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        project_title = project.title
        project.delete()
        
        return Response(
            {'message': f'Project "{project_title}" permanently deleted'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a project"""
        original_project = self.get_object()
        
        with transaction.atomic():
            # Create new project
            new_project = Project.objects.create(
                title=f"{original_project.title} (Copy)",
                description=original_project.description,
                objective=original_project.objective,
                owner=request.user,
                visibility=original_project.visibility,
                consistency_ratio_threshold=original_project.consistency_ratio_threshold,
                tags=original_project.tags.copy(),
                settings=original_project.settings.copy()
            )
            
            # Add owner as member
            ProjectMember.objects.create(
                project=new_project,
                user=request.user,
                role='owner',
                can_edit_structure=True,
                can_manage_evaluators=True,
                can_view_results=True
            )
            
            # Copy criteria hierarchy
            criteria_mapping = {}
            
            def copy_criteria(parent_criteria_list, new_parent=None):
                for criteria in parent_criteria_list:
                    new_criteria = Criteria.objects.create(
                        project=new_project,
                        name=criteria.name,
                        description=criteria.description,
                        type=criteria.type,
                        parent=new_parent,
                        order=criteria.order,
                        level=criteria.level
                    )
                    criteria_mapping[criteria.id] = new_criteria
                    
                    # Recursively copy children
                    children = criteria.children.filter(is_active=True).order_by('order')
                    if children:
                        copy_criteria(children, new_criteria)
            
            # Start with root criteria
            root_criteria = original_project.criteria.filter(parent=None, is_active=True).order_by('order')
            copy_criteria(root_criteria)
        
        serializer = ProjectSerializer(new_project, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CriteriaViewSet(viewsets.ModelViewSet):
    """ViewSet for managing criteria"""
    
    serializer_class = CriteriaSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['project', 'type', 'parent', 'level']
    ordering = ['level', 'order']
    
    def get_queryset(self):
        """Filter criteria based on project access - allow all for development"""
        # 개발/테스트 환경에서는 모든 criteria 접근 허용
        return Criteria.objects.filter(is_active=True).select_related('project', 'parent')
    
    def create(self, request, *args, **kwargs):
        """Create new criteria with proper validation"""
        try:
            # Log the incoming request data
            print(f"Creating criteria with data: {request.data}")
            
            # Ensure required fields are present
            if 'project' not in request.data:
                return Response(
                    {'error': 'Project ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if 'name' not in request.data:
                return Response(
                    {'error': 'Criteria name is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for duplicate name within the same project
            existing_criteria = Criteria.objects.filter(
                project=request.data['project'],
                name=request.data['name']
            ).first()
            
            if existing_criteria:
                return Response(
                    {'error': f'A criteria with the name "{request.data["name"]}" already exists in this project'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set default values if not provided
            data = request.data.copy()
            if 'type' not in data:
                data['type'] = 'criteria'
            if 'level' not in data:
                data['level'] = 1 if not data.get('parent') else 2
            if 'order' not in data:
                # Auto-set order based on existing criteria
                existing_count = Criteria.objects.filter(
                    project=data['project'],
                    parent=data.get('parent')
                ).count()
                data['order'] = existing_count + 1
            if 'is_active' not in data:
                data['is_active'] = True
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            print(f"Error creating criteria: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to create criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_create(self, serializer):
        """Perform the creation of criteria"""
        serializer.save()
    
    def update(self, request, *args, **kwargs):
        """Update criteria with validation"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}
                
            return Response(serializer.data)
        except Exception as e:
            print(f"Error updating criteria: {str(e)}")
            return Response(
                {'error': f'Failed to update criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete criteria by setting is_active to False"""
        try:
            instance = self.get_object()
            instance.is_active = False
            instance.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Error deleting criteria: {str(e)}")
            return Response(
                {'error': f'Failed to delete criteria: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProjectTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing project templates"""
    
    serializer_class = ProjectTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_public']
    search_fields = ['name', 'description']
    ordering = ['-usage_count', '-created_at']
    
    def get_queryset(self):
        """Get public templates and user's own templates"""
        user = self.request.user
        return ProjectTemplate.objects.filter(
            models.Q(is_public=True) | models.Q(created_by=user)
        ).select_related('created_by')
    
    def perform_create(self, serializer):
        """Set template creator"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def create_project(self, request, pk=None):
        """Create a project from template"""
        template = self.get_object()
        
        # Increment usage count
        template.usage_count += 1
        template.save(update_fields=['usage_count'])
        
        with transaction.atomic():
            # Create project from template
            project_data = request.data.copy()
            project_data.update(template.default_settings)
            
            serializer = ProjectCreateSerializer(
                data=project_data,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            project = serializer.save()
            
            # Create criteria from template structure
            def create_criteria_from_structure(structure, parent=None, level=0):
                for i, item in enumerate(structure):
                    criteria = Criteria.objects.create(
                        project=project,
                        name=item['name'],
                        description=item.get('description', ''),
                        type=item.get('type', 'criteria'),
                        parent=parent,
                        order=i,
                        level=level
                    )
                    
                    # Create children if they exist
                    if 'children' in item:
                        create_criteria_from_structure(
                            item['children'], criteria, level + 1
                        )
            
            if 'structure' in template.structure:
                create_criteria_from_structure(template.structure['structure'])
        
        return Response(
            ProjectSerializer(project, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )