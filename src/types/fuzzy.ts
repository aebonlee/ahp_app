/**
 * 퍼지 AHP 관련 타입 정의
 */

// 삼각 퍼지수 (Triangular Fuzzy Number)
export interface TriangularFuzzyNumber {
  L: number; // Lower bound (하한값)
  M: number; // Modal value (최빈값)
  U: number; // Upper bound (상한값)
}

// 퍼지 비교 데이터
export interface FuzzyComparison {
  rowId: string;
  colId: string;
  fuzzyValue: TriangularFuzzyNumber;
  linguisticTerm?: string; // 언어적 표현 (예: 'Weakly Important')
}

// 퍼지 비교 행렬
export interface FuzzyComparisonMatrix {
  projectId: string;
  criterionId?: string; // 대안 평가시 기준 ID
  evaluatorId: string;
  comparisons: FuzzyComparison[];
  timestamp?: string;
}

// 퍼지 가중치 결과
export interface FuzzyWeight {
  itemId: string;
  itemName: string;
  fuzzyWeight: TriangularFuzzyNumber;
  crispWeight?: number; // Defuzzified value
  rank?: number;
}

// 퍼지 일관성 지표
export interface FuzzyConsistency {
  fuzzyCI: TriangularFuzzyNumber; // 퍼지 일관성 지수
  crispCI: number; // Crisp 일관성 지수
  isConsistent: boolean;
  threshold: number;
}

// 퍼지 AHP 결과
export interface FuzzyAHPResult {
  projectId: string;
  evaluatorId: string;
  criteriaWeights?: FuzzyWeight[];
  alternativeScores?: {
    criterionId: string;
    weights: FuzzyWeight[];
  }[];
  globalScores?: FuzzyWeight[];
  consistency: FuzzyConsistency;
  completedAt: string;
}

// 언어적 변수 정의
export interface LinguisticVariable {
  term: string; // 예: 'Weakly Important'
  korean: string; // 예: '약간 중요'
  fuzzyNumber: TriangularFuzzyNumber;
  inverseFuzzyNumber: TriangularFuzzyNumber;
  description?: string;
}

// 퍼지 척도 설정
export interface FuzzyScaleConfig {
  scaleType: 'standard' | 'extended' | 'custom';
  linguisticVariables: LinguisticVariable[];
  allowIntermediateValues: boolean; // 중간값 허용 여부
}

// 퍼지 평가 세션
export interface FuzzyEvaluationSession {
  sessionId: string;
  projectId: string;
  evaluatorId: string;
  evaluationType: 'criteria' | 'alternatives';
  criterionId?: string; // 대안 평가시만
  startedAt: string;
  completedAt?: string;
  progress: number; // 0-100
  comparisons: FuzzyComparison[];
  savedAt?: string;
}

// Defuzzification 방법
export type DefuzzificationMethod = 
  | 'centroid' // 무게중심법
  | 'bisector' // 이분법
  | 'mom' // Mean of Maximum
  | 'som' // Smallest of Maximum
  | 'lom' // Largest of Maximum
  | 'coa'; // Center of Area

// 퍼지 연산 설정
export interface FuzzyOperationConfig {
  defuzzificationMethod: DefuzzificationMethod;
  alphaLevel?: number; // α-cut level for consistency check
  extentAnalysisMethod?: 'chang' | 'buckley' | 'geometric'; // 확장분석 방법
}