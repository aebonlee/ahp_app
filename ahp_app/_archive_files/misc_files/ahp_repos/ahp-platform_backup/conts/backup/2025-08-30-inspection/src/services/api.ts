import { API_BASE_URL } from '../config/api';

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 프로젝트 관련 타입
export interface ProjectData {
  id?: string;
  title: string;
  description: string;
  objective?: string;
  status: 'draft' | 'active' | 'completed';
  evaluation_mode: 'practical' | 'theoretical' | 'direct_input';
  workflow_stage: 'creating' | 'waiting' | 'evaluating' | 'completed';
  created_at?: string;
  updated_at?: string;
  criteria_count?: number;
  alternatives_count?: number;
}

// 기준 관련 타입
export interface CriteriaData {
  id?: string;
  project_id: string;
  name: string;
  description?: string;
  position: number;
  weight?: number;
  parent_id?: string | null;
}

// 대안 관련 타입
export interface AlternativeData {
  id?: string;
  project_id: string;
  name: string;
  description?: string;
  position: number;
  cost?: number;
}

// 평가자 관련 타입
export interface EvaluatorData {
  id?: string;
  project_id: string;
  name: string;
  email: string;
  access_key?: string;
  status: 'pending' | 'active' | 'completed';
}

// 쌍대비교 데이터 타입
export interface PairwiseComparisonData {
  id?: string;
  project_id: string;
  evaluator_id?: string;
  parent_criteria_id?: string;
  comparison_type: 'criteria' | 'alternatives';
  element_a_id: string;
  element_b_id: string;
  value: number;
  consistency_ratio?: number;
}

// HTTP 헤더 생성 함수
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// API 기본 요청 함수
const makeRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API 요청 실패');
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};

// === 프로젝트 API ===
export const projectApi = {
  // 프로젝트 목록 조회
  getProjects: () => 
    makeRequest<ProjectData[]>('/api/projects'),

  // 프로젝트 상세 조회
  getProject: (id: string) => 
    makeRequest<ProjectData>(`/api/projects/${id}`),

  // 프로젝트 생성
  createProject: (data: Omit<ProjectData, 'id'>) =>
    makeRequest<ProjectData>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 프로젝트 수정
  updateProject: (id: string, data: Partial<ProjectData>) =>
    makeRequest<ProjectData>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // 프로젝트 삭제
  deleteProject: (id: string) =>
    makeRequest<void>(`/api/projects/${id}`, {
      method: 'DELETE'
    })
};

// === 기준 API ===
export const criteriaApi = {
  // 프로젝트의 기준 목록 조회
  getCriteria: (projectId: string) =>
    makeRequest<CriteriaData[]>(`/api/projects/${projectId}/criteria`),

  // 기준 생성
  createCriteria: (data: Omit<CriteriaData, 'id'>) =>
    makeRequest<CriteriaData>('/api/criteria', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 기준 수정
  updateCriteria: (id: string, data: Partial<CriteriaData>) =>
    makeRequest<CriteriaData>(`/api/criteria/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // 기준 삭제
  deleteCriteria: (id: string) =>
    makeRequest<void>(`/api/criteria/${id}`, {
      method: 'DELETE'
    }),

  // 기준 순서 변경
  reorderCriteria: (projectId: string, criteriaIds: string[]) =>
    makeRequest<void>(`/api/projects/${projectId}/criteria/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ criteriaIds })
    })
};

// === 대안 API ===
export const alternativeApi = {
  // 프로젝트의 대안 목록 조회
  getAlternatives: (projectId: string) =>
    makeRequest<AlternativeData[]>(`/api/projects/${projectId}/alternatives`),

  // 대안 생성
  createAlternative: (data: Omit<AlternativeData, 'id'>) =>
    makeRequest<AlternativeData>('/api/alternatives', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 대안 수정
  updateAlternative: (id: string, data: Partial<AlternativeData>) =>
    makeRequest<AlternativeData>(`/api/alternatives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // 대안 삭제
  deleteAlternative: (id: string) =>
    makeRequest<void>(`/api/alternatives/${id}`, {
      method: 'DELETE'
    }),

  // 대안 순서 변경
  reorderAlternatives: (projectId: string, alternativeIds: string[]) =>
    makeRequest<void>(`/api/projects/${projectId}/alternatives/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ alternativeIds })
    })
};

// === 평가자 API ===
export const evaluatorApi = {
  // 프로젝트의 평가자 목록 조회
  getEvaluators: (projectId: string) =>
    makeRequest<EvaluatorData[]>(`/api/projects/${projectId}/evaluators`),

  // 평가자 추가
  addEvaluator: (data: Omit<EvaluatorData, 'id'>) =>
    makeRequest<EvaluatorData>('/api/evaluators', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 평가자 수정
  updateEvaluator: (id: string, data: Partial<EvaluatorData>) =>
    makeRequest<EvaluatorData>(`/api/evaluators/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // 평가자 삭제
  removeEvaluator: (id: string) =>
    makeRequest<void>(`/api/evaluators/${id}`, {
      method: 'DELETE'
    }),

  // 평가 초대 이메일 발송
  sendInvitation: (projectId: string, evaluatorIds: string[]) =>
    makeRequest<void>(`/api/projects/${projectId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ evaluatorIds })
    })
};

// === 평가 데이터 API ===
export const evaluationApi = {
  // 쌍대비교 데이터 저장
  savePairwiseComparison: (data: Omit<PairwiseComparisonData, 'id'>) =>
    makeRequest<PairwiseComparisonData>('/api/comparisons', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 쌍대비교 데이터 조회
  getPairwiseComparisons: (projectId: string, evaluatorId?: string) =>
    makeRequest<PairwiseComparisonData[]>(
      `/api/projects/${projectId}/comparisons${evaluatorId ? `?evaluatorId=${evaluatorId}` : ''}`
    ),

  // 평가 세션 상태 업데이트
  updateEvaluationSession: (projectId: string, evaluatorId: string, data: any) =>
    makeRequest<void>(`/api/projects/${projectId}/evaluators/${evaluatorId}/session`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};

// === 결과 분석 API ===
export const resultsApi = {
  // AHP 계산 결과 조회
  getResults: (projectId: string) =>
    makeRequest<any>(`/api/projects/${projectId}/results`),

  // 개별 평가자 결과 조회
  getIndividualResults: (projectId: string, evaluatorId: string) =>
    makeRequest<any>(`/api/projects/${projectId}/evaluators/${evaluatorId}/results`),

  // 그룹 결과 계산 및 조회
  calculateGroupResults: (projectId: string) =>
    makeRequest<any>(`/api/projects/${projectId}/results/calculate`, {
      method: 'POST'
    }),

  // 민감도 분석 실행
  runSensitivityAnalysis: (projectId: string, parameters?: any) =>
    makeRequest<any>(`/api/projects/${projectId}/analysis/sensitivity`, {
      method: 'POST',
      body: JSON.stringify(parameters || {})
    })
};

// === 데이터 내보내기 API ===
export const exportApi = {
  // Excel 내보내기
  exportToExcel: (projectId: string) =>
    makeRequest<Blob>(`/api/projects/${projectId}/export/excel`, {
      method: 'GET'
    }),

  // PDF 보고서 생성
  generateReport: (projectId: string, options?: any) =>
    makeRequest<Blob>(`/api/projects/${projectId}/export/report`, {
      method: 'POST',
      body: JSON.stringify(options || {})
    })
};

// === 인증 API ===
export const authApi = {
  // 로그인
  login: (email: string, password: string) =>
    makeRequest<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  // 사용자 정보 조회
  getCurrentUser: () =>
    makeRequest<any>('/api/auth/me'),

  // 토큰 검증
  verifyToken: () =>
    makeRequest<any>('/api/auth/verify')
};

const apiExports = {
  project: projectApi,
  criteria: criteriaApi,
  alternative: alternativeApi,
  evaluator: evaluatorApi,
  evaluation: evaluationApi,
  results: resultsApi,
  export: exportApi,
  auth: authApi
};

export default apiExports;