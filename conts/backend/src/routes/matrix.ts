/**
 * 매트릭스 조회 API 라우터
 * 쌍대비교를 위한 비교 항목 라벨 조회
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../database/connection';

const router = express.Router();

/**
 * 비교 항목 라벨 조회
 * GET /api/matrix/:projectId?type=criteria&level=1
 */
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { type = 'criteria', level = '1' } = req.query;
    const evaluatorId = (req as any).user.userId;

    // 프로젝트 접근 권한 확인
    const projectCheck = await query(
      `SELECT pe.* FROM project_evaluators pe 
       WHERE pe.project_id = $1 AND pe.evaluator_id = $2`,
      [projectId, evaluatorId]
    );

    if (projectCheck.rowCount === 0) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    let elements: any[] = [];

    if (type === 'criteria') {
      // 기준 항목 조회
      const result = await query(
        `SELECT id, name, description, level
         FROM criteria 
         WHERE project_id = $1 AND level = $2
         ORDER BY "order", id`,
        [projectId, parseInt(level as string)]
      );
      elements = result.rows;
    } else if (type === 'alternatives') {
      // 대안 항목 조회
      const result = await query(
        `SELECT id, name, description
         FROM alternatives 
         WHERE project_id = $1
         ORDER BY "order", id`,
        [projectId]
      );
      elements = result.rows;
    }

    res.json({
      project_id: projectId,
      type,
      level: type === 'criteria' ? parseInt(level as string) : undefined,
      elements: elements.map(el => ({
        id: el.id,
        name: el.name,
        description: el.description || '',
        level: el.level
      }))
    });

  } catch (error) {
    console.error('Error fetching matrix elements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;