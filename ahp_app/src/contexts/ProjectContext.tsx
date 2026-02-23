import { createContext, useContext } from 'react';
import type { ProjectData } from '../services/api';
import type { UserProject } from '../types';

export interface ProjectContextValue {
  projects: UserProject[];
  loading: boolean;
  selectedProjectId: string | null;
  selectedProjectTitle: string;
  pendingDeleteProjectId: string | null;
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
  trashOverflowData: {
    trashedProjects: { id: string; title: string; description: string; deleted_at: string }[];
    projectToDelete: string;
    isVisible: boolean;
  } | null;
}

export const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjectContext must be used within ProjectProvider');
  return context;
}
