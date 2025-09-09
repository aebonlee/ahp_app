"""
Simple Service Views - 최소한의 API
"""
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db import transaction
import math
from .models import SimpleProject, SimpleData, SimpleCriteria, SimpleComparison, SimpleResult
from .serializers import (
    SimpleProjectSerializer, SimpleDataSerializer, SimpleCriteriaSerializer, 
    SimpleComparisonSerializer, SimpleResultSerializer
)


class SimpleProjectViewSet(viewsets.ModelViewSet):
    """간단한 프로젝트 ViewSet"""
    queryset = SimpleProject.objects.all()
    serializer_class = SimpleProjectSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def calculate_weights(self, request, pk=None):
        """AHP 가중치 계산"""
        project = self.get_object()
        
        try:
            with transaction.atomic():
                # 기존 결과 삭제
                SimpleResult.objects.filter(project=project).delete()
                
                # 평가기준 가져오기
                criteria = project.criteria.filter(type='criteria').order_by('order')
                if not criteria.exists():
                    return Response({'error': 'No criteria found'}, status=status.HTTP_400_BAD_REQUEST)
                
                # 쌍대비교 행렬 구성
                n = criteria.count()
                matrix = [[1.0 for _ in range(n)] for _ in range(n)]
                
                for i, criterion_a in enumerate(criteria):
                    for j, criterion_b in enumerate(criteria):
                        if i != j:
                            comparison = SimpleComparison.objects.filter(
                                project=project,
                                criteria_a=criterion_a,
                                criteria_b=criterion_b
                            ).first()
                            
                            if comparison:
                                matrix[i][j] = comparison.value
                            else:
                                # 역방향 비교가 있는지 확인
                                reverse_comparison = SimpleComparison.objects.filter(
                                    project=project,
                                    criteria_a=criterion_b,
                                    criteria_b=criterion_a
                                ).first()
                                
                                if reverse_comparison:
                                    matrix[i][j] = 1.0 / reverse_comparison.value
                                else:
                                    matrix[i][j] = 1.0
                
                # 기하평균법으로 가중치 계산
                weights = []
                for i in range(n):
                    product = 1.0
                    for j in range(n):
                        product *= matrix[i][j]
                    weights.append(product ** (1.0 / n))
                
                # 정규화
                total_weight = sum(weights)
                if total_weight > 0:
                    weights = [w / total_weight for w in weights]
                
                # 결과 저장
                for i, (criterion, weight) in enumerate(zip(criteria, weights)):
                    SimpleResult.objects.create(
                        project=project,
                        criteria=criterion,
                        weight=weight,
                        rank=i + 1,
                        created_by=request.user
                    )
                    
                    # 기준 가중치도 업데이트
                    criterion.weight = weight
                    criterion.save()
                
                # 순위 재정렬
                results = SimpleResult.objects.filter(project=project).order_by('-weight')
                for rank, result in enumerate(results, 1):
                    result.rank = rank
                    result.save()
                
                return Response({
                    'message': 'Weights calculated successfully',
                    'weights': weights,
                    'criteria_count': n
                })
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SimpleCriteriaViewSet(viewsets.ModelViewSet):
    """AHP 평가기준 ViewSet"""
    queryset = SimpleCriteria.objects.all()
    serializer_class = SimpleCriteriaSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset


class SimpleComparisonViewSet(viewsets.ModelViewSet):
    """쌍대비교 ViewSet"""
    queryset = SimpleComparison.objects.all()
    serializer_class = SimpleComparisonSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SimpleResultViewSet(viewsets.ReadOnlyModelViewSet):
    """AHP 결과 ViewSet (읽기 전용)"""
    queryset = SimpleResult.objects.all()
    serializer_class = SimpleResultSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset


class SimpleDataViewSet(viewsets.ModelViewSet):
    """간단한 데이터 ViewSet"""
    queryset = SimpleData.objects.all()
    serializer_class = SimpleDataSerializer


@api_view(['GET'])
def service_status(request):
    """서비스 상태 확인"""
    return Response({
        'message': 'AHP Service is Running - Frontend Ready',
        'status': 'SUCCESS',
        'version': '2.0',
        'features': {
            'projects': True,
            'criteria': True,
            'comparisons': True,
            'weight_calculation': True,
            'jwt_auth': True,
            'cors_enabled': True
        },
        'stats': {
            'projects_count': SimpleProject.objects.count(),
            'criteria_count': SimpleCriteria.objects.count(),
            'comparisons_count': SimpleComparison.objects.count(),
            'results_count': SimpleResult.objects.count(),
            'data_count': SimpleData.objects.count()
        }
    })