/**
 * 일관성 검증 헬퍼 유틸리티
 * AHP 평가의 일관성 비율 계산 및 검증
 */

// Random Index 값 (Saaty의 표준 RI 값)
const RANDOM_INDEX: number[] = [
  0,     // n=1
  0,     // n=2
  0.58,  // n=3
  0.90,  // n=4
  1.12,  // n=5
  1.24,  // n=6
  1.32,  // n=7
  1.41,  // n=8
  1.45,  // n=9
  1.49,  // n=10
  1.51,  // n=11
  1.48,  // n=12
  1.56,  // n=13
  1.57,  // n=14
  1.59   // n=15
];

export interface ConsistencyResult {
  consistencyRatio: number;
  consistencyIndex: number;
  randomIndex: number;
  eigenvalue: number;
  isConsistent: boolean;
  message: string;
  level: 'excellent' | 'good' | 'acceptable' | 'poor';
  worstPairs?: Array<{ 
    i: number; 
    j: number; 
    value: number;
    element1: string;
    element2: string;
    currentValue: number;
    suggestedValue: number;
    confidence: number;
    impactOnCR: number;
  }>;
  currentCR?: number;
  improvementPotential?: number;
  suggestions?: string[];
}

// Alias for ConsistencyAnalysis
export type ConsistencyAnalysis = ConsistencyResult;

export const consistencyHelper = {
  /**
   * 쌍대비교 행렬의 일관성 비율 계산
   * @param matrix 쌍대비교 행렬
   * @returns 일관성 검증 결과
   */
  checkConsistency(matrix: number[][]): ConsistencyResult {
    const n = matrix.length;
    
    // n이 2 이하인 경우 일관성은 항상 완벽
    if (n <= 2) {
      return {
        consistencyRatio: 0,
        consistencyIndex: 0,
        randomIndex: 0,
        eigenvalue: n,
        isConsistent: true,
        message: '행렬 크기가 2 이하이므로 일관성이 보장됩니다.',
        level: 'excellent'
      };
    }

    // 가중치 계산 (정규화 방법)
    const weights = this.calculateWeights(matrix);
    
    // 최대 고유값 계산
    const eigenvalue = this.calculateMaxEigenvalue(matrix, weights);
    
    // 일관성 지수 (CI) 계산
    const consistencyIndex = (eigenvalue - n) / (n - 1);
    
    // 랜덤 지수 (RI) 선택
    const randomIndex = n <= RANDOM_INDEX.length ? RANDOM_INDEX[n - 1] : 1.59;
    
    // 일관성 비율 (CR) 계산
    const consistencyRatio = randomIndex > 0 ? consistencyIndex / randomIndex : 0;
    
    // 일관성 수준 판단
    const level = this.getConsistencyLevel(consistencyRatio);
    const isConsistent = consistencyRatio <= 0.1;
    
    // 메시지 생성
    const message = this.getConsistencyMessage(consistencyRatio, level);
    
    return {
      consistencyRatio,
      consistencyIndex,
      randomIndex,
      eigenvalue,
      isConsistent,
      message,
      level,
      worstPairs: [],
      currentCR: consistencyRatio,
      improvementPotential: 0,
      suggestions: []
    };
  },

  /**
   * 가중치 계산 (열 정규화 방법)
   * @param matrix 쌍대비교 행렬
   * @returns 정규화된 가중치 벡터
   */
  calculateWeights(matrix: number[][]): number[] {
    const n = matrix.length;
    const weights = new Array(n).fill(0);
    
    // 각 열의 합 계산
    const columnSums = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        columnSums[j] += matrix[i][j];
      }
    }
    
    // 정규화 및 평균 계산
    for (let i = 0; i < n; i++) {
      let rowSum = 0;
      for (let j = 0; j < n; j++) {
        if (columnSums[j] > 0) {
          rowSum += matrix[i][j] / columnSums[j];
        }
      }
      weights[i] = rowSum / n;
    }
    
    return weights;
  },

  /**
   * 최대 고유값 계산
   * @param matrix 쌍대비교 행렬
   * @param weights 가중치 벡터
   * @returns 최대 고유값
   */
  calculateMaxEigenvalue(matrix: number[][], weights: number[]): number {
    const n = matrix.length;
    let eigenvalue = 0;
    
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += matrix[i][j] * weights[j];
      }
      if (weights[i] > 0) {
        eigenvalue += sum / weights[i];
      }
    }
    
    return eigenvalue / n;
  },

  /**
   * 일관성 수준 판단
   * @param cr 일관성 비율
   * @returns 일관성 수준
   */
  getConsistencyLevel(cr: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (cr <= 0.05) return 'excellent';
    if (cr <= 0.08) return 'good';
    if (cr <= 0.10) return 'acceptable';
    return 'poor';
  },

  /**
   * 일관성 메시지 생성
   * @param cr 일관성 비율
   * @param level 일관성 수준
   * @returns 설명 메시지
   */
  getConsistencyMessage(cr: number, level: 'excellent' | 'good' | 'acceptable' | 'poor'): string {
    const percentage = (cr * 100).toFixed(2);
    
    switch (level) {
      case 'excellent':
        return `일관성 비율 ${percentage}%: 매우 우수한 일관성입니다.`;
      case 'good':
        return `일관성 비율 ${percentage}%: 좋은 일관성을 보입니다.`;
      case 'acceptable':
        return `일관성 비율 ${percentage}%: 허용 가능한 수준입니다.`;
      case 'poor':
        return `일관성 비율 ${percentage}%: 일관성이 부족합니다. 재평가가 필요합니다.`;
      default:
        return `일관성 비율 ${percentage}%`;
    }
  },

  /**
   * 일관성 색상 반환 (UI용)
   * @param cr 일관성 비율
   * @returns 색상 클래스명
   */
  getConsistencyColor(cr: number): string {
    if (cr <= 0.05) return 'text-green-600';
    if (cr <= 0.08) return 'text-blue-600';
    if (cr <= 0.10) return 'text-yellow-600';
    return 'text-red-600';
  },

  /**
   * 일관성 배지 색상 반환 (UI용)
   * @param cr 일관성 비율
   * @returns 배경 색상 클래스명
   */
  getConsistencyBadgeColor(cr: number): string {
    if (cr <= 0.05) return 'bg-green-100 text-green-800';
    if (cr <= 0.08) return 'bg-blue-100 text-blue-800';
    if (cr <= 0.10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  },

  /**
   * 일관성 아이콘 반환 (UI용)
   * @param cr 일관성 비율
   * @returns 이모지 아이콘
   */
  getConsistencyIcon(cr: number): string {
    if (cr <= 0.05) return '✅';
    if (cr <= 0.08) return '👍';
    if (cr <= 0.10) return '⚠️';
    return '❌';
  }
};

export default consistencyHelper;

// Named export for analyzeConsistency with enhanced functionality
export const analyzeConsistency = (matrix: number[][]): ConsistencyAnalysis => {
  const basicResult = consistencyHelper.checkConsistency(matrix);
  
  // Generate suggestions based on consistency level
  const suggestions: string[] = [];
  if (basicResult.level === 'excellent') {
    suggestions.push('✨ 매우 우수한 일관성입니다. 평가가 논리적이고 일관되게 이루어졌습니다.');
  } else if (basicResult.level === 'good') {
    suggestions.push('👍 좋은 일관성을 보입니다. 신뢰할 수 있는 평가입니다.');
  } else if (basicResult.level === 'acceptable') {
    suggestions.push('⚠️ 허용 가능한 수준이지만 일부 비교값 재검토를 권장합니다.');
    suggestions.push('💡 가장 큰 차이를 보이는 비교 쌍을 다시 확인해보세요.');
  } else {
    suggestions.push('❌ 일관성이 부족합니다. 판단을 재검토해주세요.');
    suggestions.push('💡 극단적인 값 (7, 8, 9)의 사용을 줄여보세요.');
    suggestions.push('💡 이행성 (A>B, B>C이면 A>C)을 확인해주세요.');
  }
  
  return {
    ...basicResult,
    suggestions
  };
};

// Named export for isPairwiseJudgmentSuspicious
export const isPairwiseJudgmentSuspicious = (
  directValue: number,
  indirectPathValues: number[]
): boolean => {
  if (indirectPathValues.length === 0) return false;
  
  const indirectProduct = indirectPathValues.reduce((acc, val) => acc * val, 1);
  const ratio = directValue / indirectProduct;
  
  // If ratio is > 3 or < 0.33, it's suspicious (more than 3x difference)
  return ratio > 3 || ratio < 0.33;
};

// Named export for getRealtimeConsistencyFeedback
export const getRealtimeConsistencyFeedback = (matrix: number[][]): { 
  message: string; 
  isConsistent: boolean; 
  status: string; 
  currentCR: number;
  impact?: string;
} => {
  const result = consistencyHelper.checkConsistency(matrix);
  return {
    message: result.message,
    isConsistent: result.isConsistent,
    status: result.level,
    currentCR: result.consistencyRatio,
    impact: undefined
  };
};
