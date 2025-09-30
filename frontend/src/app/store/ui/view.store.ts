import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'list' | 'grid' | 'kanban' | 'timeline' | 'detail';

export interface ViewSettings {
  mode: ViewMode;
  columns?: string[]; // For list view
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  customizations?: Record<string, unknown>;
}

export interface ViewPreferences {
  [moduleId: string]: ViewSettings;
}

interface ViewStore {
  preferences: ViewPreferences;
  getViewSettings: (moduleId: string) => ViewSettings;
  setViewMode: (moduleId: string, mode: ViewMode) => void;
  setViewSettings: (moduleId: string, settings: ViewSettings) => void;
  updateViewSettings: (moduleId: string, updates: Partial<ViewSettings>) => void;
  resetViewSettings: (moduleId: string) => void;
  resetAllViewSettings: () => void;
  exportViewSettings: () => string;
  importViewSettings: (settings: string) => void;
}

const defaultViewSettings: ViewSettings = {
  mode: 'list',
  columns: [],
  sortBy: 'createdAt',
  sortDirection: 'desc',
  filters: {},
  layout: {},
  customizations: {},
};

export const useViewStore = create<ViewStore>()(
  persist(
    (set, get) => ({
      preferences: {},

      getViewSettings: (moduleId: string) => {
        const settings = get().preferences[moduleId];
        return settings || { ...defaultViewSettings };
      },

      setViewMode: (moduleId: string, mode: ViewMode) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            [moduleId]: {
              ...state.preferences[moduleId],
              ...defaultViewSettings,
              mode,
            },
          },
        }));
      },

      setViewSettings: (moduleId: string, settings: ViewSettings) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            [moduleId]: {
              ...defaultViewSettings,
              ...settings,
            },
          },
        }));
      },

      updateViewSettings: (moduleId: string, updates: Partial<ViewSettings>) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            [moduleId]: {
              ...state.preferences[moduleId],
              ...defaultViewSettings,
              ...updates,
            },
          },
        }));
      },

      resetViewSettings: (moduleId: string) => {
        set(state => {
          const newPreferences = { ...state.preferences };
          delete newPreferences[moduleId];
          return { preferences: newPreferences };
        });
      },

      resetAllViewSettings: () => {
        set({ preferences: {} });
      },

      exportViewSettings: () => {
        const settings = get().preferences;
        return JSON.stringify(settings, null, 2);
      },

      importViewSettings: (settings: string) => {
        try {
          const parsedSettings = JSON.parse(settings);
          set({ preferences: parsedSettings });
        } catch (error) {
          console.error('Failed to import view settings:', error);
        }
      },
    }),
    {
      name: 'view-store',
      partialize: state => ({
        preferences: state.preferences,
      }),
    }
  )
);
