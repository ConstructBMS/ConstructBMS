/**
 * Permissions Hooks - React Hooks for Permission Management
 *
 * This module provides React hooks for permission evaluation and management,
 * including the core useCan hook for checking permissions in components.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type {
  Action,
  PermissionContext,
  PermissionEvaluation,
  Resource,
  Scope,
  UseCanOptions,
  UseCanResult,
} from '../types/permissions';
import { createPermissionContext, defaultEvaluator } from './evaluator';

// ============================================================================
// Core useCan Hook
// ============================================================================

/**
 * Hook for checking if a user can perform an action on a resource
 */
export function useCan(options: UseCanOptions): UseCanResult {
  const {
    resource,
    action,
    scope = 'global',
    scopeId,
    context: contextOverride,
    skipCache = false,
  } = options;

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<PermissionEvaluation | null>(
    null
  );

  // Create permission context
  const permissionContext = useMemo(() => {
    if (contextOverride) {
      return {
        userId: contextOverride.userId || 'anonymous',
        userAttributes: contextOverride.userAttributes || {},
        resourceAttributes: contextOverride.resourceAttributes,
        environmentAttributes: contextOverride.environmentAttributes,
        scope,
        scopeId,
      } as PermissionContext;
    }

    // Use actual authenticated user context
    if (user) {
      return createPermissionContext(
        user.id,
        {
          role: user.app_metadata?.role || 'user',
          email: user.email,
          name: user.user_metadata?.name,
        },
        scope,
        scopeId
      );
    }

    // No user - anonymous context
    return createPermissionContext('anonymous', {}, scope, scopeId);
  }, [contextOverride, scope, scopeId, user]);

  // Evaluate permission
  const evaluatePermission = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, this might be async (API call)
      // For now, we'll use the synchronous evaluator
      const result = defaultEvaluator.evaluate(
        permissionContext,
        resource,
        action
      );
      setEvaluation(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Permission evaluation failed'
      );
      setEvaluation(null);
    } finally {
      setIsLoading(false);
    }
  }, [permissionContext, resource, action, skipCache]);

  // Evaluate permission on mount and when dependencies change
  useEffect(() => {
    evaluatePermission();
  }, [evaluatePermission]);

  // Clear cache if skipCache is true
  useEffect(() => {
    if (skipCache) {
      defaultEvaluator.clearCache();
    }
  }, [skipCache]);

  const can = evaluation?.decision === 'allow';
  const decision = evaluation?.decision || 'inherit';
  const reason = evaluation?.reason || 'No evaluation performed';

  return {
    can,
    decision,
    reason,
    isLoading,
    error,
    refetch: evaluatePermission,
  };
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for checking multiple permissions at once
 */
export function useCanMultiple(
  permissions: Array<{
    resource: Resource;
    action: Action;
    scope?: Scope;
    scopeId?: string;
  }>
): {
  can: boolean[];
  decisions: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<
    Array<{ can: boolean; decision: string }>
  >([]);

  const evaluateAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const evaluations = permissions.map(
        ({ resource, action, scope = 'global', scopeId }) => {
          const context = createPermissionContext(
            'current-user',
            {},
            scope,
            scopeId
          );
          const evaluation = defaultEvaluator.evaluate(
            context,
            resource,
            action
          );
          return {
            can: evaluation.decision === 'allow',
            decision: evaluation.decision,
          };
        }
      );

      setResults(evaluations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Permission evaluation failed'
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [permissions]);

  useEffect(() => {
    evaluateAll();
  }, [evaluateAll]);

  return {
    can: results.map(r => r.can),
    decisions: results.map(r => r.decision),
    isLoading,
    error,
    refetch: evaluateAll,
  };
}

/**
 * Hook for checking if user has any of the specified permissions
 */
export function useCanAny(
  permissions: Array<{
    resource: Resource;
    action: Action;
    scope?: Scope;
    scopeId?: string;
  }>
): UseCanResult {
  const { can, isLoading, error, refetch } = useCanMultiple(permissions);

  const canAny = can.some(Boolean);
  const decision = canAny ? 'allow' : 'deny';
  const reason = canAny
    ? `Allowed by ${can.filter(Boolean).length} of ${permissions.length} permissions`
    : `Denied by all ${permissions.length} permissions`;

  return {
    can: canAny,
    decision,
    reason,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for checking if user has all of the specified permissions
 */
export function useCanAll(
  permissions: Array<{
    resource: Resource;
    action: Action;
    scope?: Scope;
    scopeId?: string;
  }>
): UseCanResult {
  const { can, isLoading, error, refetch } = useCanMultiple(permissions);

  const canAll = can.every(Boolean);
  const decision = canAll ? 'allow' : 'deny';
  const reason = canAll
    ? `Allowed by all ${permissions.length} permissions`
    : `Denied by ${can.filter(Boolean).length} of ${permissions.length} permissions`;

  return {
    can: canAll,
    decision,
    reason,
    isLoading,
    error,
    refetch,
  };
}

// ============================================================================
// Context-Based Hooks
// ============================================================================

/**
 * Hook for getting current user's permission context
 */
export function usePermissionContext(): PermissionContext {
  const { user } = useAuth();

  return useMemo(() => {
    if (user) {
      return createPermissionContext(user.id, {
        role: user.app_metadata?.role || 'user',
        email: user.email,
        name: user.user_metadata?.name,
      });
    }

    // No user - anonymous context
    return createPermissionContext('anonymous', {});
  }, [user]);
}

/**
 * Hook for checking permissions with current user context
 */
export function useCanWithContext(
  resource: Resource,
  action: Action,
  scope: Scope = 'global',
  scopeId?: string
): UseCanResult {
  const context = usePermissionContext();

  return useCan({
    resource,
    action,
    scope,
    scopeId,
    context,
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook for checking if user can manage a resource
 */
export function useCanManage(
  resource: Resource,
  scope: Scope = 'global',
  scopeId?: string
): UseCanResult {
  return useCanWithContext(resource, 'manage', scope, scopeId);
}

/**
 * Hook for checking if user can read a resource
 */
export function useCanRead(
  resource: Resource,
  scope: Scope = 'global',
  scopeId?: string
): UseCanResult {
  return useCanWithContext(resource, 'read', scope, scopeId);
}

/**
 * Hook for checking if user can create a resource
 */
export function useCanCreate(
  resource: Resource,
  scope: Scope = 'global',
  scopeId?: string
): UseCanResult {
  return useCanWithContext(resource, 'create', scope, scopeId);
}

/**
 * Hook for checking if user can update a resource
 */
export function useCanUpdate(
  resource: Resource,
  scope: Scope = 'global',
  scopeId?: string
): UseCanResult {
  return useCanWithContext(resource, 'update', scope, scopeId);
}

/**
 * Hook for checking if user can delete a resource
 */
export function useCanDelete(
  resource: Resource,
  scope: Scope = 'global',
  scopeId?: string
): UseCanResult {
  return useCanWithContext(resource, 'delete', scope, scopeId);
}

// ============================================================================
// Debug Hooks
// ============================================================================

/**
 * Hook for debugging permission evaluations
 */
export function usePermissionDebug(
  resource: Resource,
  action: Action
): {
  evaluation: PermissionEvaluation | null;
  context: PermissionContext;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [evaluation, setEvaluation] = useState<PermissionEvaluation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const context = usePermissionContext();

  const evaluate = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = defaultEvaluator.evaluate(context, resource, action);
      setEvaluation(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Permission evaluation failed'
      );
      setEvaluation(null);
    } finally {
      setIsLoading(false);
    }
  }, [context, resource, action]);

  useEffect(() => {
    evaluate();
  }, [evaluate]);

  return {
    evaluation,
    context,
    isLoading,
    error,
    refetch: evaluate,
  };
}
