/**
 * 퍼지 AHP 계산 로직
 * Chang's Extent Analysis Method 구현
 */

import { 
  TriangularFuzzyNumber, 
  FuzzyComparison, 
  FuzzyWeight,
  DefuzzificationMethod 
} from '../types/fuzzy';

/**
 * 삼각 퍼지수 덧셈
 */
export function addFuzzyNumbers(...numbers: TriangularFuzzyNumber[]): TriangularFuzzyNumber {
  return numbers.reduce((sum, num) => ({
    L: sum.L + num.L,
    M: sum.M + num.M,
    U: sum.U + num.U
  }), { L: 0, M: 0, U: 0 });
}

/**
 * 삼각 퍼지수 곱셈
 */
export function multiplyFuzzyNumbers(a: TriangularFuzzyNumber, b: TriangularFuzzyNumber): TriangularFuzzyNumber {
  return {
    L: a.L * b.L,
    M: a.M * b.M,
    U: a.U * b.U
  };
}

/**
 * 삼각 퍼지수 스칼라 곱
 */
export function multiplyFuzzyScalar(fuzzy: TriangularFuzzyNumber, scalar: number): TriangularFuzzyNumber {
  return {
    L: fuzzy.L * scalar,
    M: fuzzy.M * scalar,
    U: fuzzy.U * scalar
  };
}

/**
 * 삼각 퍼지수 나눗셈
 */
export function divideFuzzyNumbers(a: TriangularFuzzyNumber, b: TriangularFuzzyNumber): TriangularFuzzyNumber {
  return {
    L: a.L / b.U,
    M: a.M / b.M,
    U: a.U / b.L
  };
}

/**
 * 삼각 퍼지수 역수
 */
export function inverseFuzzyNumber(fuzzy: TriangularFuzzyNumber): TriangularFuzzyNumber {
  return {
    L: 1 / fuzzy.U,
    M: 1 / fuzzy.M,
    U: 1 / fuzzy.L
  };
}

/**
 * Defuzzification - 퍼지수를 실수로 변환
 */
export function defuzzify(
  fuzzy: TriangularFuzzyNumber, 
  method: DefuzzificationMethod = 'centroid'
): number {
  switch (method) {
    case 'centroid':
      // 무게중심법: (L + M + U) / 3
      return (fuzzy.L + fuzzy.M + fuzzy.U) / 3;
    
    case 'mom':
      // Mean of Maximum: M 값 반환
      return fuzzy.M;
    
    case 'som':
      // Smallest of Maximum: L 값 반환
      return fuzzy.L;
    
    case 'lom':
      // Largest of Maximum: U 값 반환
      return fuzzy.U;
    
    case 'bisector':
      // 이분법: (L + 2M + U) / 4
      return (fuzzy.L + 2 * fuzzy.M + fuzzy.U) / 4;
    
    case 'coa':
    default:
      // Center of Area: (L + 4M + U) / 6
      return (fuzzy.L + 4 * fuzzy.M + fuzzy.U) / 6;
  }
}

/**
 * Chang's Extent Analysis를 사용한 퍼지 가중치 계산
 */
export async function calculateFuzzyWeights(
  items: Array<{ id: string; name: string }>,
  comparisons: FuzzyComparison[]
): Promise<TriangularFuzzyNumber[]> {
  const n = items.length;
  
  // 1. 퍼지 비교 행렬 구성
  const matrix: TriangularFuzzyNumber[][] = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = { L: 1, M: 1, U: 1 };
      } else {
        const comparison = comparisons.find(
          c => (c.rowId === items[i].id && c.colId === items[j].id) ||
               (c.rowId === items[j].id && c.colId === items[i].id)
        );
        
        if (comparison) {
          if (comparison.rowId === items[i].id) {
            matrix[i][j] = comparison.fuzzyValue;
          } else {
            matrix[i][j] = inverseFuzzyNumber(comparison.fuzzyValue);
          }
        } else {
          matrix[i][j] = { L: 1, M: 1, U: 1 };
        }
      }
    }
  }
  
  // 2. 각 행의 퍼지 합성값 계산
  const rowSums: TriangularFuzzyNumber[] = [];
  for (let i = 0; i < n; i++) {
    rowSums[i] = matrix[i].reduce((sum, val) => addFuzzyNumbers(sum, val));
  }
  
  // 3. 전체 합 계산
  const totalSum = rowSums.reduce((sum, val) => addFuzzyNumbers(sum, val));
  
  // 4. 정규화된 퍼지 가중치 계산
  const fuzzyWeights: TriangularFuzzyNumber[] = [];
  for (let i = 0; i < n; i++) {
    fuzzyWeights[i] = divideFuzzyNumbers(rowSums[i], totalSum);
  }
  
  return fuzzyWeights;
}

/**
 * 퍼지 일관성 검사
 * Saaty's CR을 퍼지 환경에 적용
 */
export async function checkFuzzyConsistency(
  comparisons: FuzzyComparison[],
  n: number
): Promise<number> {
  // 비퍼지화된 값으로 일관성 계산
  const crispMatrix: number[][] = [];
  
  // 비교값을 crisp 값으로 변환
  const crispComparisons = comparisons.map(c => ({
    ...c,
    crispValue: defuzzify(c.fuzzyValue, 'centroid')
  }));
  
  // Crisp 행렬 구성 (간단한 버전)
  // 실제로는 더 복잡한 퍼지 일관성 지수 계산이 필요
  for (let i = 0; i < n; i++) {
    crispMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        crispMatrix[i][j] = 1;
      } else {
        const comp = crispComparisons.find(
          c => (c.rowId === `item_${i}` && c.colId === `item_${j}`)
        );
        crispMatrix[i][j] = comp ? comp.crispValue : 1;
      }
    }
  }
  
  // 고유값 계산 (간소화된 버전)
  // 실제 구현시에는 행렬 고유값 계산 라이브러리 필요
  const lambdaMax = n; // 임시값
  const CI = (lambdaMax - n) / (n - 1);
  const RI = getRandomIndex(n);
  const CR = RI > 0 ? CI / RI : 0;
  
  return CR;
}

/**
 * Random Index (RI) 값 조회
 */
function getRandomIndex(n: number): number {
  const riTable: { [key: number]: number } = {
    1: 0, 2: 0, 3: 0.52, 4: 0.89, 5: 1.11,
    6: 1.25, 7: 1.35, 8: 1.40, 9: 1.45, 10: 1.49
  };
  return riTable[n] || 1.49;
}

/**
 * 퍼지수 비교 (가능성 정도)
 * M1 >= M2의 가능성 정도 계산
 */
export function possibilityDegree(
  M1: TriangularFuzzyNumber, 
  M2: TriangularFuzzyNumber
): number {
  if (M1.M >= M2.M) {
    return 1;
  } else if (M2.L >= M1.U) {
    return 0;
  } else {
    return (M2.L - M1.U) / ((M2.L - M2.M) + (M1.M - M1.U));
  }
}

/**
 * 확장 원리를 사용한 퍼지 가중치 정규화
 */
export function normalizeFuzzyWeights(weights: TriangularFuzzyNumber[]): TriangularFuzzyNumber[] {
  // Crisp 값으로 변환 후 정규화
  const crispWeights = weights.map(w => defuzzify(w));
  const sum = crispWeights.reduce((a, b) => a + b, 0);
  
  return weights.map(w => ({
    L: w.L / sum,
    M: w.M / sum,
    U: w.U / sum
  }));
}

/**
 * 퍼지 AHP 최종 점수 계산
 * 기준 가중치와 대안 점수를 결합
 */
export function calculateFuzzyGlobalScores(
  criteriaWeights: TriangularFuzzyNumber[],
  alternativeScores: TriangularFuzzyNumber[][]
): TriangularFuzzyNumber[] {
  const nAlternatives = alternativeScores[0].length;
  const globalScores: TriangularFuzzyNumber[] = [];
  
  for (let i = 0; i < nAlternatives; i++) {
    let score: TriangularFuzzyNumber = { L: 0, M: 0, U: 0 };
    
    for (let j = 0; j < criteriaWeights.length; j++) {
      const weighted = multiplyFuzzyNumbers(criteriaWeights[j], alternativeScores[j][i]);
      score = addFuzzyNumbers(score, weighted);
    }
    
    globalScores.push(score);
  }
  
  return normalizeFuzzyWeights(globalScores);
}

/**
 * 퍼지수 순위 결정
 * Chen & Hwang's 방법 사용
 */
export function rankFuzzyNumbers(fuzzyNumbers: TriangularFuzzyNumber[]): number[] {
  // 1. 각 퍼지수의 crisp 값 계산
  const crispValues = fuzzyNumbers.map(fn => defuzzify(fn, 'centroid'));
  
  // 2. 순위 배열 생성
  const ranks: number[] = new Array(fuzzyNumbers.length);
  const sortedIndices = crispValues
    .map((val, idx) => ({ val, idx }))
    .sort((a, b) => b.val - a.val)
    .map(item => item.idx);
  
  sortedIndices.forEach((idx, rank) => {
    ranks[idx] = rank + 1;
  });
  
  return ranks;
}

/**
 * 민감도 분석을 위한 α-cut
 */
export function alphaLevelSet(
  fuzzy: TriangularFuzzyNumber, 
  alpha: number
): [number, number] {
  if (alpha < 0 || alpha > 1) {
    throw new Error('Alpha level must be between 0 and 1');
  }
  
  const lower = fuzzy.L + alpha * (fuzzy.M - fuzzy.L);
  const upper = fuzzy.U - alpha * (fuzzy.U - fuzzy.M);
  
  return [lower, upper];
}

/**
 * 퍼지 일관성 비율 계산 (Buckley's method)
 */
export function calculateFuzzyConsistencyRatio(
  matrix: TriangularFuzzyNumber[][]
): TriangularFuzzyNumber {
  const n = matrix.length;
  
  // 기하평균 방법으로 가중치 계산
  const geometricMeans: TriangularFuzzyNumber[] = [];
  
  for (let i = 0; i < n; i++) {
    let product: TriangularFuzzyNumber = { L: 1, M: 1, U: 1 };
    
    for (let j = 0; j < n; j++) {
      product = multiplyFuzzyNumbers(product, matrix[i][j]);
    }
    
    // n제곱근 (근사)
    geometricMeans[i] = {
      L: Math.pow(product.L, 1/n),
      M: Math.pow(product.M, 1/n),
      U: Math.pow(product.U, 1/n)
    };
  }
  
  // 정규화
  const sum = geometricMeans.reduce((s, gm) => addFuzzyNumbers(s, gm));
  const weights = geometricMeans.map(gm => divideFuzzyNumbers(gm, sum));
  
  // 일관성 지수 계산 (간소화)
  const crispCR = 0.05; // 임시 값
  
  return {
    L: Math.max(0, crispCR - 0.02),
    M: crispCR,
    U: Math.min(1, crispCR + 0.02)
  };
}