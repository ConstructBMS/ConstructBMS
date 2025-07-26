import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EmailContextType {
  emails: any[];
  setEmails: (emails: any[]) => void;
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
  const [emails, setEmails] = useState([]);

  const value: EmailContextType = {
    unreadCount,
    setUnreadCount,
    emails,
    setEmails
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
}; 