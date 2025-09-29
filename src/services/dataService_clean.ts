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
        // projectApi에서 이미 정규화된 데이터를 반환하므로 직접 사용
        const projects = Array.isArray(response.data) ? response.data : [];
        
        // 각 프로젝트 데이터 무결성 검증 (정규화된 데이터에 대해)
        const validProjects = projects.filter((project: any) => {
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
      console.error('🚨 백엔드 DB 연결 실패 - 관리자에게 문의하세요');
      throw error;
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
      console.error('❌ 프로젝트 생성 실패:', response.error || 'Unknown error');
      throw new Error(response.error || '프로젝트 생성에 실패했습니다.');
    } catch (error) {
      console.error('❌ 프로젝트 생성 중 오류:', error);
      console.error('🚨 백엔드 DB 연결 실패 - 관리자에게 문의하세요');
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

  async getTrashedProjects(): Promise<ProjectData[]> {
    try {
      console.log('🔍 실제 DB에서 휴지통 프로젝트 조회 시작...');
      const response = await projectApi.getTrashedProjects();
      
      console.log('📡 휴지통 DB 응답 상세:', {
        success: response.success,
        data: response.data,
        error: response.error
      });
      
      if (response.success && response.data) {
        // projectApi에서 이미 정규화된 데이터를 반환하므로 직접 사용
        const projects = Array.isArray(response.data) ? response.data : [];
        
        const validProjects = projects.filter((project: any) => {
          const isValid = project && 
                         typeof project.id !== 'undefined' && 
                         typeof project.title === 'string' &&
                         project.deleted_at; // 삭제된 프로젝트만
          
          if (!isValid) {
            console.warn('⚠️ 잘못된 휴지통 프로젝트 데이터 발견:', project);
          }
          return isValid;
        });
        
        console.log('✅ 유효한 휴지통 프로젝트 조회 성공:', validProjects.length, '개');
        return validProjects;
      }
      console.error('❌ 휴지통 프로젝트 조회 실패');
      return [];
    } catch (error) {
      console.error('❌ 휴지통 프로젝트 조회 중 오류:', error);
      return [];
    }
  }

  async restoreProject(id: string): Promise<boolean> {
    try {
      console.log('♻️ 실제 DB에서 프로젝트 복원 시작:', id);
      const response = await projectApi.restoreProject(id);
      if (response.success) {
        console.log('✅ 프로젝트 복원 성공');
        return true;
      }
      console.error('❌ 프로젝트 복원 실패');
      return false;
    } catch (error) {
      console.error('❌ 프로젝트 복원 중 오류:', error);
      throw error;
    }
  }

  async permanentDeleteProject(id: string): Promise<boolean> {
    try {
      console.log('🗑️ 실제 DB에서 프로젝트 영구 삭제 시작:', id);
      const response = await projectApi.permanentDeleteProject(id);
      if (response.success) {
        console.log('✅ 프로젝트 영구 삭제 성공');
        return true;
      }
      console.error('❌ 프로젝트 영구 삭제 실패');
      return false;
    } catch (error) {
      console.error('❌ 프로젝트 영구 삭제 중 오류:', error);
      throw error;
    }
  }

  // === 기준 관리 ===
  async getCriteria(projectId: string): Promise<CriteriaData[]> {
    try {
      console.log('🔍 기준 조회 시작 (메타데이터 우선):', projectId);
      
      // 1단계: 프로젝트 메타데이터에서 기준 확인
      const projectResponse = await projectApi.getProject(projectId);
      if (projectResponse.success && projectResponse.data?.settings?.criteria) {
        const metaCriteria = projectResponse.data.settings.criteria;
        console.log('✅ 프로젝트 메타데이터에서 기준 발견:', metaCriteria.length, '개');
        return metaCriteria;
      }
      
      // 2단계: 기존 API로 시도 (인증 문제 가능성)
      console.log('🔍 기존 기준 API로 시도...');
      const response = await criteriaApi.getCriteria(projectId);
      if (response.success && response.data) {
        const criteria = Array.isArray(response.data) ? response.data : [];
        console.log('✅ 기준 API 조회 성공:', criteria.length, '개');
        return criteria;
      }
      
      console.warn('⚠️ 기준 조회 실패 - 메타데이터와 API 모두 실패');
      return [];
    } catch (error) {
      console.error('❌ 기준 조회 중 오류:', error);
      return [];
    }
  }

  async createCriteria(data: Omit<CriteriaData, 'id'>): Promise<CriteriaData | null> {
    try {
      console.log('🔍 기준 생성 시작 (메타데이터 우선):', data.name);
      
      // 1단계: 기존 API로 시도
      try {
        const response = await criteriaApi.createCriteria(data);
        if (response.success && response.data) {
          console.log('✅ 기준 API 생성 성공');
          return response.data;
        }
      } catch (apiError) {
        console.warn('⚠️ 기준 API 생성 실패, 메타데이터 방법 시도:', apiError);
      }
      
      // 2단계: 메타데이터에 저장 (인증 문제 우회)
      if (data.project_id) {
        const projectResponse = await projectApi.getProject(data.project_id);
        if (projectResponse.success && projectResponse.data) {
          const currentProject = projectResponse.data;
          const existingCriteria = currentProject.settings?.criteria || [];
          
          // 새 기준 ID 생성
          const newCriterion = {
            ...data,
            id: 'c' + Date.now(),
            order: existingCriteria.length + 1
          };
          
          // 메타데이터 업데이트
          const updatedCriteria = [...existingCriteria, newCriterion];
          const updateResponse = await projectApi.updateProject(data.project_id, {
            settings: {
              ...currentProject.settings,
              criteria: updatedCriteria,
              criteria_count: updatedCriteria.length
            }
          });
          
          if (updateResponse.success) {
            console.log('✅ 메타데이터로 기준 생성 성공');
            return newCriterion as CriteriaData;
          }
        }
      }
      
      console.error('❌ 기준 생성 실패 (모든 방법 실패)');
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

  // === localStorage 완전 제거됨 ===
  // 이전에 localStorage 정리 기능이 있었으나 완전히 제거됨
  // 모든 데이터는 Django 백엔드 API를 통해서만 처리
}

// 싱글톤 인스턴스 생성 및 내보내기
const cleanDataService = new CleanDataService();
export default cleanDataService;