/**
 * API 서비스 - 백엔드와의 통신을 담당
 * 새로 구현된 백엔드 API들과 연동
 */

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://ahp-forpaper.onrender.com';

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
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, {
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
    evaluator_code: string;
    evaluator_name: string;
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

// 기존 API들 (호환성 유지)
export const projectAPI = {
  fetch: () => apiClient.get('/api/projects'),
  fetchById: (id: number) => apiClient.get(`/api/projects/${id}`),
  create: (data: any) => apiClient.post('/api/projects', data),
  update: (id: number, data: any) => apiClient.put(`/api/projects/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/projects/${id}`),
};

export const criteriaAPI = {
  fetch: (projectId: number) => apiClient.get(`/api/criteria/${projectId}`),
  create: (data: any) => apiClient.post('/api/criteria', data),
  update: (id: string, data: any) => apiClient.put(`/api/criteria/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/criteria/${id}`),
};

export const alternativesAPI = {
  fetch: (projectId: number) => apiClient.get(`/api/alternatives/${projectId}`),
  create: (data: any) => apiClient.post('/api/alternatives', data),
  update: (id: string, data: any) => apiClient.put(`/api/alternatives/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/alternatives/${id}`),
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