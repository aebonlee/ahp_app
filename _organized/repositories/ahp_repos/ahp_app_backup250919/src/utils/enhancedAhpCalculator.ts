/**
 * 향상된 AHP 계산 유틸리티
 * 정확한 일관성 비율 계산, 민감도 분석, 그룹 의사결정 지원
 */

export interface AHPResult {
  priorities: number[];
  consistencyRatio: number;
  consistencyIndex: number;
  lambdaMax: number;
  isConsistent: boolean;
  eigenVector: number[];
  normalizedMatrix: number[][];
  weights: { [key: string]: number };
}

export interface GroupAHPResult {
  individualResults: AHPResult[];
  aggregatedWeights: number[];
  groupConsistency: number;
  consensusLevel: number;
  method: 'geometric_mean' | 'weighted_average';
}

export interface SensitivityAnalysisResult {
  baseWeights: number[];
  sensitivityMatrix: number[][];
  criticalRanges: Array<{
    criterion: string;
    lowerBound: number;
    upperBound: number;
    currentWeight: number;
  }>;
  stability: 'stable' | 'moderately_stable' | 'unstable';
}

export interface HierarchicalNode {
  id: string;
  name: string;
  level: number;
  parent?: string;
  children: string[];
  weight: number;
  globalWeight: number;
}

// Random Index (RI) values for consistency ratio calculation
const RANDOM_INDEX: { [key: number]: number } = {
  1: 0.0,
  2: 0.0,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
  11: 1.51,
  12: 1.48,
  13: 1.56,
  14: 1.57,
  15: 1.59
};

/**
 * 쌍대비교 매트릭스로부터 우선순위 벡터 계산 (고유벡터 방법)
 */
export function calculatePriorities(matrix: number[][]): AHPResult {
  const n = matrix.length;
  
  if (n === 0) {
    return {
      priorities: [],
      consistencyRatio: 0,
      consistencyIndex: 0,
      lambdaMax: 0,
      isConsistent: true,
      eigenVector: [],
      normalizedMatrix: [],
      weights: {}
    };
  }

  // Power method를 사용한 주고유벡터 계산
  let eigenVector = new Array(n).fill(1);
  let previousEigenVector = [...eigenVector];
  const maxIterations = 100;
  const tolerance = 1e-10;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // 매트릭스와 고유벡터 곱
    eigenVector = matrix.map(row => 
      row.reduce((sum, val, j) => sum + val * previousEigenVector[j], 0)
    );
    
    // 정규화
    const sum = eigenVector.reduce((a, b) => a + b, 0);
    eigenVector = eigenVector.map(val => val / sum);
    
    // 수렴 확인
    const maxDiff = Math.max(...eigenVector.map((val, i) => 
      Math.abs(val - previousEigenVector[i])
    ));
    
    if (maxDiff < tolerance) break;
    
    previousEigenVector = [...eigenVector];
  }

  // 일관성 계산
  const lambdaMax = calculateLambdaMax(matrix, eigenVector);
  const consistencyIndex = (lambdaMax - n) / (n - 1);
  const randomIndex = RANDOM_INDEX[n] || 0;
  const consistencyRatio = n <= 2 ? 0 : consistencyIndex / randomIndex;

  // 정규화된 매트릭스 계산
  const normalizedMatrix = matrix.map(row => {
    const colSum = matrix.reduce((sum, r) => sum + r[row.indexOf(row[0])], 0);
    return row.map((val, j) => {
      const colIndex = j;
      const columnSum = matrix.reduce((sum, r) => sum + r[colIndex], 0);
      return val / columnSum;
    });
  });

  // 가중치 객체 생성 (인덱스 기반)
  const weights: { [key: string]: number } = {};
  eigenVector.forEach((weight, index) => {
    weights[index.toString()] = weight;
  });

  return {
    priorities: eigenVector,
    consistencyRatio,
    consistencyIndex,
    lambdaMax,
    isConsistent: consistencyRatio <= 0.1,
    eigenVector,
    normalizedMatrix,
    weights
  };
}

/**
 * 최대 고유값(λmax) 계산
 */
function calculateLambdaMax(matrix: number[][], eigenVector: number[]): number {
  const n = matrix.length;
  let lambdaMax = 0;
  
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += matrix[i][j] * eigenVector[j];
    }
    lambdaMax += sum / eigenVector[i];
  }
  
  return lambdaMax / n;
}

/**
 * 쌍대비교 매트릭스 구성
 */
export function buildComparisonMatrix(
  elements: Array<{ id: string; name: string }>,
  comparisons: Array<{ i: number; j: number; value: number }>
): number[][] {
  const n = elements.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(1));
  
  // 대각선은 1로 설정
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
  }
  
  // 쌍대비교 값 설정
  comparisons.forEach(({ i, j, value }) => {
    if (i < n && j < n && i !== j) {
      matrix[i][j] = value;
      matrix[j][i] = 1 / value; // 역수 관계
    }
  });
  
  return matrix;
}

/**
 * 그룹 AHP 계산 (기하평균 또는 가중평균)
 */
export function calculateGroupAHP(
  individualMatrices: number[][][],
  evaluatorWeights: number[] = [],
  method: 'geometric_mean' | 'weighted_average' = 'geometric_mean'
): GroupAHPResult {
  const n = individualMatrices[0]?.length || 0;
  const numEvaluators = individualMatrices.length;
  
  if (numEvaluators === 0 || n === 0) {
    return {
      individualResults: [],
      aggregatedWeights: [],
      groupConsistency: 0,
      consensusLevel: 0,
      method
    };
  }
  
  // 개별 결과 계산
  const individualResults = individualMatrices.map(matrix => calculatePriorities(matrix));
  
  // 집계 가중치 계산
  let aggregatedWeights: number[];
  
  if (method === 'geometric_mean') {
    // 기하평균 방법
    aggregatedWeights = new Array(n).fill(0);
    
    for (let i = 0; i < n; i++) {
      let product = 1;
      individualResults.forEach(result => {
        product *= result.priorities[i];
      });
      aggregatedWeights[i] = Math.pow(product, 1 / numEvaluators);
    }
    
    // 정규화
    const sum = aggregatedWeights.reduce((a, b) => a + b, 0);
    aggregatedWeights = aggregatedWeights.map(w => w / sum);
    
  } else {
    // 가중평균 방법
    const weights = evaluatorWeights.length === numEvaluators 
      ? evaluatorWeights 
      : new Array(numEvaluators).fill(1 / numEvaluators);
    
    aggregatedWeights = new Array(n).fill(0);
    
    for (let i = 0; i < n; i++) {
      individualResults.forEach((result, j) => {
        aggregatedWeights[i] += result.priorities[i] * weights[j];
      });
    }
  }
  
  // 그룹 일관성 계산
  const groupConsistency = individualResults.reduce((sum, result) => 
    sum + result.consistencyRatio, 0) / numEvaluators;
  
  // 합의 수준 계산 (가중치 간 분산 기반)
  let consensusLevel = 0;
  if (numEvaluators > 1) {
    const weightVariances = new Array(n).fill(0);
    
    for (let i = 0; i < n; i++) {
      const mean = aggregatedWeights[i];
      const variance = individualResults.reduce((sum, result) => 
        sum + Math.pow(result.priorities[i] - mean, 2), 0) / numEvaluators;
      weightVariances[i] = variance;
    }
    
    const avgVariance = weightVariances.reduce((a, b) => a + b, 0) / n;
    consensusLevel = Math.max(0, 1 - avgVariance * 10); // 경험적 공식
  }
  
  return {
    individualResults,
    aggregatedWeights,
    groupConsistency,
    consensusLevel,
    method
  };
}

/**
 * 민감도 분석 수행
 */
export function performSensitivityAnalysis(
  originalMatrix: number[][],
  elements: Array<{ id: string; name: string }>,
  perturbationRange: number = 0.2
): SensitivityAnalysisResult {
  const n = originalMatrix.length;
  const baseResult = calculatePriorities(originalMatrix);
  const baseWeights = baseResult.priorities;
  
  const sensitivityMatrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
  const criticalRanges: Array<{
    criterion: string;
    lowerBound: number;
    upperBound: number;
    currentWeight: number;
  }> = [];
  
  // 각 기준에 대해 민감도 분석
  for (let i = 0; i < n; i++) {
    let lowerBound = baseWeights[i];
    let upperBound = baseWeights[i];
    
    // 해당 행의 값들을 변경하며 가중치 변화 관찰
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      
      const originalValue = originalMatrix[i][j];
      const perturbations = [
        originalValue * (1 - perturbationRange),
        originalValue * (1 + perturbationRange)
      ];
      
      perturbations.forEach(newValue => {
        const testMatrix = originalMatrix.map(row => [...row]);
        testMatrix[i][j] = newValue;
        testMatrix[j][i] = 1 / newValue;
        
        const testResult = calculatePriorities(testMatrix);
        
        if (testResult.priorities[i] < lowerBound) {
          lowerBound = testResult.priorities[i];
        }
        if (testResult.priorities[i] > upperBound) {
          upperBound = testResult.priorities[i];
        }
        
        sensitivityMatrix[i][j] = Math.abs(testResult.priorities[i] - baseWeights[i]) / baseWeights[i];
      });
    }
    
    criticalRanges.push({
      criterion: elements[i]?.name || `기준 ${i + 1}`,
      lowerBound,
      upperBound,
      currentWeight: baseWeights[i]
    });
  }
  
  // 안정성 평가
  const maxSensitivity = Math.max(...sensitivityMatrix.flat());
  let stability: 'stable' | 'moderately_stable' | 'unstable';
  
  if (maxSensitivity < 0.1) {
    stability = 'stable';
  } else if (maxSensitivity < 0.3) {
    stability = 'moderately_stable';
  } else {
    stability = 'unstable';
  }
  
  return {
    baseWeights,
    sensitivityMatrix,
    criticalRanges,
    stability
  };
}

/**
 * 계층적 AHP 계산
 */
export function calculateHierarchicalAHP(
  hierarchy: { [nodeId: string]: HierarchicalNode },
  localWeights: { [nodeId: string]: number[] },
  rootId: string
): { [nodeId: string]: number } {
  const globalWeights: { [nodeId: string]: number } = {};
  
  // 깊이 우선 탐색으로 글로벌 가중치 계산
  function calculateGlobalWeights(nodeId: string, parentWeight: number = 1) {
    const node = hierarchy[nodeId];
    if (!node) return;
    
    const nodeGlobalWeight = parentWeight * (globalWeights[nodeId] || node.weight || 0);
    globalWeights[nodeId] = nodeGlobalWeight;
    
    // 자식 노드들에 대해 재귀 계산
    if (node.children && node.children.length > 0) {
      const childWeights = localWeights[nodeId] || [];
      node.children.forEach((childId, index) => {
        const childLocalWeight = childWeights[index] || 0;
        calculateGlobalWeights(childId, nodeGlobalWeight * childLocalWeight);
      });
    }
  }
  
  globalWeights[rootId] = 1;
  calculateGlobalWeights(rootId);
  
  return globalWeights;
}

/**
 * 매트릭스 일관성 검증
 */
export function validateMatrixConsistency(matrix: number[][]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const n = matrix.length;
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 기본 구조 검증
  if (n === 0) {
    errors.push('빈 매트릭스입니다.');
    return { isValid: false, errors, warnings };
  }
  
  if (matrix.some(row => row.length !== n)) {
    errors.push('매트릭스가 정사각형이 아닙니다.');
  }
  
  // 대각선 검증
  for (let i = 0; i < n; i++) {
    if (Math.abs(matrix[i][i] - 1) > 1e-10) {
      errors.push(`대각선 원소 [${i+1}, ${i+1}]이 1이 아닙니다.`);
    }
  }
  
  // 역수 관계 검증
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const expected = 1 / matrix[i][j];
      const actual = matrix[j][i];
      
      if (Math.abs(expected - actual) > 1e-6) {
        errors.push(`역수 관계가 성립하지 않습니다: [${i+1}, ${j+1}] = ${matrix[i][j]}, [${j+1}, ${i+1}] = ${matrix[j][i]}`);
      }
    }
  }
  
  // 일관성 검증
  const result = calculatePriorities(matrix);
  if (result.consistencyRatio > 0.1) {
    warnings.push(`일관성 비율이 높습니다: ${(result.consistencyRatio * 100).toFixed(2)}%`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  calculatePriorities,
  buildComparisonMatrix,
  calculateGroupAHP,
  performSensitivityAnalysis,
  calculateHierarchicalAHP,
  validateMatrixConsistency
};