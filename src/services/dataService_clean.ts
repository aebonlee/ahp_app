import { projectApi, criteriaApi, alternativeApi, evaluatorApi, evaluationApi } from './api';
import { ProjectData, CriteriaData, AlternativeData, EvaluatorData, PairwiseComparisonData } from './api';

/**
 * 완전히 PostgreSQL DB만 사용하는 깔끔한 데이터 서비스
 * localStorage나 mock 데이터 없이 순수 백엔드 API만 사용
 */
class CleanDataService {
  
  // === 프로젝트 관리 ===
  async getProjects(): Promise<ProjectData[]> {
    try {
      console.log('🔍 실제 DB에서 프로젝트 조회 시작...');
      const response = await projectApi.getProjects();
      
      console.log('📡 DB 응답 상세:', {
        success: response.success,
        data: response.data,
        error: response.error
      });
      
      if (response.success && response.data) {
        // 배열인지 확인하고 각 프로젝트 데이터 검증
        const rawData = response.data;
        const projects = Array.isArray(rawData) ? rawData : [];
        
        // 각 프로젝트 데이터 무결성 검증
        const validProjects = projects.filter(project => {
          const isValid = project && 
                         typeof project.id !== 'undefined' && 
                         typeof project.title === 'string' &&
                         typeof project.status === 'string';
          
          if (!isValid) {
            console.warn('⚠️ 잘못된 프로젝트 데이터 발견:', project);
          }
          return isValid;
        });
        
        console.log('✅ 유효한 프로젝트 조회 성공:', validProjects.length, '개');
        console.log('📋 유효한 프로젝트 목록:', validProjects);
        return validProjects;
      }
      console.error('❌ 프로젝트 조회 실패: response.success =', response.success, 'data =', response.data, 'error =', response.error);
      return [];
    } catch (error) {
      console.error('❌ 프로젝트 조회 중 오류:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<ProjectData | null> {
    try {
      console.log('🔍 실제 DB에서 프로젝트 단건 조회:', id);
      const response = await projectApi.getProject(id);
      if (response.success && response.data) {
        console.log('✅ 프로젝트 단건 조회 성공');
        return response.data;
      }
      console.error('❌ 프로젝트 단건 조회 실패');
      return null;
    } catch (error) {
      console.error('❌ 프로젝트 단건 조회 중 오류:', error);
      throw error;
    }
  }

  async createProject(data: Omit<ProjectData, 'id'>): Promise<ProjectData | null> {
    try {
      console.log('🔍 실제 DB에 프로젝트 생성 시작:', data.title);
      const response = await projectApi.createProject(data);
      if (response.success && response.data) {
        console.log('✅ 프로젝트 생성 성공:', response.data.id);
        return response.data;
      }
      console.error('❌ 프로젝트 생성 실패');
      return null;
    } catch (error) {
      console.error('❌ 프로젝트 생성 중 오류:', error);
      throw error;
    }
  }

  async updateProject(id: string, data: Partial<ProjectData>): Promise<ProjectData | null> {
    try {
      console.log('🔍 실제 DB에서 프로젝트 수정 시작:', id);
      const response = await projectApi.updateProject(id, data);
      if (response.success && response.data) {
        console.log('✅ 프로젝트 수정 성공');
        return response.data;
      }
      console.error('❌ 프로젝트 수정 실패');
      return null;
    } catch (error) {
      console.error('❌ 프로젝트 수정 중 오류:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      console.log('🗑️ 실제 DB에서 프로젝트 삭제 시작:', id);
      const response = await projectApi.deleteProject(id);
      if (response.success) {
        console.log('✅ 프로젝트 삭제 성공');
        return true;
      }
      console.error('❌ 프로젝트 삭제 실패');
      return false;
    } catch (error) {
      console.error('❌ 프로젝트 삭제 중 오류:', error);
      throw error;
    }
  }

  // === 기준 관리 ===
  async getCriteria(projectId: string): Promise<CriteriaData[]> {
    try {
      console.log('🔍 실제 DB에서 기준 조회 시작:', projectId);
      const response = await criteriaApi.getCriteria(projectId);
      if (response.success && response.data) {
        const criteria = Array.isArray(response.data) ? response.data : [];
        console.log('✅ 기준 조회 성공:', criteria.length, '개');
        return criteria;
      }
      console.error('❌ 기준 조회 실패');
      return [];
    } catch (error) {
      console.error('❌ 기준 조회 중 오류:', error);
      return [];
    }
  }

  async createCriteria(data: Omit<CriteriaData, 'id'>): Promise<CriteriaData | null> {
    try {
      console.log('🔍 실제 DB에 기준 생성 시작:', data.name);
      const response = await criteriaApi.createCriteria(data);
      if (response.success && response.data) {
        console.log('✅ 기준 생성 성공');
        return response.data;
      }
      console.error('❌ 기준 생성 실패');
      return null;
    } catch (error) {
      console.error('❌ 기준 생성 중 오류:', error);
      throw error;
    }
  }

  // === 대안 관리 ===
  async getAlternatives(projectId: string): Promise<AlternativeData[]> {
    try {
      console.log('🔍 실제 DB에서 대안 조회 시작:', projectId);
      const response = await alternativeApi.getAlternatives(projectId);
      if (response.success && response.data) {
        const alternatives = Array.isArray(response.data) ? response.data : [];
        console.log('✅ 대안 조회 성공:', alternatives.length, '개');
        return alternatives;
      }
      console.error('❌ 대안 조회 실패');
      return [];
    } catch (error) {
      console.error('❌ 대안 조회 중 오류:', error);
      return [];
    }
  }

  async createAlternative(data: Omit<AlternativeData, 'id'>): Promise<AlternativeData | null> {
    try {
      console.log('🔍 실제 DB에 대안 생성 시작:', data.name);
      const response = await alternativeApi.createAlternative(data);
      if (response.success && response.data) {
        console.log('✅ 대안 생성 성공');
        return response.data;
      }
      console.error('❌ 대안 생성 실패');
      return null;
    } catch (error) {
      console.error('❌ 대안 생성 중 오류:', error);
      throw error;
    }
  }

  // === 평가자 관리 ===
  async getEvaluators(projectId: string): Promise<EvaluatorData[]> {
    try {
      console.log('🔍 실제 DB에서 평가자 조회 시작:', projectId);
      const response = await evaluatorApi.getEvaluators(projectId);
      if (response.success && response.data) {
        const evaluators = Array.isArray(response.data) ? response.data : [];
        console.log('✅ 평가자 조회 성공:', evaluators.length, '개');
        return evaluators;
      }
      console.error('❌ 평가자 조회 실패');
      return [];
    } catch (error) {
      console.error('❌ 평가자 조회 중 오류:', error);
      return [];
    }
  }

  async createEvaluator(data: Omit<EvaluatorData, 'id'>): Promise<EvaluatorData | null> {
    try {
      console.log('🔍 실제 DB에 평가자 생성 시작:', data.name);
      const response = await evaluatorApi.addEvaluator(data);
      if (response.success && response.data) {
        console.log('✅ 평가자 생성 성공');
        return response.data;
      }
      console.error('❌ 평가자 생성 실패');
      return null;
    } catch (error) {
      console.error('❌ 평가자 생성 중 오류:', error);
      throw error;
    }
  }

  // === 평가 데이터 관리 ===
  async saveEvaluation(data: PairwiseComparisonData): Promise<any> {
    try {
      console.log('🔍 실제 DB에 평가 데이터 저장 시작');
      const response = await evaluationApi.savePairwiseComparison(data);
      if (response.success && response.data) {
        console.log('✅ 평가 데이터 저장 성공');
        return response.data;
      }
      console.error('❌ 평가 데이터 저장 실패');
      return null;
    } catch (error) {
      console.error('❌ 평가 데이터 저장 중 오류:', error);
      throw error;
    }
  }

  // === 오프라인 모드 제거 ===
  isOfflineMode(): boolean {
    return false; // 항상 온라인 모드, 실제 DB만 사용
  }

  // === 로컬 스토리지 정리 ===
  clearLocalStorage(): void {
    console.log('🧹 로컬 스토리지 정리 시작...');
    const keysToRemove = [
      'ahp_projects',
      'ahp_criteria', 
      'ahp_alternatives',
      'ahp_evaluators',
      'ahp_comparisons',
      'ahp_offline_mode',
      'ahp_trash_projects'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('🗑️ 삭제된 키:', key);
    });
    console.log('✅ 로컬 스토리지 정리 완료');
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const cleanDataService = new CleanDataService();
export default cleanDataService;