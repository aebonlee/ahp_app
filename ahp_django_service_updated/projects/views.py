from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
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


class ProjectCriteriaView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, project_pk):
        try:
            criteria = Criteria.objects.filter(project_id=project_pk)
            serializer = CriteriaSerializer(criteria, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request, project_pk):
        try:
            # Log incoming data for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Received data: {request.data}")
            logger.info(f"Project PK: {project_pk}")
            
            data = request.data.copy()
            data['project'] = project_pk
            
            logger.info(f"Modified data: {data}")
            
            serializer = CriteriaSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Exception: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)