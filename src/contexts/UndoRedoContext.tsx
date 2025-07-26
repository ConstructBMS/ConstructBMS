import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UndoRedoContextType {
  addToHistory: (action: any) => void;
  canRedo: boolean;
  canUndo: boolean;
  redo: () => void;
  undo: () => void;
}

const UndoRedoContext = createContext<UndoRedoContextType | undefined>(undefined);

export const useUndoRedo = () => {
  const context = useContext(UndoRedoContext);
  if (context === undefined) {
    throw new Error('useUndoRedo must be used within an UndoRedoProvider');
  }
  return context;
};

interface UndoRedoProviderProps {
  children: ReactNode;
}

export const UndoRedoProvider: React.FC<UndoRedoProviderProps> = ({ children }) => {
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

  const value: UndoRedoContextType = {
    canUndo,
    canRedo,
    undo,
    redo,
    addToHistory
  };

  return (
    <UndoRedoContext.Provider value={value}>
      {children}
    </UndoRedoContext.Provider>
  );
}; 