import { projectApi, criteriaApi, alternativeApi, evaluatorApi, evaluationApi } from './api';
import { ProjectData, CriteriaData, AlternativeData, EvaluatorData, PairwiseComparisonData } from './api';

// localStorage 유틸리티 함수 제거됨 - 순수 API 기반 데이터 서비스로 대체
// 모든 데이터는 Django 백엔드 API를 통해 처리

// 로컬 스토리지 키 상수 (제거됨)
const STORAGE_KEYS = {
  PROJECTS: 'ahp_projects',
  CRITERIA: 'ahp_criteria',
  ALTERNATIVES: 'ahp_alternatives',
  EVALUATORS: 'ahp_evaluators',
  COMPARISONS: 'ahp_comparisons',
  OFFLINE_MODE: 'ahp_offline_mode',
  TRASH: 'ahp_trash_projects'
} as const;

// 오프라인 모드 완전 제거 - 항상 온라인 API 사용
const isOfflineMode = (): boolean => {
  return false; // 항상 false
};

// UUID 생성 함수 (API에서 ID 생성하므로 사용하지 않음)
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

// === 통합 데이터 서비스 클래스 ===
class DataService {
  
  // === 프로젝트 관리 ===
  async getProjects(): Promise<ProjectData[]> {
    try {
      const response = await projectApi.getProjects();
      if (response.success && response.data) {
        // projectApi에서 이미 정규화된 데이터를 반환
        return response.data;
      }
      console.error('Failed to fetch projects from backend');
      return [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<ProjectData | null> {
    try {
      const response = await projectApi.getProject(id);
      if (response.success && response.data) {
        return response.data;
      }
      console.error('Failed to fetch project from backend:', id);
      return null;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  async createProject(data: Omit<ProjectData, 'id'>): Promise<ProjectData | null> {
    try {
      const response = await projectApi.createProject(data);
      if (response.success && response.data) {
        return response.data;
      }
      console.error('Failed to create project');
      return null;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, data: Partial<ProjectData>): Promise<ProjectData | null> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    // 오프라인 모드 제거됨 - 순수 API만 사용
    
    try {
      const response = await projectApi.updateProject(id, updateData);
      if (response.success && response.data) {
        // localStorage 제거됨 - API 응답만 반환
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API update failed:', error);
    }
    
    // 백엔드 실패시 오류 반환 (localStorage 제거)
    throw new Error('Backend API 업데이트 실패');
  }

  async deleteProject(id: string): Promise<boolean> {
    // 오프라인 모드 제거됨 - API만 사용
    
    try {
      const response = await projectApi.deleteProject(id);
      if (response.success) {
        // localStorage 제거됨 - API 응답만 사용
        return true;
      }
    } catch (error) {
      console.warn('Backend API delete failed:', error);
    }
    
    // 백엔드 실패시 오류 반환 (localStorage 제거)
    throw new Error('Backend API 삭제 실패');
  }

  // === 기준 관리 ===
  async getCriteria(projectId: string): Promise<CriteriaData[]> {
    // 오프라인 모드 제거됨 - API만 사용
    
    try {
      const response = await criteriaApi.getCriteria(projectId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API getCriteria failed:', error);
    }
    
    // API 실패시 빈 배열 반환 (localStorage 제거)
    return [];
  }

  async createCriteria(data: Omit<CriteriaData, 'id'>): Promise<CriteriaData | null> {
    try {
      const response = await criteriaApi.createCriteria(data);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API createCriteria failed:', error);
      throw error;
    }
    
    throw new Error('Backend API 기준 생성 실패');
  }

  async updateCriteria(id: string, data: Partial<CriteriaData>): Promise<CriteriaData | null> {
    try {
      const response = await criteriaApi.updateCriteria(id, data);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API updateCriteria failed:', error);
      throw error;
    }
    
    throw new Error('Backend API 기준 업데이트 실패');
  }

  async deleteCriteria(id: string, projectId?: string): Promise<boolean> {
    try {
      const response = await criteriaApi.deleteCriteria(id);
      if (response.success) {
        return true;
      }
    } catch (error) {
      console.warn('Backend API deleteCriteria failed:', error);
      throw error;
    }
    
    throw new Error('Backend API 기준 삭제 실패');
  }

  // === 대안 관리 ===
  async getAlternatives(projectId: string): Promise<AlternativeData[]> {
    try {
      const response = await alternativeApi.getAlternatives(projectId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API getAlternatives failed:', error);
    }
    
    return [];
  }

  async createAlternative(data: Omit<AlternativeData, 'id'>): Promise<AlternativeData | null> {
    try {
      const response = await alternativeApi.createAlternative(data);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API createAlternative failed:', error);
      throw error;
    }
    
    throw new Error('Backend API 대안 생성 실패');
  }

  async updateAlternative(id: string, data: Partial<AlternativeData>): Promise<AlternativeData | null> {
    try {
      const response = await alternativeApi.updateAlternative(id, data);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API updateAlternative failed:', error);
      throw error;
    }
    
    throw new Error('Backend API 대안 업데이트 실패');
  }

  async deleteAlternative(id: string): Promise<boolean> {
    try {
      const response = await alternativeApi.deleteAlternative(id);
      if (response.success) {
        return true;
      }
    } catch (error) {
      console.warn('Backend API deleteAlternative failed:', error);
      throw error;
    }
    
    throw new Error('Backend API 대안 삭제 실패');
  }

  // === 평가자 관리 ===
  async getEvaluators(projectId: string): Promise<EvaluatorData[]> {
    try {
      const response = await evaluatorApi.getEvaluators(projectId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API getEvaluators failed:', error);
    }
    
    return [];
  }

  async addEvaluator(data: Omit<EvaluatorData, 'id'>): Promise<EvaluatorData | null> {
    try {
      const response = await evaluatorApi.addEvaluator(data);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API addEvaluator failed:', error);
      throw error;
    }
    
    throw new Error('Backend API 평가자 추가 실패');
  }

  async removeEvaluator(id: string): Promise<boolean> {
    try {
      const response = await evaluatorApi.removeEvaluator(id);
      if (response.success) {
        return true;
      }
    } catch (error) {
      console.warn('Backend API removeEvaluator failed:', error);
      throw error;
    }
    
    throw new Error('Backend API 평가자 제거 실패');
  }

  // === 쌍대비교 데이터 관리 ===
  async savePairwiseComparison(data: Omit<PairwiseComparisonData, 'id'>): Promise<PairwiseComparisonData | null> {
    try {
      const response = await evaluationApi.savePairwiseComparison(data);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API savePairwiseComparison failed:', error);
      throw error;
    }
    
    throw new Error('Backend API 쌍대비교 저장 실패');
  }

  async getPairwiseComparisons(projectId: string, evaluatorId?: string): Promise<PairwiseComparisonData[]> {
    try {
      const response = await evaluationApi.getPairwiseComparisons(projectId, evaluatorId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API getPairwiseComparisons failed:', error);
    }
    
    return [];
  }

  // === 오프라인 모드 설정 (제거됨) ===
  setOfflineMode(enabled: boolean): void {
    console.warn('Offline mode is deprecated - always using API');
  }

  getOfflineMode(): boolean {
    return false; // 항상 온라인 모드
  }

  // === 데이터 동기화 (제거됨) ===
  async syncWithBackend(): Promise<boolean> {
    console.warn('Sync functionality deprecated - always using real-time API');
    return true;
  }

  // === 휴지통 관리 ===
  async getTrashedProjects(): Promise<ProjectData[]> {
    try {
      const response = await projectApi.getTrashedProjects();
      if (response.success && response.data) {
        // projectApi에서 이미 정규화된 데이터를 반환
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API getTrashedProjects failed:', error);
    }
    
    return [];
  }

  async restoreProject(id: string): Promise<boolean> {
    try {
      const response = await projectApi.restoreProject(id);
      return response.success;
    } catch (error) {
      console.warn('Backend API restoreProject failed:', error);
      throw error;
    }
  }

  async permanentDeleteProject(id: string): Promise<boolean> {
    try {
      const response = await projectApi.permanentDeleteProject(id);
      return response.success;
    } catch (error) {
      console.warn('Backend API permanentDeleteProject failed:', error);
      throw error;
    }
  }

  // === 데이터 초기화 (제거됨) ===
  clearAllData(): void {
    console.warn('clearAllData deprecated - use API-based data management');
  }
}

// 싱글톤 인스턴스 생성
const dataService = new DataService();

export default dataService;
export { DataService };
export type { 
  ProjectData, 
  CriteriaData, 
  AlternativeData, 
  EvaluatorData, 
  PairwiseComparisonData 
};