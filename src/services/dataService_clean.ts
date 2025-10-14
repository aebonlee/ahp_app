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
      
      // 생성 전 프로젝트 수 확인
      const beforeResponse = await this.getProjects();
      const beforeCount = beforeResponse.length;
      console.log('📊 생성 전 프로젝트 수:', beforeCount);
      
      const response = await projectApi.createProject(data);
      if (response.success && response.data) {
        console.log('✅ 프로젝트 생성 응답 수신:', Object.keys(response.data));
        
        // ID가 응답에 없으면 목록을 다시 조회해서 새 프로젝트 찾기
        if (!response.data.id) {
          console.log('⚠️ 응답에 ID 없음, 목록 재조회로 새 프로젝트 찾기...');
          
          // 잠시 대기 후 목록 재조회
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const afterResponse = await this.getProjects();
          console.log('📊 생성 후 프로젝트 수:', afterResponse.length);
          
          // 새로 생성된 프로젝트 찾기 (제목으로 매칭)
          const newProject = afterResponse.find(p => 
            p.title === data.title && 
            new Date(p.created_at || '').getTime() > Date.now() - 60000 // 1분 내 생성
          );
          
          if (newProject) {
            console.log('✅ 새 프로젝트 찾기 성공:', newProject.id);
            return newProject;
          } else {
            console.warn('⚠️ 새 프로젝트를 찾을 수 없음, 응답 데이터 사용');
            // ID 없이라도 생성된 데이터 반환
            return {
              ...response.data,
              id: `temp_${Date.now()}`, // 임시 ID 생성
              created_at: new Date().toISOString()
            } as ProjectData;
          }
        }
        
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
      console.log('🔍 PostgreSQL DB에서 기준 조회 시작:', projectId);
      const response = await criteriaApi.getCriteria(projectId);
      
      if (response.success && response.data) {
        // response.data가 이미 배열로 처리되어 옴
        const dataArray = Array.isArray(response.data) ? response.data : [];
        
        // type이 'criteria' 또는 없는 항목만 필터링 (alternative 제외)
        const criteria = dataArray
          .filter((item: any) => !item.type || item.type === 'criteria')
          .map((item: any) => ({
            id: item.id,
            project_id: projectId,
            name: item.name,
            description: item.description || '',
            // parent와 parent_id 필드 모두 처리
            parent_id: item.parent || item.parent_id || null,
            parent: item.parent || item.parent_id || null,
            level: item.level || 1,
            order: item.order || item.position || 0,
            position: item.position || item.order || 0,
            weight: item.weight || 0,
            type: 'criteria' as const
          }));
        
        console.log('✅ PostgreSQL DB 기준 조회 성공:', criteria.length, '개');
        return criteria;
      }
      
      console.warn('⚠️ PostgreSQL DB 기준 조회 실패');
      return [];
    } catch (error) {
      console.error('❌ PostgreSQL DB 기준 조회 중 오류:', error);
      console.error('🚨 백엔드 PostgreSQL DB 연결을 확인해주세요');
      return [];
    }
  }

  async createCriteria(data: Omit<CriteriaData, 'id'>): Promise<CriteriaData | null> {
    try {
      console.log('🔍 PostgreSQL DB에 기준 생성 시작:', {
        name: data.name,
        project_id: data.project_id,
        project_id_type: typeof data.project_id,
        level: data.level,
        parent_id: data.parent_id,
        parent_id_type: typeof data.parent_id,
        description: data.description
      });
      
      if (!data.project_id) {
        console.error('❌ 프로젝트 ID가 없습니다:', data);
        throw new Error('프로젝트 ID가 필요합니다.');
      }
      
      // 사전 중복 검사 - 백엔드 에러 방지
      try {
        const existingResponse = await criteriaApi.getCriteria(data.project_id);
        const existingCriteria = existingResponse.success && existingResponse.data ? existingResponse.data : [];
        
        // 정규화 함수
        const normalizeParentId = (id: any) => (!id || id === '') ? null : id;
        
        // 중복 검사 1: 동일한 이름과 레벨, 부모
        const exactDuplicate = existingCriteria.find((c: any) => 
          c.name.toLowerCase() === data.name.toLowerCase() && 
          c.level === data.level &&
          normalizeParentId(c.parent_id) === normalizeParentId(data.parent_id) &&
          (!c.type || c.type === 'criteria')
        );
        
        if (exactDuplicate) {
          console.warn(`⚠️ 완전 중복 발견: "${data.name}" (레벨: ${data.level}, parent: ${data.parent_id})`);
          console.log(`🔗 기존 데이터 사용: ID ${exactDuplicate.id}`);
          return exactDuplicate;
        }
        
        // 중복 검사 2: 동일한 이름만 (서로 다른 레벨이나 부모)
        const nameDuplicate = existingCriteria.find((c: any) => 
          c.name.toLowerCase() === data.name.toLowerCase() &&
          (!c.type || c.type === 'criteria')
        );
        
        if (nameDuplicate) {
          console.warn(`⚠️ 이름 중복 발견: "${data.name}" - 기존: L${nameDuplicate.level}, 새로운: L${data.level}`);
          // 다른 레벨이나 부모인 경우 경고만 하고 계속 진행
          if (nameDuplicate.level !== data.level || 
              normalizeParentId(nameDuplicate.parent_id) !== normalizeParentId(data.parent_id)) {
            console.log('🔄 다른 레벨/부모이므로 생성 계속');
          } else {
            // 완전히 동일한 경우
            console.log(`🔗 동일한 기준 발견 - 기존 데이터 사용: ID ${nameDuplicate.id}`);
            return nameDuplicate;
          }
        }
        
        console.log(`✅ 중복 없음 - 새 기준 생성 가능: "${data.name}"`);
        
      } catch (dupError) {
        console.warn('⚠️ 중복 검사 중 오류 (계속 진행):', dupError);
      }
      
      // PostgreSQL DB에 저장 - Criteria API 사용
      const response = await criteriaApi.createCriteria({
        ...data,
        type: 'criteria'
      });
      
      console.log('📥 PostgreSQL DB 기준 생성 API 응답:', {
        success: response.success,
        error: response.error,
        hasData: !!response.data,
        dataId: response.data?.id
      });
      
      if (response.success && response.data) {
        console.log('✅ PostgreSQL DB에 기준 생성 성공:', response.data);
        
        // 프로젝트의 criteria_count 업데이트
        try {
          const criteriaResponse = await this.getCriteria(data.project_id);
          await projectApi.updateProject(data.project_id, {
            criteria_count: criteriaResponse.length
          });
        } catch (updateError) {
          console.warn('⚠️ 프로젝트 기준 수 업데이트 실패:', updateError);
        }
        
        return response.data;
      }
      
      const errorMsg = response.error || '기준 생성에 실패했습니다.';
      console.error('❌ PostgreSQL DB 저장 실패:', errorMsg);
      console.error('🚨 백엔드 API 응답 상세:', {
        requestData: data,
        responseError: response.error,
        responseMessage: response.message
      });
      
      // 백엔드에서 already exists 에러가 발생한 경우 기존 데이터 찾기 시도
      if (errorMsg.includes('already exists') || errorMsg.includes('이미 존재')) {
        console.log('🔗 백엔드 중복 에러 - 기존 데이터 찾기 시도');
        try {
          const retryResponse = await criteriaApi.getCriteria(data.project_id);
          if (retryResponse.success && retryResponse.data) {
            const existing = retryResponse.data.find((c: any) => 
              c.name.toLowerCase() === data.name.toLowerCase() &&
              (!c.type || c.type === 'criteria')
            );
            if (existing) {
              console.log(`🎆 기존 데이터 발견 및 반환: ${existing.name} (ID: ${existing.id})`);
              return existing;
            }
          }
        } catch (retryError) {
          console.error('기존 데이터 찾기 실패:', retryError);
        }
      }
      
      throw new Error(errorMsg);
    } catch (error) {
      console.error('❌ PostgreSQL DB 기준 생성 중 오류:', error);
      console.error('🚨 백엔드 PostgreSQL DB가 정상 작동하지 않습니다');
      
      if (error instanceof Error) {
        throw new Error(`PostgreSQL DB 기준 생성 실패: ${error.message}`);
      }
      throw new Error('PostgreSQL DB 기준 생성에 실패했습니다.');
    }
  }

  // 메모리 데이터 관리 헬퍼 메서드들 (더 이상 사용하지 않음)
  private memoryStorage: { [key: string]: any } = {};

  private getMemoryData(key: string): any {
    // Deprecated - 모든 데이터는 DB에서 직접 조회
    console.warn('⚠️ getMemoryData는 더 이상 사용되지 않습니다. DB API를 사용하세요.');
    return this.memoryStorage[key];
  }

  private setMemoryData(key: string, data: any): void {
    // Deprecated - 모든 데이터는 DB에 직접 저장
    console.warn('⚠️ setMemoryData는 더 이상 사용되지 않습니다. DB API를 사용하세요.');
    this.memoryStorage[key] = data;
  }

  async deleteCriteria(criteriaId: string, projectId?: string): Promise<boolean> {
    try {
      console.log('🗑️ PostgreSQL DB에서 기준 삭제 시작:', criteriaId);
      
      // Criteria API를 사용하여 삭제 (projectId도 전달)
      const response = await criteriaApi.deleteCriteria(criteriaId, projectId);
      
      if (response.success) {
        console.log('✅ PostgreSQL DB에서 기준 삭제 성공:', criteriaId);
        
        // 프로젝트의 criteria_count 업데이트
        if (projectId) {
          try {
            const criteriaResponse = await this.getCriteria(projectId);
            await projectApi.updateProject(projectId, {
              criteria_count: criteriaResponse.length
            });
          } catch (updateError) {
            console.warn('⚠️ 프로젝트 기준 수 업데이트 실패:', updateError);
          }
        }
        
        return true;
      }
      
      console.error('❌ PostgreSQL DB 기준 삭제 실패');
      return false;
    } catch (error) {
      console.error('❌ PostgreSQL DB 기준 삭제 중 오류:', error);
      return false;
    }
  }

  // === 대안 관리 ===
  // Django에서는 Criteria 모델을 사용하며 type='alternative'로 구분
  async getAlternatives(projectId: string): Promise<AlternativeData[]> {
    try {
      console.log('🔍 대안 조회 시작 (Criteria API with type=alternative):', projectId);
      
      // Criteria API를 사용하여 type='alternative'인 항목 조회
      const response = await criteriaApi.getCriteria(projectId);
      if (response.success && response.data) {
        // response.data가 이미 배열로 처리되어 옴
        const dataArray = Array.isArray(response.data) ? response.data : [];
        
        // type이 'alternative'인 항목만 필터링하고 AlternativeData 형식으로 변환
        const alternatives = dataArray
          .filter((item: any) => item.type === 'alternative')
          .map((item: any) => ({
            id: item.id,
            project_id: projectId,
            name: item.name,
            description: item.description || '',
            position: item.order || item.position || 0,
            cost: item.cost || 0
          }));
        
        console.log('✅ 대안 조회 성공:', alternatives.length, '개');
        return alternatives;
      }
      
      console.warn('⚠️ 대안 조회 실패');
      return [];
    } catch (error) {
      console.error('❌ 대안 조회 중 오류:', error);
      return [];
    }
  }

  async createAlternative(data: Omit<AlternativeData, 'id'>): Promise<AlternativeData | null> {
    try {
      console.log('🔍 대안 생성 시작 (Criteria API with type=alternative):', data.name);
      
      if (!data.project_id) {
        throw new Error('프로젝트 ID가 필요합니다.');
      }
      
      // Criteria API를 사용하여 type='alternative'로 생성
      const criteriaData: Omit<CriteriaData, 'id'> = {
        project_id: data.project_id,
        name: data.name,
        description: data.description,
        position: data.position || 0,
        parent_id: null, // 대안은 최상위 레벨
        level: 0,
        order: data.position || 0
      };
      
      // Criteria API를 통해 alternative 타입으로 생성
      // Django 백엔드에서 type='alternative'로 처리됨
      const response = await criteriaApi.createCriteria({
        ...criteriaData,
        type: 'alternative'
      });
      
      if (response.success && response.data) {
        console.log('✅ 대안 생성 성공:', data.name);
        
        // CriteriaData를 AlternativeData로 변환
        const newAlternative: AlternativeData = {
          id: response.data.id,
          project_id: data.project_id,
          name: response.data.name,
          description: response.data.description || '',
          position: response.data.position || response.data.order || 0,
          cost: data.cost || 0
        };
        
        // 프로젝트의 alternatives_count 업데이트
        try {
          const alternativesResponse = await this.getAlternatives(data.project_id);
          await projectApi.updateProject(data.project_id, {
            alternatives_count: alternativesResponse.length
          });
        } catch (updateError) {
          console.warn('⚠️ 프로젝트 대안 수 업데이트 실패:', updateError);
        }
        
        return newAlternative;
      }
      
      throw new Error('대안 생성에 실패했습니다.');
    } catch (error) {
      console.error('❌ 대안 생성 중 오류:', error);
      throw error;
    }
  }

  async deleteAlternative(alternativeId: string, projectId?: string): Promise<boolean> {
    try {
      console.log('🗑️ 대안 삭제 시작 (Criteria API):', alternativeId);
      
      // Criteria API를 사용하여 삭제
      const response = await criteriaApi.deleteCriteria(alternativeId);
      
      if (response.success) {
        console.log('✅ 대안 삭제 성공:', alternativeId);
        
        // 프로젝트의 alternatives_count 업데이트
        if (projectId) {
          try {
            const alternativesResponse = await this.getAlternatives(projectId);
            await projectApi.updateProject(projectId, {
              alternatives_count: alternativesResponse.length
            });
          } catch (updateError) {
            console.warn('⚠️ 프로젝트 대안 수 업데이트 실패:', updateError);
          }
        }
        
        return true;
      }
      
      console.error('❌ 대안 삭제 실패');
      return false;
    } catch (error) {
      console.error('❌ 대안 삭제 중 오류:', error);
      return false;
    }
  }

  // === 평가자 관리 ===
  // 평가자는 프로젝트 settings 메타데이터에 저장
  async getEvaluators(projectId: string): Promise<EvaluatorData[]> {
    try {
      console.log('🔍 프로젝트 메타데이터에서 평가자 조회:', projectId);
      
      // 프로젝트 메타데이터에서 평가자 조회
      const projectResponse = await projectApi.getProject(projectId);
      if (projectResponse.success && projectResponse.data) {
        const evaluators = projectResponse.data.settings?.evaluators || [];
        console.log('✅ 평가자 조회 성공:', evaluators.length, '개');
        return evaluators;
      }
      
      console.warn('⚠️ 프로젝트 조회 실패 또는 평가자 없음');
      return [];
    } catch (error) {
      console.error('❌ 평가자 조회 중 오류:', error);
      return [];
    }
  }

  async createEvaluator(data: Omit<EvaluatorData, 'id'>): Promise<EvaluatorData | null> {
    try {
      console.log('🔍 평가자 생성 시작 (프로젝트 메타데이터):', data.name, data.email);
      console.log('🔍 프로젝트 ID:', data.project_id);
      
      if (!data.project_id) {
        throw new Error('프로젝트 ID가 필요합니다.');
      }
      
      // 프로젝트 조회
      console.log('📥 프로젝트 조회 중...');
      const projectResponse = await projectApi.getProject(data.project_id);
      console.log('📥 프로젝트 조회 응답:', projectResponse);
      
      if (!projectResponse.success || !projectResponse.data) {
        throw new Error(`프로젝트를 찾을 수 없습니다. (ID: ${data.project_id})`);
      }
      
      const currentProject = projectResponse.data;
      console.log('📋 현재 프로젝트 데이터:', {
        id: currentProject.id,
        title: currentProject.title,
        settings: currentProject.settings
      });
      
      // settings가 null이면 빈 객체로 초기화
      const currentSettings = currentProject.settings || {};
      const existingEvaluators = currentSettings.evaluators || [];
      console.log('👥 기존 평가자 수:', existingEvaluators.length);
      console.log('📋 현재 settings 구조:', currentSettings);
      
      // 중복 검사
      const isDuplicate = existingEvaluators.some((e: any) => 
        e.email.toLowerCase() === data.email.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error('동일한 이메일의 평가자가 이미 존재합니다.');
      }
      
      // 새 평가자 생성 - 영어 이름과 이메일만 사용하여 인코딩 문제 방지
      const newEvaluator: EvaluatorData = {
        project_id: data.project_id,
        name: data.name,
        email: data.email,
        id: `evaluator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        access_key: `KEY_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'pending'
      };
      
      console.log('✨ 새 평가자 데이터:', newEvaluator);
      
      // 메타데이터 업데이트 - Django가 받을 수 있는 형태로 수정
      const updatedEvaluators = [...existingEvaluators, newEvaluator];
      
      // settings를 JSON 문자열로 변환 (Django JSONField 대응)
      const newSettings = {
        ...currentSettings, // currentProject.settings 대신 currentSettings 사용
        evaluators: updatedEvaluators,
        evaluators_count: updatedEvaluators.length
      };
      
      // Django 백엔드가 요구하는 필수 필드들을 포함하여 업데이트
      const updateData = {
        title: currentProject.title,
        description: currentProject.description,
        objective: currentProject.objective || '평가자 추가를 위한 업데이트', // objective는 필수 필드
        settings: newSettings // JSON 객체 그대로 전송
      };
      
      console.log('🔄 프로젝트 업데이트 데이터:', updateData);
      console.log('🔄 현재 프로젝트 settings:', currentSettings);
      console.log('🔄 새로운 settings:', newSettings);
      console.log('🔄 업데이트할 평가자 목록:', updatedEvaluators);
      
      const updateResponse = await projectApi.updateProject(data.project_id, updateData);
      console.log('🔄 프로젝트 업데이트 응답:', updateResponse);
      
      // 응답 상세 분석
      if (!updateResponse.success) {
        console.error('❌ 프로젝트 업데이트 상세 오류:', {
          error: updateResponse.error,
          message: updateResponse.message,
          statusInfo: 'HTTP 400 - Django 백엔드에서 요청 거부'
        });
      }
      
      if (updateResponse.success) {
        console.log('✅ 평가자 생성 성공:', newEvaluator.name);
        return newEvaluator;
      }
      
      console.error('❌ 프로젝트 업데이트 실패:', updateResponse.error);
      throw new Error(`프로젝트 업데이트에 실패했습니다: ${updateResponse.error || '알 수 없는 오류'}`);
    } catch (error) {
      console.error('❌ 평가자 생성 중 오류:', error);
      throw error;
    }
  }

  async deleteEvaluator(evaluatorId: string, projectId?: string): Promise<boolean> {
    try {
      console.log('🗑️ 평가자 삭제 시작:', evaluatorId);
      
      // projectId가 없으면 모든 프로젝트에서 검색
      if (!projectId) {
        const projects = await this.getProjects();
        for (const project of projects) {
          const evaluators = project.settings?.evaluators || [];
          const foundEvaluator = evaluators.find((e: any) => e.id === evaluatorId);
          if (foundEvaluator) {
            projectId = project.id;
            break;
          }
        }
      }
      
      if (!projectId) {
        console.error('❌ 평가자를 찾을 수 없습니다:', evaluatorId);
        return false;
      }
      
      // 프로젝트 조회
      const projectResponse = await projectApi.getProject(projectId);
      if (!projectResponse.success || !projectResponse.data) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }
      
      const currentProject = projectResponse.data;
      const existingEvaluators = currentProject.settings?.evaluators || [];
      
      // 평가자 제거
      const updatedEvaluators = existingEvaluators.filter((e: any) => e.id !== evaluatorId);
      
      if (updatedEvaluators.length === existingEvaluators.length) {
        console.warn('⚠️ 삭제할 평가자를 찾을 수 없습니다:', evaluatorId);
        return false;
      }
      
      // 메타데이터 업데이트 - 필수 필드들 포함
      const updateResponse = await projectApi.updateProject(projectId, {
        title: currentProject.title,
        description: currentProject.description,
        objective: currentProject.objective || '평가자 삭제를 위한 업데이트',
        settings: {
          ...currentProject.settings,
          evaluators: updatedEvaluators,
          evaluators_count: updatedEvaluators.length
        }
      });
      
      if (updateResponse.success) {
        console.log('✅ 평가자 삭제 성공:', evaluatorId);
        return true;
      }
      
      throw new Error('프로젝트 업데이트에 실패했습니다.');
    } catch (error) {
      console.error('❌ 평가자 삭제 중 오류:', error);
      return false;
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