export type FlagKey =
  | 'documents.builder'
  | 'documents.library'
  | 'chat'
  | 'portal'
  | 'programme'
  | 'workflows'
  | 'pipeline'
  | 'estimates'
  | 'purchaseOrders';

export type Flag = {
  key: FlagKey;
  enabled: boolean;
  audience?: 'all' | 'admins' | 'beta';
};

export interface FeatureFlagContext {
  roles?: string[];
}

// Default feature flags
export const defaultFlags: Flag[] = [
  { key: 'documents.builder', enabled: true, audience: 'all' },
  { key: 'documents.library', enabled: true, audience: 'all' },
  { key: 'chat', enabled: true, audience: 'all' },
  { key: 'portal', enabled: true, audience: 'all' },
  { key: 'programme', enabled: true, audience: 'all' },
  { key: 'workflows', enabled: true, audience: 'all' },
  { key: 'pipeline', enabled: true, audience: 'all' },
  { key: 'estimates', enabled: true, audience: 'all' },
  { key: 'purchaseOrders', enabled: true, audience: 'all' },
];

// Helper function to check if a flag is enabled
export function isEnabled(
  key: FlagKey,
  flags: Flag[],
  context?: FeatureFlagContext
): boolean {
  const flag = flags.find(f => f.key === key);
  if (!flag) return false;
  if (!flag.enabled) return false;

  // Check audience restrictions
  if (flag.audience === 'admins') {
    return (
      context?.roles?.includes('admin') ||
      context?.roles?.includes('superadmin') ||
      false
    );
  }
  if (flag.audience === 'beta') {
    return (
      context?.roles?.includes('beta') ||
      context?.roles?.includes('admin') ||
      context?.roles?.includes('superadmin') ||
      false
    );
  }

  return true;
}

// Helper function to get all enabled flags
export function getEnabledFlags(
  flags: Flag[],
  context?: FeatureFlagContext
): FlagKey[] {
  return flags
    .filter(flag => isEnabled(flag.key, flags, context))
    .map(flag => flag.key);
}
