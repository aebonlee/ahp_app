import { calculateAHPEnhanced } from './ahpCalculator';
import type {
  HierarchicalStructure,
  HierarchyNode,
  EvaluationMatrix,
  PairwiseComparison,
  EvaluationResult,
  ConsistencyResult,
  EvaluationSession,
  InconsistentPair,
  SuggestedAdjustment,
  HierarchicalEvaluationError,
  HierarchyError
} from '../types/hierarchy';

// Opus 4.1 설계 문서 기반 계층적 평가 엔진

export class HierarchicalEvaluationFlow {
  private structure: HierarchicalStructure;
  private evaluatorId: string;
  private matrices: Map<string, EvaluationMatrix>;
  private session: EvaluationSession | null;
  
  constructor(structure: HierarchicalStructure, evaluatorId: string) {
    this.structure = structure;
    this.evaluatorId = evaluatorId;
    this.matrices = new Map();
    this.session = null;
  }
  
  /**
   * 평가 프로세스 초기화
   */
  async initializeEvaluation(): Promise<EvaluationSession> {
    const session: EvaluationSession = {
      id: this.generateUUID(),
      projectId: this.structure.projectId,
      evaluatorId: this.evaluatorId,
      sessionType: 'individual',
      status: 'in_progress',
      currentStepId: null,
      progress: {
        totalSteps: this.calculateTotalComparisons(),
        completedSteps: 0,
        progressPercentage: 0
      },
      consistencyMetrics: {
        overallCR: 0,
        nodesCR: {}
      },
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.session = session;
    
    // 각 레벨별 평가 매트릭스 초기화
    this.initializeMatrices();
    
    return session;
  }
  
  /**
   * 총 필요한 비교 횟수 계산
   */
  private calculateTotalComparisons(): number {
    let total = 0;
    
    // Level 1: 목표 대비 주기준
    const n1 = this.structure.criteria.length;
    total += n1 * (n1 - 1) / 2;
    
    // Level 2: 각 주기준 대비 하위기준
    if (this.structure.subcriteria) {
      for (const subcriteriaGroup of this.structure.subcriteria) {
        const n2 = subcriteriaGroup.length;
        total += n2 * (n2 - 1) / 2;
      }
    }
    
    // Level 3+: 각 말단 기준 대비 대안
    const leafCriteria = this.getLeafCriteria();
    const nAlternatives = this.structure.alternatives.length;
    total += leafCriteria.length * (nAlternatives * (nAlternatives - 1) / 2);
    
    return total;
  }
  
  /**
   * 다음 평가할 노드 가져오기
   */
  getNextEvaluationNode(): HierarchyNode | null {
    // BFS 방식으로 레벨별 순차 평가
    const queue: HierarchyNode[] = [this.structure.goal];
    
    while (queue.length > 0) {
      const node = queue.shift()!;
      
      if (node.children && node.children.length > 1) {
        const matrixKey = `${node.id}_children`;
        
        if (!this.matrices.has(matrixKey) || !this.matrices.get(matrixKey)!.isConsistent) {
          return node;
        }
        
        queue.push(...node.children);
      }
    }
    
    return null;
  }
  
  /**
   * 쌍대비교 수행
   */
  async performPairwiseComparison(
    parentNode: HierarchyNode,
    comparisons: PairwiseComparison[]
  ): Promise<EvaluationResult> {
    try {
      const children = parentNode.children || [];
      const n = children.length;
      
      if (n < 2) {
        throw new HierarchyError(
          HierarchicalEvaluationError.INVALID_HIERARCHY,
          '노드는 최소 2개의 자식 노드가 필요합니다'
        );
      }
      
      // 비교 매트릭스 생성
      const matrix = this.buildComparisonMatrix(n, comparisons);
      
      // 일관성 검증
      const consistency = await ConsistencyValidator.validateConsistency(matrix);
      
      // 가중치 계산
      const weights = consistency.eigenVector || [];
      
      // 결과 저장
      const evaluationMatrix: EvaluationMatrix = {
        id: this.generateUUID(),
        projectId: this.structure.projectId,
        evaluatorId: this.evaluatorId,
        parentNodeId: parentNode.id,
        matrixType: 'pairwise',
        matrixData: matrix,
        consistencyRatio: consistency.ratio,
        isConsistent: consistency.isConsistent,
        eigenValue: consistency.eigenValue,
        eigenVector: weights,
        calculationMethod: 'power_method'
      };
      
      this.matrices.set(`${parentNode.id}_children`, evaluationMatrix);
      
      // 로컬 가중치 업데이트
      children.forEach((child, index) => {
        child.localWeight = weights[index];
      });
      
      // 세션 진행률 업데이트
      if (this.session) {
        this.session.progress.completedSteps++;
        this.session.progress.progressPercentage = 
          (this.session.progress.completedSteps / this.session.progress.totalSteps) * 100;
        this.session.consistencyMetrics.nodesCR[parentNode.id] = consistency.ratio;
      }
      
      return {
        success: true,
        consistency: consistency,
        weights: weights,
        nextNode: this.getNextEvaluationNode(),
        progress: this.session?.progress.progressPercentage || 0
      };
      
    } catch (error) {
      throw new HierarchyError(
        HierarchicalEvaluationError.CALCULATION_ERROR,
        error instanceof Error ? error.message : '계산 중 오류가 발생했습니다',
        error
      );
    }
  }
  
  /**
   * 비교 매트릭스 구성
   */
  private buildComparisonMatrix(
    size: number, 
    comparisons: PairwiseComparison[]
  ): number[][] {
    const matrix: number[][] = Array(size).fill(null)
      .map(() => Array(size).fill(1));
    
    for (const comp of comparisons) {
      const { i, j, value } = comp;
      if (i < size && j < size) {
        matrix[i][j] = value;
        matrix[j][i] = 1 / value;
      }
    }
    
    return matrix;
  }
  
  /**
   * 평가 매트릭스 초기화
   */
  private initializeMatrices(): void {
    this.matrices.clear();
    
    // 각 노드별 매트릭스 공간 확보
    const traverse = (node: HierarchyNode) => {
      if (node.children && node.children.length > 1) {
        const matrixKey = `${node.id}_children`;
        // 매트릭스 플레이스홀더 생성하지 않고 필요시 생성
        node.children.forEach(traverse);
      }
    };
    
    traverse(this.structure.goal);
  }
  
  /**
   * 말단 기준 노드 찾기
   */
  private getLeafCriteria(): HierarchyNode[] {
    const leaves: HierarchyNode[] = [];
    
    const traverse = (node: HierarchyNode) => {
      if (!node.children || node.children.length === 0) {
        if (node.nodeType === 'criterion' || node.nodeType === 'subcriterion') {
          leaves.push(node);
        }
      } else {
        node.children.forEach(traverse);
      }
    };
    
    this.structure.criteria.forEach(traverse);
    return leaves;
  }
  
  /**
   * 평가 완료 여부 확인
   */
  isEvaluationComplete(): boolean {
    return this.getNextEvaluationNode() === null;
  }
  
  /**
   * 세션 완료 처리
   */
  async completeEvaluation(): Promise<void> {
    if (this.session) {
      this.session.status = 'completed';
      this.session.updatedAt = new Date().toISOString();
      
      // 전체 일관성 비율 계산
      const allCRs = Object.values(this.session.consistencyMetrics.nodesCR);
      this.session.consistencyMetrics.overallCR = 
        allCRs.length > 0 ? allCRs.reduce((sum, cr) => sum + cr, 0) / allCRs.length : 0;
    }
  }
  
  /**
   * UUID 생성
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * 현재 세션 상태 반환
   */
  getCurrentSession(): EvaluationSession | null {
    return this.session;
  }
  
  /**
   * 특정 노드의 매트릭스 가져오기
   */
  getNodeMatrix(nodeId: string): EvaluationMatrix | null {
    const matrixKey = `${nodeId}_children`;
    return this.matrices.get(matrixKey) || null;
  }
  
  /**
   * 모든 매트릭스 반환
   */
  getAllMatrices(): Map<string, EvaluationMatrix> {
    return new Map(this.matrices);
  }
}

/**
 * 일관성 검증기
 * Opus 4.1 설계 문서 기반
 */
export class ConsistencyValidator {
  // Saaty's Random Index
  private static readonly RANDOM_INDEX = [
    0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49,
    1.51, 1.53, 1.56, 1.57, 1.59
  ];
  
  private static readonly CONSISTENCY_THRESHOLD = 0.10;
  
  /**
   * 일관성 비율 계산 및 검증
   */
  static async validateConsistency(
    matrix: number[][]
  ): Promise<ConsistencyResult> {
    const n = matrix.length;
    
    if (n <= 2) {
      return {
        isConsistent: true,
        ratio: 0,
        index: 0,
        eigenValue: n,
        eigenVector: Array(n).fill(1/n),
        message: 'Matrix size ≤ 2, always consistent'
      };
    }
    
    try {
      // Power Method로 주고유벡터 계산
      const { eigenVector, eigenValue } = await this.powerMethod(matrix);
      
      // Consistency Index (CI) 계산
      const CI = (eigenValue - n) / (n - 1);
      
      // Random Index (RI) 가져오기
      const RI = this.RANDOM_INDEX[n - 1] || this.RANDOM_INDEX[14];
      
      // Consistency Ratio (CR) 계산
      const CR = RI > 0 ? CI / RI : 0;
      
      // 일관성 검증
      const isConsistent = CR <= this.CONSISTENCY_THRESHOLD;
      
      // 불일관한 요소 찾기
      let inconsistentPairs: InconsistentPair[] = [];
      let suggestedAdjustments: SuggestedAdjustment[] = [];
      
      if (!isConsistent) {
        inconsistentPairs = this.findInconsistentPairs(matrix, eigenVector);
        suggestedAdjustments = this.suggestAdjustments(inconsistentPairs, matrix);
      }
      
      return {
        isConsistent,
        ratio: CR,
        index: CI,
        eigenValue,
        eigenVector,
        message: isConsistent 
          ? 'Matrix is consistent' 
          : `Inconsistent: CR = ${CR.toFixed(4)} > 0.10`,
        inconsistentPairs,
        suggestedAdjustments
      };
      
    } catch (error) {
      throw new HierarchyError(
        HierarchicalEvaluationError.CALCULATION_ERROR,
        '일관성 계산 중 오류가 발생했습니다',
        error
      );
    }
  }
  
  /**
   * Power Method를 사용한 주고유벡터 계산
   */
  private static async powerMethod(
    matrix: number[][], 
    maxIterations: number = 100,
    tolerance: number = 1e-7
  ): Promise<{eigenVector: number[], eigenValue: number}> {
    const n = matrix.length;
    let vector = Array(n).fill(1 / n);
    let eigenValue = 0;
    
    for (let iter = 0; iter < maxIterations; iter++) {
      const newVector = Array(n).fill(0);
      
      // Matrix multiplication: Av
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          newVector[i] += matrix[i][j] * vector[j];
        }
      }
      
      // Normalize
      const sum = newVector.reduce((a, b) => a + b, 0);
      if (sum === 0) {
        throw new Error('벡터 정규화 실패: 합이 0입니다');
      }
      
      for (let i = 0; i < n; i++) {
        newVector[i] /= sum;
      }
      
      // Check convergence
      let maxDiff = 0;
      for (let i = 0; i < n; i++) {
        maxDiff = Math.max(maxDiff, Math.abs(newVector[i] - vector[i]));
      }
      
      vector = newVector;
      
      if (maxDiff < tolerance) {
        break;
      }
    }
    
    // Calculate eigenvalue (λmax)
    const Av = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        Av[i] += matrix[i][j] * vector[j];
      }
    }
    
    eigenValue = 0;
    for (let i = 0; i < n; i++) {
      if (vector[i] > 0) {
        eigenValue += Av[i] / vector[i];
      }
    }
    eigenValue /= n;
    
    return { eigenVector: vector, eigenValue };
  }
  
  /**
   * 불일관한 쌍 찾기
   */
  private static findInconsistentPairs(
    matrix: number[][], 
    weights: number[]
  ): InconsistentPair[] {
    const pairs: InconsistentPair[] = [];
    const n = matrix.length;
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const actualRatio = matrix[i][j];
        const expectedRatio = weights[i] / weights[j];
        const deviation = Math.abs(Math.log(actualRatio / expectedRatio));
        
        if (deviation > 0.5) { // 유의미한 편차
          pairs.push({
            i, j,
            actualValue: actualRatio,
            expectedValue: expectedRatio,
            deviation
          });
        }
      }
    }
    
    // 편차가 큰 순으로 정렬
    return pairs.sort((a, b) => b.deviation - a.deviation).slice(0, 3);
  }
  
  /**
   * 조정 제안
   */
  private static suggestAdjustments(
    inconsistentPairs: InconsistentPair[],
    matrix: number[][]
  ): SuggestedAdjustment[] {
    return inconsistentPairs.map(pair => {
      const { i, j, expectedValue } = pair;
      
      // Saaty 척도에 맞게 반올림
      const suggestedValue = this.roundToSaatyScale(expectedValue);
      
      return {
        position: [i, j],
        currentValue: matrix[i][j],
        suggestedValue,
        impact: this.estimateImpact(matrix, i, j, suggestedValue)
      };
    });
  }
  
  /**
   * Saaty 척도로 반올림
   */
  private static roundToSaatyScale(value: number): number {
    const scales = [1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 
                   1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    let minDiff = Infinity;
    let closest = 1;
    
    for (const scale of scales) {
      const diff = Math.abs(Math.log(value / scale));
      if (diff < minDiff) {
        minDiff = diff;
        closest = scale;
      }
    }
    
    return closest;
  }
  
  /**
   * 조정의 영향도 추정
   */
  private static estimateImpact(
    matrix: number[][], 
    i: number, 
    j: number, 
    newValue: number
  ): number {
    // 간단한 영향도 계산 (실제로는 더 정교한 계산 필요)
    const currentValue = matrix[i][j];
    const changeRatio = Math.abs(Math.log(newValue / currentValue));
    return Math.min(changeRatio, 1.0); // 0~1로 정규화
  }
}