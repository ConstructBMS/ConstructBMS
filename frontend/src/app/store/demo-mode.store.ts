import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DemoDataManager } from '../../lib/demo-data';

export interface DemoModeStore {
  isDemoMode: boolean;
  demoDataCleared: boolean;
  canManageDemoData: boolean;

  // Actions
  setDemoMode: (isDemo: boolean) => void;
  clearDemoData: () => void;
  resetToDemoMode: () => void;
  setCanManageDemoData: (canManage: boolean) => void;
  hasDemoData: () => boolean;
  exportDemoData: () => string;
  importDemoData: (data: string) => void;
  getDemoModeStatus: () => {
    isDemo: boolean;
    statusText: string;
    statusColor: string;
  };
}

export const useDemoModeStore = create<DemoModeStore>()(
  persist(
    (set, get) => ({
      isDemoMode: true,
      demoDataCleared: false,
      canManageDemoData: true,

      setDemoMode: (isDemo: boolean) => {
        set({ isDemoMode: isDemo });
      },

      setCanManageDemoData: (canManage: boolean) => {
        set({ canManageDemoData: canManage });
      },

      getDemoModeStatus: () => {
        const { isDemoMode } = get();
        return {
          isDemo: isDemoMode,
          statusText: isDemoMode ? 'Demo Mode' : 'Live Mode',
          statusColor: isDemoMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-green-600',
        };
      },

      clearDemoData: () => {
        // Use the DemoDataManager to clear all demo data
        DemoDataManager.clearAllDemoData();

        set({
          isDemoMode: false,
          demoDataCleared: true,
        });
      },

      resetToDemoMode: () => {
        // Reset to demo mode with fresh demo data
        localStorage.clear();
        set({
          isDemoMode: true,
          demoDataCleared: false,
        });
        // Reload the page to reset all stores
        window.location.reload();
      },

      hasDemoData: () => {
        return DemoDataManager.hasDemoData();
      },

      exportDemoData: () => {
        return DemoDataManager.exportDemoData();
      },

      importDemoData: (data: string) => {
        DemoDataManager.importDemoData(data);
      },
    }),
    {
      name: 'demo-mode-store',
      partialize: state => ({
        isDemoMode: state.isDemoMode,
        demoDataCleared: state.demoDataCleared,
      }),
    }
  )
);
