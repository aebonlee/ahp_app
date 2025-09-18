/**
 * AHP Ideal vs Distributive 모드 계산 유틸리티
 * AHP for Paper 분석을 기반으로 구현
 */

export interface AHPCalculationMode {
  mode: 'ideal' | 'distributive';
  description: string;
}

export interface AHPResult {
  alternative: string;
  idealScore: number;
  distributiveScore: number;
  idealRank: number;
  distributiveRank: number;
  normalizedIdealScore: number;
  normalizedDistributiveScore: number;
}

export interface CriterionWeight {
  criterion: string;
  weight: number;
  subcriteria?: CriterionWeight[];
}

export interface AlternativeScore {
  alternative: string;
  criterionScores: { [criterion: string]: number };
}

/**
 * Ideal 모드 계산
 * - 각 기준에서 이상적인 대안과 비교
 * - 절대적 우수성을 측정
 * - 합이 1을 초과할 수 있음
 */
export function calculateIdealMode(
  criteriaWeights: CriterionWeight[],
  alternativeScores: AlternativeScore[]
): AHPResult[] {
  const results: AHPResult[] = [];

  alternativeScores.forEach(alternative => {
    let idealScore = 0;

    criteriaWeights.forEach(criterion => {
      const score = alternative.criterionScores[criterion.criterion] || 0;
      idealScore += criterion.weight * score;
    });

    results.push({
      alternative: alternative.alternative,
      idealScore,
      distributiveScore: 0, // 나중에 계산
      idealRank: 0, // 나중에 계산
      distributiveRank: 0, // 나중에 계산
      normalizedIdealScore: idealScore,
      normalizedDistributiveScore: 0
    });
  });

  // Ideal 모드 순위 계산
  results.sort((a, b) => b.idealScore - a.idealScore);
  results.forEach((result, index) => {
    result.idealRank = index + 1;
  });

  return results;
}

/**
 * Distributive 모드 계산
 * - 각 기준에서 대안들 간의 상대적 비교
 * - 상대적 우위를 측정
 * - 합이 항상 1이 됨
 */
export function calculateDistributiveMode(
  criteriaWeights: CriterionWeight[],
  alternativeScores: AlternativeScore[]
): AHPResult[] {
  const results: AHPResult[] = [];

  // 각 기준별로 정규화 수행
  const normalizedScores: { [alternative: string]: { [criterion: string]: number } } = {};

  alternativeScores.forEach(alternative => {
    normalizedScores[alternative.alternative] = {};
  });

  criteriaWeights.forEach(criterion => {
    // 기준별 총합 계산
    let sum = 0;
    alternativeScores.forEach(alternative => {
      sum += alternative.criterionScores[criterion.criterion] || 0;
    });

    // 정규화 (합이 1이 되도록)
    alternativeScores.forEach(alternative => {
      const score = alternative.criterionScores[criterion.criterion] || 0;
      normalizedScores[alternative.alternative][criterion.criterion] = sum > 0 ? score / sum : 0;
    });
  });

  // Distributive 점수 계산
  alternativeScores.forEach(alternative => {
    let distributiveScore = 0;

    criteriaWeights.forEach(criterion => {
      const normalizedScore = normalizedScores[alternative.alternative][criterion.criterion];
      distributiveScore += criterion.weight * normalizedScore;
    });

    results.push({
      alternative: alternative.alternative,
      idealScore: 0, // 나중에 계산
      distributiveScore,
      idealRank: 0,
      distributiveRank: 0,
      normalizedIdealScore: 0,
      normalizedDistributiveScore: distributiveScore
    });
  });

  // Distributive 모드 순위 계산
  results.sort((a, b) => b.distributiveScore - a.distributiveScore);
  results.forEach((result, index) => {
    result.distributiveRank = index + 1;
  });

  return results;
}

/**
 * 통합 AHP 계산 (Ideal & Distributive)
 */
export function calculateBothModes(
  criteriaWeights: CriterionWeight[],
  alternativeScores: AlternativeScore[]
): AHPResult[] {
  const idealResults = calculateIdealMode(criteriaWeights, alternativeScores);
  const distributiveResults = calculateDistributiveMode(criteriaWeights, alternativeScores);

  // 결과 통합
  const combinedResults: AHPResult[] = [];

  idealResults.forEach(idealResult => {
    const distributiveResult = distributiveResults.find(
      dr => dr.alternative === idealResult.alternative
    );

    if (distributiveResult) {
      combinedResults.push({
        alternative: idealResult.alternative,
        idealScore: idealResult.idealScore,
        distributiveScore: distributiveResult.distributiveScore,
        idealRank: idealResult.idealRank,
        distributiveRank: distributiveResult.distributiveRank,
        normalizedIdealScore: idealResult.normalizedIdealScore,
        normalizedDistributiveScore: distributiveResult.normalizedDistributiveScore
      });
    }
  });

  return combinedResults;
}

/**
 * 모드 간 순위 변화 분석
 */
export function analyzeRankChanges(results: AHPResult[]): {
  alternative: string;
  rankChange: number;
  changeType: 'improved' | 'declined' | 'unchanged';
  significance: 'major' | 'minor' | 'none';
}[] {
  return results.map(result => {
    const rankChange = result.idealRank - result.distributiveRank;
    let changeType: 'improved' | 'declined' | 'unchanged';
    let significance: 'major' | 'minor' | 'none';

    if (rankChange > 0) {
      changeType = 'improved'; // Distributive에서 더 높은 순위
    } else if (rankChange < 0) {
      changeType = 'declined'; // Distributive에서 더 낮은 순위
    } else {
      changeType = 'unchanged';
    }

    const absChange = Math.abs(rankChange);
    if (absChange >= 2) {
      significance = 'major';
    } else if (absChange === 1) {
      significance = 'minor';
    } else {
      significance = 'none';
    }

    return {
      alternative: result.alternative,
      rankChange,
      changeType,
      significance
    };
  });
}

/**
 * 모드별 민감도 분석
 */
export function analyzeModesensitivity(
  criteriaWeights: CriterionWeight[],
  alternativeScores: AlternativeScore[],
  sensitivityRange: number = 0.2 // ±20% 변화
): {
  criterion: string;
  idealSensitivity: { [alternative: string]: number };
  distributiveSensitivity: { [alternative: string]: number };
  modeImpact: 'high' | 'medium' | 'low';
}[] {
  const baseResults = calculateBothModes(criteriaWeights, alternativeScores);
  const sensitivityAnalysis: any[] = [];

  criteriaWeights.forEach(criterion => {
    // 가중치 증가/감소 시나리오
    const increasedWeights = criteriaWeights.map(c => ({
      ...c,
      weight: c.criterion === criterion.criterion 
        ? Math.min(1, c.weight * (1 + sensitivityRange))
        : c.weight * (1 - sensitivityRange / criteriaWeights.length)
    }));

    const decreasedWeights = criteriaWeights.map(c => ({
      ...c,
      weight: c.criterion === criterion.criterion 
        ? Math.max(0, c.weight * (1 - sensitivityRange))
        : c.weight * (1 + sensitivityRange / criteriaWeights.length)
    }));

    const increasedResults = calculateBothModes(increasedWeights, alternativeScores);
    const decreasedResults = calculateBothModes(decreasedWeights, alternativeScores);

    const idealSensitivity: { [alternative: string]: number } = {};
    const distributiveSensitivity: { [alternative: string]: number } = {};
    let maxImpact = 0;

    baseResults.forEach(baseResult => {
      const increasedResult = increasedResults.find(r => r.alternative === baseResult.alternative);
      const decreasedResult = decreasedResults.find(r => r.alternative === baseResult.alternative);

      if (increasedResult && decreasedResult) {
        // Ideal 모드 민감도
        const idealVariation = Math.max(
          Math.abs(increasedResult.idealScore - baseResult.idealScore),
          Math.abs(decreasedResult.idealScore - baseResult.idealScore)
        );
        idealSensitivity[baseResult.alternative] = idealVariation;

        // Distributive 모드 민감도
        const distributiveVariation = Math.max(
          Math.abs(increasedResult.distributiveScore - baseResult.distributiveScore),
          Math.abs(decreasedResult.distributiveScore - baseResult.distributiveScore)
        );
        distributiveSensitivity[baseResult.alternative] = distributiveVariation;

        maxImpact = Math.max(maxImpact, idealVariation, distributiveVariation);
      }
    });

    // 영향도 분류
    let modeImpact: 'high' | 'medium' | 'low';
    if (maxImpact > 0.1) {
      modeImpact = 'high';
    } else if (maxImpact > 0.05) {
      modeImpact = 'medium';
    } else {
      modeImpact = 'low';
    }

    sensitivityAnalysis.push({
      criterion: criterion.criterion,
      idealSensitivity,
      distributiveSensitivity,
      modeImpact
    });
  });

  return sensitivityAnalysis;
}

/**
 * 최적 모드 추천
 */
export function recommendOptimalMode(
  results: AHPResult[],
  decisionContext: {
    riskTolerance: 'low' | 'medium' | 'high';
    decisionImportance: 'low' | 'medium' | 'high' | 'critical';
    stakeholderConsensus: number; // 0-1
    timeConstraint: 'tight' | 'moderate' | 'flexible';
  }
): {
  recommendedMode: 'ideal' | 'distributive' | 'both';
  reasoning: string;
  confidence: number; // 0-1
  considerations: string[];
} {
  const rankChanges = analyzeRankChanges(results);
  const majorChanges = rankChanges.filter(rc => rc.significance === 'major');
  
  let recommendedMode: 'ideal' | 'distributive' | 'both' = 'ideal';
  let confidence = 0.7;
  const considerations: string[] = [];
  let reasoning = '';

  // 순위 변화가 적은 경우
  if (majorChanges.length === 0) {
    recommendedMode = 'ideal';
    reasoning = '두 모드 간 순위 변화가 미미하여 해석이 용이한 Ideal 모드를 권장합니다.';
    confidence = 0.9;
  }
  // 순위 변화가 큰 경우
  else if (majorChanges.length >= results.length / 2) {
    recommendedMode = 'both';
    reasoning = '두 모드 간 유의미한 차이가 있어 양쪽 관점의 분석이 필요합니다.';
    confidence = 0.8;
    considerations.push('모드별 결과의 차이점을 이해관계자에게 설명하세요.');
  }

  // 의사결정 맥락 고려
  if (decisionContext.decisionImportance === 'critical') {
    recommendedMode = 'both';
    reasoning += ' 중요한 의사결정이므로 다각도 분석을 권장합니다.';
    considerations.push('중요한 결정이므로 추가 검증을 고려하세요.');
  }

  if (decisionContext.riskTolerance === 'low') {
    considerations.push('보수적 접근을 위해 Distributive 모드 결과를 중점적으로 검토하세요.');
  }

  if (decisionContext.stakeholderConsensus < 0.7) {
    recommendedMode = 'both';
    considerations.push('이해관계자 간 합의가 부족하므로 다양한 관점의 분석이 필요합니다.');
  }

  if (decisionContext.timeConstraint === 'tight') {
    if (recommendedMode === 'both') {
      recommendedMode = 'ideal';
      reasoning += ' 시간 제약으로 인해 Ideal 모드 중심 분석을 권장합니다.';
      confidence *= 0.9;
    }
  }

  return {
    recommendedMode,
    reasoning,
    confidence,
    considerations
  };
}

/**
 * 모드별 결과 비교 리포트 생성
 */
export function generateModeComparisonReport(results: AHPResult[]): {
  summary: string;
  topChanges: { alternative: string; description: string }[];
  scoreCorrelation: number;
  rankCorrelation: number;
  recommendations: string[];
} {
  const rankChanges = analyzeRankChanges(results);
  const topChanges = rankChanges
    .filter(rc => rc.significance !== 'none')
    .sort((a, b) => Math.abs(b.rankChange) - Math.abs(a.rankChange))
    .slice(0, 3)
    .map(rc => ({
      alternative: rc.alternative,
      description: `${rc.changeType === 'improved' ? '순위 상승' : 
                     rc.changeType === 'declined' ? '순위 하락' : '순위 유지'} 
                    (${Math.abs(rc.rankChange)}단계)`
    }));

  // 점수 상관관계 계산
  const idealScores = results.map(r => r.idealScore);
  const distributiveScores = results.map(r => r.distributiveScore);
  const scoreCorrelation = calculateCorrelation(idealScores, distributiveScores);

  // 순위 상관관계 계산 (Spearman)
  const idealRanks = results.map(r => r.idealRank);
  const distributiveRanks = results.map(r => r.distributiveRank);
  const rankCorrelation = calculateSpearmanCorrelation(idealRanks, distributiveRanks);

  let summary = '';
  if (rankCorrelation > 0.8) {
    summary = '두 모드의 결과가 높은 일치도를 보입니다.';
  } else if (rankCorrelation > 0.6) {
    summary = '두 모드의 결과가 중간 정도의 일치도를 보입니다.';
  } else {
    summary = '두 모드의 결과가 상당한 차이를 보입니다.';
  }

  const recommendations: string[] = [];
  if (topChanges.length > 0) {
    recommendations.push('주요 순위 변화가 있는 대안들에 대한 추가 분석을 권장합니다.');
  }
  if (scoreCorrelation < 0.7) {
    recommendations.push('점수 차이가 큰 대안들의 평가 기준을 재검토해보세요.');
  }

  return {
    summary,
    topChanges,
    scoreCorrelation,
    rankCorrelation,
    recommendations
  };
}

// 헬퍼 함수들
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

function calculateSpearmanCorrelation(ranks1: number[], ranks2: number[]): number {
  const n = ranks1.length;
  const d2Sum = ranks1.reduce((sum, rank1, i) => {
    const d = rank1 - ranks2[i];
    return sum + d * d;
  }, 0);

  return 1 - (6 * d2Sum) / (n * (n * n - 1));
}