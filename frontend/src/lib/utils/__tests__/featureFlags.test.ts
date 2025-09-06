import { describe, expect, it } from 'vitest';
import {
  Flag,
  FlagKey,
  defaultFlags,
  getEnabledFlags,
  isEnabled,
} from '../featureFlags';

describe('featureFlags', () => {
  describe('isEnabled', () => {
    it('should return true for enabled flags with no audience restriction', () => {
      const flags: Flag[] = [{ key: 'chat', enabled: true, audience: 'all' }];

      expect(isEnabled('chat', flags)).toBe(true);
      expect(isEnabled('chat', flags, { roles: ['user'] })).toBe(true);
    });

    it('should return false for disabled flags', () => {
      const flags: Flag[] = [{ key: 'chat', enabled: false, audience: 'all' }];

      expect(isEnabled('chat', flags)).toBe(false);
    });

    it('should return true for admin-only flags when user has admin role', () => {
      const flags: Flag[] = [
        { key: 'chat', enabled: true, audience: 'admins' },
      ];

      expect(isEnabled('chat', flags, { roles: ['admin'] })).toBe(true);
      expect(isEnabled('chat', flags, { roles: ['superadmin'] })).toBe(true);
    });

    it('should return false for admin-only flags when user does not have admin role', () => {
      const flags: Flag[] = [
        { key: 'chat', enabled: true, audience: 'admins' },
      ];

      expect(isEnabled('chat', flags, { roles: ['user'] })).toBe(false);
      expect(isEnabled('chat', flags, { roles: ['beta'] })).toBe(false);
    });

    it('should return true for beta flags when user has beta role', () => {
      const flags: Flag[] = [{ key: 'chat', enabled: true, audience: 'beta' }];

      expect(isEnabled('chat', flags, { roles: ['beta'] })).toBe(true);
      expect(isEnabled('chat', flags, { roles: ['admin'] })).toBe(true);
      expect(isEnabled('chat', flags, { roles: ['superadmin'] })).toBe(true);
    });

    it('should return false for beta flags when user does not have beta role', () => {
      const flags: Flag[] = [{ key: 'chat', enabled: true, audience: 'beta' }];

      expect(isEnabled('chat', flags, { roles: ['user'] })).toBe(false);
    });

    it('should return false for non-existent flags', () => {
      const flags: Flag[] = [];

      expect(isEnabled('chat', flags)).toBe(false);
    });
  });

  describe('getEnabledFlags', () => {
    it('should return all enabled flags for user with no restrictions', () => {
      const flags: Flag[] = [
        { key: 'chat', enabled: true, audience: 'all' },
        { key: 'portal', enabled: true, audience: 'all' },
        { key: 'workflows', enabled: false, audience: 'all' },
      ];

      const enabled = getEnabledFlags(flags);
      expect(enabled).toEqual(['chat', 'portal']);
    });

    it('should filter flags based on user roles', () => {
      const flags: Flag[] = [
        { key: 'chat', enabled: true, audience: 'all' },
        { key: 'portal', enabled: true, audience: 'admins' },
        { key: 'workflows', enabled: true, audience: 'beta' },
      ];

      const enabled = getEnabledFlags(flags, { roles: ['user'] });
      expect(enabled).toEqual(['chat']);

      const enabledAdmin = getEnabledFlags(flags, { roles: ['admin'] });
      expect(enabledAdmin).toEqual(['chat', 'portal', 'workflows']);

      const enabledBeta = getEnabledFlags(flags, { roles: ['beta'] });
      expect(enabledBeta).toEqual(['chat', 'workflows']);
    });
  });

  describe('defaultFlags', () => {
    it('should have all expected flags', () => {
      const expectedFlags: FlagKey[] = [
        'documents.builder',
        'documents.library',
        'chat',
        'portal',
        'programme',
        'workflows',
        'pipeline',
        'estimates',
        'purchaseOrders',
      ];

      expect(defaultFlags).toHaveLength(expectedFlags.length);
      expectedFlags.forEach(flagKey => {
        expect(defaultFlags.find(f => f.key === flagKey)).toBeDefined();
      });
    });

    it('should have all flags enabled by default', () => {
      defaultFlags.forEach(flag => {
        expect(flag.enabled).toBe(true);
        expect(flag.audience).toBe('all');
      });
    });
  });
});
