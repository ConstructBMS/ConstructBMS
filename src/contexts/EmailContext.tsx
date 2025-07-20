import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EmailContextType {
  setUnreadCount: (count: number) => void;
  unreadCount: number;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};

interface EmailProviderProps {
  children: ReactNode;
}

export const EmailProvider: React.FC<EmailProviderProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <EmailContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </EmailContext.Provider>
  );
};
