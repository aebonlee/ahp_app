/**
 * API 서비스 - Django REST API 백엔드와의 통신
 * AHP 플랫폼용 Django REST Framework API 연동
 */

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : 'https://ahp-django-backend.onrender.com'; // Django REST API 백엔드

// 인증 토큰 관리 (로컬 금지에 따라 세션 스토리지 사용)
let authToken: string | null = sessionStorage.getItem('authToken');

// API 응답 타입 정의
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// 기본 API 클라이언트
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      // JWT 인증 토큰 추가
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        credentials: 'include',
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
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

  patch<T>(endpoint: string, body?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

const apiClient = new APIClient(API_BASE_URL);

// 인증 API
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await apiClient.post('/api/v1/auth/token/', credentials);
    if (response.data && (response.data as any).access) {
      authToken = (response.data as any).access;
      sessionStorage.setItem('authToken', authToken!);
      sessionStorage.setItem('refreshToken', (response.data as any).refresh);
    }
    return response;
  },
  
  logout: () => {
    authToken = null;
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
  },
  
  refreshToken: async () => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) return { error: 'No refresh token' };
    
    const response = await apiClient.post('/api/v1/auth/token/refresh/', { 
      refresh: refreshToken 
    });
    
    if (response.data && (response.data as any).access) {
      authToken = (response.data as any).access;
      sessionStorage.setItem('authToken', authToken!);
    }
    return response;
  },
  
  verifyToken: () => {
    if (!authToken) return Promise.resolve({ error: 'No token' });
    return apiClient.post('/api/v1/auth/token/verify/', { token: authToken });
  }
};

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
    project: string;
    evaluator: number;
    message?: string;
  }) => apiClient.post('/api/v1/evaluations/invitations/', data),

  fetchByProject: (projectId: string) =>
    apiClient.get(`/api/v1/evaluations/invitations/?project=${projectId}`),

  list: (projectId: string) =>
    apiClient.get(`/api/v1/evaluations/evaluations/?project=${projectId}`),

  updateWeight: (evaluatorId: string, data: any) =>
    apiClient.patch(`/api/v1/evaluations/invitations/${evaluatorId}/`, data),

  remove: (evaluatorId: string) =>
    apiClient.delete(`/api/v1/evaluations/invitations/${evaluatorId}/`),

  fetchProgress: (projectId: string) =>
    apiClient.get(`/api/v1/evaluations/evaluations/?project=${projectId}&status=in_progress`),

  validateAccessKey: (token: string) =>
    apiClient.post('/api/v1/evaluations/invitations/accept/', { token }),
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

// 기존 API들 (호환성 유지)
export const projectAPI = {
  fetch: () => apiClient.get('/api/v1/projects/projects/'),
  fetchById: (id: string) => apiClient.get(`/api/v1/projects/projects/${id}/`),
  create: (data: any) => apiClient.post('/api/v1/projects/projects/', data),
  update: (id: string, data: any) => apiClient.patch(`/api/v1/projects/projects/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/projects/projects/${id}/`),
};

export const criteriaAPI = {
  fetch: (projectId: string) => apiClient.get(`/api/v1/projects/criteria/?project=${projectId}`),
  create: (data: any) => apiClient.post('/api/v1/projects/criteria/', data),
  update: (id: string, data: any) => apiClient.patch(`/api/v1/projects/criteria/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/projects/criteria/${id}/`),
};

export const alternativesAPI = {
  fetch: (projectId: string) => apiClient.get(`/api/v1/projects/criteria/?project=${projectId}&type=alternative`),
  create: (data: any) => apiClient.post('/api/v1/projects/criteria/', { ...data, type: 'alternative' }),
  update: (id: string, data: any) => apiClient.patch(`/api/v1/projects/criteria/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/projects/criteria/${id}/`),
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

export default {
  authAPI,
  directEvaluationAPI,
  pairwiseEvaluationAPI,
  ahpCalculationAPI,
  evaluatorAPI,
  resultsAPI,
  projectAPI,
  criteriaAPI,
  alternativesAPI,
  apiHelpers,
};