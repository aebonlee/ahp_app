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
  private accessToken: string | null;

  constructor() {
    this.baseURL = process.env.REACT_APP_DJANGO_API_URL || 'https://ahp-django-backend.onrender.com';
    this.accessToken = localStorage.getItem('django_access_token');
  }

  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // JWT 토큰 추가
    if (this.accessToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.accessToken}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // 토큰 만료 시 자동 갱신
      if (response.status === 401 && this.accessToken) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${this.accessToken}`,
          };
          const retryResponse = await fetch(url, config);
          return retryResponse.json();
        }
      }

      return data;
    } catch (error) {
      console.error('Django API request failed:', error);
      throw error;
    }
  }

  // Authentication Methods
  async login(username: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/accounts/web/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.tokens) {
      this.accessToken = response.tokens.access;
      localStorage.setItem('django_access_token', response.tokens.access);
      localStorage.setItem('django_refresh_token', response.tokens.refresh);
      localStorage.setItem('django_user', JSON.stringify(response.user));
    }

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

    if (response.success && response.tokens) {
      this.accessToken = response.tokens.access;
      localStorage.setItem('django_access_token', response.tokens.access);
      localStorage.setItem('django_refresh_token', response.tokens.refresh);
      localStorage.setItem('django_user', JSON.stringify(response.user));
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const refreshToken = localStorage.getItem('django_refresh_token');
    const response = await this.request('/accounts/web/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    this.clearTokens();
    return response;
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('django_refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await this.request('/auth/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.access) {
        this.accessToken = response.access;
        localStorage.setItem('django_access_token', response.access);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearTokens();
    return false;
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

  // Utility Methods
  clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem('django_access_token');
    localStorage.removeItem('django_refresh_token');
    localStorage.removeItem('django_user');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('django_user');
    return userStr ? JSON.parse(userStr) : null;
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