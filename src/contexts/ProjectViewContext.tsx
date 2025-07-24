import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { persistentStorage } from '../services/persistentStorage';

export interface LayoutSettings {
  autoSave: boolean;
  rowHeight: number;
  showActuals: boolean;
  showBarLabels: boolean;
  showBaseline: boolean;
  showCriticalPath: boolean;
  showDependencies: boolean;
  showGrid: boolean;
  showProgress: boolean;
  showResources: boolean;
  showVariance: boolean;
  taskGridWidth: number;
  theme: 'light' | 'dark' | 'auto';
  timelineWidth: number;
  zoomLevel: 'day' | 'week' | 'month';
}

export interface ProjectViewState {
  expandedTasks: string[];
  filters: {
    assignee: string[];
    dateRange: { end: Date | null, start: Date | null; };
    priority: string[];
    status: string[];
  };
  layoutSettings: LayoutSettings;
  selectedTasks: string[];
  sortBy: {
    direction: 'asc' | 'desc';
    field: string;
  };
  viewMode: 'gantt' | 'list' | 'board' | 'timeline';
}

interface ProjectViewContextType {
  resetToDefaults: () => void;
  setExpandedTasks: (taskIds: string[]) => void;
  setSelectedTasks: (taskIds: string[]) => void;
  setViewMode: (mode: ProjectViewState['viewMode']) => void;
  state: ProjectViewState;
  toggleTaskExpansion: (taskId: string) => void;
  toggleTaskSelection: (taskId: string) => void;
  updateFilters: (filters: Partial<ProjectViewState['filters']>) => void;
  updateLayoutSettings: (settings: Partial<LayoutSettings>) => void;
  updateSortBy: (sortBy: ProjectViewState['sortBy']) => void;
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
  const [state, setState] = useState<ProjectViewState>(defaultState);

  // Load saved state from persistent storage on mount
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const savedState = await persistentStorage.getSetting(`projectView_${projectId}`, 'project_view');
        if (savedState) {
          setState({
            ...defaultState,
            ...savedState,
            layoutSettings: {
              ...defaultLayoutSettings,
              ...savedState.layoutSettings
            }
          });
        }
      } catch (error) {
        console.warn('Failed to load project view state from persistent storage:', error);
      }
    };
    
    loadSavedState();
  }, [projectId]);

  // Save state to persistent storage whenever it changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await persistentStorage.setSetting(`projectView_${projectId}`, state, 'project_view');
      } catch (error) {
        console.warn('Failed to save project view state to persistent storage:', error);
      }
    };
    
    saveState();
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