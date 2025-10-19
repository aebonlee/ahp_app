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
 * 프로젝트에 평가자 추가
 * POST /api/evaluators/assign
 */
router.post('/assign',
  authenticateToken,
  requireRole(['admin']),
  [
    body('project_id').isInt().withMessage('Project ID must be an integer'),
    body('evaluator_code').isString().isLength({min: 1, max: 50}).withMessage('Evaluator code is required'),
    body('evaluator_name').isString().isLength({min: 1}).withMessage('Evaluator name is required'),
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

      const { project_id, evaluator_code, evaluator_name, weight = 1.0 } = req.body;
      const adminId = (req as any).user.userId;

      // 프로젝트 소유권 확인
      const projectCheck = await query(
        'SELECT * FROM projects WHERE id = $1 AND created_by = $2',
        [project_id, adminId]
      );

      if (projectCheck.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      // 평가자 코드 중복 확인
      const duplicateCheck = await query(
        'SELECT * FROM project_evaluators WHERE project_id = $1 AND evaluator_code = $2',
        [project_id, evaluator_code.toUpperCase()]
      );

      if (duplicateCheck.rowCount > 0) {
        return res.status(400).json({ error: 'Evaluator code already exists in this project' });
      }

      // 평가자 계정 생성 또는 조회
      let evaluatorUser;
      const existingUser = await query(
        'SELECT * FROM users WHERE email = $1',
        [`${evaluator_code.toLowerCase()}@evaluator.local`]
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
            `${evaluator_code.toLowerCase()}@evaluator.local`,
            await hashPassword('defaultpassword'), // 임시 비밀번호
            evaluator_name,
            'Evaluator'
          ]
        );
        evaluatorUser = newUser.rows[0];
      }

      // 접속키 생성
      const accessKey = generateAccessKey(evaluator_code.toUpperCase(), project_id);

      // 프로젝트에 평가자 배정
      const assignment = await query(
        `INSERT INTO project_evaluators (project_id, evaluator_id, evaluator_code, access_key)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [project_id, evaluatorUser.id, evaluator_code.toUpperCase(), accessKey]
      );

      // 평가자 가중치 설정
      await query(
        `INSERT INTO evaluator_weights (project_id, evaluator_id, weight)
         VALUES ($1, $2, $3)`,
        [project_id, evaluatorUser.id, weight]
      );

      // 진행상황 초기화
      await query(
        `INSERT INTO evaluator_progress (project_id, evaluator_id, total_tasks, completed_tasks, completion_rate)
         VALUES ($1, $2, 0, 0, 0.0)`,
        [project_id, evaluatorUser.id]
      );

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
      console.error('Error assigning evaluator:', error);
      res.status(500).json({ error: 'Internal server error' });
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

      // 평가자 목록 조회
      const evaluators = await query(
        `SELECT 
          u.id,
          u.name,
          u.email,
          pe.evaluator_code,
          pe.access_key,
          ew.weight,
          ep.completion_rate,
          ep.is_completed,
          ep.completed_at,
          pe.created_at as assigned_at
         FROM project_evaluators pe
         JOIN users u ON pe.evaluator_id = u.id
         LEFT JOIN evaluator_weights ew ON pe.project_id = ew.project_id AND pe.evaluator_id = ew.evaluator_id
         LEFT JOIN evaluator_progress ep ON pe.project_id = ep.project_id AND pe.evaluator_id = ep.evaluator_id
         WHERE pe.project_id = $1
         ORDER BY pe.evaluator_code`,
        [projectId]
      );

      res.json({
        evaluators: evaluators.rows.map(row => ({
          id: row.id,
          code: row.evaluator_code,
          name: row.name,
          email: userRole === 'admin' ? row.email : undefined, // 이메일은 관리자만 조회
          access_key: userRole === 'admin' ? row.access_key : undefined, // 접속키는 관리자만 조회
          weight: row.weight || 1.0,
          completion_rate: row.completion_rate || 0,
          is_completed: row.is_completed || false,
          completed_at: row.completed_at,
          assigned_at: row.assigned_at
        }))
      });

    } catch (error) {
      console.error('Error fetching evaluators:', error);
      res.status(500).json({ error: 'Internal server error' });
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

      // 초대 상태 업데이트 (데이터베이스에 저장)
      await query(
        `UPDATE evaluators 
         SET invitation_status = 'sent', 
             invitation_link = $1,
             invitation_sent_at = NOW()
         WHERE id = $2 AND project_id = $3`,
        [shortLink, evaluatorId, projectId]
      );

      res.json({
        success: true,
        message: 'Invitation sent successfully',
        evaluatorId,
        shortLink
      });

    } catch (error) {
      console.error('Error sending invitation:', error);
      res.status(500).json({ error: 'Failed to send invitation' });
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
          e.id,
          e.email,
          e.name,
          e.phone,
          e.invitation_status,
          e.invitation_link as short_link,
          e.invitation_sent_at,
          e.created_at,
          e.last_active,
          array_agg(DISTINCT ep.project_id) as assigned_projects
        FROM evaluators e
        LEFT JOIN evaluator_projects ep ON e.id = ep.evaluator_id
        WHERE e.created_by = $1
      `;

      const params: any[] = [userId];

      if (projectId) {
        evaluatorsQuery += ` AND ep.project_id = $2`;
        params.push(projectId);
      }

      evaluatorsQuery += ` GROUP BY e.id ORDER BY e.created_at DESC`;

      const result = await query(evaluatorsQuery, params);

      res.json({
        evaluators: result.rows.map(row => ({
          id: row.id,
          email: row.email,
          name: row.name,
          phone: row.phone,
          assignedProjects: row.assigned_projects || [],
          invitationStatus: row.invitation_status,
          shortLink: row.short_link,
          createdAt: row.created_at,
          lastActive: row.last_active
        }))
      });

    } catch (error) {
      console.error('Error fetching evaluators:', error);
      res.status(500).json({ error: 'Internal server error' });
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

      // 이메일 중복 확인
      const existingCheck = await query(
        'SELECT * FROM evaluators WHERE email = $1 AND created_by = $2',
        [email, adminId]
      );

      if (existingCheck.rowCount > 0) {
        return res.status(400).json({ error: 'Evaluator with this email already exists' });
      }

      // 평가자 생성
      const result = await query(
        `INSERT INTO evaluators (email, name, phone, created_by, invitation_status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [email, name, phone, adminId]
      );

      const evaluator = result.rows[0];

      // 프로젝트에 배정
      if (projectId) {
        await query(
          `INSERT INTO evaluator_projects (evaluator_id, project_id)
           VALUES ($1, $2)`,
          [evaluator.id, projectId]
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
      console.error('Error creating evaluator:', error);
      res.status(500).json({ error: 'Internal server error' });
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
      console.error('Error updating evaluator weight:', error);
      res.status(500).json({ error: 'Internal server error' });
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

      // 평가자 제거 (CASCADE로 관련 데이터도 함께 삭제됨)
      const result = await query(
        'DELETE FROM project_evaluators WHERE project_id = $1 AND evaluator_id = $2',
        [projectId, evaluatorId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Evaluator not found in this project' });
      }

      res.json({
        message: 'Evaluator removed successfully',
        project_id: projectId,
        evaluator_id: evaluatorId
      });

    } catch (error) {
      console.error('Error removing evaluator:', error);
      res.status(500).json({ error: 'Internal server error' });
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

      // 진행상황 조회
      const progress = await query(
        `SELECT 
          u.id as evaluator_id,
          u.name as evaluator_name,
          pe.evaluator_code,
          ep.total_tasks,
          ep.completed_tasks,
          ep.completion_rate,
          ep.is_completed,
          ep.completed_at,
          ep.updated_at
         FROM evaluator_progress ep
         JOIN project_evaluators pe ON ep.project_id = pe.project_id AND ep.evaluator_id = pe.evaluator_id
         JOIN users u ON ep.evaluator_id = u.id
         WHERE ep.project_id = $1
         ORDER BY ep.completion_rate DESC, pe.evaluator_code`,
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
      console.error('Error fetching evaluator progress:', error);
      res.status(500).json({ error: 'Internal server error' });
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

      // 접속키로 평가자 정보 조회
      const evaluatorInfo = await query(
        `SELECT 
          pe.project_id,
          pe.evaluator_id,
          pe.evaluator_code,
          pe.access_key,
          u.name as evaluator_name,
          p.title as project_title,
          p.description as project_description
         FROM project_evaluators pe
         JOIN users u ON pe.evaluator_id = u.id
         JOIN projects p ON pe.project_id = p.id
         WHERE pe.access_key = $1`,
        [access_key.toUpperCase()]
      );

      if (evaluatorInfo.rowCount === 0) {
        return res.status(401).json({ error: 'Invalid access key' });
      }

      const info = evaluatorInfo.rows[0];

      res.json({
        valid: true,
        evaluator_id: info.evaluator_id,
        evaluator_code: info.evaluator_code,
        evaluator_name: info.evaluator_name,
        project_id: info.project_id,
        project_title: info.project_title,
        project_description: info.project_description
      });

    } catch (error) {
      console.error('Error validating access key:', error);
      res.status(500).json({ error: 'Internal server error' });
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