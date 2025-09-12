/**
 * Settings Store
 *
 * Zustand store for managing application settings including CRM configuration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CRMSettings, defaultCRMSettings } from '../../lib/types/crm';

interface SettingsState {
  // CRM Settings
  crmSettings: CRMSettings;

  // Loading States
  isLoading: boolean;
  isSaving: boolean;

  // Error States
  error: string | null;

  // Actions
  updateCRMSettings: (updates: Partial<CRMSettings>) => void;
  resetCRMSettings: () => void;
  saveCRMSettings: () => Promise<void>;
  loadCRMSettings: () => Promise<void>;

  // Contact Management Actions
  addCustomField: (field: any) => void;
  updateCustomField: (id: string, updates: any) => void;
  removeCustomField: (id: string) => void;

  // Lead Management Actions
  addLeadSource: (source: any) => void;
  updateLeadSource: (id: string, updates: any) => void;
  removeLeadSource: (id: string) => void;

  addLeadStatus: (status: any) => void;
  updateLeadStatus: (id: string, updates: any) => void;
  removeLeadStatus: (id: string) => void;

  // Pipeline Management Actions
  addPipelineStage: (stage: any) => void;
  updatePipelineStage: (id: string, updates: any) => void;
  removePipelineStage: (id: string) => void;
  reorderPipelineStages: (stages: any[]) => void;

  // Communication Actions
  addEmailTemplate: (template: any) => void;
  updateEmailTemplate: (id: string, updates: any) => void;
  removeEmailTemplate: (id: string) => void;

  // Integration Actions
  updateEmailProvider: (provider: any) => void;
  updateCalendarProvider: (provider: any) => void;
  updatePhoneSystem: (system: any) => void;

  // Utility Actions
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial State
      crmSettings: defaultCRMSettings,
      isLoading: false,
      isSaving: false,
      error: null,

      // Main Actions
      updateCRMSettings: updates => {
        set(state => ({
          crmSettings: { ...state.crmSettings, ...updates },
        }));
      },

      resetCRMSettings: () => {
        set({ crmSettings: defaultCRMSettings });
      },

      saveCRMSettings: async () => {
        set({ isSaving: true, error: null });
        try {
          // In a real app, this would save to the backend
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ isSaving: false });
        } catch (error) {
          set({
            isSaving: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to save CRM settings',
          });
        }
      },

      loadCRMSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would load from the backend
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load CRM settings',
          });
        }
      },

      // Contact Management Actions
      addCustomField: field => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            contactManagement: {
              ...state.crmSettings.contactManagement,
              customFields: [
                ...state.crmSettings.contactManagement.customFields,
                field,
              ],
            },
          },
        }));
      },

      updateCustomField: (id, updates) => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            contactManagement: {
              ...state.crmSettings.contactManagement,
              customFields:
                state.crmSettings.contactManagement.customFields.map(field =>
                  field.id === id ? { ...field, ...updates } : field
                ),
            },
          },
        }));
      },

      removeCustomField: id => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            contactManagement: {
              ...state.crmSettings.contactManagement,
              customFields:
                state.crmSettings.contactManagement.customFields.filter(
                  field => field.id !== id
                ),
            },
          },
        }));
      },

      // Lead Management Actions
      addLeadSource: source => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            leadManagement: {
              ...state.crmSettings.leadManagement,
              leadSources: [
                ...state.crmSettings.leadManagement.leadSources,
                source,
              ],
            },
          },
        }));
      },

      updateLeadSource: (id, updates) => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            leadManagement: {
              ...state.crmSettings.leadManagement,
              leadSources: state.crmSettings.leadManagement.leadSources.map(
                source =>
                  source.id === id ? { ...source, ...updates } : source
              ),
            },
          },
        }));
      },

      removeLeadSource: id => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            leadManagement: {
              ...state.crmSettings.leadManagement,
              leadSources: state.crmSettings.leadManagement.leadSources.filter(
                source => source.id !== id
              ),
            },
          },
        }));
      },

      addLeadStatus: status => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            leadManagement: {
              ...state.crmSettings.leadManagement,
              leadStatuses: [
                ...state.crmSettings.leadManagement.leadStatuses,
                status,
              ],
            },
          },
        }));
      },

      updateLeadStatus: (id, updates) => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            leadManagement: {
              ...state.crmSettings.leadManagement,
              leadStatuses: state.crmSettings.leadManagement.leadStatuses.map(
                status =>
                  status.id === id ? { ...status, ...updates } : status
              ),
            },
          },
        }));
      },

      removeLeadStatus: id => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            leadManagement: {
              ...state.crmSettings.leadManagement,
              leadStatuses:
                state.crmSettings.leadManagement.leadStatuses.filter(
                  status => status.id !== id
                ),
            },
          },
        }));
      },

      // Pipeline Management Actions
      addPipelineStage: stage => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            pipelineManagement: {
              ...state.crmSettings.pipelineManagement,
              stages: [...state.crmSettings.pipelineManagement.stages, stage],
            },
          },
        }));
      },

      updatePipelineStage: (id, updates) => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            pipelineManagement: {
              ...state.crmSettings.pipelineManagement,
              stages: state.crmSettings.pipelineManagement.stages.map(stage =>
                stage.id === id ? { ...stage, ...updates } : stage
              ),
            },
          },
        }));
      },

      removePipelineStage: id => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            pipelineManagement: {
              ...state.crmSettings.pipelineManagement,
              stages: state.crmSettings.pipelineManagement.stages.filter(
                stage => stage.id !== id
              ),
            },
          },
        }));
      },

      reorderPipelineStages: stages => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            pipelineManagement: {
              ...state.crmSettings.pipelineManagement,
              stages: stages,
            },
          },
        }));
      },

      // Communication Actions
      addEmailTemplate: template => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            communication: {
              ...state.crmSettings.communication,
              emailTemplates: [
                ...state.crmSettings.communication.emailTemplates,
                template,
              ],
            },
          },
        }));
      },

      updateEmailTemplate: (id, updates) => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            communication: {
              ...state.crmSettings.communication,
              emailTemplates:
                state.crmSettings.communication.emailTemplates.map(template =>
                  template.id === id ? { ...template, ...updates } : template
                ),
            },
          },
        }));
      },

      removeEmailTemplate: id => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            communication: {
              ...state.crmSettings.communication,
              emailTemplates:
                state.crmSettings.communication.emailTemplates.filter(
                  template => template.id !== id
                ),
            },
          },
        }));
      },

      // Integration Actions
      updateEmailProvider: provider => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            integrations: {
              ...state.crmSettings.integrations,
              emailProvider: provider,
            },
          },
        }));
      },

      updateCalendarProvider: provider => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            integrations: {
              ...state.crmSettings.integrations,
              calendarProvider: provider,
            },
          },
        }));
      },

      updatePhoneSystem: system => {
        set(state => ({
          crmSettings: {
            ...state.crmSettings,
            integrations: {
              ...state.crmSettings.integrations,
              phoneSystem: system,
            },
          },
        }));
      },

      // Utility Actions
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'constructbms-settings',
      partialize: state => ({ crmSettings: state.crmSettings }),
    }
  )
);
