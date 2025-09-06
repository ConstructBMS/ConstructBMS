import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Flag,
  FlagKey,
  defaultFlags,
  isEnabled,
  getEnabledFlags,
  FeatureFlagContext,
} from '../../lib/utils/featureFlags';

interface FeatureFlagsState {
  flags: Flag[];
  setFlag: (
    key: FlagKey,
    enabled: boolean,
    audience?: 'all' | 'admins' | 'beta'
  ) => void;
  isEnabled: (key: FlagKey, context?: FeatureFlagContext) => boolean;
  getEnabledFlags: (context?: FeatureFlagContext) => FlagKey[];
  resetToDefaults: () => void;
}

export const useFeatureFlagsStore = create<FeatureFlagsState>()(
  persist(
    (set, get) => ({
      flags: defaultFlags,
      setFlag: (
        key: FlagKey,
        enabled: boolean,
        audience?: 'all' | 'admins' | 'beta'
      ) => {
        set(state => ({
          flags: state.flags.map(flag =>
            flag.key === key ? { ...flag, enabled, audience } : flag
          ),
        }));
      },
      isEnabled: (key: FlagKey, context?: FeatureFlagContext) => {
        const { flags } = get();
        return isEnabled(key, flags, context);
      },
      getEnabledFlags: (context?: FeatureFlagContext) => {
        const { flags } = get();
        return getEnabledFlags(flags, context);
      },
      resetToDefaults: () => set({ flags: defaultFlags }),
    }),
    {
      name: 'feature-flags-storage',
      partialize: state => ({ flags: state.flags }),
    }
  )
);

// Hook for easy access to feature flags
export function useFeatureFlag(key: FlagKey, context?: FeatureFlagContext) {
  const isEnabled = useFeatureFlagsStore(state => state.isEnabled);
  return isEnabled(key, context);
}
