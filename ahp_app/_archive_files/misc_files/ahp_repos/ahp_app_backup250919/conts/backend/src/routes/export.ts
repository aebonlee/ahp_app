/**
 * Excel 내보내기 API 라우터
 * 분석 결과를 Excel 파일로 다운로드
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../database/connection';

const router = express.Router();

/**
 * Excel 내보내기
 * GET /api/export/excel/:projectId
 */
router.get('/excel/:projectId', authenticateToken, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const evaluatorId = (req as any).user.userId;

    // 프로젝트 접근 권한 확인
    const projectCheck = await query(
      `SELECT p.*, u.name as admin_name
       FROM projects p
       JOIN users u ON p.admin_id = u.id
       WHERE p.id = $1 AND (p.admin_id = $2 OR EXISTS(
         SELECT 1 FROM project_evaluators pe 
         WHERE pe.project_id = p.id AND pe.evaluator_id = $2
       ))`,
      [projectId, evaluatorId]
    );

    if (projectCheck.rowCount === 0) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    const project = projectCheck.rows[0];

    // 프로젝트 데이터 수집
    const exportData = await collectProjectData(projectId);

    // JSON 형태로 내보내기 (실제로는 Excel 라이브러리 사용)
    const excelData = {
      metadata: {
        projectName: project.name,
        projectDescription: project.description,
        adminName: project.admin_name,
        exportedAt: new Date().toISOString(),
        exportedBy: evaluatorId
      },
      criteria: exportData.criteria,
      alternatives: exportData.alternatives,
      pairwiseComparisons: exportData.comparisons,
      ahpResults: exportData.results,
      finalRanking: exportData.ranking,
      statistics: {
        totalEvaluators: exportData.evaluators.length,
        completionRates: exportData.progress,
        averageConsistencyRatio: exportData.avgCR
      }
    };

    // Content-Type을 Excel로 설정
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="AHP_Analysis_${project.name}_${Date.now()}.xlsx"`);

    // 임시로 JSON 형태로 반환 (추후 Excel 라이브러리로 변환)
    res.json(excelData);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 프로젝트 데이터 수집 헬퍼 함수
 */
async function collectProjectData(projectId: number) {
  // 기준 조회
  const criteriaResult = await query(
    `SELECT * FROM criteria WHERE project_id = $1 ORDER BY level, "order"`,
    [projectId]
  );

  // 대안 조회
  const alternativesResult = await query(
    `SELECT * FROM alternatives WHERE project_id = $1 ORDER BY "order"`,
    [projectId]
  );

  // 쌍대비교 데이터 조회
  const comparisonsResult = await query(
    `SELECT pc.*, u.name as evaluator_name
     FROM pairwise_comparisons pc
     JOIN users u ON pc.evaluator_id = u.id
     WHERE pc.project_id = $1`,
    [projectId]
  );

  // AHP 결과 조회
  const resultsResult = await query(
    `SELECT ar.*, u.name as evaluator_name
     FROM ahp_results ar
     JOIN users u ON ar.evaluator_id = u.id
     WHERE ar.project_id = $1`,
    [projectId]
  );

  // 최종 순위 조회
  const rankingResult = await query(
    `SELECT * FROM aggregated_results WHERE project_id = $1`,
    [projectId]
  );

  // 평가자 조회
  const evaluatorsResult = await query(
    `SELECT pe.*, u.name as evaluator_name, u.email
     FROM project_evaluators pe
     JOIN users u ON pe.evaluator_id = u.id
     WHERE pe.project_id = $1`,
    [projectId]
  );

  // 진행상황 조회
  const progressResult = await query(
    `SELECT ep.*, u.name as evaluator_name
     FROM evaluator_progress ep
     JOIN users u ON ep.evaluator_id = u.id
     WHERE ep.project_id = $1`,
    [projectId]
  );

  // 평균 일관성 비율 계산
  const consistencyRatios = resultsResult.rows
    .filter(row => row.consistency_ratio !== null)
    .map(row => row.consistency_ratio);
  
  const avgCR = consistencyRatios.length > 0 
    ? consistencyRatios.reduce((sum, cr) => sum + cr, 0) / consistencyRatios.length 
    : 0;

  return {
    criteria: criteriaResult.rows,
    alternatives: alternativesResult.rows,
    comparisons: comparisonsResult.rows,
    results: resultsResult.rows,
    ranking: rankingResult.rows[0]?.final_ranking ? JSON.parse(rankingResult.rows[0].final_ranking) : [],
    evaluators: evaluatorsResult.rows,
    progress: progressResult.rows,
    avgCR
  };
}

/**
 * CSV 내보내기 (추가 기능)
 * GET /api/export/csv/:projectId
 */
router.get('/csv/:projectId', authenticateToken, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { type = 'ranking' } = req.query;

    // 프로젝트 접근 권한 확인
    const projectCheck = await query(
      `SELECT p.name FROM projects p
       WHERE p.id = $1 AND (p.admin_id = $2 OR EXISTS(
         SELECT 1 FROM project_evaluators pe 
         WHERE pe.project_id = p.id AND pe.evaluator_id = $2
       ))`,
      [projectId, (req as any).user.userId]
    );

    if (projectCheck.rowCount === 0) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    let csvData = '';

    if (type === 'ranking') {
      // 최종 순위 CSV
      const rankingResult = await query(
        `SELECT ar.final_ranking FROM aggregated_results ar WHERE ar.project_id = $1`,
        [projectId]
      );

      if (rankingResult.rowCount && rankingResult.rowCount > 0) {
        const ranking = JSON.parse(rankingResult.rows[0].final_ranking);
        csvData = 'Rank,Alternative Name,Score\n';
        ranking.forEach((item: any) => {
          csvData += `${item.rank},"${item.alternativeName}",${item.score}\n`;
        });
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="AHP_${type}_${projectId}_${Date.now()}.csv"`);
    res.send(csvData);

  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;