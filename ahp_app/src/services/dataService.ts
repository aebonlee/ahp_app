import { projectApi, criteriaApi, alternativeApi, evaluatorApi, evaluationApi } from './api';
import { ProjectData, CriteriaData, AlternativeData, EvaluatorData, PairwiseComparisonData } from './api';


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
      throw error;
    }
  }

  async permanentDeleteProject(id: string): Promise<boolean> {
    try {
      const response = await projectApi.permanentDeleteProject(id);
      return response.success;
    } catch (error) {
      throw error;
    }
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
