import { create } from 'zustand';

export interface DemoModeState {
  isDemoMode: boolean;
  demoDataCount: number;
  lastDemoDataCleanup?: Date;
  canManageDemoData: boolean;
}

interface DemoModeStore extends DemoModeState {
  // Actions
  setDemoMode: (isDemo: boolean) => void;
  setDemoDataCount: (count: number) => void;
  setCanManageDemoData: (canManage: boolean) => void;
  markDemoDataCleanup: () => void;
  resetDemoMode: () => void;
  
  // Computed
  getDemoModeStatus: () => {
    isDemo: boolean;
    statusText: string;
    statusColor: string;
    canManage: boolean;
  };
}

export const useDemoModeStore = create<DemoModeStore>((set, get) => ({
  // Initial state
  isDemoMode: true, // Start in demo mode
  demoDataCount: 0,
  lastDemoDataCleanup: undefined,
  canManageDemoData: false, // Will be set based on user permissions

  // Actions
  setDemoMode: (isDemo: boolean) => {
    set({ isDemoMode: isDemo });
  },

  setDemoDataCount: (count: number) => {
    set({ demoDataCount: count });
  },

  setCanManageDemoData: (canManage: boolean) => {
    set({ canManageDemoData: canManage });
  },

  markDemoDataCleanup: () => {
    set({ 
      lastDemoDataCleanup: new Date(),
      isDemoMode: false,
      demoDataCount: 0
    });
  },

  resetDemoMode: () => {
    set({
      isDemoMode: true,
      demoDataCount: 0,
      lastDemoDataCleanup: undefined,
      canManageDemoData: false
    });
  },

  // Computed
  getDemoModeStatus: () => {
    const { isDemoMode, canManageDemoData } = get();
    
    return {
      isDemo: isDemoMode,
      statusText: isDemoMode ? 'Demo Mode' : 'Live Mode',
      statusColor: isDemoMode ? 'bg-blue-600' : 'bg-green-600',
      canManage: canManageDemoData
    };
  }
}));
