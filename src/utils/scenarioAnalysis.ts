/**
 * 시나리오 분석 및 의사결정 지원을 위한 유틸리티 함수들
 */

export interface ScenarioInput {
  id: string;
  name: string;
  description: string;
  criteriaWeights: { [criteriaId: string]: number };
  alternativeScores: { [alternativeId: string]: { [criteriaId: string]: number } };
  externalFactors?: { [factor: string]: number }; // 외부 환경 요인
}

export interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  finalScores: { [alternativeId: string]: number };
  ranking: { alternativeId: string; score: number; rank: number }[];
  rankingChanges?: { [alternativeId: string]: number }; // 기준 시나리오 대비 순위 변화
}

export interface SensitivityAnalysisResult {
  criteriaId: string;
  criteriaName: string;
  sensitivityScore: number; // 0-1, 높을수록 민감
  rankingStability: number; // 0-1, 높을수록 안정적
  criticalThreshold?: number; // 순위가 바뀌는 임계값
}

export interface MonteCarloResult {
  iterations: number;
  alternativeStability: { [alternativeId: string]: { mean: number; std: number; confidence95: [number, number] } };
  rankingProbability: { [alternativeId: string]: { [rank: number]: number } }; // 각 대안이 특정 순위에 올 확률
  bestAlternative: string;
  confidence: number;
}

export interface RiskAssessment {
  alternativeId: string;
  riskScore: number; // 0-1, 높을수록 위험
  riskFactors: {
    implementationRisk: number;
    costRisk: number;
    timeRisk: number;
    qualityRisk: number;
  };
  mitigationStrategies: string[];
}

/**
 * AHP 결과 계산 (간단한 가중합 방식)
 */
export const calculateAHPScores = (
  criteriaWeights: { [criteriaId: string]: number },
  alternativeScores: { [alternativeId: string]: { [criteriaId: string]: number } }
): { [alternativeId: string]: number } => {
  const results: { [alternativeId: string]: number } = {};

  Object.keys(alternativeScores).forEach(altId => {
    let totalScore = 0;
    Object.keys(criteriaWeights).forEach(critId => {
      const weight = criteriaWeights[critId] || 0;
      const score = alternativeScores[altId][critId] || 0;
      totalScore += weight * score;
    });
    results[altId] = totalScore;
  });

  return results;
};

/**
 * 순위 계산
 */
export const calculateRanking = (
  scores: { [alternativeId: string]: number },
  alternativeNames: { [alternativeId: string]: string }
): { alternativeId: string; name: string; score: number; rank: number }[] => {
  return Object.entries(scores)
    .map(([id, score]) => ({ alternativeId: id, name: alternativeNames[id] || id, score }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));
};

/**
 * 시나리오 분석 실행
 */
export const runScenarioAnalysis = (
  baseScenario: ScenarioInput,
  scenarios: ScenarioInput[],
  alternativeNames: { [alternativeId: string]: string }
): ScenarioResult[] => {
  const baseResult = calculateAHPScores(baseScenario.criteriaWeights, baseScenario.alternativeScores);
  const baseRanking = calculateRanking(baseResult, alternativeNames);
  const baseRankMap = Object.fromEntries(baseRanking.map(r => [r.alternativeId, r.rank]));

  return scenarios.map(scenario => {
    const scores = calculateAHPScores(scenario.criteriaWeights, scenario.alternativeScores);
    const ranking = calculateRanking(scores, alternativeNames);
    
    const rankingChanges: { [alternativeId: string]: number } = {};
    ranking.forEach(r => {
      const baseRank = baseRankMap[r.alternativeId] || 999;
      rankingChanges[r.alternativeId] = baseRank - r.rank; // 양수면 순위 상승
    });

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      finalScores: scores,
      ranking: ranking,
      rankingChanges
    };
  });
};

/**
 * 민감도 분석
 */
export const performSensitivityAnalysis = (
  baseScenario: ScenarioInput,
  alternativeNames: { [alternativeId: string]: string },
  criteriaNames: { [criteriaId: string]: string },
  sensitivityRange: number = 0.2 // ±20% 변화
): SensitivityAnalysisResult[] => {
  const baseScores = calculateAHPScores(baseScenario.criteriaWeights, baseScenario.alternativeScores);
  const baseRanking = calculateRanking(baseScores, alternativeNames);
  const baseOrder = baseRanking.map(r => r.alternativeId);

  return Object.keys(baseScenario.criteriaWeights).map(criteriaId => {
    let rankingChanges = 0;
    let totalTests = 0;

    // 가중치를 ±sensitivityRange 범위에서 변화시켜 테스트
    for (let delta = -sensitivityRange; delta <= sensitivityRange; delta += 0.05) {
      const modifiedWeights = { ...baseScenario.criteriaWeights };
      const originalWeight = modifiedWeights[criteriaId];
      modifiedWeights[criteriaId] = Math.max(0, Math.min(1, originalWeight + delta));

      // 다른 기준들의 가중치를 정규화
      const totalWeight = Object.values(modifiedWeights).reduce((sum, w) => sum + w, 0);
      if (totalWeight > 0) {
        Object.keys(modifiedWeights).forEach(id => {
          modifiedWeights[id] /= totalWeight;
        });
      }

      const newScores = calculateAHPScores(modifiedWeights, baseScenario.alternativeScores);
      const newRanking = calculateRanking(newScores, alternativeNames);
      const newOrder = newRanking.map(r => r.alternativeId);

      // 순위 변화 계산
      if (JSON.stringify(baseOrder) !== JSON.stringify(newOrder)) {
        rankingChanges++;
      }
      totalTests++;
    }

    const sensitivityScore = rankingChanges / totalTests;
    const rankingStability = 1 - sensitivityScore;

    return {
      criteriaId,
      criteriaName: criteriaNames[criteriaId] || criteriaId,
      sensitivityScore,
      rankingStability
    };
  });
};

/**
 * 몬테카를로 시뮬레이션
 */
export const runMonteCarloSimulation = (
  baseScenario: ScenarioInput,
  alternativeNames: { [alternativeId: string]: string },
  iterations: number = 1000,
  uncertaintyLevel: number = 0.15 // ±15% 불확실성
): MonteCarloResult => {
  const results: { [alternativeId: string]: number[] } = {};
  const rankingCounts: { [alternativeId: string]: { [rank: number]: number } } = {};

  // 초기화
  Object.keys(baseScenario.alternativeScores).forEach(altId => {
    results[altId] = [];
    rankingCounts[altId] = {};
    for (let rank = 1; rank <= Object.keys(baseScenario.alternativeScores).length; rank++) {
      rankingCounts[altId][rank] = 0;
    }
  });

  // 시뮬레이션 실행
  for (let i = 0; i < iterations; i++) {
    // 가중치에 노이즈 추가
    const noisyWeights = { ...baseScenario.criteriaWeights };
    Object.keys(noisyWeights).forEach(critId => {
      const noise = (Math.random() - 0.5) * 2 * uncertaintyLevel;
      noisyWeights[critId] = Math.max(0.01, Math.min(0.99, noisyWeights[critId] + noise));
    });

    // 정규화
    const totalWeight = Object.values(noisyWeights).reduce((sum, w) => sum + w, 0);
    Object.keys(noisyWeights).forEach(id => {
      noisyWeights[id] /= totalWeight;
    });

    // 점수에도 노이즈 추가
    const noisyScores = { ...baseScenario.alternativeScores };
    Object.keys(noisyScores).forEach(altId => {
      Object.keys(noisyScores[altId]).forEach(critId => {
        const noise = (Math.random() - 0.5) * 2 * uncertaintyLevel;
        noisyScores[altId][critId] = Math.max(0, Math.min(1, noisyScores[altId][critId] + noise));
      });
    });

    const scores = calculateAHPScores(noisyWeights, noisyScores);
    const ranking = calculateRanking(scores, alternativeNames);

    // 결과 저장
    Object.keys(scores).forEach(altId => {
      results[altId].push(scores[altId]);
    });

    ranking.forEach(r => {
      rankingCounts[r.alternativeId][r.rank]++;
    });
  }

  // 통계 계산
  const alternativeStability: { [alternativeId: string]: { mean: number; std: number; confidence95: [number, number] } } = {};
  Object.keys(results).forEach(altId => {
    const scores = results[altId];
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const std = Math.sqrt(variance);
    
    const sorted = [...scores].sort((a, b) => a - b);
    const ci95Lower = sorted[Math.floor(0.025 * iterations)];
    const ci95Upper = sorted[Math.floor(0.975 * iterations)];

    alternativeStability[altId] = {
      mean,
      std,
      confidence95: [ci95Lower, ci95Upper]
    };
  });

  // 순위 확률 계산
  const rankingProbability: { [alternativeId: string]: { [rank: number]: number } } = {};
  Object.keys(rankingCounts).forEach(altId => {
    rankingProbability[altId] = {};
    Object.keys(rankingCounts[altId]).forEach(rank => {
      rankingProbability[altId][parseInt(rank)] = rankingCounts[altId][parseInt(rank)] / iterations;
    });
  });

  // 최고 대안 선정 (1등 확률이 가장 높은 대안)
  let bestAlternative = '';
  let highestFirstPlaceProb = 0;
  Object.keys(rankingProbability).forEach(altId => {
    const firstPlaceProb = rankingProbability[altId][1] || 0;
    if (firstPlaceProb > highestFirstPlaceProb) {
      highestFirstPlaceProb = firstPlaceProb;
      bestAlternative = altId;
    }
  });

  return {
    iterations,
    alternativeStability,
    rankingProbability,
    bestAlternative,
    confidence: highestFirstPlaceProb
  };
};

/**
 * 리스크 평가
 */
export const assessRisk = (
  alternatives: { [alternativeId: string]: any },
  riskWeights: {
    implementationWeight: number;
    costWeight: number;
    timeWeight: number;
    qualityWeight: number;
  } = { implementationWeight: 0.3, costWeight: 0.3, timeWeight: 0.2, qualityWeight: 0.2 }
): RiskAssessment[] => {
  return Object.keys(alternatives).map(altId => {
    const alt = alternatives[altId];
    
    // 리스크 요소별 점수 계산 (0-1, 높을수록 위험)
    const implementationRisk = 1 - (alt.feasibility || 0.5);
    const costRisk = Math.min(1, (alt.cost || 0) / 100000000); // 1억 이상이면 최대 위험
    const timeRisk = Math.min(1, (alt.implementationTime || 12) / 24); // 24개월 이상이면 최대 위험
    const qualityRisk = alt.riskLevel === 'high' ? 0.8 : alt.riskLevel === 'medium' ? 0.5 : 0.2;

    const riskScore = 
      implementationRisk * riskWeights.implementationWeight +
      costRisk * riskWeights.costWeight +
      timeRisk * riskWeights.timeWeight +
      qualityRisk * riskWeights.qualityWeight;

    // 위험 완화 전략
    const mitigationStrategies: string[] = [];
    if (implementationRisk > 0.6) mitigationStrategies.push('구현 가능성 검토 및 파일럿 프로젝트 실시');
    if (costRisk > 0.6) mitigationStrategies.push('단계별 투자 계획 수립 및 예산 최적화');
    if (timeRisk > 0.6) mitigationStrategies.push('마일스톤 세분화 및 위험 버퍼 확보');
    if (qualityRisk > 0.6) mitigationStrategies.push('품질 보증 체계 강화 및 외부 검증');

    return {
      alternativeId: altId,
      riskScore,
      riskFactors: {
        implementationRisk,
        costRisk,
        timeRisk,
        qualityRisk
      },
      mitigationStrategies
    };
  });
};

/**
 * What-If 분석을 위한 시나리오 생성기
 */
export const generateWhatIfScenarios = (
  baseScenario: ScenarioInput,
  changes: {
    criteriaWeightChanges?: { [criteriaId: string]: number }; // 절대값 변화
    alternativeScoreChanges?: { [alternativeId: string]: { [criteriaId: string]: number } }; // 절대값 변화
    newAlternatives?: { [alternativeId: string]: { [criteriaId: string]: number } };
    removedAlternatives?: string[];
  }
): ScenarioInput => {
  const newScenario: ScenarioInput = {
    id: `whatif_${Date.now()}`,
    name: 'What-If 시나리오',
    description: '가정 변경에 따른 결과 분석',
    criteriaWeights: { ...baseScenario.criteriaWeights },
    alternativeScores: JSON.parse(JSON.stringify(baseScenario.alternativeScores))
  };

  // 기준 가중치 변경
  if (changes.criteriaWeightChanges) {
    Object.keys(changes.criteriaWeightChanges).forEach(critId => {
      newScenario.criteriaWeights[critId] = changes.criteriaWeightChanges![critId];
    });

    // 가중치 정규화
    const totalWeight = Object.values(newScenario.criteriaWeights).reduce((sum, w) => sum + w, 0);
    if (totalWeight > 0) {
      Object.keys(newScenario.criteriaWeights).forEach(id => {
        newScenario.criteriaWeights[id] /= totalWeight;
      });
    }
  }

  // 대안 점수 변경
  if (changes.alternativeScoreChanges) {
    Object.keys(changes.alternativeScoreChanges).forEach(altId => {
      Object.keys(changes.alternativeScoreChanges![altId]).forEach(critId => {
        newScenario.alternativeScores[altId][critId] = changes.alternativeScoreChanges![altId][critId];
      });
    });
  }

  // 새 대안 추가
  if (changes.newAlternatives) {
    Object.keys(changes.newAlternatives).forEach(altId => {
      newScenario.alternativeScores[altId] = changes.newAlternatives![altId];
    });
  }

  // 대안 제거
  if (changes.removedAlternatives) {
    changes.removedAlternatives.forEach(altId => {
      delete newScenario.alternativeScores[altId];
    });
  }

  return newScenario;
};