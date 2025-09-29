import { API_BASE_URL } from '../config/api';

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Django API 원본 응답 타입 (백엔드에서 실제로 받는 형식)
export interface DjangoProjectResponse {
  id: string;
  title: string;
  description: string;
  objective?: string;
  status: 'draft' | 'active' | 'completed' | 'deleted' | 'evaluation' | 'archived';
  evaluation_mode: 'practical' | 'theoretical' | 'direct_input' | 'fuzzy_ahp';
  workflow_stage: 'creating' | 'waiting' | 'evaluating' | 'completed';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deadline?: string;
  criteria_count: number;
  alternatives_count: number;
  member_count?: number;
  owner?: string;
  tags?: string[];
}

// 프론트엔드에서 사용하는 정규화된 타입
export interface ProjectData {
  id?: string;
  title: string;
  description: string;
  objective?: string;
  status: 'draft' | 'active' | 'completed' | 'deleted';
  evaluation_mode: 'practical' | 'theoretical' | 'direct_input' | 'fuzzy_ahp';
  workflow_stage: 'creating' | 'waiting' | 'evaluating' | 'completed';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  criteria_count?: number;
  alternatives_count?: number;
  owner?: string;
  ownerEmail?: string;
  evaluatorCount?: number;
  completionRate?: number;
  dueDate?: string;
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
  return {
    'Content-Type': 'application/json',
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
      credentials: 'include',
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    // 응답이 JSON이 아닌 경우 (HTML 오류 페이지 등) 처리
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`API Error [${endpoint}]: Expected JSON, got ${contentType}`, text.substring(0, 200));
      throw new Error(`서버가 올바른 응답을 반환하지 않았습니다. (${response.status})`);
    }

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
  // 프로젝트 목록 조회 (정규화 적용)
  getProjects: async () => {
    const response = await makeRequest<{count: number, results: DjangoProjectResponse[]}>('/api/service/projects/');
    if (response.success && response.data) {
      // Django 응답을 정규화하여 반환
      const normalizedProjects = normalizeProjectListResponse(response.data);
      return {
        success: true,
        data: normalizedProjects,
        message: response.message
      };
    }
    return response as any; // 에러 응답은 그대로 반환
  },

  // 프로젝트 상세 조회 (정규화 적용)
  getProject: async (id: string) => {
    const response = await makeRequest<DjangoProjectResponse>(`/api/service/projects/${id}/`);
    if (response.success && response.data) {
      // Django 응답을 정규화하여 반환
      const normalizedProject = normalizeProjectData(response.data);
      return {
        success: true,
        data: normalizedProject,
        message: response.message
      };
    }
    return response as any; // 에러 응답은 그대로 반환
  },

  // 프로젝트 생성 (정규화 적용)
  createProject: async (data: Omit<ProjectData, 'id'>) => {
    // 프론트엔드 데이터를 Django 형식으로 변환
    const djangoData = {
      title: data.title,
      description: data.description,
      objective: data.objective,
      status: data.status,
      evaluation_mode: data.evaluation_mode,
      workflow_stage: data.workflow_stage,
      deadline: data.dueDate, // dueDate → deadline 매핑
    };
    
    const response = await makeRequest<DjangoProjectResponse>('/api/service/projects/', {
      method: 'POST',
      body: JSON.stringify(djangoData)
    });
    
    if (response.success && response.data) {
      // Django 응답을 정규화하여 반환
      const normalizedProject = normalizeProjectData(response.data);
      return {
        success: true,
        data: normalizedProject,
        message: response.message
      };
    }
    return response as any; // 에러 응답은 그대로 반환
  },

  // 프로젝트 수정 (정규화 적용)
  updateProject: async (id: string, data: Partial<ProjectData>) => {
    // 프론트엔드 데이터를 Django 형식으로 변환
    const djangoData: any = {};
    if (data.title) djangoData.title = data.title;
    if (data.description) djangoData.description = data.description;
    if (data.objective) djangoData.objective = data.objective;
    if (data.status) djangoData.status = data.status;
    if (data.evaluation_mode) djangoData.evaluation_mode = data.evaluation_mode;
    if (data.workflow_stage) djangoData.workflow_stage = data.workflow_stage;
    if (data.dueDate) djangoData.deadline = data.dueDate; // dueDate → deadline 매핑
    
    const response = await makeRequest<DjangoProjectResponse>(`/api/service/projects/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(djangoData)
    });
    
    if (response.success && response.data) {
      // Django 응답을 정규화하여 반환
      const normalizedProject = normalizeProjectData(response.data);
      return {
        success: true,
        data: normalizedProject,
        message: response.message
      };
    }
    return response as any; // 에러 응답은 그대로 반환
  },

  // 프로젝트 삭제 (휴지통으로 이동)
  deleteProject: (id: string) =>
    makeRequest<void>(`/api/service/projects/${id}/`, {
      method: 'DELETE'
    }),

  // 휴지통 프로젝트 조회 (정규화 적용) - 임시로 일반 프로젝트 목록 반환
  getTrashedProjects: async () => {
    const response = await makeRequest<{count: number, results: DjangoProjectResponse[]}>('/api/service/projects/');
    if (response.success && response.data) {
      // Django 응답을 정규화하여 반환
      const normalizedProjects = normalizeProjectListResponse(response.data);
      return {
        success: true,
        data: normalizedProjects,
        message: response.message
      };
    }
    return response as any; // 에러 응답은 그대로 반환
  },

  // 프로젝트 복원 - 임시로 업데이트로 대체
  restoreProject: (id: string) =>
    makeRequest<void>(`/api/service/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: true })
    }),

  // 프로젝트 영구 삭제 - 일반 삭제와 동일
  permanentDeleteProject: (id: string) =>
    makeRequest<void>(`/api/service/projects/${id}/`, {
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

// === 데이터 정규화 함수 ===

/**
 * Django API 응답을 프론트엔드 형식으로 정규화
 */
export const normalizeProjectData = (djangoProject: DjangoProjectResponse): ProjectData => {
  // 상태 정규화 (Django의 추가 상태를 기본 상태로 매핑)
  const normalizeStatus = (status: DjangoProjectResponse['status']): ProjectData['status'] => {
    switch (status) {
      case 'evaluation':
        return 'active'; // 평가 중인 프로젝트는 활성 상태로 처리
      case 'archived':
        return 'completed'; // 아카이브된 프로젝트는 완료 상태로 처리
      default:
        return status as ProjectData['status'];
    }
  };

  // 완료율 계산 (criteria_count와 alternatives_count 기반)
  const calculateCompletionRate = (project: DjangoProjectResponse): number => {
    const hasBasicSetup = project.criteria_count > 0 && project.alternatives_count > 0;
    const hasEvaluators = (project.member_count || 0) > 0;
    
    if (!hasBasicSetup) return 0;
    if (!hasEvaluators) return 30; // 기본 구조만 설정됨
    
    // 상태 기반 완료율
    switch (project.status) {
      case 'draft': return 30;
      case 'active':
      case 'evaluation': return 70;
      case 'completed':
      case 'archived': return 100;
      default: return 50;
    }
  };

  // 소유자 이메일 생성 (owner가 있으면 가상 이메일 생성)
  const generateOwnerEmail = (owner?: string): string => {
    if (!owner) return '';
    // 간단한 이메일 형식 생성 (실제로는 백엔드에서 제공해야 함)
    return `${owner.toLowerCase().replace(/\s+/g, '.')}@ahp-platform.com`;
  };

  return {
    id: djangoProject.id,
    title: djangoProject.title,
    description: djangoProject.description,
    objective: djangoProject.objective,
    status: normalizeStatus(djangoProject.status),
    evaluation_mode: djangoProject.evaluation_mode,
    workflow_stage: djangoProject.workflow_stage,
    created_at: djangoProject.created_at,
    updated_at: djangoProject.updated_at,
    deleted_at: djangoProject.deleted_at,
    criteria_count: djangoProject.criteria_count,
    alternatives_count: djangoProject.alternatives_count,
    
    // 정규화된 필드들
    owner: djangoProject.owner,
    ownerEmail: generateOwnerEmail(djangoProject.owner),
    evaluatorCount: djangoProject.member_count || 0,
    completionRate: calculateCompletionRate(djangoProject),
    dueDate: djangoProject.deadline, // deadline → dueDate 매핑
  };
};

/**
 * Django API 프로젝트 목록 응답을 정규화
 */
export const normalizeProjectListResponse = (
  response: { count: number; results: DjangoProjectResponse[] }
): ProjectData[] => {
  return response.results.map(normalizeProjectData);
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