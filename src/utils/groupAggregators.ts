import { calculateAHPEnhanced, calculateEigenVectorPowerMethod } from './ahpCalculator';

// 그룹 합의 알고리즘 구현
// Opus 설계 문서 기반 AIJ, AIP, Fuzzy 통합 방법론

export interface AggregationResult {
  matrix: number[][];
  weights: number[];
  consistencyRatio: number;
  isConsistent: boolean;
  method: string;
  participantCount: number;
  consensusIndex?: number;
}

export interface FuzzyNumber {
  l: number; // Lower
  m: number; // Middle 
  u: number; // Upper
}

export interface ConsensusMetrics {
  overallConsensus: number; // 0-1
  kendallsW: number;
  shannonEntropy: number;
  disagreementMatrix: number[][];
  criticalDisagreements: Array<{
    id: string;
    groupId: string;
    nodeId: string;
    evaluator1Id: string;
    evaluator2Id: string;
    elementI: number;
    elementJ: number;
    value1: number;
    value2: number;
    disagreementLevel: number;
    impactOnConsensus: number;
    suggestedResolution?: string;
  }>;
}

/**
 * AIJ (Aggregation of Individual Judgments) - 기하평균 통합
 */
export class AIJAggregator {
  /**
   * 기하평균을 이용한 그룹 매트릭스 통합
   */
  static aggregate(matrices: number[][][]): AggregationResult {
    if (matrices.length === 0) {
      throw new Error('통합할 매트릭스가 없습니다.');
    }

    const n = matrices[0].length;
    const k = matrices.length;
    const aggregatedMatrix = this.initializeMatrix(n);

    // 각 요소별 기하평균 계산
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          aggregatedMatrix[i][j] = 1;
          continue;
        }

        // 모든 평가자의 판단값 수집
        const values = matrices.map(matrix => matrix[i][j]);
        
        // 기하평균 계산: (a1 * a2 * ... * ak)^(1/k)
        const geometricMean = this.calculateGeometricMean(values);
        aggregatedMatrix[i][j] = geometricMean;
      }
    }

    // 일관성 검증 및 가중치 계산
    const ahpResult = calculateAHPEnhanced(aggregatedMatrix, 'power');
    const consensusIndex = this.calculateConsensusIndex(matrices, aggregatedMatrix);

    return {
      matrix: aggregatedMatrix,
      weights: ahpResult.eigenVector,
      consistencyRatio: ahpResult.consistencyRatio,
      isConsistent: ahpResult.isConsistent,
      method: 'AIJ_geometric_mean',
      participantCount: k,
      consensusIndex
    };
  }

  /**
   * 가중 기하평균 통합 (전문성 가중치 적용)
   */
  static weightedAggregate(
    matrices: number[][][],
    weights: number[]
  ): AggregationResult {
    if (matrices.length !== weights.length) {
      throw new Error('매트릭스와 가중치 개수가 일치하지 않습니다.');
    }

    const n = matrices[0].length;
    const k = matrices.length;
    const aggregatedMatrix = this.initializeMatrix(n);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // 가중 기하평균 계산
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          aggregatedMatrix[i][j] = 1;
          continue;
        }

        // 가중 기하평균: ∏(aij^wi)
        let weightedProduct = 1;
        for (let k = 0; k < matrices.length; k++) {
          const normalizedWeight = weights[k] / totalWeight;
          weightedProduct *= Math.pow(matrices[k][i][j], normalizedWeight);
        }
        aggregatedMatrix[i][j] = weightedProduct;
      }
    }

    const ahpResult = calculateAHPEnhanced(aggregatedMatrix, 'power');
    const consensusIndex = this.calculateConsensusIndex(matrices, aggregatedMatrix);

    return {
      matrix: aggregatedMatrix,
      weights: ahpResult.eigenVector,
      consistencyRatio: ahpResult.consistencyRatio,
      isConsistent: ahpResult.isConsistent,
      method: 'AIJ_weighted_geometric',
      participantCount: k,
      consensusIndex
    };
  }

  private static calculateGeometricMean(values: number[]): number {
    const product = values.reduce((acc, val) => acc * val, 1);
    return Math.pow(product, 1 / values.length);
  }

  private static calculateConsensusIndex(
    individualMatrices: number[][][],
    aggregatedMatrix: number[][]
  ): number {
    if (individualMatrices.length <= 1) return 1;

    const n = aggregatedMatrix.length;
    let totalDeviation = 0;
    let totalComparisons = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const aggregatedValue = aggregatedMatrix[i][j];
        let deviation = 0;

        for (const matrix of individualMatrices) {
          const individualValue = matrix[i][j];
          deviation += Math.abs(Math.log(individualValue) - Math.log(aggregatedValue));
        }

        totalDeviation += deviation / individualMatrices.length;
        totalComparisons++;
      }
    }

    const averageDeviation = totalDeviation / totalComparisons;
    return Math.exp(-averageDeviation); // 0-1 범위로 정규화
  }

  private static initializeMatrix(size: number): number[][] {
    return Array(size).fill(null).map(() => Array(size).fill(1));
  }
}

/**
 * AIP (Aggregation of Individual Priorities) - 우선순위 산술평균
 */
export class AIPAggregator {
  /**
   * 개별 우선순위의 산술평균
   */
  static async aggregate(matrices: number[][][]): Promise<AggregationResult> {
    if (matrices.length === 0) {
      throw new Error('통합할 매트릭스가 없습니다.');
    }

    const n = matrices[0].length;
    const k = matrices.length;

    // 각 매트릭스에서 우선순위 벡터 추출
    const priorityVectors: number[][] = [];
    const consistencyRatios: number[] = [];

    for (const matrix of matrices) {
      const ahpResult = calculateAHPEnhanced(matrix, 'power');
      priorityVectors.push(ahpResult.eigenVector);
      consistencyRatios.push(ahpResult.consistencyRatio);
    }

    // 우선순위의 산술평균 계산
    const averagePriorities = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (const priorities of priorityVectors) {
        sum += priorities[i];
      }
      averagePriorities[i] = sum / k;
    }

    // 정규화
    const prioritySum = averagePriorities.reduce((sum, p) => sum + p, 0);
    const normalizedPriorities = averagePriorities.map(p => p / prioritySum);

    // 평균 우선순위로부터 일관된 매트릭스 재구성
    const reconstructedMatrix = this.reconstructMatrix(normalizedPriorities);

    // 합의도 계산
    const consensusIndex = this.calculatePriorityConsensus(priorityVectors);

    return {
      matrix: reconstructedMatrix,
      weights: normalizedPriorities,
      consistencyRatio: 0, // 재구성된 매트릭스는 완벽히 일관됨
      isConsistent: true,
      method: 'AIP_arithmetic_mean',
      participantCount: k,
      consensusIndex
    };
  }

  /**
   * 가중 우선순위 통합
   */
  static async weightedAggregate(
    matrices: number[][][],
    weights: number[]
  ): Promise<AggregationResult> {
    const n = matrices[0].length;
    const k = matrices.length;
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // 개별 우선순위 추출
    const priorityVectors: number[][] = [];
    for (const matrix of matrices) {
      const ahpResult = calculateAHPEnhanced(matrix, 'power');
      priorityVectors.push(ahpResult.eigenVector);
    }

    // 가중 우선순위 계산
    const weightedPriorities = Array(n).fill(0);
    for (let k = 0; k < matrices.length; k++) {
      const normalizedWeight = weights[k] / totalWeight;
      for (let i = 0; i < n; i++) {
        weightedPriorities[i] += priorityVectors[k][i] * normalizedWeight;
      }
    }

    // 정규화
    const prioritySum = weightedPriorities.reduce((sum, p) => sum + p, 0);
    const normalizedPriorities = weightedPriorities.map(p => p / prioritySum);

    const reconstructedMatrix = this.reconstructMatrix(normalizedPriorities);
    const consensusIndex = this.calculatePriorityConsensus(priorityVectors);

    return {
      matrix: reconstructedMatrix,
      weights: normalizedPriorities,
      consistencyRatio: 0,
      isConsistent: true,
      method: 'AIP_weighted_arithmetic',
      participantCount: matrices.length,
      consensusIndex
    };
  }

  /**
   * 우선순위 벡터로부터 일관된 매트릭스 재구성
   */
  private static reconstructMatrix(priorities: number[]): number[][] {
    const n = priorities.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (priorities[j] > 0) {
          matrix[i][j] = priorities[i] / priorities[j];
        } else {
          matrix[i][j] = 1;
        }
      }
    }

    return matrix;
  }

  /**
   * 우선순위 벡터 간 합의도 계산 (Kendall's W)
   */
  private static calculatePriorityConsensus(priorityVectors: number[][]): number {
    const k = priorityVectors.length; // 평가자 수
    const n = priorityVectors[0].length; // 대안 수

    if (k <= 1) return 1;

    // 순위 변환
    const rankings: number[][] = priorityVectors.map(pv => 
      this.convertToRanks(pv)
    );

    // 각 대안의 순위 합계
    const rankSums: number[] = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < k; i++) {
        rankSums[j] += rankings[i][j];
      }
    }

    // 평균 순위
    const meanRank = rankSums.reduce((sum, rank) => sum + rank, 0) / n;

    // Sum of Squares
    let SS = 0;
    for (const sum of rankSums) {
      SS += Math.pow(sum - meanRank, 2);
    }

    // Kendall's W 계산
    const W = (12 * SS) / (k * k * (n * n * n - n));
    return W;
  }

  private static convertToRanks(priorities: number[]): number[] {
    const indexed = priorities.map((p, i) => ({ value: p, index: i }));
    indexed.sort((a, b) => b.value - a.value); // 내림차순 정렬

    const ranks = Array(priorities.length);
    indexed.forEach((item, rank) => {
      ranks[item.index] = rank + 1;
    });

    return ranks;
  }
}

/**
 * 퍼지 통합 (Fuzzy Aggregation)
 */
export class FuzzyAggregator {
  /**
   * 삼각 퍼지 수를 사용한 통합
   */
  static aggregate(fuzzyMatrices: FuzzyNumber[][][]): AggregationResult {
    const n = fuzzyMatrices[0].length;
    const k = fuzzyMatrices.length;

    // 퍼지 통합 매트릭스 초기화
    const aggregatedFuzzy: FuzzyNumber[][] = Array(n).fill(null).map(() => 
      Array(n).fill(null).map(() => ({ l: 1, m: 1, u: 1 }))
    );

    // 각 요소별 퍼지 수 통합
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;

        // 각 평가자의 퍼지 판단 수집
        const fuzzyJudgments = fuzzyMatrices.map(matrix => matrix[i][j]);
        
        // 퍼지 기하평균
        aggregatedFuzzy[i][j] = this.fuzzyGeometricMean(fuzzyJudgments);
      }
    }

    // 디퍼지화 (Defuzzification)
    const crispMatrix = this.defuzzify(aggregatedFuzzy);

    // 퍼지 가중치 계산
    const fuzzyWeights = this.calculateFuzzyWeights(aggregatedFuzzy);
    const crispWeights = fuzzyWeights.map(fw => this.defuzzifyWeight(fw));

    // 일관성 검증
    const ahpResult = calculateAHPEnhanced(crispMatrix, 'power');

    return {
      matrix: crispMatrix,
      weights: crispWeights,
      consistencyRatio: ahpResult.consistencyRatio,
      isConsistent: ahpResult.isConsistent,
      method: 'fuzzy_aggregation',
      participantCount: k
    };
  }

  /**
   * 삼각 퍼지 수의 기하평균
   */
  private static fuzzyGeometricMean(fuzzyNumbers: FuzzyNumber[]): FuzzyNumber {
    const k = fuzzyNumbers.length;
    
    let productL = 1, productM = 1, productU = 1;
    
    for (const fuzzy of fuzzyNumbers) {
      productL *= fuzzy.l;
      productM *= fuzzy.m;
      productU *= fuzzy.u;
    }

    return {
      l: Math.pow(productL, 1/k),
      m: Math.pow(productM, 1/k),
      u: Math.pow(productU, 1/k)
    };
  }

  /**
   * 디퍼지화 - 중심값 방법
   */
  private static defuzzify(fuzzyMatrix: FuzzyNumber[][]): number[][] {
    const n = fuzzyMatrix.length;
    const crisp = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const fuzzy = fuzzyMatrix[i][j];
        // 중심값: (l + 4m + u) / 6
        crisp[i][j] = (fuzzy.l + 4 * fuzzy.m + fuzzy.u) / 6;
      }
    }

    return crisp;
  }

  /**
   * 퍼지 가중치 계산 (Extent Analysis)
   */
  private static calculateFuzzyWeights(fuzzyMatrix: FuzzyNumber[][]): FuzzyNumber[] {
    const n = fuzzyMatrix.length;
    const weights: FuzzyNumber[] = [];

    // 행 합계 계산
    const rowSums: FuzzyNumber[] = [];
    
    for (let i = 0; i < n; i++) {
      let sumL = 0, sumM = 0, sumU = 0;
      
      for (let j = 0; j < n; j++) {
        sumL += fuzzyMatrix[i][j].l;
        sumM += fuzzyMatrix[i][j].m;
        sumU += fuzzyMatrix[i][j].u;
      }
      
      rowSums.push({ l: sumL, m: sumM, u: sumU });
    }

    // 전체 합계
    let totalL = 0, totalM = 0, totalU = 0;
    for (const sum of rowSums) {
      totalL += sum.l;
      totalM += sum.m;
      totalU += sum.u;
    }

    // 정규화된 퍼지 가중치
    for (const sum of rowSums) {
      weights.push({
        l: sum.l / totalU, // 주의: 역순
        m: sum.m / totalM,
        u: sum.u / totalL
      });
    }

    return weights;
  }

  /**
   * 퍼지 가중치 디퍼지화
   */
  private static defuzzifyWeight(fuzzyWeight: FuzzyNumber): number {
    return (fuzzyWeight.l + 4 * fuzzyWeight.m + fuzzyWeight.u) / 6;
  }
}

/**
 * 합의도 분석기
 */
export class ConsensusAnalyzer {
  /**
   * Shannon Entropy 기반 합의도 계산
   */
  static calculateShannonConsensus(matrices: number[][][]): ConsensusMetrics {
    const n = matrices[0].length;
    const k = matrices.length;
    let totalEntropy = 0;
    let pairCount = 0;

    const disagreementMatrix = Array(k).fill(null).map(() => Array(k).fill(0));
    const criticalDisagreements: any[] = [];

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        // 각 평가자의 판단을 로그 스케일로 변환
        const logValues = matrices.map(m => Math.log(m[i][j]));
        
        // 평균과 분산 계산
        const mean = logValues.reduce((sum, v) => sum + v, 0) / k;
        const variance = logValues.reduce(
          (sum, v) => sum + Math.pow(v - mean, 2), 0
        ) / k;

        // Shannon Entropy
        const entropy = variance > 0 
          ? 0.5 * Math.log(2 * Math.PI * Math.E * variance)
          : 0;

        totalEntropy += entropy;
        pairCount++;
      }
    }

    // 평가자 간 이견 분석
    for (let e1 = 0; e1 < k; e1++) {
      for (let e2 = e1 + 1; e2 < k; e2++) {
        const disagreement = this.calculateMatrixDisagreement(matrices[e1], matrices[e2]);
        disagreementMatrix[e1][e2] = disagreement;
        disagreementMatrix[e2][e1] = disagreement;

        if (disagreement > 0.7) { // 높은 이견
          criticalDisagreements.push({
            id: `disagreement_${e1}_${e2}`,
            groupId: '', // 호출 시 설정 필요
            nodeId: '', // 호출 시 설정 필요
            evaluator1Id: `evaluator_${e1}`,
            evaluator2Id: `evaluator_${e2}`,
            elementI: e1,
            elementJ: e2,
            value1: matrices[e1][0][0], // 임시값
            value2: matrices[e2][0][0], // 임시값
            disagreementLevel: disagreement,
            impactOnConsensus: disagreement
          });
        }
      }
    }

    // 정규화된 합의도 (0-1)
    const maxEntropy = Math.log(k);
    const avgEntropy = pairCount > 0 ? totalEntropy / pairCount : 0;
    const consensus = 1 - Math.min(avgEntropy / maxEntropy, 1);

    // Kendall's W 계산
    const kendallsW = this.calculateKendallsW(matrices);

    return {
      overallConsensus: consensus,
      kendallsW,
      shannonEntropy: avgEntropy,
      disagreementMatrix,
      criticalDisagreements
    };
  }

  private static calculateMatrixDisagreement(matrix1: number[][], matrix2: number[][]): number {
    const n = matrix1.length;
    let sumDiff = 0;
    let pairCount = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const ratio = matrix1[i][j] / matrix2[i][j];
        const logDiff = Math.abs(Math.log(ratio));
        sumDiff += logDiff;
        pairCount++;
      }
    }

    return pairCount > 0 ? sumDiff / pairCount : 0;
  }

  private static calculateKendallsW(matrices: number[][][]): number {
    // 각 매트릭스에서 우선순위 추출
    const priorityVectors: number[][] = [];
    
    for (const matrix of matrices) {
      try {
        const ahpResult = calculateAHPEnhanced(matrix, 'power');
        priorityVectors.push(ahpResult.eigenVector);
      } catch (error) {
        console.warn('우선순위 계산 실패:', error);
        // 기본 우선순위 사용
        const n = matrix.length;
        priorityVectors.push(Array(n).fill(1/n));
      }
    }

    if (priorityVectors.length <= 1) return 1;

    return AIPAggregator['calculatePriorityConsensus'](priorityVectors);
  }
}

/**
 * 그룹 평가 통합 팩토리
 */
export class GroupAggregationFactory {
  static createAggregator(method: string): any {
    switch (method) {
      case 'geometric_mean':
      case 'aij':
        return AIJAggregator;
      case 'arithmetic_mean':
      case 'aip':
        return AIPAggregator;
      case 'fuzzy':
        return FuzzyAggregator;
      default:
        throw new Error(`지원되지 않는 통합 방법: ${method}`);
    }
  }

  static async aggregateGroup(
    matrices: number[][][],
    method: string,
    weights?: number[]
  ): Promise<AggregationResult> {
    const aggregator = this.createAggregator(method);
    
    if (weights && weights.length > 0) {
      if (method.includes('aip') || method === 'arithmetic_mean') {
        return await aggregator.weightedAggregate(matrices, weights);
      } else {
        return aggregator.weightedAggregate(matrices, weights);
      }
    } else {
      if (method.includes('aip') || method === 'arithmetic_mean') {
        return await aggregator.aggregate(matrices);
      } else {
        return aggregator.aggregate(matrices);
      }
    }
  }
}