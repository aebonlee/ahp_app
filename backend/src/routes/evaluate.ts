/**
 * 평가 관련 API 라우터
 * 직접입력, 쌍대비교, AHP 계산 등을 처리
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { query } from '../database/connection';
import { AHPCalculatorService } from '../services/ahpCalculator';

const router = express.Router();

/**
 * 직접입력 평가 저장
 * POST /api/evaluate/direct
 */
router.post('/direct', 
  authenticateToken,
  [
    body('project_id').isInt().withMessage('Project ID must be an integer'),
    body('target_key').isString().isLength({min: 1}).withMessage('Target key is required'),
    body('value').isFloat({min: 0.001}).withMessage('Value must be positive'),
    body('is_benefit').isBoolean().withMessage('is_benefit must be boolean')
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

      const { project_id, target_key, value, is_benefit } = req.body;
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

      // 직접입력 데이터 저장 (UPSERT)
      const result = await query(
        `INSERT INTO direct_entries (project_id, evaluator_id, target_key, value, is_benefit)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (project_id, evaluator_id, target_key)
         DO UPDATE SET value = $4, is_benefit = $5, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [project_id, evaluator_id, target_key, value, is_benefit]
      );

      // 진행상황 업데이트
      await updateEvaluatorProgress(project_id, evaluator_id);

      res.status(201).json({
        message: 'Direct evaluation saved successfully',
        entry: result.rows[0]
      });

    } catch (error) {
      console.error('Error saving direct evaluation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 직접입력 평가 조회
 * GET /api/evaluate/direct/:projectId
 */
router.get('/direct/:projectId',
  authenticateToken,
  async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const evaluatorId = (req as any).user.userId;

      const entries = await query(
        `SELECT de.*, c.name as criterion_name, a.name as alternative_name
         FROM direct_entries de
         LEFT JOIN criteria c ON de.target_key LIKE 'criterion:' || c.id || '%'
         LEFT JOIN alternatives a ON de.target_key LIKE 'alternative:' || a.id || '%'
         WHERE de.project_id = $1 AND de.evaluator_id = $2
         ORDER BY de.created_at DESC`,
        [projectId, evaluatorId]
      );

      res.json({
        entries: entries.rows
      });

    } catch (error) {
      console.error('Error fetching direct evaluations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 쌍대비교 평가 저장 (개선된 버전)
 * POST /api/evaluate/pairwise
 */
router.post('/pairwise',
  authenticateToken,
  [
    body('project_id').isInt().withMessage('Project ID must be an integer'),
    body('matrix_key').isString().withMessage('Matrix key is required'),
    body('i_index').isInt({min: 0}).withMessage('i_index must be non-negative integer'),
    body('j_index').isInt({min: 0}).withMessage('j_index must be non-negative integer'),
    body('value').isFloat({min: 0.111, max: 9}).withMessage('Value must be between 1/9 and 9')
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

      const { project_id, matrix_key, i_index, j_index, value } = req.body;
      const evaluator_id = (req as any).user.userId;

      // 대각선 요소는 항상 1
      if (i_index === j_index) {
        return res.status(400).json({ error: 'Diagonal elements must be 1' });
      }

      // 프로젝트 접근 권한 확인
      const projectCheck = await query(
        `SELECT pe.* FROM project_evaluators pe 
         WHERE pe.project_id = $1 AND pe.evaluator_id = $2`,
        [project_id, evaluator_id]
      );

      if (projectCheck.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // 쌍대비교 저장 (상삼각 행렬만 저장)
      const [i, j] = i_index < j_index ? [i_index, j_index] : [j_index, i_index];
      const adjustedValue = i_index < j_index ? value : 1 / value;

      await query(
        `INSERT INTO pairwise_comparisons 
         (project_id, evaluator_id, matrix_key, i_index, j_index, value)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (project_id, evaluator_id, matrix_key, i_index, j_index)
         DO UPDATE SET value = $6, updated_at = CURRENT_TIMESTAMP`,
        [project_id, evaluator_id, matrix_key, i, j, adjustedValue]
      );

      // 진행상황 업데이트
      await updateEvaluatorProgress(project_id, evaluator_id);

      res.status(201).json({
        message: 'Pairwise comparison saved successfully'
      });

    } catch (error) {
      console.error('Error saving pairwise comparison:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 쌍대비교 행렬 조회
 * GET /api/evaluate/pairwise/:projectId/:matrixKey
 */
router.get('/pairwise/:projectId/:matrixKey',
  authenticateToken,
  async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const matrixKey = req.params.matrixKey;
      const evaluatorId = (req as any).user.userId;

      // 저장된 비교값 조회
      const comparisons = await query(
        `SELECT i_index, j_index, value
         FROM pairwise_comparisons
         WHERE project_id = $1 AND evaluator_id = $2 AND matrix_key = $3`,
        [projectId, evaluatorId, matrixKey]
      );

      // 행렬 크기 결정
      const maxIndex = Math.max(
        ...comparisons.rows.map(row => Math.max(row.i_index, row.j_index)),
        0
      );
      const size = maxIndex + 1;

      // 완전한 행렬 구성
      const matrix: number[][] = Array(size).fill(null).map(() => Array(size).fill(1));
      
      comparisons.rows.forEach(row => {
        const { i_index, j_index, value } = row;
        matrix[i_index][j_index] = value;
        matrix[j_index][i_index] = 1 / value; // 역수 관계
      });

      res.json({
        matrix_key: matrixKey,
        size,
        matrix,
        comparisons: comparisons.rows
      });

    } catch (error) {
      console.error('Error fetching pairwise matrix:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * AHP 계산 수행
 * POST /api/calculate/ahp
 */
router.post('/calculate/ahp',
  authenticateToken,
  [
    body('matrix').isArray().withMessage('Matrix must be an array'),
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

      const { matrix, matrix_key } = req.body;

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

      // 일관성이 좋지 않은 경우 개선 제안 생성
      let suggestions = [];
      if (result.consistencyRatio > 0.1) {
        suggestions = AHPCalculatorService.generateInconsistencyAdvice(
          matrix, 
          result.weights, 
          3
        );
      }

      res.json({
        ...result,
        suggestions,
        matrix_key
      });

    } catch (error) {
      console.error('Error calculating AHP:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 직접입력 값 정규화
 * POST /api/calculate/normalize
 */
router.post('/calculate/normalize',
  authenticateToken,
  [
    body('values').isArray().withMessage('Values must be an array'),
    body('is_benefit').isBoolean().withMessage('is_benefit must be boolean')
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

      const { values, is_benefit } = req.body;

      // 값 유효성 검증
      if (!values.every((v: any) => typeof v === 'number' && v > 0)) {
        return res.status(400).json({
          error: 'All values must be positive numbers'
        });
      }

      const normalizedWeights = AHPCalculatorService.normalizeDirectInput(values, is_benefit);

      res.json({
        original_values: values,
        is_benefit,
        normalized_weights: normalizedWeights,
        sum_check: normalizedWeights.reduce((sum, w) => sum + w, 0)
      });

    } catch (error) {
      console.error('Error normalizing values:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * 평가자 진행상황 업데이트 헬퍼 함수
 */
async function updateEvaluatorProgress(projectId: number, evaluatorId: number) {
  try {
    // 총 평가 작업 수 계산 (기준 수 + 대안 수)
    const taskCount = await query(
      `SELECT 
         (SELECT COUNT(*) FROM criteria WHERE project_id = $1) +
         (SELECT COUNT(*) FROM alternatives WHERE project_id = $1) as total_tasks`,
      [projectId]
    );

    // 완료된 작업 수 계산
    const completedCount = await query(
      `SELECT 
         (SELECT COUNT(DISTINCT target_key) FROM direct_entries 
          WHERE project_id = $1 AND evaluator_id = $2) +
         (SELECT COUNT(DISTINCT matrix_key) FROM pairwise_comparisons 
          WHERE project_id = $1 AND evaluator_id = $2) as completed_tasks`,
      [projectId, evaluatorId]
    );

    const totalTasks = taskCount.rows[0].total_tasks || 0;
    const completedTasks = completedCount.rows[0].completed_tasks || 0;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // 진행상황 업데이트
    await query(
      `INSERT INTO evaluator_progress 
       (project_id, evaluator_id, total_tasks, completed_tasks, completion_rate, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (project_id, evaluator_id)
       DO UPDATE SET 
         total_tasks = $3,
         completed_tasks = $4,
         completion_rate = $5,
         is_completed = $6,
         completed_at = CASE WHEN $6 THEN CURRENT_TIMESTAMP ELSE completed_at END,
         updated_at = CURRENT_TIMESTAMP`,
      [projectId, evaluatorId, totalTasks, completedTasks, completionRate, completionRate >= 100]
    );

  } catch (error) {
    console.error('Error updating evaluator progress:', error);
  }
}

export default router;