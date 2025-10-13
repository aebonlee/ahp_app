/**
 * 대안(Alternatives) 관리 API 라우터
 * AHP 프로젝트의 평가 대안을 생성, 조회, 수정, 삭제하는 기능을 제공
 */

import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { query } from '../database/connection';

const router = express.Router();

/**
 * 프로젝트의 모든 대안 조회
 * GET /api/alternatives/:projectId
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

      // 대안 목록 조회
      const alternativesResult = await query(
        `SELECT 
          id,
          project_id,
          name,
          description,
          cost,
          order_index,
          created_at,
          updated_at
         FROM alternatives 
         WHERE project_id = $1 
         ORDER BY order_index ASC, name ASC`,
        [projectId]
      );

      res.json({
        alternatives: alternativesResult.rows,
        total: alternativesResult.rows.length
      });

    } catch (error) {
      console.error('Alternatives fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch alternatives' });
    }
  }
);

/**
 * 새 대안 생성
 * POST /api/alternatives
 */
router.post('/',
  authenticateToken,
  [
    body('project_id').isInt().withMessage('Valid project ID is required'),
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be non-negative'),
    body('position').optional().isInt({ min: 0 }).withMessage('Position must be non-negative')
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

      const { project_id, name, description, cost, position } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const userRole = (req as AuthenticatedRequest).user.role;

      // 관리자 권한 확인
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only project admins can create alternatives' });
      }

      // 프로젝트 소유권 확인
      const accessResult = await query(
        'SELECT id FROM projects WHERE id = $1 AND admin_id = $2',
        [project_id, userId]
      );

      if (accessResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      // 중복 이름 확인
      const duplicateResult = await query(
        'SELECT id FROM alternatives WHERE project_id = $1 AND name = $2',
        [project_id, name]
      );

      if (duplicateResult.rows.length > 0) {
        return res.status(400).json({ error: 'Alternative with this name already exists' });
      }

      // 다음 위치 계산
      let nextPosition = position || 0;
      if (!position && position !== 0) {
        const positionResult = await query(
          'SELECT MAX(order_index) as max_position FROM alternatives WHERE project_id = $1',
          [project_id]
        );
        nextPosition = (positionResult.rows[0]?.max_position || 0) + 1;
      }

      // 대안 생성
      const result = await query(
        `INSERT INTO alternatives (project_id, name, description, cost, order_index)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          project_id,
          name,
          description || null,
          cost || 0,
          nextPosition
        ]
      );

      // 생성된 대안 조회
      const createdAlternative = await query(
        'SELECT * FROM alternatives WHERE id = $1',
        [result.rows[0].id]
      );

      res.status(201).json({
        message: 'Alternative created successfully',
        alternative: createdAlternative.rows[0]
      });

    } catch (error) {
      console.error('Alternative creation error:', error);
      res.status(500).json({ error: 'Failed to create alternative' });
    }
  }
);

/**
 * 대안 수정
 * PUT /api/alternatives/:id
 */
router.put('/:id',
  authenticateToken,
  [
    param('id').isInt().withMessage('Alternative ID must be an integer'),
    body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be non-negative'),
    body('position').optional().isInt({ min: 0 }).withMessage('Position must be non-negative')
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

      // 대안 존재 및 접근 권한 확인
      const checkResult = await query(
        `SELECT a.*, p.admin_id 
         FROM alternatives a
         JOIN projects p ON a.project_id = p.id
         WHERE a.id = ?`,
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Alternative not found' });
      }

      if (checkResult.rows[0].admin_id !== userId) {
        return res.status(403).json({ error: 'Access denied. Only project admin can modify alternatives' });
      }

      // 중복 이름 확인 (수정하는 경우)
      if (updates.name) {
        const duplicateResult = await query(
          'SELECT id FROM alternatives WHERE project_id = ? AND name = ? AND id != ?',
          [checkResult.rows[0].project_id, updates.name, id]
        );

        if (duplicateResult.rows.length > 0) {
          return res.status(400).json({ error: 'Alternative with this name already exists' });
        }
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
      if (updates.cost !== undefined) {
        updateFields.push(`cost = $${paramIndex++}`);
        updateValues.push(updates.cost);
      }
      if (updates.position !== undefined) {
        updateFields.push(`order_index = $${paramIndex++}`);
        updateValues.push(updates.position);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      // 대안 업데이트
      await query(
        `UPDATE alternatives SET ${updateFields.join(', ')} WHERE id = $${updateValues.length}`,
        updateValues
      );

      // 업데이트된 대안 조회
      const updatedAlternative = await query(
        'SELECT * FROM alternatives WHERE id = $1',
        [id]
      );

      res.json({
        message: 'Alternative updated successfully',
        alternative: updatedAlternative.rows[0]
      });

    } catch (error) {
      console.error('Alternative update error:', error);
      res.status(500).json({ error: 'Failed to update alternative' });
    }
  }
);

/**
 * 대안 삭제
 * DELETE /api/alternatives/:id
 */
router.delete('/:id',
  authenticateToken,
  [
    param('id').isInt().withMessage('Alternative ID must be an integer')
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

      // 대안 존재 및 접근 권한 확인
      const checkResult = await query(
        `SELECT a.*, p.admin_id 
         FROM alternatives a
         JOIN projects p ON a.project_id = p.id
         WHERE a.id = ?`,
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Alternative not found' });
      }

      if (checkResult.rows[0].admin_id !== userId) {
        return res.status(403).json({ error: 'Access denied. Only project admin can delete alternatives' });
      }

      // 대안과 관련된 비교 데이터 확인
      const comparisonsResult = await query(
        'SELECT COUNT(*) as count FROM pairwise_comparisons WHERE element1_id = $1 OR element2_id = $2',
        [id, id]
      );

      if (comparisonsResult.rows[0].count > 0) {
        return res.status(400).json({
          error: 'Cannot delete alternative with existing comparisons. Please delete comparison data first.'
        });
      }

      // 대안 삭제
      await query('DELETE FROM alternatives WHERE id = $1', [id]);

      res.json({
        message: 'Alternative deleted successfully',
        deleted_id: parseInt(id)
      });

    } catch (error) {
      console.error('Alternative deletion error:', error);
      res.status(500).json({ error: 'Failed to delete alternative' });
    }
  }
);

/**
 * 대안 순서 변경
 * PUT /api/alternatives/:id/reorder
 */
router.put('/:id/reorder',
  authenticateToken,
  [
    param('id').isInt().withMessage('Alternative ID must be an integer'),
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

      // 대안 존재 및 접근 권한 확인
      const checkResult = await query(
        `SELECT a.*, p.admin_id 
         FROM alternatives a
         JOIN projects p ON a.project_id = p.id
         WHERE a.id = ?`,
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Alternative not found' });
      }

      if (checkResult.rows[0].admin_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const alternative = checkResult.rows[0];

      // 같은 프로젝트의 다른 대안들 위치 조정
      await query(
        `UPDATE alternatives 
         SET position = CASE 
           WHEN order_index >= $1 AND id != $2 THEN order_index + 1
           ELSE order_index 
         END
         WHERE project_id = $3`,
        [new_position, id, alternative.project_id]
      );

      // 대상 대안 위치 업데이트
      await query(
        'UPDATE alternatives SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [new_position, id]
      );

      res.json({
        message: 'Alternative position updated successfully',
        alternative_id: parseInt(id),
        new_position
      });

    } catch (error) {
      console.error('Alternative reorder error:', error);
      res.status(500).json({ error: 'Failed to reorder alternative' });
    }
  }
);

export default router;