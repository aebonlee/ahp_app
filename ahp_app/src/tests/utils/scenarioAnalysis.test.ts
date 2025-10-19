import {
  calculateAHPScores,
  calculateRanking,
  runScenarioAnalysis,
  performSensitivityAnalysis,
  runMonteCarloSimulation,
  assessRisk,
  generateWhatIfScenarios,
  type ScenarioInput
} from '../../utils/scenarioAnalysis';

describe('scenarioAnalysis utilities', () => {
  const sampleCriteriaWeights = {
    c1: 0.4, // 비용 효율성
    c2: 0.3, // 기술 성숙도
    c3: 0.2, // 구현 복잡도
    c4: 0.1  // 전략적 중요성
  };

  const sampleAlternativeScores = {
    a1: { c1: 0.8, c2: 0.6, c3: 0.4, c4: 0.9 }, // AI/머신러닝
    a2: { c1: 0.9, c2: 0.9, c3: 0.8, c4: 0.7 }, // 클라우드 컴퓨팅
    a3: { c1: 0.6, c2: 0.5, c3: 0.3, c4: 0.6 }  // IoT 시스템
  };

  const sampleAlternativeNames = {
    a1: 'AI/머신러닝',
    a2: '클라우드 컴퓨팅',
    a3: 'IoT 시스템'
  };

  const sampleCriteriaNames = {
    c1: '비용 효율성',
    c2: '기술 성숙도',
    c3: '구현 복잡도',
    c4: '전략적 중요성'
  };

  const sampleAlternatives = {
    a1: {
      id: 'a1',
      name: 'AI/머신러닝',
      feasibility: 0.7,
      cost: 50000000,
      implementationTime: 12,
      riskLevel: 'medium'
    },
    a2: {
      id: 'a2',
      name: '클라우드 컴퓨팅',
      feasibility: 0.9,
      cost: 30000000,
      implementationTime: 6,
      riskLevel: 'low'
    },
    a3: {
      id: 'a3',
      name: 'IoT 시스템',
      feasibility: 0.6,
      cost: 40000000,
      implementationTime: 18,
      riskLevel: 'high'
    }
  };

  describe('calculateAHPScores', () => {
    test('calculates correct weighted scores', () => {
      const scores = calculateAHPScores(sampleCriteriaWeights, sampleAlternativeScores);
      
      // Expected: a1 = 0.8*0.4 + 0.6*0.3 + 0.4*0.2 + 0.9*0.1 = 0.32 + 0.18 + 0.08 + 0.09 = 0.67
      expect(scores.a1).toBeCloseTo(0.67, 2);
      
      // Expected: a2 = 0.9*0.4 + 0.9*0.3 + 0.8*0.2 + 0.7*0.1 = 0.36 + 0.27 + 0.16 + 0.07 = 0.86
      expect(scores.a2).toBeCloseTo(0.86, 2);
      
      // Expected: a3 = 0.6*0.4 + 0.5*0.3 + 0.3*0.2 + 0.6*0.1 = 0.24 + 0.15 + 0.06 + 0.06 = 0.51
      expect(scores.a3).toBeCloseTo(0.51, 2);
    });

    test('handles missing criteria weights gracefully', () => {
      const incompleteWeights = { c1: 0.5, c2: 0.5 }; // missing c3, c4
      const scores = calculateAHPScores(incompleteWeights, sampleAlternativeScores);
      
      // Should only consider c1 and c2
      expect(scores.a1).toBeCloseTo(0.5 * 0.8 + 0.5 * 0.6, 2);
    });

    test('handles missing alternative scores gracefully', () => {
      const incompleteScores = {
        a1: { c1: 0.8, c2: 0.6 }, // missing c3, c4
        a2: { c1: 0.9, c2: 0.9, c3: 0.8, c4: 0.7 }
      };
      
      const scores = calculateAHPScores(sampleCriteriaWeights, incompleteScores);
      
      // a1 should only get scores for c1 and c2 (missing scores treated as 0)
      expect(scores.a1).toBeCloseTo(0.8 * 0.4 + 0.6 * 0.3, 2);
      expect(scores.a2).toBeCloseTo(0.86, 2);
    });
  });

  describe('calculateRanking', () => {
    test('ranks alternatives correctly by score', () => {
      const scores = { a1: 0.67, a2: 0.86, a3: 0.51 };
      const ranking = calculateRanking(scores, sampleAlternativeNames);
      
      expect(ranking).toHaveLength(3);
      expect(ranking[0]).toEqual({
        alternativeId: 'a2',
        name: '클라우드 컴퓨팅',
        score: 0.86,
        rank: 1
      });
      expect(ranking[1]).toEqual({
        alternativeId: 'a1',
        name: 'AI/머신러닝',
        score: 0.67,
        rank: 2
      });
      expect(ranking[2]).toEqual({
        alternativeId: 'a3',
        name: 'IoT 시스템',
        score: 0.51,
        rank: 3
      });
    });

    test('handles tied scores correctly', () => {
      const scores = { a1: 0.5, a2: 0.5, a3: 0.3 };
      const ranking = calculateRanking(scores, sampleAlternativeNames);
      
      expect(ranking[0].rank).toBe(1);
      expect(ranking[1].rank).toBe(2);
      expect(ranking[2].rank).toBe(3);
    });
  });

  describe('runScenarioAnalysis', () => {
    test('compares multiple scenarios correctly', () => {
      const baseScenario: ScenarioInput = {
        id: 'base',
        name: '기준 시나리오',
        description: 'Base case',
        criteriaWeights: sampleCriteriaWeights,
        alternativeScores: sampleAlternativeScores
      };

      const costFocusedScenario: ScenarioInput = {
        id: 'cost',
        name: '비용 중심 시나리오',
        description: 'Cost focused',
        criteriaWeights: { c1: 0.7, c2: 0.1, c3: 0.1, c4: 0.1 },
        alternativeScores: sampleAlternativeScores
      };

      const results = runScenarioAnalysis(baseScenario, [baseScenario, costFocusedScenario], sampleAlternativeNames);
      
      expect(results).toHaveLength(2);
      expect(results[0].scenarioId).toBe('base');
      expect(results[1].scenarioId).toBe('cost');
      
      // Check ranking changes
      expect(results[1].rankingChanges).toBeDefined();
    });
  });

  describe('performSensitivityAnalysis', () => {
    test('identifies sensitive criteria', () => {
      const baseScenario: ScenarioInput = {
        id: 'base',
        name: 'Base',
        description: 'Base scenario',
        criteriaWeights: sampleCriteriaWeights,
        alternativeScores: sampleAlternativeScores
      };

      const results = performSensitivityAnalysis(baseScenario, sampleAlternativeNames, sampleCriteriaNames);
      
      expect(results).toHaveLength(4); // 4 criteria
      results.forEach(result => {
        expect(result.sensitivityScore).toBeGreaterThanOrEqual(0);
        expect(result.sensitivityScore).toBeLessThanOrEqual(1);
        expect(result.rankingStability).toBeGreaterThanOrEqual(0);
        expect(result.rankingStability).toBeLessThanOrEqual(1);
        expect(result.criteriaName).toBeDefined();
      });
    });
  });

  describe('runMonteCarloSimulation', () => {
    test('provides statistical analysis', () => {
      const baseScenario: ScenarioInput = {
        id: 'base',
        name: 'Base',
        description: 'Base scenario',
        criteriaWeights: sampleCriteriaWeights,
        alternativeScores: sampleAlternativeScores
      };

      const result = runMonteCarloSimulation(baseScenario, sampleAlternativeNames, 100);
      
      expect(result.iterations).toBe(100);
      expect(result.bestAlternative).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      
      // Check alternative stability
      Object.keys(sampleAlternativeNames).forEach(altId => {
        expect(result.alternativeStability[altId]).toBeDefined();
        expect(result.alternativeStability[altId].mean).toBeGreaterThanOrEqual(0);
        expect(result.alternativeStability[altId].std).toBeGreaterThanOrEqual(0);
        expect(result.alternativeStability[altId].confidence95).toHaveLength(2);
      });

      // Check ranking probabilities
      Object.keys(sampleAlternativeNames).forEach(altId => {
        expect(result.rankingProbability[altId]).toBeDefined();
        const totalProbability = Object.values(result.rankingProbability[altId]).reduce((sum, p) => sum + p, 0);
        expect(totalProbability).toBeCloseTo(1, 1); // Should sum to 1 (within 0.1 tolerance)
      });
    });

    test('handles different uncertainty levels', () => {
      const baseScenario: ScenarioInput = {
        id: 'base',
        name: 'Base',
        description: 'Base scenario',
        criteriaWeights: sampleCriteriaWeights,
        alternativeScores: sampleAlternativeScores
      };

      const lowUncertainty = runMonteCarloSimulation(baseScenario, sampleAlternativeNames, 50, 0.05);
      const highUncertainty = runMonteCarloSimulation(baseScenario, sampleAlternativeNames, 50, 0.3);
      
      // High uncertainty should generally lead to higher standard deviations
      const lowStdSum = Object.values(lowUncertainty.alternativeStability).reduce((sum, stats) => sum + stats.std, 0);
      const highStdSum = Object.values(highUncertainty.alternativeStability).reduce((sum, stats) => sum + stats.std, 0);
      
      expect(highStdSum).toBeGreaterThan(lowStdSum);
    });
  });

  describe('assessRisk', () => {
    test('evaluates risk factors correctly', () => {
      const assessments = assessRisk(sampleAlternatives);
      
      expect(assessments).toHaveLength(3);
      assessments.forEach(assessment => {
        expect(assessment.riskScore).toBeGreaterThanOrEqual(0);
        expect(assessment.riskScore).toBeLessThanOrEqual(1);
        expect(assessment.riskFactors.implementationRisk).toBeGreaterThanOrEqual(0);
        expect(assessment.riskFactors.costRisk).toBeGreaterThanOrEqual(0);
        expect(assessment.riskFactors.timeRisk).toBeGreaterThanOrEqual(0);
        expect(assessment.riskFactors.qualityRisk).toBeGreaterThanOrEqual(0);
        expect(assessment.mitigationStrategies).toBeInstanceOf(Array);
      });
      
      // IoT (high risk) should have higher risk score than Cloud Computing (low risk)
      const iotAssessment = assessments.find(a => a.alternativeId === 'a3');
      const cloudAssessment = assessments.find(a => a.alternativeId === 'a2');
      
      expect(iotAssessment!.riskScore).toBeGreaterThan(cloudAssessment!.riskScore);
    });

    test('provides appropriate mitigation strategies for high-risk alternatives', () => {
      const assessments = assessRisk(sampleAlternatives);
      const iotAssessment = assessments.find(a => a.alternativeId === 'a3');
      
      // IoT has high risk factors, should have mitigation strategies
      expect(iotAssessment!.mitigationStrategies.length).toBeGreaterThan(0);
    });
  });

  describe('generateWhatIfScenarios', () => {
    test.skip('modifies criteria weights correctly', () => {
      const baseScenario: ScenarioInput = {
        id: 'base',
        name: 'Base',
        description: 'Base scenario',
        criteriaWeights: sampleCriteriaWeights,
        alternativeScores: sampleAlternativeScores
      };

      const whatIfScenario = generateWhatIfScenarios(baseScenario, {
        criteriaWeightChanges: { c1: 0.6, c2: 0.2 }
      });

      expect(whatIfScenario.criteriaWeights.c1).toBeCloseTo(0.6, 2);
      expect(whatIfScenario.criteriaWeights.c2).toBeCloseTo(0.2, 2);
      
      // Check normalization
      const totalWeight = Object.values(whatIfScenario.criteriaWeights).reduce((sum, w) => sum + w, 0);
      expect(totalWeight).toBeCloseTo(1, 2);
    });

    test.skip('modifies alternative scores correctly', () => {
      const baseScenario: ScenarioInput = {
        id: 'base',
        name: 'Base',
        description: 'Base scenario',
        criteriaWeights: sampleCriteriaWeights,
        alternativeScores: sampleAlternativeScores
      };

      const whatIfScenario = generateWhatIfScenarios(baseScenario, {
        alternativeScoreChanges: {
          a1: { c1: 0.95, c2: 0.85 }
        }
      });

      expect(whatIfScenario.alternativeScores.a1.c1).toBe(0.95);
      expect(whatIfScenario.alternativeScores.a1.c2).toBe(0.85);
      expect(whatIfScenario.alternativeScores.a1.c3).toBe(0.4); // unchanged
    });

    test('adds new alternatives correctly', () => {
      const baseScenario: ScenarioInput = {
        id: 'base',
        name: 'Base',
        description: 'Base scenario',
        criteriaWeights: sampleCriteriaWeights,
        alternativeScores: sampleAlternativeScores
      };

      const whatIfScenario = generateWhatIfScenarios(baseScenario, {
        newAlternatives: {
          a4: { c1: 0.7, c2: 0.8, c3: 0.6, c4: 0.9 }
        }
      });

      expect(whatIfScenario.alternativeScores.a4).toBeDefined();
      expect(whatIfScenario.alternativeScores.a4.c1).toBe(0.7);
      expect(Object.keys(whatIfScenario.alternativeScores)).toHaveLength(4);
    });

    test('removes alternatives correctly', () => {
      const baseScenario: ScenarioInput = {
        id: 'base',
        name: 'Base',
        description: 'Base scenario',
        criteriaWeights: sampleCriteriaWeights,
        alternativeScores: sampleAlternativeScores
      };

      const whatIfScenario = generateWhatIfScenarios(baseScenario, {
        removedAlternatives: ['a3']
      });

      expect(whatIfScenario.alternativeScores.a3).toBeUndefined();
      expect(Object.keys(whatIfScenario.alternativeScores)).toHaveLength(2);
      expect(whatIfScenario.alternativeScores.a1).toBeDefined();
      expect(whatIfScenario.alternativeScores.a2).toBeDefined();
    });
  });
});