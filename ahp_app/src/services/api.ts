import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

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
  settings?: Record<string, unknown>; // 메타데이터 저장용 필드
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
  ahp_type?: 'general' | 'fuzzy';
  created_at?: string;
  updated_at?: string;
  // 인구통계 관련 필드들
  demographic_data?: {
    age: string;
    gender: string;
    education: string;
    occupation: string;
    experience: string;
    department: string;
    position: string;
    projectExperience: string;
    decisionRole: string;
    additionalInfo: string;
  };
  demographic_survey_config?: Record<string, unknown>;
  require_demographics?: boolean;
  evaluation_flow_type?: 'survey_first' | 'ahp_first' | 'parallel';
  deleted_at?: string;
  criteria_count?: number;
  alternatives_count?: number;
  owner?: string;
  ownerEmail?: string;
  evaluatorCount?: number;
  completionRate?: number;
  dueDate?: string;
  settings?: Record<string, unknown>; // 메타데이터 저장용 필드
}

// 기준 관련 타입
export interface CriteriaData {
  id?: string;
  project_id: string;
  project?: string;  // Django API에서 요구하는 project 필드 추가
  name: string;
  description?: string;
  position: number;
  weight?: number;
  parent_id?: string | null;
  parent?: string | null;  // Django API에서 요구하는 parent 필드 추가
  level?: number;
  order?: number;
  type?: 'criteria' | 'alternative'; // Django 모델의 type 필드 추가
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
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // localStorage에서 토큰 확인
  const accessToken = localStorage.getItem('ahp_access_token') || sessionStorage.getItem('ahp_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
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
    
    // DELETE 요청의 경우 응답 본문이 없을 수 있음
    const isDeleteRequest = options.method?.toUpperCase() === 'DELETE';
    
    // 응답이 JSON이 아닌 경우 처리
    const contentType = response.headers.get('content-type');
    let data: any = null;
    
    if (!contentType || !contentType.includes('application/json')) {
      if (isDeleteRequest && response.ok) {
        // DELETE 요청이 성공했고 JSON이 아닌 경우 (예: 204 No Content)
        return {
          success: true,
          data: undefined,
          message: '삭제 완료'
        };
      } else {
        throw new Error(`서버가 올바른 응답을 반환하지 않았습니다. (${response.status})`);
      }
    } else {
      data = await response.json();
    }

    if (!response.ok) {
      // 405 Method Not Allowed 특별 처리
      if (response.status === 405) {
        // 405 에러인 경우 더 구체적인 메시지 반환
        return {
          success: false,
          error: `${endpoint} 엔드포인트는 ${options.method} 메서드를 지원하지 않습니다. 백엔드 설정을 확인하세요.`,
          message: 'Method Not Allowed'
        };
      }

      // 500 에러 특별 처리 - 백엔드 상세 에러 메시지 추출
      if (response.status === 500) {
        const errorDetail = data?.detail || data?.error || data?.message || '서버 내부 오류';
        throw new Error(`서버 오류: ${errorDetail}`);
      }

      // 401 Unauthorized 처리
      if (response.status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해 주세요.');
      }

      // 권한 오류 처리
      if (response.status === 403) {
        throw new Error('이 작업을 수행할 권한이 없습니다. 로그인 상태를 확인해주세요.');
      }

      // 400 에러 상세 분석
      if (response.status === 400) {
        const errorMessage = data.message || data.error ||
                           (typeof data === 'object' ? JSON.stringify(data) : 'Bad Request');
        throw new Error(`잘못된 요청: ${errorMessage}`);
      }

      // 404 Not Found 처리
      if (response.status === 404) {
        throw new Error(`엔드포인트를 찾을 수 없습니다: ${endpoint}`);
      }

      throw new Error(data.message || data.error || `HTTP ${response.status}: API 요청 실패`);
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  } catch (error: unknown) {
    console.error(`API Error [${endpoint}]:`, error);
    // 네트워크 오류 (서버 다운, CORS, 오프라인 등) 사용자 친화적 메시지로 변환
    let errorMessage = (error instanceof Error ? error.message : null) || '알 수 없는 오류가 발생했습니다.';
    if (errorMessage === 'Failed to fetch' || errorMessage.includes('NetworkError') || errorMessage.includes('net::ERR')) {
      errorMessage = '서버에 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.';
    }
    return {
      success: false,
      error: errorMessage
    };
  }
};

// === 프로젝트 API ===
export const projectApi = {
  // 프로젝트 목록 조회 (정규화 적용)
  getProjects: async () => {
    const response = await makeRequest<any>(API_ENDPOINTS.PROJECTS.LIST);

    if (response.success) {
      // response.data가 undefined인 경우 빈 배열 반환
      if (!response.data) {
        return {
          success: true,
          data: [],
          message: '프로젝트가 없습니다'
        };
      }
      
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
    const response = await makeRequest<DjangoProjectResponse>(API_ENDPOINTS.PROJECTS.GET(id));
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
    // Django 백엔드의 실제 필수 필드만 포함
    const djangoData = {
      title: data.title,
      description: data.description,
      objective: data.objective || '',
      status: 'draft', // Django 모델: draft, in_progress, completed, archived, deleted
      evaluation_mode: data.evaluation_mode || 'practical',
      workflow_stage: 'creating', // Django 모델: creating, waiting, evaluating, completed
    };

    const response = await makeRequest<any>(API_ENDPOINTS.PROJECTS.CREATE, {
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
    const djangoData: Record<string, unknown> = {};
    if (data.title !== undefined) djangoData.title = data.title;
    if (data.description !== undefined) djangoData.description = data.description;
    if (data.objective !== undefined) djangoData.objective = data.objective;
    if (data.status !== undefined) djangoData.status = data.status;
    if (data.evaluation_mode !== undefined) djangoData.evaluation_mode = data.evaluation_mode;
    if (data.workflow_stage !== undefined) djangoData.workflow_stage = data.workflow_stage;
    if (data.dueDate !== undefined) djangoData.deadline = data.dueDate; // dueDate → deadline 매핑
    if (data.settings !== undefined) djangoData.settings = data.settings; // settings 필드 추가

    const response = await makeRequest<DjangoProjectResponse>(`/api/service/projects/projects/${id}/`, {
      method: 'PATCH',
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
    makeRequest<void>(API_ENDPOINTS.PROJECTS.DELETE(id), {
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
  getCriteria: async (projectId: string) => {
    // CriteriaViewSet은 project 필드로 필터링 지원
    const response = await makeRequest<any>(`/api/service/projects/criteria/?project=${projectId}`);

    if (response.success && response.data) {
      // Django REST Framework 페이지네이션 처리
      let criteriaList: CriteriaData[] = [];
      if (Array.isArray(response.data)) {
        // 배열로 온 경우
        criteriaList = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        // 페이지네이션 객체로 온 경우
        criteriaList = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // data 필드 안에 배열이 있는 경우
        criteriaList = response.data.data;
      }
      
      return {
        success: true,
        data: criteriaList,
        error: undefined
      };
    }
    
    return {
      success: false,
      data: [],
      error: response.error || '기준 조회에 실패했습니다.'
    };
  },

  // 기준 생성 - PostgreSQL DB 전용
  createCriteria: async (data: Omit<CriteriaData, 'id'>) => {
    const projectId = data.project_id; // UUID 문자열
    
    if (!projectId || typeof projectId !== 'string') {
      return {
        success: false,
        error: '프로젝트 ID가 유효하지 않습니다.'
      };
    }
    
    // parent_id 처리 - 숫자 ID 및 UUID 모두 지원
    const parentId = data.parent || data.parent_id || null;
    
    // UUID 형식 검증 함수
    const isValidUUID = (uuid: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    };
    
    // temp_ 형식의 임시 ID 감지
    const isTempId = (id: string): boolean => {
      return /^(temp_|criterion_)\d+/.test(id);
    };
    
    // 숫자 ID 여부 확인
    const isNumericId = (id: string): boolean => {
      return /^\d+$/.test(id);
    };
    
    // parent_id 처리 - 숫자 ID, UUID, 임시 ID 모두 처리
    let validParentId = null;
    if (parentId) {
      const parentIdString = String(parentId);
      
      if (isTempId(parentIdString)) {
        validParentId = null;
      } else if (isValidUUID(parentIdString) || isNumericId(parentIdString)) {
        // UUID이거나 숫자 ID인 경우 모두 허용
        validParentId = parentIdString;
      } else {
        validParentId = null;
      }
    }
    
    // Django CriteriaViewSet API 사용
    const requestData = {
      project: projectId,  // Django ForeignKey expects project ID
      name: data.name,
      description: data.description || '',
      type: data.type || 'criteria',
      // 검증된 parent_id만 사용
      parent: validParentId,
      parent_id: validParentId,
      order: data.order || 0,
      position: data.position || data.order || 0,
      level: data.level || 1,
      weight: data.weight || 0.0,
      is_active: true
    };
    
    // CriteriaViewSet의 create endpoint 사용
    const response = await makeRequest<CriteriaData>('/api/service/projects/criteria/', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    
    if (response.success) {
      return response;
    }

    return response;
  },

  // 기준 수정
  updateCriteria: (id: string, data: Partial<CriteriaData>) =>
    makeRequest<CriteriaData>(`/api/service/projects/criteria/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // 기준 삭제
  deleteCriteria: async (criteriaId: string, _projectId?: string) => {
    const response = await makeRequest<void>(`/api/service/projects/criteria/${criteriaId}/`, {
      method: 'DELETE'
    });
    return response;
  },

  // 기준 순서 변경
  reorderCriteria: (projectId: string, criteriaIds: string[]) =>
    makeRequest<void>(`/api/service/projects/${projectId}/criteria/reorder/`, {
      method: 'PUT',
      body: JSON.stringify({ criteriaIds })
    })
};

// === 대안 API ===
export const alternativeApi = {
  // 프로젝트의 대안 목록 조회
  getAlternatives: (projectId: string) =>
    makeRequest<AlternativeData[]>(`/api/service/projects/${projectId}/alternatives/`),

  // 대안 생성
  createAlternative: (data: Omit<AlternativeData, 'id'>) =>
    makeRequest<AlternativeData>('/api/service/projects/alternatives/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 대안 수정
  updateAlternative: (id: string, data: Partial<AlternativeData>) =>
    makeRequest<AlternativeData>(`/api/service/projects/alternatives/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // 대안 삭제
  deleteAlternative: (id: string) =>
    makeRequest<void>(`/api/service/projects/alternatives/${id}/`, {
      method: 'DELETE'
    }),

  // 대안 순서 변경
  reorderAlternatives: (projectId: string, alternativeIds: string[]) =>
    makeRequest<void>(`/api/service/projects/${projectId}/alternatives/reorder/`, {
      method: 'PUT',
      body: JSON.stringify({ alternativeIds })
    })
};

// === 평가자 API (Django ProjectMember 사용) ===
export const evaluatorApi = {
  // 프로젝트의 평가자(멤버) 목록 조회
  getEvaluators: (projectId: string) =>
    makeRequest<EvaluatorData[]>(`/api/service/projects/${projectId}/members/`),

  // 평가자(멤버) 추가 - Django의 add_member action 사용
  addEvaluator: (data: Omit<EvaluatorData, 'id'>) => {
    // Django ProjectMember 형식으로 변환
    const memberData = {
      user: data.email, // 일단 email을 user로 전달 (나중에 user 생성 로직 필요)
      role: 'evaluator',
      can_edit_structure: false,
      can_manage_evaluators: false,
      can_view_results: true
    };
    
    return makeRequest<EvaluatorData>(
      `/api/service/projects/${data.project_id}/add_member/`, 
      {
        method: 'POST',
        body: JSON.stringify(memberData)
      }
    );
  },

  // 평가자(멤버) 수정
  updateEvaluator: (id: string, data: Partial<EvaluatorData>) =>
    makeRequest<EvaluatorData>(`/api/service/projects/${data.project_id}/update_member/`, {
      method: 'PATCH',
      body: JSON.stringify({ member_id: id, ...data })
    }),

  // 평가자(멤버) 삭제
  removeEvaluator: (id: string) =>
    makeRequest<void>(`/api/service/projects/remove_member/?member_id=${id}`, {
      method: 'DELETE'
    }),

  // 평가 초대 이메일 발송 (임시 - 향후 구현)
  sendInvitation: (projectId: string, evaluatorIds: string[]) =>
    makeRequest<void>(`/api/service/projects/${projectId}/send_invitations/`, {
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
  updateEvaluationSession: (projectId: string, evaluatorId: string, data: Record<string, unknown>) =>
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
  runSensitivityAnalysis: (projectId: string, parameters?: Record<string, unknown>) =>
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
  generateReport: (projectId: string, options?: Record<string, unknown>) =>
    makeRequest<Blob>(`/api/projects/${projectId}/export/report`, {
      method: 'POST',
      body: JSON.stringify(options || {})
    })
};

// === 인증 API ===
export const authApi = {
  // 로그인
  login: (email: string, password: string) =>
    makeRequest<{ token: string; user: unknown }>('/api/service/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  // 사용자 정보 조회
  getCurrentUser: () =>
    makeRequest<any>('/api/service/auth/me'),

  // 토큰 검증
  verifyToken: () =>
    makeRequest<any>('/api/service/auth/verify')
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
  response: { count?: number; results?: DjangoProjectResponse[] } | DjangoProjectResponse[] | null | undefined
): ProjectData[] => {
  // null 또는 undefined인 경우
  if (!response) {
    return [];
  }

  // 응답이 배열인 경우 직접 처리
  if (Array.isArray(response)) {
    return response.map(normalizeProjectData);
  }

  // 응답이 객체이고 results 필드가 있는 경우
  if (typeof response === 'object' && response.results && Array.isArray(response.results)) {
    return response.results.map(normalizeProjectData);
  }

  // 빈 배열 반환 (오류 방지)
  return [];
};

// === 고급 분석 API (새로 추가) ===
export const advancedAnalysisApi = {
  // 일반 GET 요청 메서드
  get: (url: string) => makeRequest<any>(url),

  // 일반 POST 요청 메서드
  post: (url: string, data?: unknown) => makeRequest<any>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  }),

  // 일반 PUT 요청 메서드
  put: (url: string, data?: unknown) => makeRequest<any>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  }),

  // 일반 PATCH 요청 메서드
  patch: (url: string, data?: unknown) => makeRequest<any>(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined
  }),

  // 일반 DELETE 요청 메서드
  delete: (url: string) => makeRequest<any>(url, { method: 'DELETE' }),

  // 민감도 분석
  runSensitivityAnalysis: (projectId: string, data: Record<string, unknown>) =>
    makeRequest<any>(`/api/service/analysis/advanced/${projectId}/sensitivity_analysis/`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 그룹 합의 분석
  runGroupConsensusAnalysis: (projectId: string, data: Record<string, unknown>) =>
    makeRequest<unknown>(`/api/service/analysis/advanced/${projectId}/group_consensus_analysis/`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 통계적 검증
  runStatisticalTest: (projectId: string, data: Record<string, unknown>) =>
    makeRequest<unknown>(`/api/service/analysis/advanced/${projectId}/statistical_test/`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 몬테카를로 시뮬레이션
  runMonteCarloSimulation: (projectId: string, data: Record<string, unknown>) =>
    makeRequest<unknown>(`/api/service/analysis/advanced/${projectId}/monte_carlo_simulation/`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 종합 보고서 조회
  getComprehensiveReport: (projectId: string) =>
    makeRequest<any>(`/api/service/analysis/advanced/${projectId}/comprehensive_report/`)
};

const apiExports = {
  project: projectApi,
  criteria: criteriaApi,
  alternative: alternativeApi,
  evaluator: evaluatorApi,
  evaluation: evaluationApi,
  results: resultsApi,
  export: exportApi,
  auth: authApi,
  // 일반 메서드 추가 (기존 코드 호환성)
  get: advancedAnalysisApi.get,
  post: advancedAnalysisApi.post,
  put: advancedAnalysisApi.put,
  patch: advancedAnalysisApi.patch,
  delete: advancedAnalysisApi.delete
};

export default apiExports;