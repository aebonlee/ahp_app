// 계층적 평가 시스템 API 서비스
// Opus 4.1 설계 문서 기반

import type { 
  HierarchyNode,
  EvaluationSession,
  EvaluationProgress,
  HierarchicalComparison,
  ConsistencyResult,
  CreateHierarchyRequest,
  CreateEvaluationRequest,
  SubmitComparisonRequest,
  HierarchyAPIResponse
} from '../types/hierarchy';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// API 호출 유틸리티
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<HierarchyAPIResponse<T>> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const hierarchyApi = {
  // 계층 구조 관리
  async getHierarchy(projectId: string): Promise<HierarchyAPIResponse<HierarchyNode[]>> {
    return apiCall(`/api/projects/${projectId}/hierarchy`);
  },

  async createHierarchy(request: CreateHierarchyRequest): Promise<HierarchyAPIResponse<HierarchyNode[]>> {
    return apiCall('/api/hierarchy/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateHierarchyNode(
    nodeId: string, 
    updates: Partial<HierarchyNode>
  ): Promise<HierarchyAPIResponse<HierarchyNode>> {
    return apiCall(`/api/hierarchy/nodes/${nodeId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteHierarchyNode(nodeId: string): Promise<HierarchyAPIResponse<void>> {
    return apiCall(`/api/hierarchy/nodes/${nodeId}`, {
      method: 'DELETE',
    });
  },

  // 계층 구조 검증
  async validateHierarchy(projectId: string): Promise<HierarchyAPIResponse<{
    isValid: boolean;
    errors: string[];
  }>> {
    return apiCall(`/api/projects/${projectId}/hierarchy/validate`);
  },

  // 평가 세션 관리
  async createEvaluationSession(
    request: CreateEvaluationRequest
  ): Promise<HierarchyAPIResponse<EvaluationSession>> {
    return apiCall('/api/evaluation-sessions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getEvaluationSession(sessionId: string): Promise<HierarchyAPIResponse<EvaluationSession>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}`);
  },

  async updateEvaluationSession(
    sessionId: string,
    updates: Partial<EvaluationSession>
  ): Promise<HierarchyAPIResponse<EvaluationSession>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getEvaluationSessions(params: {
    projectId?: string;
    evaluatorId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<HierarchyAPIResponse<EvaluationSession[]>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return apiCall(`/api/evaluation-sessions?${queryParams}`);
  },

  // 평가 진행률
  async getEvaluationProgress(sessionId: string): Promise<HierarchyAPIResponse<EvaluationProgress>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}/progress`);
  },

  // 쌍대비교 관리
  async getComparisons(
    sessionId: string,
    nodeId?: string
  ): Promise<HierarchyAPIResponse<HierarchicalComparison[]>> {
    const endpoint = nodeId 
      ? `/api/evaluation-sessions/${sessionId}/comparisons?nodeId=${nodeId}`
      : `/api/evaluation-sessions/${sessionId}/comparisons`;
    
    return apiCall(endpoint);
  },

  async submitComparisons(
    request: SubmitComparisonRequest
  ): Promise<HierarchyAPIResponse<HierarchicalComparison[]>> {
    return apiCall('/api/comparisons/submit', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateComparison(
    comparisonId: string,
    value: number
  ): Promise<HierarchyAPIResponse<HierarchicalComparison>> {
    return apiCall(`/api/comparisons/${comparisonId}`, {
      method: 'PATCH',
      body: JSON.stringify({ value }),
    });
  },

  // 일관성 계산
  async calculateConsistency(
    sessionId: string,
    nodeId: string
  ): Promise<HierarchyAPIResponse<ConsistencyResult>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}/consistency/${nodeId}`);
  },

  async getConsistencyReport(sessionId: string): Promise<HierarchyAPIResponse<{
    overallConsistency: ConsistencyResult;
    nodeConsistencies: Record<string, ConsistencyResult>;
  }>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}/consistency-report`);
  },

  // 가중치 계산
  async calculateWeights(
    sessionId: string,
    nodeId?: string
  ): Promise<HierarchyAPIResponse<Record<string, number>>> {
    const endpoint = nodeId 
      ? `/api/evaluation-sessions/${sessionId}/weights/${nodeId}`
      : `/api/evaluation-sessions/${sessionId}/weights`;
    
    return apiCall(endpoint);
  },

  async getGlobalWeights(
    sessionId: string
  ): Promise<HierarchyAPIResponse<Record<string, number>>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}/global-weights`);
  },

  // 평가 단계 관리
  async getEvaluationSteps(sessionId: string): Promise<HierarchyAPIResponse<any[]>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}/steps`);
  },

  async getCurrentStep(sessionId: string): Promise<HierarchyAPIResponse<any>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}/current-step`);
  },

  async completeStep(
    sessionId: string,
    stepId: string
  ): Promise<HierarchyAPIResponse<any>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}/steps/${stepId}/complete`, {
      method: 'POST',
    });
  },

  // 결과 내보내기
  async exportResults(
    sessionId: string,
    format: 'json' | 'csv' | 'excel'
  ): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/api/evaluation-sessions/${sessionId}/export?format=${format}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  },

  // 평가 템플릿
  async getEvaluationTemplates(): Promise<HierarchyAPIResponse<any[]>> {
    return apiCall('/api/evaluation-templates');
  },

  async createEvaluationTemplate(template: any): Promise<HierarchyAPIResponse<any>> {
    return apiCall('/api/evaluation-templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  // 실시간 업데이트 (WebSocket)
  createWebSocketConnection(sessionId: string): WebSocket {
    const wsUrl = `ws://localhost:8000/ws/evaluation/${sessionId}/`;
    return new WebSocket(wsUrl);
  },

  // 평가 보고서
  async generateEvaluationReport(
    sessionId: string,
    options?: {
      includeComparisons?: boolean;
      includeConsistency?: boolean;
      includeWeights?: boolean;
    }
  ): Promise<HierarchyAPIResponse<any>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}/report`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  },

  // 평가 복사/복제
  async cloneEvaluation(
    sessionId: string,
    newProjectId?: string
  ): Promise<HierarchyAPIResponse<EvaluationSession>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}/clone`, {
      method: 'POST',
      body: JSON.stringify({ newProjectId }),
    });
  },

  // 평가 권한 관리
  async shareEvaluation(
    sessionId: string,
    evaluatorIds: string[],
    permissions: string[]
  ): Promise<HierarchyAPIResponse<void>> {
    return apiCall(`/api/evaluation-sessions/${sessionId}/share`, {
      method: 'POST',
      body: JSON.stringify({ evaluatorIds, permissions }),
    });
  },

  // 평가 통계
  async getEvaluationStatistics(
    projectId: string,
    timeRange?: {
      startDate: string;
      endDate: string;
    }
  ): Promise<HierarchyAPIResponse<{
    totalEvaluations: number;
    completedEvaluations: number;
    averageCompletionTime: number;
    averageConsistency: number;
    evaluatorCount: number;
  }>> {
    const queryParams = timeRange 
      ? `?startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
      : '';
    
    return apiCall(`/api/projects/${projectId}/evaluation-statistics${queryParams}`);
  },

  // 평가자 성과 분석
  async getEvaluatorPerformance(
    evaluatorId: string,
    projectId?: string
  ): Promise<HierarchyAPIResponse<{
    totalEvaluations: number;
    averageConsistency: number;
    completionRate: number;
    averageTimePerComparison: number;
  }>> {
    const queryParams = projectId ? `?projectId=${projectId}` : '';
    return apiCall(`/api/evaluators/${evaluatorId}/performance${queryParams}`);
  }
};

export default hierarchyApi;