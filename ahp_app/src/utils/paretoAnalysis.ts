/**
 * Pareto Analysis for AHP
 * - Dominance relationship detection
 * - Pareto frontier identification
 * - Multi-level Pareto ranking
 */

export interface ParetoAlternative {
  id: string;
  name: string;
  scores: Record<string, number>; // criterionId → score
  paretoRank: number;             // 1 = non-dominated frontier
  dominatedBy: string[];          // IDs of alternatives that dominate this one
  dominates: string[];            // IDs of alternatives this one dominates
}

export interface ParetoResult {
  alternatives: ParetoAlternative[];
  paretoFrontierIds: string[];       // rank-1 alternative IDs
  dominanceMatrix: boolean[][];      // [i][j] = true if alt i dominates alt j
  numRanks: number;
}

/**
 * Check if alternative A dominates alternative B.
 * A dominates B if A >= B on all criteria AND A > B on at least one.
 * Assumes all criteria are to be maximized.
 *
 * @param scoresA - Scores for alternative A
 * @param scoresB - Scores for alternative B
 * @param criteriaIds - Ordered criteria IDs
 * @param minimize - Set of criteria IDs to minimize (default: all maximize)
 */
function dominates(
  scoresA: Record<string, number>,
  scoresB: Record<string, number>,
  criteriaIds: string[],
  minimize: Set<string> = new Set()
): boolean {
  let atLeastOneBetter = false;

  for (const crit of criteriaIds) {
    const a = scoresA[crit] ?? 0;
    const b = scoresB[crit] ?? 0;

    if (minimize.has(crit)) {
      // For minimization: A dominates if a <= b on all, a < b on some
      if (a > b) return false;
      if (a < b) atLeastOneBetter = true;
    } else {
      // For maximization: A dominates if a >= b on all, a > b on some
      if (a < b) return false;
      if (a > b) atLeastOneBetter = true;
    }
  }

  return atLeastOneBetter;
}

/**
 * Perform Pareto analysis: identify dominance relationships and Pareto frontier.
 *
 * @param alternatives - Array of { id, name }
 * @param scores - Per-alternative scores { altId: { criterionId: score } }
 * @param criteriaIds - Ordered criteria IDs to consider
 * @param minimizeCriteria - Criteria IDs to minimize (default: empty = all maximize)
 */
export function performParetoAnalysis(
  alternatives: Array<{ id: string; name: string }>,
  scores: Record<string, Record<string, number>>,
  criteriaIds: string[],
  minimizeCriteria: string[] = []
): ParetoResult {
  const n = alternatives.length;
  const minimize = new Set(minimizeCriteria);

  // Build dominance matrix
  const dominanceMatrix: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  const altScores = alternatives.map(a => scores[a.id] || {});

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        dominanceMatrix[i][j] = dominates(altScores[i], altScores[j], criteriaIds, minimize);
      }
    }
  }

  // Assign Pareto ranks
  const paretoAlts: ParetoAlternative[] = alternatives.map((a, i) => ({
    id: a.id,
    name: a.name,
    scores: altScores[i],
    paretoRank: 0,
    dominatedBy: [],
    dominates: [],
  }));

  // Fill dominatedBy / dominates
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (dominanceMatrix[i][j]) {
        paretoAlts[i].dominates.push(alternatives[j].id);
        paretoAlts[j].dominatedBy.push(alternatives[i].id);
      }
    }
  }

  // Multi-level Pareto ranking
  let remaining = alternatives.map((_, i) => i);
  let currentRank = 1;

  while (remaining.length > 0) {
    // Find non-dominated among remaining
    const frontier: number[] = [];
    for (const i of remaining) {
      let isDominated = false;
      for (const j of remaining) {
        if (i !== j && dominanceMatrix[j][i]) {
          isDominated = true;
          break;
        }
      }
      if (!isDominated) frontier.push(i);
    }

    if (frontier.length === 0) {
      // Shouldn't happen, but assign remaining to current rank
      for (const i of remaining) {
        paretoAlts[i].paretoRank = currentRank;
      }
      break;
    }

    const frontierSet = new Set(frontier);
    for (const i of frontier) {
      paretoAlts[i].paretoRank = currentRank;
    }
    remaining = remaining.filter(i => !frontierSet.has(i));
    currentRank++;
  }

  const paretoFrontierIds = paretoAlts
    .filter(a => a.paretoRank === 1)
    .map(a => a.id);

  return {
    alternatives: paretoAlts,
    paretoFrontierIds,
    dominanceMatrix,
    numRanks: currentRank - 1,
  };
}
