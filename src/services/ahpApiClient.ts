/**
 * AHP API 클라이언트
 * 타입 안전성과 일관성을 보장하는 API 서비스
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/api';
import {
  ApiResponse,
  PaginatedResponse,
  Project,
  Criterion,
  Alternative,
  Evaluator,
  Evaluation,
  AnalysisResult,
  User
} from '../types/ahp';
import {
  transformCriterion,
  transformAlternative,
  transformEvaluator,
  normalizeApiResponse,
  toSnakeCase,
  toCamelCase
} from '../utils/dataTransformers';

class AHPApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        // 토큰 추가
        const token = localStorage.getItem('ahp_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 데이터 변환 (camelCase → snake_case)
        if (config.data) {
          config.data = toSnakeCase(config.data);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => {
        // 데이터 변환 (snake_case → camelCase)
        if (response.data) {
          response.data = toCamelCase(response.data);
        }
        return response;
      },
      (error) => {
        // 에러 처리
        if (error.response?.status === 401) {
          // 인증 실패 처리
          localStorage.removeItem('ahp_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== 프로젝트 API ====================

  async getProjects(): Promise<Project[]> {
    const response = await this.client.get<Project[]>('/api/projects/');
    return response.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.client.get<Project>(`/api/projects/${id}/`);
    return response.data;
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    const response = await this.client.post<Project>('/api/projects/', data);
    return response.data;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await this.client.patch<Project>(`/api/projects/${id}/`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await this.client.delete(`/api/projects/${id}/`);
  }

  // ==================== 기준 API ====================

  async getCriteria(projectId: string): Promise<Criterion[]> {
    const response = await this.client.get(`/api/criteria/project/${projectId}/`);
    const data = normalizeApiResponse(response.data, transformCriterion);
    return Array.isArray(data) ? data : [data];
  }

  async getCriterion(id: string): Promise<Criterion> {
    const response = await this.client.get(`/api/criteria/${id}/`);
    return transformCriterion(response.data);
  }

  async createCriterion(data: Partial<Criterion>): Promise<Criterion> {
    const response = await this.client.post('/api/criteria/', data);
    return transformCriterion(response.data);
  }

  async updateCriterion(id: string, data: Partial<Criterion>): Promise<Criterion> {
    const response = await this.client.patch(`/api/criteria/${id}/`, data);
    return transformCriterion(response.data);
  }

  async deleteCriterion(id: string): Promise<void> {
    await this.client.delete(`/api/criteria/${id}/`);
  }

  async bulkCreateCriteria(projectId: string, criteria: Partial<Criterion>[]): Promise<Criterion[]> {
    const response = await this.client.post(`/api/criteria/bulk/`, {
      projectId,
      criteria
    });
    return normalizeApiResponse(response.data, transformCriterion) as Criterion[];
  }

  // ==================== 대안 API ====================

  async getAlternatives(projectId: string): Promise<Alternative[]> {
    const response = await this.client.get(`/api/alternatives/project/${projectId}/`);
    const data = normalizeApiResponse(response.data, transformAlternative);
    return Array.isArray(data) ? data : [data];
  }

  async getAlternative(id: string): Promise<Alternative> {
    const response = await this.client.get(`/api/alternatives/${id}/`);
    return transformAlternative(response.data);
  }

  async createAlternative(data: Partial<Alternative>): Promise<Alternative> {
    const response = await this.client.post('/api/alternatives/', data);
    return transformAlternative(response.data);
  }

  async updateAlternative(id: string, data: Partial<Alternative>): Promise<Alternative> {
    const response = await this.client.patch(`/api/alternatives/${id}/`, data);
    return transformAlternative(response.data);
  }

  async deleteAlternative(id: string): Promise<void> {
    await this.client.delete(`/api/alternatives/${id}/`);
  }

  // ==================== 평가자 API ====================

  async getEvaluators(projectId: string): Promise<Evaluator[]> {
    const response = await this.client.get(`/api/evaluators/project/${projectId}/`);
    const data = normalizeApiResponse(response.data, transformEvaluator);
    return Array.isArray(data) ? data : [data];
  }

  async getEvaluator(id: string): Promise<Evaluator> {
    const response = await this.client.get(`/api/evaluators/${id}/`);
    return transformEvaluator(response.data);
  }

  async createEvaluator(data: Partial<Evaluator>): Promise<Evaluator> {
    const response = await this.client.post('/api/evaluators/', data);
    return transformEvaluator(response.data);
  }

  async inviteEvaluators(projectId: string, emails: string[]): Promise<Evaluator[]> {
    const response = await this.client.post(`/api/evaluators/invite/`, {
      projectId,
      emails
    });
    return normalizeApiResponse(response.data, transformEvaluator) as Evaluator[];
  }

  async validateInvitation(code: string): Promise<{
    valid: boolean;
    invitation?: any;
    message?: string;
  }> {
    const response = await this.client.post('/api/evaluators/validate-invitation/', {
      code
    });
    return response.data;
  }

  async sendReminder(evaluatorId: string): Promise<void> {
    await this.client.post(`/api/evaluators/${evaluatorId}/remind/`);
  }

  // ==================== 평가 API ====================

  async getEvaluations(projectId: string): Promise<Evaluation[]> {
    const response = await this.client.get(`/api/evaluations/project/${projectId}/`);
    return response.data;
  }

  async getEvaluation(id: string): Promise<Evaluation> {
    const response = await this.client.get(`/api/evaluations/${id}/`);
    return response.data;
  }

  async submitEvaluation(data: Partial<Evaluation>): Promise<Evaluation> {
    const response = await this.client.post('/api/evaluations/', data);
    return response.data;
  }

  async submitHierarchicalEvaluation(data: any): Promise<AnalysisResult> {
    const response = await this.client.post('/api/evaluations/hierarchical/', data);
    return response.data;
  }

  async saveProgress(evaluationId: string, data: any): Promise<void> {
    await this.client.patch(`/api/evaluations/${evaluationId}/progress/`, data);
  }

  // ==================== 분석 API ====================

  async getAnalysisResults(projectId: string): Promise<AnalysisResult> {
    const response = await this.client.get(`/api/analysis/project/${projectId}/`);
    return response.data;
  }

  async runSensitivityAnalysis(projectId: string, criterionId: string): Promise<any> {
    const response = await this.client.post(`/api/analysis/sensitivity/`, {
      projectId,
      criterionId
    });
    return response.data;
  }

  async exportResults(projectId: string, format: 'excel' | 'pdf' | 'json'): Promise<Blob> {
    const response = await this.client.get(`/api/analysis/export/${projectId}/`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  // ==================== 사용자 API ====================

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/api/users/me/');
    return response.data;
  }

  async updateCurrentUser(data: Partial<User>): Promise<User> {
    const response = await this.client.patch('/api/users/me/', data);
    return response.data;
  }

  async login(username: string, password: string): Promise<{
    user: User;
    token: string;
  }> {
    const response = await this.client.post('/api/auth/login/', {
      username,
      password
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/api/auth/logout/');
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    const response = await this.client.post('/api/auth/register/', data);
    return response.data;
  }

  // ==================== 유틸리티 메서드 ====================

  async uploadFile(file: File, type: 'criteria' | 'alternatives' | 'evaluators'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.client.post('/api/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async checkHealth(): Promise<{
    status: 'ok' | 'error';
    message?: string;
  }> {
    try {
      const response = await this.client.get('/api/health/');
      return response.data;
    } catch (error) {
      return {
        status: 'error',
        message: 'Server is not responding'
      };
    }
  }
}

// 싱글톤 인스턴스
const ahpApiClient = new AHPApiClient();

export default ahpApiClient;