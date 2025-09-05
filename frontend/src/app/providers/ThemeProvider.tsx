import React, { useEffect } from 'react';
import { useThemeStore } from '../store/ui/theme.store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount and when theme changes
    const effectiveTheme =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;

    document.documentElement.classList.toggle(
      'dark',
      effectiveTheme === 'dark'
    );
  }, [theme]);

  return <>{children}</>;
}
