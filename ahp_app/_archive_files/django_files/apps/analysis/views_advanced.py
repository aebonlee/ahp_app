"""
Advanced Analysis Views
고급 분석 API 엔드포인트
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
import numpy as np
import json

from .advanced_analysis import (
    AdvancedAHPAnalyzer, 
    ReportGenerator,
    SensitivityResult,
    GroupConsensusResult
)
from apps.projects.models import Project
from apps.evaluations.models import Evaluation, PairwiseComparison


class AdvancedAnalysisViewSet(viewsets.ViewSet):
    """고급 분석 API ViewSet"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def sensitivity_analysis(self, request, pk=None):
        """
        민감도 분석 수행
        
        Request body:
        {
            "target_criteria": [0, 1, 2],  // 분석 대상 기준 인덱스
            "variation_range": 0.3,  // 변동 범위
            "comparison_matrices": {...}  // 쌍대비교 행렬
        }
        """
        try:
            project = Project.objects.get(id=pk)
            
            # 권한 확인
            if not self._has_permission(request.user, project):
                return Response(
                    {'error': '권한이 없습니다.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 요청 데이터 추출
            target_criteria = request.data.get('target_criteria', [])
            variation_range = request.data.get('variation_range', 0.3)
            
            # 비교 행렬 및 가중치 계산
            matrices, weights = self._get_project_matrices(project)
            
            # 분석기 초기화
            analyzer = AdvancedAHPAnalyzer(matrices, weights)
            
            # 각 기준에 대해 민감도 분석 수행
            sensitivity_results = []
            for criterion_idx in target_criteria:
                result = analyzer.sensitivity_analysis(
                    criterion_idx, 
                    variation_range
                )
                sensitivity_results.append({
                    'criterion': result.criterion,
                    'original_weight': result.original_weight,
                    'sensitivity_range': result.sensitivity_range,
                    'rank_reversal_points': result.rank_reversal_points,
                    'stability_index': result.stability_index,
                    'impact_score': result.impact_score
                })
            
            # 전체 안정성 평가
            overall_stability = np.mean([r['stability_index'] for r in sensitivity_results])
            
            return Response({
                'project_id': project.id,
                'project_title': project.title,
                'analysis_type': 'sensitivity',
                'results': sensitivity_results,
                'overall_stability': overall_stability,
                'interpretation': self._interpret_sensitivity(overall_stability)
            })
            
        except Project.DoesNotExist:
            return Response(
                {'error': '프로젝트를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def group_consensus_analysis(self, request, pk=None):
        """
        그룹 의사결정 통합 분석
        
        Request body:
        {
            "aggregation_method": "geometric_mean",
            "evaluator_weights": [1, 1, 1]  // 평가자별 가중치 (선택)
        }
        """
        try:
            project = Project.objects.get(id=pk)
            
            # 권한 확인
            if not self._has_permission(request.user, project):
                return Response(
                    {'error': '권한이 없습니다.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 평가 데이터 수집
            evaluations = Evaluation.objects.filter(
                project=project,
                status='completed'
            )
            
            if evaluations.count() < 2:
                return Response(
                    {'error': '그룹 분석을 위해 최소 2개의 완료된 평가가 필요합니다.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 개인별 비교 행렬 수집
            individual_matrices = []
            evaluator_info = []
            
            for evaluation in evaluations:
                matrix = self._build_comparison_matrix(evaluation)
                if matrix is not None:
                    individual_matrices.append(matrix)
                    evaluator_info.append({
                        'id': evaluation.evaluator.id,
                        'name': evaluation.evaluator.get_full_name(),
                        'consistency_ratio': evaluation.consistency_ratio
                    })
            
            # 통합 방법 및 가중치
            aggregation_method = request.data.get('aggregation_method', 'geometric_mean')
            evaluator_weights = request.data.get('evaluator_weights')
            
            # 분석기 초기화 및 그룹 통합
            analyzer = AdvancedAHPAnalyzer({}, None)
            result = analyzer.group_decision_integration(
                individual_matrices,
                aggregation_method,
                evaluator_weights
            )
            
            return Response({
                'project_id': project.id,
                'project_title': project.title,
                'analysis_type': 'group_consensus',
                'n_evaluators': len(evaluator_info),
                'evaluators': evaluator_info,
                'aggregation_method': result.aggregation_method,
                'consensus_level': result.consensus_level,
                'disagreement_index': result.disagreement_index,
                'outliers': result.outliers,
                'weighted_priorities': result.weighted_priorities.tolist(),
                'confidence_interval': result.confidence_interval,
                'interpretation': self._interpret_consensus(result.consensus_level)
            })
            
        except Project.DoesNotExist:
            return Response(
                {'error': '프로젝트를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def statistical_test(self, request, pk=None):
        """
        통계적 유의성 검증
        
        Request body:
        {
            "evaluation_id_1": "uuid",
            "evaluation_id_2": "uuid",
            "test_type": "wilcoxon"
        }
        """
        try:
            project = Project.objects.get(id=pk)
            
            # 권한 확인
            if not self._has_permission(request.user, project):
                return Response(
                    {'error': '권한이 없습니다.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 평가 데이터 조회
            eval_id_1 = request.data.get('evaluation_id_1')
            eval_id_2 = request.data.get('evaluation_id_2')
            test_type = request.data.get('test_type', 'wilcoxon')
            
            eval_1 = Evaluation.objects.get(id=eval_id_1, project=project)
            eval_2 = Evaluation.objects.get(id=eval_id_2, project=project)
            
            # 비교 행렬 구성
            matrix_1 = self._build_comparison_matrix(eval_1)
            matrix_2 = self._build_comparison_matrix(eval_2)
            
            # 분석기 초기화 및 검정 수행
            analyzer = AdvancedAHPAnalyzer({}, None)
            test_result = analyzer.statistical_significance_test(
                matrix_1, matrix_2, test_type
            )
            
            return Response({
                'project_id': project.id,
                'project_title': project.title,
                'analysis_type': 'statistical_test',
                'evaluation_1': {
                    'id': str(eval_1.id),
                    'evaluator': eval_1.evaluator.get_full_name(),
                    'consistency_ratio': eval_1.consistency_ratio
                },
                'evaluation_2': {
                    'id': str(eval_2.id),
                    'evaluator': eval_2.evaluator.get_full_name(),
                    'consistency_ratio': eval_2.consistency_ratio
                },
                'test_result': test_result
            })
            
        except (Project.DoesNotExist, Evaluation.DoesNotExist):
            return Response(
                {'error': '프로젝트 또는 평가를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def monte_carlo_simulation(self, request, pk=None):
        """
        몬테카를로 시뮬레이션
        
        Request body:
        {
            "n_simulations": 1000,
            "uncertainty_level": 0.1
        }
        """
        try:
            project = Project.objects.get(id=pk)
            
            # 권한 확인
            if not self._has_permission(request.user, project):
                return Response(
                    {'error': '권한이 없습니다.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 시뮬레이션 파라미터
            n_simulations = request.data.get('n_simulations', 1000)
            uncertainty_level = request.data.get('uncertainty_level', 0.1)
            
            # 비교 행렬 및 가중치 계산
            matrices, weights = self._get_project_matrices(project)
            
            # 분석기 초기화 및 시뮬레이션 수행
            analyzer = AdvancedAHPAnalyzer(matrices, weights)
            simulation_result = analyzer.monte_carlo_simulation(
                n_simulations, uncertainty_level
            )
            
            return Response({
                'project_id': project.id,
                'project_title': project.title,
                'analysis_type': 'monte_carlo',
                'simulation_result': simulation_result,
                'interpretation': self._interpret_simulation(
                    simulation_result['overall_stability']
                )
            })
            
        except Project.DoesNotExist:
            return Response(
                {'error': '프로젝트를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def comprehensive_report(self, request, pk=None):
        """
        종합 분석 보고서 생성
        """
        try:
            project = Project.objects.get(id=pk)
            
            # 권한 확인
            if not self._has_permission(request.user, project):
                return Response(
                    {'error': '권한이 없습니다.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # 모든 분석 수행
            analysis_results = {}
            
            # 1. 기본 정보
            analysis_results['project_info'] = {
                'id': project.id,
                'title': project.title,
                'description': project.description,
                'created_at': project.created_at,
                'owner': project.owner.get_full_name()
            }
            
            # 2. 민감도 분석
            matrices, weights = self._get_project_matrices(project)
            if weights is not None and len(weights) > 0:
                analyzer = AdvancedAHPAnalyzer(matrices, weights)
                sensitivity_results = []
                
                for i in range(len(weights)):
                    result = analyzer.sensitivity_analysis(i, 0.3)
                    sensitivity_results.append(result)
                    
                analysis_results['sensitivity'] = sensitivity_results
            
            # 3. 그룹 합의 분석 (평가가 2개 이상인 경우)
            evaluations = Evaluation.objects.filter(
                project=project,
                status='completed'
            )
            
            if evaluations.count() >= 2:
                individual_matrices = []
                for evaluation in evaluations:
                    matrix = self._build_comparison_matrix(evaluation)
                    if matrix is not None:
                        individual_matrices.append(matrix)
                
                if individual_matrices:
                    analyzer = AdvancedAHPAnalyzer({}, None)
                    group_result = analyzer.group_decision_integration(
                        individual_matrices
                    )
                    analysis_results['group_consensus'] = group_result
            
            # 4. 몬테카를로 시뮬레이션
            if weights is not None and len(weights) > 0:
                analyzer = AdvancedAHPAnalyzer(matrices, weights)
                simulation = analyzer.monte_carlo_simulation(500, 0.1)
                analysis_results['monte_carlo'] = simulation
            
            # 5. 보고서 생성
            generator = ReportGenerator(analysis_results)
            summary = generator.generate_summary()
            
            return Response({
                'project_id': project.id,
                'project_title': project.title,
                'analysis_type': 'comprehensive',
                'summary': summary,
                'detailed_results': {
                    'sensitivity': analysis_results.get('sensitivity'),
                    'group_consensus': analysis_results.get('group_consensus'),
                    'monte_carlo': analysis_results.get('monte_carlo')
                },
                'generated_at': timezone.now()
            })
            
        except Project.DoesNotExist:
            return Response(
                {'error': '프로젝트를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # Helper methods
    def _has_permission(self, user, project):
        """사용자 권한 확인"""
        return (
            user == project.owner or 
            user in project.members.all() or
            user.is_superuser
        )
    
    def _get_project_matrices(self, project):
        """프로젝트의 비교 행렬 및 가중치 계산"""
        # 기본 평가 또는 첫 번째 완료된 평가 사용
        evaluation = Evaluation.objects.filter(
            project=project,
            status='completed'
        ).first()
        
        if not evaluation:
            return {}, None
        
        # 비교 행렬 구성
        criteria = project.criteria.filter(type='criteria', is_active=True)
        n = criteria.count()
        
        if n == 0:
            return {}, None
        
        matrix = np.ones((n, n))
        criteria_list = list(criteria)
        
        comparisons = PairwiseComparison.objects.filter(evaluation=evaluation)
        for comp in comparisons:
            i = criteria_list.index(comp.criteria_a)
            j = criteria_list.index(comp.criteria_b)
            matrix[i, j] = comp.value
            matrix[j, i] = 1 / comp.value if comp.value != 0 else 0
        
        # 가중치 계산 (고유벡터 방법)
        eigenvalues, eigenvectors = np.linalg.eig(matrix)
        max_idx = np.argmax(eigenvalues.real)
        weights = np.abs(eigenvectors[:, max_idx].real)
        weights = weights / weights.sum()
        
        return {'main': matrix}, weights
    
    def _build_comparison_matrix(self, evaluation):
        """평가에서 비교 행렬 구성"""
        criteria = evaluation.project.criteria.filter(type='criteria', is_active=True)
        n = criteria.count()
        
        if n == 0:
            return None
        
        matrix = np.ones((n, n))
        criteria_list = list(criteria)
        
        comparisons = PairwiseComparison.objects.filter(evaluation=evaluation)
        for comp in comparisons:
            try:
                i = criteria_list.index(comp.criteria_a)
                j = criteria_list.index(comp.criteria_b)
                matrix[i, j] = comp.value
                matrix[j, i] = 1 / comp.value if comp.value != 0 else 0
            except ValueError:
                continue
        
        return matrix
    
    def _interpret_sensitivity(self, stability):
        """민감도 분석 결과 해석"""
        if stability >= 0.8:
            return "매우 안정적: 가중치 변화에 대해 결과가 안정적입니다."
        elif stability >= 0.6:
            return "안정적: 대체로 안정적이나 일부 민감한 영역이 있습니다."
        elif stability >= 0.4:
            return "보통: 가중치 변화에 다소 민감합니다. 주의가 필요합니다."
        elif stability >= 0.2:
            return "불안정: 가중치 변화에 매우 민감합니다. 재검토가 권장됩니다."
        else:
            return "매우 불안정: 결과의 신뢰성이 낮습니다. 전면적인 재평가가 필요합니다."
    
    def _interpret_consensus(self, consensus_level):
        """그룹 합의 수준 해석"""
        if consensus_level >= 0.9:
            return "매우 높은 합의: 평가자들의 의견이 매우 일치합니다."
        elif consensus_level >= 0.7:
            return "높은 합의: 평가자들의 의견이 대체로 일치합니다."
        elif consensus_level >= 0.5:
            return "보통 합의: 일부 의견 차이가 있으나 수용 가능합니다."
        elif consensus_level >= 0.3:
            return "낮은 합의: 평가자들 간 의견 차이가 큽니다."
        else:
            return "매우 낮은 합의: 평가자들의 의견이 크게 다릅니다. 추가 논의가 필요합니다."
    
    def _interpret_simulation(self, stability):
        """시뮬레이션 결과 해석"""
        if stability >= 0.8:
            return "높은 신뢰도: 불확실성 하에서도 안정적인 결과를 보입니다."
        elif stability >= 0.6:
            return "양호한 신뢰도: 대체로 안정적이나 일부 변동 가능성이 있습니다."
        elif stability >= 0.4:
            return "보통 신뢰도: 불확실성에 영향을 받을 수 있습니다."
        else:
            return "낮은 신뢰도: 불확실성에 매우 민감합니다. 추가 데이터가 필요합니다."