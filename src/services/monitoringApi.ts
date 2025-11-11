// 실시간 모니터링 API 서비스
// Opus 4.1 설계 기반

import type {
  RealtimeMetrics,
  ActiveUser,
  ProjectProgress,
  MonitoringAlert,
  AnomalyDetection,
  PerformanceMetrics,
  EvaluationEvent,
  GetMetricsRequest,
  CreateAlertRuleRequest,
  MonitoringAPIResponse,
  PredictionResult,
  TrendAnalysis,
  DashboardFilter
} from '../types/monitoring';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
async function handleResponse<T>(response: Response): Promise<MonitoringAPIResponse<T>> {
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorData}`);
  }

  return await response.json();
}

// =============================================================================
// 실시간 메트릭 API
// =============================================================================

/**
 * 실시간 메트릭 조회
 */
export async function getRealtimeMetrics(projectId?: string): Promise<MonitoringAPIResponse<RealtimeMetrics>> {
  const url = projectId 
    ? `${API_BASE_URL}/api/monitoring/metrics?projectId=${projectId}`
    : `${API_BASE_URL}/api/monitoring/metrics`;
    
  const response = await fetch(url, createFetchOptions());
  return handleResponse<RealtimeMetrics>(response);
}

/**
 * 히스토리컬 메트릭 조회
 */
export async function getHistoricalMetrics(request: GetMetricsRequest): Promise<MonitoringAPIResponse<RealtimeMetrics[]>> {
  const queryParams = new URLSearchParams({
    granularity: request.granularity,
    start: request.timeRange.start,
    end: request.timeRange.end
  });

  if (request.projectId) {
    queryParams.append('projectId', request.projectId);
  }

  if (request.metrics) {
    request.metrics.forEach(metric => queryParams.append('metrics', metric));
  }

  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/metrics/historical?${queryParams}`,
    createFetchOptions()
  );
  return handleResponse<RealtimeMetrics[]>(response);
}

/**
 * 메트릭 집계
 */
export async function getAggregatedMetrics(
  projectIds: string[],
  timeRange: { start: string; end: string },
  aggregationType: 'sum' | 'avg' | 'max' | 'min' = 'avg'
): Promise<MonitoringAPIResponse<RealtimeMetrics>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/metrics/aggregated`,
    createFetchOptions('POST', {
      projectIds,
      timeRange,
      aggregationType
    })
  );
  return handleResponse<RealtimeMetrics>(response);
}

// =============================================================================
// 활성 사용자 API
// =============================================================================

/**
 * 활성 사용자 목록 조회
 */
export async function getActiveUsers(projectId?: string): Promise<MonitoringAPIResponse<ActiveUser[]>> {
  const url = projectId 
    ? `${API_BASE_URL}/api/monitoring/active-users?projectId=${projectId}`
    : `${API_BASE_URL}/api/monitoring/active-users`;
    
  const response = await fetch(url, createFetchOptions());
  return handleResponse<ActiveUser[]>(response);
}

/**
 * 사용자 활동 히스토리 조회
 */
export async function getUserActivityHistory(
  evaluatorId: string,
  timeRange: { start: string; end: string }
): Promise<MonitoringAPIResponse<EvaluationEvent[]>> {
  const queryParams = new URLSearchParams({
    start: timeRange.start,
    end: timeRange.end
  });

  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/users/${evaluatorId}/activity?${queryParams}`,
    createFetchOptions()
  );
  return handleResponse<EvaluationEvent[]>(response);
}

/**
 * 사용자 상태 업데이트
 */
export async function updateUserStatus(
  evaluatorId: string,
  status: 'online' | 'evaluating' | 'idle' | 'offline',
  currentNodeId?: string
): Promise<MonitoringAPIResponse<void>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/users/${evaluatorId}/status`,
    createFetchOptions('PATCH', { status, currentNodeId })
  );
  return handleResponse<void>(response);
}

// =============================================================================
// 프로젝트 진행률 API
// =============================================================================

/**
 * 프로젝트 진행률 조회
 */
export async function getProjectProgress(projectId: string): Promise<MonitoringAPIResponse<ProjectProgress>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/progress/${projectId}`,
    createFetchOptions()
  );
  return handleResponse<ProjectProgress>(response);
}

/**
 * 전체 프로젝트 진행률 조회
 */
export async function getAllProjectsProgress(): Promise<MonitoringAPIResponse<ProjectProgress[]>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/progress`,
    createFetchOptions()
  );
  return handleResponse<ProjectProgress[]>(response);
}

/**
 * 진행률 예측
 */
export async function predictCompletion(projectId: string): Promise<MonitoringAPIResponse<{
  estimatedCompletionDate: string;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
}>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/progress/${projectId}/prediction`,
    createFetchOptions()
  );
  return handleResponse<{
    estimatedCompletionDate: string;
    confidence: number;
    factors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
  }>(response);
}

// =============================================================================
// 알림 및 알러트 API
// =============================================================================

/**
 * 활성 알림 목록 조회
 */
export async function getActiveAlerts(filter?: DashboardFilter): Promise<MonitoringAPIResponse<MonitoringAlert[]>> {
  const queryParams = new URLSearchParams();
  
  if (filter?.projectIds) {
    filter.projectIds.forEach(id => queryParams.append('projectId', id));
  }
  
  if (filter?.severityLevel && filter.severityLevel !== 'all') {
    queryParams.append('severity', filter.severityLevel);
  }
  
  if (filter?.includeResolved === false) {
    queryParams.append('includeResolved', 'false');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/alerts?${queryParams}`,
    createFetchOptions()
  );
  return handleResponse<MonitoringAlert[]>(response);
}

/**
 * 알림 확인 처리
 */
export async function acknowledgeAlert(alertId: string): Promise<MonitoringAPIResponse<void>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/alerts/${alertId}/acknowledge`,
    createFetchOptions('POST')
  );
  return handleResponse<void>(response);
}

/**
 * 알림 해결 처리
 */
export async function resolveAlert(alertId: string, resolution?: string): Promise<MonitoringAPIResponse<void>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/alerts/${alertId}/resolve`,
    createFetchOptions('POST', { resolution })
  );
  return handleResponse<void>(response);
}

/**
 * 알림 규칙 생성
 */
export async function createAlertRule(rule: CreateAlertRuleRequest): Promise<MonitoringAPIResponse<{
  ruleId: string;
  status: 'active' | 'inactive';
}>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/alert-rules`,
    createFetchOptions('POST', rule)
  );
  return handleResponse<{
    ruleId: string;
    status: 'active' | 'inactive';
  }>(response);
}

/**
 * 알림 규칙 목록 조회
 */
export async function getAlertRules(projectId?: string): Promise<MonitoringAPIResponse<Array<{
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  metric: string;
  operator: string;
  threshold: number;
  isActive: boolean;
  lastTriggered?: string;
}>>> {
  const url = projectId 
    ? `${API_BASE_URL}/api/monitoring/alert-rules?projectId=${projectId}`
    : `${API_BASE_URL}/api/monitoring/alert-rules`;
    
  const response = await fetch(url, createFetchOptions());
  return handleResponse<Array<{
    id: string;
    name: string;
    description?: string;
    projectId?: string;
    metric: string;
    operator: string;
    threshold: number;
    isActive: boolean;
    lastTriggered?: string;
  }>>(response);
}

// =============================================================================
// 이상 탐지 API
// =============================================================================

/**
 * 이상 탐지 결과 조회
 */
export async function getAnomalies(
  projectId?: string,
  timeRange?: { start: string; end: string }
): Promise<MonitoringAPIResponse<AnomalyDetection[]>> {
  const queryParams = new URLSearchParams();
  
  if (projectId) {
    queryParams.append('projectId', projectId);
  }
  
  if (timeRange) {
    queryParams.append('start', timeRange.start);
    queryParams.append('end', timeRange.end);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/anomalies?${queryParams}`,
    createFetchOptions()
  );
  return handleResponse<AnomalyDetection[]>(response);
}

/**
 * 이상 탐지 실행
 */
export async function runAnomalyDetection(
  projectId: string,
  detectionType: 'statistical' | 'pattern' | 'ml' | 'all' = 'all'
): Promise<MonitoringAPIResponse<AnomalyDetection[]>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/anomalies/detect`,
    createFetchOptions('POST', { projectId, detectionType })
  );
  return handleResponse<AnomalyDetection[]>(response);
}

/**
 * 이상 상황 해결 표시
 */
export async function resolveAnomaly(
  anomalyId: string,
  resolution: string
): Promise<MonitoringAPIResponse<void>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/anomalies/${anomalyId}/resolve`,
    createFetchOptions('POST', { resolution })
  );
  return handleResponse<void>(response);
}

// =============================================================================
// 성능 메트릭 API
// =============================================================================

/**
 * 시스템 성능 메트릭 조회
 */
export async function getPerformanceMetrics(): Promise<MonitoringAPIResponse<PerformanceMetrics>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/performance`,
    createFetchOptions()
  );
  return handleResponse<PerformanceMetrics>(response);
}

/**
 * 성능 히스토리 조회
 */
export async function getPerformanceHistory(
  timeRange: { start: string; end: string },
  granularity: '1m' | '5m' | '15m' | '1h' = '5m'
): Promise<MonitoringAPIResponse<PerformanceMetrics[]>> {
  const queryParams = new URLSearchParams({
    start: timeRange.start,
    end: timeRange.end,
    granularity
  });

  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/performance/history?${queryParams}`,
    createFetchOptions()
  );
  return handleResponse<PerformanceMetrics[]>(response);
}

// =============================================================================
// 예측 분석 API
// =============================================================================

/**
 * 메트릭 예측
 */
export async function predictMetric(
  metric: string,
  projectId?: string,
  forecastHours: number = 24
): Promise<MonitoringAPIResponse<PredictionResult>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/predictions/${metric}`,
    createFetchOptions('POST', { projectId, forecastHours })
  );
  return handleResponse<PredictionResult>(response);
}

/**
 * 트렌드 분석
 */
export async function analyzeTrend(
  metric: string,
  timeRange: { start: string; end: string },
  projectId?: string
): Promise<MonitoringAPIResponse<TrendAnalysis>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/trends/${metric}`,
    createFetchOptions('POST', { timeRange, projectId })
  );
  return handleResponse<TrendAnalysis>(response);
}

// =============================================================================
// 이벤트 스트림 API
// =============================================================================

/**
 * 평가 이벤트 기록
 */
export async function recordEvent(event: Omit<EvaluationEvent, 'id' | 'timestamp'>): Promise<MonitoringAPIResponse<void>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/events`,
    createFetchOptions('POST', event)
  );
  return handleResponse<void>(response);
}

/**
 * 이벤트 히스토리 조회
 */
export async function getEventHistory(
  projectId: string,
  timeRange: { start: string; end: string },
  eventTypes?: string[],
  evaluatorId?: string
): Promise<MonitoringAPIResponse<EvaluationEvent[]>> {
  const queryParams = new URLSearchParams({
    start: timeRange.start,
    end: timeRange.end
  });

  if (eventTypes) {
    eventTypes.forEach(type => queryParams.append('eventType', type));
  }

  if (evaluatorId) {
    queryParams.append('evaluatorId', evaluatorId);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/events/${projectId}/history?${queryParams}`,
    createFetchOptions()
  );
  return handleResponse<EvaluationEvent[]>(response);
}

// =============================================================================
// 대시보드 설정 API
// =============================================================================

/**
 * 대시보드 설정 저장
 */
export async function saveDashboardConfig(
  userId: string,
  config: {
    layout: string;
    widgets: Array<{
      type: string;
      position: { x: number; y: number; w: number; h: number };
      config: Record<string, any>;
    }>;
    filters: DashboardFilter;
  }
): Promise<MonitoringAPIResponse<void>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/dashboard/config`,
    createFetchOptions('POST', { userId, config })
  );
  return handleResponse<void>(response);
}

/**
 * 대시보드 설정 조회
 */
export async function getDashboardConfig(userId: string): Promise<MonitoringAPIResponse<{
  layout: string;
  widgets: Array<{
    type: string;
    position: { x: number; y: number; w: number; h: number };
    config: Record<string, any>;
  }>;
  filters: DashboardFilter;
}>> {
  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/dashboard/config?userId=${userId}`,
    createFetchOptions()
  );
  return handleResponse<{
    layout: string;
    widgets: Array<{
      type: string;
      position: { x: number; y: number; w: number; h: number };
      config: Record<string, any>;
    }>;
    filters: DashboardFilter;
  }>(response);
}

// =============================================================================
// WebSocket 연결 관리
// =============================================================================

/**
 * 모니터링 WebSocket 연결
 */
export function connectToMonitoringWebSocket(
  projectId?: string,
  onMessage?: (data: any) => void,
  onError?: (error: Event) => void
): WebSocket {
  const wsUrl = projectId 
    ? `ws://localhost:8000/ws/monitoring/${projectId}/`
    : `ws://localhost:8000/ws/monitoring/global/`;
    
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('모니터링 WebSocket 연결됨');
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
    console.log('모니터링 WebSocket 연결 종료');
  };

  return ws;
}

/**
 * 실시간 업데이트 브로드캐스트
 */
export function broadcastUpdate(
  ws: WebSocket,
  updateType: string,
  data: any,
  projectId?: string
): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'update',
      updateType,
      projectId,
      data,
      timestamp: new Date().toISOString()
    }));
  }
}