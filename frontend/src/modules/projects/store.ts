import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProjectsDAL } from '../../lib/data/projects';
import type {
  Project,
  ProjectFilters,
  ProjectFormData,
  ViewMode,
} from '../../lib/types/projects';

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  viewMode: ViewMode;
  filters: ProjectFilters;
  selectedProject: Project | null;

  // Actions
  loadProjects: (orgId: string) => Promise<void>;
  createProject: (projectData: ProjectFormData, orgId: string) => Promise<void>;
  updateProject: (
    id: string,
    projectData: ProjectFormData,
    orgId: string
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (project: Project | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: ProjectFilters) => void;
  clearError: () => void;
  getFilteredProjects: () => Project[];
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      isLoading: false,
      error: null,
      viewMode: 'list',
      filters: {},
      selectedProject: null,

      loadProjects: async (orgId: string) => {
        set({ isLoading: true, error: null });
        try {
          const projects = await ProjectsDAL.listProjects(orgId);
          set({ projects, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load projects',
            isLoading: false,
          });
        }
      },

      createProject: async (projectData: ProjectFormData, orgId: string) => {
        try {
          const newProject = await ProjectsDAL.upsertProject({
            ...projectData,
            orgId,
          });
          set(state => ({
            projects: [...state.projects, newProject],
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create project',
          });
          throw error;
        }
      },

      updateProject: async (
        id: string,
        projectData: ProjectFormData,
        orgId: string
      ) => {
        try {
          const updatedProject = await ProjectsDAL.upsertProject({
            ...projectData,
            id,
            orgId,
          });
          set(state => ({
            projects: state.projects.map(p =>
              p.id === id ? updatedProject : p
            ),
            selectedProject:
              state.selectedProject?.id === id
                ? updatedProject
                : state.selectedProject,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update project',
          });
          throw error;
        }
      },

      deleteProject: async (id: string) => {
        try {
          await ProjectsDAL.deleteProject(id);
          set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            selectedProject:
              state.selectedProject?.id === id ? null : state.selectedProject,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete project',
          });
          throw error;
        }
      },

      selectProject: (project: Project | null) => {
        set({ selectedProject: project });
      },

      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode });
      },

      setFilters: (filters: ProjectFilters) => {
        set({ filters });
      },

      clearError: () => {
        set({ error: null });
      },

      getFilteredProjects: () => {
        const { projects, filters } = get();
        let filtered = [...projects];

        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(
            project =>
              project.name.toLowerCase().includes(searchLower) ||
              project.description?.toLowerCase().includes(searchLower) ||
              project.tags?.some(tag => tag.toLowerCase().includes(searchLower))
          );
        }

        // Status filter
        if (filters.status && filters.status.length > 0) {
          filtered = filtered.filter(project =>
            filters.status!.includes(project.status)
          );
        }

        // Tags filter
        if (filters.tags && filters.tags.length > 0) {
          filtered = filtered.filter(project =>
            project.tags?.some(tag => filters.tags!.includes(tag))
          );
        }

        // Client filter
        if (filters.clientId) {
          filtered = filtered.filter(
            project => project.clientId === filters.clientId
          );
        }

        return filtered;
      },
    }),
    {
      name: 'projects-store',
      partialize: state => ({
        viewMode: state.viewMode,
        filters: state.filters,
      }),
    }
  )
);
