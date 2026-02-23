/**
 * Robustness Analysis for AHP
 * Composite metric combining:
 * 1. Sensitivity Stability (tornado chart)
 * 2. Monte Carlo Stability (rank probability)
 * 3. Group Consensus (Shannon entropy)
 * 4. Consistency Quality (CR values)
 */
import type { TornadoResult } from './advancedSensitivity';
import type { MonteCarloResult } from './advancedMonteCarlo';
import type { ShannonConsensusResult } from './groupConsensus';

export interface RobustnessComponentScores {
  sensitivityStability: number;   // 0–1
  monteCarloStability: number;    // 0–1
  groupConsensus: number;         // 0–1
  consistencyQuality: number;     // 0–1
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RobustnessResult {
  overallScore: number;           // 0–1
  components: RobustnessComponentScores;
  riskLevel: RiskLevel;
  recommendations: string[];
  componentWeights: {
    sensitivity: number;
    monteCarlo: number;
    consensus: number;
    consistency: number;
  };
}

export interface RobustnessConfig {
  weights?: {
    sensitivity: number;
    monteCarlo: number;
    consensus: number;
    consistency: number;
  };
  crThreshold?: number; // CR considered excellent, default 0.05
}

const DEFAULT_WEIGHTS = {
  sensitivity: 0.3,
  monteCarlo: 0.3,
  consensus: 0.2,
  consistency: 0.2,
};

/**
 * Calculate sensitivity stability from tornado chart results.
 * = (number of criteria without rank reversal) / (total criteria)
 */
function calcSensitivityStability(tornado: TornadoResult | null): number {
  if (!tornado || tornado.entries.length === 0) return 0.5; // neutral if unavailable
  const nonReversed = tornado.entries.filter(e => !e.hasRankReversal).length;
  return nonReversed / tornado.entries.length;
}

/**
 * Calculate Monte Carlo stability.
 * = probability that the dominant alternative stays at rank 1
 */
function calcMonteCarloStability(mc: MonteCarloResult | null): number {
  if (!mc) return 0.5; // neutral if unavailable
  return mc.dominantProbability;
}

/**
 * Calculate group consensus score from Shannon entropy result.
 */
function calcGroupConsensus(shannon: ShannonConsensusResult | null): number {
  if (!shannon) return 0.5; // neutral if unavailable
  return shannon.overallConsensus;
}

/**
 * Calculate consistency quality.
 * = fraction of evaluators with CR < crThreshold
 */
function calcConsistencyQuality(crValues: number[], crThreshold: number): number {
  if (crValues.length === 0) return 0.5;
  const excellent = crValues.filter(cr => cr < crThreshold).length;
  return excellent / crValues.length;
}

/**
 * Generate risk-specific recommendations.
 */
function generateRecommendations(components: RobustnessComponentScores): string[] {
  const recs: string[] = [];

  if (components.sensitivityStability < 0.5) {
    recs.push('Sensitivity analysis shows rank reversals in multiple criteria. Consider re-evaluating criteria weights with stakeholders.');
  }
  if (components.monteCarloStability < 0.5) {
    recs.push('Monte Carlo simulation shows low ranking stability. The top alternative may not be robust under uncertainty.');
  }
  if (components.groupConsensus < 0.5) {
    recs.push('Low group consensus detected. Consider facilitating discussion among evaluators to reduce disagreement.');
  }
  if (components.consistencyQuality < 0.5) {
    recs.push('Several evaluators have high consistency ratios (CR > 0.1). Their pairwise comparisons may need revision.');
  }

  if (recs.length === 0) {
    recs.push('Overall analysis is robust. The decision recommendation can be considered reliable.');
  }

  return recs;
}

/**
 * Perform comprehensive robustness analysis.
 *
 * @param tornado - Tornado chart result (or null if not available)
 * @param monteCarlo - Monte Carlo simulation result (or null if not available)
 * @param shannonConsensus - Shannon consensus result (or null if not available)
 * @param crValues - Array of CR values from all evaluators
 * @param config - Configuration options
 */
export function performRobustnessAnalysis(
  tornado: TornadoResult | null,
  monteCarlo: MonteCarloResult | null,
  shannonConsensus: ShannonConsensusResult | null,
  crValues: number[],
  config: RobustnessConfig = {}
): RobustnessResult {
  const weights = config.weights || DEFAULT_WEIGHTS;
  const crThreshold = config.crThreshold || 0.05;

  const components: RobustnessComponentScores = {
    sensitivityStability: calcSensitivityStability(tornado),
    monteCarloStability: calcMonteCarloStability(monteCarlo),
    groupConsensus: calcGroupConsensus(shannonConsensus),
    consistencyQuality: calcConsistencyQuality(crValues, crThreshold),
  };

  const overallScore =
    weights.sensitivity * components.sensitivityStability +
    weights.monteCarlo * components.monteCarloStability +
    weights.consensus * components.groupConsensus +
    weights.consistency * components.consistencyQuality;

  let riskLevel: RiskLevel;
  if (overallScore >= 0.7) riskLevel = 'low';
  else if (overallScore >= 0.4) riskLevel = 'medium';
  else riskLevel = 'high';

  const recommendations = generateRecommendations(components);

  return {
    overallScore,
    components,
    riskLevel,
    recommendations,
    componentWeights: weights,
  };
}
