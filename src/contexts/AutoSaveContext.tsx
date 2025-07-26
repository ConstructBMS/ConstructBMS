import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AutoSaveContextType {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSaved: (date: Date | null) => void;
}

const AutoSaveContext = createContext<AutoSaveContextType | undefined>(undefined);

export const useAutoSave = () => {
  const context = useContext(AutoSaveContext);
  if (context === undefined) {
    throw new Error('useAutoSave must be used within an AutoSaveProvider');
  }
  return context;
};

export const useAutoSaveField = () => {
  const context = useContext(AutoSaveContext);
  if (context === undefined) {
    throw new Error('useAutoSaveField must be used within an AutoSaveProvider');
  }
  return context;
};

interface AutoSaveProviderProps {
  children: ReactNode;
}

export const AutoSaveProvider: React.FC<AutoSaveProviderProps> = ({ children }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const value: AutoSaveContextType = {
    isSaving,
    setIsSaving,
    lastSaved,
    setLastSaved,
    hasUnsavedChanges,
    setHasUnsavedChanges
  };

  return (
    <AutoSaveContext.Provider value={value}>
      {children}
    </AutoSaveContext.Provider>
  );
}; 