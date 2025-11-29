// 계층적 평가 시스템 계산 유틸리티
// Opus 4.1 Power Method 알고리즘 구현

import type { 
  PowerMethodConfig, 
  PowerMethodResult, 
  ConsistencyResult,
  HierarchyNode,
  HierarchicalWeights
} from '../types/hierarchy';

// Saaty의 일관성 지수
export const RANDOM_INDEX: Record<number, number> = {
  1: 0,
  2: 0,
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

// Power Method 기본 설정
export const DEFAULT_POWER_METHOD_CONFIG: PowerMethodConfig = {
  maxIterations: 1000,
  tolerance: 1e-10,
  convergenceThreshold: 1e-6
};

/**
 * 쌍대비교 행렬 생성
 */
export function buildComparisonMatrix(
  elements: string[],
  comparisons: Record<string, number>
): number[][] {
  const n = elements.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

  // 대각선은 1로 설정
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
  }

  // 상삼각 행렬 채우기
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const key = `${elements[i]}-${elements[j]}`;
      const reverseKey = `${elements[j]}-${elements[i]}`;
      
      if (comparisons[key]) {
        matrix[i][j] = comparisons[key];
        matrix[j][i] = 1 / comparisons[key];
      } else if (comparisons[reverseKey]) {
        matrix[i][j] = 1 / comparisons[reverseKey];
        matrix[j][i] = comparisons[reverseKey];
      }
    }
  }

  return matrix;
}

/**
 * Power Method 알고리즘으로 주 고유벡터 계산
 */
export function calculateEigenvectorPowerMethod(
  matrix: number[][],
  config: PowerMethodConfig = DEFAULT_POWER_METHOD_CONFIG
): PowerMethodResult {
  const n = matrix.length;
  let eigenvector = Array(n).fill(1 / n); // 초기 벡터
  let prevEigenvector = [...eigenvector];
  let eigenvalue = 0;
  let iteration = 0;
  
  for (iteration = 0; iteration < config.maxIterations; iteration++) {
    // 행렬과 벡터 곱셈
    const newVector = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        newVector[i] += matrix[i][j] * eigenvector[j];
      }
    }
    
    // 정규화
    const norm = Math.sqrt(newVector.reduce((sum, val) => sum + val * val, 0));
    eigenvector = newVector.map(val => val / norm);
    
    // 고유값 계산 (Rayleigh quotient)
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        numerator += eigenvector[i] * matrix[i][j] * eigenvector[j];
      }
      denominator += eigenvector[i] * eigenvector[i];
    }
    eigenvalue = numerator / denominator;
    
    // 수렴 확인
    const error = Math.sqrt(
      eigenvector.reduce((sum, val, i) => 
        sum + Math.pow(val - prevEigenvector[i], 2), 0)
    );
    
    if (error < config.tolerance) {
      break;
    }
    
    prevEigenvector = [...eigenvector];
  }
  
  // 가중치 정규화 (합이 1이 되도록)
  const sum = eigenvector.reduce((acc, val) => acc + val, 0);
  const weights = eigenvector.map(val => val / sum);
  
  return {
    weights,
    eigenvalue,
    iterations: iteration + 1,
    converged: iteration < config.maxIterations,
    error: Math.sqrt(
      weights.reduce((sum, val, i) => 
        sum + Math.pow(val - prevEigenvector[i], 2), 0)
    )
  };
}

/**
 * 일관성 비율 계산
 */
export function calculateConsistencyRatio(matrix: number[][]): ConsistencyResult {
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
  
  const result = calculateEigenvectorPowerMethod(matrix);
  const maxEigenvalue = result.eigenvalue;
  
  const consistencyIndex = (maxEigenvalue - n) / (n - 1);
  const randomIndex = RANDOM_INDEX[n] || 1.59;
  const consistencyRatio = consistencyIndex / randomIndex;
  
  // 비일관적인 쌍 식별
  const inconsistentPairs = findInconsistentPairs(matrix, result.weights);
  
  return {
    isConsistent: consistencyRatio <= 0.1,
    ratio: consistencyRatio,
    index: consistencyIndex,
    eigenValue: maxEigenvalue,
    eigenVector: result.weights,
    message: consistencyRatio <= 0.1 ? 'Matrix is consistent' : `Inconsistent: CR = ${consistencyRatio.toFixed(4)} > 0.10`
  };
}

/**
 * 비일관적인 쌍대비교 식별
 */
function findInconsistentPairs(
  matrix: number[][],
  weights: number[]
): Array<{
  elementA: string;
  elementB: string;
  currentValue: number;
  suggestedValue: number;
  impact: number;
}> {
  const n = matrix.length;
  const inconsistentPairs = [];
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const currentValue = matrix[i][j];
      const suggestedValue = weights[i] / weights[j];
      const deviation = Math.abs(Math.log(currentValue / suggestedValue));
      
      if (deviation > 0.5) { // 임계값
        inconsistentPairs.push({
          elementA: `element_${i}`,
          elementB: `element_${j}`,
          currentValue,
          suggestedValue,
          impact: deviation
        });
      }
    }
  }
  
  return inconsistentPairs.sort((a, b) => b.impact - a.impact);
}

/**
 * 계층구조의 글로벌 가중치 계산
 */
export function calculateGlobalWeights(
  hierarchyNodes: HierarchyNode[],
  localWeights: Record<string, Record<string, number>>
): HierarchicalWeights[] {
  const results: HierarchicalWeights[] = [];
  const nodeMap = new Map(hierarchyNodes.map(node => [node.id, node]));
  
  function calculateGlobalWeight(nodeId: string, path: string[] = []): number {
    const node = nodeMap.get(nodeId);
    if (!node) return 0;
    
    if (!node.parentId) {
      // 루트 노드
      return 1;
    }
    
    const parentWeight = calculateGlobalWeight(node.parentId, [...path, node.parentId]);
    const localWeight = localWeights[node.parentId]?.[nodeId] || 0;
    
    return parentWeight * localWeight;
  }
  
  // 각 노드의 글로벌 가중치 계산
  for (const node of hierarchyNodes) {
    if (node.nodeType !== 'goal') {
      const globalWeight = calculateGlobalWeight(node.id);
      const hierarchyPath = getHierarchyPath(node.id, nodeMap);
      
      results.push({
        nodeId: node.id,
        localWeights: localWeights[node.id] || {},
        globalWeights: { [node.id]: globalWeight },
        hierarchyPath,
        level: node.level
      });
    }
  }
  
  return results;
}

/**
 * 노드의 계층 경로 추출
 */
function getHierarchyPath(
  nodeId: string, 
  nodeMap: Map<string, HierarchyNode>
): string[] {
  const path: string[] = [];
  let currentNode = nodeMap.get(nodeId);
  
  while (currentNode) {
    path.unshift(currentNode.id);
    currentNode = currentNode.parentId ? nodeMap.get(currentNode.parentId) : undefined;
  }
  
  return path;
}

/**
 * 계층 구조 생성 및 검증
 */
export function buildHierarchyTree(flatNodes: HierarchyNode[]): HierarchyNode[] {
  const nodeMap = new Map<string, HierarchyNode>();
  const rootNodes: HierarchyNode[] = [];
  
  // 노드 맵 생성
  flatNodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] });
  });
  
  // 계층 구조 구성
  flatNodes.forEach(node => {
    const nodeWithChildren = nodeMap.get(node.id)!;
    
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(nodeWithChildren);
        parent.children.sort((a, b) => a.position - b.position);
      }
    } else {
      rootNodes.push(nodeWithChildren);
    }
  });
  
  return rootNodes.sort((a, b) => a.position - b.position);
}

/**
 * 계층 구조 검증
 */
export function validateHierarchyStructure(nodes: HierarchyNode[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // 루트 노드 확인
  const rootNodes = nodes.filter(node => !node.parentId);
  if (rootNodes.length !== 1) {
    errors.push('계층구조에는 정확히 하나의 루트 노드(목표)가 있어야 합니다.');
  }
  
  // 레벨 일관성 확인
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  for (const node of nodes) {
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent && parent.level >= node.level) {
        errors.push(`노드 ${node.name}의 레벨이 부모 노드보다 같거나 낮습니다.`);
      }
    }
  }
  
  // 순환 참조 확인
  for (const node of nodes) {
    if (hasCircularReference(node.id, nodeMap)) {
      errors.push(`노드 ${node.name}에서 순환 참조가 발견되었습니다.`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function hasCircularReference(
  nodeId: string,
  nodeMap: Map<string, HierarchyNode>,
  visited: Set<string> = new Set()
): boolean {
  if (visited.has(nodeId)) {
    return true;
  }
  
  visited.add(nodeId);
  const node = nodeMap.get(nodeId);
  
  if (node?.parentId) {
    return hasCircularReference(node.parentId, nodeMap, visited);
  }
  
  return false;
}