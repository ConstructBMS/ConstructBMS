import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProgrammeUndoRedoContextType {
  addToHistory: (action: any) => void;
  canRedo: boolean;
  canUndo: boolean;
  clearHistory: () => void;
  redo: () => void;
  undo: () => void;
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
  children: ReactNode;
}

export const ProgrammeUndoRedoProvider: React.FC<ProgrammeUndoRedoProviderProps> = ({ children }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const undo = () => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const addToHistory = (action: any) => {
    setHistory(prev => [...prev.slice(0, currentIndex + 1), action]);
    setCurrentIndex(prev => prev + 1);
  };

  const clearHistory = () => {
    setHistory([]);
    setCurrentIndex(-1);
  };

  const value: ProgrammeUndoRedoContextType = {
    canUndo,
    canRedo,
    undo,
    redo,
    addToHistory,
    clearHistory
  };

  return (
    <ProgrammeUndoRedoContext.Provider value={value}>
      {children}
    </ProgrammeUndoRedoContext.Provider>
  );
}; 