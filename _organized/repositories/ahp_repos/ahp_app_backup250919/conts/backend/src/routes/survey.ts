import { Router } from 'express';
import { query } from '../database/connection';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 설문조사 목록 조회
router.get('/projects/:projectId/surveys', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const result = await query(
      `SELECT s.*, u.first_name || ' ' || u.last_name as creator_name
       FROM surveys s
       LEFT JOIN users u ON s.created_by = u.id
       WHERE s.project_id = $1 AND s.deleted_at IS NULL
       ORDER BY s.created_at DESC`,
      [projectId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// 설문조사 생성
router.post('/projects/:projectId/surveys', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, questions } = req.body;
    const userId = req.user?.id;
    
    // 프로젝트당 설문조사 개수 확인 (최대 3개)
    const countResult = await query(
      'SELECT COUNT(*) FROM surveys WHERE project_id = $1 AND deleted_at IS NULL',
      [projectId]
    );
    
    if (parseInt(countResult.rows[0].count) >= 3) {
      return res.status(400).json({ 
        error: 'Maximum survey limit reached',
        message: '프로젝트당 최대 3개의 설문조사만 생성할 수 있습니다.'
      });
    }
    
    // 평가자 링크 생성
    const evaluatorToken = uuidv4();
    const evaluatorLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/survey/eval/${evaluatorToken}`;
    
    const result = await query(
      `INSERT INTO surveys (
        project_id, title, description, questions, created_by, 
        status, evaluator_link
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [projectId, title, description, JSON.stringify(questions), userId, 'draft', evaluatorLink]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// 설문조사 수정
router.put('/surveys/:surveyId', authenticateToken, async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { title, description, questions, status } = req.body;
    
    const result = await query(
      `UPDATE surveys 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           questions = COALESCE($3, questions),
           status = COALESCE($4, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND deleted_at IS NULL
       RETURNING *`,
      [title, description, questions ? JSON.stringify(questions) : null, status, surveyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({ error: 'Failed to update survey' });
  }
});

// 설문조사 삭제 (soft delete)
router.delete('/surveys/:surveyId', authenticateToken, async (req, res) => {
  try {
    const { surveyId } = req.params;
    
    const result = await query(
      `UPDATE surveys 
       SET deleted_at = CURRENT_TIMESTAMP,
           status = 'archived'
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [surveyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

// 설문조사 상태 변경
router.patch('/surveys/:surveyId/status', authenticateToken, async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { status } = req.body;
    
    if (!['draft', 'active', 'completed', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await query(
      `UPDATE surveys 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [status, surveyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating survey status:', error);
    res.status(500).json({ error: 'Failed to update survey status' });
  }
});

// 설문조사 응답 저장
router.post('/surveys/:surveyId/responses', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { respondent_email, respondent_name, responses, completion_time } = req.body;
    const ip_address = req.ip;
    const user_agent = req.headers['user-agent'];
    
    // 설문조사 존재 확인
    const surveyCheck = await query(
      'SELECT id, status FROM surveys WHERE id = $1 AND deleted_at IS NULL',
      [surveyId]
    );
    
    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    if (surveyCheck.rows[0].status !== 'active') {
      return res.status(400).json({ error: 'Survey is not active' });
    }
    
    // 응답 저장
    const result = await query(
      `INSERT INTO survey_responses (
        survey_id, respondent_email, respondent_name, responses, 
        completion_time, ip_address, user_agent, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING id`,
      [surveyId, respondent_email, respondent_name, JSON.stringify(responses), 
       completion_time, ip_address, user_agent]
    );
    
    // 설문조사 통계 업데이트
    await query(
      `UPDATE surveys 
       SET total_responses = total_responses + 1,
           completed_responses = completed_responses + 1,
           average_completion_time = (
             SELECT AVG(completion_time) 
             FROM survey_responses 
             WHERE survey_id = $1 AND completed_at IS NOT NULL
           )
       WHERE id = $1`,
      [surveyId]
    );
    
    res.status(201).json({ 
      message: 'Response saved successfully',
      responseId: result.rows[0].id 
    });
  } catch (error) {
    console.error('Error saving survey response:', error);
    res.status(500).json({ error: 'Failed to save survey response' });
  }
});

// 설문조사 응답 조회
router.get('/surveys/:surveyId/responses', authenticateToken, async (req, res) => {
  try {
    const { surveyId } = req.params;
    
    const result = await query(
      `SELECT * FROM survey_responses 
       WHERE survey_id = $1
       ORDER BY created_at DESC`,
      [surveyId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    res.status(500).json({ error: 'Failed to fetch survey responses' });
  }
});

export default router;