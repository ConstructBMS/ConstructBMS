import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { persistentStorage, LogoSettings } from '../services/persistentStorage';
import { useAuth } from './AuthContext';

interface LogoContextType {
  logoSettings: LogoSettings;
  updateMainLogo: (settings: Partial<LogoSettings['mainLogo']>) => void;
  updateSidebarLogo: (settings: Partial<LogoSettings['sidebarLogo']>) => void;
  resetLogos: () => void;
  canEditLogos: boolean;
}

const defaultLogoSettings: LogoSettings = {
  mainLogo: {
    type: 'text',
    text: 'ArcherBMS',
    imageUrl: null,
  },
  sidebarLogo: {
    type: 'icon',
    icon: 'home',
    imageUrl: null,
  },
};

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
  const { user, checkRole } = useAuth();
  const [logoSettings, setLogoSettings] =
    useState<LogoSettings>(defaultLogoSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user can edit logos (super admin only)
  const canEditLogos = checkRole('super_admin');

  useEffect(() => {
    const loadLogoSettings = async () => {
      try {
        const settings = await persistentStorage.getLogoSettings();
        if (settings) {
          setLogoSettings(settings);
        }
      } catch (error) {
        console.error('Error loading logo settings:', error);
        // Fall back to default settings
      } finally {
        setIsLoading(false);
      }
    };

    loadLogoSettings();
  }, []);

  const updateMainLogo = async (
    settings: Partial<LogoSettings['mainLogo']>
  ) => {
    if (!canEditLogos) {
      console.warn('Only super admin can edit logos');
      return;
    }

    const updatedSettings = {
      ...logoSettings,
      mainLogo: { ...logoSettings.mainLogo, ...settings },
    };

    setLogoSettings(updatedSettings);

    try {
      await persistentStorage.setLogoSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving logo settings:', error);
      // Revert on error
      setLogoSettings(logoSettings);
    }
  };

  const updateSidebarLogo = async (
    settings: Partial<LogoSettings['sidebarLogo']>
  ) => {
    if (!canEditLogos) {
      console.warn('Only super admin can edit logos');
      return;
    }

    const updatedSettings = {
      ...logoSettings,
      sidebarLogo: { ...logoSettings.sidebarLogo, ...settings },
    };

    setLogoSettings(updatedSettings);

    try {
      await persistentStorage.setLogoSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving logo settings:', error);
      // Revert on error
      setLogoSettings(logoSettings);
    }
  };

  const resetLogos = async () => {
    if (!canEditLogos) {
      console.warn('Only super admin can reset logos');
      return;
    }

    setLogoSettings(defaultLogoSettings);

    try {
      await persistentStorage.setLogoSettings(defaultLogoSettings);
    } catch (error) {
      console.error('Error resetting logo settings:', error);
    }
  };

  const value: LogoContextType = {
    logoSettings,
    updateMainLogo,
    updateSidebarLogo,
    resetLogos,
    canEditLogos,
  };

  return <LogoContext.Provider value={value}>{children}</LogoContext.Provider>;
};
