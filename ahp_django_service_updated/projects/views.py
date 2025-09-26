from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Project, Criteria, Alternative, Comparison
from .serializers import ProjectSerializer, CriteriaSerializer, AlternativeSerializer, ComparisonSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]  # Allow any for now
    
    def perform_create(self, serializer):
        # For anonymous users, create without owner
        if self.request.user.is_authenticated:
            serializer.save(owner=self.request.user)
        else:
            # Create a dummy user for anonymous projects
            from django.contrib.auth.models import User
            anon_user, created = User.objects.get_or_create(username='anonymous')
            serializer.save(owner=anon_user)
    
    @action(detail=True, methods=['post'])
    def criteria(self, request, pk=None):
        project = self.get_object()
        serializer = CriteriaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def get_criteria(self, request, pk=None):
        project = self.get_object()
        criteria = project.criteria.all()
        serializer = CriteriaSerializer(criteria, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def alternatives(self, request, pk=None):
        project = self.get_object()
        serializer = AlternativeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def comparisons(self, request, pk=None):
        project = self.get_object()
        serializer = ComparisonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CriteriaViewSet(viewsets.ModelViewSet):
    queryset = Criteria.objects.all()
    serializer_class = CriteriaSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Criteria.objects.all()
        project_id = self.request.query_params.get('project', None)
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AlternativeViewSet(viewsets.ModelViewSet):
    queryset = Alternative.objects.all()
    serializer_class = AlternativeSerializer
    permission_classes = [AllowAny]


class ComparisonViewSet(viewsets.ModelViewSet):
    queryset = Comparison.objects.all()
    serializer_class = ComparisonSerializer
    permission_classes = [AllowAny]