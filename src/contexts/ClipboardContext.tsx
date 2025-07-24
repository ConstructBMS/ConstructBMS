import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface ProgrammeTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  level: number;
  parentId?: string;
  predecessors?: string[];
  successors?: string[];
  assignee?: string;
  priority?: string;
  description?: string;
}

export interface ClipboardState {
  type: 'cut' | 'copy' | null;
  tasks: ProgrammeTask[];
}

interface ClipboardContextType {
  clipboard: ClipboardState;
  cutTasks: (tasks: ProgrammeTask[]) => void;
  copyTasks: (tasks: ProgrammeTask[]) => void;
  pasteTasks: () => ProgrammeTask[];
  clearClipboard: () => void;
  hasClipboardContent: () => boolean;
  getClipboardContent: () => ClipboardState;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

interface ClipboardProviderProps {
  children: ReactNode;
}

export const ClipboardProvider: React.FC<ClipboardProviderProps> = ({ children }) => {
  const [clipboard, setClipboard] = useState<ClipboardState>({
    type: null,
    tasks: []
  });

  const cutTasks = (tasks: ProgrammeTask[]) => {
    setClipboard({
      type: 'cut',
      tasks: tasks.map(task => ({ ...task }))
    });
  };

  const copyTasks = (tasks: ProgrammeTask[]) => {
    setClipboard({
      type: 'copy',
      tasks: tasks.map(task => ({ ...task }))
    });
  };

  const pasteTasks = (): ProgrammeTask[] => {
    if (clipboard.tasks.length === 0) {
      return [];
    }

    const pastedTasks = clipboard.tasks.map(task => ({
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: clipboard.type === 'copy' ? `${task.name} (Copy)` : task.name
    }));

    // Clear clipboard if it was a cut operation
    if (clipboard.type === 'cut') {
      setClipboard({ type: null, tasks: [] });
    }

    return pastedTasks;
  };

  const clearClipboard = () => {
    setClipboard({ type: null, tasks: [] });
  };

  const hasClipboardContent = (): boolean => {
    return clipboard.tasks.length > 0;
  };

  const getClipboardContent = (): ClipboardState => {
    return { ...clipboard };
  };

  const value: ClipboardContextType = {
    clipboard,
    cutTasks,
    copyTasks,
    pasteTasks,
    clearClipboard,
    hasClipboardContent,
    getClipboardContent
  };

  return (
    <ClipboardContext.Provider value={value}>
      {children}
    </ClipboardContext.Provider>
  );
};

export const useClipboard = (): ClipboardContextType => {
  const context = useContext(ClipboardContext);
  if (context === undefined) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
}; 