/**
 * Advanced Monte Carlo Simulation for AHP
 * - Multiple distribution types (uniform, normal, triangular, beta)
 * - Adaptive convergence detection
 * - Comparison matrix perturbation in log-scale
 * - CR validation per iteration
 */
import { calculateAHP, calculateHierarchicalAHP } from './ahpCalculator';

export type DistributionType = 'uniform' | 'normal' | 'triangular' | 'beta';

export interface MonteCarloConfig {
  iterations: number;           // 1000–50000
  uncertaintyLevel: number;     // 0.05–0.30
  distribution: DistributionType;
  convergenceTolerance: number; // e.g. 0.001
  crThreshold: number;          // default 0.1
  seed?: number;
}

export interface AlternativeStats {
  mean: number;
  stdDev: number;
  ci95: [number, number];
  rankProbabilities: Record<number, number>; // rank → probability
  meanRank: number;
}

export interface CriterionStats {
  mean: number;
  stdDev: number;
  variationCoefficient: number;
}

export interface MonteCarloResult {
  alternatives: Record<string, AlternativeStats>;
  criteria: Record<string, CriterionStats>;
  convergence: {
    converged: boolean;
    actualIterations: number;
    finalTolerance: number;
  };
  dominantAlternative: string;
  dominantProbability: number;
  rankStability: number; // 0–1, fraction of iterations where rank-1 didn't change
}

const DEFAULT_CONFIG: MonteCarloConfig = {
  iterations: 10000,
  uncertaintyLevel: 0.15,
  distribution: 'normal',
  convergenceTolerance: 0.001,
  crThreshold: 0.1,
};

// --- Distribution samplers ---

function sampleUniform(center: number, spread: number): number {
  return center + (Math.random() - 0.5) * 2 * spread;
}

function sampleNormal(mean: number, stdDev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z;
}

function sampleTriangular(center: number, spread: number): number {
  const a = center - spread;
  const b = center + spread;
  const u = Math.random();
  if (u < 0.5) {
    return a + Math.sqrt(u * (b - a) * (center - a));
  }
  return b - Math.sqrt((1 - u) * (b - a) * (b - center));
}

function sampleBeta(center: number, spread: number): number {
  // Simplified beta via Jöhnk's algorithm approximation
  // Map to [center-spread, center+spread]
  const alpha = 2;
  const beta = 2;
  let x: number, y: number;
  do {
    x = Math.pow(Math.random(), 1 / alpha);
    y = Math.pow(Math.random(), 1 / beta);
  } while (x + y > 1);
  const sample = x / (x + y);
  return center - spread + sample * 2 * spread;
}

function sampleNoise(center: number, spread: number, dist: DistributionType): number {
  switch (dist) {
    case 'uniform': return sampleUniform(center, spread);
    case 'normal': return sampleNormal(center, spread * 0.5); // spread as ~2σ
    case 'triangular': return sampleTriangular(center, spread);
    case 'beta': return sampleBeta(center, spread);
  }
}

/**
 * Perturb a comparison matrix in log-space to maintain reciprocal consistency.
 * Values stay within Saaty's 1/9–9 scale.
 */
function perturbMatrix(matrix: number[][], uncertainty: number, dist: DistributionType): number[][] {
  const n = matrix.length;
  const perturbed: number[][] = Array.from({ length: n }, () => Array(n).fill(1));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const logVal = Math.log(matrix[i][j]);
      const noisyLog = sampleNoise(logVal, uncertainty, dist);
      let value = Math.exp(noisyLog);
      // Clamp to Saaty scale
      value = Math.max(1 / 9, Math.min(9, value));
      perturbed[i][j] = value;
      perturbed[j][i] = 1 / value;
    }
  }
  return perturbed;
}

/**
 * Perturb alternative scores (direct weights) with noise.
 */
function perturbScores(
  scores: Record<string, Record<string, number>>,
  uncertainty: number,
  dist: DistributionType
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  for (const critId of Object.keys(scores)) {
    result[critId] = {};
    for (const altId of Object.keys(scores[critId])) {
      const base = scores[critId][altId];
      const noisy = sampleNoise(base, base * uncertainty, dist);
      result[critId][altId] = Math.max(0.001, noisy);
    }
    // Re-normalize per criterion
    const total = Object.values(result[critId]).reduce((s, v) => s + v, 0);
    if (total > 0) {
      for (const altId of Object.keys(result[critId])) {
        result[critId][altId] /= total;
      }
    }
  }
  return result;
}

/**
 * Run advanced Monte Carlo simulation.
 *
 * @param criteriaMatrix - Pairwise comparison matrix for criteria
 * @param alternativeScores - Per-criterion alternative weights { criterionId: { altId: weight } }
 * @param alternativeIds - Ordered alternative IDs
 * @param criteriaIds - Ordered criteria IDs
 * @param config - Simulation configuration
 */
export function runAdvancedMonteCarlo(
  criteriaMatrix: number[][],
  alternativeScores: Record<string, Record<string, number>>,
  alternativeIds: string[],
  criteriaIds: string[],
  config: Partial<MonteCarloConfig> = {}
): MonteCarloResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const numAlts = alternativeIds.length;

  // Accumulators
  const altScoresList: Record<string, number[]> = {};
  const altRankCounts: Record<string, Record<number, number>> = {};
  const critWeightsList: Record<string, number[]> = {};

  for (const altId of alternativeIds) {
    altScoresList[altId] = [];
    altRankCounts[altId] = {};
    for (let r = 1; r <= numAlts; r++) altRankCounts[altId][r] = 0;
  }
  for (const critId of criteriaIds) {
    critWeightsList[critId] = [];
  }

  let validIterations = 0;
  let converged = false;
  let finalTolerance = 1;
  let prevMeans: Record<string, number> = {};

  for (let iter = 0; iter < cfg.iterations; iter++) {
    // 1. Perturb criteria matrix
    const noisyCritMatrix = perturbMatrix(criteriaMatrix, cfg.uncertaintyLevel, cfg.distribution);
    const critResult = calculateAHP(noisyCritMatrix);

    // 2. Skip if inconsistent
    if (critResult.consistencyRatio > cfg.crThreshold) continue;

    // 3. Build criteria weights map
    const critWeights: Record<string, number> = {};
    criteriaIds.forEach((id, idx) => {
      critWeights[id] = critResult.priorities[idx];
      critWeightsList[id].push(critResult.priorities[idx]);
    });

    // 4. Perturb alternative scores
    const noisyAltScores = perturbScores(alternativeScores, cfg.uncertaintyLevel, cfg.distribution);

    // 5. Calculate final scores
    const finalScores: Record<string, number> = {};
    for (const altId of alternativeIds) {
      let score = 0;
      for (const critId of criteriaIds) {
        score += (critWeights[critId] || 0) * (noisyAltScores[critId]?.[altId] || 0);
      }
      finalScores[altId] = score;
      altScoresList[altId].push(score);
    }

    // 6. Record ranks
    const sorted = alternativeIds
      .map(id => ({ id, score: finalScores[id] }))
      .sort((a, b) => b.score - a.score);
    sorted.forEach((item, rank) => {
      altRankCounts[item.id][rank + 1]++;
    });

    validIterations++;

    // 7. Convergence check every 500 valid iterations
    if (validIterations % 500 === 0 && validIterations >= 1000) {
      const currentMeans: Record<string, number> = {};
      let maxDelta = 0;
      for (const altId of alternativeIds) {
        const scores = altScoresList[altId];
        const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
        currentMeans[altId] = mean;
        if (prevMeans[altId] !== undefined) {
          maxDelta = Math.max(maxDelta, Math.abs(mean - prevMeans[altId]));
        }
      }
      prevMeans = currentMeans;
      finalTolerance = maxDelta;
      if (maxDelta < cfg.convergenceTolerance && validIterations >= 2000) {
        converged = true;
        break;
      }
    }
  }

  // Compute statistics
  const alternatives: Record<string, AlternativeStats> = {};
  for (const altId of alternativeIds) {
    const scores = altScoresList[altId];
    if (scores.length === 0) {
      alternatives[altId] = { mean: 0, stdDev: 0, ci95: [0, 0], rankProbabilities: {}, meanRank: numAlts };
      continue;
    }
    const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
    const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    const sorted = [...scores].sort((a, b) => a - b);
    const ci95Lower = sorted[Math.floor(0.025 * sorted.length)] ?? 0;
    const ci95Upper = sorted[Math.floor(0.975 * sorted.length)] ?? 0;

    const rankProbs: Record<number, number> = {};
    let meanRank = 0;
    for (let r = 1; r <= numAlts; r++) {
      rankProbs[r] = validIterations > 0 ? altRankCounts[altId][r] / validIterations : 0;
      meanRank += r * rankProbs[r];
    }

    alternatives[altId] = { mean, stdDev, ci95: [ci95Lower, ci95Upper], rankProbabilities: rankProbs, meanRank };
  }

  const criteria: Record<string, CriterionStats> = {};
  for (const critId of criteriaIds) {
    const weights = critWeightsList[critId];
    if (weights.length === 0) {
      criteria[critId] = { mean: 0, stdDev: 0, variationCoefficient: 0 };
      continue;
    }
    const mean = weights.reduce((s, v) => s + v, 0) / weights.length;
    const variance = weights.reduce((s, v) => s + (v - mean) ** 2, 0) / weights.length;
    const stdDev = Math.sqrt(variance);
    criteria[critId] = { mean, stdDev, variationCoefficient: mean > 0 ? stdDev / mean : 0 };
  }

  // Dominant alternative
  let dominantAlt = alternativeIds[0];
  let dominantProb = 0;
  for (const altId of alternativeIds) {
    const prob = alternatives[altId].rankProbabilities[1] || 0;
    if (prob > dominantProb) {
      dominantProb = prob;
      dominantAlt = altId;
    }
  }

  // Rank stability: how often did the same alt stay #1?
  const rankStability = dominantProb;

  return {
    alternatives,
    criteria,
    convergence: { converged, actualIterations: validIterations, finalTolerance },
    dominantAlternative: dominantAlt,
    dominantProbability: dominantProb,
    rankStability,
  };
}
