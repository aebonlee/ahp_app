// AHP Calculator utilities for hierarchical analysis
export interface AHPResult {
  priorities: number[];
  consistencyRatio: number;
  lambdaMax: number;
  isConsistent: boolean;
  eigenVector: number[];
}

export interface HierarchicalAHPInput {
  criteriaWeights: { [key: string]: number };
  alternativeScores: { [criterionId: string]: { [alternativeId: string]: number } };
  alternatives: Array<{ id: string; name: string }>;
}

export interface ComparisonInput {
  element1_id: string;
  element2_id: string;
  value: number;
  i?: number;
  j?: number;
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
 * Build comparison matrix from elements and comparisons
 */
export function buildComparisonMatrix(
  elements: Array<{ id: string; name: string }>,
  comparisons: ComparisonInput[]
): number[][] {
  const n = elements.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(1));

  // Create element ID to index mapping
  const elementIndex: { [key: string]: number } = {};
  elements.forEach((element, index) => {
    elementIndex[element.id] = index;
  });

  // Fill matrix with comparison values
  comparisons.forEach(comp => {
    const i = elementIndex[comp.element1_id];
    const j = elementIndex[comp.element2_id];
    
    if (i !== undefined && j !== undefined) {
      matrix[i][j] = comp.value;
      matrix[j][i] = 1 / comp.value; // Reciprocal
    }
  });

  return matrix;
}

/**
 * Calculate eigenvector using geometric mean method
 */
export function calculateEigenVector(matrix: number[][]): number[] {
  const n = matrix.length;
  const eigenVector: number[] = new Array(n);

  for (let i = 0; i < n; i++) {
    let product = 1;
    for (let j = 0; j < n; j++) {
      product *= matrix[i][j];
    }
    eigenVector[i] = Math.pow(product, 1 / n);
  }

  // Normalize
  const sum = eigenVector.reduce((acc, val) => acc + val, 0);
  return eigenVector.map(val => val / sum);
}

/**
 * Calculate eigenvector using Power Method (more accurate)
 */
export function calculateEigenVectorPowerMethod(matrix: number[][], tolerance: number = 1e-10, maxIterations: number = 1000): number[] {
  const n = matrix.length;
  let vector = new Array(n).fill(1 / n); // Initial uniform vector
  
  for (let iter = 0; iter < maxIterations; iter++) {
    const prevVector = [...vector];
    
    // Matrix multiplication: matrix * vector
    const newVector = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        newVector[i] += matrix[i][j] * vector[j];
      }
    }
    
    // Normalize
    const sum = newVector.reduce((acc, val) => acc + val, 0);
    vector = newVector.map(val => val / sum);
    
    // Check convergence
    const diff = vector.reduce((acc, val, i) => acc + Math.abs(val - prevVector[i]), 0);
    if (diff < tolerance) {
      break;
    }
  }
  
  return vector;
}

/**
 * Calculate lambda max (principal eigenvalue)
 */
export function calculateLambdaMax(matrix: number[][], eigenVector: number[]): number {
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
 * Calculate consistency ratio (CR)
 */
export function calculateConsistencyRatio(lambdaMax: number, n: number): number {
  if (n <= 2) return 0; // No inconsistency possible for n <= 2
  
  const CI = (lambdaMax - n) / (n - 1); // Consistency Index
  const RI = RANDOM_INDEX[n] || 1.59; // Random Index
  
  return CI / RI;
}

/**
 * Main AHP calculation function
 */
export function calculateAHP(matrix: number[][]): AHPResult {
  const eigenVector = calculateEigenVector(matrix);
  const lambdaMax = calculateLambdaMax(matrix, eigenVector);
  const consistencyRatio = calculateConsistencyRatio(lambdaMax, matrix.length);
  const isConsistent = consistencyRatio <= 0.1;

  return {
    priorities: eigenVector,
    consistencyRatio,
    lambdaMax,
    isConsistent,
    eigenVector
  };
}

/**
 * Calculate hierarchical AHP with multiple criteria and alternatives
 */
export function calculateHierarchicalAHP(input: HierarchicalAHPInput) {
  const { criteriaWeights, alternativeScores, alternatives } = input;

  // Calculate final scores for each alternative
  const finalScores: { [alternativeId: string]: number } = {};
  
  alternatives.forEach(alternative => {
    let totalScore = 0;
    
    Object.entries(criteriaWeights).forEach(([criterionId, weight]) => {
      const alternativeScore = alternativeScores[criterionId]?.[alternative.id] || 0;
      totalScore += weight * alternativeScore;
    });
    
    finalScores[alternative.id] = totalScore;
  });

  // Create ranking
  const ranking = alternatives
    .map(alternative => ({
      alternativeId: alternative.id,
      alternativeName: alternative.name,
      score: finalScores[alternative.id],
      rank: 0
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));

  return {
    finalScores,
    ranking,
    criteriaWeights,
    alternativeScores
  };
}

/**
 * Get consistency level description
 */
export function getConsistencyLevel(cr: number): string {
  if (cr <= 0.05) return 'Excellent';
  if (cr <= 0.08) return 'Good';
  if (cr <= 0.10) return 'Acceptable';
  return 'Poor';
}

/**
 * Get consistency color for UI
 */
export function getConsistencyColor(cr: number): string {
  if (cr <= 0.05) return 'green';
  if (cr <= 0.08) return 'blue';
  if (cr <= 0.10) return 'yellow';
  return 'red';
}

// Group AHP interfaces and functions
export interface GroupAHPInput {
  matrices: number[][][]; // Multiple comparison matrices from different evaluators
  weights?: number[]; // Optional weights for evaluators (default: equal weights)
  method?: 'geometric' | 'arithmetic' | 'weighted'; // Aggregation method
}

export interface GroupAHPResult extends AHPResult {
  individualResults: AHPResult[];
  consensusIndex: number; // Measure of agreement between evaluators
  aggregationMethod: string;
}

/**
 * Aggregate multiple comparison matrices using geometric mean
 */
export function aggregateMatricesGeometric(matrices: number[][][]): number[][] {
  if (matrices.length === 0) throw new Error('No matrices provided');
  
  const n = matrices[0].length;
  const aggregated: number[][] = Array(n).fill(null).map(() => Array(n).fill(1));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        let product = 1;
        for (const matrix of matrices) {
          product *= matrix[i][j];
        }
        aggregated[i][j] = Math.pow(product, 1 / matrices.length);
      }
    }
  }
  
  return aggregated;
}

/**
 * Aggregate multiple comparison matrices using weighted geometric mean
 */
export function aggregateMatricesWeighted(matrices: number[][][], weights: number[]): number[][] {
  if (matrices.length === 0) throw new Error('No matrices provided');
  if (weights.length !== matrices.length) throw new Error('Weights length must match matrices count');
  
  const n = matrices[0].length;
  const aggregated: number[][] = Array(n).fill(null).map(() => Array(n).fill(1));
  
  // Normalize weights
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map(w => w / weightSum);
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        let weightedProduct = 1;
        for (let k = 0; k < matrices.length; k++) {
          weightedProduct *= Math.pow(matrices[k][i][j], normalizedWeights[k]);
        }
        aggregated[i][j] = weightedProduct;
      }
    }
  }
  
  return aggregated;
}

/**
 * Calculate consensus index for group AHP
 */
export function calculateConsensusIndex(matrices: number[][][], aggregatedMatrix: number[][]): number {
  if (matrices.length <= 1) return 1; // Perfect consensus with single evaluator
  
  const n = matrices[0].length;
  let totalDeviation = 0;
  let totalComparisons = 0;
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const aggregatedValue = aggregatedMatrix[i][j];
      let deviation = 0;
      
      for (const matrix of matrices) {
        const individualValue = matrix[i][j];
        deviation += Math.abs(Math.log(individualValue) - Math.log(aggregatedValue));
      }
      
      totalDeviation += deviation / matrices.length;
      totalComparisons++;
    }
  }
  
  const averageDeviation = totalDeviation / totalComparisons;
  // Convert to consensus index (1 = perfect consensus, 0 = no consensus)
  return Math.exp(-averageDeviation);
}

/**
 * Main Group AHP calculation function
 */
export function calculateGroupAHP(input: GroupAHPInput): GroupAHPResult {
  const { matrices, weights, method = 'geometric' } = input;
  
  if (matrices.length === 0) throw new Error('No matrices provided');
  
  // Calculate individual AHP results
  const individualResults = matrices.map(matrix => calculateAHP(matrix));
  
  // Aggregate matrices
  let aggregatedMatrix: number[][];
  let aggregationMethod: string;
  
  switch (method) {
    case 'weighted':
      if (!weights) throw new Error('Weights required for weighted aggregation');
      aggregatedMatrix = aggregateMatricesWeighted(matrices, weights);
      aggregationMethod = 'Weighted Geometric Mean';
      break;
    case 'arithmetic':
      // Simple arithmetic mean (not recommended for AHP but included for completeness)
      const n = matrices[0].length;
      aggregatedMatrix = Array(n).fill(null).map(() => Array(n).fill(1));
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            let sum = 0;
            for (const matrix of matrices) {
              sum += matrix[i][j];
            }
            aggregatedMatrix[i][j] = sum / matrices.length;
          }
        }
      }
      aggregationMethod = 'Arithmetic Mean';
      break;
    case 'geometric':
    default:
      aggregatedMatrix = aggregateMatricesGeometric(matrices);
      aggregationMethod = 'Geometric Mean';
      break;
  }
  
  // Calculate group result
  const groupResult = calculateAHP(aggregatedMatrix);
  
  // Calculate consensus index
  const consensusIndex = calculateConsensusIndex(matrices, aggregatedMatrix);
  
  return {
    ...groupResult,
    individualResults,
    consensusIndex,
    aggregationMethod
  };
}

/**
 * Enhanced AHP calculation with method selection
 */
export function calculateAHPEnhanced(matrix: number[][], method: 'geometric' | 'power' = 'power'): AHPResult {
  const eigenVector = method === 'power' 
    ? calculateEigenVectorPowerMethod(matrix)
    : calculateEigenVector(matrix);
    
  const lambdaMax = calculateLambdaMax(matrix, eigenVector);
  const consistencyRatio = calculateConsistencyRatio(lambdaMax, matrix.length);
  const isConsistent = consistencyRatio <= 0.1;

  return {
    priorities: eigenVector,
    consistencyRatio,
    lambdaMax,
    isConsistent,
    eigenVector
  };
}