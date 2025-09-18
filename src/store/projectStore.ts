// =============================================================================
// AHP Enterprise Platform - Project Store (3차 개발)
// =============================================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Project, Criteria, Alternative, APIResponse } from '../types';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://ahp-app-vuzk.onrender.com/api/v1';

interface ProjectState {
  // State
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Criteria management
  addCriteria: (criteria: Omit<Criteria, 'id'>) => Promise<void>;
  updateCriteria: (criteriaId: string, updates: Partial<Criteria>) => Promise<void>;
  deleteCriteria: (criteriaId: string) => Promise<void>;
  reorderCriteria: (criteriaIds: string[]) => void;
  
  // Alternative management
  addAlternative: (alternative: Omit<Alternative, 'id'>) => Promise<void>;
  updateAlternative: (alternativeId: string, updates: Partial<Alternative>) => Promise<void>;
  deleteAlternative: (alternativeId: string) => Promise<void>;
  reorderAlternatives: (alternativeIds: string[]) => void;
  
  // Utilities
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
  reset: () => void;
}

const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      // Initial State
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      // Fetch Projects
      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.get(`${API_BASE}/projects/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            set({
              projects: response.data.data || [],
              isLoading: false,
            });
          } else {
            throw new Error(response.data.message || 'Failed to fetch projects');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch projects',
            isLoading: false,
          });
        }
      },

      // Fetch Single Project
      fetchProject: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.get(`${API_BASE}/projects/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            set({
              currentProject: response.data.data,
              isLoading: false,
            });
          } else {
            throw new Error(response.data.message || 'Failed to fetch project');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch project',
            isLoading: false,
          });
        }
      },

      // Create Project
      createProject: async (projectData): Promise<string | null> => {
        set({ isLoading: true, error: null });
        
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.post(`${API_BASE}/projects/`, projectData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            const newProject = response.data.data;
            
            set((state) => ({
              projects: [...state.projects, newProject],
              currentProject: newProject,
              isLoading: false,
            }));
            
            return newProject.id;
          } else {
            throw new Error(response.data.message || 'Failed to create project');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to create project',
            isLoading: false,
          });
          return null;
        }
      },

      // Update Project
      updateProject: async (id: string, updates: Partial<Project>) => {
        set({ isLoading: true, error: null });
        
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.patch(`${API_BASE}/projects/${id}/`, updates, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            const updatedProject = response.data.data;
            
            set((state) => ({
              projects: state.projects.map(p => p.id === id ? updatedProject : p),
              currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
              isLoading: false,
            }));
          } else {
            throw new Error(response.data.message || 'Failed to update project');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to update project',
            isLoading: false,
          });
        }
      },

      // Delete Project
      deleteProject: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.delete(`${API_BASE}/projects/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            set((state) => ({
              projects: state.projects.filter(p => p.id !== id),
              currentProject: state.currentProject?.id === id ? null : state.currentProject,
              isLoading: false,
            }));
          } else {
            throw new Error(response.data.message || 'Failed to delete project');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to delete project',
            isLoading: false,
          });
        }
      },

      // Add Criteria
      addCriteria: async (criteriaData: Omit<Criteria, 'id'>) => {
        const { currentProject } = get();
        if (!currentProject) return;
        
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.post(`${API_BASE}/criteria/`, criteriaData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            const newCriteria = response.data.data;
            
            set((state) => ({
              currentProject: state.currentProject ? {
                ...state.currentProject,
                criteria: [...state.currentProject.criteria, newCriteria]
              } : null
            }));
          } else {
            throw new Error(response.data.message || 'Failed to add criteria');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to add criteria',
          });
        }
      },

      // Update Criteria
      updateCriteria: async (criteriaId: string, updates: Partial<Criteria>) => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.patch(`${API_BASE}/criteria/${criteriaId}/`, updates, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            const updatedCriteria = response.data.data;
            
            set((state) => ({
              currentProject: state.currentProject ? {
                ...state.currentProject,
                criteria: state.currentProject.criteria.map(c => 
                  c.id === criteriaId ? updatedCriteria : c
                )
              } : null
            }));
          } else {
            throw new Error(response.data.message || 'Failed to update criteria');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to update criteria',
          });
        }
      },

      // Delete Criteria
      deleteCriteria: async (criteriaId: string) => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.delete(`${API_BASE}/criteria/${criteriaId}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            set((state) => ({
              currentProject: state.currentProject ? {
                ...state.currentProject,
                criteria: state.currentProject.criteria.filter(c => c.id !== criteriaId)
              } : null
            }));
          } else {
            throw new Error(response.data.message || 'Failed to delete criteria');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to delete criteria',
          });
        }
      },

      // Reorder Criteria
      reorderCriteria: (criteriaIds: string[]) => {
        set((state) => {
          if (!state.currentProject) return state;
          
          const reorderedCriteria = criteriaIds.map(id => 
            state.currentProject!.criteria.find(c => c.id === id)!
          ).filter(Boolean);
          
          return {
            currentProject: {
              ...state.currentProject,
              criteria: reorderedCriteria
            }
          };
        });
      },

      // Add Alternative
      addAlternative: async (alternativeData: Omit<Alternative, 'id'>) => {
        const { currentProject } = get();
        if (!currentProject) return;
        
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.post(`${API_BASE}/alternatives/`, alternativeData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            const newAlternative = response.data.data;
            
            set((state) => ({
              currentProject: state.currentProject ? {
                ...state.currentProject,
                alternatives: [...state.currentProject.alternatives, newAlternative]
              } : null
            }));
          } else {
            throw new Error(response.data.message || 'Failed to add alternative');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to add alternative',
          });
        }
      },

      // Update Alternative
      updateAlternative: async (alternativeId: string, updates: Partial<Alternative>) => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.patch(`${API_BASE}/alternatives/${alternativeId}/`, updates, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            const updatedAlternative = response.data.data;
            
            set((state) => ({
              currentProject: state.currentProject ? {
                ...state.currentProject,
                alternatives: state.currentProject.alternatives.map(a => 
                  a.id === alternativeId ? updatedAlternative : a
                )
              } : null
            }));
          } else {
            throw new Error(response.data.message || 'Failed to update alternative');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to update alternative',
          });
        }
      },

      // Delete Alternative
      deleteAlternative: async (alternativeId: string) => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.delete(`${API_BASE}/alternatives/${alternativeId}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            set((state) => ({
              currentProject: state.currentProject ? {
                ...state.currentProject,
                alternatives: state.currentProject.alternatives.filter(a => a.id !== alternativeId)
              } : null
            }));
          } else {
            throw new Error(response.data.message || 'Failed to delete alternative');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to delete alternative',
          });
        }
      },

      // Reorder Alternatives
      reorderAlternatives: (alternativeIds: string[]) => {
        set((state) => {
          if (!state.currentProject) return state;
          
          const reorderedAlternatives = alternativeIds.map(id => 
            state.currentProject!.alternatives.find(a => a.id === id)!
          ).filter(Boolean);
          
          return {
            currentProject: {
              ...state.currentProject,
              alternatives: reorderedAlternatives
            }
          };
        });
      },

      // Set Current Project
      setCurrentProject: (project: Project | null) => {
        set({ currentProject: project });
      },

      // Clear Error
      clearError: () => set({ error: null }),

      // Reset Store
      reset: () => set({
        projects: [],
        currentProject: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'ProjectStore',
    }
  )
);

export default useProjectStore;