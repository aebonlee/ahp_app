/**
 * Django API Service for AHP Platform
 * Replaces Node.js backend with Django REST API
 */

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: any;
  tokens?: {
    access: string;
    refresh: string;
  };
  [key: string]: any;
}

class DjangoApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_DJANGO_API_URL || 'https://ahp-django-backend.onrender.com';
    // localStorage 사용 금지 - 서버 세션만 사용
  }

  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include', // httpOnly 쿠키 사용
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // localStorage 사용 금지 - httpOnly 쿠키만 사용
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Django API request failed:', error);
      throw error;
    }
  }

  // Authentication Methods (서버 세션 전용)
  async login(username: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/accounts/web/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    // localStorage 사용 금지 - 서버가 httpOnly 쿠키로 세션 관리
    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    full_name?: string;
    organization?: string;
  }): Promise<ApiResponse> {
    const response = await this.request('/accounts/web/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // localStorage 사용 금지 - 서버가 httpOnly 쿠키로 세션 관리

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/accounts/web/logout/', {
      method: 'POST'
    });
    // localStorage 사용 금지 - 서버에서 세션 삭제됨
    return response;
  }

  // User Profile Methods
  async getUserProfile(): Promise<ApiResponse> {
    return this.request('/accounts/web/profile/');
  }

  async updateProfile(profileData: any): Promise<ApiResponse> {
    return this.request('/accounts/web/profile/update/', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  // Evaluator Management Methods
  async getEvaluators(params?: {
    page?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/accounts/web/evaluators/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request(endpoint);
  }

  async createEvaluator(evaluatorData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    organization?: string;
    department?: string;
    position?: string;
  }): Promise<ApiResponse> {
    return this.request('/accounts/web/evaluators/create/', {
      method: 'POST',
      body: JSON.stringify(evaluatorData),
    });
  }

  async updateEvaluator(evaluatorId: number, updateData: any): Promise<ApiResponse> {
    return this.request(`/accounts/web/evaluators/${evaluatorId}/`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteEvaluator(evaluatorId: number): Promise<ApiResponse> {
    return this.request(`/accounts/web/evaluators/${evaluatorId}/delete/`, {
      method: 'DELETE',
    });
  }

  async getEvaluatorStatistics(): Promise<ApiResponse> {
    return this.request('/accounts/web/evaluators/statistics/');
  }

  async bulkCreateEvaluators(evaluatorsData: any[]): Promise<ApiResponse> {
    return this.request('/accounts/web/evaluators/bulk-create/', {
      method: 'POST',
      body: JSON.stringify({ evaluators: evaluatorsData }),
    });
  }

  // Project Management Methods
  async getProjects(params?: { page?: number; search?: string }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `/projects/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request(endpoint);
  }

  async createProject(projectData: any): Promise<ApiResponse> {
    return this.request('/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId: string, projectData: any): Promise<ApiResponse> {
    return this.request(`/projects/${projectId}/`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId: string): Promise<ApiResponse> {
    return this.request(`/projects/${projectId}/`, {
      method: 'DELETE',
    });
  }

  // Evaluation Methods
  async getEvaluations(params?: { project?: string }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.project) queryParams.append('project', params.project);

    const endpoint = `/evaluations/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request(endpoint);
  }

  async startEvaluation(evaluationId: string): Promise<ApiResponse> {
    return this.request(`/evaluations/${evaluationId}/start/`, {
      method: 'POST',
    });
  }

  async updateEvaluationProgress(
    evaluationId: string, 
    progressData: any
  ): Promise<ApiResponse> {
    return this.request(`/evaluations/${evaluationId}/update_progress/`, {
      method: 'PATCH',
      body: JSON.stringify(progressData),
    });
  }

  async completeEvaluation(evaluationId: string): Promise<ApiResponse> {
    return this.request(`/evaluations/${evaluationId}/complete/`, {
      method: 'POST',
    });
  }

  // Analysis Methods
  async calculateWeights(projectId: string): Promise<ApiResponse> {
    return this.request(`/analysis/${projectId}/calculate_weights/`, {
      method: 'POST',
    });
  }

  async performSensitivityAnalysis(
    projectId: string, 
    analysisData: any
  ): Promise<ApiResponse> {
    return this.request(`/analysis/${projectId}/sensitivity_analysis/`, {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
  }

  async getConsensusMetrics(projectId: string): Promise<ApiResponse> {
    return this.request(`/analysis/${projectId}/consensus_metrics/`);
  }

  // Utility Methods (서버 세션 전용)
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await this.request('/accounts/web/session-check/');
      return response.success && !!response.user;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const response = await this.request('/accounts/web/session-check/');
      return response.user || null;
    } catch (error) {
      return null;
    }
  }

  // Test Methods (Development only)
  async createSampleUsers(): Promise<ApiResponse> {
    return this.request('/accounts/web/create-sample-users/', {
      method: 'POST',
    });
  }
}

// Export singleton instance
export default new DjangoApiService();