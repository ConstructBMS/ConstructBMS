import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '../../../lib/types/core';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const getEffectiveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme: Theme) => {
        set({ theme });
        const effectiveTheme = getEffectiveTheme(theme);
        document.documentElement.classList.toggle(
          'dark',
          effectiveTheme === 'dark'
        );
      },
      toggleTheme: () => {
        const { theme } = get();
        const newTheme: Theme =
          theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'constructbms-theme',
      onRehydrateStorage: () => state => {
        if (state) {
          const effectiveTheme = getEffectiveTheme(state.theme);
          document.documentElement.classList.toggle(
            'dark',
            effectiveTheme === 'dark'
          );
        }
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      const { theme } = useThemeStore.getState();
      if (theme === 'system') {
        const effectiveTheme = getEffectiveTheme(theme);
        document.documentElement.classList.toggle(
          'dark',
          effectiveTheme === 'dark'
        );
      }
    });
}
