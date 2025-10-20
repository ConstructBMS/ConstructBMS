import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  color: string;
  order: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
  isActive: boolean;
  pipelineId: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  stages: string[];
  permissions: {
    canEdit: string[];
    canDelete: string[];
    canView: string[];
  };
}

export interface PipelineSettings {
  defaultPipeline: string;
  pipelines: Pipeline[];
  allowMultiplePipelines: boolean;
  stages: PipelineStage[];
  autoAdvanceStages: boolean;
  stageNotifications: boolean;
  columnBorderStyle: 'solid' | 'dashed' | 'dotted';
  kanbanStyle: 'colored-columns' | 'card-columns';
}

interface PipelineStore {
  settings: PipelineSettings;
  setSettings: (settings: PipelineSettings) => void;
  updatePipeline: (pipelineId: string, updates: Partial<Pipeline>) => void;
  addPipeline: (
    pipeline: Omit<Pipeline, 'id' | 'createdAt' | 'createdBy'>
  ) => void;
  deletePipeline: (pipelineId: string) => void;
  updateStage: (stageId: string, updates: Partial<PipelineStage>) => void;
  addStage: (stage: Omit<PipelineStage, 'id'>) => void;
  deleteStage: (stageId: string) => void;
  getPipelineStages: (pipelineId: string) => PipelineStage[];
  getPipelineColumns: (pipelineId: string) => any[]; // Returns KanbanColumn format
  updatePipelineColumns: (pipelineId: string, columns: any[]) => void; // Update columns from Kanban
  updateBorderStyle: (borderStyle: 'solid' | 'dashed' | 'dotted') => void; // Update border style
  updateKanbanStyle: (style: 'colored-columns' | 'card-columns') => void; // Update Kanban style
}

const defaultSettings: PipelineSettings = {
  defaultPipeline: 'default-sales',
  pipelines: [
    {
      id: 'default-sales',
      name: 'Sales Pipeline',
      description: 'Main sales pipeline for opportunities',
      isDefault: true,
      isActive: true,
      createdAt: '2024-01-01',
      createdBy: 'admin',
      stages: ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won'],
      permissions: {
        canEdit: ['admin', 'manager'],
        canDelete: ['admin'],
        canView: ['admin', 'manager', 'sales'],
      },
    },
    {
      id: 'marketing-leads',
      name: 'Marketing Leads',
      description: 'Pipeline for marketing generated leads',
      isDefault: false,
      isActive: true,
      createdAt: '2024-01-15',
      createdBy: 'admin',
      stages: ['inquiry', 'nurturing', 'ready'],
      permissions: {
        canEdit: ['admin', 'marketing'],
        canDelete: ['admin'],
        canView: ['admin', 'marketing', 'sales'],
      },
    },
    {
      id: 'enterprise-deals',
      name: 'Enterprise Deals',
      description: 'Large enterprise opportunities and deals',
      isDefault: false,
      isActive: true,
      createdAt: '2024-01-20',
      createdBy: 'admin',
      stages: [
        'discovery',
        'evaluation',
        'proposal',
        'negotiation',
        'contract',
        'closed-won',
      ],
      permissions: {
        canEdit: ['admin', 'enterprise-sales'],
        canDelete: ['admin'],
        canView: ['admin', 'enterprise-sales', 'sales-director'],
      },
    },
  ],
  allowMultiplePipelines: true,
  stages: [
    // Default Sales Pipeline Stages
    {
      id: 'lead',
      name: 'Lead',
      description: 'Initial contact',
      color: '#3b82f6',
      order: 1,
      probability: 10,
      isWon: false,
      isLost: false,
      isActive: true,
      pipelineId: 'default-sales',
    },
    {
      id: 'qualified',
      name: 'Qualified',
      description: 'Qualified lead',
      color: '#10b981',
      order: 2,
      probability: 25,
      isWon: false,
      isLost: false,
      isActive: true,
      pipelineId: 'default-sales',
    },
    {
      id: 'proposal',
      name: 'Proposal',
      description: 'Proposal sent',
      color: '#f59e0b',
      order: 3,
      probability: 50,
      isWon: false,
      isLost: false,
      isActive: true,
      pipelineId: 'default-sales',
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      description: 'In negotiation',
      color: '#ef4444',
      order: 4,
      probability: 75,
      isWon: false,
      isLost: false,
      isActive: true,
      pipelineId: 'default-sales',
    },
    {
      id: 'closed-won',
      name: 'Closed Won',
      description: 'Deal won',
      color: '#059669',
      order: 5,
      probability: 100,
      isWon: true,
      isLost: false,
      isActive: true,
      pipelineId: 'default-sales',
    },
    // Marketing Leads Pipeline Stages
    {
      id: 'inquiry',
      name: 'Inquiry',
      description: 'Initial inquiry received',
      color: '#3b82f6',
      order: 1,
      probability: 5,
      isWon: false,
      isLost: false,
      isActive: true,
      pipelineId: 'marketing-leads',
    },
    {
      id: 'nurturing',
      name: 'Nurturing',
      description: 'Lead being nurtured',
      color: '#8b5cf6',
      order: 2,
      probability: 15,
      isWon: false,
      isLost: false,
      isActive: true,
      pipelineId: 'marketing-leads',
    },
    {
      id: 'ready',
      name: 'Ready',
      description: 'Ready for sales handoff',
      color: '#10b981',
      order: 3,
      probability: 30,
      isWon: false,
      isLost: false,
      isActive: true,
      pipelineId: 'marketing-leads',
    },
    // Enterprise Deals Pipeline Stages
    {
      id: 'discovery',
      name: 'Discovery',
      description: 'Initial discovery phase',
      color: '#3b82f6',
      order: 1,
      probability: 5,
      isWon: false,
      isLost: false,
      isActive: true,
      pipelineId: 'enterprise-deals',
    },
    {
      id: 'evaluation',
      name: 'Evaluation',
      description: 'Solution evaluation',
      color: '#8b5cf6',
      order: 2,
      probability: 20,
      isWon: false,
      isLost: false,
      isActive: true,
      pipelineId: 'enterprise-deals',
    },
    {
      id: 'contract',
      name: 'Contract',
      description: 'Contract negotiation',
      color: '#f59e0b',
      order: 4,
      probability: 80,
      isWon: false,
      isLost: false,
      isActive: true,
      pipelineId: 'enterprise-deals',
    },
  ],
  autoAdvanceStages: false,
  stageNotifications: true,
  columnBorderStyle: 'solid',
  kanbanStyle: 'colored-columns',
};

export const usePipelineStore = create<PipelineStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      setSettings: (settings: PipelineSettings) => {
        set({ settings });
      },

      updatePipeline: (pipelineId: string, updates: Partial<Pipeline>) => {
        set(state => ({
          settings: {
            ...state.settings,
            pipelines: state.settings.pipelines.map(p =>
              p.id === pipelineId ? { ...p, ...updates } : p
            ),
          },
        }));
      },

      addPipeline: (
        pipeline: Omit<Pipeline, 'id' | 'createdAt' | 'createdBy'>
      ) => {
        const newPipeline: Pipeline = {
          ...pipeline,
          id: `pipeline-${Date.now()}`,
          createdAt: new Date().toISOString(),
          createdBy: 'admin',
        };

        set(state => ({
          settings: {
            ...state.settings,
            pipelines: [...state.settings.pipelines, newPipeline],
          },
        }));
      },

      deletePipeline: (pipelineId: string) => {
        set(state => ({
          settings: {
            ...state.settings,
            pipelines: state.settings.pipelines.filter(
              p => p.id !== pipelineId
            ),
          },
        }));
      },

      updateStage: (stageId: string, updates: Partial<PipelineStage>) => {
        set(state => ({
          settings: {
            ...state.settings,
            stages: state.settings.stages.map(s =>
              s.id === stageId ? { ...s, ...updates } : s
            ),
          },
        }));
      },

      addStage: (stage: Omit<PipelineStage, 'id'>) => {
        const newStage: PipelineStage = {
          ...stage,
          id: `stage-${Date.now()}`,
        };

        set(state => ({
          settings: {
            ...state.settings,
            stages: [...state.settings.stages, newStage],
          },
        }));
      },

      deleteStage: (stageId: string) => {
        set(state => ({
          settings: {
            ...state.settings,
            stages: state.settings.stages.filter(s => s.id !== stageId),
          },
        }));
      },

      getPipelineStages: (pipelineId: string) => {
        const { settings } = get();
        return settings.stages
          .filter(stage => stage.pipelineId === pipelineId)
          .sort((a, b) => a.order - b.order);
      },

      getPipelineColumns: (pipelineId: string) => {
        const { settings } = get();
        const stages = settings.stages
          .filter(stage => stage.pipelineId === pipelineId)
          .sort((a, b) => a.order - b.order);

        return stages.map(stage => ({
          id: stage.id,
          name: stage.name,
          color: stage.color,
          order: stage.order,
        }));
      },

      updatePipelineColumns: (pipelineId: string, columns: any[]) => {
        set(state => {
          // Update the pipeline's stages based on the new columns
          const updatedStages = state.settings.stages.map(stage => {
            if (stage.pipelineId === pipelineId) {
              const column = columns.find(col => col.id === stage.id);
              if (column) {
                return {
                  ...stage,
                  name: column.name,
                  color: column.color,
                  order: column.order,
                };
              }
            }
            return stage;
          });

          return {
            settings: {
              ...state.settings,
              stages: updatedStages,
            },
          };
        });
      },

      updateBorderStyle: (borderStyle: 'solid' | 'dashed' | 'dotted') => {
        set(state => ({
          settings: {
            ...state.settings,
            columnBorderStyle: borderStyle,
          },
        }));
      },

      updateKanbanStyle: (style: 'colored-columns' | 'card-columns') => {
        set(state => ({
          settings: {
            ...state.settings,
            kanbanStyle: style,
          },
        }));
      },
    }),
    {
      name: 'pipeline-settings',
      partialize: state => ({
        settings: state.settings,
      }),
    }
  )
);
