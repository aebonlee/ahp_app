import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { query } from '../database/connection';

const router = express.Router();

router.post('/',
  authenticateToken,
  [
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required'),
    body('description').optional().isLength({ max: 1000 }),
    body('objective').optional().isLength({ max: 500 }),
    body('evaluationMode').optional().isIn(['practical', 'theoretical', 'direct_input', 'pairwise']).withMessage('Invalid evaluation mode')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, objective, evaluationMode } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      const result = await query(
        `INSERT INTO projects (title, name, description, objective, admin_id, status, evaluation_mode, workflow_stage)
         VALUES ($1, $1, $2, $3, $4, 'draft', $5, 'creating')
         RETURNING *`,
        [title, description || null, objective || null, userId, evaluationMode || 'practical']
      );

      res.status(201).json({ project: result.rows[0] });
    } catch (error) {
      console.error('Project creation error:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
);

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const userRole = (req as AuthenticatedRequest).user.role;

    let queryText = `
      SELECT p.*, 
             COUNT(DISTINCT pe.evaluator_id) as evaluator_count,
             u.first_name || ' ' || u.last_name as admin_name
      FROM projects p
      LEFT JOIN project_evaluators pe ON p.id = pe.project_id
      LEFT JOIN users u ON p.admin_id = u.id
    `;
    let params: any[] = [];

    // Filter out old sample projects and deleted projects
    let whereConditions = [
      `p.title NOT IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택')`,
      `(p.status IS NULL OR p.status != 'deleted')`  // 삭제된 프로젝트 제외
    ];

    if (userRole === 'evaluator') {
      whereConditions.push(`(p.admin_id = $1 OR pe.evaluator_id = $1)`);
      params = [userId];
    } else {
      whereConditions.push(`p.admin_id = $1`);
      params = [userId];
    }

    queryText += ` WHERE ` + whereConditions.join(' AND ');

    queryText += ` GROUP BY p.id, u.first_name, u.last_name ORDER BY p.created_at DESC`;

    const result = await query(queryText, params);

    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const userRole = (req as AuthenticatedRequest).user.role;

    let queryText = `
      SELECT p.*, u.first_name || ' ' || u.last_name as admin_name
      FROM projects p
      LEFT JOIN users u ON p.admin_id = u.id
      WHERE p.id = $1 AND p.title NOT IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택')
    `;
    let params = [id];

    if (userRole === 'evaluator') {
      queryText += ` AND (p.admin_id = $2 OR EXISTS (
        SELECT 1 FROM project_evaluators pe WHERE pe.project_id = p.id AND pe.evaluator_id = $2
      ))`;
      params.push(userId);
    } else {
      queryText += ` AND p.admin_id = $2`;
      params.push(userId);
    }

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project: result.rows[0] });
  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.put('/:id',
  authenticateToken,
  [
    body('title').optional().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().isLength({ max: 1000 }),
    body('objective').optional().isLength({ max: 500 }),
    body('status').optional().isIn(['draft', 'active', 'completed']),
    body('evaluation_mode').optional().isIn(['practical', 'theoretical', 'direct_input', 'pairwise']),
    body('workflow_stage').optional().isIn(['creating', 'waiting', 'evaluating', 'completed'])
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const updates = req.body;

      const checkResult = await query(
        'SELECT * FROM projects WHERE id = $1 AND admin_id = $2',
        [id, userId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 3}`)
        .join(', ');

      const values = [id, userId, ...Object.values(updates)];

      const result = await query(
        `UPDATE projects SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND admin_id = $2
         RETURNING *`,
        values
      );

      res.json({ project: result.rows[0] });
    } catch (error) {
      console.error('Project update error:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  }
);

// 프로젝트 삭제 (관리자는 하드 삭제, 일반 사용자는 소프트 삭제)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const userRole = (req as AuthenticatedRequest).user.role;

    // 관리자인 경우 하드 삭제
    if (userRole === 'admin') {
      console.log(`🗑️ 관리자 하드 삭제: 프로젝트 ${id}`);
      
      const result = await query(
        'DELETE FROM projects WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({ 
        message: 'Project permanently deleted',
        project: result.rows[0]
      });
    } else {
      // 일반 사용자는 소프트 삭제
      const result = await query(
        `UPDATE projects 
         SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND admin_id = $2 AND (status IS NULL OR status != 'deleted')
         RETURNING *`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found, access denied, or already deleted' });
      }

      res.json({ 
        message: 'Project moved to trash successfully',
        project: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// 휴지통 프로젝트 목록 조회
router.get('/trash/list', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const result = await query(
      `SELECT p.*, 
              u.first_name || ' ' || u.last_name as admin_name,
              COUNT(DISTINCT c.id) as criteria_count,
              COUNT(DISTINCT a.id) as alternative_count
       FROM projects p
       LEFT JOIN users u ON p.admin_id = u.id
       LEFT JOIN criteria c ON p.id = c.project_id
       LEFT JOIN alternatives a ON p.id = a.project_id
       WHERE p.admin_id = $1 AND p.status = 'deleted'
       GROUP BY p.id, u.first_name, u.last_name
       ORDER BY p.deleted_at DESC`,
      [userId]
    );

    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Trash fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trashed projects' });
  }
});

// 프로젝트 복원
router.put('/:id/restore', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    const result = await query(
      `UPDATE projects 
       SET status = 'active', deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND admin_id = $2 AND status = 'deleted'
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found in trash or access denied' });
    }

    res.json({ 
      message: 'Project restored successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Project restore error:', error);
    res.status(500).json({ error: 'Failed to restore project' });
  }
});

// 영구 삭제
router.delete('/:id/permanent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    // 트랜잭션으로 관련 데이터 모두 삭제
    await query('BEGIN');
    
    try {
      // 권한 확인
      const checkResult = await query(
        'SELECT * FROM projects WHERE id = $1 AND admin_id = $2 AND status = \'deleted\'',
        [id, userId]
      );

      if (checkResult.rows.length === 0) {
        await query('ROLLBACK');
        return res.status(404).json({ error: 'Project not found in trash or access denied' });
      }

      // 관련 데이터 삭제 (CASCADE 설정이 없는 경우)
      // 1. 평가자 관련 데이터 삭제
      await query('DELETE FROM evaluator_progress WHERE project_id = $1', [id]);
      await query('DELETE FROM evaluator_weights WHERE project_id = $1', [id]);
      await query('DELETE FROM workshop_participants WHERE workshop_session_id IN (SELECT id FROM workshop_sessions WHERE project_id = $1)', [id]);
      await query('DELETE FROM workshop_sessions WHERE project_id = $1', [id]);
      await query('DELETE FROM project_evaluators WHERE project_id = $1', [id]);
      
      // 2. 평가 관련 데이터 삭제
      await query('DELETE FROM pairwise_comparisons WHERE project_id = $1', [id]);
      await query('DELETE FROM evaluations WHERE project_id = $1', [id]);
      await query('DELETE FROM comparisons WHERE project_id = $1', [id]);
      
      // 3. 프로젝트 구조 데이터 삭제
      await query('DELETE FROM alternatives WHERE project_id = $1', [id]);
      await query('DELETE FROM criteria WHERE project_id = $1', [id]);
      
      // 4. 프로젝트 영구 삭제
      await query('DELETE FROM projects WHERE id = $1', [id]);
      
      await query('COMMIT');
      
      res.json({ message: 'Project permanently deleted' });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Permanent deletion error:', error);
    res.status(500).json({ error: 'Failed to permanently delete project' });
  }
});

// 워크플로우 상태 변경 API
router.patch('/:id/workflow-stage',
  authenticateToken,
  [
    body('stage').isIn(['creating', 'waiting', 'evaluating', 'completed']).withMessage('Invalid workflow stage'),
    body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { stage, reason } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      // 권한 확인
      const checkResult = await query(
        'SELECT * FROM projects WHERE id = $1 AND admin_id = $2',
        [id, userId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      // 워크플로우 상태 업데이트
      const result = await query(
        `UPDATE projects SET workflow_stage = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND admin_id = $3
         RETURNING *`,
        [stage, id, userId]
      );

      // 변경 이력에 이유 추가 (별도 쿼리로 업데이트)
      if (reason) {
        await query(
          `UPDATE workflow_stage_history 
           SET change_reason = $1 
           WHERE project_id = $2 AND new_stage = $3 AND changed_by = $4
           ORDER BY created_at DESC LIMIT 1`,
          [reason, id, stage, userId]
        );
      }

      res.json({ 
        project: result.rows[0],
        message: `워크플로우 상태가 '${stage}'로 변경되었습니다.`
      });
    } catch (error) {
      console.error('Workflow stage update error:', error);
      res.status(500).json({ error: 'Failed to update workflow stage' });
    }
  }
);

// 평가 방식 변경 API
router.patch('/:id/evaluation-mode',
  authenticateToken,
  [
    body('mode').isIn(['practical', 'theoretical', 'direct_input']).withMessage('Invalid evaluation mode'),
    body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { mode, reason } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      // 권한 확인
      const checkResult = await query(
        'SELECT * FROM projects WHERE id = $1 AND admin_id = $2',
        [id, userId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      // 평가 방식 업데이트
      const result = await query(
        `UPDATE projects SET evaluation_mode = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND admin_id = $3
         RETURNING *`,
        [mode, id, userId]
      );

      // 변경 이력에 이유 추가
      if (reason) {
        await query(
          `UPDATE evaluation_mode_history 
           SET change_reason = $1 
           WHERE project_id = $2 AND new_mode = $3 AND changed_by = $4
           ORDER BY created_at DESC LIMIT 1`,
          [reason, id, mode, userId]
        );
      }

      res.json({ 
        project: result.rows[0],
        message: `평가 방식이 '${mode}'로 변경되었습니다.`
      });
    } catch (error) {
      console.error('Evaluation mode update error:', error);
      res.status(500).json({ error: 'Failed to update evaluation mode' });
    }
  }
);

// 프로젝트 상태 요약 API
router.get('/:id/status-summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const userRole = (req as AuthenticatedRequest).user.role;

    let queryText = `
      SELECT * FROM project_status_summary 
      WHERE id = $1
    `;
    let params = [id];

    // 권한 확인 추가
    if (userRole === 'evaluator') {
      queryText += ` AND (admin_name = (SELECT first_name || ' ' || last_name FROM users WHERE id = $2)
                       OR EXISTS (SELECT 1 FROM project_evaluators pe WHERE pe.project_id = $1 AND pe.evaluator_id = $2))`;
      params.push(userId);
    } else {
      queryText += ` AND id IN (SELECT id FROM projects WHERE admin_id = $2)`;
      params.push(userId);
    }

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    res.json({ statusSummary: result.rows[0] });
  } catch (error) {
    console.error('Project status summary error:', error);
    res.status(500).json({ error: 'Failed to fetch project status summary' });
  }
});

// 프로젝트 진행률 API
router.get('/:id/progress', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const userRole = (req as AuthenticatedRequest).user.role;

    let queryText = `
      SELECT * FROM project_progress 
      WHERE project_id = $1
    `;
    let params = [id];

    // 권한 확인
    if (userRole === 'evaluator') {
      queryText += ` AND project_id IN (
        SELECT p.id FROM projects p 
        LEFT JOIN project_evaluators pe ON p.id = pe.project_id
        WHERE p.id = $1 AND (p.admin_id = $2 OR pe.evaluator_id = $2)
      )`;
      params.push(userId);
    } else {
      queryText += ` AND project_id IN (SELECT id FROM projects WHERE admin_id = $2)`;
      params.push(userId);
    }

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    res.json({ progress: result.rows[0] });
  } catch (error) {
    console.error('Project progress error:', error);
    res.status(500).json({ error: 'Failed to fetch project progress' });
  }
});

// 휴지통 프로젝트 조회
router.get('/trash', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const result = await query(
      `SELECT p.*, u.first_name || ' ' || u.last_name as admin_name
       FROM projects p
       LEFT JOIN users u ON p.admin_id = u.id
       WHERE p.admin_id = $1 AND p.status = 'deleted'
       ORDER BY p.deleted_at DESC`,
      [userId]
    );

    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Trashed projects fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trashed projects' });
  }
});

// 프로젝트 삭제 (휴지통으로 이동)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    // 권한 확인
    const checkResult = await query(
      'SELECT * FROM projects WHERE id = $1 AND admin_id = $2 AND status != $3',
      [id, userId, 'deleted']
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    // Soft delete - 상태를 deleted로 변경하고 삭제 시간 기록
    const result = await query(
      `UPDATE projects 
       SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND admin_id = $2
       RETURNING *`,
      [id, userId]
    );

    res.json({ 
      message: 'Project moved to trash successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// 휴지통에서 복원
router.put('/:id/restore', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    // 권한 확인 (삭제된 프로젝트만)
    const checkResult = await query(
      'SELECT * FROM projects WHERE id = $1 AND admin_id = $2 AND status = $3',
      [id, userId, 'deleted']
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Deleted project not found or access denied' });
    }

    // 복원 - 상태를 active로 변경하고 deleted_at 클리어
    const result = await query(
      `UPDATE projects 
       SET status = 'active', deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND admin_id = $2
       RETURNING *`,
      [id, userId]
    );

    res.json({ 
      message: 'Project restored successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Project restore error:', error);
    res.status(500).json({ error: 'Failed to restore project' });
  }
});

// 영구 삭제
router.delete('/:id/permanent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    // 권한 확인 (삭제된 프로젝트만)
    const checkResult = await query(
      'SELECT * FROM projects WHERE id = $1 AND admin_id = $2 AND status = $3',
      [id, userId, 'deleted']
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Deleted project not found or access denied' });
    }

    // 관련 데이터 모두 삭제 (트랜잭션 사용)
    await query('BEGIN');
    
    try {
      // 평가 데이터 삭제
      await query('DELETE FROM comparisons WHERE project_id = $1', [id]);
      await query('DELETE FROM evaluations WHERE project_id = $1', [id]);
      
      // 대안 삭제
      await query('DELETE FROM alternatives WHERE project_id = $1', [id]);
      
      // 기준 삭제
      await query('DELETE FROM criteria WHERE project_id = $1', [id]);
      
      // 평가자 연결 삭제
      await query('DELETE FROM project_evaluators WHERE project_id = $1', [id]);
      
      // 프로젝트 삭제
      await query('DELETE FROM projects WHERE id = $1', [id]);
      
      await query('COMMIT');
      
      res.json({ message: 'Project permanently deleted successfully' });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Permanent project deletion error:', error);
    res.status(500).json({ error: 'Failed to permanently delete project' });
  }
});

// 프로젝트의 기준 목록 조회 (프록시 라우트)
router.get('/:id/criteria', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const userRole = (req as AuthenticatedRequest).user.role;

    // 프로젝트 접근 권한 확인
    let accessQuery = 'SELECT id FROM projects WHERE id = $1';
    let accessParams = [id];

    if (userRole === 'evaluator') {
      accessQuery += ` AND (admin_id = $2 OR EXISTS (
        SELECT 1 FROM project_evaluators pe WHERE pe.project_id = $3 AND pe.evaluator_id = $4
      ))`;
      accessParams = [id, userId, id, userId];
    } else {
      accessQuery += ' AND admin_id = $2';
      accessParams.push(userId);
    }

    const accessResult = await query(accessQuery, accessParams);
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    // 기준 목록 조회
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
      [id]
    );

    res.json({
      criteria: criteriaResult.rows,
      total: criteriaResult.rows.length
    });

  } catch (error) {
    console.error('Criteria fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch criteria' });
  }
});

// 프로젝트의 대안 목록 조회 (프록시 라우트)
router.get('/:id/alternatives', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const userRole = (req as AuthenticatedRequest).user.role;

    // 프로젝트 접근 권한 확인
    let accessQuery = 'SELECT id FROM projects WHERE id = $1';
    let accessParams = [id];

    if (userRole === 'evaluator') {
      accessQuery += ` AND (admin_id = $2 OR EXISTS (
        SELECT 1 FROM project_evaluators pe WHERE pe.project_id = $3 AND pe.evaluator_id = $4
      ))`;
      accessParams = [id, userId, id, userId];
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
      [id]
    );

    res.json({
      alternatives: alternativesResult.rows,
      total: alternativesResult.rows.length
    });

  } catch (error) {
    console.error('Alternatives fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch alternatives' });
  }
});

// 프로젝트의 평가자 목록 조회 (프록시 라우트)
router.get('/:id/evaluators', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const userRole = (req as AuthenticatedRequest).user.role;

    // 프로젝트 접근 권한 확인
    let accessQuery = 'SELECT id FROM projects WHERE id = $1';
    let accessParams = [id];

    if (userRole === 'evaluator') {
      accessQuery += ` AND (admin_id = $2 OR EXISTS (
        SELECT 1 FROM project_evaluators pe WHERE pe.project_id = $3 AND pe.evaluator_id = $4
      ))`;
      accessParams = [id, userId, id, userId];
    } else {
      accessQuery += ' AND admin_id = $2';
      accessParams.push(userId);
    }

    const accessResult = await query(accessQuery, accessParams);
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    // 평가자 목록 조회
    const evaluatorsResult = await query(
      `SELECT 
        u.id,
        u.first_name || ' ' || u.last_name as name,
        u.email,
        pe.created_at as assigned_at
       FROM project_evaluators pe
       JOIN users u ON pe.evaluator_id = u.id
       WHERE pe.project_id = $1
       ORDER BY pe.created_at ASC`,
      [id]
    );

    res.json({
      evaluators: evaluatorsResult.rows,
      total: evaluatorsResult.rows.length
    });

  } catch (error) {
    console.error('Evaluators fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch evaluators' });
  }
});

export default router;