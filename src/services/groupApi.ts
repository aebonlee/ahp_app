// 그룹 평가 시스템 API 서비스
// Opus 4.1 설계 기반

import type {
  EvaluationGroup,
  GroupMember,
  GroupEvaluationSession,
  DelphiRound,
  GroupAggregatedMatrix,
  GroupCalculationResult,
  ConsensusMetrics,
  GroupMonitoringData,
  CreateGroupRequest,
  JoinGroupRequest,
  SubmitGroupComparisonRequest,
  StartDelphiRoundRequest,
  GroupAPIResponse
} from '../types/group';
import { API_BASE_URL } from '../config/api';

/**
 * 인증 토큰 가져오기
 */
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * 기본 fetch 설정
 */
function createFetchOptions(method: string = 'GET', body?: any): RequestInit {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = getAuthToken();
  if (token) {
    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
}

/**
 * API 응답 처리
 */
async function handleResponse<T>(response: Response): Promise<GroupAPIResponse<T>> {
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorData}`);
  }

  return await response.json();
}

// =============================================================================
// 그룹 관리 API
// =============================================================================

/**
 * 프로젝트의 평가 그룹 목록 조회
 */
export async function getEvaluationGroups(projectId: string): Promise<GroupAPIResponse<EvaluationGroup[]>> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/evaluation-groups`,
    createFetchOptions()
  );
  return handleResponse<EvaluationGroup[]>(response);
}

/**
 * 특정 그룹 정보 조회
 */
export async function getEvaluationGroup(groupId: string): Promise<GroupAPIResponse<EvaluationGroup>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}`,
    createFetchOptions()
  );
  return handleResponse<EvaluationGroup>(response);
}

/**
 * 새 평가 그룹 생성
 */
export async function createEvaluationGroup(data: CreateGroupRequest): Promise<GroupAPIResponse<EvaluationGroup>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups`,
    createFetchOptions('POST', data)
  );
  return handleResponse<EvaluationGroup>(response);
}

/**
 * 그룹 설정 수정
 */
export async function updateEvaluationGroup(
  groupId: string, 
  updates: Partial<EvaluationGroup>
): Promise<GroupAPIResponse<EvaluationGroup>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}`,
    createFetchOptions('PATCH', updates)
  );
  return handleResponse<EvaluationGroup>(response);
}

/**
 * 그룹 삭제
 */
export async function deleteEvaluationGroup(groupId: string): Promise<GroupAPIResponse<void>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}`,
    createFetchOptions('DELETE')
  );
  return handleResponse<void>(response);
}

// =============================================================================
// 그룹 멤버 관리 API
// =============================================================================

/**
 * 그룹 멤버 목록 조회
 */
export async function getGroupMembers(groupId: string): Promise<GroupAPIResponse<GroupMember[]>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/members`,
    createFetchOptions()
  );
  return handleResponse<GroupMember[]>(response);
}

/**
 * 그룹 참여
 */
export async function joinGroup(data: JoinGroupRequest): Promise<GroupAPIResponse<GroupMember>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${data.groupId}/join`,
    createFetchOptions('POST', data)
  );
  return handleResponse<GroupMember>(response);
}

/**
 * 그룹 탈퇴
 */
export async function leaveGroup(groupId: string, evaluatorId: string): Promise<GroupAPIResponse<void>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/members/${evaluatorId}`,
    createFetchOptions('DELETE')
  );
  return handleResponse<void>(response);
}

/**
 * 멤버 역할 변경
 */
export async function updateMemberRole(
  groupId: string,
  memberId: string,
  role: string
): Promise<GroupAPIResponse<GroupMember>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/members/${memberId}/role`,
    createFetchOptions('PATCH', { role })
  );
  return handleResponse<GroupMember>(response);
}

/**
 * 멤버 가중치 설정
 */
export async function updateMemberWeight(
  groupId: string,
  memberId: string,
  weight: number
): Promise<GroupAPIResponse<GroupMember>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/members/${memberId}/weight`,
    createFetchOptions('PATCH', { weight })
  );
  return handleResponse<GroupMember>(response);
}

// =============================================================================
// 그룹 평가 세션 API
// =============================================================================

/**
 * 그룹 평가 세션 생성
 */
export async function createGroupEvaluationSession(data: {
  groupId: string;
  sessionType: 'synchronous' | 'asynchronous' | 'delphi';
  consensusThreshold: number;
  maxRounds?: number;
}): Promise<GroupAPIResponse<GroupEvaluationSession>> {
  const response = await fetch(
    `${API_BASE_URL}/api/group-evaluation-sessions`,
    createFetchOptions('POST', data)
  );
  return handleResponse<GroupEvaluationSession>(response);
}

/**
 * 현재 활성 세션 조회
 */
export async function getCurrentSession(groupId: string): Promise<GroupAPIResponse<GroupEvaluationSession>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/current-session`,
    createFetchOptions()
  );
  return handleResponse<GroupEvaluationSession>(response);
}

/**
 * 세션 상태 업데이트
 */
export async function updateSessionStatus(
  sessionId: string,
  status: string
): Promise<GroupAPIResponse<GroupEvaluationSession>> {
  const response = await fetch(
    `${API_BASE_URL}/api/group-evaluation-sessions/${sessionId}/status`,
    createFetchOptions('PATCH', { status })
  );
  return handleResponse<GroupEvaluationSession>(response);
}

// =============================================================================
// Delphi 방법 API
// =============================================================================

/**
 * 새로운 Delphi 라운드 시작
 */
export async function startDelphiRound(data: StartDelphiRoundRequest): Promise<GroupAPIResponse<DelphiRound>> {
  const response = await fetch(
    `${API_BASE_URL}/api/delphi-rounds`,
    createFetchOptions('POST', data)
  );
  return handleResponse<DelphiRound>(response);
}

/**
 * Delphi 라운드 정보 조회
 */
export async function getDelphiRound(roundId: string): Promise<GroupAPIResponse<DelphiRound>> {
  const response = await fetch(
    `${API_BASE_URL}/api/delphi-rounds/${roundId}`,
    createFetchOptions()
  );
  return handleResponse<DelphiRound>(response);
}

/**
 * 세션의 모든 라운드 조회
 */
export async function getDelphiRounds(sessionId: string): Promise<GroupAPIResponse<DelphiRound[]>> {
  const response = await fetch(
    `${API_BASE_URL}/api/group-evaluation-sessions/${sessionId}/delphi-rounds`,
    createFetchOptions()
  );
  return handleResponse<DelphiRound[]>(response);
}

/**
 * 라운드 완료
 */
export async function completeDelphiRound(
  roundId: string,
  feedbackSummary?: string
): Promise<GroupAPIResponse<DelphiRound>> {
  const response = await fetch(
    `${API_BASE_URL}/api/delphi-rounds/${roundId}/complete`,
    createFetchOptions('POST', { feedbackSummary })
  );
  return handleResponse<DelphiRound>(response);
}

// =============================================================================
// 그룹 쌍대비교 API
// =============================================================================

/**
 * 그룹 쌍대비교 제출
 */
export async function submitGroupComparisons(
  data: SubmitGroupComparisonRequest
): Promise<GroupAPIResponse<void>> {
  const response = await fetch(
    `${API_BASE_URL}/api/group-comparisons`,
    createFetchOptions('POST', data)
  );
  return handleResponse<void>(response);
}

/**
 * 개별 평가자 비교 데이터 조회
 */
export async function getIndividualComparisons(
  groupId: string,
  nodeId: string,
  evaluatorId: string
): Promise<GroupAPIResponse<number[][]>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/nodes/${nodeId}/comparisons/${evaluatorId}`,
    createFetchOptions()
  );
  return handleResponse<number[][]>(response);
}

/**
 * 모든 평가자 비교 데이터 조회
 */
export async function getAllComparisons(
  groupId: string,
  nodeId: string
): Promise<GroupAPIResponse<Array<{
  evaluatorId: string;
  matrix: number[][];
  consistency: number;
  submittedAt: string;
}>>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/nodes/${nodeId}/all-comparisons`,
    createFetchOptions()
  );
  return handleResponse<Array<{
    evaluatorId: string;
    matrix: number[][];
    consistency: number;
    submittedAt: string;
  }>>(response);
}

// =============================================================================
// 그룹 계산 및 통합 API
// =============================================================================

/**
 * 그룹 매트릭스 통합 계산
 */
export async function calculateGroupAggregation(data: {
  groupId: string;
  nodeId: string;
  aggregationMethod: string;
  evaluatorWeights?: Record<string, number>;
}): Promise<GroupAPIResponse<GroupCalculationResult>> {
  const response = await fetch(
    `${API_BASE_URL}/api/group-aggregation/calculate`,
    createFetchOptions('POST', data)
  );
  return handleResponse<GroupCalculationResult>(response);
}

/**
 * 통합된 그룹 매트릭스 조회
 */
export async function getGroupAggregatedMatrix(
  groupId: string,
  nodeId: string
): Promise<GroupAPIResponse<GroupAggregatedMatrix>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/nodes/${nodeId}/aggregated-matrix`,
    createFetchOptions()
  );
  return handleResponse<GroupAggregatedMatrix>(response);
}

/**
 * 합의 지표 계산
 */
export async function calculateConsensusMetrics(
  groupId: string,
  nodeId: string
): Promise<GroupAPIResponse<ConsensusMetrics>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/nodes/${nodeId}/consensus`,
    createFetchOptions()
  );
  return handleResponse<ConsensusMetrics>(response);
}

/**
 * 그룹 전체 가중치 계산
 */
export async function calculateGroupGlobalWeights(
  groupId: string
): Promise<GroupAPIResponse<Record<string, number>>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/global-weights`,
    createFetchOptions()
  );
  return handleResponse<Record<string, number>>(response);
}

// =============================================================================
// 실시간 모니터링 API
// =============================================================================

/**
 * 그룹 모니터링 데이터 조회
 */
export async function getGroupMonitoringData(groupId: string): Promise<GroupAPIResponse<GroupMonitoringData>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/monitoring`,
    createFetchOptions()
  );
  return handleResponse<GroupMonitoringData>(response);
}

/**
 * 실시간 진행률 조회
 */
export async function getGroupProgress(groupId: string): Promise<GroupAPIResponse<{
  totalNodes: number;
  completedNodes: number;
  participantProgress: Array<{
    evaluatorId: string;
    completedNodes: number;
    lastActivity: string;
  }>;
}>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/progress`,
    createFetchOptions()
  );
  return handleResponse<{
    totalNodes: number;
    completedNodes: number;
    participantProgress: Array<{
      evaluatorId: string;
      completedNodes: number;
      lastActivity: string;
    }>;
  }>(response);
}

/**
 * 그룹 활동 로그 조회
 */
export async function getGroupActivityLog(
  groupId: string,
  limit: number = 50
): Promise<GroupAPIResponse<Array<{
  id: string;
  evaluatorId: string;
  action: string;
  nodeId?: string;
  details: Record<string, any>;
  timestamp: string;
}>>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/activity-log?limit=${limit}`,
    createFetchOptions()
  );
  return handleResponse<Array<{
    id: string;
    evaluatorId: string;
    action: string;
    nodeId?: string;
    details: Record<string, any>;
    timestamp: string;
  }>>(response);
}

// =============================================================================
// 결과 내보내기 API
// =============================================================================

/**
 * 그룹 평가 결과 내보내기
 */
export async function exportGroupResults(
  groupId: string,
  format: 'excel' | 'pdf' | 'json' = 'excel'
): Promise<GroupAPIResponse<{
  downloadUrl: string;
  fileName: string;
  fileSize: number;
}>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/export?format=${format}`,
    createFetchOptions()
  );
  return handleResponse<{
    downloadUrl: string;
    fileName: string;
    fileSize: number;
  }>(response);
}

/**
 * 그룹 보고서 생성
 */
export async function generateGroupReport(
  groupId: string,
  includeIndividualResults: boolean = true
): Promise<GroupAPIResponse<{
  reportId: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
}>> {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluation-groups/${groupId}/report`,
    createFetchOptions('POST', { includeIndividualResults })
  );
  return handleResponse<{
    reportId: string;
    status: 'generating' | 'completed' | 'failed';
    downloadUrl?: string;
  }>(response);
}

// =============================================================================
// WebSocket 연결 관리
// =============================================================================

/**
 * 그룹 WebSocket 연결
 */
export function connectToGroupWebSocket(
  groupId: string,
  onMessage?: (data: any) => void,
  onError?: (error: Event) => void
): WebSocket {
  const wsBaseUrl = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
  const wsUrl = `${wsBaseUrl}/ws/group/${groupId}/`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log(`그룹 ${groupId} WebSocket 연결됨`);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    } catch (error) {
      console.error('WebSocket 메시지 파싱 오류:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket 오류:', error);
    onError?.(error);
  };

  ws.onclose = () => {
    console.log(`그룹 ${groupId} WebSocket 연결 종료`);
  };

  return ws;
}

/**
 * 평가자 상태 브로드캐스트
 */
export function broadcastEvaluatorStatus(
  ws: WebSocket,
  status: 'online' | 'evaluating' | 'idle' | 'offline',
  currentNodeId?: string
): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'evaluator_status',
      status,
      currentNodeId,
      timestamp: new Date().toISOString()
    }));
  }
}