/**
 * Group Consensus Analysis for AHP
 * - AIJ (Aggregation of Individual Judgments)
 * - AIP (Aggregation of Individual Priorities)
 * - Fuzzy Group Consensus
 * - Shannon Entropy-based Consensus
 */
import {
  calculateAHP,
  aggregateMatricesGeometric,
  aggregateMatricesWeighted,
  type AHPResult,
} from './ahpCalculator';

// --- Interfaces ---

export interface EvaluatorInput {
  id: string;
  name: string;
  matrix: number[][];
  weight?: number; // evaluator importance (default: equal)
}

export interface AIJResult {
  consensusMatrix: number[][];
  consensusWeights: number[];
  consensusCR: number;
  isConsistent: boolean;
  individualResults: Array<{ id: string; weights: number[]; cr: number }>;
}

export interface AIPResult {
  consensusWeights: number[];
  individualWeights: Array<{ id: string; weights: number[] }>;
  weightDispersion: number[]; // per-criterion std dev across evaluators
}

export interface FuzzyConsensusResult {
  fuzzyMatrix: [number, number, number][][]; // Triangular Fuzzy Numbers
  defuzzifiedWeights: number[];
  linguisticLabels: string[];
}

export interface ShannonConsensusResult {
  overallConsensus: number; // 0–1
  criterionConsensus: Record<string, number>; // per-criterion consensus
  evaluatorAgreement: number[][]; // pairwise agreement matrix
  outlierEvaluators: string[]; // evaluators with low agreement
}

// --- Saaty scale to TFN mapping ---

const SAATY_TO_TFN: Record<number, [number, number, number]> = {
  1: [1, 1, 1],
  2: [1, 2, 3],
  3: [2, 3, 4],
  4: [3, 4, 5],
  5: [4, 5, 6],
  6: [5, 6, 7],
  7: [6, 7, 8],
  8: [7, 8, 9],
  9: [8, 9, 9],
};

function toTFN(value: number): [number, number, number] {
  if (value >= 1 && value <= 9) {
    const rounded = Math.round(value);
    return SAATY_TO_TFN[rounded] || [value - 1, value, value + 1];
  }
  // Reciprocal: 1/TFN(v) = [1/c, 1/b, 1/a]
  if (value > 0 && value < 1) {
    const inv = Math.round(1 / value);
    const tfn = SAATY_TO_TFN[inv] || [inv - 1, inv, inv + 1];
    return [1 / tfn[2], 1 / tfn[1], 1 / tfn[0]];
  }
  return [value, value, value];
}

// --- AIJ: Aggregation of Individual Judgments ---

export function calculateAIJ(evaluators: EvaluatorInput[]): AIJResult {
  if (evaluators.length === 0) throw new Error('No evaluators provided');

  const matrices = evaluators.map(e => e.matrix);
  const weights = evaluators.map(e => e.weight || 1);
  const hasCustomWeights = evaluators.some(e => e.weight !== undefined);

  // Aggregate matrices
  const consensusMatrix = hasCustomWeights
    ? aggregateMatricesWeighted(matrices, weights)
    : aggregateMatricesGeometric(matrices);

  // Calculate consensus AHP
  const consensusResult = calculateAHP(consensusMatrix);

  // Individual results
  const individualResults = evaluators.map(e => {
    const result = calculateAHP(e.matrix);
    return { id: e.id, weights: result.priorities, cr: result.consistencyRatio };
  });

  return {
    consensusMatrix,
    consensusWeights: consensusResult.priorities,
    consensusCR: consensusResult.consistencyRatio,
    isConsistent: consensusResult.isConsistent,
    individualResults,
  };
}

// --- AIP: Aggregation of Individual Priorities ---

export function calculateAIP(evaluators: EvaluatorInput[]): AIPResult {
  if (evaluators.length === 0) throw new Error('No evaluators provided');

  const n = evaluators[0].matrix.length;
  const evalWeights = evaluators.map(e => e.weight || 1);
  const totalWeight = evalWeights.reduce((s, w) => s + w, 0);
  const normalizedWeights = evalWeights.map(w => w / totalWeight);

  // Calculate individual priorities
  const individualWeights = evaluators.map(e => {
    const result = calculateAHP(e.matrix);
    return { id: e.id, weights: result.priorities };
  });

  // Weighted geometric mean of individual priorities
  const consensusWeights: number[] = [];
  for (let i = 0; i < n; i++) {
    let product = 1;
    for (let k = 0; k < evaluators.length; k++) {
      product *= Math.pow(individualWeights[k].weights[i], normalizedWeights[k]);
    }
    consensusWeights.push(product);
  }

  // Normalize
  const sum = consensusWeights.reduce((s, v) => s + v, 0);
  for (let i = 0; i < n; i++) consensusWeights[i] /= sum;

  // Compute weight dispersion (std dev per criterion)
  const weightDispersion: number[] = [];
  for (let i = 0; i < n; i++) {
    const values = individualWeights.map(iw => iw.weights[i]);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    weightDispersion.push(Math.sqrt(variance));
  }

  return { consensusWeights, individualWeights, weightDispersion };
}

// --- Fuzzy Group Consensus ---

export function calculateFuzzyConsensus(evaluators: EvaluatorInput[]): FuzzyConsensusResult {
  if (evaluators.length === 0) throw new Error('No evaluators provided');

  const n = evaluators[0].matrix.length;

  // Convert each matrix to TFN and aggregate via geometric mean of TFN components
  const fuzzyMatrix: [number, number, number][][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, (): [number, number, number] => [1, 1, 1])
  );

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      let prodL = 1, prodM = 1, prodU = 1;
      for (const e of evaluators) {
        const tfn = toTFN(e.matrix[i][j]);
        prodL *= tfn[0];
        prodM *= tfn[1];
        prodU *= tfn[2];
      }
      const k = evaluators.length;
      fuzzyMatrix[i][j] = [
        Math.pow(prodL, 1 / k),
        Math.pow(prodM, 1 / k),
        Math.pow(prodU, 1 / k),
      ];
    }
  }

  // Fuzzy geometric mean per row
  const fuzzyRowMeans: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    let prodL = 1, prodM = 1, prodU = 1;
    for (let j = 0; j < n; j++) {
      prodL *= fuzzyMatrix[i][j][0];
      prodM *= fuzzyMatrix[i][j][1];
      prodU *= fuzzyMatrix[i][j][2];
    }
    fuzzyRowMeans.push([
      Math.pow(prodL, 1 / n),
      Math.pow(prodM, 1 / n),
      Math.pow(prodU, 1 / n),
    ]);
  }

  // Defuzzify using centroid method: (l + m + u) / 3
  const defuzzified = fuzzyRowMeans.map(([l, m, u]) => (l + m + u) / 3);

  // Normalize
  const total = defuzzified.reduce((s, v) => s + v, 0);
  const defuzzifiedWeights = defuzzified.map(v => v / total);

  // Linguistic labels based on defuzzified weights
  const linguisticLabels = defuzzifiedWeights.map(w => {
    if (w >= 0.3) return 'Very High';
    if (w >= 0.2) return 'High';
    if (w >= 0.1) return 'Medium';
    if (w >= 0.05) return 'Low';
    return 'Very Low';
  });

  return { fuzzyMatrix, defuzzifiedWeights, linguisticLabels };
}

// --- Shannon Entropy-based Consensus ---

export function calculateShannonConsensus(
  evaluators: EvaluatorInput[],
  criteriaIds: string[]
): ShannonConsensusResult {
  if (evaluators.length === 0) throw new Error('No evaluators provided');

  const n = criteriaIds.length;
  const k = evaluators.length;

  // Calculate individual priorities
  const individualWeights = evaluators.map(e => calculateAHP(e.matrix).priorities);

  // Per-criterion consensus via Shannon entropy
  const criterionConsensus: Record<string, number> = {};
  const hMax = Math.log(k); // maximum entropy

  for (let i = 0; i < n; i++) {
    const weights = individualWeights.map(w => w[i]);
    const total = weights.reduce((s, v) => s + v, 0);
    if (total <= 0 || hMax <= 0) {
      criterionConsensus[criteriaIds[i]] = 1;
      continue;
    }
    const probs = weights.map(w => w / total);
    let entropy = 0;
    for (const p of probs) {
      if (p > 0) entropy -= p * Math.log(p);
    }
    criterionConsensus[criteriaIds[i]] = 1 - (entropy / hMax);
  }

  // Overall consensus: average of criterion-level
  const overallConsensus =
    Object.values(criterionConsensus).reduce((s, v) => s + v, 0) / n;

  // Pairwise evaluator agreement
  const evaluatorAgreement: number[][] = Array.from({ length: k }, () => Array(k).fill(1));
  for (let a = 0; a < k; a++) {
    for (let b = a + 1; b < k; b++) {
      // Cosine similarity of weight vectors
      let dot = 0, magA = 0, magB = 0;
      for (let i = 0; i < n; i++) {
        dot += individualWeights[a][i] * individualWeights[b][i];
        magA += individualWeights[a][i] ** 2;
        magB += individualWeights[b][i] ** 2;
      }
      const similarity = (magA > 0 && magB > 0)
        ? dot / (Math.sqrt(magA) * Math.sqrt(magB))
        : 0;
      evaluatorAgreement[a][b] = similarity;
      evaluatorAgreement[b][a] = similarity;
    }
  }

  // Detect outliers: evaluators with average agreement < 0.7
  const outlierEvaluators: string[] = [];
  for (let a = 0; a < k; a++) {
    const avgAgreement = evaluatorAgreement[a].reduce((s, v) => s + v, 0) / k;
    if (avgAgreement < 0.7) {
      outlierEvaluators.push(evaluators[a].id);
    }
  }

  return { overallConsensus, criterionConsensus, evaluatorAgreement, outlierEvaluators };
}
