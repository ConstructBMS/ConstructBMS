import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { persistentStorage } from '../services/persistentStorage';

export type ThemeId = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  isDark: boolean;
  setTheme: (theme: ThemeId) => void;
  theme: ThemeId;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from persistent storage or default to 'light'
  const [theme, setTheme] = useState<ThemeId>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  const isDark =
    theme === 'dark' ||
    (theme === 'auto' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Load theme from persistent storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await persistentStorage.getSetting('theme', 'ui');
        if (savedTheme) {
          setTheme(savedTheme as ThemeId);
        }
      } catch (error) {
        console.warn(
          'Failed to load theme from persistent storage, using default:',
          error
        );
      } finally {
        setIsInitialized(true);
      }
    };
    loadTheme();
  }, []);

  // Save theme to persistent storage when it changes
  useEffect(() => {
    if (isInitialized) {
      const saveTheme = async () => {
        try {
          await persistentStorage.setSetting('theme', theme, 'ui');
        } catch (error) {
          console.error('Failed to save theme to persistent storage:', error);
        }
      };
      saveTheme();
    }
  }, [theme, isInitialized]);

  // Add/remove 'dark' class on <body> when theme changes
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
