import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { programmeUndoRedoService, ProgrammeAction, ActionPayload } from '../services/programmeUndoRedoService';
import { demoModeService } from '../services/demoModeService';
import { useAuth } from './AuthContext';

export interface ProgrammeUndoRedoAction {
  actionType: string;
  afterState: any;
  beforeState: any;
  demo?: boolean;
  description: string;
  id: string;
  projectId: string;
  taskId?: string;
  timestamp: Date;
  userId: string;
}

interface ProgrammeUndoRedoContextType {
  addAction: (payload: ActionPayload) => Promise<{ error?: string, success: boolean; }>;
  canRedo: boolean;
  canUndo: boolean;
  clearHistory: () => Promise<{ error?: string, success: boolean; }>;
  isDemoMode: boolean;
  redo: () => Promise<{ action?: ProgrammeUndoRedoAction, error?: string; success: boolean; }>;
  redoCount: number;
  redoStack: ProgrammeUndoRedoAction[];
  refreshState: () => Promise<void>;
  undo: () => Promise<{ action?: ProgrammeUndoRedoAction, error?: string; success: boolean; }>;
  undoCount: number;
  undoStack: ProgrammeUndoRedoAction[];
}

const ProgrammeUndoRedoContext = createContext<ProgrammeUndoRedoContextType | undefined>(undefined);

export const useProgrammeUndoRedo = () => {
  const context = useContext(ProgrammeUndoRedoContext);
  if (context === undefined) {
    throw new Error('useProgrammeUndoRedo must be used within a ProgrammeUndoRedoProvider');
  }
  return context;
};

interface ProgrammeUndoRedoProviderProps {
  children: React.ReactNode;
  projectId: string;
}

export const ProgrammeUndoRedoProvider: React.FC<ProgrammeUndoRedoProviderProps> = ({ 
  children, 
  projectId 
}) => {
  const { user } = useAuth();
  const [undoStack, setUndoStack] = useState<ProgrammeUndoRedoAction[]>([]);
  const [redoStack, setRedoStack] = useState<ProgrammeUndoRedoAction[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  const userId = user?.id || 'current-user';

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check demo mode
        const demoMode = await demoModeService.isDemoMode();
        setIsDemoMode(demoMode);

        // Initialize undo/redo state
        await refreshState();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing ProgrammeUndoRedoContext:', error);
      }
    };

    initialize();
  }, [projectId, userId]);

  // Refresh state from service
  const refreshState = useCallback(async () => {
    try {
      const [undoAvailable, redoAvailable, undoCountValue, redoCountValue] = await Promise.all([
        programmeUndoRedoService.canUndo(projectId, userId),
        programmeUndoRedoService.canRedo(projectId, userId),
        programmeUndoRedoService.getUndoCount(projectId, userId),
        programmeUndoRedoService.getRedoCount(projectId, userId)
      ]);

      setCanUndo(undoAvailable);
      setCanRedo(redoAvailable);
      setUndoCount(undoCountValue);
      setRedoCount(redoCountValue);
    } catch (error) {
      console.error('Error refreshing undo/redo state:', error);
    }
  }, [projectId, userId]);

  // Debounced refresh
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(refreshState, 100);
  }, [refreshState]);

  // Add action to undo stack
  const addAction = useCallback(async (payload: ActionPayload): Promise<{ error?: string, success: boolean; }> => {
    try {
      const result = await programmeUndoRedoService.recordAction(payload);
      
      if (result.success) {
        // Refresh state after a short delay to allow for service update
        debouncedRefresh();
      }
      
      return result;
    } catch (error) {
      console.error('Error adding action:', error);
      return { success: false, error: 'Failed to add action' };
    }
  }, [debouncedRefresh]);

  // Undo last action
  const undo = useCallback(async (): Promise<{ action?: ProgrammeUndoRedoAction, error?: string; success: boolean; }> => {
    try {
      const result = await programmeUndoRedoService.undo(projectId, userId);
      
      if (result.success) {
        // Refresh state after undo
        await refreshState();
      }
      
      return result;
    } catch (error) {
      console.error('Error undoing action:', error);
      return { success: false, error: 'Failed to undo action' };
    }
  }, [projectId, userId, refreshState]);

  // Redo last undone action
  const redo = useCallback(async (): Promise<{ action?: ProgrammeUndoRedoAction, error?: string; success: boolean; }> => {
    try {
      const result = await programmeUndoRedoService.redo(projectId, userId);
      
      if (result.success) {
        // Refresh state after redo
        await refreshState();
      }
      
      return result;
    } catch (error) {
      console.error('Error redoing action:', error);
      return { success: false, error: 'Failed to redo action' };
    }
  }, [projectId, userId, refreshState]);

  // Clear history
  const clearHistory = useCallback(async (): Promise<{ error?: string, success: boolean; }> => {
    try {
      const result = await programmeUndoRedoService.clearHistory(projectId, userId);
      
      if (result.success) {
        // Refresh state after clearing
        await refreshState();
      }
      
      return result;
    } catch (error) {
      console.error('Error clearing history:', error);
      return { success: false, error: 'Failed to clear history' };
    }
  }, [projectId, userId, refreshState]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isInitialized) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      // Ctrl+Z for undo
      if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canUndo) {
          const result = await undo();
          if (!result.success) {
            console.warn('Undo failed:', result.error);
          }
        }
      }
      
      // Ctrl+Y or Ctrl+Shift+Z for redo
      if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'Z')) {
        event.preventDefault();
        if (canRedo) {
          const result = await redo();
          if (!result.success) {
            console.warn('Redo failed:', result.error);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isInitialized, canUndo, canRedo, undo, redo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const value: ProgrammeUndoRedoContextType = {
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    isDemoMode,
    addAction,
    undo,
    redo,
    clearHistory,
    refreshState
  };

  return (
    <ProgrammeUndoRedoContext.Provider value={value}>
      {children}
    </ProgrammeUndoRedoContext.Provider>
  );
}; 