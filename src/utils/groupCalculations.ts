// 그룹 평가 계산 엔진
// Opus 4.1 설계 기반 AIJ/AIP/Fuzzy 통합 알고리즘

import type {
  AIJResult,
  AIPResult,
  GroupCalculationResult,
  ConsensusMetrics,
  DisagreementAnalysis,
  AggregationConfig
} from '../types/group';
import { calculateEigenvectorPowerMethod, calculateConsistencyRatio } from './hierarchyCalculations';

/**
 * AIJ (Aggregation of Individual Judgments) 방법
 * 개별 판단을 기하평균으로 통합
 */
export function calculateAIJ(
  individualMatrices: number[][][],
  evaluatorWeights?: number[]
): AIJResult {
  const n = individualMatrices[0].length;
  const numEvaluators = individualMatrices.length;
  const weights = evaluatorWeights || Array(numEvaluators).fill(1 / numEvaluators);
  
  // 기하평균 계산을 위한 집계 매트릭스 초기화
  const aggregatedMatrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(1));
  
  // 각 셀에 대해 가중 기하평균 계산
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        let product = 1;
        let totalWeight = 0;
        
        for (let k = 0; k < numEvaluators; k++) {
          if (individualMatrices[k][i][j] > 0) {
            product *= Math.pow(individualMatrices[k][i][j], weights[k]);
            totalWeight += weights[k];
          }
        }
        
        if (totalWeight > 0) {
          aggregatedMatrix[i][j] = Math.pow(product, 1 / totalWeight);
          aggregatedMatrix[j][i] = 1 / aggregatedMatrix[i][j];
        }
      }
    }
  }
  
  // Power Method로 가중치 계산
  const powerResult = calculateEigenvectorPowerMethod(aggregatedMatrix);
  const normalizedWeights = powerResult.weights;
  
  // 일관성 계산
  const consistency = calculateConsistencyRatio(aggregatedMatrix);
  
  // 기하평균 계산 (각 행의 기하평균)
  const geometricMeans: number[] = [];
  for (let i = 0; i < n; i++) {
    let product = 1;
    for (let j = 0; j < n; j++) {
      product *= aggregatedMatrix[i][j];
    }
    geometricMeans.push(Math.pow(product, 1 / n));
  }
  
  return {
    aggregatedMatrix,
    geometricMeans,
    normalizedWeights,
    consistencyRatio: consistency.consistencyRatio
  };
}

/**
 * AIP (Aggregation of Individual Priorities) 방법
 * 개별 우선순위를 집계
 */
export function calculateAIP(
  individualMatrices: number[][][],
  evaluatorIds: string[],
  evaluatorWeights?: number[]
): AIPResult {
  const numEvaluators = individualMatrices.length;
  const n = individualMatrices[0].length;
  const weights = evaluatorWeights || Array(numEvaluators).fill(1 / numEvaluators);
  
  // 각 개별 매트릭스에서 우선순위 계산
  const individualPriorities = individualMatrices.map((matrix, index) => {
    const powerResult = calculateEigenvectorPowerMethod(matrix);
    const consistency = calculateConsistencyRatio(matrix);
    
    return {
      evaluatorId: evaluatorIds[index],
      priorities: powerResult.weights,
      localCR: consistency.consistencyRatio
    };
  });
  
  // 가중 평균으로 우선순위 집계
  const aggregatedPriorities = Array(n).fill(0);
  let totalWeight = 0;
  
  for (let i = 0; i < numEvaluators; i++) {
    const weight = weights[i];
    totalWeight += weight;
    
    for (let j = 0; j < n; j++) {
      aggregatedPriorities[j] += individualPriorities[i].priorities[j] * weight;
    }
  }
  
  // 정규화
  for (let j = 0; j < n; j++) {
    aggregatedPriorities[j] /= totalWeight;
  }
  
  // 가중치 적용한 우선순위 (품질 기반 가중치)
  const weightedPriorities = Array(n).fill(0);
  let qualityWeightSum = 0;
  
  for (let i = 0; i < numEvaluators; i++) {
    const qualityWeight = calculateQualityWeight(
      individualPriorities[i].localCR,
      weights[i]
    );
    qualityWeightSum += qualityWeight;
    
    for (let j = 0; j < n; j++) {
      weightedPriorities[j] += individualPriorities[i].priorities[j] * qualityWeight;
    }
  }
  
  for (let j = 0; j < n; j++) {
    weightedPriorities[j] /= qualityWeightSum;
  }
  
  // 합의도 계산
  const consensusIndex = calculateConsensusIndex(individualPriorities.map(ip => ip.priorities));
  
  return {
    individualPriorities,
    aggregatedPriorities,
    weightedPriorities,
    consensusIndex
  };
}

/**
 * 품질 기반 가중치 계산
 */
function calculateQualityWeight(consistencyRatio: number, baseWeight: number): number {
  // 일관성이 높을수록 가중치 증가
  const consistencyFactor = Math.max(0, 1 - (consistencyRatio / 0.1));
  return baseWeight * (0.5 + 0.5 * consistencyFactor);
}

/**
 * Shannon Entropy 기반 합의도 측정
 */
function calculateConsensusIndex(priorities: number[][]): number {
  const numEvaluators = priorities.length;
  const numElements = priorities[0].length;
  
  let totalEntropy = 0;
  const maxEntropy = Math.log(numEvaluators);
  
  for (let j = 0; j < numElements; j++) {
    let entropy = 0;
    
    // 요소별 상대적 중요도 분포 계산
    const elementPriorities = priorities.map(p => p[j]);
    const sum = elementPriorities.reduce((a, b) => a + b, 0);
    
    if (sum > 0) {
      for (let i = 0; i < numEvaluators; i++) {
        const prob = elementPriorities[i] / sum;
        if (prob > 0) {
          entropy += prob * Math.log(prob);
        }
      }
    }
    
    totalEntropy += Math.abs(entropy);
  }
  
  const avgEntropy = totalEntropy / numElements;
  return 1 - (avgEntropy / maxEntropy);
}

/**
 * Kendall's W (Coefficient of Concordance) 계산
 */
export function calculateKendallsW(rankings: number[][]): number {
  const m = rankings.length; // 평가자 수
  const n = rankings[0].length; // 대안 수
  
  // 순위 합 계산
  const rankSums = Array(n).fill(0);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      rankSums[j] += rankings[i][j];
    }
  }
  
  const meanRankSum = rankSums.reduce((a, b) => a + b, 0) / n;
  
  // S 계산 (편차 제곱합)
  const S = rankSums.reduce((sum, rankSum) => sum + Math.pow(rankSum - meanRankSum, 2), 0);
  
  // 최대 가능한 S
  const maxS = (m * m * (n * n * n - n)) / 12;
  
  return S / maxS;
}

/**
 * 이견 분석
 */
export function analyzeDisagreements(
  individualMatrices: number[][][],
  evaluatorIds: string[],
  threshold: number = 0.5
): DisagreementAnalysis[] {
  const disagreements: DisagreementAnalysis[] = [];
  const numEvaluators = individualMatrices.length;
  const n = individualMatrices[0].length;
  
  // 모든 평가자 쌍에 대해 이견 분석
  for (let e1 = 0; e1 < numEvaluators; e1++) {
    for (let e2 = e1 + 1; e2 < numEvaluators; e2++) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const value1 = individualMatrices[e1][i][j];
          const value2 = individualMatrices[e2][i][j];
          
          // 로그 차이로 이견 수준 계산
          const disagreementLevel = Math.abs(Math.log(value1) - Math.log(value2)) / Math.log(9);
          
          if (disagreementLevel > threshold) {
            disagreements.push({
              id: `${evaluatorIds[e1]}-${evaluatorIds[e2]}-${i}-${j}`,
              groupId: '', // 실제 사용 시 설정
              nodeId: '', // 실제 사용 시 설정
              evaluator1Id: evaluatorIds[e1],
              evaluator2Id: evaluatorIds[e2],
              elementI: i,
              elementJ: j,
              value1,
              value2,
              disagreementLevel,
              impactOnConsensus: disagreementLevel * Math.abs(value1 - value2),
              suggestedResolution: generateResolutionSuggestion(value1, value2)
            });
          }
        }
      }
    }
  }
  
  return disagreements.sort((a, b) => b.impactOnConsensus - a.impactOnConsensus);
}

/**
 * 해결 제안 생성
 */
function generateResolutionSuggestion(value1: number, value2: number): string {
  const geometricMean = Math.sqrt(value1 * value2);
  const arithmeticMean = (value1 + value2) / 2;
  
  if (Math.abs(value1 - value2) < 2) {
    return `작은 차이입니다. 기하평균 ${geometricMean.toFixed(2)} 고려하세요.`;
  } else if (Math.abs(value1 - value2) < 4) {
    return `보통 차이입니다. 추가 토론이 필요합니다. 제안값: ${geometricMean.toFixed(2)}`;
  } else {
    return `큰 차이입니다. 기준과 대안에 대한 재검토가 필요합니다.`;
  }
}

/**
 * 통합된 그룹 계산
 */
export function calculateGroupResult(
  individualMatrices: number[][][],
  evaluatorIds: string[],
  config: AggregationConfig
): GroupCalculationResult {
  let result: AIJResult | AIPResult;
  
  switch (config.method) {
    case 'aij':
      result = calculateAIJ(individualMatrices, config.weights ? 
        evaluatorIds.map(id => config.weights![id]) : undefined);
      break;
    case 'aip':
      result = calculateAIP(individualMatrices, evaluatorIds, config.weights ?
        evaluatorIds.map(id => config.weights![id]) : undefined);
      break;
    default:
      result = calculateAIJ(individualMatrices);
  }
  
  // 합의 지표 계산
  const priorities = individualMatrices.map(matrix => 
    calculateEigenvectorPowerMethod(matrix).weights
  );
  
  const consensusMetrics: ConsensusMetrics = {
    overallConsensus: calculateConsensusIndex(priorities),
    kendallsW: calculateKendallsW(priorities),
    shannonEntropy: calculateShannonEntropy(priorities),
    disagreementMatrix: calculateDisagreementMatrix(individualMatrices),
    criticalDisagreements: analyzeDisagreements(individualMatrices, evaluatorIds)
  };
  
  // 참여자 기여도 계산
  const participantContributions = evaluatorIds.map((id, index) => ({
    evaluatorId: id,
    weight: config.weights?.[id] || (1 / evaluatorIds.length),
    consistency: calculateConsistencyRatio(individualMatrices[index]).consistencyRatio,
    expertise: 1 // 실제 구현 시 외부에서 제공
  }));
  
  // 품질 지표 계산
  const qualityMetrics = {
    overallQuality: consensusMetrics.overallConsensus * 0.7 + 
                   (1 - participantContributions.reduce((sum, p) => sum + p.consistency, 0) / participantContributions.length) * 0.3,
    reliability: consensusMetrics.kendallsW,
    validity: consensusMetrics.overallConsensus
  };
  
  return {
    aggregationMethod: config.method,
    result,
    consensusMetrics,
    participantContributions,
    qualityMetrics
  };
}

/**
 * Shannon Entropy 계산
 */
function calculateShannonEntropy(priorities: number[][]): number {
  const numEvaluators = priorities.length;
  const numElements = priorities[0].length;
  
  let totalEntropy = 0;
  
  for (let j = 0; j < numElements; j++) {
    let entropy = 0;
    const elementPriorities = priorities.map(p => p[j]);
    const sum = elementPriorities.reduce((a, b) => a + b, 0);
    
    if (sum > 0) {
      for (let i = 0; i < numEvaluators; i++) {
        const prob = elementPriorities[i] / sum;
        if (prob > 0) {
          entropy += prob * Math.log2(prob);
        }
      }
    }
    
    totalEntropy += Math.abs(entropy);
  }
  
  return totalEntropy / numElements;
}

/**
 * 이견 매트릭스 계산
 */
function calculateDisagreementMatrix(individualMatrices: number[][][]): number[][] {
  const numEvaluators = individualMatrices.length;
  const disagreementMatrix: number[][] = Array(numEvaluators).fill(null)
    .map(() => Array(numEvaluators).fill(0));
  
  for (let e1 = 0; e1 < numEvaluators; e1++) {
    for (let e2 = 0; e2 < numEvaluators; e2++) {
      if (e1 !== e2) {
        disagreementMatrix[e1][e2] = calculateMatrixDistance(
          individualMatrices[e1],
          individualMatrices[e2]
        );
      }
    }
  }
  
  return disagreementMatrix;
}

/**
 * 매트릭스 간 거리 계산
 */
function calculateMatrixDistance(matrix1: number[][], matrix2: number[][]): number {
  const n = matrix1.length;
  let totalDistance = 0;
  let count = 0;
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const logDiff = Math.abs(Math.log(matrix1[i][j]) - Math.log(matrix2[i][j]));
      totalDistance += logDiff;
      count++;
    }
  }
  
  return count > 0 ? totalDistance / count : 0;
}