/**
 * AHP 계산 API 라우터
 * 가중치 계산, 글로벌 가중치, 집계 등
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { query } from '../database/connection';
import { AHPCalculatorService } from '../services/ahpCalculator';

const router = express.Router();

/**
 * 로컬 가중치 계산
 * POST /api/compute/weights
 */
router.post('/weights', 
  authenticateToken,
  [
    body('matrix').isArray().withMessage('Matrix must be an array'),
    body('project_id').optional().isInt().withMessage('Project ID must be integer'),
    body('matrix_key').optional().isString().withMessage('Matrix key must be string')
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

      const { matrix, project_id, matrix_key } = req.body;

      // 행렬 유효성 검증
      const validation = AHPCalculatorService.validateMatrix(matrix);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Invalid matrix',
          details: validation.errors
        });
      }

      // AHP 계산 수행
      const result = AHPCalculatorService.calculateAHP(matrix);

      // 결과를 응답 형식에 맞게 변환
      const response = {
        localWeights: result.weights,
        CR: result.consistencyRatio,
        lambdaMax: result.lambdaMax,
        isConsistent: result.consistencyRatio <= 0.1,
        eigenVector: result.weights,
        matrix_key
      };

      // 프로젝트가 지정된 경우 결과 저장
      if (project_id && matrix_key) {
        const evaluatorId = (req as any).user.userId;
        
        await query(
          `INSERT INTO ahp_results 
           (project_id, evaluator_id, matrix_key, weights, consistency_ratio, lambda_max)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (project_id, evaluator_id, matrix_key)
           DO UPDATE SET 
             weights = $4,
             consistency_ratio = $5,
             lambda_max = $6,
             updated_at = CURRENT_TIMESTAMP`,
          [project_id, evaluatorId, matrix_key, JSON.stringify(result.weights), 
           result.consistencyRatio, result.lambdaMax]
        );
      }

      res.json(response);

    } catch (error) {
      console.error('Error computing weights:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 글로벌 가중치 계산
 * POST /api/compute/global
 */
router.post('/global',
  authenticateToken,
  [
    body('project_id').isInt().withMessage('Project ID must be integer'),
    body('criteriaWeights').isObject().withMessage('Criteria weights must be object'),
    body('alternativeWeights').isObject().withMessage('Alternative weights must be object')
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

      const { project_id, criteriaWeights, alternativeWeights } = req.body;
      const evaluatorId = (req as any).user.userId;

      // 프로젝트 접근 권한 확인
      const projectCheck = await query(
        `SELECT pe.* FROM project_evaluators pe 
         WHERE pe.project_id = $1 AND pe.evaluator_id = $2`,
        [project_id, evaluatorId]
      );

      if (projectCheck.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // 글로벌 가중치 계산
      const globalWeights = calculateGlobalWeights(criteriaWeights, alternativeWeights);

      // 결과 저장
      await query(
        `INSERT INTO global_weights 
         (project_id, evaluator_id, criteria_weights, alternative_weights, global_weights)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (project_id, evaluator_id)
         DO UPDATE SET 
           criteria_weights = $3,
           alternative_weights = $4,
           global_weights = $5,
           updated_at = CURRENT_TIMESTAMP`,
        [project_id, evaluatorId, JSON.stringify(criteriaWeights), 
         JSON.stringify(alternativeWeights), JSON.stringify(globalWeights)]
      );

      res.json({
        project_id,
        evaluator_id: evaluatorId,
        criterionGlobal: criteriaWeights,
        alternativeByCriterion: alternativeWeights,
        globalWeights,
        calculatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error computing global weights:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 그룹 가중치 집계 및 최종 순위
 * POST /api/aggregate
 */
router.post('/aggregate',
  authenticateToken,
  [
    body('project_id').isInt().withMessage('Project ID must be integer'),
    body('groupWeights').isObject().withMessage('Group weights must be object')
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

      const { project_id, groupWeights } = req.body;
      const evaluatorId = (req as any).user.userId;

      // 프로젝트 접근 권한 확인 (관리자만)
      const adminCheck = await query(
        `SELECT p.*, u.role FROM projects p 
         JOIN users u ON p.admin_id = u.id
         WHERE p.id = $1 AND (p.admin_id = $2 OR u.role = 'admin')`,
        [project_id, evaluatorId]
      );

      if (adminCheck.rowCount === 0) {
        return res.status(403).json({ error: 'Admin access required for aggregation' });
      }

      // 모든 평가자의 글로벌 가중치 조회
      const globalWeightsResult = await query(
        `SELECT gw.evaluator_id, gw.global_weights, u.name as evaluator_name
         FROM global_weights gw
         JOIN users u ON gw.evaluator_id = u.id
         WHERE gw.project_id = $1`,
        [project_id]
      );

      if (globalWeightsResult.rowCount === 0) {
        return res.status(400).json({ error: 'No global weights found for aggregation' });
      }

      // 그룹 가중치 적용하여 최종 집계
      const finalRanking = aggregateGroupWeights(
        globalWeightsResult.rows,
        groupWeights
      );

      // 대안 이름 매핑
      const alternativesResult = await query(
        `SELECT id, name FROM alternatives WHERE project_id = $1`,
        [project_id]
      );

      const alternativeNames = Object.fromEntries(
        alternativesResult.rows.map(alt => [alt.id.toString(), alt.name])
      );

      const rankedResults = finalRanking.map((item, index) => ({
        alternativeId: item.alternativeId,
        alternativeName: alternativeNames[item.alternativeId] || `Alternative ${item.alternativeId}`,
        score: item.score,
        rank: index + 1
      }));

      // 최종 결과 저장
      await query(
        `INSERT INTO aggregated_results 
         (project_id, group_weights, final_ranking, aggregated_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (project_id)
         DO UPDATE SET 
           group_weights = $2,
           final_ranking = $3,
           aggregated_by = $4,
           updated_at = CURRENT_TIMESTAMP`,
        [project_id, JSON.stringify(groupWeights), 
         JSON.stringify(rankedResults), evaluatorId]
      );

      res.json({
        project_id,
        groupWeights,
        evaluatorContributions: globalWeightsResult.rows.map(row => ({
          evaluatorId: row.evaluator_id,
          evaluatorName: row.evaluator_name,
          weight: groupWeights[row.evaluator_id] || 0
        })),
        finalRanking: rankedResults,
        aggregatedAt: new Date().toISOString(),
        aggregatedBy: evaluatorId
      });

    } catch (error) {
      console.error('Error aggregating results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 글로벌 가중치 계산 헬퍼 함수
 */
function calculateGlobalWeights(criteriaWeights: any, alternativeWeights: any): any {
  const globalWeights: any = {};

  // 각 대안에 대해 글로벌 가중치 계산
  Object.keys(alternativeWeights).forEach(criterionId => {
    const criterionWeight = criteriaWeights[criterionId] || 0;
    const alternatives = alternativeWeights[criterionId];

    Object.keys(alternatives).forEach(alternativeId => {
      if (!globalWeights[alternativeId]) {
        globalWeights[alternativeId] = 0;
      }
      globalWeights[alternativeId] += criterionWeight * alternatives[alternativeId];
    });
  });

  return globalWeights;
}

/**
 * 그룹 가중치 집계 헬퍼 함수
 */
function aggregateGroupWeights(evaluatorResults: any[], groupWeights: any): any[] {
  const aggregatedScores: { [alternativeId: string]: number } = {};

  // 각 평가자의 결과에 그룹 가중치 적용
  evaluatorResults.forEach(result => {
    const evaluatorWeight = groupWeights[result.evaluator_id] || 0;
    const globalWeights = JSON.parse(result.global_weights);

    Object.keys(globalWeights).forEach(alternativeId => {
      if (!aggregatedScores[alternativeId]) {
        aggregatedScores[alternativeId] = 0;
      }
      aggregatedScores[alternativeId] += evaluatorWeight * globalWeights[alternativeId];
    });
  });

  // 점수 순으로 정렬하여 순위 생성
  return Object.entries(aggregatedScores)
    .map(([alternativeId, score]) => ({
      alternativeId,
      score
    }))
    .sort((a, b) => b.score - a.score);
}

export default router;