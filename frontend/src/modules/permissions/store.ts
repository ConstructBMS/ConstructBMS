/**
 * Permissions Store - Zustand Store for Permission Management
 *
 * This store manages permission rules, roles, and the permission matrix
 * with persistence to localStorage for offline capability.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultEvaluator } from '../../lib/permissions/evaluator';
import type {
  Action,
  PermissionDecision,
  PermissionMatrix,
  PermissionRule,
  PermissionStore,
  Resource,
  Scope,
} from '../../lib/types/permissions';

// ============================================================================
// Store Implementation
// ============================================================================

export const usePermissionStore = create<PermissionStore>()(
  persist(
    (set, get) => ({
      // State
      rules: [],
      roles: [],
      roleBindings: [],
      matrix: {},
      selectedScope: 'global',
      selectedScopeId: undefined,
      isLoading: false,
      error: null,

      // Actions
      setRules: (rules: PermissionRule[]) => {
        set({ rules });
        // Update evaluator with new rules
        defaultEvaluator.setRules(rules);
      },

      addRule: (
        ruleData: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'>
      ) => {
        const newRule: PermissionRule = {
          ...ruleData,
          id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set(state => ({
          rules: [...state.rules, newRule],
        }));

        // Update evaluator
        const { rules } = get();
        defaultEvaluator.setRules(rules);
      },

      updateRule: (id: string, updates: Partial<PermissionRule>) => {
        set(state => ({
          rules: state.rules.map(rule =>
            rule.id === id
              ? { ...rule, ...updates, updatedAt: new Date().toISOString() }
              : rule
          ),
        }));

        // Update evaluator
        const { rules } = get();
        defaultEvaluator.setRules(rules);
      },

      deleteRule: (id: string) => {
        set(state => ({
          rules: state.rules.filter(rule => rule.id !== id),
        }));

        // Update evaluator
        const { rules } = get();
        defaultEvaluator.setRules(rules);
      },

      setMatrix: (matrix: PermissionMatrix) => {
        set({ matrix });
      },

      updateMatrixCell: (
        resource: Resource,
        action: Action,
        decision: PermissionDecision
      ) => {
        set(state => {
          const newMatrix = { ...state.matrix };

          if (!newMatrix[resource]) {
            newMatrix[resource] = {};
          }

          newMatrix[resource][action] = decision;

          return { matrix: newMatrix };
        });
      },

      setSelectedScope: (scope: Scope, scopeId?: string) => {
        set({ selectedScope: scope, selectedScopeId: scopeId });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      reset: () => {
        set({
          rules: [],
          roles: [],
          roleBindings: [],
          matrix: {},
          selectedScope: 'global',
          selectedScopeId: undefined,
          isLoading: false,
          error: null,
        });

        // Clear evaluator cache
        defaultEvaluator.clearCache();
      },
    }),
    {
      name: 'constructbms-permissions',
      partialize: state => ({
        rules: state.rules,
        roles: state.roles,
        roleBindings: state.roleBindings,
        matrix: state.matrix,
        selectedScope: state.selectedScope,
        selectedScopeId: state.selectedScopeId,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          // Update evaluator with rehydrated rules
          defaultEvaluator.setRules(state.rules);
        }
      },
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

/**
 * Get rules for a specific scope
 */
export const getRulesForScope = (scope: Scope, scopeId?: string) =>
  usePermissionStore
    .getState()
    .rules.filter(
      rule =>
        rule.scope === scope &&
        (scopeId ? rule.scopeId === scopeId : !rule.scopeId)
    );

/**
 * Get rules for a specific resource and action
 */
export const getRulesForResourceAction = (resource: Resource, action: Action) =>
  usePermissionStore
    .getState()
    .rules.filter(rule => rule.resource === resource && rule.action === action);

/**
 * Get rules for a specific role
 */
export const getRulesForRole = (roleId: string) =>
  usePermissionStore.getState().rules.filter(rule => rule.roleId === roleId);

/**
 * Get permission matrix for current scope
 */
export const getCurrentScopeMatrix = () => {
  const { matrix } = usePermissionStore.getState();
  return matrix;
};

/**
 * Get all roles
 */
export const getAllRoles = () => usePermissionStore.getState().roles;

/**
 * Get role by ID
 */
export const getRoleById = (id: string) =>
  usePermissionStore.getState().roles.find(role => role.id === id);

/**
 * Get role bindings for a user
 */
export const getRoleBindingsForUser = (userId: string) =>
  usePermissionStore
    .getState()
    .roleBindings.filter(binding => binding.userId === userId);

// ============================================================================
// Actions
// ============================================================================

/**
 * Load default roles and permissions
 */
export const loadDefaultRoles = async () => {
  try {
    const { setLoading, setError } = usePermissionStore.getState();
    setLoading(true);
    setError(null);

    // Import default roles
    const defaultRoles = await import('./seeds/defaultRoles.json');

    const { setRules, setMatrix } = usePermissionStore.getState();

    // Set roles
    usePermissionStore.setState({ roles: defaultRoles.roles });

    // Convert default permissions to rules
    const rules: PermissionRule[] = [];
    const matrix: PermissionMatrix = {};

    Object.entries(defaultRoles.defaultPermissions).forEach(
      ([roleId, permissions]) => {
        Object.entries(permissions).forEach(([resource, actions]) => {
          Object.entries(actions).forEach(([action, decision]) => {
            const rule: PermissionRule = {
              id: `default_${roleId}_${resource}_${action}`,
              roleId,
              resource: resource as Resource,
              action: action as Action,
              decision: decision as PermissionDecision,
              scope: 'global',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'system',
            };
            rules.push(rule);

            // Update matrix
            if (!matrix[resource]) {
              matrix[resource] = {};
            }
            matrix[resource][action] = decision as PermissionDecision;
          });
        });
      }
    );

    setRules(rules);
    setMatrix(matrix);

    setLoading(false);
  } catch (error) {
    const { setError, setLoading } = usePermissionStore.getState();
    setError(
      error instanceof Error ? error.message : 'Failed to load default roles'
    );
    setLoading(false);
  }
};

/**
 * Save rules to backend (placeholder)
 */
export const saveRules = async () => {
  try {
    const { setLoading, setError, rules } = usePermissionStore.getState();
    setLoading(true);
    setError(null);

    // In a real implementation, this would make an API call
    console.log('Saving rules to backend:', rules);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setLoading(false);
  } catch (error) {
    const { setError, setLoading } = usePermissionStore.getState();
    setError(error instanceof Error ? error.message : 'Failed to save rules');
    setLoading(false);
  }
};

/**
 * Load rules from backend (placeholder)
 */
export const loadRules = async () => {
  try {
    const { setLoading, setError } = usePermissionStore.getState();
    setLoading(true);
    setError(null);

    // In a real implementation, this would make an API call
    console.log('Loading rules from backend');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setLoading(false);
  } catch (error) {
    const { setError, setLoading } = usePermissionStore.getState();
    setError(error instanceof Error ? error.message : 'Failed to load rules');
    setLoading(false);
  }
};

/**
 * Test permission evaluation
 */
export const testPermission = (
  userId: string,
  resource: Resource,
  action: Action,
  scope: Scope = 'global',
  scopeId?: string
) => {
  const { rules } = usePermissionStore.getState();
  defaultEvaluator.setRules(rules);

  const context = {
    userId,
    userAttributes: {},
    scope,
    scopeId,
  };

  return defaultEvaluator.evaluate(context, resource, action);
};

/**
 * Clear all permissions and reset to defaults
 */
export const resetPermissions = () => {
  const { reset } = usePermissionStore.getState();
  reset();
  loadDefaultRoles();
};

// ============================================================================
// Export Store Hook
// ============================================================================

export default usePermissionStore;
