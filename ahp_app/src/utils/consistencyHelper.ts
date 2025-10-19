// Consistency Helper utilities for AHP
export interface InconsistentPair {
  element1: string;
  element2: string;
  currentValue: number;
  suggestedValue: number;
  impactOnCR: number;
  confidence: number; // 0-1, higher means more confident in suggestion
}

export interface ConsistencyAnalysis {
  currentCR: number;
  targetCR: number;
  worstPairs: InconsistentPair[];
  suggestions: string[];
  improvementPotential: number; // Expected CR after applying suggestions
}

/**
 * Analyze matrix for inconsistencies and provide improvement suggestions
 */
export function analyzeConsistency(
  matrix: number[][],
  elementNames: string[],
  targetCR: number = 0.1
): ConsistencyAnalysis {
  const n = matrix.length;
  
  if (n < 3) {
    return {
      currentCR: 0,
      targetCR,
      worstPairs: [],
      suggestions: ['일관성 검사는 3개 이상의 요소가 필요합니다.'],
      improvementPotential: 0
    };
  }

  // Calculate current CR
  const currentCR = calculateMatrixCR(matrix);
  
  if (currentCR <= targetCR) {
    return {
      currentCR,
      targetCR,
      worstPairs: [],
      suggestions: ['현재 일관성이 허용 가능한 수준입니다.'],
      improvementPotential: currentCR
    };
  }

  // Find inconsistent pairs by testing modifications
  const inconsistentPairs: InconsistentPair[] = [];
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const analysis = analyzeIndirectPath(matrix[i][j], i, j, matrix);
      if (analysis.impactOnCR > 0.01) { // Only consider pairs with significant impact
        inconsistentPairs.push({
          element1: elementNames[i],
          element2: elementNames[j],
          currentValue: matrix[i][j],
          suggestedValue: analysis.suggestedValue,
          impactOnCR: analysis.impactOnCR,
          confidence: analysis.confidence
        });
      }
    }
  }

  // Sort by impact on CR (descending)
  inconsistentPairs.sort((a, b) => b.impactOnCR - a.impactOnCR);
  
  // Take top 5 worst pairs
  const worstPairs = inconsistentPairs.slice(0, 5);
  
  // Generate suggestions
  const suggestions = generateSuggestions(worstPairs, currentCR, targetCR);
  
  // Estimate improvement potential
  const improvementPotential = estimateImprovement(matrix, worstPairs.slice(0, 3));

  return {
    currentCR,
    targetCR,
    worstPairs,
    suggestions,
    improvementPotential
  };
}

/**
 * Analyze indirect path consistency for a specific pair
 */
function analyzeIndirectPath(
  currentValue: number,
  i: number,
  j: number,
  matrix: number[][]
): { suggestedValue: number; impactOnCR: number; confidence: number } {
  const n = matrix.length;
  let totalIndirectValue = 0;
  let pathCount = 0;
  let maxDeviation = 0;

  // Calculate indirect paths through other elements
  for (let k = 0; k < n; k++) {
    if (k !== i && k !== j) {
      const indirectValue = matrix[i][k] * matrix[k][j];
      totalIndirectValue += indirectValue;
      pathCount++;
      
      const deviation = Math.abs(Math.log(currentValue) - Math.log(indirectValue));
      maxDeviation = Math.max(maxDeviation, deviation);
    }
  }

  if (pathCount === 0) {
    return {
      suggestedValue: currentValue,
      impactOnCR: 0,
      confidence: 0
    };
  }

  const averageIndirectValue = totalIndirectValue / pathCount;
  const deviation = Math.abs(Math.log(currentValue) - Math.log(averageIndirectValue));
  
  // Impact is roughly proportional to deviation
  const impactOnCR = deviation * 0.1; // Rough estimation
  
  // Confidence is higher when indirect paths are more consistent
  const confidence = Math.exp(-maxDeviation);

  return {
    suggestedValue: averageIndirectValue,
    impactOnCR,
    confidence
  };
}

/**
 * Calculate Consistency Ratio for a matrix
 */
function calculateMatrixCR(matrix: number[][]): number {
  const n = matrix.length;
  
  // Calculate eigenvalue (simplified approximation)
  const columnSums = matrix[0].map((_, j) => matrix.reduce((sum, row) => sum + row[j], 0));
  const normalizedMatrix = matrix.map(row => row.map((val, j) => val / columnSums[j]));
  const priorities = normalizedMatrix.map(row => row.reduce((sum, val) => sum + val, 0) / n);
  
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += matrix[i][j] * priorities[j];
    }
    lambdaMax += sum / priorities[i];
  }
  lambdaMax /= n;
  
  // Consistency Index (CI)
  const CI = (lambdaMax - n) / (n - 1);
  
  // Random Index (RI)
  const RI = [0, 0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45][n] || 1.45;
  
  return CI / RI;
}

/**
 * Generate human-readable suggestions
 */
function generateSuggestions(
  worstPairs: InconsistentPair[],
  currentCR: number,
  targetCR: number
): string[] {
  const suggestions: string[] = [];
  
  if (worstPairs.length === 0) {
    suggestions.push('일관성이 이미 좋은 상태입니다.');
    return suggestions;
  }

  suggestions.push(`현재 일관성 비율: ${(currentCR * 100).toFixed(1)}% (목표: ${(targetCR * 100).toFixed(1)}%)`);
  suggestions.push('');
  suggestions.push('다음 비교를 재검토하여 일관성을 개선할 수 있습니다:');
  suggestions.push('');

  worstPairs.forEach((pair, index) => {
    const currentValueStr = formatValue(pair.currentValue);
    const suggestedValueStr = formatValue(pair.suggestedValue);
    const direction = pair.currentValue > pair.suggestedValue ? '낮춰' : '높여';
    
    suggestions.push(
      `${index + 1}. "${pair.element1}" vs "${pair.element2}": ` +
      `현재 ${currentValueStr} → 권장 ${suggestedValueStr}로 ${direction}보세요 ` +
      `(신뢰도: ${(pair.confidence * 100).toFixed(0)}%)`
    );
  });

  suggestions.push('');
  suggestions.push('💡 팁:');
  suggestions.push('• 간접 경로를 통한 논리적 일관성을 확인해보세요');
  suggestions.push('• 가장 확신하는 비교부터 수정하세요');
  suggestions.push('• 한 번에 하나씩만 수정하여 변화를 확인하세요');

  return suggestions;
}

/**
 * Estimate CR improvement after applying suggested changes
 */
function estimateImprovement(matrix: number[][], topPairs: InconsistentPair[]): number {
  if (topPairs.length === 0) return calculateMatrixCR(matrix);

  // Rough estimation of improvement potential
  // In a real implementation, this would apply the suggested changes and recalculate CR
  return calculateMatrixCR(matrix) * 0.7; // Rough estimation of 30% improvement
}

/**
 * Format numerical value for display
 */
function formatValue(value: number): string {
  if (value === 1) return '1';
  if (value > 1) return value.toFixed(2);
  return `1/${(1/value).toFixed(2)}`;
}

/**
 * Check if a pairwise judgment needs attention
 */
export function isPairwiseJudgmentSuspicious(
  value: number,
  indirectPaths: number[],
  threshold: number = 2.0
): boolean {
  if (indirectPaths.length === 0) return false;
  
  const avgIndirect = indirectPaths.reduce((sum, val) => sum + val, 0) / indirectPaths.length;
  const ratio = Math.max(value / avgIndirect, avgIndirect / value);
  
  return ratio > threshold;
}

/**
 * Get consistency improvement suggestions for real-time feedback
 */
export function getRealtimeConsistencyFeedback(
  matrix: number[][],
  elementNames: string[],
  recentlyChanged?: { i: number; j: number; oldValue: number; newValue: number }
): {
  currentCR: number;
  status: 'excellent' | 'good' | 'acceptable' | 'poor';
  message: string;
  impact?: string;
} {
  const cr = calculateMatrixCR(matrix);
  
  let status: 'excellent' | 'good' | 'acceptable' | 'poor';
  let message: string;
  
  if (cr <= 0.05) {
    status = 'excellent';
    message = '훌륭합니다! 매우 일관성 있는 판단입니다.';
  } else if (cr <= 0.08) {
    status = 'good';
    message = '좋습니다! 일관성이 양호합니다.';
  } else if (cr <= 0.10) {
    status = 'acceptable';
    message = '허용 가능한 수준입니다. 약간의 개선이 가능합니다.';
  } else {
    status = 'poor';
    message = '일관성이 부족합니다. 일부 판단을 재검토해주세요.';
  }

  let impact: string | undefined;
  if (recentlyChanged) {
    const { i, j, oldValue, newValue } = recentlyChanged;
    const changeDirection = newValue > oldValue ? '증가' : '감소';
    impact = `"${elementNames[i]}" vs "${elementNames[j]}" 변경으로 일관성이 ${changeDirection}했습니다.`;
  }

  return {
    currentCR: cr,
    status,
    message,
    impact
  };
}