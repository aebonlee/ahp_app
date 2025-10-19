/**
 * AHP (Analytic Hierarchy Process) 계산 엔진
 * 사용자가 요구한 체계적인 계산 및 결과 분석 시스템
 */

export interface AHPNode {
  id: string;
  name: string;
  type: 'goal' | 'criteria' | 'sub_criteria' | 'sub_sub_criteria' | 'alternative';
  parent_id?: string;
  children: string[];
  level: number;
  weight?: number;
  local_weight?: number;
  global_weight?: number;
}

export interface PairwiseComparison {
  id: string;
  evaluator_id: string;
  node_a: string;
  node_b: string;
  parent_node: string;
  value: number; // 1/9 ~ 9 사이의 값
  consistency_ratio?: number;
}

export interface AHPResult {
  project_id: string;
  evaluator_id?: string;
  is_group_result: boolean;
  node_weights: Record<string, number>;
  alternative_scores: Record<string, number>;
  alternative_rankings: Array<{
    id: string;
    name: string;
    score: number;
    rank: number;
  }>;
  consistency_ratios: Record<string, number>;
  overall_consistency: number;
  calculation_timestamp: string;
}

export interface GroupAggregationResult {
  individual_results: AHPResult[];
  aggregated_result: AHPResult;
  consensus_level: number;
  disagreement_analysis: Array<{
    criterion: string;
    disagreement_level: number;
    outlier_evaluators: string[];
  }>;
}

/**
 * 쌍대비교 행렬에서 가중치 계산 (고유벡터 방법)
 */
export function calculateWeightsFromMatrix(matrix: number[][]): number[] {
  const n = matrix.length;
  if (n === 0) return [];

  // 정규화된 열 합계 방법 (Normalized Column Sum)
  const columnSums = new Array(n).fill(0);
  
  // 각 열의 합계 계산
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      columnSums[j] += matrix[i][j];
    }
  }

  // 정규화된 행렬 생성
  const normalizedMatrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    normalizedMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      normalizedMatrix[i][j] = matrix[i][j] / columnSums[j];
    }
  }

  // 각 행의 평균이 가중치
  const weights: number[] = [];
  for (let i = 0; i < n; i++) {
    const rowSum = normalizedMatrix[i].reduce((sum, val) => sum + val, 0);
    weights[i] = rowSum / n;
  }

  return weights;
}

/**
 * 일관성 비율 계산
 */
export function calculateConsistencyRatio(matrix: number[][]): number {
  const n = matrix.length;
  if (n <= 2) return 0; // 2x2 이하는 항상 일관됨

  // 랜덤 일관성 지수 (Random Index)
  const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
  
  if (n > RI.length) {
    console.warn(`Matrix size ${n} exceeds RI table. Using approximation.`);
    return 0.1; // 근사값 반환
  }

  const weights = calculateWeightsFromMatrix(matrix);
  
  // λmax 계산
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += matrix[i][j] * weights[j];
    }
    lambdaMax += sum / weights[i];
  }
  lambdaMax /= n;

  // 일관성 지수 (CI)
  const CI = (lambdaMax - n) / (n - 1);
  
  // 일관성 비율 (CR)
  const CR = CI / RI[n - 1];
  
  return CR;
}

/**
 * 쌍대비교 결과를 행렬로 변환
 */
export function buildMatrixFromComparisons(
  nodeIds: string[], 
  comparisons: PairwiseComparison[]
): number[][] {
  const n = nodeIds.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(1));

  // 대각선 원소는 1
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
  }

  // 비교 결과를 행렬에 반영
  comparisons.forEach(comp => {
    const indexA = nodeIds.indexOf(comp.node_a);
    const indexB = nodeIds.indexOf(comp.node_b);
    
    if (indexA !== -1 && indexB !== -1) {
      matrix[indexA][indexB] = comp.value;
      matrix[indexB][indexA] = 1 / comp.value; // 역수 관계
    }
  });

  return matrix;
}

/**
 * 개별 평가자의 AHP 결과 계산
 */
export function calculateIndividualAHP(
  nodes: AHPNode[],
  comparisons: PairwiseComparison[],
  evaluatorId: string
): AHPResult {
  const result: AHPResult = {
    project_id: nodes[0]?.id.split('_')[0] || 'unknown',
    evaluator_id: evaluatorId,
    is_group_result: false,
    node_weights: {},
    alternative_scores: {},
    alternative_rankings: [],
    consistency_ratios: {},
    overall_consistency: 0,
    calculation_timestamp: new Date().toISOString()
  };

  // 평가자별 비교 데이터 필터링
  const evaluatorComparisons = comparisons.filter(c => c.evaluator_id === evaluatorId);

  // 레벨별로 노드 그룹화
  const nodesByLevel = new Map<number, AHPNode[]>();
  nodes.forEach(node => {
    if (!nodesByLevel.has(node.level)) {
      nodesByLevel.set(node.level, []);
    }
    nodesByLevel.get(node.level)!.push(node);
  });

  // 레벨별로 가중치 계산 (상위 레벨부터)
  const levels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
  
  levels.forEach(level => {
    const levelNodes = nodesByLevel.get(level) || [];
    
    if (level === 0) {
      // 목표 노드 (가중치 1)
      levelNodes.forEach(node => {
        result.node_weights[node.id] = 1;
      });
      return;
    }

    // 부모별로 노드 그룹화
    const nodesByParent = new Map<string, AHPNode[]>();
    levelNodes.forEach(node => {
      const parentId = node.parent_id || 'root';
      if (!nodesByParent.has(parentId)) {
        nodesByParent.set(parentId, []);
      }
      nodesByParent.get(parentId)!.push(node);
    });

    // 각 부모 그룹별로 가중치 계산
    nodesByParent.forEach((siblings, parentId) => {
      if (siblings.length === 1) {
        // 자식이 하나면 가중치 1
        result.node_weights[siblings[0].id] = 1;
        result.consistency_ratios[parentId] = 0;
        return;
      }

      // 쌍대비교 행렬 구성
      const siblingIds = siblings.map(n => n.id);
      const parentComparisons = evaluatorComparisons.filter(c => 
        c.parent_node === parentId && 
        siblingIds.includes(c.node_a) && 
        siblingIds.includes(c.node_b)
      );

      const matrix = buildMatrixFromComparisons(siblingIds, parentComparisons);
      const localWeights = calculateWeightsFromMatrix(matrix);
      const cr = calculateConsistencyRatio(matrix);

      // 로컬 가중치 저장
      siblings.forEach((node, index) => {
        result.node_weights[node.id] = localWeights[index] || (1 / siblings.length);
      });

      result.consistency_ratios[parentId] = cr;
    });
  });

  // 글로벌 가중치 계산 (부모의 글로벌 가중치 × 자신의 로컬 가중치)
  const globalWeights: Record<string, number> = {};
  
  levels.forEach(level => {
    const levelNodes = nodesByLevel.get(level) || [];
    
    levelNodes.forEach(node => {
      if (level === 0) {
        globalWeights[node.id] = 1;
      } else {
        const parentWeight = globalWeights[node.parent_id || ''] || 1;
        const localWeight = result.node_weights[node.id] || 0;
        globalWeights[node.id] = parentWeight * localWeight;
      }
    });
  });

  // 대안 점수 계산
  const alternatives = nodes.filter(n => n.type === 'alternative');
  const criteria = nodes.filter(n => n.type !== 'goal' && n.type !== 'alternative');

  alternatives.forEach(alt => {
    let totalScore = 0;
    
    criteria.forEach(criterion => {
      // 기준별 대안 비교에서 해당 대안의 가중치
      const altComparisons = evaluatorComparisons.filter(c => 
        c.parent_node === criterion.id
      );
      
      if (altComparisons.length > 0) {
        const altIds = alternatives.map(a => a.id);
        const altMatrix = buildMatrixFromComparisons(altIds, altComparisons);
        const altWeights = calculateWeightsFromMatrix(altMatrix);
        const altIndex = altIds.indexOf(alt.id);
        
        if (altIndex !== -1) {
          const criterionGlobalWeight = globalWeights[criterion.id] || 0;
          const altWeightForCriterion = altWeights[altIndex] || 0;
          totalScore += criterionGlobalWeight * altWeightForCriterion;
        }
      }
    });
    
    result.alternative_scores[alt.id] = totalScore;
  });

  // 대안 순위 계산
  const sortedAlternatives = alternatives
    .map(alt => ({
      id: alt.id,
      name: alt.name,
      score: result.alternative_scores[alt.id] || 0,
      rank: 0
    }))
    .sort((a, b) => b.score - a.score);

  sortedAlternatives.forEach((alt, index) => {
    alt.rank = index + 1;
  });

  result.alternative_rankings = sortedAlternatives;

  // 전체 일관성 계산 (평균)
  const crValues = Object.values(result.consistency_ratios);
  result.overall_consistency = crValues.length > 0 
    ? crValues.reduce((sum, cr) => sum + cr, 0) / crValues.length 
    : 0;

  return result;
}

/**
 * 그룹 의사결정 집계 (기하평균 방법)
 */
export function aggregateGroupDecision(
  individualResults: AHPResult[]
): GroupAggregationResult {
  if (individualResults.length === 0) {
    throw new Error('No individual results to aggregate');
  }

  const firstResult = individualResults[0];
  const aggregatedResult: AHPResult = {
    project_id: firstResult.project_id,
    evaluator_id: undefined,
    is_group_result: true,
    node_weights: {},
    alternative_scores: {},
    alternative_rankings: [],
    consistency_ratios: {},
    overall_consistency: 0,
    calculation_timestamp: new Date().toISOString()
  };

  // 대안별 점수 집계 (기하평균)
  const alternativeIds = Object.keys(firstResult.alternative_scores);
  
  alternativeIds.forEach(altId => {
    const scores = individualResults
      .map(result => result.alternative_scores[altId] || 0)
      .filter(score => score > 0);
    
    if (scores.length > 0) {
      // 기하평균 계산
      const geometricMean = Math.pow(
        scores.reduce((product, score) => product * score, 1),
        1 / scores.length
      );
      aggregatedResult.alternative_scores[altId] = geometricMean;
    }
  });

  // 집계된 순위 계산
  const aggregatedAlts = Object.entries(aggregatedResult.alternative_scores)
    .map(([id, score]) => {
      const sampleResult = individualResults[0];
      const alt = sampleResult.alternative_rankings.find(a => a.id === id);
      return {
        id,
        name: alt?.name || id,
        score,
        rank: 0
      };
    })
    .sort((a, b) => b.score - a.score);

  aggregatedAlts.forEach((alt, index) => {
    alt.rank = index + 1;
  });

  aggregatedResult.alternative_rankings = aggregatedAlts;

  // 일관성 집계 (평균)
  const allCRKeys = new Set<string>();
  individualResults.forEach(result => {
    Object.keys(result.consistency_ratios).forEach(key => allCRKeys.add(key));
  });

  allCRKeys.forEach(key => {
    const crs = individualResults
      .map(result => result.consistency_ratios[key])
      .filter(cr => cr !== undefined);
    
    if (crs.length > 0) {
      aggregatedResult.consistency_ratios[key] = 
        crs.reduce((sum, cr) => sum + cr, 0) / crs.length;
    }
  });

  // 전체 일관성
  const crValues = Object.values(aggregatedResult.consistency_ratios);
  aggregatedResult.overall_consistency = crValues.length > 0 
    ? crValues.reduce((sum, cr) => sum + cr, 0) / crValues.length 
    : 0;

  // 의견 일치도 분석
  const consensusLevel = calculateConsensusLevel(individualResults);
  
  // 의견 불일치 분석
  const disagreementAnalysis = analyzeDisagreement(individualResults);

  return {
    individual_results: individualResults,
    aggregated_result: aggregatedResult,
    consensus_level: consensusLevel,
    disagreement_analysis: disagreementAnalysis
  };
}

/**
 * 의견 일치도 계산
 */
function calculateConsensusLevel(results: AHPResult[]): number {
  if (results.length <= 1) return 1;

  const alternativeIds = Object.keys(results[0].alternative_scores);
  let totalVariance = 0;

  alternativeIds.forEach(altId => {
    const scores = results.map(r => r.alternative_scores[altId] || 0);
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    totalVariance += variance;
  });

  const avgVariance = totalVariance / alternativeIds.length;
  
  // 분산이 낮을수록 일치도가 높음 (0~1 사이로 정규화)
  return Math.max(0, 1 - avgVariance * 10);
}

/**
 * 의견 불일치 분석
 */
function analyzeDisagreement(results: AHPResult[]): Array<{
  criterion: string;
  disagreement_level: number;
  outlier_evaluators: string[];
}> {
  const analysis: Array<{
    criterion: string;
    disagreement_level: number;
    outlier_evaluators: string[];
  }> = [];

  // 각 대안별로 분석
  const alternativeIds = Object.keys(results[0].alternative_scores);
  
  alternativeIds.forEach(altId => {
    const scores = results.map((r, index) => ({
      evaluatorId: r.evaluator_id || `evaluator_${index}`,
      score: r.alternative_scores[altId] || 0
    }));

    const mean = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    const stdDev = Math.sqrt(
      scores.reduce((sum, s) => sum + Math.pow(s.score - mean, 2), 0) / scores.length
    );

    // 이상치 탐지 (평균에서 2 표준편차 이상 떨어진 평가자)
    const outliers = scores
      .filter(s => Math.abs(s.score - mean) > 2 * stdDev)
      .map(s => s.evaluatorId);

    analysis.push({
      criterion: altId,
      disagreement_level: stdDev / (mean || 1), // 변동계수
      outlier_evaluators: outliers
    });
  });

  return analysis.sort((a, b) => b.disagreement_level - a.disagreement_level);
}

/**
 * 민감도 분석
 */
export function performSensitivityAnalysis(
  baseResult: AHPResult,
  nodes: AHPNode[],
  comparisons: PairwiseComparison[],
  perturbationPercentage: number = 0.1
): Array<{
  criterion: string;
  original_weight: number;
  perturbed_weight: number;
  ranking_stability: number;
  affected_alternatives: string[];
}> {
  const sensitivityResults: Array<{
    criterion: string;
    original_weight: number;
    perturbed_weight: number;
    ranking_stability: number;
    affected_alternatives: string[];
  }> = [];

  const criteria = nodes.filter(n => n.type === 'criteria');
  const originalRanking = baseResult.alternative_rankings.map(a => a.id);

  criteria.forEach(criterion => {
    // 기준 가중치 변경
    const perturbedComparisons = comparisons.map(comp => {
      if (comp.node_a === criterion.id || comp.node_b === criterion.id) {
        const perturbation = 1 + (Math.random() - 0.5) * 2 * perturbationPercentage;
        return { ...comp, value: comp.value * perturbation };
      }
      return comp;
    });

    // 변경된 가중치로 재계산
    const perturbedResult = calculateIndividualAHP(
      nodes, 
      perturbedComparisons, 
      baseResult.evaluator_id || 'sensitivity_test'
    );

    const newRanking = perturbedResult.alternative_rankings.map(a => a.id);
    
    // 순위 안정성 계산 (Kendall's tau)
    const rankingStability = calculateKendallTau(originalRanking, newRanking);
    
    // 영향 받은 대안들
    const affectedAlternatives = originalRanking.filter((altId, index) => 
      newRanking[index] !== altId
    );

    sensitivityResults.push({
      criterion: criterion.name,
      original_weight: baseResult.node_weights[criterion.id] || 0,
      perturbed_weight: perturbedResult.node_weights[criterion.id] || 0,
      ranking_stability: rankingStability,
      affected_alternatives: affectedAlternatives
    });
  });

  return sensitivityResults.sort((a, b) => a.ranking_stability - b.ranking_stability);
}

/**
 * Kendall's tau 계산 (순위 상관관계)
 */
function calculateKendallTau(ranking1: string[], ranking2: string[]): number {
  if (ranking1.length !== ranking2.length) return 0;

  let concordant = 0;
  let discordant = 0;
  const n = ranking1.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const pos1i = ranking1.indexOf(ranking1[i]);
      const pos1j = ranking1.indexOf(ranking1[j]);
      const pos2i = ranking2.indexOf(ranking1[i]);
      const pos2j = ranking2.indexOf(ranking1[j]);

      if ((pos1i < pos1j && pos2i < pos2j) || (pos1i > pos1j && pos2i > pos2j)) {
        concordant++;
      } else {
        discordant++;
      }
    }
  }

  return (concordant - discordant) / (n * (n - 1) / 2);
}

/**
 * AHP 결과 검증
 */
export function validateAHPResult(result: AHPResult): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // 일관성 비율 검증
  Object.entries(result.consistency_ratios).forEach(([nodeId, cr]) => {
    if (cr > 0.1) {
      issues.push(`노드 ${nodeId}의 일관성 비율이 높습니다 (${(cr * 100).toFixed(1)}%)`);
      recommendations.push(`노드 ${nodeId}의 쌍대비교를 재검토하세요`);
    }
  });

  // 전체 일관성 검증
  if (result.overall_consistency > 0.1) {
    issues.push(`전체 일관성 비율이 높습니다 (${(result.overall_consistency * 100).toFixed(1)}%)`);
    recommendations.push('일관성이 낮은 비교들을 재검토하여 판단 일관성을 높이세요');
  }

  // 가중치 합계 검증 (각 레벨별로)
  const totalScore = Object.values(result.alternative_scores).reduce((sum, score) => sum + score, 0);
  if (Math.abs(totalScore - 1) > 0.01) {
    issues.push('대안 점수의 합이 1과 차이가 납니다');
    recommendations.push('계산 과정을 재검토하세요');
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  };
}

export default {
  calculateWeightsFromMatrix,
  calculateConsistencyRatio,
  buildMatrixFromComparisons,
  calculateIndividualAHP,
  aggregateGroupDecision,
  performSensitivityAnalysis,
  validateAHPResult
};