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

// 퍼지 가중치 결과
export interface FuzzyWeight {
  itemId: string;
  itemName: string;
  fuzzyWeight: TriangularFuzzyNumber;
  crispWeight?: number; // Defuzzified value
  rank?: number;
}

// 언어적 변수 정의
export interface LinguisticVariable {
  term: string; // 예: 'Weakly Important'
  korean: string; // 예: '약간 중요'
  fuzzyNumber: TriangularFuzzyNumber;
  inverseFuzzyNumber: TriangularFuzzyNumber;
  description?: string;
}

// Defuzzification 방법
export type DefuzzificationMethod =
  | 'centroid' // 무게중심법
  | 'bisector' // 이분법
  | 'mom' // Mean of Maximum
  | 'som' // Smallest of Maximum
  | 'lom' // Largest of Maximum
  | 'coa'; // Center of Area
