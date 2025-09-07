import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { query } from '../database/connection';

const router = express.Router();

// 사용자 구독 정보 조회
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const result = await query(`
      SELECT 
        us.*,
        uq.*,
        CASE 
          WHEN us.end_date > CURRENT_TIMESTAMP THEN 'active'
          WHEN us.end_date < CURRENT_TIMESTAMP THEN 'expired'
          ELSE 'unknown'
        END as status,
        EXTRACT(DAY FROM (us.end_date - CURRENT_TIMESTAMP)) as days_remaining
      FROM user_subscriptions us
      LEFT JOIN user_quotas uq ON us.user_id = uq.user_id
      WHERE us.user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    res.json({
      success: true,
      subscription: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subscription status' 
    });
  }
});

// 사용량 현황 조회
router.get('/usage', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    // 현재 프로젝트 수 계산
    const projectCount = await query(`
      SELECT COUNT(*) as count 
      FROM projects 
      WHERE admin_id = $1 AND status != 'archived'
    `, [userId]);

    // 평가자 수 계산
    const evaluatorCount = await query(`
      SELECT COUNT(DISTINCT wp.participant_id) as count
      FROM workshop_participants wp
      JOIN workshop_sessions ws ON wp.workshop_session_id = ws.id
      JOIN projects p ON ws.project_id = p.id
      WHERE p.admin_id = $1
    `, [userId]);

    // 스토리지 사용량 계산 (근사치)
    const storageUsage = await query(`
      SELECT 
        COALESCE(SUM(LENGTH(project_data::text)), 0) / 1024.0 / 1024.0 as storage_mb
      FROM project_archives 
      WHERE user_id = $1
    `, [userId]);

    // 할당량 정보
    const quotaInfo = await query(`
      SELECT * FROM user_quotas WHERE user_id = $1
    `, [userId]);

    const currentUsage = {
      projects: parseInt(projectCount.rows[0].count),
      evaluators: parseInt(evaluatorCount.rows[0].count),
      storage_mb: parseFloat(storageUsage.rows[0].storage_mb || '0'),
      quota: quotaInfo.rows[0] || {}
    };

    res.json({
      success: true,
      usage: currentUsage
    });

  } catch (error) {
    console.error('Error fetching usage data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch usage data' 
    });
  }
});

// 사용기간 연장
router.post('/extend', authenticateToken, [
  body('days').isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const userId = (req as any).user.userId;
    const { days, reason = 'manual_extension' } = req.body;

    const result = await query(`
      UPDATE user_subscriptions 
      SET 
        end_date = GREATEST(end_date, CURRENT_TIMESTAMP) + INTERVAL '${days} days',
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `, [userId]);

    // 활동 로그 기록
    await query(`
      INSERT INTO user_activity_logs (user_id, action_type, action_data)
      VALUES ($1, 'subscription_extended', $2)
    `, [userId, JSON.stringify({ days, reason })]);

    res.json({
      success: true,
      message: `Subscription extended by ${days} days`,
      subscription: result.rows[0]
    });

  } catch (error) {
    console.error('Error extending subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to extend subscription' 
    });
  }
});

// 데이터 초기화 (관리자용)
router.post('/reset-data', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { confirmPassword, keepArchives = true } = req.body;

    // 비밀번호 확인은 실제 구현에서 추가
    if (!confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password confirmation required' 
      });
    }

    // 트랜잭션으로 안전한 초기화
    await query('BEGIN');

    try {
      // 프로젝트 아카이브 (선택사항)
      if (keepArchives) {
        await query(`
          INSERT INTO project_archives (original_project_id, user_id, project_data, archive_reason)
          SELECT 
            id,
            admin_id,
            row_to_json(projects.*),
            'user_reset'
          FROM projects 
          WHERE admin_id = $1
        `, [userId]);
      }

      // 사용자 프로젝트 삭제 (CASCADE로 관련 데이터도 삭제됨)
      const deletedProjects = await query(`
        DELETE FROM projects 
        WHERE admin_id = $1
        RETURNING id
      `, [userId]);

      // 사용량 초기화
      await query(`
        UPDATE user_quotas 
        SET 
          current_projects = 0,
          current_storage_mb = 0.0,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [userId]);

      // 활동 로그 기록
      await query(`
        INSERT INTO user_activity_logs (user_id, action_type, action_data)
        VALUES ($1, 'data_reset', $2)
      `, [userId, JSON.stringify({ 
        deleted_projects: deletedProjects.rows.length,
        kept_archives: keepArchives 
      })]);

      await query('COMMIT');

      res.json({
        success: true,
        message: 'User data reset successfully',
        deleted_projects: deletedProjects.rows.length,
        archives_kept: keepArchives
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error resetting user data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset user data' 
    });
  }
});

// 관리자용: 만료된 trial 정리
router.post('/admin/cleanup-expired', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    
    if (userRole !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // 만료된 trial 비활성화
    const expiredTrials = await query('SELECT deactivate_expired_trials()');
    
    // 완료된 프로젝트 아카이브
    const archivedProjects = await query('SELECT archive_completed_projects()');
    
    // 만료된 아카이브 정리
    const cleanedArchives = await query('SELECT cleanup_expired_archives()');
    
    // 오래된 로그 정리
    const cleanedLogs = await query('SELECT cleanup_old_activity_logs()');

    res.json({
      success: true,
      message: 'Cleanup completed successfully',
      stats: {
        expired_trials: expiredTrials.rows[0].deactivate_expired_trials,
        archived_projects: archivedProjects.rows[0].archive_completed_projects,
        cleaned_archives: cleanedArchives.rows[0].cleanup_expired_archives,
        cleaned_logs: cleanedLogs.rows[0].cleanup_old_activity_logs
      }
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to perform cleanup' 
    });
  }
});

// 사용자 할당량 확인
router.get('/quota-check/:action', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { action } = req.params; // 'create_project', 'add_evaluator', etc.

    const quotaInfo = await query(`
      SELECT uq.*, us.plan_type, us.end_date > CURRENT_TIMESTAMP as is_active
      FROM user_quotas uq
      JOIN user_subscriptions us ON uq.user_id = us.user_id
      WHERE uq.user_id = $1
    `, [userId]);

    if (quotaInfo.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quota information not found' 
      });
    }

    const quota = quotaInfo.rows[0];
    let canProceed = quota.is_active;
    let reason = '';

    switch (action) {
      case 'create_project':
        if (quota.max_projects > 0 && quota.current_projects >= quota.max_projects) {
          canProceed = false;
          reason = `프로젝트 한도 초과 (${quota.current_projects}/${quota.max_projects})`;
        }
        break;
      case 'add_evaluator':
        // 추가 평가자 한도 체크 로직
        break;
      default:
        reason = 'Unknown action';
    }

    res.json({
      success: true,
      can_proceed: canProceed,
      reason: reason,
      quota: quota
    });

  } catch (error) {
    console.error('Error checking quota:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check quota' 
    });
  }
});

export default router;