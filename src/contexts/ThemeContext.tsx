import React, { createContext, useContext, useEffect, useState } from 'react';
import { persistentStorage } from '../services/persistentStorage';
import type { ThemeMode } from '../types/theme';
import { themes, defaultTheme } from '../config/themes';

// Updated types for the new theme system
export type ThemeId = 'constructbms-light' | 'constructbms-dark';

export interface ThemeSettings {
  effectiveMode: 'light' | 'dark';
  mode: ThemeMode;
  themeId: ThemeId;
}

interface ThemeContextType {
  applyTheme: () => void;
  getCurrentThemeColors: () => any;
  setThemeId: (themeId: ThemeId) => void;
  setThemeMode: (mode: ThemeMode) => void;
  themeSettings: ThemeSettings;
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
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    themeId: 'constructbms-light',
    mode: 'auto',
    effectiveMode: 'light',
  });

  // Load theme settings from database on mount
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const savedThemeId = await persistentStorage.getSetting('themeId', 'ui');
        const savedMode = await persistentStorage.getSetting('themeMode', 'ui');
        
        if (savedThemeId && ['constructbms-light', 'constructbms-dark'].includes(savedThemeId)) {
          setThemeSettings(prev => ({
            ...prev,
            themeId: savedThemeId as ThemeId,
          }));
        }
        
        if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
          setThemeSettings(prev => ({
            ...prev,
            mode: savedMode as ThemeMode,
          }));
        }
      } catch (error) {
        console.warn('Failed to load theme settings from database:', error);
        // Fallback to localStorage for backward compatibility
        const localStorageTheme = localStorage.getItem('constructbms-theme') as ThemeMode;
        if (localStorageTheme && ['light', 'dark', 'auto'].includes(localStorageTheme)) {
          setThemeSettings(prev => ({
            ...prev,
            mode: localStorageTheme,
          }));
        }
      }
    };

    loadThemeSettings();
  }, []);

  // Update effective theme based on current mode and system preference
  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (themeSettings.mode === 'auto') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeSettings(prev => ({
          ...prev,
          effectiveMode: systemPrefersDark ? 'dark' : 'light',
        }));
      } else {
        setThemeSettings(prev => ({
          ...prev,
          effectiveMode: themeSettings.mode as 'light' | 'dark',
        }));
      }
    };

    updateEffectiveTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeSettings.mode === 'auto') {
        updateEffectiveTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeSettings.mode]);

  // Apply theme to document
  useEffect(() => {
    applyTheme();
  }, [themeSettings.themeId, themeSettings.effectiveMode]);

  const setThemeId = async (themeId: ThemeId) => {
    setThemeSettings(prev => ({ ...prev, themeId }));
    
    try {
      await persistentStorage.setSetting('themeId', themeId, 'ui');
    } catch (error) {
      console.warn('Failed to save theme ID to database:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeSettings(prev => ({ ...prev, mode }));
    
    try {
      await persistentStorage.setSetting('themeMode', mode, 'ui');
    } catch (error) {
      console.warn('Failed to save theme mode to database:', error);
      // Fallback to localStorage
      localStorage.setItem('constructbms-theme', mode);
    }
  };

  const applyTheme = () => {
    const root = window.document.documentElement;
    
    // Determine which theme to use based on effective mode
    const themeName = themeSettings.effectiveMode === 'dark' ? 'ConstructBMS Dark' : 'ConstructBMS Light';
    const theme = themes.find(t => t.name === themeName) || defaultTheme;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    root.classList.add(themeSettings.effectiveMode);

    // Set data-theme attribute for CSS targeting
    root.setAttribute('data-theme', themeSettings.effectiveMode);

    // Apply CSS custom properties from the theme
    if (theme) {
      Object.entries(theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    // Apply legacy variables for backward compatibility
    if (theme) {
      root.style.setProperty('--constructbms-primary', theme.colors.primary);
      root.style.setProperty('--constructbms-accent', theme.colors.accent);
      root.style.setProperty('--constructbms-green', theme.colors.accent);
      root.style.setProperty('--constructbms-blue', theme.colors.accent);
      root.style.setProperty('--constructbms-dark-1', theme.colors.background);
      root.style.setProperty('--constructbms-dark-2', theme.colors.surface);
      root.style.setProperty('--constructbms-light-1', theme.colors.text);
      root.style.setProperty('--constructbms-light-2', theme.colors.textSecondary);
      root.style.setProperty('--constructbms-black', theme.colors.background);
      root.style.setProperty('--constructbms-grey', theme.colors.surface);
    }
  };

  const getCurrentThemeColors = () => {
    const themeName = themeSettings.effectiveMode === 'dark' ? 'ConstructBMS Dark' : 'ConstructBMS Light';
    const foundTheme = themes.find(t => t.name === themeName);
    const theme = foundTheme || defaultTheme;
    return theme.colors;
  };

  const value = {
    themeSettings,
    setThemeId,
    setThemeMode,
    applyTheme,
    getCurrentThemeColors,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export { ThemeProvider };
