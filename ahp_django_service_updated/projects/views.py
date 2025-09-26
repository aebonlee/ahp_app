from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.conf import settings
from accounts.permissions import IsProjectOwner, CanCreateProject, IsServiceUser
from .models import (
    Project, Criteria, Alternative, Evaluator,
    Comparison, ComparisonMatrix, Result, SensitivityAnalysis
)
from .serializers import (
    ProjectSerializer, CriteriaSerializer, AlternativeSerializer,
    EvaluatorSerializer, ComparisonSerializer, ComparisonMatrixSerializer,
    ResultSerializer, SensitivityAnalysisSerializer
)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, CanCreateProject]
    
    def get_queryset(self):
        """사용자가 소유하거나 참여한 프로젝트만 조회"""
        user = self.request.user
        if user.role in ['super_admin', 'service_admin']:
            return Project.objects.all()
        return Project.objects.filter(owner=user) | Project.objects.filter(evaluators__user=user).distinct()
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def evaluators(self, request, pk=None):
        project = self.get_object()
        evaluators = project.evaluators.all()
        serializer = EvaluatorSerializer(evaluators, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_evaluator(self, request, pk=None):
        project = self.get_object()
        serializer = EvaluatorSerializer(data={**request.data, 'project': project.id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        project = self.get_object()
        results = project.results.all()
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def calculate_results(self, request, pk=None):
        project = self.get_object()
        # TODO: Implement AHP calculation logic
        return Response({'message': 'Results calculated'}, status=status.HTTP_200_OK)


class CriteriaViewSet(viewsets.ModelViewSet):
    queryset = Criteria.objects.all()
    serializer_class = CriteriaSerializer
    permission_classes = [IsAuthenticated, IsProjectOwner]
    
    def get_queryset(self):
        user = self.request.user
        project_id = self.request.query_params.get('project', None)
        
        # 관리자는 모든 기준 조회 가능
        if user.role in ['super_admin', 'service_admin']:
            queryset = Criteria.objects.all()
        else:
            # 일반 사용자는 자신의 프로젝트 기준만 조회
            queryset = Criteria.objects.filter(project__owner=user)
        
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
    permission_classes = [IsAuthenticated, IsProjectOwner]
    
    def get_queryset(self):
        user = self.request.user
        project_id = self.request.query_params.get('project', None)
        
        if user.role in ['super_admin', 'service_admin']:
            queryset = Alternative.objects.all()
        else:
            queryset = Alternative.objects.filter(project__owner=user)
        
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)
        return queryset


class EvaluatorViewSet(viewsets.ModelViewSet):
    queryset = Evaluator.objects.all()
    serializer_class = EvaluatorSerializer
    permission_classes = [IsAuthenticated, IsProjectOwner]
    
    def get_queryset(self):
        user = self.request.user
        project_id = self.request.query_params.get('project', None)
        
        if user.role in ['super_admin', 'service_admin']:
            queryset = Evaluator.objects.all()
        else:
            queryset = Evaluator.objects.filter(project__owner=user)
        
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)
        return queryset
    
    @action(detail=False, methods=['post'])
    def verify_access_key(self, request):
        access_key = request.data.get('access_key')
        try:
            evaluator = Evaluator.objects.get(access_key=access_key)
            serializer = self.get_serializer(evaluator)
            return Response(serializer.data)
        except Evaluator.DoesNotExist:
            return Response({'error': 'Invalid access key'}, status=status.HTTP_404_NOT_FOUND)


class ComparisonViewSet(viewsets.ModelViewSet):
    queryset = Comparison.objects.all()
    serializer_class = ComparisonSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Comparison.objects.all()
        project_id = self.request.query_params.get('project', None)
        evaluator_id = self.request.query_params.get('evaluator', None)
        
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)
        if evaluator_id is not None:
            queryset = queryset.filter(evaluator_id=evaluator_id)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        comparisons_data = request.data.get('comparisons', [])
        serializer = self.get_serializer(data=comparisons_data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ComparisonMatrixViewSet(viewsets.ModelViewSet):
    queryset = ComparisonMatrix.objects.all()
    serializer_class = ComparisonMatrixSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = ComparisonMatrix.objects.all()
        project_id = self.request.query_params.get('project', None)
        evaluator_id = self.request.query_params.get('evaluator', None)
        
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)
        if evaluator_id is not None:
            queryset = queryset.filter(evaluator_id=evaluator_id)
        
        return queryset


class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Result.objects.all()
        project_id = self.request.query_params.get('project', None)
        evaluator_id = self.request.query_params.get('evaluator', None)
        is_group = self.request.query_params.get('is_group', None)
        
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)
        if evaluator_id is not None:
            queryset = queryset.filter(evaluator_id=evaluator_id)
        if is_group is not None:
            queryset = queryset.filter(is_group_result=(is_group.lower() == 'true'))
        
        return queryset


class SensitivityAnalysisViewSet(viewsets.ModelViewSet):
    queryset = SensitivityAnalysis.objects.all()
    serializer_class = SensitivityAnalysisSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = SensitivityAnalysis.objects.all()
        project_id = self.request.query_params.get('project', None)
        
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)
        
        return queryset


# Legacy support views for frontend compatibility
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
            data = request.data.copy()
            data['project'] = project_pk
            
            serializer = CriteriaSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)