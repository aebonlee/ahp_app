/**
 * 평가자 관리 API 라우터
 * 평가자 배정, 가중치 설정, 진행상황 추적 등을 처리
 */

import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth';
import { query } from '../database/connection';
import crypto from 'crypto';

const router = express.Router();

/**
 * 데이터베이스 에러를 적절히 처리하는 헬퍼 함수
 */
const handleDatabaseError = (error: unknown, res: express.Response, context: string) => {
  console.error(`Error ${context}:`, error);
  
  // 데이터베이스 구성 에러인 경우 구체적인 메시지 반환
  if (error instanceof Error && error.message === 'Database not configured') {
    return res.status(500).json({ 
      error: 'Database not configured',
      message: 'PostgreSQL database connection is not set up. Please configure DATABASE_URL environment variable.',
      code: 'DATABASE_NOT_CONFIGURED'
    });
  }
  
  return res.status(500).json({ 
    error: 'Internal server error',
    message: error instanceof Error ? error.message : 'Unknown error',
    context
  });
};

/**
 * 프로젝트에 평가자 추가
 * POST /api/evaluators/assign
 */
router.post('/assign',
  authenticateToken,
  requireRole(['admin']),
  [
    body('project_id').isInt().withMessage('Project ID must be an integer'),
    body('evaluator_name').isString().isLength({min: 1}).withMessage('Evaluator name is required'),
    body('evaluator_email').optional().isEmail().withMessage('Valid email format required'),
    body('weight').optional().isFloat({min: 0.1, max: 10}).withMessage('Weight must be between 0.1 and 10')
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

      const { project_id, evaluator_name, evaluator_email, weight = 1.0 } = req.body;
      const evaluator_code = `EVL${Date.now().toString().slice(-6)}`; // 임시 코드 생성
      const adminId = (req as any).user.userId;

      // 프로젝트 소유권 확인
      const projectCheck = await query(
        'SELECT * FROM projects WHERE id = $1 AND created_by = $2',
        [project_id, adminId]
      );

      if (projectCheck.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // 평가자 중복 확인 (이름 기반)
      const duplicateCheck = await query(
        'SELECT * FROM project_evaluators pe JOIN users u ON pe.evaluator_id = u.id WHERE pe.project_id = $1 AND u.first_name = $2',
        [project_id, evaluator_name]
      );

      if (duplicateCheck.rowCount > 0) {
        return res.status(400).json({ error: 'Evaluator already exists in this project' });
      }

      // 평가자 계정 생성 또는 조회
      let evaluatorUser;
      const emailToUse = evaluator_email || `${evaluator_code.toLowerCase()}@evaluator.local`;
      const existingUser = await query(
        'SELECT * FROM users WHERE email = $1',
        [emailToUse]
      );

      if (existingUser.rowCount > 0) {
        evaluatorUser = existingUser.rows[0];
      } else {
        // 새 평가자 계정 생성
        const newUser = await query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role)
           VALUES ($1, $2, $3, $4, 'evaluator')
           RETURNING *`,
          [
            emailToUse,
            await hashPassword('defaultpassword'), // 임시 비밀번호
            evaluator_name,
            'Evaluator'
          ]
        );
        evaluatorUser = newUser.rows[0];
      }

      // 접속키 생성
      const accessKey = generateAccessKey(evaluator_code.toUpperCase(), project_id);

      // 프로젝트에 평가자 배정 (기존 테이블 구조 사용)
      const assignment = await query(
        `INSERT INTO project_evaluators (project_id, evaluator_id)
         VALUES ($1, $2)
         ON CONFLICT (project_id, evaluator_id) DO UPDATE SET assigned_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [project_id, evaluatorUser.id]
      );

      // 평가자 가중치 설정 (테이블이 있는 경우에만)
      try {
        await query(
          `INSERT INTO evaluator_weights (project_id, evaluator_id, weight)
           VALUES ($1, $2, $3)
           ON CONFLICT (project_id, evaluator_id) DO UPDATE SET weight = $3`,
          [project_id, evaluatorUser.id, weight]
        );
      } catch (e) {
        console.log('evaluator_weights table not found, skipping weight assignment');
      }

      // 진행상황 초기화 (테이블이 있는 경우에만)
      try {
        await query(
          `INSERT INTO evaluator_progress (project_id, evaluator_id, total_tasks, completed_tasks, completion_rate)
           VALUES ($1, $2, 0, 0, 0.0)
           ON CONFLICT (project_id, evaluator_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
          [project_id, evaluatorUser.id]
        );
      } catch (e) {
        console.log('evaluator_progress table not found, skipping progress initialization');
      }

      res.status(201).json({
        message: 'Evaluator assigned successfully',
        evaluator: {
          id: evaluatorUser.id,
          code: evaluator_code.toUpperCase(),
          name: evaluator_name,
          email: evaluatorUser.email,
          access_key: accessKey,
          weight: weight,
          assignment_id: assignment.rows[0].id
        }
      });

    } catch (error) {
      return handleDatabaseError(error, res, 'assigning evaluator');
    }
  }
);

/**
 * 프로젝트의 평가자 목록 조회
 * GET /api/evaluators/project/:projectId
 */
router.get('/project/:projectId',
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
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      // 접근 권한 확인
      let accessQuery;
      if (userRole === 'admin') {
        // 관리자는 자신이 생성한 프로젝트의 평가자 목록 조회
        accessQuery = await query(
          'SELECT * FROM projects WHERE id = $1 AND created_by = $2',
          [projectId, userId]
        );
      } else {
        // 평가자는 자신이 배정된 프로젝트인지 확인
        accessQuery = await query(
          'SELECT * FROM project_evaluators WHERE project_id = $1 AND evaluator_id = $2',
          [projectId, userId]
        );
      }

      if (accessQuery.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // 평가자 목록 조회 (기존 테이블 구조 사용)
      const evaluators = await query(
        `SELECT 
          u.id,
          u.first_name || ' ' || u.last_name as name,
          u.email,
          pe.assigned_at,
          COALESCE(ew.weight, 1.0) as weight,
          COALESCE(ep.completion_rate, 0) as completion_rate,
          COALESCE(ep.is_completed, false) as is_completed,
          ep.completed_at
         FROM project_evaluators pe
         JOIN users u ON pe.evaluator_id = u.id
         LEFT JOIN evaluator_weights ew ON pe.project_id = ew.project_id AND pe.evaluator_id = ew.evaluator_id
         LEFT JOIN evaluator_progress ep ON pe.project_id = ep.project_id AND pe.evaluator_id = ep.evaluator_id
         WHERE pe.project_id = $1
         ORDER BY pe.assigned_at DESC`,
        [projectId]
      );

      res.json({
        evaluators: evaluators.rows.map(row => ({
          id: row.id,
          code: `EVL${row.id}`, // ID 기반으로 코드 생성
          name: row.name,
          email: userRole === 'admin' ? row.email : undefined,
          access_key: userRole === 'admin' ? generateAccessKey(`EVL${row.id}`, projectId) : undefined,
          weight: row.weight,
          completion_rate: row.completion_rate,
          is_completed: row.is_completed,
          completed_at: row.completed_at,
          assigned_at: row.assigned_at,
          status: row.is_completed ? 'completed' : 'active',
          progress: Math.round(row.completion_rate)
        }))
      });

    } catch (error) {
      return handleDatabaseError(error, res, 'fetching evaluators');
    }
  }
);

/**
 * 평가자 초대 이메일 발송
 * POST /api/evaluators/invite
 */
router.post('/invite',
  authenticateToken,
  requireRole(['admin']),
  [
    body('evaluatorId').isString().withMessage('Evaluator ID is required'),
    body('projectId').isString().withMessage('Project ID is required'),
    body('emailContent').isObject().withMessage('Email content is required'),
    body('shortLink').isString().withMessage('Short link is required')
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

      const { evaluatorId, projectId, emailContent, shortLink } = req.body;
      
      // 여기서 실제 이메일 발송 로직 구현
      // 예: SendGrid, Nodemailer 등 사용
      console.log('Sending invitation email:', {
        to: emailContent.to,
        subject: emailContent.subject,
        body: emailContent.body,
        shortLink
      });

      // 초대 상태 업데이트 (project_evaluators 테이블에 저장)
      await query(
        `UPDATE project_evaluators 
         SET invitation_sent_at = NOW()
         WHERE evaluator_id = $1 AND project_id = $2`,
        [evaluatorId, projectId]
      );

      res.json({
        success: true,
        message: 'Invitation sent successfully',
        evaluatorId,
        shortLink
      });

    } catch (error) {
      return handleDatabaseError(error, res, 'sending invitation');
    }
  }
);

/**
 * 평가자 목록 조회 (개선된 버전)
 * GET /api/evaluators
 */
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { projectId } = req.query;

      let evaluatorsQuery = `
        SELECT 
          u.id,
          u.email,
          u.first_name || ' ' || u.last_name as name,
          u.created_at,
          array_agg(DISTINCT pe.project_id) as assigned_projects
        FROM users u
        LEFT JOIN project_evaluators pe ON u.id = pe.evaluator_id
        WHERE u.role = 'evaluator'
      `;

      const params: any[] = [];

      if (projectId) {
        evaluatorsQuery += ` AND pe.project_id = $1`;
        params.push(projectId);
      }

      evaluatorsQuery += ` GROUP BY u.id ORDER BY u.created_at DESC`;

      const result = await query(evaluatorsQuery, params);

      res.json({
        evaluators: result.rows.map(row => ({
          id: row.id,
          email: row.email,
          name: row.name,
          assignedProjects: row.assigned_projects || [],
          createdAt: row.created_at
        }))
      });

    } catch (error) {
      return handleDatabaseError(error, res, 'fetching evaluators');
    }
  }
);

/**
 * 평가자 추가 (개선된 버전)
 * POST /api/evaluators
 */
router.post('/',
  authenticateToken,
  requireRole(['admin']),
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('name').isString().isLength({min: 1}).withMessage('Name is required'),
    body('phone').optional().isString(),
    body('projectId').optional().isString()
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

      const { email, name, phone, projectId } = req.body;
      const adminId = (req as any).user.userId;

      // 이메일 중복 확인 (users 테이블에서 확인)
      const existingCheck = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingCheck.rowCount > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // 평가자 사용자 생성 (users 테이블에)
      const hashedPassword = await hashPassword('defaultpassword'); // 임시 비밀번호
      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, 'evaluator')
         RETURNING *`,
        [email, hashedPassword, name, 'Evaluator']
      );

      const evaluator = result.rows[0];

      // 프로젝트에 배정
      if (projectId) {
        // 평가자 코드 생성
        const evaluatorCode = `EVAL${evaluator.id}`;
        const accessKey = generateAccessKey(evaluatorCode, projectId);
        
        await query(
          `INSERT INTO project_evaluators (project_id, evaluator_id)
           VALUES ($1, $2)
           ON CONFLICT (project_id, evaluator_id) DO NOTHING`,
          [projectId, evaluator.id]
        );
      }

      res.json({
        evaluator: {
          id: evaluator.id,
          email: evaluator.email,
          name: evaluator.name,
          phone: evaluator.phone,
          assignedProjects: projectId ? [projectId] : [],
          invitationStatus: 'pending',
          createdAt: evaluator.created_at
        }
      });

    } catch (error) {
      return handleDatabaseError(error, res, 'creating evaluator');
    }
  }
);

/**
 * 평가자 가중치 업데이트
 * PUT /api/evaluators/:evaluatorId/weight
 */
router.put('/:evaluatorId/weight',
  authenticateToken,
  requireRole(['admin']),
  [
    param('evaluatorId').isInt().withMessage('Evaluator ID must be an integer'),
    body('project_id').isInt().withMessage('Project ID must be an integer'),
    body('weight').isFloat({min: 0.1, max: 10}).withMessage('Weight must be between 0.1 and 10')
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

      const evaluatorId = parseInt(req.params.evaluatorId);
      const { project_id, weight } = req.body;
      const adminId = (req as any).user.userId;

      // 프로젝트 소유권 확인
      const projectCheck = await query(
        'SELECT * FROM projects WHERE id = $1 AND created_by = $2',
        [project_id, adminId]
      );

      if (projectCheck.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // 평가자 배정 확인
      const evaluatorCheck = await query(
        'SELECT * FROM project_evaluators WHERE project_id = $1 AND evaluator_id = $2',
        [project_id, evaluatorId]
      );

      if (evaluatorCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Evaluator not assigned to this project' });
      }

      // 가중치 업데이트
      await query(
        `INSERT INTO evaluator_weights (project_id, evaluator_id, weight)
         VALUES ($1, $2, $3)
         ON CONFLICT (project_id, evaluator_id)
         DO UPDATE SET weight = $3, updated_at = CURRENT_TIMESTAMP`,
        [project_id, evaluatorId, weight]
      );

      res.json({
        message: 'Evaluator weight updated successfully',
        project_id,
        evaluator_id: evaluatorId,
        weight
      });

    } catch (error) {
      return handleDatabaseError(error, res, 'updating evaluator weight');
    }
  }
);

/**
 * 프로젝트에서 평가자 제거
 * DELETE /api/evaluators/:evaluatorId/project/:projectId
 */
router.delete('/:evaluatorId/project/:projectId',
  authenticateToken,
  requireRole(['admin']),
  [
    param('evaluatorId').isInt().withMessage('Evaluator ID must be an integer'),
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

      const evaluatorId = parseInt(req.params.evaluatorId);
      const projectId = parseInt(req.params.projectId);
      const adminId = (req as any).user.userId;

      // 프로젝트 소유권 확인
      const projectCheck = await query(
        'SELECT * FROM projects WHERE id = $1 AND created_by = $2',
        [projectId, adminId]
      );

      if (projectCheck.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // 트랜잭션으로 평가자 관련 모든 데이터 삭제
      await query('BEGIN');

      try {
        // 1. 워크숍 참가자 삭제
        await query(
          'DELETE FROM workshop_participants WHERE workshop_session_id IN (SELECT id FROM workshop_sessions WHERE project_id = $1) AND participant_id = $2',
          [projectId, evaluatorId]
        );

        // 2. 평가자 진행 상황 삭제
        await query('DELETE FROM evaluator_progress WHERE project_id = $1 AND evaluator_id = $2', [projectId, evaluatorId]);

        // 3. 평가자 가중치 삭제
        await query('DELETE FROM evaluator_weights WHERE project_id = $1 AND evaluator_id = $2', [projectId, evaluatorId]);

        // 4. 평가자의 평가 데이터 삭제
        await query('DELETE FROM evaluator_assessments WHERE participant_id IN (SELECT id FROM workshop_participants WHERE participant_id = $1)', [evaluatorId]);

        // 5. 프로젝트-평가자 연결 삭제
        const result = await query(
          'DELETE FROM project_evaluators WHERE project_id = $1 AND evaluator_id = $2 RETURNING *',
          [projectId, evaluatorId]
        );

        if (result.rowCount === 0) {
          await query('ROLLBACK');
          return res.status(404).json({ error: 'Evaluator not found in this project' });
        }

        await query('COMMIT');

        res.json({
          message: 'Evaluator and all related data removed successfully',
          project_id: projectId,
          evaluator_id: evaluatorId,
          removed_data: {
            project_evaluator: true,
            evaluator_weights: true,
            evaluator_progress: true,
            workshop_participation: true,
            evaluation_assessments: true
          }
        });

      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      return handleDatabaseError(error, res, 'removing evaluator');
    }
  }
);

/**
 * 평가자 완전 삭제 (모든 프로젝트에서 제거)
 * DELETE /api/evaluators/:evaluatorId
 */
router.delete('/:evaluatorId',
  authenticateToken,
  requireRole(['admin']),
  [
    param('evaluatorId').isInt().withMessage('Evaluator ID must be an integer')
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

      const evaluatorId = parseInt(req.params.evaluatorId);

      // 트랜잭션으로 평가자 완전 삭제
      await query('BEGIN');

      try {
        // 평가자가 참여한 모든 프로젝트에서 데이터 삭제
        const projectsResult = await query(
          'SELECT DISTINCT project_id FROM project_evaluators WHERE evaluator_id = $1',
          [evaluatorId]
        );

        for (const project of projectsResult.rows) {
          const projectId = project.project_id;
          
          // 워크숍 데이터 삭제
          await query(
            'DELETE FROM workshop_participants WHERE workshop_session_id IN (SELECT id FROM workshop_sessions WHERE project_id = $1) AND participant_id = $2',
            [projectId, evaluatorId]
          );

          // 평가자 관련 데이터 삭제
          await query('DELETE FROM evaluator_progress WHERE project_id = $1 AND evaluator_id = $2', [projectId, evaluatorId]);
          await query('DELETE FROM evaluator_weights WHERE project_id = $1 AND evaluator_id = $2', [projectId, evaluatorId]);
        }

        // 모든 프로젝트에서 평가자 제거
        await query('DELETE FROM project_evaluators WHERE evaluator_id = $1', [evaluatorId]);

        // 평가자 계정 삭제 (role이 evaluator인 경우만)
        const userResult = await query(
          'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING *',
          [evaluatorId, 'evaluator']
        );

        if (userResult.rowCount === 0) {
          await query('ROLLBACK');
          return res.status(404).json({ error: 'Evaluator not found or cannot be deleted' });
        }

        await query('COMMIT');

        res.json({
          message: 'Evaluator completely removed from all projects',
          evaluator_id: evaluatorId,
          removed_from_projects: projectsResult.rows.length,
          deleted_user_account: true
        });

      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      return handleDatabaseError(error, res, 'completely removing evaluator');
    }
  }
);

/**
 * 평가자 진행상황 조회
 * GET /api/evaluators/progress/:projectId
 */
router.get('/progress/:projectId',
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

      // 진행상황 조회 (기존 테이블 구조 사용)
      const progress = await query(
        `SELECT 
          u.id as evaluator_id,
          u.first_name || ' ' || u.last_name as evaluator_name,
          COALESCE(ep.total_tasks, 0) as total_tasks,
          COALESCE(ep.completed_tasks, 0) as completed_tasks,
          COALESCE(ep.completion_rate, 0) as completion_rate,
          COALESCE(ep.is_completed, false) as is_completed,
          ep.completed_at,
          ep.updated_at
         FROM project_evaluators pe
         JOIN users u ON pe.evaluator_id = u.id
         LEFT JOIN evaluator_progress ep ON pe.project_id = ep.project_id AND pe.evaluator_id = ep.evaluator_id
         WHERE pe.project_id = $1
         ORDER BY pe.assigned_at DESC`,
        [projectId]
      );

      // 전체 진행률 계산
      const totalProgress = progress.rows.length > 0 
        ? progress.rows.reduce((sum, row) => sum + row.completion_rate, 0) / progress.rows.length
        : 0;

      const completedCount = progress.rows.filter(row => row.is_completed).length;

      res.json({
        project_id: projectId,
        overall_progress: totalProgress,
        total_evaluators: progress.rows.length,
        completed_evaluators: completedCount,
        evaluator_progress: progress.rows
      });

    } catch (error) {
      return handleDatabaseError(error, res, 'fetching evaluator progress');
    }
  }
);

/**
 * 접속키로 평가자 인증
 * POST /api/evaluators/auth/access-key
 */
router.post('/auth/access-key',
  [
    body('access_key').isString().isLength({min: 1}).withMessage('Access key is required')
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

      const { access_key } = req.body;

      // 접속키로 평가자 정보 조회 (기본 패턴 사용)
      const accessKeyPattern = access_key.toUpperCase();
      const parts = accessKeyPattern.split('-');
      
      if (parts.length !== 2) {
        return res.status(401).json({ error: 'Invalid access key format' });
      }
      
      const evaluatorCode = parts[0]; // EVL123
      const projectCode = parts[1];   // 0001
      
      // EVL 제거하고 ID 추출
      const evaluatorId = evaluatorCode.replace('EVL', '');
      const projectId = parseInt(projectCode);
      
      const evaluatorInfo = await query(
        `SELECT 
          pe.project_id,
          pe.evaluator_id,
          u.first_name || ' ' || u.last_name as evaluator_name,
          p.title as project_title,
          p.description as project_description
         FROM project_evaluators pe
         JOIN users u ON pe.evaluator_id = u.id
         JOIN projects p ON pe.project_id = p.id
         WHERE pe.evaluator_id = $1 AND pe.project_id = $2`,
        [evaluatorId, projectId]
      );

      if (evaluatorInfo.rowCount === 0) {
        return res.status(401).json({ error: 'Invalid access key' });
      }

      const info = evaluatorInfo.rows[0];

      res.json({
        valid: true,
        evaluator_id: info.evaluator_id,
        evaluator_code: `EVL${info.evaluator_id}`,
        evaluator_name: info.evaluator_name,
        project_id: info.project_id,
        project_title: info.project_title,
        project_description: info.project_description
      });

    } catch (error) {
      return handleDatabaseError(error, res, 'validating access key');
    }
  }
);

/**
 * 헬퍼 함수들
 */

// 접속키 생성
function generateAccessKey(evaluatorCode: string, projectId: number): string {
  const projectCode = projectId.toString().padStart(4, '0');
  return `${evaluatorCode}-${projectCode}`;
}

// 비밀번호 해시 생성 (간단한 구현)
async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default router;