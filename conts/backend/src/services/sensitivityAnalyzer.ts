/**
 * 민감도 분석 서비스
 * 상위기준 가중치 변화에 따른 대안 순위 변동 분석
 */

import { AHPCalculatorService } from './ahpCalculator';

export interface SensitivityInput {
  criteriaHierarchy: CriterionNode[];
  alternativeScores: AlternativeScore[];
  targetCriterionId: string;
  weightAdjustments: WeightAdjustment[];
}

export interface CriterionNode {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
  localWeight: number;
  globalWeight: number;
  children: CriterionNode[];
}

export interface AlternativeScore {
  alternativeId: string;
  alternativeName: string;
  scoresByCriterion: { [criterionId: string]: number };
  totalScore: number;
  rank: number;
}

export interface WeightAdjustment {
  criterionId: string;
  originalWeight: number;
  newWeight: number;
}

export interface SensitivityResult {
  baselineRanking: AlternativeScore[];
  adjustedRanking: AlternativeScore[];
  rankChanges: RankChange[];
  stabilityIndex: number;
  criticalThresholds: CriticalThreshold[];
}

export interface RankChange {
  alternativeId: string;
  alternativeName: string;
  originalRank: number;
  newRank: number;
  rankDelta: number;
  scoreChange: number;
}

export interface CriticalThreshold {
  fromAlternative: string;
  toAlternative: string;
  thresholdWeight: number;
  description: string;
}

export class SensitivityAnalyzer {

  /**
   * 실시간 민감도 분석 수행
   * @param input 민감도 분석 입력 데이터
   * @returns 민감도 분석 결과
   */
  static performRealTimeSensitivity(input: SensitivityInput): SensitivityResult {
    const { criteriaHierarchy, alternativeScores, targetCriterionId, weightAdjustments } = input;

    // 1. 기준선 순위 설정
    const baselineRanking = [...alternativeScores].sort((a, b) => b.totalScore - a.totalScore);

    // 2. 가중치 조정 적용
    const adjustedHierarchy = this.applyWeightAdjustments(criteriaHierarchy, weightAdjustments);

    // 3. 글로벌 가중치 재계산
    const newGlobalWeights = this.recalculateGlobalWeights(adjustedHierarchy);

    // 4. 대안 점수 재계산
    const adjustedScores = this.recalculateAlternativeScores(alternativeScores, newGlobalWeights);

    // 5. 새로운 순위 계산
    const adjustedRanking = adjustedScores
      .map((alt, index) => ({ ...alt, rank: index + 1 }))
      .sort((a, b) => b.totalScore - a.totalScore);

    // 6. 순위 변화 분석
    const rankChanges = this.analyzeRankChanges(baselineRanking, adjustedRanking);

    // 7. 안정성 지수 계산
    const stabilityIndex = this.calculateStabilityIndex(rankChanges);

    // 8. 임계값 분석
    const criticalThresholds = this.findCriticalThresholds(
      criteriaHierarchy, 
      alternativeScores, 
      targetCriterionId
    );

    return {
      baselineRanking,
      adjustedRanking,
      rankChanges,
      stabilityIndex,
      criticalThresholds
    };
  }

  /**
   * 가중치 조정 적용
   * @param hierarchy 기준 계층구조
   * @param adjustments 가중치 조정 목록
   * @returns 조정된 계층구조
   */
  private static applyWeightAdjustments(
    hierarchy: CriterionNode[], 
    adjustments: WeightAdjustment[]
  ): CriterionNode[] {
    
    const adjustmentMap = new Map(adjustments.map(adj => [adj.criterionId, adj.newWeight]));
    
    const applyToNode = (node: CriterionNode): CriterionNode => {
      const newWeight = adjustmentMap.get(node.id) ?? node.localWeight;
      
      return {
        ...node,
        localWeight: newWeight,
        children: node.children.map(applyToNode)
      };
    };

    return hierarchy.map(applyToNode);
  }

  /**
   * 글로벌 가중치 재계산
   * @param hierarchy 조정된 계층구조
   * @returns 새로운 글로벌 가중치 맵
   */
  private static recalculateGlobalWeights(hierarchy: CriterionNode[]): Map<string, number> {
    const globalWeights = new Map<string, number>();

    const calculateRecursive = (node: CriterionNode, parentGlobalWeight: number = 1.0): void => {
      const globalWeight = parentGlobalWeight * node.localWeight;
      globalWeights.set(node.id, globalWeight);

      // 하위 기준들의 가중치 정규화
      if (node.children.length > 0) {
        const childrenSum = node.children.reduce((sum, child) => sum + child.localWeight, 0);
        
        node.children.forEach(child => {
          const normalizedWeight = childrenSum > 0 ? child.localWeight / childrenSum : 0;
          calculateRecursive({
            ...child,
            localWeight: normalizedWeight
          }, globalWeight);
        });
      }
    };

    // 최상위 기준들의 가중치 정규화
    const rootSum = hierarchy.reduce((sum, node) => sum + node.localWeight, 0);
    hierarchy.forEach(node => {
      const normalizedWeight = rootSum > 0 ? node.localWeight / rootSum : 0;
      calculateRecursive({
        ...node,
        localWeight: normalizedWeight
      });
    });

    return globalWeights;
  }

  /**
   * 대안 점수 재계산
   * @param originalScores 기존 대안 점수
   * @param newGlobalWeights 새로운 글로벌 가중치
   * @returns 재계산된 대안 점수
   */
  private static recalculateAlternativeScores(
    originalScores: AlternativeScore[], 
    newGlobalWeights: Map<string, number>
  ): AlternativeScore[] {
    
    return originalScores.map(alt => {
      let newTotalScore = 0;
      
      // 각 기준에 대한 점수 × 새로운 글로벌 가중치
      Object.entries(alt.scoresByCriterion).forEach(([criterionId, score]) => {
        const globalWeight = newGlobalWeights.get(criterionId) || 0;
        newTotalScore += score * globalWeight;
      });

      return {
        ...alt,
        totalScore: newTotalScore
      };
    });
  }

  /**
   * 순위 변화 분석
   * @param baseline 기준 순위
   * @param adjusted 조정된 순위
   * @returns 순위 변화 목록
   */
  private static analyzeRankChanges(
    baseline: AlternativeScore[], 
    adjusted: AlternativeScore[]
  ): RankChange[] {
    
    const baselineMap = new Map(baseline.map((alt, index) => [alt.alternativeId, index + 1]));
    
    return adjusted.map((alt, newIndex) => {
      const originalRank = baselineMap.get(alt.alternativeId) || 0;
      const newRank = newIndex + 1;
      const originalScore = baseline.find(b => b.alternativeId === alt.alternativeId)?.totalScore || 0;
      
      return {
        alternativeId: alt.alternativeId,
        alternativeName: alt.alternativeName,
        originalRank,
        newRank,
        rankDelta: originalRank - newRank,
        scoreChange: alt.totalScore - originalScore
      };
    });
  }

  /**
   * 안정성 지수 계산
   * @param rankChanges 순위 변화 목록
   * @returns 안정성 지수 (0-1, 1이 가장 안정)
   */
  private static calculateStabilityIndex(rankChanges: RankChange[]): number {
    if (rankChanges.length === 0) return 1;

    // 순위 변화의 표준편차 기반 안정성 계산
    const rankDeltas = rankChanges.map(change => Math.abs(change.rankDelta));
    const averageDelta = rankDeltas.reduce((sum, delta) => sum + delta, 0) / rankDeltas.length;
    const maxPossibleDelta = rankChanges.length - 1;

    return Math.max(0, 1 - (averageDelta / maxPossibleDelta));
  }

  /**
   * 임계값 분석 - 대안 순위가 뒤바뀌는 지점 찾기
   * @param hierarchy 기준 계층구조
   * @param alternativeScores 대안 점수
   * @param targetCriterionId 대상 기준 ID
   * @returns 임계값 목록
   */
  private static findCriticalThresholds(
    hierarchy: CriterionNode[], 
    alternativeScores: AlternativeScore[], 
    targetCriterionId: string
  ): CriticalThreshold[] {
    
    const thresholds: CriticalThreshold[] = [];
    const alternatives = [...alternativeScores].sort((a, b) => b.totalScore - a.totalScore);

    // 인접한 순위 대안들 간의 임계값 계산
    for (let i = 0; i < alternatives.length - 1; i++) {
      const alt1 = alternatives[i];
      const alt2 = alternatives[i + 1];

      const threshold = this.calculateRankingThreshold(alt1, alt2, targetCriterionId);
      
      if (threshold !== null) {
        thresholds.push({
          fromAlternative: alt1.alternativeName,
          toAlternative: alt2.alternativeName,
          thresholdWeight: threshold,
          description: `${alt2.alternativeName}이 ${alt1.alternativeName}을 추월하는 임계 가중치`
        });
      }
    }

    return thresholds.slice(0, 5); // 상위 5개만 반환
  }

  /**
   * 두 대안의 순위가 뒤바뀌는 임계 가중치 계산
   * @param alt1 현재 상위 대안
   * @param alt2 현재 하위 대안
   * @param criterionId 대상 기준 ID
   * @returns 임계 가중치 (null이면 계산 불가)
   */
  private static calculateRankingThreshold(
    alt1: AlternativeScore, 
    alt2: AlternativeScore, 
    criterionId: string
  ): number | null {
    
    const score1_target = alt1.scoresByCriterion[criterionId] || 0;
    const score2_target = alt2.scoresByCriterion[criterionId] || 0;
    
    // 대상 기준 외의 점수 합계 계산
    let score1_others = 0;
    let score2_others = 0;
    
    Object.entries(alt1.scoresByCriterion).forEach(([cId, score]) => {
      if (cId !== criterionId) {
        score1_others += score;
      }
    });
    
    Object.entries(alt2.scoresByCriterion).forEach(([cId, score]) => {
      if (cId !== criterionId) {
        score2_others += score;
      }
    });

    // 순위 역전 조건: score2_target * w + score2_others > score1_target * w + score1_others
    // 해결: w > (score1_others - score2_others) / (score2_target - score1_target)
    
    const denominator = score2_target - score1_target;
    if (Math.abs(denominator) < 1e-10) {
      return null; // 분모가 0에 가까우면 계산 불가
    }

    const threshold = (score1_others - score2_others) / denominator;
    
    // 가중치는 0-1 범위여야 함
    return (threshold >= 0 && threshold <= 1) ? threshold : null;
  }

  /**
   * 그래프 시각화용 데이터 생성
   * @param criterionId 대상 기준 ID
   * @param alternatives 대안 목록
   * @param weightRange 가중치 범위 [min, max]
   * @param steps 계산 단계 수
   * @returns 시각화 데이터
   */
  static generateVisualizationData(
    criterionId: string,
    alternatives: AlternativeScore[],
    weightRange: [number, number] = [0, 1],
    steps: number = 21
  ): { weight: number; rankings: AlternativeScore[] }[] {
    
    const [minWeight, maxWeight] = weightRange;
    const stepSize = (maxWeight - minWeight) / (steps - 1);
    const visualizationData = [];

    for (let i = 0; i < steps; i++) {
      const weight = minWeight + i * stepSize;
      
      // 해당 가중치에서의 순위 계산
      const adjustedAlternatives = alternatives.map(alt => {
        const targetScore = alt.scoresByCriterion[criterionId] || 0;
        const otherScores = Object.entries(alt.scoresByCriterion)
          .filter(([cId]) => cId !== criterionId)
          .reduce((sum, [, score]) => sum + score, 0);
        
        const newTotalScore = targetScore * weight + otherScores * (1 - weight);
        
        return {
          ...alt,
          totalScore: newTotalScore
        };
      }).sort((a, b) => b.totalScore - a.totalScore)
        .map((alt, index) => ({ ...alt, rank: index + 1 }));

      visualizationData.push({
        weight,
        rankings: adjustedAlternatives
      });
    }

    return visualizationData;
  }
}

export default SensitivityAnalyzer;