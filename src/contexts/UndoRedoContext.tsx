import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { persistentStorage } from '../services/persistentStorage';

export interface UndoRedoAction {
  data: any;
  demo?: boolean;
  description: string;
  id: string;
  timestamp: number;
  type: string;
}

interface UndoRedoContextType {
  addAction: (action: Omit<UndoRedoAction, 'id' | 'timestamp'>) => void;
  canRedo: boolean;
  canUndo: boolean;
  clearStacks: () => void;
  isRescheduling: boolean;
  redo: () => void;
  redoStack: UndoRedoAction[];
  setIsRescheduling: (rescheduling: boolean) => void;
  undo: () => void;
  undoStack: UndoRedoAction[];
}

const UndoRedoContext = createContext<UndoRedoContextType | undefined>(undefined);

const MAX_STACK_SIZE = 50;

export const useUndoRedo = () => {
  const context = useContext(UndoRedoContext);
  if (context === undefined) {
    throw new Error('useUndoRedo must be used within an UndoRedoProvider');
  }
  return context;
};

interface UndoRedoProviderProps {
  children: React.ReactNode;
  projectId?: string;
}

export const UndoRedoProvider: React.FC<UndoRedoProviderProps> = ({ 
  children, 
  projectId = 'default' 
}) => {
  const [undoStack, setUndoStack] = useState<UndoRedoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoRedoAction[]>([]);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Load stacks from persistent storage on mount
  useEffect(() => {
    const loadStacks = async () => {
      try {
        const savedUndoStack = await persistentStorage.getSetting(`undoStack_${projectId}`, 'undoRedo');
        const savedRedoStack = await persistentStorage.getSetting(`redoStack_${projectId}`, 'undoRedo');
        
        if (Array.isArray(savedUndoStack)) {
          setUndoStack(savedUndoStack.slice(-MAX_STACK_SIZE));
        }
        if (Array.isArray(savedRedoStack)) {
          setRedoStack(savedRedoStack.slice(-MAX_STACK_SIZE));
        }
      } catch (error) {
        console.error('Failed to load undo/redo stacks:', error);
      }
    };

    loadStacks();
  }, [projectId]);

  // Save stacks to persistent storage when they change
  const saveStacks = useCallback(async (newUndoStack: UndoRedoAction[], newRedoStack: UndoRedoAction[]) => {
    try {
      await persistentStorage.setSetting(`undoStack_${projectId}`, newUndoStack, 'undoRedo');
      await persistentStorage.setSetting(`redoStack_${projectId}`, newRedoStack, 'undoRedo');
    } catch (error) {
      console.error('Failed to save undo/redo stacks:', error);
    }
  }, [projectId]);

  const addAction = useCallback((action: Omit<UndoRedoAction, 'id' | 'timestamp'>) => {
    const newAction: UndoRedoAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    setUndoStack(prevStack => {
      const newStack = [...prevStack, newAction].slice(-MAX_STACK_SIZE);
      saveStacks(newStack, []);
      return newStack;
    });

    // Clear redo stack when new action is added
    setRedoStack([]);
    saveStacks([...undoStack, newAction].slice(-MAX_STACK_SIZE), []);
  }, [undoStack, saveStacks]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const actionToUndo = undoStack[undoStack.length - 1];
    if (!actionToUndo) return;
    
    const newUndoStack = undoStack.slice(0, -1);

    setUndoStack(newUndoStack);
    setRedoStack(prevStack => {
      const newRedoStack = [...prevStack, actionToUndo].slice(-MAX_STACK_SIZE);
      saveStacks(newUndoStack, newRedoStack);
      return newRedoStack;
    });

    // Log demo actions
    if (actionToUndo.demo) {
      console.log('Undoing demo action:', actionToUndo.description);
    }

    // Dispatch undo event for components to handle
    window.dispatchEvent(new CustomEvent('undoAction', { 
      detail: actionToUndo 
    }));
  }, [undoStack, saveStacks]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const actionToRedo = redoStack[redoStack.length - 1];
    if (!actionToRedo) return;
    
    const newRedoStack = redoStack.slice(0, -1);

    setRedoStack(newRedoStack);
    setUndoStack(prevStack => {
      const newUndoStack = [...prevStack, actionToRedo].slice(-MAX_STACK_SIZE);
      saveStacks(newUndoStack, newRedoStack);
      return newUndoStack;
    });

    // Log demo actions
    if (actionToRedo.demo) {
      console.log('Redoing demo action:', actionToRedo.description);
    }

    // Dispatch redo event for components to handle
    window.dispatchEvent(new CustomEvent('redoAction', { 
      detail: actionToRedo 
    }));
  }, [redoStack, saveStacks]);

  const clearStacks = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
    saveStacks([], []);
  }, [saveStacks]);

  const value: UndoRedoContextType = {
    undoStack,
    redoStack,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    addAction,
    undo,
    redo,
    clearStacks,
    isRescheduling,
    setIsRescheduling
  };

  return (
    <UndoRedoContext.Provider value={value}>
      {children}
    </UndoRedoContext.Provider>
  );
}; 