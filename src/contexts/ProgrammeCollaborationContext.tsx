import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProgrammeCollaborationContextType {
  activeUsers: any[];
  lockTask: (taskId: string, userId: string) => void;
  lockedTasks: string[];
  setActiveUsers: (users: any[]) => void;
  setLockedTasks: (tasks: string[]) => void;
  unlockTask: (taskId: string) => void;
}

const ProgrammeCollaborationContext = createContext<ProgrammeCollaborationContextType | undefined>(undefined);

export const useProgrammeCollaboration = () => {
  const context = useContext(ProgrammeCollaborationContext);
  if (context === undefined) {
    throw new Error('useProgrammeCollaboration must be used within a ProgrammeCollaborationProvider');
  }
  return context;
};

interface ProgrammeCollaborationProviderProps {
  children: ReactNode;
}

export const ProgrammeCollaborationProvider: React.FC<ProgrammeCollaborationProviderProps> = ({ children }) => {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [lockedTasks, setLockedTasks] = useState<string[]>([]);

  const lockTask = (taskId: string, userId: string) => {
    setLockedTasks(prev => [...prev, taskId]);
  };

  const unlockTask = (taskId: string) => {
    setLockedTasks(prev => prev.filter(id => id !== taskId));
  };

  const value: ProgrammeCollaborationContextType = {
    activeUsers,
    setActiveUsers,
    lockedTasks,
    setLockedTasks,
    lockTask,
    unlockTask
  };

  return (
    <ProgrammeCollaborationContext.Provider value={value}>
      {children}
    </ProgrammeCollaborationContext.Provider>
  );
}; 