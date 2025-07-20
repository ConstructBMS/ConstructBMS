import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AutoSaveState, AutoSaveConfig } from '../services/autoSaveService';
import { autoSaveService } from '../services/autoSaveService';

interface AutoSaveContextType {
  state: AutoSaveState;
  markDirty: (tableName: string, recordId: string, data: any) => void;
  forceSave: () => Promise<boolean>;
  clearDirty: () => void;
  setConfig: (config: Partial<AutoSaveConfig>) => void;
  configureTable: (tableName: string, config: any) => void;
}

const AutoSaveContext = createContext<AutoSaveContextType | undefined>(undefined);

interface AutoSaveProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<AutoSaveConfig>;
}

export const AutoSaveProvider: React.FC<AutoSaveProviderProps> = ({ 
  children, 
  initialConfig 
}) => {
  const [state, setState] = useState<AutoSaveState>(autoSaveService.getState());

  useEffect(() => {
    // Set initial configuration
    if (initialConfig) {
      autoSaveService.setConfig(initialConfig);
    }

    // Subscribe to auto-save state changes
    const unsubscribe = autoSaveService.subscribe((newState) => {
      setState(newState);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [initialConfig]);

  const markDirty = (tableName: string, recordId: string, data: any) => {
    autoSaveService.markDirty(tableName, recordId, data);
  };

  const forceSave = async (): Promise<boolean> => {
    return await autoSaveService.forceSave();
  };

  const clearDirty = () => {
    autoSaveService.clearDirty();
  };

  const setConfig = (config: Partial<AutoSaveConfig>) => {
    autoSaveService.setConfig(config);
  };

  const configureTable = (tableName: string, config: any) => {
    autoSaveService.configureTable(tableName, config);
  };

  const value: AutoSaveContextType = {
    state,
    markDirty,
    forceSave,
    clearDirty,
    setConfig,
    configureTable
  };

  return (
    <AutoSaveContext.Provider value={value}>
      {children}
    </AutoSaveContext.Provider>
  );
};

export const useAutoSave = (): AutoSaveContextType => {
  const context = useContext(AutoSaveContext);
  if (context === undefined) {
    throw new Error('useAutoSave must be used within an AutoSaveProvider');
  }
  return context;
};

// Hook for individual field auto-save
export const useAutoSaveField = (tableName: string, recordId: string) => {
  const { markDirty } = useAutoSave();

  const handleFieldChange = (fieldName: string, value: any) => {
    markDirty(tableName, recordId, { [fieldName]: value });
  };

  const handleBlur = (fieldName: string, value: any) => {
    markDirty(tableName, recordId, { [fieldName]: value });
  };

  return {
    handleFieldChange,
    handleBlur
  };
};

// Hook for form auto-save
export const useAutoSaveForm = (tableName: string, recordId: string) => {
  const { markDirty, forceSave } = useAutoSave();

  const handleFormChange = (formData: any) => {
    markDirty(tableName, recordId, formData);
  };

  const handleFormSubmit = async () => {
    return await forceSave();
  };

  return {
    handleFormChange,
    handleFormSubmit
  };
}; 