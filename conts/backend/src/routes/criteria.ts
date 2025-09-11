/**
 * 기준(Criteria) 관리 API 라우터
 * AHP 프로젝트의 평가 기준을 생성, 조회, 수정, 삭제하는 기능을 제공
 */

import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { query } from '../database/connection';

const router = express.Router();

/**
 * 프로젝트의 모든 기준 조회
 * GET /api/criteria/:projectId
 */
router.get('/:projectId', 
  authenticateToken,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { projectId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const userRole = (req as AuthenticatedRequest).user.role;

      // 프로젝트 접근 권한 확인
      let accessQuery = 'SELECT id FROM projects WHERE id = $1';
      let accessParams = [projectId];

      if (userRole === 'evaluator') {
        accessQuery += ` AND (admin_id = $2 OR EXISTS (
          SELECT 1 FROM project_evaluators pe WHERE pe.project_id = $3 AND pe.evaluator_id = $4
        ))`;
        accessParams = [projectId, userId, projectId, userId];
      } else {
        accessQuery += ' AND admin_id = $2';
        accessParams.push(userId);
      }

      const accessResult = await query(accessQuery, accessParams);
      if (accessResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      // 기준 목록 조회 (계층 구조 포함)
      const criteriaResult = await query(
        `SELECT 
          id,
          project_id,
          name,
          description,
          parent_id,
          level,
          weight,
          order_index,
          created_at,
          updated_at
         FROM criteria 
         WHERE project_id = $1 
         ORDER BY level ASC, order_index ASC, name ASC`,
        [projectId]
      );

      res.json({
        criteria: criteriaResult.rows,
        total: criteriaResult.rows.length
      });

    } catch (error) {
      console.error('Criteria fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch criteria' });
    }
  }
);

/**
 * 새 기준 생성
 * POST /api/criteria
 */
router.post('/',
  authenticateToken,
  [
    body('project_id').isInt().withMessage('Valid project ID is required'),
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('parent_id').optional().custom((value) => {
      if (value === null || value === undefined || value === '') return true;
      if (!Number.isInteger(Number(value))) throw new Error('Parent ID must be an integer or null');
      return true;
    }),
    body('level').optional().isInt({ min: 1, max: 5 }).withMessage('Level must be between 1 and 5'),
    body('order_index').optional().isInt({ min: 0 }).withMessage('Order index must be non-negative')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { project_id, name, description, parent_id, level, order_index } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const userRole = (req as AuthenticatedRequest).user.role;

      // 관리자 권한 확인
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only project admins can create criteria' });
      }

      // 프로젝트 소유권 확인
      const accessResult = await query(
        'SELECT id FROM projects WHERE id = $1 AND admin_id = $2',
        [project_id, userId]
      );

      if (accessResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      // 부모 기준 유효성 검사
      if (parent_id) {
        const parentResult = await query(
          'SELECT level FROM criteria WHERE id = $1 AND project_id = $2',
          [parent_id, project_id]
        );
        if (parentResult.rows.length === 0) {
          return res.status(404).json({ error: 'Parent criterion not found' });
        }
        if (parentResult.rows[0].level >= 5) {
          return res.status(400).json({ error: 'Cannot create more than 5 levels of criteria hierarchy' });
        }
      }

      // 다음 위치 계산
      let nextPosition = order_index || 0;
      if (!order_index && order_index !== 0) {
        const positionResult = await query(
          'SELECT MAX(order_index) as max_position FROM criteria WHERE project_id = $1 AND level = $2',
          [project_id, level || 1]
        );
        nextPosition = (positionResult.rows[0]?.max_position || 0) + 1;
      }

      // 기준 생성
      const result = await query(
        `INSERT INTO criteria (project_id, name, description, parent_id, level, weight, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          project_id,
          name,
          description || null,
          parent_id || null,
          level || 1,
          0, // 초기 가중치
          nextPosition
        ]
      );

      // 생성된 기준 조회
      const createdCriterion = await query(
        'SELECT * FROM criteria WHERE id = $1',
        [result.rows[0].id]
      );

      res.status(201).json({
        message: 'Criterion created successfully',
        criterion: createdCriterion.rows[0]
      });

    } catch (error) {
      console.error('Criterion creation error:', error);
      res.status(500).json({ error: 'Failed to create criterion' });
    }
  }
);

/**
 * 기준 수정
 * PUT /api/criteria/:id
 */
router.put('/:id',
  authenticateToken,
  [
    param('id').isInt().withMessage('Criterion ID must be an integer'),
    body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('weight').optional().isFloat({ min: 0, max: 1 }).withMessage('Weight must be between 0 and 1'),
    body('order_index').optional().isInt({ min: 0 }).withMessage('Order index must be non-negative')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const updates = req.body;

      // 기준 존재 및 접근 권한 확인
      const checkResult = await query(
        `SELECT c.*, p.admin_id 
         FROM criteria c
         JOIN projects p ON c.project_id = p.id
         WHERE c.id = $1`,
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Criterion not found' });
      }

      if (checkResult.rows[0].admin_id !== userId) {
        return res.status(403).json({ error: 'Access denied. Only project admin can modify criteria' });
      }

      // 업데이트 필드 구성
      const updateFields = [];
      const updateValues = [];

      let paramIndex = 1;
      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(updates.name);
      }
      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(updates.description);
      }
      if (updates.weight !== undefined) {
        updateFields.push(`weight = $${paramIndex++}`);
        updateValues.push(updates.weight);
      }
      if (updates.order_index !== undefined) {
        updateFields.push(`order_index = $${paramIndex++}`);
        updateValues.push(updates.order_index);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      // 기준 업데이트
      await query(
        `UPDATE criteria SET ${updateFields.join(', ')} WHERE id = $${updateValues.length}`,
        updateValues
      );

      // 업데이트된 기준 조회
      const updatedCriterion = await query(
        'SELECT * FROM criteria WHERE id = $1',
        [id]
      );

      res.json({
        message: 'Criterion updated successfully',
        criterion: updatedCriterion.rows[0]
      });

    } catch (error) {
      console.error('Criterion update error:', error);
      res.status(500).json({ error: 'Failed to update criterion' });
    }
  }
);

/**
 * 기준 삭제
 * DELETE /api/criteria/:id
 */
router.delete('/:id',
  authenticateToken,
  [
    param('id').isInt().withMessage('Criterion ID must be an integer')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      // 기준 존재 및 접근 권한 확인
      const checkResult = await query(
        `SELECT c.*, p.admin_id 
         FROM criteria c
         JOIN projects p ON c.project_id = p.id
         WHERE c.id = $1`,
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Criterion not found' });
      }

      if (checkResult.rows[0].admin_id !== userId) {
        return res.status(403).json({ error: 'Access denied. Only project admin can delete criteria' });
      }

      // 하위 기준 확인
      const childrenResult = await query(
        'SELECT COUNT(*) as count FROM criteria WHERE parent_id = $1',
        [id]
      );

      if (childrenResult.rows[0].count > 0) {
        return res.status(400).json({
          error: 'Cannot delete criterion with sub-criteria. Please delete sub-criteria first.'
        });
      }

      // 기준과 관련된 비교 데이터 확인
      const comparisonsResult = await query(
        'SELECT COUNT(*) as count FROM pairwise_comparisons WHERE element1_id = $1 OR element2_id = $2 OR criterion_id = $3',
        [id, id, id]
      );

      if (comparisonsResult.rows[0].count > 0) {
        return res.status(400).json({
          error: 'Cannot delete criterion with existing comparisons. Please delete comparison data first.'
        });
      }

      // 기준 삭제
      await query('DELETE FROM criteria WHERE id = $1', [id]);

      res.json({
        message: 'Criterion deleted successfully',
        deleted_id: parseInt(id)
      });

    } catch (error) {
      console.error('Criterion deletion error:', error);
      res.status(500).json({ error: 'Failed to delete criterion' });
    }
  }
);

/**
 * 기준 순서 변경
 * PUT /api/criteria/:id/reorder
 */
router.put('/:id/reorder',
  authenticateToken,
  [
    param('id').isInt().withMessage('Criterion ID must be an integer'),
    body('new_position').isInt({ min: 0 }).withMessage('New position must be a non-negative integer')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { new_position } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      // 기준 존재 및 접근 권한 확인
      const checkResult = await query(
        `SELECT c.*, p.admin_id 
         FROM criteria c
         JOIN projects p ON c.project_id = p.id
         WHERE c.id = $1`,
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Criterion not found' });
      }

      if (checkResult.rows[0].admin_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const criterion = checkResult.rows[0];

      // 같은 레벨의 다른 기준들 위치 조정
      await query(
        `UPDATE criteria 
         SET position = CASE 
           WHEN order_index >= $1 AND id != $2 THEN order_index + 1
           ELSE order_index 
         END
         WHERE project_id = $3 AND level = $4 AND parent_id ${criterion.parent_id ? '= $5' : 'IS NULL'}`,
        criterion.parent_id 
          ? [new_position, id, criterion.project_id, criterion.level, criterion.parent_id]
          : [new_position, id, criterion.project_id, criterion.level]
      );

      // 대상 기준 위치 업데이트
      await query(
        'UPDATE criteria SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [new_position, id]
      );

      res.json({
        message: 'Criterion position updated successfully',
        criterion_id: parseInt(id),
        new_position
      });

    } catch (error) {
      console.error('Criterion reorder error:', error);
      res.status(500).json({ error: 'Failed to reorder criterion' });
    }
  }
);

export default router;