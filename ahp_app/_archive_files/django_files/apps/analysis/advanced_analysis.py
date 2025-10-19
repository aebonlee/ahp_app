"""
Advanced AHP Analysis Module
고급 분석 알고리즘 및 통계적 검증
"""
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple, Optional
import pandas as pd
from dataclasses import dataclass
import json


@dataclass
class SensitivityResult:
    """민감도 분석 결과"""
    criterion: str
    original_weight: float
    sensitivity_range: Tuple[float, float]
    rank_reversal_points: List[float]
    stability_index: float
    impact_score: float


@dataclass
class GroupConsensusResult:
    """그룹 의사결정 통합 결과"""
    aggregation_method: str
    consensus_level: float
    disagreement_index: float
    outliers: List[str]
    weighted_priorities: np.ndarray
    confidence_interval: Tuple[float, float]


class AdvancedAHPAnalyzer:
    """고급 AHP 분석 클래스"""
    
    def __init__(self, comparison_matrices: Dict[str, np.ndarray], 
                 criteria_weights: np.ndarray = None):
        """
        Args:
            comparison_matrices: 계층별 쌍대비교 행렬 딕셔너리
            criteria_weights: 기준 가중치 벡터
        """
        self.comparison_matrices = comparison_matrices
        self.criteria_weights = criteria_weights
        self.n_criteria = len(criteria_weights) if criteria_weights is not None else 0
        
    def sensitivity_analysis(self, target_criterion: int, 
                            variation_range: float = 0.5) -> SensitivityResult:
        """
        민감도 분석 수행
        
        Args:
            target_criterion: 분석 대상 기준 인덱스
            variation_range: 변동 범위 (0~1)
            
        Returns:
            SensitivityResult: 민감도 분석 결과
        """
        if self.criteria_weights is None:
            raise ValueError("Criteria weights are required for sensitivity analysis")
            
        original_weight = self.criteria_weights[target_criterion]
        original_ranks = self._calculate_ranks(self.criteria_weights)
        
        # 가중치 변동 범위 설정
        min_weight = max(0.001, original_weight - variation_range)
        max_weight = min(0.999, original_weight + variation_range)
        
        # 순위 역전 지점 찾기
        rank_reversal_points = []
        test_points = np.linspace(min_weight, max_weight, 100)
        
        for test_weight in test_points:
            modified_weights = self._adjust_weights(
                target_criterion, test_weight
            )
            new_ranks = self._calculate_ranks(modified_weights)
            
            if not np.array_equal(original_ranks, new_ranks):
                rank_reversal_points.append(test_weight)
        
        # 안정성 지수 계산
        stability_index = self._calculate_stability_index(
            original_weight, rank_reversal_points, variation_range
        )
        
        # 영향도 점수 계산
        impact_score = self._calculate_impact_score(
            target_criterion, variation_range
        )
        
        return SensitivityResult(
            criterion=f"Criterion_{target_criterion}",
            original_weight=original_weight,
            sensitivity_range=(min_weight, max_weight),
            rank_reversal_points=rank_reversal_points,
            stability_index=stability_index,
            impact_score=impact_score
        )
    
    def group_decision_integration(self, 
                                  individual_matrices: List[np.ndarray],
                                  aggregation_method: str = "geometric_mean",
                                  weights: List[float] = None) -> GroupConsensusResult:
        """
        그룹 의사결정 통합
        
        Args:
            individual_matrices: 개인별 쌍대비교 행렬 리스트
            aggregation_method: 통합 방법 (geometric_mean, arithmetic_mean, weighted)
            weights: 개인별 가중치 (weighted 방법일 때 사용)
            
        Returns:
            GroupConsensusResult: 그룹 통합 결과
        """
        n_individuals = len(individual_matrices)
        
        if n_individuals == 0:
            raise ValueError("At least one individual matrix is required")
        
        # 통합 행렬 계산
        if aggregation_method == "geometric_mean":
            aggregated_matrix = self._geometric_mean_aggregation(individual_matrices)
        elif aggregation_method == "arithmetic_mean":
            aggregated_matrix = self._arithmetic_mean_aggregation(individual_matrices)
        elif aggregation_method == "weighted" and weights:
            aggregated_matrix = self._weighted_aggregation(individual_matrices, weights)
        else:
            raise ValueError(f"Invalid aggregation method: {aggregation_method}")
        
        # 우선순위 벡터 계산
        priorities = self._calculate_priorities(aggregated_matrix)
        
        # 합의 수준 계산
        consensus_level = self._calculate_consensus_level(
            individual_matrices, aggregated_matrix
        )
        
        # 불일치 지수 계산
        disagreement_index = self._calculate_disagreement_index(
            individual_matrices
        )
        
        # 이상치 탐지
        outliers = self._detect_outliers(individual_matrices)
        
        # 신뢰구간 계산
        confidence_interval = self._calculate_confidence_interval(
            individual_matrices, priorities
        )
        
        return GroupConsensusResult(
            aggregation_method=aggregation_method,
            consensus_level=consensus_level,
            disagreement_index=disagreement_index,
            outliers=outliers,
            weighted_priorities=priorities,
            confidence_interval=confidence_interval
        )
    
    def statistical_significance_test(self, 
                                     matrix1: np.ndarray, 
                                     matrix2: np.ndarray,
                                     test_type: str = "wilcoxon") -> Dict:
        """
        통계적 유의성 검증
        
        Args:
            matrix1: 첫 번째 비교 행렬
            matrix2: 두 번째 비교 행렬
            test_type: 검정 유형 (wilcoxon, mann_whitney, t_test)
            
        Returns:
            검정 결과 딕셔너리
        """
        # 행렬을 벡터로 변환
        vec1 = matrix1.flatten()
        vec2 = matrix2.flatten()
        
        if test_type == "wilcoxon":
            statistic, p_value = stats.wilcoxon(vec1, vec2)
        elif test_type == "mann_whitney":
            statistic, p_value = stats.mannwhitneyu(vec1, vec2)
        elif test_type == "t_test":
            statistic, p_value = stats.ttest_rel(vec1, vec2)
        else:
            raise ValueError(f"Invalid test type: {test_type}")
        
        # 효과 크기 계산
        effect_size = self._calculate_effect_size(vec1, vec2)
        
        # 파워 분석
        power = self._calculate_statistical_power(vec1, vec2, effect_size)
        
        return {
            "test_type": test_type,
            "statistic": float(statistic),
            "p_value": float(p_value),
            "significant": p_value < 0.05,
            "effect_size": float(effect_size),
            "power": float(power),
            "interpretation": self._interpret_results(p_value, effect_size)
        }
    
    def monte_carlo_simulation(self, 
                              n_simulations: int = 1000,
                              uncertainty_level: float = 0.1) -> Dict:
        """
        몬테카를로 시뮬레이션을 통한 불확실성 분석
        
        Args:
            n_simulations: 시뮬레이션 횟수
            uncertainty_level: 불확실성 수준
            
        Returns:
            시뮬레이션 결과
        """
        if self.criteria_weights is None:
            raise ValueError("Criteria weights are required for Monte Carlo simulation")
            
        simulated_weights = []
        rank_distributions = {i: [] for i in range(len(self.criteria_weights))}
        
        for _ in range(n_simulations):
            # 가중치에 노이즈 추가
            noise = np.random.normal(0, uncertainty_level, len(self.criteria_weights))
            perturbed_weights = self.criteria_weights + noise
            perturbed_weights = np.clip(perturbed_weights, 0.001, 0.999)
            perturbed_weights /= perturbed_weights.sum()
            
            simulated_weights.append(perturbed_weights)
            
            # 순위 계산
            ranks = self._calculate_ranks(perturbed_weights)
            for i, rank in enumerate(ranks):
                rank_distributions[i].append(rank)
        
        # 통계 계산
        weights_array = np.array(simulated_weights)
        mean_weights = weights_array.mean(axis=0)
        std_weights = weights_array.std(axis=0)
        
        # 순위 안정성 분석
        rank_stability = {}
        for i, ranks in rank_distributions.items():
            unique, counts = np.unique(ranks, return_counts=True)
            most_frequent_rank = unique[np.argmax(counts)]
            stability = counts.max() / n_simulations
            rank_stability[i] = {
                "most_frequent_rank": int(most_frequent_rank),
                "stability": float(stability)
            }
        
        return {
            "n_simulations": n_simulations,
            "uncertainty_level": uncertainty_level,
            "mean_weights": mean_weights.tolist(),
            "std_weights": std_weights.tolist(),
            "rank_stability": rank_stability,
            "overall_stability": np.mean([v["stability"] for v in rank_stability.values()])
        }
    
    # Helper methods
    def _calculate_ranks(self, weights: np.ndarray) -> np.ndarray:
        """가중치 기반 순위 계산"""
        return np.argsort(-weights) + 1
    
    def _adjust_weights(self, target_idx: int, new_weight: float) -> np.ndarray:
        """특정 기준의 가중치 조정"""
        adjusted = self.criteria_weights.copy()
        old_weight = adjusted[target_idx]
        adjusted[target_idx] = new_weight
        
        # 다른 가중치 비례 조정
        if old_weight != 1.0:
            scale_factor = (1 - new_weight) / (1 - old_weight)
            for i in range(len(adjusted)):
                if i != target_idx:
                    adjusted[i] *= scale_factor
                    
        return adjusted / adjusted.sum()
    
    def _calculate_stability_index(self, original_weight: float, 
                                  reversal_points: List[float],
                                  range_size: float) -> float:
        """안정성 지수 계산"""
        if not reversal_points:
            return 1.0
        
        # 가장 가까운 역전 지점까지의 거리
        min_distance = min(abs(rp - original_weight) for rp in reversal_points)
        return min_distance / range_size
    
    def _calculate_impact_score(self, criterion_idx: int, 
                               variation_range: float) -> float:
        """영향도 점수 계산"""
        # 간단한 영향도 계산 (실제로는 더 복잡한 알고리즘 사용)
        base_weight = self.criteria_weights[criterion_idx]
        return base_weight * variation_range * 2
    
    def _geometric_mean_aggregation(self, matrices: List[np.ndarray]) -> np.ndarray:
        """기하평균 통합"""
        n = len(matrices[0])
        result = np.ones((n, n))
        
        for i in range(n):
            for j in range(n):
                values = [m[i, j] for m in matrices]
                result[i, j] = np.prod(values) ** (1 / len(values))
                
        return result
    
    def _arithmetic_mean_aggregation(self, matrices: List[np.ndarray]) -> np.ndarray:
        """산술평균 통합"""
        return np.mean(matrices, axis=0)
    
    def _weighted_aggregation(self, matrices: List[np.ndarray], 
                             weights: List[float]) -> np.ndarray:
        """가중 통합"""
        weights = np.array(weights) / np.sum(weights)
        result = np.zeros_like(matrices[0])
        
        for matrix, weight in zip(matrices, weights):
            result += matrix * weight
            
        return result
    
    def _calculate_priorities(self, matrix: np.ndarray) -> np.ndarray:
        """우선순위 벡터 계산 (고유벡터 방법)"""
        eigenvalues, eigenvectors = np.linalg.eig(matrix)
        max_idx = np.argmax(eigenvalues.real)
        priority_vector = np.abs(eigenvectors[:, max_idx].real)
        return priority_vector / priority_vector.sum()
    
    def _calculate_consensus_level(self, individual_matrices: List[np.ndarray],
                                  aggregated_matrix: np.ndarray) -> float:
        """합의 수준 계산"""
        distances = []
        for matrix in individual_matrices:
            # Frobenius norm을 사용한 거리 계산
            distance = np.linalg.norm(matrix - aggregated_matrix, 'fro')
            distances.append(distance)
            
        # 정규화된 합의 수준 (0~1)
        max_distance = np.max(distances) if distances else 1
        avg_distance = np.mean(distances)
        return 1 - (avg_distance / max_distance) if max_distance > 0 else 1
    
    def _calculate_disagreement_index(self, matrices: List[np.ndarray]) -> float:
        """불일치 지수 계산"""
        n_matrices = len(matrices)
        if n_matrices < 2:
            return 0.0
            
        total_distance = 0
        count = 0
        
        for i in range(n_matrices):
            for j in range(i + 1, n_matrices):
                distance = np.linalg.norm(matrices[i] - matrices[j], 'fro')
                total_distance += distance
                count += 1
                
        return total_distance / count if count > 0 else 0
    
    def _detect_outliers(self, matrices: List[np.ndarray]) -> List[str]:
        """이상치 탐지"""
        if len(matrices) < 3:
            return []
            
        # 각 행렬의 평균과의 거리 계산
        mean_matrix = np.mean(matrices, axis=0)
        distances = [np.linalg.norm(m - mean_matrix, 'fro') for m in matrices]
        
        # Z-score 기반 이상치 탐지
        z_scores = stats.zscore(distances)
        outlier_indices = np.where(np.abs(z_scores) > 2)[0]
        
        return [f"Individual_{i}" for i in outlier_indices]
    
    def _calculate_confidence_interval(self, matrices: List[np.ndarray],
                                      priorities: np.ndarray,
                                      confidence: float = 0.95) -> Tuple[float, float]:
        """신뢰구간 계산"""
        # 각 행렬에서 우선순위 계산
        all_priorities = []
        for matrix in matrices:
            p = self._calculate_priorities(matrix)
            all_priorities.append(p)
            
        all_priorities = np.array(all_priorities)
        
        # 부트스트랩 방법으로 신뢰구간 계산
        n_bootstrap = 1000
        bootstrap_means = []
        
        for _ in range(n_bootstrap):
            indices = np.random.choice(len(all_priorities), len(all_priorities), replace=True)
            bootstrap_sample = all_priorities[indices]
            bootstrap_means.append(np.mean(bootstrap_sample, axis=0))
            
        bootstrap_means = np.array(bootstrap_means)
        
        # 백분위수 방법
        alpha = 1 - confidence
        lower = np.percentile(bootstrap_means.mean(axis=1), alpha/2 * 100)
        upper = np.percentile(bootstrap_means.mean(axis=1), (1 - alpha/2) * 100)
        
        return (float(lower), float(upper))
    
    def _calculate_effect_size(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """효과 크기 계산 (Cohen's d)"""
        diff = np.mean(vec1) - np.mean(vec2)
        pooled_std = np.sqrt((np.var(vec1) + np.var(vec2)) / 2)
        return diff / pooled_std if pooled_std > 0 else 0
    
    def _calculate_statistical_power(self, vec1: np.ndarray, vec2: np.ndarray,
                                    effect_size: float) -> float:
        """통계적 검정력 계산 (간소화된 버전)"""
        n = len(vec1)
        # 간단한 근사식 사용
        if effect_size == 0:
            return 0.05
        
        # Cohen's d와 샘플 크기를 기반으로 한 근사
        z_alpha = 1.96  # 유의수준 0.05
        z_beta = effect_size * np.sqrt(n / 2) - z_alpha
        power = stats.norm.cdf(z_beta)
        
        return min(max(power, 0.05), 0.99)
    
    def _interpret_results(self, p_value: float, effect_size: float) -> str:
        """결과 해석"""
        if p_value < 0.01:
            sig_level = "매우 유의"
        elif p_value < 0.05:
            sig_level = "유의"
        else:
            sig_level = "유의하지 않음"
            
        if abs(effect_size) < 0.2:
            effect_level = "작은 효과"
        elif abs(effect_size) < 0.5:
            effect_level = "중간 효과"
        elif abs(effect_size) < 0.8:
            effect_level = "큰 효과"
        else:
            effect_level = "매우 큰 효과"
            
        return f"{sig_level} (p={p_value:.4f}), {effect_level} (d={effect_size:.2f})"


class ReportGenerator:
    """보고서 생성 클래스"""
    
    def __init__(self, analysis_results: Dict):
        """
        Args:
            analysis_results: 분석 결과 딕셔너리
        """
        self.results = analysis_results
        
    def generate_summary(self) -> Dict:
        """요약 보고서 생성"""
        return {
            "project_info": self.results.get("project_info", {}),
            "key_findings": self._extract_key_findings(),
            "recommendations": self._generate_recommendations(),
            "risk_assessment": self._assess_risks(),
            "confidence_level": self._calculate_overall_confidence()
        }
    
    def _extract_key_findings(self) -> List[str]:
        """주요 발견사항 추출"""
        findings = []
        
        # 민감도 분석 결과
        if "sensitivity" in self.results:
            for sens in self.results["sensitivity"]:
                if sens.stability_index < 0.3:
                    findings.append(
                        f"{sens.criterion}의 가중치가 불안정합니다 (안정성: {sens.stability_index:.2f})"
                    )
                    
        # 그룹 합의 결과
        if "group_consensus" in self.results:
            consensus = self.results["group_consensus"]
            if consensus.consensus_level < 0.7:
                findings.append(
                    f"그룹 합의 수준이 낮습니다 ({consensus.consensus_level:.2%})"
                )
                
        return findings
    
    def _generate_recommendations(self) -> List[str]:
        """권장사항 생성"""
        recommendations = []
        
        # 민감도 기반 권장사항
        if "sensitivity" in self.results:
            unstable = [s for s in self.results["sensitivity"] if s.stability_index < 0.5]
            if unstable:
                recommendations.append(
                    "불안정한 기준에 대해 추가적인 검토가 필요합니다"
                )
                
        # 합의 기반 권장사항
        if "group_consensus" in self.results:
            consensus = self.results["group_consensus"]
            if consensus.outliers:
                recommendations.append(
                    f"이상치로 탐지된 평가자({', '.join(consensus.outliers)})와 추가 논의가 필요합니다"
                )
                
        return recommendations
    
    def _assess_risks(self) -> Dict:
        """위험 평가"""
        risks = {
            "high": [],
            "medium": [],
            "low": []
        }
        
        # 민감도 위험
        if "sensitivity" in self.results:
            for sens in self.results["sensitivity"]:
                if sens.stability_index < 0.3:
                    risks["high"].append(f"{sens.criterion} 가중치 불안정")
                elif sens.stability_index < 0.6:
                    risks["medium"].append(f"{sens.criterion} 가중치 변동 가능")
                    
        return risks
    
    def _calculate_overall_confidence(self) -> float:
        """전체 신뢰도 계산"""
        confidence_scores = []
        
        if "sensitivity" in self.results:
            avg_stability = np.mean([s.stability_index for s in self.results["sensitivity"]])
            confidence_scores.append(avg_stability)
            
        if "group_consensus" in self.results:
            confidence_scores.append(self.results["group_consensus"].consensus_level)
            
        if "monte_carlo" in self.results:
            confidence_scores.append(self.results["monte_carlo"]["overall_stability"])
            
        return np.mean(confidence_scores) if confidence_scores else 0.5