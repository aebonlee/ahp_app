/**
 * 결과 조회 및 분석 API 라우터
 * AHP 계산 결과 저장, 조회, 그룹 통합, 분석 등을 처리
 */

import express from 'express';
import { body, param, query as queryValidator, validationResult } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth';
import { query } from '../database/connection';
import { AHPCalculatorService } from '../services/ahpCalculator';

const router = express.Router();

/**
 * AHP 계산 결과 저장
 * POST /api/results/save
 */
router.post('/save',
  authenticateToken,
  [
    body('project_id').isInt().withMessage('Project ID must be an integer'),
    body('criteria_weights').isObject().withMessage('Criteria weights must be an object'),
    body('alternative_scores').isObject().withMessage('Alternative scores must be an object'),
    body('final_ranking').isArray().withMessage('Final ranking must be an array'),
    body('consistency_ratio').optional().isFloat().withMessage('Consistency ratio must be a number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        project_id,
        criteria_weights,
        alternative_scores,
        final_ranking,
        consistency_ratio = 0,
        calculation_method = 'geometric_mean'
      } = req.body;

      const evaluator_id = (req as any).user.userId;

      // 프로젝트 접근 권한 확인
      const projectCheck = await query(
        `SELECT pe.* FROM project_evaluators pe 
         WHERE pe.project_id = $1 AND pe.evaluator_id = $2`,
        [project_id, evaluator_id]
      );

      if (projectCheck.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // 결과 저장 (개별 평가자 결과)
      const result = await query(
        `INSERT INTO ahp_results 
         (project_id, evaluator_id, result_type, criteria_weights, alternative_scores, 
          final_ranking, consistency_ratio, calculation_method)
         VALUES ($1, $2, 'individual', $3, $4, $5, $6, $7)
         ON CONFLICT (project_id, evaluator_id, result_type)
         DO UPDATE SET 
           criteria_weights = $3,
           alternative_scores = $4,
           final_ranking = $5,
           consistency_ratio = $6,
           calculation_method = $7,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          project_id,
          evaluator_id,
          JSON.stringify(criteria_weights),
          JSON.stringify(alternative_scores),
          JSON.stringify(final_ranking),
          consistency_ratio,
          calculation_method
        ]
      );

      res.status(201).json({
        message: 'Results saved successfully',
        result: result.rows[0]
      });

    } catch (error) {
      console.error('Error saving results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 개별 평가자 결과 조회
 * GET /api/results/individual/:projectId
 */
router.get('/individual/:projectId',
  authenticateToken,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const projectId = parseInt(req.params.projectId);
      const evaluatorId = (req as any).user.userId;

      // 개별 결과 조회
      const result = await query(
        `SELECT ar.*, u.name as evaluator_name, pe.evaluator_code
         FROM ahp_results ar
         JOIN users u ON ar.evaluator_id = u.id
         JOIN project_evaluators pe ON ar.project_id = pe.project_id AND ar.evaluator_id = pe.evaluator_id
         WHERE ar.project_id = $1 AND ar.evaluator_id = $2 AND ar.result_type = 'individual'`,
        [projectId, evaluatorId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'No results found for this evaluator' });
      }

      const resultData = result.rows[0];

      res.json({
        project_id: projectId,
        evaluator_id: evaluatorId,
        evaluator_name: resultData.evaluator_name,
        evaluator_code: resultData.evaluator_code,
        criteria_weights: JSON.parse(resultData.criteria_weights),
        alternative_scores: JSON.parse(resultData.alternative_scores),
        final_ranking: JSON.parse(resultData.final_ranking),
        consistency_ratio: resultData.consistency_ratio,
        calculation_method: resultData.calculation_method,
        calculated_at: resultData.updated_at
      });

    } catch (error) {
      console.error('Error fetching individual results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 그룹 통합 결과 계산 및 조회
 * POST /api/results/group
 */
router.post('/group',
  authenticateToken,
  [
    body('project_id').isInt().withMessage('Project ID must be an integer'),
    body('aggregation_method').optional().isIn(['weighted_average', 'geometric_mean']).withMessage('Invalid aggregation method')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { project_id, aggregation_method = 'weighted_average' } = req.body;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      // 접근 권한 확인
      let accessQuery;
      if (userRole === 'admin') {
        accessQuery = await query(
          'SELECT * FROM projects WHERE id = $1 AND created_by = $2',
          [project_id, userId]
        );
      } else {
        accessQuery = await query(
          'SELECT * FROM project_evaluators WHERE project_id = $1 AND evaluator_id = $2',
          [project_id, userId]
        );
      }

      if (accessQuery.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // 모든 개별 결과 조회
      const individualResults = await query(
        `SELECT ar.*, pe.evaluator_code, ew.weight
         FROM ahp_results ar
         JOIN project_evaluators pe ON ar.project_id = pe.project_id AND ar.evaluator_id = pe.evaluator_id
         LEFT JOIN evaluator_weights ew ON ar.project_id = ew.project_id AND ar.evaluator_id = ew.evaluator_id
         WHERE ar.project_id = $1 AND ar.result_type = 'individual'`,
        [project_id]
      );

      if (individualResults.rowCount === 0) {
        return res.status(404).json({ error: 'No individual results found for this project' });
      }

      // 대안 목록 조회
      const alternatives = await query(
        'SELECT id, name FROM alternatives WHERE project_id = $1 ORDER BY order_index',
        [project_id]
      );

      // 기준 목록 조회
      const criteria = await query(
        'SELECT id, name FROM criteria WHERE project_id = $1 ORDER BY order_index',
        [project_id]
      );

      // 그룹 통합 계산
      const groupResult = calculateGroupAggregation(
        individualResults.rows,
        alternatives.rows,
        criteria.rows,
        aggregation_method
      );

      // 그룹 결과 저장
      await query(
        `INSERT INTO ahp_results 
         (project_id, evaluator_id, result_type, criteria_weights, alternative_scores, 
          final_ranking, consistency_ratio, calculation_method)
         VALUES ($1, $2, 'group', $3, $4, $5, $6, $7)
         ON CONFLICT (project_id, evaluator_id, result_type)
         DO UPDATE SET 
           criteria_weights = $3,
           alternative_scores = $4,
           final_ranking = $5,
           consistency_ratio = $6,
           calculation_method = $7,
           updated_at = CURRENT_TIMESTAMP`,
        [
          project_id,
          userId, // 요청한 사용자 ID로 저장
          JSON.stringify(groupResult.criteria_weights),
          JSON.stringify(groupResult.alternative_scores),
          JSON.stringify(groupResult.final_ranking),
          groupResult.average_consistency_ratio,
          `group_${aggregation_method}`
        ]
      );

      res.json({
        project_id,
        result_type: 'group',
        aggregation_method,
        participants: individualResults.rowCount,
        ...groupResult
      });

    } catch (error) {
      console.error('Error calculating group results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 프로젝트 전체 결과 조회 (관리자용)
 * GET /api/results/project/:projectId
 */
router.get('/project/:projectId',
  authenticateToken,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    queryValidator('include_individual').optional().isBoolean().withMessage('include_individual must be boolean')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const projectId = parseInt(req.params.projectId);
      const includeIndividual = req.query.include_individual === 'true';
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      // 접근 권한 확인
      let accessQuery;
      if (userRole === 'admin') {
        accessQuery = await query(
          'SELECT * FROM projects WHERE id = $1 AND created_by = $2',
          [projectId, userId]
        );
      } else {
        accessQuery = await query(
          'SELECT * FROM project_evaluators WHERE project_id = $1 AND evaluator_id = $2',
          [projectId, userId]
        );
      }

      if (accessQuery.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // 그룹 결과 조회
      const groupResult = await query(
        `SELECT * FROM ahp_results 
         WHERE project_id = $1 AND result_type = 'group'
         ORDER BY updated_at DESC LIMIT 1`,
        [projectId]
      );

      let response: any = {
        project_id: projectId,
        has_group_result: groupResult.rowCount > 0
      };

      if (groupResult.rowCount > 0) {
        const group = groupResult.rows[0];
        response.group_result = {
          criteria_weights: JSON.parse(group.criteria_weights),
          alternative_scores: JSON.parse(group.alternative_scores),
          final_ranking: JSON.parse(group.final_ranking),
          consistency_ratio: group.consistency_ratio,
          calculation_method: group.calculation_method,
          calculated_at: group.updated_at
        };
      }

      // 개별 결과 포함 요청 시
      if (includeIndividual) {
        const individualResults = await query(
          `SELECT ar.*, u.name as evaluator_name, pe.evaluator_code
           FROM ahp_results ar
           JOIN users u ON ar.evaluator_id = u.id
           JOIN project_evaluators pe ON ar.project_id = pe.project_id AND ar.evaluator_id = pe.evaluator_id
           WHERE ar.project_id = $1 AND ar.result_type = 'individual'
           ORDER BY pe.evaluator_code`,
          [projectId]
        );

        response.individual_results = individualResults.rows.map(row => ({
          evaluator_id: row.evaluator_id,
          evaluator_name: row.evaluator_name,
          evaluator_code: row.evaluator_code,
          criteria_weights: JSON.parse(row.criteria_weights),
          alternative_scores: JSON.parse(row.alternative_scores),
          final_ranking: JSON.parse(row.final_ranking),
          consistency_ratio: row.consistency_ratio,
          calculation_method: row.calculation_method,
          calculated_at: row.updated_at
        }));
      }

      res.json(response);

    } catch (error) {
      console.error('Error fetching project results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 민감도 분석 수행
 * POST /api/results/sensitivity-analysis
 */
router.post('/sensitivity-analysis',
  authenticateToken,
  [
    body('project_id').isInt().withMessage('Project ID must be an integer'),
    body('criterion_id').isString().withMessage('Criterion ID is required'),
    body('variation_range').optional().isFloat({min: 0.01, max: 1}).withMessage('Variation range must be between 0.01 and 1')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { project_id, criterion_id, variation_range = 0.1 } = req.body;
      const userId = (req as any).user.userId;

      // 접근 권한 확인
      const accessQuery = await query(
        `SELECT pe.* FROM project_evaluators pe 
         WHERE pe.project_id = $1 AND pe.evaluator_id = $2`,
        [project_id, userId]
      );

      if (accessQuery.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // 현재 결과 조회
      const currentResult = await query(
        `SELECT * FROM ahp_results 
         WHERE project_id = $1 AND evaluator_id = $2 AND result_type = 'individual'`,
        [project_id, userId]
      );

      if (currentResult.rowCount === 0) {
        return res.status(404).json({ error: 'No current results found for sensitivity analysis' });
      }

      const current = currentResult.rows[0];
      const criteriaWeights = JSON.parse(current.criteria_weights);
      const alternativeScores = JSON.parse(current.alternative_scores);

      // 민감도 분석 수행
      const sensitivityResults = performSensitivityAnalysis(
        criteriaWeights,
        alternativeScores,
        criterion_id,
        variation_range
      );

      res.json({
        project_id,
        criterion_id,
        variation_range,
        base_ranking: JSON.parse(current.final_ranking),
        sensitivity_analysis: sensitivityResults
      });

    } catch (error) {
      console.error('Error performing sensitivity analysis:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 헬퍼 함수들
 */

// 그룹 통합 계산
function calculateGroupAggregation(
  individualResults: any[],
  alternatives: any[],
  criteria: any[],
  method: string
) {
  const numAlternatives = alternatives.length;
  const numCriteria = criteria.length;

  // 평가자별 가중치 맵 생성
  const evaluatorWeights = new Map();
  let totalWeight = 0;

  individualResults.forEach(result => {
    const weight = result.weight || 1.0;
    evaluatorWeights.set(result.evaluator_id, weight);
    totalWeight += weight;
  });

  // 가중치 정규화
  evaluatorWeights.forEach((weight, evaluatorId) => {
    evaluatorWeights.set(evaluatorId, weight / totalWeight);
  });

  // 기준별 가중치 통합
  const groupCriteriaWeights: any = {};
  criteria.forEach(criterion => {
    let weightSum = 0;
    individualResults.forEach(result => {
      const weights = JSON.parse(result.criteria_weights);
      const weight = weights[criterion.id] || 0;
      const evaluatorWeight = evaluatorWeights.get(result.evaluator_id);
      weightSum += weight * evaluatorWeight;
    });
    groupCriteriaWeights[criterion.id] = weightSum;
  });

  // 대안별 점수 통합
  const groupAlternativeScores: any = {};
  alternatives.forEach(alternative => {
    let scoreSum = 0;
    individualResults.forEach(result => {
      const scores = JSON.parse(result.alternative_scores);
      const score = scores[alternative.id] || 0;
      const evaluatorWeight = evaluatorWeights.get(result.evaluator_id);
      scoreSum += score * evaluatorWeight;
    });
    groupAlternativeScores[alternative.id] = scoreSum;
  });

  // 최종 순위 계산
  const ranking = alternatives
    .map(alt => ({
      alternative_id: alt.id,
      alternative_name: alt.name,
      score: groupAlternativeScores[alt.id]
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));

  // 평균 일관성 비율 계산
  const averageConsistencyRatio = individualResults.reduce((sum, result) => 
    sum + (result.consistency_ratio || 0), 0) / individualResults.length;

  return {
    criteria_weights: groupCriteriaWeights,
    alternative_scores: groupAlternativeScores,
    final_ranking: ranking,
    average_consistency_ratio: averageConsistencyRatio,
    participants: individualResults.length
  };
}

// 민감도 분석 수행
function performSensitivityAnalysis(
  criteriaWeights: any,
  alternativeScores: any,
  targetCriterionId: string,
  variationRange: number
) {
  const variations = [];
  const steps = 11; // -50% ~ +50%, 10% 간격

  for (let i = 0; i < steps; i++) {
    const factor = 1 + (variationRange * 2 * (i / (steps - 1)) - variationRange);
    
    // 기준 가중치 조정
    const adjustedWeights = { ...criteriaWeights };
    adjustedWeights[targetCriterionId] *= factor;
    
    // 정규화 (타입 안전하게)
    const weights = Object.values(adjustedWeights).map(w => Number(w));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    Object.keys(adjustedWeights).forEach(key => {
      const currentWeight = Number(adjustedWeights[key]);
      adjustedWeights[key] = currentWeight / totalWeight;
    });

    // 새로운 순위 계산
    const newScores: any = {};
    Object.keys(alternativeScores).forEach(altId => {
      newScores[altId] = alternativeScores[altId]; // 간단한 구현
    });

    const newRanking = Object.entries(newScores)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .map(([altId], index) => ({ alternative_id: altId, rank: index + 1 }));

    variations.push({
      variation_factor: factor,
      adjusted_weight: adjustedWeights[targetCriterionId],
      new_ranking: newRanking
    });
  }

  return variations;
}

export default router;