/**
 * AHP (Analytic Hierarchy Process) 계산 서비스
 * 백엔드에서 수학적 계산을 담당
 */

export interface AHPMatrix {
  size: number;
  matrix: number[][];
}

export interface AHPResult {
  weights: number[];
  consistencyRatio: number;
  consistencyIndex: number;
  lambdaMax: number;
  isConsistent: boolean;
}

export interface InconsistencyAdvice {
  i: number;
  j: number;
  currentValue: number;
  recommendedValue: number;
  errorMagnitude: number;
  rank: number;
}

/**
 * AHP 계산 서비스 클래스
 */
export class AHPCalculatorService {
  
  // Saaty 척도의 랜덤 일관성 지수 (RI)
  private static readonly RANDOM_INDEX = [
    0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49, 1.51
  ];

  /**
   * 기하평균법을 사용한 가중치 계산
   * @param matrix 쌍대비교 행렬
   * @returns 정규화된 가중치 벡터
   */
  static calculateWeights(matrix: number[][]): number[] {
    const n = matrix.length;
    if (n === 0) return [];
    if (n === 1) return [1];

    try {
      // 1. 각 행의 기하평균 계산
      const geometricMeans: number[] = [];
      for (let i = 0; i < n; i++) {
        let product = 1;
        for (let j = 0; j < n; j++) {
          if (matrix[i][j] <= 0) {
            throw new Error(`Invalid matrix value at (${i},${j}): ${matrix[i][j]}`);
          }
          product *= matrix[i][j];
        }
        geometricMeans[i] = Math.pow(product, 1 / n);
      }

      // 2. 정규화 (합이 1이 되도록)
      const sum = geometricMeans.reduce((acc, val) => acc + val, 0);
      if (sum === 0) {
        throw new Error('Sum of geometric means is zero');
      }

      return geometricMeans.map(val => val / sum);
    } catch (error) {
      console.error('Error calculating weights:', error);
      // 균등 가중치 반환
      return new Array(n).fill(1 / n);
    }
  }

  /**
   * 일관성 비율 계산
   * @param matrix 쌍대비교 행렬
   * @param weights 가중치 벡터
   * @returns AHP 결과 객체
   */
  static calculateConsistency(matrix: number[][], weights: number[]): AHPResult {
    const n = matrix.length;
    
    if (n <= 2) {
      // 2x2 이하 행렬은 항상 일관성 있음
      return {
        weights,
        consistencyRatio: 0,
        consistencyIndex: 0,
        lambdaMax: n,
        isConsistent: true
      };
    }

    try {
      // 1. λmax 계산: (Aw)i / wi의 평균
      let lambdaMax = 0;
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
          sum += matrix[i][j] * weights[j];
        }
        if (weights[i] > 0) {
          lambdaMax += sum / weights[i];
        }
      }
      lambdaMax /= n;

      // 2. 일관성 지수 (CI) 계산
      const CI = (lambdaMax - n) / (n - 1);

      // 3. 일관성 비율 (CR) 계산
      const RI = this.RANDOM_INDEX[n] || 1.45;
      const CR = RI > 0 ? CI / RI : 0;

      return {
        weights,
        consistencyRatio: CR,
        consistencyIndex: CI,
        lambdaMax,
        isConsistent: CR <= 0.1
      };
    } catch (error) {
      console.error('Error calculating consistency:', error);
      return {
        weights,
        consistencyRatio: 1.0, // 최악의 경우
        consistencyIndex: 1.0,
        lambdaMax: n,
        isConsistent: false
      };
    }
  }

  /**
   * 완전한 AHP 계산 (가중치 + 일관성)
   * @param matrix 쌍대비교 행렬
   * @returns AHP 결과
   */
  static calculateAHP(matrix: number[][]): AHPResult {
    const weights = this.calculateWeights(matrix);
    return this.calculateConsistency(matrix, weights);
  }

  /**
   * 비일관성 개선 제안 생성
   * @param matrix 쌍대비교 행렬
   * @param weights 현재 가중치
   * @param topK 상위 K개 제안
   * @returns 개선 제안 목록
   */
  static generateInconsistencyAdvice(
    matrix: number[][], 
    weights: number[], 
    topK: number = 3
  ): InconsistencyAdvice[] {
    const n = matrix.length;
    if (n <= 2) return [];

    try {
      // 1. 일관 행렬 계산: A^_ij = wi / wj
      const consistentMatrix: number[][] = weights.map(wi => 
        weights.map(wj => wj > 0 ? wi / wj : 1)
      );

      // 2. 오차 계산: |log(aij) - log(a^ij)|
      const errors: Array<{i: number, j: number, error: number}> = [];
      
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) { // 상삼각 행렬만
          const actual = matrix[i][j];
          const consistent = consistentMatrix[i][j];
          
          if (actual > 0 && consistent > 0) {
            const error = Math.abs(Math.log(actual) - Math.log(consistent));
            errors.push({ i, j, error });
          }
        }
      }

      // 3. 오차가 큰 순서로 정렬하여 상위 K개 선택
      const topErrors = errors
        .sort((a, b) => b.error - a.error)
        .slice(0, topK);

      // 4. 개선 제안 생성
      return topErrors.map((item, index) => {
        const consistentValue = weights[item.i] / weights[item.j];
        const recommendedValue = this.findNearestSaatyValue(consistentValue);
        
        return {
          i: item.i,
          j: item.j,
          currentValue: matrix[item.i][item.j],
          recommendedValue,
          errorMagnitude: item.error,
          rank: index + 1
        };
      });
    } catch (error) {
      console.error('Error generating inconsistency advice:', error);
      return [];
    }
  }

  /**
   * 가장 가까운 Saaty 척도값 찾기
   * @param target 목표값
   * @returns 가장 가까운 Saaty 척도값
   */
  private static findNearestSaatyValue(target: number): number {
    const saatyValues = [1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    return saatyValues.reduce((prev, curr) => 
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
  }

  /**
   * 직접입력 데이터 정규화
   * @param values 원시값 배열
   * @param isBenefit 편익형 여부 (false면 비용형)
   * @returns 정규화된 가중치
   */
  static normalizeDirectInput(values: number[], isBenefit: boolean = true): number[] {
    if (values.length === 0) return [];
    
    try {
      // 1. 비용형인 경우 역수 처리
      const processedValues = isBenefit 
        ? values 
        : values.map(v => v > 0 ? 1 / v : 0);

      // 2. 정규화 (합이 1이 되도록)
      const sum = processedValues.reduce((acc, val) => acc + val, 0);
      
      if (sum === 0) {
        // 모든 값이 0인 경우 균등 분배
        return new Array(values.length).fill(1 / values.length);
      }

      return processedValues.map(val => val / sum);
    } catch (error) {
      console.error('Error normalizing direct input:', error);
      return new Array(values.length).fill(1 / values.length);
    }
  }

  /**
   * 계층적 가중치 통합 (하위 기준 → 상위 기준)
   * @param criteriaWeights 기준별 가중치
   * @param hierarchy 계층 구조
   * @returns 통합된 가중치
   */
  static synthesizeHierarchy(
    criteriaWeights: Map<string, number[]>,
    hierarchy: any[]
  ): Map<string, number> {
    const globalWeights = new Map<string, number>();
    
    try {
      // 재귀적으로 계층 구조를 따라 가중치 계산
      function calculateGlobalWeight(
        criterion: any, 
        parentWeight: number = 1.0,
        path: string = ''
      ): void {
        const currentPath = path ? `${path}:${criterion.id}` : criterion.id;
        const localWeights = criteriaWeights.get(criterion.id) || [1];
        
        if (criterion.children && criterion.children.length > 0) {
          // 하위 기준이 있는 경우
          criterion.children.forEach((child: any, index: number) => {
            const childWeight = localWeights[index] || 0;
            const globalChildWeight = parentWeight * childWeight;
            calculateGlobalWeight(child, globalChildWeight, currentPath);
          });
        } else {
          // 말단 기준인 경우
          globalWeights.set(criterion.id, parentWeight);
        }
      }

      // 최상위 기준부터 시작
      hierarchy.forEach(rootCriterion => {
        calculateGlobalWeight(rootCriterion);
      });

      return globalWeights;
    } catch (error) {
      console.error('Error synthesizing hierarchy:', error);
      return globalWeights;
    }
  }

  /**
   * 그룹 의사결정 통합 (평가자별 결과 → 그룹 결과)
   * @param individualResults 개별 평가자 결과
   * @param evaluatorWeights 평가자별 가중치
   * @returns 통합된 그룹 결과
   */
  static aggregateGroupDecision(
    individualResults: Array<{evaluatorId: string, weights: number[]}>,
    evaluatorWeights: Map<string, number>
  ): number[] {
    if (individualResults.length === 0) return [];
    
    try {
      const numAlternatives = individualResults[0].weights.length;
      const groupWeights = new Array(numAlternatives).fill(0);
      
      // 평가자별 가중치 정규화
      const totalEvaluatorWeight = Array.from(evaluatorWeights.values())
        .reduce((sum, weight) => sum + weight, 0);
      
      if (totalEvaluatorWeight === 0) {
        // 균등 가중치 적용
        const equalWeight = 1 / individualResults.length;
        individualResults.forEach(result => {
          result.weights.forEach((weight, i) => {
            groupWeights[i] += weight * equalWeight;
          });
        });
      } else {
        // 가중평균 계산
        individualResults.forEach(result => {
          const evaluatorWeight = evaluatorWeights.get(result.evaluatorId) || 0;
          const normalizedWeight = evaluatorWeight / totalEvaluatorWeight;
          
          result.weights.forEach((weight, i) => {
            groupWeights[i] += weight * normalizedWeight;
          });
        });
      }

      return groupWeights;
    } catch (error) {
      console.error('Error aggregating group decision:', error);
      return new Array(individualResults[0]?.weights.length || 0).fill(0);
    }
  }

  /**
   * 행렬 유효성 검증
   * @param matrix 검증할 행렬
   * @returns 유효성 검증 결과
   */
  static validateMatrix(matrix: number[][]): {valid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    if (!matrix || matrix.length === 0) {
      errors.push('Matrix is empty');
      return {valid: false, errors};
    }

    const n = matrix.length;
    
    // 정사각 행렬 검증
    if (!matrix.every(row => row.length === n)) {
      errors.push('Matrix is not square');
    }

    // 대각선 값이 1인지 검증
    for (let i = 0; i < n; i++) {
      if (Math.abs(matrix[i][i] - 1) > 1e-10) {
        errors.push(`Diagonal element at (${i},${i}) should be 1, got ${matrix[i][i]}`);
      }
    }

    // 역수 관계 검증 (aij * aji = 1)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const product = matrix[i][j] * matrix[j][i];
        if (Math.abs(product - 1) > 1e-6) {
          errors.push(`Reciprocal relationship violated at (${i},${j}): ${matrix[i][j]} * ${matrix[j][i]} ≠ 1`);
        }
      }
    }

    // 양수 검증
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i][j] <= 0) {
          errors.push(`Matrix element at (${i},${j}) must be positive, got ${matrix[i][j]}`);
        }
      }
    }

    return {valid: errors.length === 0, errors};
  }
}

export default AHPCalculatorService;