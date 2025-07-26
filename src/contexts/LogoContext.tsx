import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LogoContextType {
  brandColor: string;
  companyName: string;
  logoUrl: string;
  setBrandColor: (color: string) => void;
  setCompanyName: (name: string) => void;
  setLogoUrl: (url: string) => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};

interface LogoProviderProps {
  children: ReactNode;
}

export const LogoProvider: React.FC<LogoProviderProps> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState('/icons/logo.svg');
  const [companyName, setCompanyName] = useState('ConstructBMS');
  const [brandColor, setBrandColor] = useState('#3B82F6');

  const value: LogoContextType = {
    logoUrl,
    setLogoUrl,
    companyName,
    setCompanyName,
    brandColor,
    setBrandColor
  };

  return (
    <LogoContext.Provider value={value}>
      {children}
    </LogoContext.Provider>
  );
}; 