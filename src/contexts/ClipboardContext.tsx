import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ClipboardContextType {
  addToClipboard: (item: any) => void;
  clearClipboard: () => void;
  clipboardData: any[];
  removeFromClipboard: (id: string) => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (context === undefined) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
};

interface ClipboardProviderProps {
  children: ReactNode;
}

export const ClipboardProvider: React.FC<ClipboardProviderProps> = ({ children }) => {
  const [clipboardData, setClipboardData] = useState<any[]>([]);

  const addToClipboard = (item: any) => {
    setClipboardData(prev => [...prev, item]);
  };

  const clearClipboard = () => {
    setClipboardData([]);
  };

  const removeFromClipboard = (id: string) => {
    setClipboardData(prev => prev.filter(item => item.id !== id));
  };

  const value: ClipboardContextType = {
    clipboardData,
    addToClipboard,
    clearClipboard,
    removeFromClipboard
  };

  return (
    <ClipboardContext.Provider value={value}>
      {children}
    </ClipboardContext.Provider>
  );
}; 