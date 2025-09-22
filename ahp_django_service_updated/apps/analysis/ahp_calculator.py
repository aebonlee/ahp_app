"""
AHP 계산 엔진 - 완전한 AHP 분석 알고리즘 구현
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging
from scipy.stats import kendalltau, spearmanr
from scipy.optimize import minimize_scalar

logger = logging.getLogger(__name__)


class AggregationMethod(Enum):
    """그룹 의사결정 집계 방법"""
    GEOMETRIC_MEAN = "geometric_mean"
    ARITHMETIC_MEAN = "arithmetic_mean" 
    WEIGHTED_GEOMETRIC_MEAN = "weighted_geometric_mean"


@dataclass
class ComparisonMatrix:
    """쌍대비교 매트릭스 데이터 클래스"""
    matrix: np.ndarray
    criteria: List[str]
    evaluator_id: Optional[str] = None
    
    def __post_init__(self):
        if self.matrix.shape[0] != self.matrix.shape[1]:
            raise ValueError("비교 매트릭스는 정사각행렬이어야 합니다")
        if len(self.criteria) != self.matrix.shape[0]:
            raise ValueError("기준의 수와 매트릭스 차원이 일치하지 않습니다")


@dataclass 
class AHPResult:
    """AHP 계산 결과"""
    weights: Dict[str, float]
    consistency_ratio: float
    lambda_max: float
    rank: List[Tuple[str, float]]
    is_consistent: bool
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'weights': self.weights,
            'consistency_ratio': self.consistency_ratio,
            'lambda_max': self.lambda_max,
            'rank': self.rank,
            'is_consistent': self.is_consistent
        }


@dataclass
class SensitivityResult:
    """민감도 분석 결과"""
    criterion: str
    sensitivity_coefficient: float
    rank_reversals: List[Dict[str, Any]]
    critical_values: Dict[str, float]
    chart_data: Dict[str, List[float]]


class AHPCalculator:
    """AHP 계산 엔진 메인 클래스"""
    
    # Random Index (RI) 값 - 일관성 비율 계산용
    RI_VALUES = {
        1: 0.00, 2: 0.00, 3: 0.52, 4: 0.89, 5: 1.11,
        6: 1.25, 7: 1.35, 8: 1.40, 9: 1.45, 10: 1.49,
        11: 1.51, 12: 1.54, 13: 1.56, 14: 1.58, 15: 1.59
    }
    
    def __init__(self, consistency_threshold: float = 0.1):
        """
        AHP 계산기 초기화
        
        Args:
            consistency_threshold: 일관성 허용 임계값 (기본값: 0.1)
        """
        self.consistency_threshold = consistency_threshold
        
    def create_comparison_matrix(
        self, 
        comparisons: List[Dict[str, Any]], 
        criteria: List[str]
    ) -> ComparisonMatrix:
        """
        쌍대비교 데이터로부터 비교 매트릭스 생성
        
        Args:
            comparisons: 쌍대비교 데이터 리스트
                [{'criteria_1': 'A', 'criteria_2': 'B', 'value': 3}, ...]
            criteria: 기준 리스트
            
        Returns:
            ComparisonMatrix: 생성된 비교 매트릭스
        """
        n = len(criteria)
        matrix = np.ones((n, n))
        
        # 기준명-인덱스 매핑
        criteria_index = {criterion: i for i, criterion in enumerate(criteria)}
        
        try:
            for comp in comparisons:
                i = criteria_index.get(comp['criteria_1'])
                j = criteria_index.get(comp['criteria_2'])
                
                if i is not None and j is not None:
                    value = float(comp['value'])
                    matrix[i][j] = value
                    matrix[j][i] = 1.0 / value if value != 0 else 1.0
                    
        except (KeyError, ValueError, TypeError) as e:
            logger.error(f"비교 매트릭스 생성 중 오류: {e}")
            raise ValueError(f"잘못된 비교 데이터: {e}")
            
        return ComparisonMatrix(matrix=matrix, criteria=criteria)
    
    def calculate_weights_eigenvector(self, matrix: np.ndarray) -> Tuple[np.ndarray, float]:
        """
        고유벡터 방법으로 가중치 계산
        
        Args:
            matrix: 쌍대비교 매트릭스
            
        Returns:
            Tuple[weights, lambda_max]: 가중치 벡터와 최대 고유값
        """
        try:
            eigenvalues, eigenvectors = np.linalg.eig(matrix)
            
            # 최대 고유값과 해당 고유벡터 찾기
            max_eigenvalue_idx = np.argmax(eigenvalues.real)
            lambda_max = eigenvalues[max_eigenvalue_idx].real
            principal_eigenvector = eigenvectors[:, max_eigenvalue_idx].real
            
            # 가중치 정규화 (양수로 만들고 합이 1이 되도록)
            weights = np.abs(principal_eigenvector)
            weights = weights / np.sum(weights)
            
            return weights, lambda_max
            
        except np.linalg.LinAlgError as e:
            logger.error(f"고유벡터 계산 중 오류: {e}")
            # 폴백: 기하평균 방법 사용
            return self.calculate_weights_geometric_mean(matrix)
    
    def calculate_weights_geometric_mean(self, matrix: np.ndarray) -> Tuple[np.ndarray, float]:
        """
        기하평균 방법으로 가중치 계산
        
        Args:
            matrix: 쌍대비교 매트릭스
            
        Returns:
            Tuple[weights, estimated_lambda_max]: 가중치 벡터와 추정 최대 고유값
        """
        n = matrix.shape[0]
        
        # 각 행의 기하평균 계산
        geometric_means = np.zeros(n)
        for i in range(n):
            row_product = np.prod(matrix[i, :])
            geometric_means[i] = row_product ** (1.0 / n)
            
        # 정규화
        weights = geometric_means / np.sum(geometric_means)
        
        # 최대 고유값 추정 (Aw = lambda_max * w)
        Aw = np.dot(matrix, weights)
        lambda_max = np.mean(Aw / weights)
        
        return weights, lambda_max
    
    def calculate_consistency_ratio(self, lambda_max: float, n: int) -> float:
        """
        일관성 비율(CR) 계산
        
        Args:
            lambda_max: 최대 고유값
            n: 매트릭스 차원
            
        Returns:
            float: 일관성 비율
        """
        if n <= 2:
            return 0.0
            
        # 일관성 지수 (CI) 계산
        ci = (lambda_max - n) / (n - 1)
        
        # 무작위 지수 (RI) 가져오기
        ri = self.RI_VALUES.get(n, 1.59)
        
        # 일관성 비율 계산
        cr = ci / ri if ri > 0 else 0.0
        
        return cr
    
    def analyze_single_matrix(self, comparison_matrix: ComparisonMatrix) -> AHPResult:
        """
        단일 비교 매트릭스 분석
        
        Args:
            comparison_matrix: 비교 매트릭스
            
        Returns:
            AHPResult: 분석 결과
        """
        matrix = comparison_matrix.matrix
        criteria = comparison_matrix.criteria
        n = len(criteria)
        
        # 가중치 계산 (고유벡터 방법 우선, 실패 시 기하평균)
        try:
            weights, lambda_max = self.calculate_weights_eigenvector(matrix)
        except Exception as e:
            logger.warning(f"고유벡터 방법 실패, 기하평균 사용: {e}")
            weights, lambda_max = self.calculate_weights_geometric_mean(matrix)
        
        # 일관성 비율 계산
        cr = self.calculate_consistency_ratio(lambda_max, n)
        is_consistent = cr <= self.consistency_threshold
        
        # 가중치 딕셔너리 생성
        weights_dict = {criteria[i]: float(weights[i]) for i in range(n)}
        
        # 순위 계산 (가중치 내림차순)
        rank = sorted(weights_dict.items(), key=lambda x: x[1], reverse=True)
        
        return AHPResult(
            weights=weights_dict,
            consistency_ratio=float(cr),
            lambda_max=float(lambda_max),
            rank=rank,
            is_consistent=is_consistent
        )
    
    def aggregate_group_matrices(
        self, 
        matrices: List[ComparisonMatrix],
        method: AggregationMethod = AggregationMethod.GEOMETRIC_MEAN,
        weights: Optional[List[float]] = None
    ) -> ComparisonMatrix:
        """
        그룹 의사결정을 위한 매트릭스 집계
        
        Args:
            matrices: 개별 비교 매트릭스들
            method: 집계 방법
            weights: 평가자별 가중치 (가중 기하평균 사용 시)
            
        Returns:
            ComparisonMatrix: 집계된 매트릭스
        """
        if not matrices:
            raise ValueError("집계할 매트릭스가 없습니다")
            
        # 모든 매트릭스가 동일한 차원인지 확인
        n = matrices[0].matrix.shape[0]
        criteria = matrices[0].criteria
        
        for matrix in matrices:
            if matrix.matrix.shape[0] != n or matrix.criteria != criteria:
                raise ValueError("모든 매트릭스의 차원과 기준이 동일해야 합니다")
        
        if method == AggregationMethod.GEOMETRIC_MEAN:
            aggregated = self._geometric_mean_aggregation(matrices)
        elif method == AggregationMethod.ARITHMETIC_MEAN:
            aggregated = self._arithmetic_mean_aggregation(matrices)
        elif method == AggregationMethod.WEIGHTED_GEOMETRIC_MEAN:
            if weights is None:
                weights = [1.0] * len(matrices)  # 동일 가중치
            aggregated = self._weighted_geometric_mean_aggregation(matrices, weights)
        else:
            raise ValueError(f"지원하지 않는 집계 방법: {method}")
            
        return ComparisonMatrix(matrix=aggregated, criteria=criteria)
    
    def _geometric_mean_aggregation(self, matrices: List[ComparisonMatrix]) -> np.ndarray:
        """기하평균 집계"""
        n = matrices[0].matrix.shape[0]
        result = np.ones((n, n))
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    values = [matrix.matrix[i, j] for matrix in matrices]
                    # 기하평균 계산
                    product = np.prod(values)
                    result[i, j] = product ** (1.0 / len(values))
                    
        return result
    
    def _arithmetic_mean_aggregation(self, matrices: List[ComparisonMatrix]) -> np.ndarray:
        """산술평균 집계"""
        n = matrices[0].matrix.shape[0]
        result = np.zeros((n, n))
        
        for matrix in matrices:
            result += matrix.matrix
            
        result = result / len(matrices)
        
        # 대각선을 1로 설정
        np.fill_diagonal(result, 1.0)
        
        return result
    
    def _weighted_geometric_mean_aggregation(
        self, 
        matrices: List[ComparisonMatrix], 
        weights: List[float]
    ) -> np.ndarray:
        """가중 기하평균 집계"""
        if len(weights) != len(matrices):
            raise ValueError("가중치 개수와 매트릭스 개수가 일치하지 않습니다")
            
        # 가중치 정규화
        weights = np.array(weights)
        weights = weights / np.sum(weights)
        
        n = matrices[0].matrix.shape[0]
        result = np.ones((n, n))
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    weighted_product = 1.0
                    for k, matrix in enumerate(matrices):
                        weighted_product *= (matrix.matrix[i, j] ** weights[k])
                    result[i, j] = weighted_product
                    
        return result
    
    def calculate_consensus_metrics(self, matrices: List[ComparisonMatrix]) -> Dict[str, float]:
        """
        그룹 합의도 측정
        
        Args:
            matrices: 개별 비교 매트릭스들
            
        Returns:
            Dict: 합의도 지표들
        """
        if len(matrices) < 2:
            return {'consensus_index': 1.0, 'kendall_w': 1.0, 'spearman_rho': 1.0}
        
        # 각 매트릭스의 가중치 계산
        all_weights = []
        for matrix in matrices:
            result = self.analyze_single_matrix(matrix)
            weights = [result.weights[criterion] for criterion in matrix.criteria]
            all_weights.append(weights)
        
        all_weights = np.array(all_weights)
        
        # Kendall's W 계산 (순위 기반 합의도)
        rankings = np.argsort(-all_weights, axis=1)  # 가중치 기준 순위
        kendall_w = self._calculate_kendall_w(rankings)
        
        # 평균 Spearman 상관계수
        spearman_rho = self._calculate_average_spearman(all_weights)
        
        # 커스텀 합의 지수 (가중치 분산 기반)
        consensus_index = self._calculate_consensus_index(all_weights)
        
        return {
            'kendall_w': float(kendall_w),
            'spearman_rho': float(spearman_rho),
            'consensus_index': float(consensus_index)
        }
    
    def _calculate_kendall_w(self, rankings: np.ndarray) -> float:
        """Kendall's W 계산"""
        n_evaluators, n_criteria = rankings.shape
        
        # 순위 합 계산
        rank_sums = np.sum(rankings, axis=0)
        mean_rank_sum = np.mean(rank_sums)
        
        # Kendall's W 계산
        S = np.sum((rank_sums - mean_rank_sum) ** 2)
        W = 12 * S / (n_evaluators ** 2 * (n_criteria ** 3 - n_criteria))
        
        return W
    
    def _calculate_average_spearman(self, weights: np.ndarray) -> float:
        """평균 Spearman 상관계수 계산"""
        n_evaluators = weights.shape[0]
        correlations = []
        
        for i in range(n_evaluators):
            for j in range(i + 1, n_evaluators):
                corr, _ = spearmanr(weights[i], weights[j])
                if not np.isnan(corr):
                    correlations.append(corr)
        
        return np.mean(correlations) if correlations else 0.0
    
    def _calculate_consensus_index(self, weights: np.ndarray) -> float:
        """커스텀 합의 지수 계산 (0-1, 1이 완전 합의)"""
        # 각 기준별 가중치의 변이계수 계산
        cvs = []
        for j in range(weights.shape[1]):
            criterion_weights = weights[:, j]
            if np.mean(criterion_weights) > 0:
                cv = np.std(criterion_weights) / np.mean(criterion_weights)
                cvs.append(cv)
        
        # 평균 변이계수를 합의 지수로 변환 (낮을수록 높은 합의)
        avg_cv = np.mean(cvs) if cvs else 0
        consensus_index = 1 / (1 + avg_cv)
        
        return consensus_index
    
    def perform_sensitivity_analysis(
        self, 
        comparison_matrix: ComparisonMatrix,
        target_criterion: str,
        perturbation_range: float = 0.1,
        steps: int = 20
    ) -> SensitivityResult:
        """
        민감도 분석 수행
        
        Args:
            comparison_matrix: 기준 비교 매트릭스
            target_criterion: 민감도 분석 대상 기준
            perturbation_range: 섭동 범위 (±)
            steps: 분석 단계 수
            
        Returns:
            SensitivityResult: 민감도 분석 결과
        """
        if target_criterion not in comparison_matrix.criteria:
            raise ValueError(f"기준 '{target_criterion}'을 찾을 수 없습니다")
        
        # 기준 분석 결과
        base_result = self.analyze_single_matrix(comparison_matrix)
        base_weights = base_result.weights
        base_ranking = [item[0] for item in base_result.rank]
        
        # 섭동 값들
        perturbations = np.linspace(-perturbation_range, perturbation_range, steps)
        
        # 결과 저장
        weight_changes = {criterion: [] for criterion in comparison_matrix.criteria}
        ranking_changes = []
        
        target_idx = comparison_matrix.criteria.index(target_criterion)
        
        for perturbation in perturbations:
            # 매트릭스 복사 및 섭동 적용
            perturbed_matrix = comparison_matrix.matrix.copy()
            
            # 타겟 기준의 가중치를 변경하기 위해 해당 행/열 조정
            scale_factor = 1 + perturbation
            for i in range(len(comparison_matrix.criteria)):
                if i != target_idx:
                    perturbed_matrix[target_idx, i] *= scale_factor
                    perturbed_matrix[i, target_idx] /= scale_factor
            
            # 섭동된 매트릭스 분석
            perturbed_comparison = ComparisonMatrix(
                matrix=perturbed_matrix,
                criteria=comparison_matrix.criteria
            )
            
            try:
                perturbed_result = self.analyze_single_matrix(perturbed_comparison)
                
                # 가중치 변화 저장
                for criterion in comparison_matrix.criteria:
                    weight_changes[criterion].append(perturbed_result.weights[criterion])
                
                # 순위 변화 확인
                new_ranking = [item[0] for item in perturbed_result.rank]
                if new_ranking != base_ranking:
                    ranking_changes.append({
                        'perturbation': float(perturbation),
                        'new_ranking': new_ranking,
                        'rank_reversals': self._find_rank_reversals(base_ranking, new_ranking)
                    })
                    
            except Exception as e:
                logger.warning(f"섭동 {perturbation}에서 분석 실패: {e}")
                # 기준값으로 채우기
                for criterion in comparison_matrix.criteria:
                    weight_changes[criterion].append(base_weights[criterion])
        
        # 민감도 계수 계산 (타겟 기준 가중치의 변화율)
        target_weights = weight_changes[target_criterion]
        if len(target_weights) > 1:
            weight_range = max(target_weights) - min(target_weights)
            sensitivity_coefficient = weight_range / (2 * perturbation_range)
        else:
            sensitivity_coefficient = 0.0
        
        # 임계값 찾기
        critical_values = self._find_critical_values(
            perturbations, ranking_changes, base_ranking
        )
        
        return SensitivityResult(
            criterion=target_criterion,
            sensitivity_coefficient=sensitivity_coefficient,
            rank_reversals=ranking_changes,
            critical_values=critical_values,
            chart_data={
                'perturbations': perturbations.tolist(),
                'weight_changes': weight_changes
            }
        )
    
    def _find_rank_reversals(self, base_ranking: List[str], new_ranking: List[str]) -> List[Dict[str, Any]]:
        """순위 역전 찾기"""
        reversals = []
        
        for i, criterion in enumerate(base_ranking):
            base_rank = i + 1
            new_rank = new_ranking.index(criterion) + 1 if criterion in new_ranking else base_rank
            
            if base_rank != new_rank:
                reversals.append({
                    'criterion': criterion,
                    'base_rank': base_rank,
                    'new_rank': new_rank,
                    'rank_change': new_rank - base_rank
                })
        
        return reversals
    
    def _find_critical_values(
        self, 
        perturbations: np.ndarray, 
        ranking_changes: List[Dict[str, Any]], 
        base_ranking: List[str]
    ) -> Dict[str, float]:
        """임계값 찾기 (순위가 바뀌는 지점)"""
        critical_values = {}
        
        if not ranking_changes:
            return critical_values
        
        # 첫 번째 순위 변화 지점
        first_change = ranking_changes[0]
        critical_values['first_reversal'] = first_change['perturbation']
        
        # 가장 민감한 변화 지점 (가장 작은 섭동으로 순위 변화)
        min_perturbation = min(abs(change['perturbation']) for change in ranking_changes)
        critical_values['most_sensitive'] = min_perturbation
        
        return critical_values
    
    def calculate_final_priorities(
        self,
        criteria_weights: Dict[str, float],
        alternative_matrices: Dict[str, ComparisonMatrix]
    ) -> Dict[str, float]:
        """
        최종 우선순위 계산 (계층적 합성)
        
        Args:
            criteria_weights: 기준 가중치
            alternative_matrices: 각 기준별 대안 비교 매트릭스
            
        Returns:
            Dict[str, float]: 대안별 최종 가중치
        """
        if not alternative_matrices:
            return {}
        
        # 모든 대안 목록 추출
        all_alternatives = set()
        for matrix in alternative_matrices.values():
            all_alternatives.update(matrix.criteria)
        all_alternatives = list(all_alternatives)
        
        # 최종 우선순위 초기화
        final_priorities = {alt: 0.0 for alt in all_alternatives}
        
        # 각 기준별로 대안 가중치 계산 후 합성
        for criterion, matrix in alternative_matrices.items():
            if criterion not in criteria_weights:
                logger.warning(f"기준 '{criterion}'의 가중치가 없습니다")
                continue
            
            # 기준별 대안 가중치 계산
            try:
                result = self.analyze_single_matrix(matrix)
                alternative_weights = result.weights
                
                # 계층적 합성 (기준 가중치 × 대안 가중치)
                criterion_weight = criteria_weights[criterion]
                for alternative in alternative_weights:
                    if alternative in final_priorities:
                        final_priorities[alternative] += (
                            criterion_weight * alternative_weights[alternative]
                        )
                        
            except Exception as e:
                logger.error(f"기준 '{criterion}'의 대안 분석 실패: {e}")
                continue
        
        return final_priorities


# 편의 함수들
def create_ahp_calculator(consistency_threshold: float = 0.1) -> AHPCalculator:
    """AHP 계산기 생성 편의 함수"""
    return AHPCalculator(consistency_threshold=consistency_threshold)


def validate_comparison_data(comparisons: List[Dict[str, Any]]) -> bool:
    """쌍대비교 데이터 유효성 검사"""
    required_fields = ['criteria_1', 'criteria_2', 'value']
    
    for comp in comparisons:
        # 필수 필드 확인
        if not all(field in comp for field in required_fields):
            return False
        
        # 비교값 범위 확인 (1/9 ~ 9)
        try:
            value = float(comp['value'])
            if not (1/9 <= value <= 9):
                return False
        except (ValueError, TypeError):
            return False
    
    return True


def extract_criteria_from_comparisons(comparisons: List[Dict[str, Any]]) -> List[str]:
    """쌍대비교 데이터에서 기준 목록 추출"""
    criteria_set = set()
    
    for comp in comparisons:
        criteria_set.add(comp['criteria_1'])
        criteria_set.add(comp['criteria_2'])
    
    return sorted(list(criteria_set))