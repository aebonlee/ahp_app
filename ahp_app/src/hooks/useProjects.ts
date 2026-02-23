import { useState, useCallback } from 'react';
import cleanDataService from '../services/dataService_clean';
import type { ProjectData, PairwiseComparisonData } from '../services/api';
import type { User, UserProject } from '../types';

interface TrashOverflowData {
  trashedProjects: { id: string; title: string; description: string; deleted_at: string }[];
  projectToDelete: string;
  isVisible: boolean;
}

interface UseProjectsReturn {
  projects: UserProject[];
  loading: boolean;
  selectedProjectId: string | null;
  selectedProjectTitle: string;
  pendingDeleteProjectId: string | null;
  trashOverflowData: TrashOverflowData | null;
  setSelectedProjectId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedProjectTitle: React.Dispatch<React.SetStateAction<string>>;
  setPendingDeleteProjectId: React.Dispatch<React.SetStateAction<string | null>>;
  setProjects: React.Dispatch<React.SetStateAction<UserProject[]>>;
  fetchProjects: () => Promise<void>;
  createProject: (projectData: Partial<ProjectData>, onSuccess?: (project: ProjectData) => void) => Promise<ProjectData | undefined>;
  deleteProject: (projectId: string) => Promise<boolean>;
  fetchCriteria: (projectId: string) => Promise<unknown[]>;
  createCriteria: (projectId: string, criteriaData: Record<string, unknown>) => Promise<unknown>;
  fetchAlternatives: (projectId: string) => Promise<unknown[]>;
  createAlternative: (projectId: string, alternativeData: Record<string, unknown>) => Promise<unknown>;
  saveEvaluation: (projectId: string, evaluationData: Record<string, unknown>) => Promise<unknown>;
  fetchTrashedProjects: () => Promise<unknown[]>;
  restoreProject: (projectId: string) => Promise<boolean>;
  permanentDeleteProject: (projectId: string) => Promise<void>;
  handleTrashOverflow: (projectToDeleteAfterCleanup: string) => Promise<void>;
  handleTrashOverflowCancel: () => void;
  createSampleProject: () => Promise<void>;
  handleProjectSelect: (projectId: string, projectTitle: string) => void;
}

export function useProjects(user: User | null): UseProjectsReturn {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>('');
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = useState<string | null>(null);
  const [trashOverflowData, setTrashOverflowData] = useState<TrashOverflowData | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return;
    }

    setLoading(true);
    try {
      const projectsData = await cleanDataService.getProjects();

      const projectsWithCounts: UserProject[] = projectsData.map((project) => {
        const criteriaCount = project.criteria_count ?? 0;
        const alternativesCount = project.alternatives_count ?? 0;
        const settingsEvaluators = project.settings?.evaluators;
        const evaluatorCount =
          (Array.isArray(settingsEvaluators) ? settingsEvaluators.length : undefined) ??
          project.evaluatorCount ??
          0;
        const completion_rate =
          (criteriaCount >= 3 ? 40 : 0) +
          (alternativesCount >= 2 ? 40 : 0) +
          (evaluatorCount >= 1 ? 20 : 0);

        return {
          ...project,
          criteria_count: criteriaCount,
          alternatives_count: alternativesCount,
          evaluator_count: evaluatorCount,
          completion_rate,
          last_modified: project.updated_at ?? project.created_at ?? new Date().toISOString(),
          evaluation_method: (project as ProjectData & { evaluation_method?: 'pairwise' | 'direct' | 'mixed' }).evaluation_method ?? 'pairwise',
        } as UserProject;
      });

      setProjects(projectsWithCounts);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createProject = async (projectData: Partial<ProjectData>, onSuccess?: (project: ProjectData) => void) => {
    const newProject = await cleanDataService.createProject({
      title: projectData.title ?? '',
      description: projectData.description ?? '',
      objective: projectData.objective ?? '',
      status: projectData.status ?? 'draft',
      evaluation_mode: projectData.evaluation_mode ?? 'practical',
      workflow_stage: projectData.workflow_stage ?? 'creating',
      ahp_type: projectData.ahp_type ?? 'general',
      require_demographics: projectData.require_demographics ?? false,
      evaluation_flow_type: projectData.evaluation_flow_type ?? 'ahp_first'
    });

    if (newProject) {
      await fetchProjects();
      setSelectedProjectId(newProject.id || '');
      if (onSuccess) onSuccess(newProject);
      return newProject;
    }

    throw new Error('프로젝트 생성에 실패했습니다. 다시 시도해주세요.');
  };

  const deleteProject = async (projectId: string) => {
    const success = await cleanDataService.deleteProject(projectId);
    if (success) {
      await fetchProjects();
      return true;
    }
    throw new Error('프로젝트 삭제에 실패했습니다.');
  };

  const fetchCriteria = async (projectId: string) => {
    try {
      return await cleanDataService.getCriteria(projectId);
    } catch {
      return [];
    }
  };

  const createCriteria = async (projectId: string, criteriaData: Record<string, unknown>) => {
    return await cleanDataService.createCriteria({
      ...criteriaData,
      project_id: projectId
    } as Parameters<typeof cleanDataService.createCriteria>[0]);
  };

  const fetchAlternatives = async (projectId: string) => {
    try {
      return await cleanDataService.getAlternatives(projectId);
    } catch {
      return [];
    }
  };

  const createAlternative = async (projectId: string, alternativeData: Record<string, unknown>) => {
    return await cleanDataService.createAlternative({
      ...alternativeData,
      project_id: projectId
    } as Parameters<typeof cleanDataService.createAlternative>[0]);
  };

  const saveEvaluation = async (projectId: string, evaluationData: Record<string, unknown>) => {
    return await cleanDataService.saveEvaluation({
      project_id: projectId,
      ...evaluationData
    } as PairwiseComparisonData);
  };

  const fetchTrashedProjects = async () => {
    try {
      return await cleanDataService.getTrashedProjects();
    } catch {
      return [];
    }
  };

  const restoreProject = async (projectId: string) => {
    const success = await cleanDataService.restoreProject(projectId);
    if (success) {
      await fetchProjects();
      return true;
    }
    throw new Error('프로젝트 복원에 실패했습니다.');
  };

  const permanentDeleteProject = async (projectId: string): Promise<void> => {
    const success = await cleanDataService.permanentDeleteProject(projectId);
    if (!success) {
      throw new Error('영구 삭제에 실패했습니다.');
    }
  };

  const handleTrashOverflow = async (projectToDeleteAfterCleanup: string) => {
    setTrashOverflowData(null);
    await cleanDataService.permanentDeleteProject(projectToDeleteAfterCleanup);
    await fetchProjects();
  };

  const handleTrashOverflowCancel = () => {
    setTrashOverflowData(null);
  };

  const createSampleProject = async () => {
    try {
      await cleanDataService.createProject({
        title: '샘플 AHP 프로젝트',
        description: 'AHP 의사결정 분석을 위한 샘플 프로젝트입니다.',
        objective: '최적의 대안을 선택하기 위한 다기준 의사결정',
        status: 'draft',
        evaluation_mode: 'practical',
        workflow_stage: 'creating'
      });
      fetchProjects();
    } catch {
      // 샘플 프로젝트 생성 실패 무시
    }
  };

  const handleProjectSelect = (projectId: string, projectTitle: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
  };

  return {
    projects,
    loading,
    selectedProjectId,
    selectedProjectTitle,
    pendingDeleteProjectId,
    trashOverflowData,
    setSelectedProjectId,
    setSelectedProjectTitle,
    setPendingDeleteProjectId,
    setProjects,
    fetchProjects,
    createProject,
    deleteProject,
    fetchCriteria,
    createCriteria,
    fetchAlternatives,
    createAlternative,
    saveEvaluation,
    fetchTrashedProjects,
    restoreProject,
    permanentDeleteProject,
    handleTrashOverflow,
    handleTrashOverflowCancel,
    createSampleProject,
    handleProjectSelect,
  };
}
