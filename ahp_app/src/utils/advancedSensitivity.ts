/**
 * Advanced Sensitivity Analysis for AHP
 * - Tornado chart data generation (impact range per criterion)
 * - Rank reversal point detection via bisection search
 * - One-at-a-time weight variation with proportional redistribution
 */

export interface TornadoEntry {
  criterionId: string;
  criterionName: string;
  baseWeight: number;
  lowScore: number;    // final score of top alt when criterion weight is at minimum
  highScore: number;   // final score of top alt when criterion weight is at maximum
  impactRange: number; // |highScore - lowScore|
  hasRankReversal: boolean;
  reversalPoints: number[]; // weight values where rank reversal occurs
}

export interface TornadoResult {
  topAlternativeId: string;
  topAlternativeName: string;
  baseScore: number;
  entries: TornadoEntry[]; // sorted by impactRange descending
  mostSensitiveCriterion: string;
  leastSensitiveCriterion: string;
}

export interface SensitivityConfig {
  variationRange: number; // 0.0–1.0, default 0.5 (±50%)
  bisectionTolerance: number; // precision for reversal points, default 0.001
  maxBisectionSteps: number; // default 50
}

const DEFAULT_CONFIG: SensitivityConfig = {
  variationRange: 0.5,
  bisectionTolerance: 0.001,
  maxBisectionSteps: 50,
};

/**
 * Adjust criteria weights: set one criterion to targetWeight,
 * redistribute rest proportionally to maintain sum = 1.
 */
function adjustWeights(
  baseWeights: Record<string, number>,
  targetCriterion: string,
  targetWeight: number
): Record<string, number> {
  const result: Record<string, number> = { ...baseWeights };
  const oldWeight = result[targetCriterion];
  result[targetCriterion] = targetWeight;

  const otherSum = Object.entries(result)
    .filter(([id]) => id !== targetCriterion)
    .reduce((s, [, w]) => s + w, 0);

  const remaining = 1 - targetWeight;
  if (otherSum > 0 && remaining > 0) {
    for (const id of Object.keys(result)) {
      if (id !== targetCriterion) {
        result[id] = (result[id] / otherSum) * remaining;
      }
    }
  }
  return result;
}

/**
 * Calculate final score for a specific alternative given weights and scores.
 */
function calcScore(
  altId: string,
  weights: Record<string, number>,
  altScores: Record<string, Record<string, number>>
): number {
  let score = 0;
  for (const [critId, weight] of Object.entries(weights)) {
    score += weight * (altScores[critId]?.[altId] || 0);
  }
  return score;
}

/**
 * Get ranking (alt IDs sorted by score descending).
 */
function getRanking(
  altIds: string[],
  weights: Record<string, number>,
  altScores: Record<string, Record<string, number>>
): string[] {
  return [...altIds].sort(
    (a, b) => calcScore(b, weights, altScores) - calcScore(a, weights, altScores)
  );
}

/**
 * Find rank reversal points via bisection search between two weight values.
 */
function findReversalPoints(
  criterionId: string,
  baseWeights: Record<string, number>,
  altIds: string[],
  altScores: Record<string, Record<string, number>>,
  wLow: number,
  wHigh: number,
  cfg: SensitivityConfig
): number[] {
  const points: number[] = [];
  const steps = 100; // scan resolution
  const stepSize = (wHigh - wLow) / steps;

  let prevRanking = getRanking(altIds, adjustWeights(baseWeights, criterionId, wLow), altScores);

  for (let i = 1; i <= steps; i++) {
    const w = wLow + i * stepSize;
    const ranking = getRanking(altIds, adjustWeights(baseWeights, criterionId, w), altScores);

    if (ranking[0] !== prevRanking[0]) {
      // Bisection to find exact reversal point
      let lo = w - stepSize;
      let hi = w;
      for (let b = 0; b < cfg.maxBisectionSteps; b++) {
        const mid = (lo + hi) / 2;
        const midRanking = getRanking(altIds, adjustWeights(baseWeights, criterionId, mid), altScores);
        if (midRanking[0] === prevRanking[0]) {
          lo = mid;
        } else {
          hi = mid;
        }
        if (hi - lo < cfg.bisectionTolerance) break;
      }
      points.push(Math.round(((lo + hi) / 2) * 10000) / 10000);
    }
    prevRanking = ranking;
  }

  return points;
}

/**
 * Generate tornado chart data for sensitivity analysis.
 *
 * @param criteriaWeights - Base criteria weights { criterionId: weight }
 * @param alternativeScores - Per-criterion alternative weights { criterionId: { altId: weight } }
 * @param alternativeIds - Array of alternative IDs
 * @param criteriaNames - Map of criterionId → display name
 * @param config - Sensitivity configuration
 */
export function generateTornadoChart(
  criteriaWeights: Record<string, number>,
  alternativeScores: Record<string, Record<string, number>>,
  alternativeIds: string[],
  criteriaNames: Record<string, string>,
  config: Partial<SensitivityConfig> = {}
): TornadoResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Determine base ranking
  const baseRanking = getRanking(alternativeIds, criteriaWeights, alternativeScores);
  const topAltId = baseRanking[0];
  const baseScore = calcScore(topAltId, criteriaWeights, alternativeScores);

  const entries: TornadoEntry[] = [];

  for (const criterionId of Object.keys(criteriaWeights)) {
    const baseWeight = criteriaWeights[criterionId];
    const wLow = Math.max(0.01, baseWeight * (1 - cfg.variationRange));
    const wHigh = Math.min(0.99, baseWeight * (1 + cfg.variationRange));

    const weightsLow = adjustWeights(criteriaWeights, criterionId, wLow);
    const weightsHigh = adjustWeights(criteriaWeights, criterionId, wHigh);

    const lowScore = calcScore(topAltId, weightsLow, alternativeScores);
    const highScore = calcScore(topAltId, weightsHigh, alternativeScores);
    const impactRange = Math.abs(highScore - lowScore);

    const reversalPoints = findReversalPoints(
      criterionId, criteriaWeights, alternativeIds, alternativeScores,
      wLow, wHigh, cfg
    );

    entries.push({
      criterionId,
      criterionName: criteriaNames[criterionId] || criterionId,
      baseWeight,
      lowScore,
      highScore,
      impactRange,
      hasRankReversal: reversalPoints.length > 0,
      reversalPoints,
    });
  }

  // Sort by impact (descending)
  entries.sort((a, b) => b.impactRange - a.impactRange);

  return {
    topAlternativeId: topAltId,
    topAlternativeName: topAltId,
    baseScore,
    entries,
    mostSensitiveCriterion: entries[0]?.criterionId || '',
    leastSensitiveCriterion: entries[entries.length - 1]?.criterionId || '',
  };
}
