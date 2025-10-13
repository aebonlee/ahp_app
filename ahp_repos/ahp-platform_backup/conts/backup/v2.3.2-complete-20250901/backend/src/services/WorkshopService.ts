/**
 * 워크숍 서비스
 * 다중 평가자 워크숍 세션 관리 서비스
 */

import { Pool } from 'pg';
import {
  WorkshopSession,
  WorkshopParticipant,
  EvaluatorAssessment,
  GroupConsensusResult,
  RealTimeProgress,
  WorkshopSessionWithParticipants,
  ParticipantProgress,
  WorkshopStatistics,
  ConsensusAnalysis,
  CreateWorkshopSessionRequest,
  UpdateWorkshopSessionRequest,
  InviteParticipantsRequest,
  SubmitEvaluationRequest,
  CalculateConsensusRequest
} from '../models/WorkshopSession';

export class WorkshopService {
  constructor(private db: Pool) {}

  /**
   * 새 워크숍 세션 생성
   */
  async createWorkshopSession(facilitatorId: number, request: CreateWorkshopSessionRequest): Promise<WorkshopSession> {
    const query = `
      INSERT INTO workshop_sessions (
        project_id, session_name, session_description, facilitator_id,
        session_type, max_participants, start_date, end_date, deadline,
        evaluation_mode, consensus_method, minimum_consistency_ratio,
        require_all_evaluations, allow_partial_submissions, session_config
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      request.projectId,
      request.sessionName,
      request.sessionDescription,
      facilitatorId,
      request.sessionType || 'collaborative',
      request.maxParticipants || 50,
      request.startDate,
      request.endDate,
      request.deadline,
      request.evaluationMode || 'pairwise',
      request.consensusMethod || 'geometric_mean',
      request.minimumConsistencyRatio || 0.1,
      request.requireAllEvaluations || false,
      request.allowPartialSubmissions || true,
      JSON.stringify(request.sessionConfig || {})
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * 워크숍 세션 정보 업데이트
   */
  async updateWorkshopSession(sessionId: number, request: UpdateWorkshopSessionRequest): Promise<WorkshopSession> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'sessionConfig') {
          setClauses.push(`session_config = $${paramIndex}`);
          values.push(JSON.stringify(value));
        } else {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          setClauses.push(`${dbKey} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    });

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(sessionId);

    const query = `
      UPDATE workshop_sessions 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * 워크숍 세션 조회 (참가자 정보 포함)
   */
  async getWorkshopSessionWithParticipants(sessionId: number): Promise<WorkshopSessionWithParticipants | null> {
    const sessionQuery = `
      SELECT ws.*, u.name as facilitator_name, u.email as facilitator_email,
             p.title as project_title, p.description as project_description
      FROM workshop_sessions ws
      JOIN users u ON ws.facilitator_id = u.id
      JOIN projects p ON ws.project_id = p.id
      WHERE ws.id = $1
    `;

    const participantsQuery = `
      SELECT * FROM workshop_participants 
      WHERE workshop_session_id = $1 
      ORDER BY created_at
    `;

    const [sessionResult, participantsResult] = await Promise.all([
      this.db.query(sessionQuery, [sessionId]),
      this.db.query(participantsQuery, [sessionId])
    ]);

    if (sessionResult.rows.length === 0) {
      return null;
    }

    const session = sessionResult.rows[0];
    return {
      ...session,
      facilitator: {
        id: session.facilitator_id,
        name: session.facilitator_name,
        email: session.facilitator_email
      },
      project: {
        id: session.project_id,
        title: session.project_title,
        description: session.project_description
      },
      participants: participantsResult.rows
    };
  }

  /**
   * 참가자 초대
   */
  async inviteParticipants(sessionId: number, request: InviteParticipantsRequest): Promise<WorkshopParticipant[]> {
    const participants: WorkshopParticipant[] = [];

    for (const participant of request.participants) {
      // 기존 참가자 확인
      const existingQuery = `
        SELECT id FROM workshop_participants 
        WHERE workshop_session_id = $1 AND participant_email = $2
      `;
      const existing = await this.db.query(existingQuery, [sessionId, participant.email]);

      if (existing.rows.length === 0) {
        // 새 참가자 추가
        const insertQuery = `
          INSERT INTO workshop_participants (
            workshop_session_id, participant_email, participant_name,
            participant_role, weight_multiplier, expertise_areas,
            invitation_status, invited_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
          RETURNING *
        `;

        const values = [
          sessionId,
          participant.email,
          participant.name,
          participant.role || 'evaluator',
          participant.weightMultiplier || 1.0,
          participant.expertiseAreas ? JSON.stringify(participant.expertiseAreas) : null,
          request.sendInvitation ? 'invited' : 'pending'
        ];

        const result = await this.db.query(insertQuery, values);
        participants.push(result.rows[0]);
      }
    }

    return participants;
  }

  /**
   * 참가자 평가 진행 상황 조회
   */
  async getParticipantProgress(sessionId: number): Promise<ParticipantProgress[]> {
    const query = `
      SELECT 
        wp.id as participant_id,
        wp.participant_name,
        wp.evaluation_status,
        wp.completion_percentage,
        wp.consistency_ratio,
        wp.participation_duration as evaluation_time,
        wp.last_activity,
        rtp.current_step
      FROM workshop_participants wp
      LEFT JOIN (
        SELECT DISTINCT ON (participant_id) participant_id, current_step
        FROM real_time_progress 
        WHERE workshop_session_id = $1
        ORDER BY participant_id, timestamp DESC
      ) rtp ON wp.id = rtp.participant_id
      WHERE wp.workshop_session_id = $1
      ORDER BY wp.participant_name
    `;

    const result = await this.db.query(query, [sessionId]);
    return result.rows;
  }

  /**
   * 워크숍 통계 조회
   */
  async getWorkshopStatistics(sessionId: number): Promise<WorkshopStatistics> {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_participants,
        COUNT(*) FILTER (WHERE invitation_status = 'invited') as invited_participants,
        COUNT(*) FILTER (WHERE evaluation_status = 'in_progress') as active_participants,
        COUNT(*) FILTER (WHERE evaluation_status = 'completed') as completed_participants,
        AVG(participation_duration) FILTER (WHERE evaluation_status = 'completed') as avg_completion_time,
        AVG(consistency_ratio) FILTER (WHERE consistency_ratio IS NOT NULL) as avg_consistency_ratio
      FROM workshop_participants
      WHERE workshop_session_id = $1
    `;

    const progressQuery = `
      SELECT 
        evaluation_step,
        COUNT(*) FILTER (WHERE step_status = 'completed') as completed_count,
        COUNT(*) as total_count
      FROM evaluator_assessments
      WHERE workshop_session_id = $1
      GROUP BY evaluation_step
    `;

    const [statsResult, progressResult] = await Promise.all([
      this.db.query(statsQuery, [sessionId]),
      this.db.query(progressQuery, [sessionId])
    ]);

    const stats = statsResult.rows[0];
    const progressByStep: { [step: string]: number } = {};

    progressResult.rows.forEach(row => {
      progressByStep[row.evaluation_step] = row.total_count > 0 
        ? (row.completed_count / row.total_count) * 100 
        : 0;
    });

    return {
      totalParticipants: parseInt(stats.total_participants),
      invitedParticipants: parseInt(stats.invited_participants),
      activeParticipants: parseInt(stats.active_participants),
      completedParticipants: parseInt(stats.completed_participants),
      averageCompletionTime: parseFloat(stats.avg_completion_time) || 0,
      averageConsistencyRatio: parseFloat(stats.avg_consistency_ratio) || 0,
      consensusLevel: 0, // 별도로 계산 필요
      progressByStep
    };
  }

  /**
   * 개별 평가 데이터 제출
   */
  async submitEvaluation(
    sessionId: number, 
    participantId: number, 
    request: SubmitEvaluationRequest
  ): Promise<EvaluatorAssessment> {
    const query = `
      INSERT INTO evaluator_assessments (
        workshop_session_id, participant_id, evaluation_step, step_status,
        criteria_id, evaluation_data, confidence_level, notes,
        started_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      ON CONFLICT (workshop_session_id, participant_id, evaluation_step, criteria_id)
      DO UPDATE SET
        evaluation_data = EXCLUDED.evaluation_data,
        confidence_level = EXCLUDED.confidence_level,
        notes = EXCLUDED.notes,
        step_status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      sessionId,
      participantId,
      request.evaluationStep,
      'completed',
      request.criteriaId,
      JSON.stringify(request.evaluationData),
      request.confidenceLevel || 3,
      request.notes,
      new Date() // started_at
    ];

    const result = await this.db.query(query, values);

    // 참가자 진행률 업데이트
    await this.updateParticipantProgress(sessionId, participantId);

    return result.rows[0];
  }

  /**
   * 그룹 합의 계산
   */
  async calculateGroupConsensus(
    sessionId: number, 
    request: CalculateConsensusRequest
  ): Promise<GroupConsensusResult> {
    // 개별 평가 결과 조회
    const evaluationsQuery = `
      SELECT ea.*, wp.weight_multiplier
      FROM evaluator_assessments ea
      JOIN workshop_participants wp ON ea.participant_id = wp.id
      WHERE ea.workshop_session_id = $1 AND ea.step_status = 'completed'
    `;

    const evaluations = await this.db.query(evaluationsQuery, [sessionId]);

    // 합의 알고리즘 적용 (간단한 기하평균 예시)
    const consensusResult = this.calculateConsensusAlgorithm(
      evaluations.rows, 
      request.consensusMethod || 'geometric_mean'
    );

    // 결과 저장
    const insertQuery = `
      INSERT INTO group_consensus_results (
        workshop_session_id, result_type, consensus_method,
        group_weights, group_scores, group_ranking,
        individual_results, consensus_level, calculation_metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      sessionId,
      request.resultType,
      request.consensusMethod || 'geometric_mean',
      JSON.stringify(consensusResult.groupWeights),
      JSON.stringify(consensusResult.groupScores),
      JSON.stringify(consensusResult.groupRanking),
      JSON.stringify(consensusResult.individualResults),
      consensusResult.consensusLevel,
      JSON.stringify(consensusResult.metadata)
    ];

    const result = await this.db.query(insertQuery, values);
    return result.rows[0];
  }

  /**
   * 실시간 진행 상황 기록
   */
  async recordRealTimeProgress(
    sessionId: number,
    participantId: number,
    eventType: RealTimeProgress['eventType'],
    eventData: any = {},
    currentStep?: string
  ): Promise<void> {
    const query = `
      INSERT INTO real_time_progress (
        workshop_session_id, participant_id, event_type, 
        event_data, current_step, timestamp
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `;

    const values = [
      sessionId,
      participantId,
      eventType,
      JSON.stringify(eventData),
      currentStep
    ];

    await this.db.query(query, values);
  }

  /**
   * 참가자 진행률 업데이트
   */
  private async updateParticipantProgress(sessionId: number, participantId: number): Promise<void> {
    // 완료된 평가 단계 수 계산
    const progressQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE step_status = 'completed') as completed_steps,
        COUNT(*) as total_steps
      FROM evaluator_assessments
      WHERE workshop_session_id = $1 AND participant_id = $2
    `;

    const progressResult = await this.db.query(progressQuery, [sessionId, participantId]);
    const { completed_steps, total_steps } = progressResult.rows[0];

    const completionPercentage = total_steps > 0 ? (completed_steps / total_steps) * 100 : 0;
    const evaluationStatus = completionPercentage === 100 ? 'completed' : 
                           completionPercentage > 0 ? 'in_progress' : 'not_started';

    // 참가자 상태 업데이트
    const updateQuery = `
      UPDATE workshop_participants 
      SET 
        completion_percentage = $1,
        evaluation_status = $2,
        last_activity = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE workshop_session_id = $3 AND id = $4
    `;

    await this.db.query(updateQuery, [completionPercentage, evaluationStatus, sessionId, participantId]);
  }

  /**
   * 합의 알고리즘 구현 (기하평균 방식)
   */
  private calculateConsensusAlgorithm(evaluations: any[], method: string): any {
    // 실제 구현에서는 더 복잡한 AHP 합의 알고리즘이 필요
    // 여기서는 간단한 예시만 제공
    
    const individualResults = evaluations.map(evaluation => ({
      participantId: evaluation.participant_id,
      weights: evaluation.individual_weights,
      scores: evaluation.individual_scores,
      weightMultiplier: evaluation.weight_multiplier
    }));

    // 기하평균을 통한 그룹 가중치 계산 (예시)
    const groupWeights = this.calculateGeometricMean(individualResults.map(r => r.weights));
    const groupScores = this.calculateGeometricMean(individualResults.map(r => r.scores));
    
    // 순위 계산
    const groupRanking = this.calculateRanking(groupScores);
    
    // 합의 수준 계산
    const consensusLevel = this.calculateConsensusLevel(individualResults);

    return {
      groupWeights,
      groupScores,
      groupRanking,
      individualResults,
      consensusLevel,
      metadata: {
        method,
        calculatedAt: new Date(),
        participantCount: individualResults.length
      }
    };
  }

  private calculateGeometricMean(values: any[]): any {
    // 기하평균 계산 로직
    // 실제 구현 필요
    return {};
  }

  private calculateRanking(scores: any): any {
    // 점수를 기반으로 순위 계산
    // 실제 구현 필요
    return {};
  }

  private calculateConsensusLevel(results: any[]): number {
    // 개별 결과들 간의 일치도 계산
    // 실제 구현 필요
    return 0.8; // 예시값
  }

  /**
   * 워크숍 세션 목록 조회
   */
  async getWorkshopSessions(facilitatorId?: number, projectId?: number): Promise<WorkshopSession[]> {
    let query = `
      SELECT ws.*, u.name as facilitator_name, p.title as project_title
      FROM workshop_sessions ws
      JOIN users u ON ws.facilitator_id = u.id
      JOIN projects p ON ws.project_id = p.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    if (facilitatorId) {
      query += ` AND ws.facilitator_id = $${paramIndex}`;
      values.push(facilitatorId);
      paramIndex++;
    }

    if (projectId) {
      query += ` AND ws.project_id = $${paramIndex}`;
      values.push(projectId);
      paramIndex++;
    }

    query += ` ORDER BY ws.created_at DESC`;

    const result = await this.db.query(query, values);
    return result.rows;
  }

  /**
   * 워크숍 세션 삭제
   */
  async deleteWorkshopSession(sessionId: number): Promise<boolean> {
    const query = `DELETE FROM workshop_sessions WHERE id = $1`;
    const result = await this.db.query(query, [sessionId]);
    return result.rowCount > 0;
  }
}