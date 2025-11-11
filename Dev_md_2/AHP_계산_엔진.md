# 🧮 AHP 계산 엔진 설계 문서
## 작성일: 2024-11-12
## 작성자: Claude Opus 4.1
## 프로젝트: AHP Decision Support Platform

---

## 1. AHP 계산 엔진 개요

### 1.1 목적
Analytic Hierarchy Process의 핵심 수학적 계산을 수행하는 고성능 엔진 구축

### 1.2 핵심 기능
- 쌍대비교 행렬 구성
- 고유벡터 계산 (우선순위 도출)
- 일관성 비율(CR) 검증
- 계층 구조 통합 계산
- 그룹 의사결정 통합

### 1.3 성능 목표
- 100x100 행렬 계산: < 100ms
- 1000명 그룹 평가 통합: < 1초
- 일관성 검증: 실시간 (< 50ms)

---

## 2. 핵심 알고리즘 구현

### 2.1 쌍대비교 행렬 클래스

```typescript
/**
 * AHP 쌍대비교 행렬 클래스
 */
export class PairwiseComparisonMatrix {
  private matrix: number[][];
  private size: number;
  private criteriaIds: string[];
  private epsilon: number = 1e-10; // 수치 안정성을 위한 임계값

  constructor(criteriaIds: string[]) {
    this.size = criteriaIds.length;
    this.criteriaIds = criteriaIds;
    this.matrix = this.initializeMatrix(this.size);
  }

  /**
   * 행렬 초기화 (대각선 = 1)
   */
  private initializeMatrix(n: number): number[][] {
    const matrix = Array(n).fill(null).map(() => Array(n).fill(1));
    for (let i = 0; i < n; i++) {
      matrix[i][i] = 1;
    }
    return matrix;
  }

  /**
   * 쌍대비교 값 설정 (자동 역수 계산)
   */
  setComparison(i: number, j: number, value: number): void {
    if (i < 0 || i >= this.size || j < 0 || j >= this.size) {
      throw new Error('Invalid matrix indices');
    }
    
    if (value <= 0 || value > 9) {
      throw new Error('Comparison value must be between 1/9 and 9');
    }

    this.matrix[i][j] = value;
    this.matrix[j][i] = 1 / value; // 역수 자동 설정
  }

  /**
   * Saaty의 척도 변환
   */
  static saatyScale(importance: number): number {
    const scale: { [key: number]: number } = {
      1: 1,     // Equal importance
      2: 2,     // Weak
      3: 3,     // Moderate importance
      4: 4,     // Moderate plus
      5: 5,     // Strong importance
      6: 6,     // Strong plus
      7: 7,     // Very strong
      8: 8,     // Very, very strong
      9: 9      // Extreme importance
    };
    return scale[importance] || 1;
  }

  /**
   * 행렬 정규화
   */
  normalize(): number[][] {
    const normalized = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    
    // 각 열의 합 계산
    const columnSums = Array(this.size).fill(0);
    for (let j = 0; j < this.size; j++) {
      for (let i = 0; i < this.size; i++) {
        columnSums[j] += this.matrix[i][j];
      }
    }

    // 정규화
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        normalized[i][j] = this.matrix[i][j] / columnSums[j];
      }
    }

    return normalized;
  }

  /**
   * 우선순위 벡터 계산 (고유벡터 방법)
   */
  calculatePriorityVector(): number[] {
    return this.powerMethod(100, 1e-7);
  }

  /**
   * Power Method for 고유벡터 계산
   * 최대 고유값에 대응하는 고유벡터 계산
   */
  private powerMethod(maxIterations: number = 100, tolerance: number = 1e-7): number[] {
    let vector = Array(this.size).fill(1 / this.size);
    let previousVector = [...vector];
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // 행렬-벡터 곱셈
      const newVector = this.matrixVectorMultiply(this.matrix, vector);
      
      // 정규화
      const sum = newVector.reduce((a, b) => a + b, 0);
      vector = newVector.map(v => v / sum);
      
      // 수렴 체크
      const diff = this.vectorDifference(vector, previousVector);
      if (diff < tolerance) {
        break;
      }
      
      previousVector = [...vector];
    }
    
    return vector;
  }

  /**
   * 행렬-벡터 곱셈
   */
  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => 
      row.reduce((sum, value, index) => sum + value * vector[index], 0)
    );
  }

  /**
   * 벡터 차이 계산 (L2 norm)
   */
  private vectorDifference(v1: number[], v2: number[]): number {
    return Math.sqrt(
      v1.reduce((sum, val, i) => sum + Math.pow(val - v2[i], 2), 0)
    );
  }

  /**
   * 최대 고유값 계산
   */
  calculateMaxEigenvalue(): number {
    const priorities = this.calculatePriorityVector();
    const Aw = this.matrixVectorMultiply(this.matrix, priorities);
    
    let lambdaMax = 0;
    for (let i = 0; i < this.size; i++) {
      if (priorities[i] > this.epsilon) {
        lambdaMax += Aw[i] / priorities[i];
      }
    }
    
    return lambdaMax / this.size;
  }

  getMatrix(): number[][] {
    return this.matrix;
  }
}
```

### 2.2 일관성 검증 시스템

```typescript
/**
 * 일관성 비율(CR) 계산기
 */
export class ConsistencyChecker {
  // Random Index (RI) 값 - Saaty's table
  private static readonly RANDOM_INDEX: number[] = [
    0,      // n=1
    0,      // n=2
    0.58,   // n=3
    0.90,   // n=4
    1.12,   // n=5
    1.24,   // n=6
    1.32,   // n=7
    1.41,   // n=8
    1.45,   // n=9
    1.49,   // n=10
    1.51,   // n=11
    1.48,   // n=12
    1.56,   // n=13
    1.57,   // n=14
    1.59    // n=15
  ];

  /**
   * 일관성 지수(CI) 계산
   */
  static calculateConsistencyIndex(lambdaMax: number, n: number): number {
    if (n <= 2) return 0;
    return (lambdaMax - n) / (n - 1);
  }

  /**
   * 일관성 비율(CR) 계산
   */
  static calculateConsistencyRatio(lambdaMax: number, n: number): number {
    if (n <= 2) return 0;
    
    const CI = this.calculateConsistencyIndex(lambdaMax, n);
    const RI = this.getRandomIndex(n);
    
    if (RI === 0) return 0;
    return CI / RI;
  }

  /**
   * Random Index 조회
   */
  static getRandomIndex(n: number): number {
    if (n > 15) {
      // n > 15일 때 근사식 사용
      return 1.98 * (n - 2) / n;
    }
    return this.RANDOM_INDEX[n - 1] || 0;
  }

  /**
   * 일관성 검증
   */
  static checkConsistency(matrix: PairwiseComparisonMatrix): ConsistencyResult {
    const n = matrix.getMatrix().length;
    const lambdaMax = matrix.calculateMaxEigenvalue();
    const CI = this.calculateConsistencyIndex(lambdaMax, n);
    const CR = this.calculateConsistencyRatio(lambdaMax, n);
    
    return {
      isConsistent: CR <= 0.10, // CR ≤ 0.10이면 일관성 있음
      consistencyIndex: CI,
      consistencyRatio: CR,
      maxEigenvalue: lambdaMax,
      message: this.getConsistencyMessage(CR)
    };
  }

  /**
   * 일관성 메시지 생성
   */
  private static getConsistencyMessage(CR: number): string {
    if (CR <= 0.05) {
      return '매우 우수한 일관성';
    } else if (CR <= 0.08) {
      return '우수한 일관성';
    } else if (CR <= 0.10) {
      return '허용 가능한 일관성';
    } else if (CR <= 0.15) {
      return '일관성 재검토 권장';
    } else {
      return '일관성 부족 - 재평가 필요';
    }
  }

  /**
   * 불일치 요소 식별
   */
  static identifyInconsistencies(
    matrix: PairwiseComparisonMatrix
  ): InconsistencyReport[] {
    const n = matrix.getMatrix().length;
    const matrixData = matrix.getMatrix();
    const inconsistencies: InconsistencyReport[] = [];

    // 전이적 일관성 검사 (a>b, b>c이면 a>c)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          if (i !== j && j !== k && i !== k) {
            const indirect = matrixData[i][j] * matrixData[j][k];
            const direct = matrixData[i][k];
            const ratio = indirect / direct;
            
            // 비율이 3 이상이면 불일치로 판단
            if (ratio > 3 || ratio < 1/3) {
              inconsistencies.push({
                indices: [i, j, k],
                expectedValue: indirect,
                actualValue: direct,
                deviationRatio: ratio,
                severity: ratio > 5 || ratio < 0.2 ? 'high' : 'medium'
              });
            }
          }
        }
      }
    }

    return inconsistencies;
  }
}

interface ConsistencyResult {
  isConsistent: boolean;
  consistencyIndex: number;
  consistencyRatio: number;
  maxEigenvalue: number;
  message: string;
}

interface InconsistencyReport {
  indices: number[];
  expectedValue: number;
  actualValue: number;
  deviationRatio: number;
  severity: 'low' | 'medium' | 'high';
}
```

### 2.3 계층 구조 통합 계산

```typescript
/**
 * 계층적 AHP 계산기
 */
export class HierarchicalAHP {
  private hierarchy: HierarchyNode;
  private alternativeWeights: Map<string, number> = new Map();

  constructor(hierarchy: HierarchyNode) {
    this.hierarchy = hierarchy;
  }

  /**
   * 전체 계층 구조에 대한 우선순위 계산
   */
  calculateGlobalPriorities(): GlobalPriorities {
    // 1. 각 레벨별 로컬 우선순위 계산
    const localPriorities = this.calculateLocalPriorities(this.hierarchy);
    
    // 2. 글로벌 우선순위 계산 (상위 레벨 가중치 곱하기)
    const globalPriorities = this.propagatePriorities(
      this.hierarchy,
      1.0,
      new Map<string, number>()
    );
    
    // 3. 대안별 최종 점수 계산
    const alternativeScores = this.calculateAlternativeScores(globalPriorities);
    
    return {
      localPriorities,
      globalPriorities,
      alternativeScores,
      ranking: this.rankAlternatives(alternativeScores)
    };
  }

  /**
   * 각 노드의 로컬 우선순위 계산
   */
  private calculateLocalPriorities(
    node: HierarchyNode
  ): Map<string, number[]> {
    const priorities = new Map<string, number[]>();
    
    if (node.children && node.children.length > 0) {
      // 자식 노드들 간의 쌍대비교
      const matrix = new PairwiseComparisonMatrix(
        node.children.map(c => c.id)
      );
      
      // 쌍대비교 값 설정
      node.comparisons?.forEach(comp => {
        matrix.setComparison(comp.i, comp.j, comp.value);
      });
      
      // 우선순위 계산
      const priority = matrix.calculatePriorityVector();
      priorities.set(node.id, priority);
      
      // 재귀적으로 자식 노드 처리
      node.children.forEach(child => {
        const childPriorities = this.calculateLocalPriorities(child);
        childPriorities.forEach((value, key) => {
          priorities.set(key, value);
        });
      });
    }
    
    return priorities;
  }

  /**
   * 글로벌 우선순위 전파
   */
  private propagatePriorities(
    node: HierarchyNode,
    parentWeight: number,
    globalWeights: Map<string, number>
  ): Map<string, number> {
    globalWeights.set(node.id, parentWeight);
    
    if (node.children && node.localPriorities) {
      node.children.forEach((child, index) => {
        const childWeight = parentWeight * node.localPriorities[index];
        this.propagatePriorities(child, childWeight, globalWeights);
      });
    }
    
    return globalWeights;
  }

  /**
   * 대안별 최종 점수 계산
   */
  private calculateAlternativeScores(
    globalPriorities: Map<string, number>
  ): Map<string, number> {
    const scores = new Map<string, number>();
    
    // 각 말단 기준에 대한 대안 평가 반영
    this.getLeafNodes(this.hierarchy).forEach(leaf => {
      const leafWeight = globalPriorities.get(leaf.id) || 0;
      
      if (leaf.alternativeComparisons) {
        const matrix = new PairwiseComparisonMatrix(leaf.alternativeIds);
        
        // 대안 간 쌍대비교 설정
        leaf.alternativeComparisons.forEach(comp => {
          matrix.setComparison(comp.i, comp.j, comp.value);
        });
        
        // 대안 우선순위 계산
        const alternativePriorities = matrix.calculatePriorityVector();
        
        // 글로벌 가중치 적용
        alternativePriorities.forEach((priority, index) => {
          const altId = leaf.alternativeIds[index];
          const currentScore = scores.get(altId) || 0;
          scores.set(altId, currentScore + priority * leafWeight);
        });
      }
    });
    
    return scores;
  }

  /**
   * 말단 노드 추출
   */
  private getLeafNodes(node: HierarchyNode): HierarchyNode[] {
    if (!node.children || node.children.length === 0) {
      return [node];
    }
    
    return node.children.flatMap(child => this.getLeafNodes(child));
  }

  /**
   * 대안 순위 매기기
   */
  private rankAlternatives(
    scores: Map<string, number>
  ): AlternativeRanking[] {
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry, index) => ({
        rank: index + 1,
        alternativeId: entry[0],
        score: entry[1],
        percentage: entry[1] * 100
      }));
  }
}

interface HierarchyNode {
  id: string;
  name: string;
  level: number;
  children?: HierarchyNode[];
  comparisons?: Comparison[];
  localPriorities?: number[];
  alternativeIds?: string[];
  alternativeComparisons?: Comparison[];
}

interface Comparison {
  i: number;
  j: number;
  value: number;
}

interface GlobalPriorities {
  localPriorities: Map<string, number[]>;
  globalPriorities: Map<string, number>;
  alternativeScores: Map<string, number>;
  ranking: AlternativeRanking[];
}

interface AlternativeRanking {
  rank: number;
  alternativeId: string;
  score: number;
  percentage: number;
}
```

### 2.4 그룹 의사결정 통합

```typescript
/**
 * 그룹 AHP 통합기
 */
export class GroupAHPAggregator {
  /**
   * 기하평균 방법 (Geometric Mean Method)
   * AHP에서 가장 널리 사용되는 그룹 통합 방법
   */
  static geometricMeanAggregation(
    matrices: number[][][],
    weights?: number[]
  ): number[][] {
    const n = matrices[0].length;
    const k = matrices.length;
    
    // 가중치 정규화
    const normalizedWeights = weights 
      ? this.normalizeWeights(weights)
      : Array(k).fill(1 / k);
    
    const aggregatedMatrix = Array(n).fill(null)
      .map(() => Array(n).fill(1));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          let product = 1;
          
          // 가중 기하평균 계산
          for (let m = 0; m < k; m++) {
            product *= Math.pow(
              matrices[m][i][j],
              normalizedWeights[m]
            );
          }
          
          aggregatedMatrix[i][j] = product;
        }
      }
    }
    
    return aggregatedMatrix;
  }

  /**
   * 산술평균 방법 (Arithmetic Mean Method)
   * 특정 상황에서 사용 (덜 보수적)
   */
  static arithmeticMeanAggregation(
    matrices: number[][][],
    weights?: number[]
  ): number[][] {
    const n = matrices[0].length;
    const k = matrices.length;
    
    const normalizedWeights = weights 
      ? this.normalizeWeights(weights)
      : Array(k).fill(1 / k);
    
    const aggregatedMatrix = Array(n).fill(null)
      .map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          aggregatedMatrix[i][j] = 1;
        } else {
          let sum = 0;
          
          for (let m = 0; m < k; m++) {
            sum += matrices[m][i][j] * normalizedWeights[m];
          }
          
          aggregatedMatrix[i][j] = sum;
        }
      }
    }
    
    return aggregatedMatrix;
  }

  /**
   * 합의도 계산 (Consensus Degree)
   */
  static calculateConsensus(
    individualPriorities: number[][]
  ): ConsensusMetrics {
    const n = individualPriorities[0].length;
    const k = individualPriorities.length;
    
    // 평균 우선순위 계산
    const averagePriority = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < k; j++) {
        averagePriority[i] += individualPriorities[j][i] / k;
      }
    }
    
    // Shannon Entropy 계산 (불일치 측정)
    const entropy = this.calculateEntropy(individualPriorities);
    
    // 상관계수 계산
    const correlations = this.calculateCorrelations(individualPriorities);
    
    // 합의 지수 계산 (0-1, 1이 완전 합의)
    const consensusIndex = 1 - entropy / Math.log(k);
    
    return {
      consensusIndex,
      entropy,
      averageCorrelation: correlations.average,
      minCorrelation: correlations.min,
      maxCorrelation: correlations.max,
      disagreementMatrix: this.calculateDisagreementMatrix(individualPriorities)
    };
  }

  /**
   * Shannon Entropy 계산
   */
  private static calculateEntropy(priorities: number[][]): number {
    const n = priorities[0].length;
    const k = priorities.length;
    let totalEntropy = 0;
    
    for (let i = 0; i < n; i++) {
      let entropy = 0;
      
      for (let j = 0; j < k; j++) {
        const p = priorities[j][i];
        if (p > 0) {
          entropy -= p * Math.log(p);
        }
      }
      
      totalEntropy += entropy;
    }
    
    return totalEntropy / n;
  }

  /**
   * 평가자 간 상관계수 계산
   */
  private static calculateCorrelations(
    priorities: number[][]
  ): { average: number; min: number; max: number } {
    const k = priorities.length;
    const correlations: number[] = [];
    
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const corr = this.pearsonCorrelation(
          priorities[i],
          priorities[j]
        );
        correlations.push(corr);
      }
    }
    
    return {
      average: correlations.reduce((a, b) => a + b, 0) / correlations.length,
      min: Math.min(...correlations),
      max: Math.max(...correlations)
    };
  }

  /**
   * Pearson 상관계수 계산
   */
  private static pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * 불일치 행렬 계산
   */
  private static calculateDisagreementMatrix(
    priorities: number[][]
  ): number[][] {
    const n = priorities[0].length;
    const k = priorities.length;
    const disagreement = Array(n).fill(null)
      .map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          let variance = 0;
          
          for (let m = 0; m < k; m++) {
            const ratio = priorities[m][i] / priorities[m][j];
            variance += Math.pow(ratio - 1, 2);
          }
          
          disagreement[i][j] = Math.sqrt(variance / k);
        }
      }
    }
    
    return disagreement;
  }

  /**
   * 가중치 정규화
   */
  private static normalizeWeights(weights: number[]): number[] {
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => w / sum);
  }
}

interface ConsensusMetrics {
  consensusIndex: number;
  entropy: number;
  averageCorrelation: number;
  minCorrelation: number;
  maxCorrelation: number;
  disagreementMatrix: number[][];
}
```

---

## 3. 성능 최적화 전략

### 3.1 캐싱 시스템

```typescript
/**
 * 계산 결과 캐싱
 */
export class AHPCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 1000;
  private ttl: number = 3600000; // 1시간

  /**
   * 캐시 키 생성
   */
  private generateKey(matrix: number[][]): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(matrix))
      .digest('hex');
  }

  /**
   * 캐시 조회
   */
  get(matrix: number[][]): CachedResult | null {
    const key = this.generateKey(matrix);
    const entry = this.cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < this.ttl) {
      return entry.result;
    }
    
    return null;
  }

  /**
   * 캐시 저장
   */
  set(matrix: number[][], result: CachedResult): void {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    const key = this.generateKey(matrix);
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * LRU 방식으로 오래된 항목 제거
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

interface CacheEntry {
  result: CachedResult;
  timestamp: number;
}

interface CachedResult {
  priorities: number[];
  eigenvalue: number;
  consistencyRatio: number;
}
```

### 3.2 병렬 처리

```typescript
/**
 * 병렬 계산 처리기
 */
export class ParallelAHPProcessor {
  private workerPool: Worker[] = [];
  private poolSize: number = 4;

  constructor() {
    this.initializeWorkerPool();
  }

  /**
   * Worker 풀 초기화
   */
  private initializeWorkerPool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker('./ahp-worker.js');
      this.workerPool.push(worker);
    }
  }

  /**
   * 병렬 계산 실행
   */
  async processParallel(
    matrices: number[][][]
  ): Promise<ProcessingResult[]> {
    const chunks = this.chunkArray(matrices, this.poolSize);
    const promises = chunks.map((chunk, index) => 
      this.processChunk(chunk, this.workerPool[index])
    );
    
    const results = await Promise.all(promises);
    return results.flat();
  }

  /**
   * 청크 처리
   */
  private processChunk(
    chunk: number[][][],
    worker: Worker
  ): Promise<ProcessingResult[]> {
    return new Promise((resolve, reject) => {
      worker.onmessage = (e) => resolve(e.data);
      worker.onerror = reject;
      worker.postMessage({ type: 'process', data: chunk });
    });
  }

  /**
   * 배열 청킹
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

interface ProcessingResult {
  matrixId: string;
  priorities: number[];
  consistencyRatio: number;
  processingTime: number;
}
```

---

## 4. 데이터 검증 및 오류 처리

### 4.1 입력 검증

```typescript
/**
 * AHP 데이터 검증기
 */
export class AHPValidator {
  /**
   * 쌍대비교 값 검증
   */
  static validateComparisonValue(value: number): ValidationResult {
    if (typeof value !== 'number') {
      return { valid: false, error: 'Value must be a number' };
    }
    
    if (value <= 0) {
      return { valid: false, error: 'Value must be positive' };
    }
    
    // 1/9 ~ 9 범위 검증
    if (value < 1/9 || value > 9) {
      return { valid: false, error: 'Value must be between 1/9 and 9' };
    }
    
    // Saaty 척도 값 확인
    const validValues = [1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 
                        1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    const isValid = validValues.some(v => 
      Math.abs(v - value) < 0.001
    );
    
    if (!isValid) {
      return { 
        valid: false, 
        error: 'Value must be a valid Saaty scale value',
        suggestion: this.findNearestValidValue(value)
      };
    }
    
    return { valid: true };
  }

  /**
   * 행렬 완전성 검증
   */
  static validateMatrixCompleteness(
    matrix: number[][]
  ): ValidationResult {
    const n = matrix.length;
    
    // 정방행렬 확인
    for (let i = 0; i < n; i++) {
      if (matrix[i].length !== n) {
        return { 
          valid: false, 
          error: `Row ${i} has incorrect length` 
        };
      }
    }
    
    // 대각선 = 1 확인
    for (let i = 0; i < n; i++) {
      if (Math.abs(matrix[i][i] - 1) > 0.001) {
        return { 
          valid: false, 
          error: `Diagonal element [${i}][${i}] must be 1` 
        };
      }
    }
    
    // 역수 관계 확인
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const product = matrix[i][j] * matrix[j][i];
        if (Math.abs(product - 1) > 0.001) {
          return { 
            valid: false, 
            error: `Reciprocal relationship violated at [${i}][${j}]` 
          };
        }
      }
    }
    
    return { valid: true };
  }

  /**
   * 가장 가까운 유효한 값 찾기
   */
  private static findNearestValidValue(value: number): number {
    const validValues = [1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 
                         1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    let nearest = validValues[0];
    let minDiff = Math.abs(value - nearest);
    
    for (const v of validValues) {
      const diff = Math.abs(value - v);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = v;
      }
    }
    
    return nearest;
  }
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: any;
}
```

---

## 5. 테스트 케이스

### 5.1 단위 테스트

```typescript
describe('PairwiseComparisonMatrix', () => {
  it('should calculate correct priorities for 3x3 matrix', () => {
    const matrix = new PairwiseComparisonMatrix(['A', 'B', 'C']);
    
    // A는 B보다 3배 중요
    matrix.setComparison(0, 1, 3);
    // A는 C보다 5배 중요
    matrix.setComparison(0, 2, 5);
    // B는 C보다 2배 중요
    matrix.setComparison(1, 2, 2);
    
    const priorities = matrix.calculatePriorityVector();
    
    // 예상 우선순위: A > B > C
    expect(priorities[0]).toBeGreaterThan(priorities[1]);
    expect(priorities[1]).toBeGreaterThan(priorities[2]);
    expect(Math.abs(priorities.reduce((a, b) => a + b) - 1)).toBeLessThan(0.001);
  });

  it('should maintain reciprocal relationships', () => {
    const matrix = new PairwiseComparisonMatrix(['A', 'B']);
    matrix.setComparison(0, 1, 3);
    
    const matrixData = matrix.getMatrix();
    expect(matrixData[1][0]).toBeCloseTo(1/3, 5);
  });
});

describe('ConsistencyChecker', () => {
  it('should detect inconsistent matrix', () => {
    const matrix = new PairwiseComparisonMatrix(['A', 'B', 'C']);
    
    // 불일치 생성: A>B, B>C, but C>A
    matrix.setComparison(0, 1, 5);  // A는 B보다 5배 중요
    matrix.setComparison(1, 2, 5);  // B는 C보다 5배 중요
    matrix.setComparison(0, 2, 1/5); // C는 A보다 5배 중요 (불일치!)
    
    const result = ConsistencyChecker.checkConsistency(matrix);
    
    expect(result.isConsistent).toBe(false);
    expect(result.consistencyRatio).toBeGreaterThan(0.10);
  });
});
```

### 5.2 통합 테스트

```typescript
describe('Hierarchical AHP Integration', () => {
  it('should calculate global priorities correctly', () => {
    // 3단계 계층 구조 테스트
    const hierarchy: HierarchyNode = {
      id: 'goal',
      name: 'Select Best Alternative',
      level: 0,
      children: [
        {
          id: 'c1',
          name: 'Criteria 1',
          level: 1,
          children: [
            { id: 'sc1', name: 'Sub-criteria 1', level: 2 },
            { id: 'sc2', name: 'Sub-criteria 2', level: 2 }
          ]
        },
        {
          id: 'c2',
          name: 'Criteria 2',
          level: 1
        }
      ]
    };

    const ahp = new HierarchicalAHP(hierarchy);
    const results = ahp.calculateGlobalPriorities();
    
    expect(results.globalPriorities.size).toBeGreaterThan(0);
    expect(results.ranking.length).toBeGreaterThan(0);
    
    // 순위 합계가 1이 되는지 확인
    const totalScore = results.ranking.reduce((sum, r) => sum + r.score, 0);
    expect(Math.abs(totalScore - 1)).toBeLessThan(0.001);
  });
});
```

---

## 6. 구현 로드맵

### Phase 1: 기본 엔진 (1-2일)
- [x] PairwiseComparisonMatrix 클래스
- [x] ConsistencyChecker 구현
- [x] 기본 우선순위 계산

### Phase 2: 계층 구조 (2-3일)
- [ ] HierarchicalAHP 클래스
- [ ] 글로벌 우선순위 계산
- [ ] 대안 평가 통합

### Phase 3: 그룹 의사결정 (2-3일)
- [ ] GroupAHPAggregator 구현
- [ ] 합의도 계산
- [ ] 다양한 통합 방법

### Phase 4: 최적화 (1-2일)
- [ ] 캐싱 시스템
- [ ] 병렬 처리
- [ ] 성능 튜닝

---

**작성 완료**: 2024-11-12 01:45 KST
**다음 단계**: 고급 분석 시스템 설계