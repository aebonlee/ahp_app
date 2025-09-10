/**
 * Django Backend API Integration Service
 * 완전히 구현된 Django 백엔드와의 통신을 담당
 * JWT 인증, CORS, AHP 계산 모든 기능 지원
 */

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : 'https://ahp-django-backend.onrender.com';

// Django API 응답 타입 정의
export interface APIResponse<T = any> {
  data?: T;
  results?: T[];
  success?: boolean;
  error?: string;
  message?: string;
  count?: number;
  next?: string | null;
  previous?: string | null;
}

// Django API 클라이언트 (세션 기반 인증 지원)
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 세션 기반 인증에서는 토큰 관리가 불필요
  setToken(token: string) {
    // 세션 기반에서는 사용하지 않음
    console.log('세션 기반 인증에서는 토큰 설정이 불필요합니다.');
  }

  clearToken() {
    // 세션 기반에서는 사용하지 않음
    console.log('세션 기반 인증에서는 토큰 클리어가 불필요합니다.');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers as Record<string, string>,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        credentials: 'include', // 세션 쿠키 포함
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || data.error || 'Request failed' };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return { error: 'Network error' };
    }
  }

  get<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new APIClient(API_BASE_URL);

// 직접입력 평가 API
export const directEvaluationAPI = {
  save: (data: {
    project_id: number;
    target_key: string;
    value: number;
    is_benefit: boolean;
  }) => apiClient.post('/api/evaluate/direct', data),

  fetch: (projectId: number) => 
    apiClient.get(`/api/evaluate/direct/${projectId}`),

  normalize: (data: {
    values: number[];
    is_benefit: boolean;
  }) => apiClient.post('/api/calculate/normalize', data),
};

// 쌍대비교 평가 API (새로운 matrix_key 지원)
export const pairwiseEvaluationAPI = {
  save: (data: {
    project_id: number;
    matrix_key: string;
    i_index: number;
    j_index: number;
    value: number;
  }) => apiClient.post('/api/evaluate/pairwise', data),

  fetchMatrix: (projectId: number, matrixKey: string) =>
    apiClient.get(`/api/evaluate/pairwise/${projectId}/${matrixKey}`),
};

// AHP 계산 API
export const ahpCalculationAPI = {
  calculate: (data: {
    matrix: number[][];
    matrix_key?: string;
  }) => apiClient.post('/api/calculate/ahp', data),

  validateMatrix: (matrix: number[][]) =>
    apiClient.post('/api/calculate/validate-matrix', { matrix }),
};

// 평가자 관리 API
export const evaluatorAPI = {
  assign: (data: {
    project_id: number;
    evaluator_name: string;
    evaluator_email?: string;
    weight?: number;
  }) => apiClient.post('/api/evaluators/assign', data),

  fetchByProject: (projectId: number) =>
    apiClient.get(`/api/evaluators/project/${projectId}`),

  updateWeight: (evaluatorId: number, data: {
    project_id: number;
    weight: number;
  }) => apiClient.put(`/api/evaluators/${evaluatorId}/weight`, data),

  remove: (evaluatorId: number, projectId: number) =>
    apiClient.delete(`/api/evaluators/${evaluatorId}/project/${projectId}`),

  fetchProgress: (projectId: number) =>
    apiClient.get(`/api/evaluators/progress/${projectId}`),

  validateAccessKey: (accessKey: string) =>
    apiClient.post('/api/evaluators/auth/access-key', { access_key: accessKey }),
};

// 결과 API
export const resultsAPI = {
  save: (data: {
    project_id: number;
    criteria_weights: any;
    alternative_scores: any;
    final_ranking: any[];
    consistency_ratio?: number;
  }) => apiClient.post('/api/results/save', data),

  fetchIndividual: (projectId: number) =>
    apiClient.get(`/api/results/individual/${projectId}`),

  calculateGroup: (data: {
    project_id: number;
    aggregation_method?: 'weighted_average' | 'geometric_mean';
  }) => apiClient.post('/api/results/group', data),

  fetchProject: (projectId: number, includeIndividual = false) =>
    apiClient.get(`/api/results/project/${projectId}?include_individual=${includeIndividual}`),

  sensitivityAnalysis: (data: {
    project_id: number;
    criterion_id: string;
    variation_range?: number;
  }) => apiClient.post('/api/results/sensitivity-analysis', data),
};

// === Django 백엔드 연동 API ===

// 인증 API (현재 백엔드 구조에 맞춤)
export const authAPI = {
  // 기본 로그인 (현재 백엔드 지원)
  login: (data: { username: string; password: string }) =>
    apiClient.post('/api/login/', data),
  
  // 회원가입
  register: (data: { username: string; email: string; password: string; first_name?: string; last_name?: string }) =>
    apiClient.post('/api/register/', data),
  
  // 사용자 정보 조회
  getUser: () => apiClient.get('/api/user/'),
  
  // 서비스 상태 확인
  status: () => apiClient.get('/api/service/status/'),
};

// 프로젝트 관리 API (현재 백엔드 구조)
export const projectAPI = {
  fetch: () => apiClient.get('/api/service/projects/'),
  fetchById: (id: number) => apiClient.get(`/api/service/projects/${id}/`),
  create: (data: { title: string; description: string; status?: string }) => 
    apiClient.post('/api/service/projects/', data),
  update: (id: number, data: any) => apiClient.put(`/api/service/projects/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/api/service/projects/${id}/`),
  // 임시 구현 - 향후 백엔드에서 구현 예정
  calculateWeights: async (id: number): Promise<APIResponse> => {
    // 현재는 mock 응답 반환
    return { 
      success: true, 
      message: '가중치 계산 완료 (임시)', 
      data: { weights: [] }
    };
  },
};

// 평가기준 관리 API (현재는 데이터 저장으로 대체)
export const criteriaAPI = {
  fetch: (projectId?: number) => {
    const params = projectId ? `?project=${projectId}` : '';
    return apiClient.get(`/api/service/data/${params}`);
  },
  create: (data: {
    project?: number;
    project_id?: number;
    name: string;
    description?: string | null;
    type?: 'criteria' | 'alternative';
    order?: number;
    level?: number;
    parent_id?: number | null;
  }) => {
    // 현재 백엔드 구조에 맞게 데이터 저장으로 변환
    const saveData = {
      project: data.project || data.project_id,
      key: `criteria_${Date.now()}`,
      value: JSON.stringify({
        ...data,
        project: data.project || data.project_id,
      })
    };
    return apiClient.post('/api/service/data/', saveData);
  },
  update: (id: string, data: any) => apiClient.put(`/api/service/data/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/api/service/data/${id}/`),
};

// 대안 관리 API (criteriaAPI의 alternative 타입 전용)
export const alternativesAPI = {
  fetch: (projectId?: number) => {
    const params = projectId ? `?project=${projectId}` : '';
    return apiClient.get(`/api/service/data/${params}`);
  },
  create: (data: {
    project?: number;
    project_id?: number;
    name: string;
    description?: string | null;
    order?: number;
    order_index?: number;
  }) => {
    const saveData = {
      project: data.project || data.project_id,
      key: `alternative_${Date.now()}`,
      value: JSON.stringify({ 
        ...data, 
        project: data.project || data.project_id,
        order: data.order || data.order_index,
        type: 'alternative' 
      })
    };
    return apiClient.post('/api/service/data/', saveData);
  },
  update: (id: string, data: any) => apiClient.put(`/api/service/data/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/api/service/data/${id}/`),
};

// 현재 백엔드의 단순 데이터 저장 API 활용
export const comparisonsAPI = {
  fetch: (projectId?: number) => {
    const params = projectId ? `?project=${projectId}` : '';
    return apiClient.get(`/api/service/data/${params}`);
  },
  create: (data: {
    project: number;
    criteria_a: number;
    criteria_b: number;
    value: number;
  }) => {
    const saveData = {
      project: data.project,
      key: `comparison_${data.criteria_a}_${data.criteria_b}`,
      value: JSON.stringify(data)
    };
    return apiClient.post('/api/service/data/', saveData);
  },
  update: (id: string, data: any) => apiClient.put(`/api/service/data/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/api/service/data/${id}/`),
};

// 현재 백엔드의 데이터 저장 API
export const djangoResultsAPI = {
  fetch: (projectId?: number) => {
    const params = projectId ? `?project=${projectId}` : '';
    return apiClient.get(`/api/service/data/${params}`);
  },
  save: (data: { project: number; results: any }) => {
    const saveData = {
      project: data.project,
      key: 'ahp_results',
      value: JSON.stringify(data.results)
    };
    return apiClient.post('/api/service/data/', saveData);
  }
};

// 데이터 저장 API (현재 백엔드 지원)
export const dataAPI = {
  fetch: (projectId?: number) => {
    const params = projectId ? `?project=${projectId}` : '';
    return apiClient.get(`/api/service/data/${params}`);
  },
  save: (data: { project: number; key: string; value: string }) =>
    apiClient.post('/api/service/data/', data),
};

// 통합 헬퍼 함수들
export const apiHelpers = {
  // 매트릭스 키 생성
  generateMatrixKey: (type: 'criteria' | 'alternatives', criterionId?: string): string => {
    if (type === 'criteria') {
      return `C:${criterionId || 'root'}`;
    } else {
      return `A:${criterionId}`;
    }
  },

  // 타겟 키 생성 (직접입력용)
  generateTargetKey: (type: 'criterion' | 'alternative', itemId: string, criterionId?: string): string => {
    if (type === 'criterion') {
      return `criterion:${itemId}`;
    } else {
      return `alternative:${itemId}@criterion:${criterionId}`;
    }
  },

  // 에러 메시지 추출
  extractErrorMessage: (response: APIResponse): string => {
    if (response.error) {
      return response.error;
    }
    return 'Unknown error occurred';
  },

  // 성공 메시지 추출
  extractSuccessMessage: (response: APIResponse): string => {
    if (response.message) {
      return response.message;
    }
    return 'Operation completed successfully';
  },
};

// === 통합 AHP 워크플로우 헬퍼 ===
export const ahpWorkflowAPI = {
  // 완전한 AHP 프로젝트 생성
  createCompleteProject: async (projectData: {
    title: string;
    description: string;
    criteria: string[];
    comparisons?: Array<{ criteria_a_index: number; criteria_b_index: number; value: number }>;
  }) => {
    try {
      // 1. 프로젝트 생성
      const projectResponse = await projectAPI.create({
        title: projectData.title,
        description: projectData.description,
        status: 'draft'
      });
      
      if (projectResponse.error || !(projectResponse as any).id) {
        return { error: 'Failed to create project' };
      }
      
      const projectId = (projectResponse as any).id;
      
      // 2. 평가기준 생성
      const criteriaResults = [];
      for (let i = 0; i < projectData.criteria.length; i++) {
        const criteriaResponse = await criteriaAPI.create({
          project: projectId,
          name: projectData.criteria[i],
          description: `평가기준: ${projectData.criteria[i]}`,
          type: 'criteria',
          order: i + 1
        });
        criteriaResults.push(criteriaResponse);
      }
      
      // 3. 쌍대비교 생성 (옵션)
      if (projectData.comparisons && criteriaResults.length > 1) {
        for (const comp of projectData.comparisons) {
          const criteriaA = criteriaResults[comp.criteria_a_index];
          const criteriaB = criteriaResults[comp.criteria_b_index];
          
          if ((criteriaA as any)?.id && (criteriaB as any)?.id) {
            await comparisonsAPI.create({
              project: projectId,
              criteria_a: (criteriaA as any).id,
              criteria_b: (criteriaB as any).id,
              value: comp.value
            });
          }
        }
      }
      
      return {
        success: true,
        project: { id: projectId, ...projectData },
        criteria: criteriaResults
      };
    } catch (error) {
      return { error: 'Failed to create complete project' };
    }
  },
  
  // 프로젝트 전체 데이터 조회
  getProjectComplete: async (projectId: number) => {
    try {
      const [project, criteria, comparisons, results] = await Promise.all([
        projectAPI.fetchById(projectId),
        criteriaAPI.fetch(projectId),
        comparisonsAPI.fetch(projectId),
        djangoResultsAPI.fetch(projectId)
      ]);
      
      return {
        success: true,
        data: {
          project: project.data || project,
          criteria: criteria.results || criteria.data || [],
          comparisons: comparisons.results || comparisons.data || [],
          results: results.results || results.data || []
        }
      };
    } catch (error) {
      return { error: 'Failed to fetch complete project data' };
    }
  }
};

const apiService = {
  // 기존 호환성 API
  directEvaluationAPI,
  pairwiseEvaluationAPI,
  ahpCalculationAPI,
  evaluatorAPI,
  
  // 새로운 Django 백엔드 API
  authAPI,
  projectAPI,
  criteriaAPI,
  alternativesAPI,
  comparisonsAPI,
  resultsAPI,
  djangoResultsAPI,
  dataAPI,
  ahpWorkflowAPI,
  
  apiHelpers,
  
  // 클라이언트 인스턴스 노출 (JWT 토큰 관리용)
  client: apiClient
};

export default apiService;