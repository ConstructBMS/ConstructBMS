import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface LayoutSettings {
  zoomLevel: 'day' | 'week' | 'month';
  showGrid: boolean;
  showDependencies: boolean;
  showBarLabels: boolean;
  rowHeight: number;
  showCriticalPath: boolean;
  showProgress: boolean;
  showResources: boolean;
  showBaseline: boolean;
  showActuals: boolean;
  showVariance: boolean;
  timelineWidth: number;
  taskGridWidth: number;
  autoSave: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface ProjectViewState {
  layoutSettings: LayoutSettings;
  selectedTasks: string[];
  expandedTasks: string[];
  filters: {
    status: string[];
    priority: string[];
    assignee: string[];
    dateRange: { start: Date | null; end: Date | null };
  };
  sortBy: {
    field: string;
    direction: 'asc' | 'desc';
  };
  viewMode: 'gantt' | 'list' | 'board' | 'timeline';
}

interface ProjectViewContextType {
  state: ProjectViewState;
  updateLayoutSettings: (settings: Partial<LayoutSettings>) => void;
  updateFilters: (filters: Partial<ProjectViewState['filters']>) => void;
  updateSortBy: (sortBy: ProjectViewState['sortBy']) => void;
  setViewMode: (mode: ProjectViewState['viewMode']) => void;
  toggleTaskSelection: (taskId: string) => void;
  setSelectedTasks: (taskIds: string[]) => void;
  toggleTaskExpansion: (taskId: string) => void;
  setExpandedTasks: (taskIds: string[]) => void;
  resetToDefaults: () => void;
}

const defaultLayoutSettings: LayoutSettings = {
  zoomLevel: 'week',
  showGrid: true,
  showDependencies: true,
  showBarLabels: true,
  rowHeight: 32,
  showCriticalPath: false,
  showProgress: true,
  showResources: false,
  showBaseline: false,
  showActuals: false,
  showVariance: false,
  timelineWidth: 800,
  taskGridWidth: 400,
  autoSave: true,
  theme: 'light'
};

const defaultState: ProjectViewState = {
  layoutSettings: defaultLayoutSettings,
  selectedTasks: [],
  expandedTasks: [],
  filters: {
    status: [],
    priority: [],
    assignee: [],
    dateRange: { start: null, end: null }
  },
  sortBy: {
    field: 'startDate',
    direction: 'asc'
  },
  viewMode: 'gantt'
};

const ProjectViewContext = createContext<ProjectViewContextType | undefined>(undefined);

interface ProjectViewProviderProps {
  children: ReactNode;
  projectId?: string;
}

export const ProjectViewProvider: React.FC<ProjectViewProviderProps> = ({ 
  children, 
  projectId = 'default' 
}) => {
  const [state, setState] = useState<ProjectViewState>(() => {
    // Load saved state from localStorage
    try {
      const savedState = localStorage.getItem(`projectView_${projectId}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return {
          ...defaultState,
          ...parsed,
          layoutSettings: {
            ...defaultLayoutSettings,
            ...parsed.layoutSettings
          }
        };
      }
    } catch (error) {
      console.warn('Failed to load project view state from localStorage:', error);
    }
    return defaultState;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(`projectView_${projectId}`, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save project view state to localStorage:', error);
    }
  }, [state, projectId]);

  const updateLayoutSettings = (settings: Partial<LayoutSettings>) => {
    setState(prev => ({
      ...prev,
      layoutSettings: {
        ...prev.layoutSettings,
        ...settings
      }
    }));
  };

  const updateFilters = (filters: Partial<ProjectViewState['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters
      }
    }));
  };

  const updateSortBy = (sortBy: ProjectViewState['sortBy']) => {
    setState(prev => ({
      ...prev,
      sortBy
    }));
  };

  const setViewMode = (viewMode: ProjectViewState['viewMode']) => {
    setState(prev => ({
      ...prev,
      viewMode
    }));
  };

  const toggleTaskSelection = (taskId: string) => {
    setState(prev => ({
      ...prev,
      selectedTasks: prev.selectedTasks.includes(taskId)
        ? prev.selectedTasks.filter(id => id !== taskId)
        : [...prev.selectedTasks, taskId]
    }));
  };

  const setSelectedTasks = (taskIds: string[]) => {
    setState(prev => ({
      ...prev,
      selectedTasks: taskIds
    }));
  };

  const toggleTaskExpansion = (taskId: string) => {
    setState(prev => ({
      ...prev,
      expandedTasks: prev.expandedTasks.includes(taskId)
        ? prev.expandedTasks.filter(id => id !== taskId)
        : [...prev.expandedTasks, taskId]
    }));
  };

  const setExpandedTasks = (taskIds: string[]) => {
    setState(prev => ({
      ...prev,
      expandedTasks: taskIds
    }));
  };

  const resetToDefaults = () => {
    setState(defaultState);
  };

  const contextValue: ProjectViewContextType = {
    state,
    updateLayoutSettings,
    updateFilters,
    updateSortBy,
    setViewMode,
    toggleTaskSelection,
    setSelectedTasks,
    toggleTaskExpansion,
    setExpandedTasks,
    resetToDefaults
  };

  return (
    <ProjectViewContext.Provider value={contextValue}>
      {children}
    </ProjectViewContext.Provider>
  );
};

export const useProjectView = () => {
  const context = useContext(ProjectViewContext);
  if (context === undefined) {
    throw new Error('useProjectView must be used within a ProjectViewProvider');
  }
  return context;
}; 