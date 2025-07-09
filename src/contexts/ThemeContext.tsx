import React, { createContext, useContext, useEffect, useState } from 'react';
import { persistentStorage } from '../services/persistentStorage';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
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
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(
    'light'
  );

  // Load theme from database on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await persistentStorage.getSetting('theme', 'ui');
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.warn(
          'Failed to load theme from database, using default:',
          error
        );
        // Fallback to localStorage for backward compatibility
        const localStorageTheme = localStorage.getItem('archer-theme') as Theme;
        if (
          localStorageTheme &&
          ['light', 'dark', 'auto'].includes(localStorageTheme)
        ) {
          setThemeState(localStorageTheme);
        }
      }
    };

    loadTheme();
  }, []);

  // Update effective theme based on current theme and system preference
  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (theme === 'auto') {
        const systemPrefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        setEffectiveTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        setEffectiveTheme(theme);
      }
    };

    updateEffectiveTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        updateEffectiveTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
  }, [effectiveTheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);

    // Save to database
    try {
      await persistentStorage.setSetting('theme', newTheme, 'ui');
    } catch (error) {
      console.warn('Failed to save theme to database:', error);
      // Fallback to localStorage
      localStorage.setItem('archer-theme', newTheme);
    }
  };

  const value = {
    theme,
    effectiveTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export { ThemeProvider };
