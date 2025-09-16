import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '../../../lib/types/core';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getEffectiveTheme = (theme: Theme): 'light' | 'dark' => {
  return theme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
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
        // Only toggle between light and dark, skip system
        const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
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
