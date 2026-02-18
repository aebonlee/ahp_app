/**
 * useProjects.ts - 프로젝트 CRUD 커스텀 Hook
 *
 * Phase 1c 분리 대상 (CLAUDE.md 참조)
 * - 프로젝트 목록 조회, 생성, 삭제, 복원
 * - 휴지통 관리
 * - 평가 데이터 저장
 *
 * @담당 Claude Sonnet 4.6 (구현)
 */

import { useState, useCallback } from 'react';
import cleanDataService from '../services/dataService_clean';
import { API_BASE_URL } from '../config/api';
import type { User } from '../types';

interface UseProjectsReturn {
  projects: any[];
  loading: boolean;
  selectedProjectId: string | null;
  selectedProjectTitle: string;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedProjectTitle: (title: string) => void;
  fetchProjects: () => Promise<void>;
  createProject: (projectData: any) => Promise<any>;
  deleteProject: (projectId: string) => Promise<any>;
  restoreProject: (projectId: string) => Promise<any>;
  permanentDeleteProject: (projectId: string) => Promise<any>;
  fetchTrashedProjects: () => Promise<any[]>;
  fetchCriteria: (projectId: string) => Promise<any[]>;
  createCriteria: (projectId: string, criteriaData: any) => Promise<any>;
  fetchAlternatives: (projectId: string) => Promise<any[]>;
  createAlternative: (projectId: string, alternativeData: any) => Promise<any>;
  saveEvaluation: (projectId: string, evaluationData: any) => Promise<any>;
  handleProjectSelect: (projectId: string, projectTitle: string) => void;
  handleProjectStatusChange: (status: 'terminated' | 'completed') => void;
  createSampleProject: () => Promise<void>;
}

/**
 * useProjects - 프로젝트 상태와 CRUD 함수를 제공하는 커스텀 Hook
 *
 * @param user - 현재 로그인 사용자 (null이면 프로젝트 로드 스킵)
 * @param onNavigate - 탭 전환 콜백 (프로젝트 생성/완료 후 탭 이동)
 *
 * @example
 * const {
 *   projects, fetchProjects, createProject
 * } = useProjects(user, (tab, projectId) => setActiveTab(tab));
 */
export function useProjects(
  user: User | null,
  onNavigate?: (tab: string, projectId?: string, projectTitle?: string) => void
): UseProjectsReturn {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>('');

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return;
    }

    setLoading(true);
    try {
      const projectsData = await cleanDataService.getProjects();

      const projectsWithCounts = await Promise.all(
        projectsData.map(async (project: any) => {
          try {
            const [criteriaData, alternativesData, evaluatorsData] = await Promise.all([
              cleanDataService.getCriteria(project.id || ''),
              cleanDataService.getAlternatives(project.id || ''),
              cleanDataService.getEvaluators(project.id || ''),
            ]);

            const criteriaCount = criteriaData?.length || 0;
            const alternativesCount = alternativesData?.length || 0;
            const evaluatorCount = evaluatorsData?.length || 0;
            const progress =
              (criteriaCount >= 3 ? 40 : 0) +
              (alternativesCount >= 2 ? 40 : 0) +
              (evaluatorCount >= 1 ? 20 : 0);

            return {
              ...project,
              criteria_count: criteriaCount,
              alternatives_count: alternativesCount,
              evaluator_count: evaluatorCount,
              completion_rate: progress,
            };
          } catch {
            return {
              ...project,
              criteria_count: 0,
              alternatives_count: 0,
              evaluator_count: 0,
              completion_rate: 0,
            };
          }
        })
      );

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('❌ fetchProjects 오류:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createProject = useCallback(
    async (projectData: any) => {
      try {
        const newProject = await cleanDataService.createProject({
          title: projectData.title,
          description: projectData.description || '',
          objective: projectData.objective || '',
          status: projectData.status || 'draft',
          evaluation_mode: projectData.evaluation_mode || 'practical',
          workflow_stage: projectData.workflow_stage || 'creating',
        });

        if (newProject) {
          await fetchProjects();
          setSelectedProjectId(newProject.id || '');
          onNavigate?.('project-workflow', newProject.id, newProject.title);
          return newProject;
        }
        throw new Error('프로젝트 생성에 실패했습니다.');
      } catch (error) {
        console.error('❌ createProject 실패:', error);
        return null;
      }
    },
    [fetchProjects, onNavigate]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      const success = await cleanDataService.deleteProject(projectId);
      if (success) {
        await fetchProjects();
        return true;
      }
      throw new Error('프로젝트 삭제에 실패했습니다.');
    },
    [fetchProjects]
  );

  const restoreProject = useCallback(
    async (projectId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/restore`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '프로젝트 복원에 실패했습니다.');
      }
      await fetchProjects();
      return response.json();
    },
    [fetchProjects]
  );

  const permanentDeleteProject = useCallback(async (projectId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/permanent`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '영구 삭제에 실패했습니다.');
    }
    return response.json();
  }, []);

  const fetchTrashedProjects = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/trash/list`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        return data.projects || [];
      }
    } catch (error) {
      console.error('Failed to fetch trashed projects:', error);
    }
    return [];
  }, []);

  const fetchCriteria = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/criteria`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        return data.criteria || [];
      }
    } catch (error) {
      console.error('Failed to fetch criteria:', error);
    }
    return [];
  }, []);

  const createCriteria = useCallback(async (projectId: string, criteriaData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/criteria`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...criteriaData, project_id: projectId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '기준 추가에 실패했습니다.');
    }
    return response.json();
  }, []);

  const fetchAlternatives = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/alternatives`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        return data.alternatives || [];
      }
    } catch (error) {
      console.error('Failed to fetch alternatives:', error);
    }
    return [];
  }, []);

  const createAlternative = useCallback(async (projectId: string, alternativeData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/alternatives`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...alternativeData, project_id: projectId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '대안 추가에 실패했습니다.');
    }
    return response.json();
  }, []);

  const saveEvaluation = useCallback(async (projectId: string, evaluationData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, ...evaluationData }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '평가 저장에 실패했습니다.');
    }
    return response.json();
  }, []);

  const handleProjectSelect = useCallback((projectId: string, projectTitle: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
  }, []);

  const handleProjectStatusChange = useCallback(
    (status: 'terminated' | 'completed') => {
      onNavigate?.('personal-projects');
      setSelectedProjectId(null);
      setSelectedProjectTitle('');
    },
    [selectedProjectId, onNavigate]
  );

  const createSampleProject = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '샘플 AHP 프로젝트',
          description: 'AHP 의사결정 분석을 위한 샘플 프로젝트입니다.',
          objective: '최적의 대안을 선택하기 위한 다기준 의사결정',
        }),
      });
      if (response.ok) {
        await fetchProjects();
      }
    } catch (error) {
      console.error('Failed to create sample project:', error);
    }
  }, [fetchProjects]);

  return {
    projects,
    loading,
    selectedProjectId,
    selectedProjectTitle,
    setSelectedProjectId,
    setSelectedProjectTitle,
    fetchProjects,
    createProject,
    deleteProject,
    restoreProject,
    permanentDeleteProject,
    fetchTrashedProjects,
    fetchCriteria,
    createCriteria,
    fetchAlternatives,
    createAlternative,
    saveEvaluation,
    handleProjectSelect,
    handleProjectStatusChange,
    createSampleProject,
  };
}

export default useProjects;
