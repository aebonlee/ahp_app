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
      return [];
    } catch {
      return [];
    }
  }

  async getProject(id: string): Promise<ProjectData | null> {
    try {
      const response = await projectApi.getProject(id);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  async createProject(data: Omit<ProjectData, 'id'>): Promise<ProjectData | null> {
    const response = await projectApi.createProject(data);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async updateProject(id: string, data: Partial<ProjectData>): Promise<ProjectData | null> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    try {
      const response = await projectApi.updateProject(id, updateData);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // error propagated via throw below
    }

    // 백엔드 실패시 오류 반환
    throw new Error('Backend API 업데이트 실패');
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const response = await projectApi.deleteProject(id);
      if (response.success) {
        return true;
      }
    } catch {
      // error propagated via throw below
    }

    // 백엔드 실패시 오류 반환
    throw new Error('Backend API 삭제 실패');
  }

  // === 기준 관리 ===
  async getCriteria(projectId: string): Promise<CriteriaData[]> {
    try {
      const response = await criteriaApi.getCriteria(projectId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // silently return empty
    }

    return [];
  }

  async createCriteria(data: Omit<CriteriaData, 'id'>): Promise<CriteriaData | null> {
    const response = await criteriaApi.createCriteria(data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Backend API 기준 생성 실패');
  }

  async updateCriteria(id: string, data: Partial<CriteriaData>): Promise<CriteriaData | null> {
    const response = await criteriaApi.updateCriteria(id, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Backend API 기준 업데이트 실패');
  }

  async deleteCriteria(id: string, projectId?: string): Promise<boolean> {
    const response = await criteriaApi.deleteCriteria(id);
    if (response.success) {
      return true;
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
    } catch {
      // silently return empty
    }

    return [];
  }

  async createAlternative(data: Omit<AlternativeData, 'id'>): Promise<AlternativeData | null> {
    const response = await alternativeApi.createAlternative(data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Backend API 대안 생성 실패');
  }

  async updateAlternative(id: string, data: Partial<AlternativeData>): Promise<AlternativeData | null> {
    const response = await alternativeApi.updateAlternative(id, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Backend API 대안 업데이트 실패');
  }

  async deleteAlternative(id: string): Promise<boolean> {
    const response = await alternativeApi.deleteAlternative(id);
    if (response.success) {
      return true;
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
    } catch {
      // silently return empty
    }

    return [];
  }

  async addEvaluator(data: Omit<EvaluatorData, 'id'>): Promise<EvaluatorData | null> {
    const response = await evaluatorApi.addEvaluator(data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Backend API 평가자 추가 실패');
  }

  async removeEvaluator(id: string): Promise<boolean> {
    const response = await evaluatorApi.removeEvaluator(id);
    if (response.success) {
      return true;
    }
    throw new Error('Backend API 평가자 제거 실패');
  }

  // === 쌍대비교 데이터 관리 ===
  async savePairwiseComparison(data: Omit<PairwiseComparisonData, 'id'>): Promise<PairwiseComparisonData | null> {
    const response = await evaluationApi.savePairwiseComparison(data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Backend API 쌍대비교 저장 실패');
  }

  async getPairwiseComparisons(projectId: string, evaluatorId?: string): Promise<PairwiseComparisonData[]> {
    try {
      const response = await evaluationApi.getPairwiseComparisons(projectId, evaluatorId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // silently return empty
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
    } catch {
      // silently return empty
    }

    return [];
  }

  async restoreProject(id: string): Promise<boolean> {
    const response = await projectApi.restoreProject(id);
    return response.success;
  }

  async permanentDeleteProject(id: string): Promise<boolean> {
    const response = await projectApi.permanentDeleteProject(id);
    return response.success;
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
