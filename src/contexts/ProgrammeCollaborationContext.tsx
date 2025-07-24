import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { programmeCollaborationService, type ProgrammePresence, type TaskLock, type CollaborationState } from '../services/programmeCollaborationService';
import { usePermissions } from '../hooks/usePermissions';

interface ProgrammeCollaborationContextType {
  error: string | null;
  getCurrentUserPresence: () => ProgrammePresence | null;
  getOtherUsers: () => ProgrammePresence[];
  getProjectPresence: (projectId: string) => Promise<ProgrammePresence[]>;
  getProjectTaskLocks: (projectId: string) => Promise<TaskLock[]>;

  getTaskLock: (taskId: string) => Promise<TaskLock | null>;
  getTaskLockInfo: (taskId: string) => TaskLock | null;
  // Actions
  initializeCollaboration: (projectId: string) => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
  // Utility functions
  isTaskLocked: (taskId: string) => boolean;
  leaveCollaboration: () => Promise<void>;

  lockTask: (taskId: string) => Promise<{ success: boolean; error?: string; lock?: TaskLock }>;
  // State
  presence: ProgrammePresence[];
  taskLocks: TaskLock[];
  unlockTask: (taskId: string) => Promise<{ error?: string, success: boolean; }>;
}

const ProgrammeCollaborationContext = createContext<ProgrammeCollaborationContextType | undefined>(undefined);

interface ProgrammeCollaborationProviderProps {
  children: ReactNode;
}

export const ProgrammeCollaborationProvider: React.FC<ProgrammeCollaborationProviderProps> = ({ children }) => {
  const [presence, setPresence] = useState<ProgrammePresence[]>([]);
  const [taskLocks, setTaskLocks] = useState<TaskLock[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { canAccess } = usePermissions();

  // Check permissions
  const canViewPresence = canAccess('programme.collab.view');
  const canLockTasks = canAccess('programme.task.edit');

  // Initialize collaboration
  const initializeCollaboration = useCallback(async (projectId: string) => {
    if (!canViewPresence) {
      setError('Insufficient permissions to view collaboration');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await programmeCollaborationService.initializeCollaboration(projectId);
      setIsConnected(true);

      // Load initial data
      const [initialPresence, initialLocks] = await Promise.all([
        programmeCollaborationService.getProjectPresence(projectId),
        programmeCollaborationService.getProjectTaskLocks(projectId)
      ]);

      setPresence(initialPresence);
      setTaskLocks(initialLocks);

      // Get current user ID
      const { data: { user } } = await import('../services/supabase').then(m => m.supabase.auth.getUser());
      setCurrentUserId(user?.id || null);

    } catch (err) {
      console.error('Failed to initialize collaboration:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize collaboration');
    } finally {
      setIsLoading(false);
    }
  }, [canViewPresence]);

  // Leave collaboration
  const leaveCollaboration = useCallback(async () => {
    try {
      await programmeCollaborationService.leaveCollaboration();
      setIsConnected(false);
      setPresence([]);
      setTaskLocks([]);
      setCurrentUserId(null);
    } catch (err) {
      console.error('Failed to leave collaboration:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave collaboration');
    }
  }, []);

  // Lock task
  const lockTask = useCallback(async (taskId: string) => {
    if (!canLockTasks) {
      return { success: false, error: 'Insufficient permissions to lock tasks' };
    }

    try {
      const result = await programmeCollaborationService.lockTask(taskId);
      
      if (result.success && result.lock) {
        setTaskLocks(prev => {
          const existing = prev.find(lock => lock.taskId === taskId);
          if (existing) {
            return prev.map(lock => lock.taskId === taskId ? result.lock! : lock);
          } else {
            return [...prev, result.lock!];
          }
        });
      }

      return result;
    } catch (err) {
      console.error('Failed to lock task:', err);
      return { success: false, error: 'Failed to lock task' };
    }
  }, [canLockTasks]);

  // Unlock task
  const unlockTask = useCallback(async (taskId: string) => {
    if (!canLockTasks) {
      return { success: false, error: 'Insufficient permissions to unlock tasks' };
    }

    try {
      const result = await programmeCollaborationService.unlockTask(taskId);
      
      if (result.success) {
        setTaskLocks(prev => prev.filter(lock => lock.taskId !== taskId));
      }

      return result;
    } catch (err) {
      console.error('Failed to unlock task:', err);
      return { success: false, error: 'Failed to unlock task' };
    }
  }, [canLockTasks]);

  // Get task lock
  const getTaskLock = useCallback(async (taskId: string) => {
    return await programmeCollaborationService.getTaskLock(taskId);
  }, []);

  // Get project task locks
  const getProjectTaskLocks = useCallback(async (projectId: string) => {
    return await programmeCollaborationService.getProjectTaskLocks(projectId);
  }, []);

  // Get project presence
  const getProjectPresence = useCallback(async (projectId: string) => {
    return await programmeCollaborationService.getProjectPresence(projectId);
  }, []);

  // Utility functions
  const isTaskLocked = useCallback((taskId: string): boolean => {
    return taskLocks.some(lock => lock.taskId === taskId);
  }, [taskLocks]);

  const getTaskLockInfo = useCallback((taskId: string): TaskLock | null => {
    return taskLocks.find(lock => lock.taskId === taskId) || null;
  }, [taskLocks]);

  const getOtherUsers = useCallback((): ProgrammePresence[] => {
    return presence.filter(p => p.userId !== currentUserId);
  }, [presence, currentUserId]);

  const getCurrentUserPresence = useCallback((): ProgrammePresence | null => {
    return presence.find(p => p.userId === currentUserId) || null;
  }, [presence, currentUserId]);

  // Setup event listeners
  useEffect(() => {
    const handleUserJoined = (user: ProgrammePresence) => {
      setPresence(prev => {
        const existing = prev.find(p => p.userId === user.userId);
        if (existing) {
          return prev.map(p => p.userId === user.userId ? user : p);
        } else {
          return [...prev, user];
        }
      });
    };

    const handleUserUpdated = (user: ProgrammePresence) => {
      setPresence(prev => prev.map(p => p.userId === user.userId ? user : p));
    };

    const handleUserLeft = (user: ProgrammePresence) => {
      setPresence(prev => prev.filter(p => p.userId !== user.userId));
    };

    const handleTaskLocked = (lock: TaskLock) => {
      setTaskLocks(prev => {
        const existing = prev.find(l => l.taskId === lock.taskId);
        if (existing) {
          return prev.map(l => l.taskId === lock.taskId ? lock : l);
        } else {
          return [...prev, lock];
        }
      });
    };

    const handleTaskUnlocked = (lock: TaskLock) => {
      setTaskLocks(prev => prev.filter(l => l.taskId !== lock.taskId));
    };

    const handleCollaborationInitialized = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleCollaborationLeft = () => {
      setIsConnected(false);
      setPresence([]);
      setTaskLocks([]);
    };

    const handleError = (data: { error: string }) => {
      setError(data.error);
    };

    // Subscribe to events
    programmeCollaborationService.on('userJoined', handleUserJoined);
    programmeCollaborationService.on('userUpdated', handleUserUpdated);
    programmeCollaborationService.on('userLeft', handleUserLeft);
    programmeCollaborationService.on('taskLocked', handleTaskLocked);
    programmeCollaborationService.on('taskUnlocked', handleTaskUnlocked);
    programmeCollaborationService.on('collaborationInitialized', handleCollaborationInitialized);
    programmeCollaborationService.on('collaborationLeft', handleCollaborationLeft);
    programmeCollaborationService.on('error', handleError);

    // Cleanup on unmount
    return () => {
      programmeCollaborationService.off('userJoined', handleUserJoined);
      programmeCollaborationService.off('userUpdated', handleUserUpdated);
      programmeCollaborationService.off('userLeft', handleUserLeft);
      programmeCollaborationService.off('taskLocked', handleTaskLocked);
      programmeCollaborationService.off('taskUnlocked', handleTaskUnlocked);
      programmeCollaborationService.off('collaborationInitialized', handleCollaborationInitialized);
      programmeCollaborationService.off('collaborationLeft', handleCollaborationLeft);
      programmeCollaborationService.off('error', handleError);

      // Leave collaboration on unmount
      programmeCollaborationService.cleanup();
    };
  }, []);

  const contextValue: ProgrammeCollaborationContextType = {
    // State
    presence,
    taskLocks,
    isConnected,
    error,
    isLoading,

    // Actions
    initializeCollaboration,
    leaveCollaboration,
    lockTask,
    unlockTask,
    getTaskLock,
    getProjectTaskLocks,
    getProjectPresence,

    // Utility functions
    isTaskLocked,
    getTaskLockInfo,
    getOtherUsers,
    getCurrentUserPresence,
  };

  return (
    <ProgrammeCollaborationContext.Provider value={contextValue}>
      {children}
    </ProgrammeCollaborationContext.Provider>
  );
};

export const useProgrammeCollaboration = (): ProgrammeCollaborationContextType => {
  const context = useContext(ProgrammeCollaborationContext);
  if (context === undefined) {
    throw new Error('useProgrammeCollaboration must be used within a ProgrammeCollaborationProvider');
  }
  return context;
}; 