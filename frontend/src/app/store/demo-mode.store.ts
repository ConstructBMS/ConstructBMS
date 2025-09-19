import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DemoModeStore {
  isDemoMode: boolean;
  demoDataCleared: boolean;
  canManageDemoData: boolean;

  // Actions
  setDemoMode: (isDemo: boolean) => void;
  clearDemoData: () => void;
  resetToDemoMode: () => void;
  setCanManageDemoData: (canManage: boolean) => void;
  getDemoModeStatus: () => {
    isDemo: boolean;
    statusText: string;
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
        };
      },

      clearDemoData: () => {
        // Clear all demo data from localStorage
        localStorage.removeItem('notifications-store');
        localStorage.removeItem('chat-store');
        localStorage.removeItem('sticky-notes-store');

        // Clear any other demo data stores
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('demo') || key.includes('store'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

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
