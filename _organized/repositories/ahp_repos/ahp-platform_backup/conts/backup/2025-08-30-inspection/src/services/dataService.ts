import api from './api';
import { ProjectData, CriteriaData, AlternativeData, EvaluatorData, PairwiseComparisonData } from './api';

// 로컬 스토리지 키 상수
const STORAGE_KEYS = {
  PROJECTS: 'ahp_projects',
  CRITERIA: 'ahp_criteria',
  ALTERNATIVES: 'ahp_alternatives',
  EVALUATORS: 'ahp_evaluators',
  COMPARISONS: 'ahp_comparisons',
  OFFLINE_MODE: 'ahp_offline_mode'
} as const;

// 오프라인 모드 확인 함수
const isOfflineMode = (): boolean => {
  // 프로덕션 환경에서는 항상 오프라인 모드 (GitHub Pages)
  if (process.env.NODE_ENV === 'production') {
    return true;
  }
  
  // 로컬 개발환경에서는 설정에 따라 결정
  return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE) === 'true';
};

// 로컬 스토리지 유틸리티 함수들
const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from storage [${key}]:`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage [${key}]:`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from storage [${key}]:`, error);
    }
  }
};

// UUID 생성 함수 (오프라인 모드용)
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
    if (isOfflineMode()) {
      return storage.get(STORAGE_KEYS.PROJECTS, []);
    }
    
    try {
      const response = await api.project.getProjects();
      if (response.success && response.data) {
        // 백엔드 데이터를 로컬에도 백업
        storage.set(STORAGE_KEYS.PROJECTS, response.data);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, using local data');
    }
    
    return storage.get(STORAGE_KEYS.PROJECTS, []);
  }

  async getProject(id: string): Promise<ProjectData | null> {
    if (isOfflineMode()) {
      const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
      return projects.find(p => p.id === id) || null;
    }
    
    try {
      const response = await api.project.getProject(id);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, using local data');
      const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
      return projects.find(p => p.id === id) || null;
    }
    
    return null;
  }

  async createProject(data: Omit<ProjectData, 'id'>): Promise<ProjectData | null> {
    const projectData: ProjectData = {
      ...data,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isOfflineMode()) {
      const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
      projects.push(projectData);
      storage.set(STORAGE_KEYS.PROJECTS, projects);
      return projectData;
    }
    
    try {
      const response = await api.project.createProject(data);
      if (response.success && response.data) {
        // 백엔드 성공시 로컬도 업데이트
        const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
        projects.push(response.data);
        storage.set(STORAGE_KEYS.PROJECTS, projects);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, saving locally only');
    }
    
    // 백엔드 실패시 로컬에만 저장
    const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
    projects.push(projectData);
    storage.set(STORAGE_KEYS.PROJECTS, projects);
    return projectData;
  }

  async updateProject(id: string, data: Partial<ProjectData>): Promise<ProjectData | null> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    if (isOfflineMode()) {
      const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
      const index = projects.findIndex(p => p.id === id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...updateData };
        storage.set(STORAGE_KEYS.PROJECTS, projects);
        return projects[index];
      }
      return null;
    }
    
    try {
      const response = await api.project.updateProject(id, updateData);
      if (response.success && response.data) {
        // 로컬 데이터도 업데이트
        const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
          projects[index] = response.data;
          storage.set(STORAGE_KEYS.PROJECTS, projects);
        }
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, updating locally only');
    }
    
    // 백엔드 실패시 로컬만 업데이트
    const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updateData };
      storage.set(STORAGE_KEYS.PROJECTS, projects);
      return projects[index];
    }
    
    return null;
  }

  async deleteProject(id: string): Promise<boolean> {
    if (isOfflineMode()) {
      const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
      const filteredProjects = projects.filter(p => p.id !== id);
      storage.set(STORAGE_KEYS.PROJECTS, filteredProjects);
      
      // 관련 데이터도 삭제
      this.deleteCriteriaByProject(id);
      this.deleteAlternativesByProject(id);
      this.deleteEvaluatorsByProject(id);
      this.deleteComparisonsByProject(id);
      
      return true;
    }
    
    try {
      const response = await api.project.deleteProject(id);
      if (response.success) {
        // 로컬 데이터도 삭제
        const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
        const filteredProjects = projects.filter(p => p.id !== id);
        storage.set(STORAGE_KEYS.PROJECTS, filteredProjects);
        return true;
      }
    } catch (error) {
      console.warn('Backend unavailable, deleting locally only');
    }
    
    // 백엔드 실패시 로컬에서만 삭제
    const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
    const filteredProjects = projects.filter(p => p.id !== id);
    storage.set(STORAGE_KEYS.PROJECTS, filteredProjects);
    return true;
  }

  // === 기준 관리 ===
  async getCriteria(projectId: string): Promise<CriteriaData[]> {
    if (isOfflineMode()) {
      const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
      return allCriteria.filter(c => c.project_id === projectId).sort((a, b) => a.position - b.position);
    }
    
    try {
      const response = await api.criteria.getCriteria(projectId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, using local data');
    }
    
    const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
    return allCriteria.filter(c => c.project_id === projectId).sort((a, b) => a.position - b.position);
  }

  async createCriteria(data: Omit<CriteriaData, 'id'>): Promise<CriteriaData | null> {
    const criteriaData: CriteriaData = {
      ...data,
      id: generateUUID()
    };

    if (isOfflineMode()) {
      const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
      allCriteria.push(criteriaData);
      storage.set(STORAGE_KEYS.CRITERIA, allCriteria);
      return criteriaData;
    }
    
    try {
      const response = await api.criteria.createCriteria(data);
      if (response.success && response.data) {
        const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
        allCriteria.push(response.data);
        storage.set(STORAGE_KEYS.CRITERIA, allCriteria);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, saving locally only');
    }
    
    const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
    allCriteria.push(criteriaData);
    storage.set(STORAGE_KEYS.CRITERIA, allCriteria);
    return criteriaData;
  }

  async updateCriteria(id: string, data: Partial<CriteriaData>): Promise<CriteriaData | null> {
    if (isOfflineMode()) {
      const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
      const index = allCriteria.findIndex(c => c.id === id);
      if (index !== -1) {
        allCriteria[index] = { ...allCriteria[index], ...data };
        storage.set(STORAGE_KEYS.CRITERIA, allCriteria);
        return allCriteria[index];
      }
      return null;
    }
    
    try {
      const response = await api.criteria.updateCriteria(id, data);
      if (response.success && response.data) {
        const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
        const index = allCriteria.findIndex(c => c.id === id);
        if (index !== -1) {
          allCriteria[index] = response.data;
          storage.set(STORAGE_KEYS.CRITERIA, allCriteria);
        }
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, updating locally only');
    }
    
    const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
    const index = allCriteria.findIndex(c => c.id === id);
    if (index !== -1) {
      allCriteria[index] = { ...allCriteria[index], ...data };
      storage.set(STORAGE_KEYS.CRITERIA, allCriteria);
      return allCriteria[index];
    }
    
    return null;
  }

  async deleteCriteria(id: string): Promise<boolean> {
    if (isOfflineMode()) {
      const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
      const filtered = allCriteria.filter(c => c.id !== id);
      storage.set(STORAGE_KEYS.CRITERIA, filtered);
      return true;
    }
    
    try {
      const response = await api.criteria.deleteCriteria(id);
      if (response.success) {
        const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
        const filtered = allCriteria.filter(c => c.id !== id);
        storage.set(STORAGE_KEYS.CRITERIA, filtered);
        return true;
      }
    } catch (error) {
      console.warn('Backend unavailable, deleting locally only');
    }
    
    const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
    const filtered = allCriteria.filter(c => c.id !== id);
    storage.set(STORAGE_KEYS.CRITERIA, filtered);
    return true;
  }

  // 프로젝트별 기준 삭제 (내부 함수)
  private deleteCriteriaByProject(projectId: string): void {
    const allCriteria = storage.get<CriteriaData[]>(STORAGE_KEYS.CRITERIA, []);
    const filtered = allCriteria.filter(c => c.project_id !== projectId);
    storage.set(STORAGE_KEYS.CRITERIA, filtered);
  }

  // === 대안 관리 ===
  async getAlternatives(projectId: string): Promise<AlternativeData[]> {
    if (isOfflineMode()) {
      const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
      return allAlternatives.filter(a => a.project_id === projectId).sort((a, b) => a.position - b.position);
    }
    
    try {
      const response = await api.alternative.getAlternatives(projectId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, using local data');
    }
    
    const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
    return allAlternatives.filter(a => a.project_id === projectId).sort((a, b) => a.position - b.position);
  }

  async createAlternative(data: Omit<AlternativeData, 'id'>): Promise<AlternativeData | null> {
    const alternativeData: AlternativeData = {
      ...data,
      id: generateUUID()
    };

    if (isOfflineMode()) {
      const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
      allAlternatives.push(alternativeData);
      storage.set(STORAGE_KEYS.ALTERNATIVES, allAlternatives);
      return alternativeData;
    }
    
    try {
      const response = await api.alternative.createAlternative(data);
      if (response.success && response.data) {
        const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
        allAlternatives.push(response.data);
        storage.set(STORAGE_KEYS.ALTERNATIVES, allAlternatives);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, saving locally only');
    }
    
    const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
    allAlternatives.push(alternativeData);
    storage.set(STORAGE_KEYS.ALTERNATIVES, allAlternatives);
    return alternativeData;
  }

  async updateAlternative(id: string, data: Partial<AlternativeData>): Promise<AlternativeData | null> {
    if (isOfflineMode()) {
      const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
      const index = allAlternatives.findIndex(a => a.id === id);
      if (index !== -1) {
        allAlternatives[index] = { ...allAlternatives[index], ...data };
        storage.set(STORAGE_KEYS.ALTERNATIVES, allAlternatives);
        return allAlternatives[index];
      }
      return null;
    }
    
    try {
      const response = await api.alternative.updateAlternative(id, data);
      if (response.success && response.data) {
        const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
        const index = allAlternatives.findIndex(a => a.id === id);
        if (index !== -1) {
          allAlternatives[index] = response.data;
          storage.set(STORAGE_KEYS.ALTERNATIVES, allAlternatives);
        }
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, updating locally only');
    }
    
    const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
    const index = allAlternatives.findIndex(a => a.id === id);
    if (index !== -1) {
      allAlternatives[index] = { ...allAlternatives[index], ...data };
      storage.set(STORAGE_KEYS.ALTERNATIVES, allAlternatives);
      return allAlternatives[index];
    }
    
    return null;
  }

  async deleteAlternative(id: string): Promise<boolean> {
    if (isOfflineMode()) {
      const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
      const filtered = allAlternatives.filter(a => a.id !== id);
      storage.set(STORAGE_KEYS.ALTERNATIVES, filtered);
      return true;
    }
    
    try {
      const response = await api.alternative.deleteAlternative(id);
      if (response.success) {
        const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
        const filtered = allAlternatives.filter(a => a.id !== id);
        storage.set(STORAGE_KEYS.ALTERNATIVES, filtered);
        return true;
      }
    } catch (error) {
      console.warn('Backend unavailable, deleting locally only');
    }
    
    const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
    const filtered = allAlternatives.filter(a => a.id !== id);
    storage.set(STORAGE_KEYS.ALTERNATIVES, filtered);
    return true;
  }

  // 프로젝트별 대안 삭제 (내부 함수)
  private deleteAlternativesByProject(projectId: string): void {
    const allAlternatives = storage.get<AlternativeData[]>(STORAGE_KEYS.ALTERNATIVES, []);
    const filtered = allAlternatives.filter(a => a.project_id !== projectId);
    storage.set(STORAGE_KEYS.ALTERNATIVES, filtered);
  }

  // === 평가자 관리 ===
  async getEvaluators(projectId: string): Promise<EvaluatorData[]> {
    if (isOfflineMode()) {
      const allEvaluators = storage.get<EvaluatorData[]>(STORAGE_KEYS.EVALUATORS, []);
      return allEvaluators.filter(e => e.project_id === projectId);
    }
    
    try {
      const response = await api.evaluator.getEvaluators(projectId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, using local data');
    }
    
    const allEvaluators = storage.get<EvaluatorData[]>(STORAGE_KEYS.EVALUATORS, []);
    return allEvaluators.filter(e => e.project_id === projectId);
  }

  async addEvaluator(data: Omit<EvaluatorData, 'id'>): Promise<EvaluatorData | null> {
    const evaluatorData: EvaluatorData = {
      ...data,
      id: generateUUID(),
      access_key: generateUUID().substring(0, 8).toUpperCase()
    };

    if (isOfflineMode()) {
      const allEvaluators = storage.get<EvaluatorData[]>(STORAGE_KEYS.EVALUATORS, []);
      allEvaluators.push(evaluatorData);
      storage.set(STORAGE_KEYS.EVALUATORS, allEvaluators);
      return evaluatorData;
    }
    
    try {
      const response = await api.evaluator.addEvaluator(data);
      if (response.success && response.data) {
        const allEvaluators = storage.get<EvaluatorData[]>(STORAGE_KEYS.EVALUATORS, []);
        allEvaluators.push(response.data);
        storage.set(STORAGE_KEYS.EVALUATORS, allEvaluators);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, saving locally only');
    }
    
    const allEvaluators = storage.get<EvaluatorData[]>(STORAGE_KEYS.EVALUATORS, []);
    allEvaluators.push(evaluatorData);
    storage.set(STORAGE_KEYS.EVALUATORS, allEvaluators);
    return evaluatorData;
  }

  async removeEvaluator(id: string): Promise<boolean> {
    if (isOfflineMode()) {
      const allEvaluators = storage.get<EvaluatorData[]>(STORAGE_KEYS.EVALUATORS, []);
      const filtered = allEvaluators.filter(e => e.id !== id);
      storage.set(STORAGE_KEYS.EVALUATORS, filtered);
      return true;
    }
    
    try {
      const response = await api.evaluator.removeEvaluator(id);
      if (response.success) {
        const allEvaluators = storage.get<EvaluatorData[]>(STORAGE_KEYS.EVALUATORS, []);
        const filtered = allEvaluators.filter(e => e.id !== id);
        storage.set(STORAGE_KEYS.EVALUATORS, filtered);
        return true;
      }
    } catch (error) {
      console.warn('Backend unavailable, removing locally only');
    }
    
    const allEvaluators = storage.get<EvaluatorData[]>(STORAGE_KEYS.EVALUATORS, []);
    const filtered = allEvaluators.filter(e => e.id !== id);
    storage.set(STORAGE_KEYS.EVALUATORS, filtered);
    return true;
  }

  // 프로젝트별 평가자 삭제 (내부 함수)
  private deleteEvaluatorsByProject(projectId: string): void {
    const allEvaluators = storage.get<EvaluatorData[]>(STORAGE_KEYS.EVALUATORS, []);
    const filtered = allEvaluators.filter(e => e.project_id !== projectId);
    storage.set(STORAGE_KEYS.EVALUATORS, filtered);
  }

  // === 쌍대비교 데이터 관리 ===
  async savePairwiseComparison(data: Omit<PairwiseComparisonData, 'id'>): Promise<PairwiseComparisonData | null> {
    const comparisonData: PairwiseComparisonData = {
      ...data,
      id: generateUUID()
    };

    if (isOfflineMode()) {
      const allComparisons = storage.get<PairwiseComparisonData[]>(STORAGE_KEYS.COMPARISONS, []);
      allComparisons.push(comparisonData);
      storage.set(STORAGE_KEYS.COMPARISONS, allComparisons);
      return comparisonData;
    }
    
    try {
      const response = await api.evaluation.savePairwiseComparison(data);
      if (response.success && response.data) {
        const allComparisons = storage.get<PairwiseComparisonData[]>(STORAGE_KEYS.COMPARISONS, []);
        allComparisons.push(response.data);
        storage.set(STORAGE_KEYS.COMPARISONS, allComparisons);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, saving locally only');
    }
    
    const allComparisons = storage.get<PairwiseComparisonData[]>(STORAGE_KEYS.COMPARISONS, []);
    allComparisons.push(comparisonData);
    storage.set(STORAGE_KEYS.COMPARISONS, allComparisons);
    return comparisonData;
  }

  async getPairwiseComparisons(projectId: string, evaluatorId?: string): Promise<PairwiseComparisonData[]> {
    if (isOfflineMode()) {
      const allComparisons = storage.get<PairwiseComparisonData[]>(STORAGE_KEYS.COMPARISONS, []);
      return allComparisons.filter(c => {
        if (c.project_id !== projectId) return false;
        if (evaluatorId && c.evaluator_id !== evaluatorId) return false;
        return true;
      });
    }
    
    try {
      const response = await api.evaluation.getPairwiseComparisons(projectId, evaluatorId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Backend unavailable, using local data');
    }
    
    const allComparisons = storage.get<PairwiseComparisonData[]>(STORAGE_KEYS.COMPARISONS, []);
    return allComparisons.filter(c => {
      if (c.project_id !== projectId) return false;
      if (evaluatorId && c.evaluator_id !== evaluatorId) return false;
      return true;
    });
  }

  // 프로젝트별 비교 데이터 삭제 (내부 함수)
  private deleteComparisonsByProject(projectId: string): void {
    const allComparisons = storage.get<PairwiseComparisonData[]>(STORAGE_KEYS.COMPARISONS, []);
    const filtered = allComparisons.filter(c => c.project_id !== projectId);
    storage.set(STORAGE_KEYS.COMPARISONS, filtered);
  }

  // === 오프라인 모드 설정 ===
  setOfflineMode(enabled: boolean): void {
    storage.set(STORAGE_KEYS.OFFLINE_MODE, enabled.toString());
  }

  getOfflineMode(): boolean {
    return isOfflineMode();
  }

  // === 데이터 동기화 (향후 구현) ===
  async syncWithBackend(): Promise<boolean> {
    if (isOfflineMode()) {
      console.log('Currently in offline mode, sync skipped');
      return false;
    }
    
    try {
      // 향후 백엔드와 로컬 데이터 동기화 로직 구현
      console.log('Data sync functionality to be implemented');
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }

  // === 데이터 초기화 ===
  clearAllData(): void {
    storage.remove(STORAGE_KEYS.PROJECTS);
    storage.remove(STORAGE_KEYS.CRITERIA);
    storage.remove(STORAGE_KEYS.ALTERNATIVES);
    storage.remove(STORAGE_KEYS.EVALUATORS);
    storage.remove(STORAGE_KEYS.COMPARISONS);
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