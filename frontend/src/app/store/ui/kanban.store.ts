import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KanbanColumn, KanbanColor } from '../../components/views/UnifiedKanban';

interface KanbanConfig {
  columns: KanbanColumn[];
  lastUpdated: string;
}

interface KanbanStore {
  configs: Record<string, KanbanConfig>; // moduleId -> config
  getConfig: (moduleId: string) => KanbanConfig | null;
  setConfig: (moduleId: string, config: KanbanConfig) => void;
  updateColumns: (moduleId: string, columns: KanbanColumn[]) => void;
  addColumn: (moduleId: string, column: Omit<KanbanColumn, 'id' | 'order'>) => void;
  updateColumn: (moduleId: string, columnId: string, updates: Partial<KanbanColumn>) => void;
  deleteColumn: (moduleId: string, columnId: string) => void;
  reorderColumns: (moduleId: string, columns: KanbanColumn[]) => void;
  resetConfig: (moduleId: string) => void;
  resetAllConfigs: () => void;
}

const defaultColumns: Record<string, KanbanColumn[]> = {
  pipeline: [
    { id: 'lead', name: 'Lead', color: 'blue', order: 0 },
    { id: 'qualified', name: 'Qualified', color: 'yellow', order: 1 },
    { id: 'proposal', name: 'Proposal', color: 'orange', order: 2 },
    { id: 'negotiation', name: 'Negotiation', color: 'purple', order: 3 },
    { id: 'closed-won', name: 'Closed Won', color: 'green', order: 4 },
    { id: 'closed-lost', name: 'Closed Lost', color: 'red', order: 5 },
  ],
  projects: [
    { id: 'planned', name: 'Planned', color: 'blue', order: 0 },
    { id: 'in-progress', name: 'In Progress', color: 'green', order: 1 },
    { id: 'on-hold', name: 'On Hold', color: 'yellow', order: 2 },
    { id: 'completed', name: 'Completed', color: 'gray', order: 3 },
    { id: 'cancelled', name: 'Cancelled', color: 'red', order: 4 },
  ],
  contacts: [
    { id: 'new', name: 'New', color: 'blue', order: 0 },
    { id: 'contacted', name: 'Contacted', color: 'yellow', order: 1 },
    { id: 'qualified', name: 'Qualified', color: 'green', order: 2 },
    { id: 'proposal', name: 'Proposal', color: 'orange', order: 3 },
    { id: 'closed', name: 'Closed', color: 'gray', order: 4 },
  ],
};

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      configs: {},

      getConfig: (moduleId: string) => {
        const config = get().configs[moduleId];
        if (config) return config;

        // Return default config if none exists
        const defaultConfig = defaultColumns[moduleId];
        if (defaultConfig) {
          return {
            columns: defaultConfig,
            lastUpdated: new Date().toISOString(),
          };
        }

        return null;
      },

      setConfig: (moduleId: string, config: KanbanConfig) => {
        set(state => ({
          configs: {
            ...state.configs,
            [moduleId]: {
              ...config,
              lastUpdated: new Date().toISOString(),
            },
          },
        }));
      },

      updateColumns: (moduleId: string, columns: KanbanColumn[]) => {
        set(state => ({
          configs: {
            ...state.configs,
            [moduleId]: {
              columns,
              lastUpdated: new Date().toISOString(),
            },
          },
        }));
      },

      addColumn: (moduleId: string, column: Omit<KanbanColumn, 'id' | 'order'>) => {
        const config = get().getConfig(moduleId);
        if (!config) return;

        const newColumn: KanbanColumn = {
          ...column,
          id: `column-${Date.now()}`,
          order: config.columns.length,
        };

        const updatedColumns = [...config.columns, newColumn];
        get().updateColumns(moduleId, updatedColumns);
      },

      updateColumn: (moduleId: string, columnId: string, updates: Partial<KanbanColumn>) => {
        const config = get().getConfig(moduleId);
        if (!config) return;

        const updatedColumns = config.columns.map(col =>
          col.id === columnId ? { ...col, ...updates } : col
        );

        get().updateColumns(moduleId, updatedColumns);
      },

      deleteColumn: (moduleId: string, columnId: string) => {
        const config = get().getConfig(moduleId);
        if (!config) return;

        const updatedColumns = config.columns
          .filter(col => col.id !== columnId)
          .map((col, index) => ({ ...col, order: index }));

        get().updateColumns(moduleId, updatedColumns);
      },

      reorderColumns: (moduleId: string, columns: KanbanColumn[]) => {
        const reorderedColumns = columns.map((col, index) => ({
          ...col,
          order: index,
        }));

        get().updateColumns(moduleId, reorderedColumns);
      },

      resetConfig: (moduleId: string) => {
        set(state => {
          const newConfigs = { ...state.configs };
          delete newConfigs[moduleId];
          return { configs: newConfigs };
        });
      },

      resetAllConfigs: () => {
        set({ configs: {} });
      },
    }),
    {
      name: 'kanban-store',
      partialize: state => ({
        configs: state.configs,
      }),
    }
  )
);
