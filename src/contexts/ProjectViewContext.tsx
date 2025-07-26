import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectViewContextType {
  currentView: string;
  selectedTasks: string[];
  setCurrentView: (view: string) => void;
  setSelectedTasks: (tasks: string[]) => void;
  setShowGridlines: (show: boolean) => void;
  setShowMarkers: (show: boolean) => void;
  setTimelineEnd: (date: Date) => void;
  setTimelineStart: (date: Date) => void;
  setZoomLevel: (level: number) => void;
  showGridlines: boolean;
  showMarkers: boolean;
  timelineEnd: Date;
  timelineStart: Date;
  zoomLevel: number;
}

const ProjectViewContext = createContext<ProjectViewContextType | undefined>(undefined);

export const useProjectView = () => {
  const context = useContext(ProjectViewContext);
  if (context === undefined) {
    throw new Error('useProjectView must be used within a ProjectViewProvider');
  }
  return context;
};

interface ProjectViewProviderProps {
  children: ReactNode;
}

export const ProjectViewProvider: React.FC<ProjectViewProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState('gantt');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timelineStart, setTimelineStart] = useState(new Date());
  const [timelineEnd, setTimelineEnd] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showGridlines, setShowGridlines] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  const value: ProjectViewContextType = {
    currentView,
    setCurrentView,
    zoomLevel,
    setZoomLevel,
    timelineStart,
    setTimelineStart,
    timelineEnd,
    setTimelineEnd,
    selectedTasks,
    setSelectedTasks,
    showGridlines,
    setShowGridlines,
    showMarkers,
    setShowMarkers
  };

  return (
    <ProjectViewContext.Provider value={value}>
      {children}
    </ProjectViewContext.Provider>
  );
}; 