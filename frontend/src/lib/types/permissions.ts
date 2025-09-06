/**
 * Permissions v0 - RBAC + ABAC Types
 *
 * This module defines the core types for the ConstructBMS permissions system,
 * supporting both Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC).
 */

import type { ReactNode } from 'react';

// ============================================================================
// Core Permission Types
// ============================================================================

export type PermissionDecision = 'allow' | 'deny' | 'inherit';

export type Resource =
  | 'dashboard'
  | 'projects'
  | 'programme'
  | 'contacts'
  | 'documents'
  | 'workflows'
  | 'pipeline'
  | 'estimates'
  | 'purchase-orders'
  | 'notes'
  | 'chat'
  | 'portal'
  | 'settings'
  | 'users'
  | 'roles'
  | 'permissions';

export type Action =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'manage'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject';

export type Scope = 'global' | 'organization' | 'project' | 'user';

// ============================================================================
// RBAC Types
// ============================================================================

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleBinding {
  id: string;
  userId: string;
  roleId: string;
  scope: Scope;
  scopeId?: string; // Optional scope identifier (e.g., project ID)
  createdAt: string;
  createdBy: string;
}

// ============================================================================
// ABAC Types
// ============================================================================

export interface Attribute {
  name: string;
  value: string | number | boolean | string[];
  operator?:
    | 'equals'
    | 'not_equals'
    | 'in'
    | 'not_in'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte';
}

export interface ABACCondition {
  attribute: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'in'
    | 'not_in'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte';
  value: string | number | boolean | string[];
}

export interface ABACRule {
  id: string;
  name: string;
  description?: string;
  conditions: ABACCondition[];
  logic: 'AND' | 'OR';
}

// ============================================================================
// Permission Rule Types
// ============================================================================

export interface PermissionRule {
  id: string;
  roleId: string;
  resource: Resource;
  action: Action;
  decision: PermissionDecision;
  scope: Scope;
  scopeId?: string;
  abacRules?: ABACRule[];
  conditions?: ABACCondition[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============================================================================
// Permission Matrix Types
// ============================================================================

export interface PermissionMatrix {
  [resource: string]: {
    [action: string]: PermissionDecision;
  };
}

export interface PermissionMatrixCell {
  resource: Resource;
  action: Action;
  decision: PermissionDecision;
  scope: Scope;
  scopeId?: string;
  abacRules?: ABACRule[];
}

// ============================================================================
// Context Types
// ============================================================================

export interface PermissionContext {
  userId: string;
  userAttributes: Record<string, unknown>;
  resourceAttributes?: Record<string, unknown>;
  environmentAttributes?: Record<string, unknown>;
  scope: Scope;
  scopeId?: string;
}

// ============================================================================
// Evaluation Types
// ============================================================================

export interface PermissionEvaluation {
  decision: PermissionDecision;
  reason: string;
  matchedRules: PermissionRule[];
  abacResults: ABACRuleResult[];
  cacheKey?: string;
  evaluatedAt: string;
}

export interface ABACRuleResult {
  ruleId: string;
  passed: boolean;
  reason: string;
  matchedConditions: ABACCondition[];
}

// ============================================================================
// Store Types
// ============================================================================

export interface PermissionStore {
  rules: PermissionRule[];
  roles: Role[];
  roleBindings: RoleBinding[];
  matrix: PermissionMatrix;
  selectedScope: Scope;
  selectedScopeId?: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setRules: (rules: PermissionRule[]) => void;
  addRule: (
    rule: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateRule: (id: string, updates: Partial<PermissionRule>) => void;
  deleteRule: (id: string) => void;
  setMatrix: (matrix: PermissionMatrix) => void;
  updateMatrixCell: (
    resource: Resource,
    action: Action,
    decision: PermissionDecision
  ) => void;
  setSelectedScope: (scope: Scope, scopeId?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// Hook Types
// ============================================================================

export interface UseCanOptions {
  resource: Resource;
  action: Action;
  scope?: Scope;
  scopeId?: string;
  context?: Partial<PermissionContext>;
  skipCache?: boolean;
}

export interface UseCanResult {
  can: boolean;
  decision: PermissionDecision;
  reason: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// ============================================================================
// Guard Types
// ============================================================================

export interface GuardProps {
  resource: Resource;
  action: Action;
  scope?: Scope;
  scopeId?: string;
  fallback?: ReactNode;
  redirectTo?: string;
  children: ReactNode;
  context?: Partial<PermissionContext>;
}

// ============================================================================
// API Types
// ============================================================================

export interface PermissionAPI {
  getRules: (scope?: Scope, scopeId?: string) => Promise<PermissionRule[]>;
  createRule: (
    rule: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<PermissionRule>;
  updateRule: (
    id: string,
    updates: Partial<PermissionRule>
  ) => Promise<PermissionRule>;
  deleteRule: (id: string) => Promise<void>;
  getRoles: () => Promise<Role[]>;
  getRoleBindings: (userId?: string) => Promise<RoleBinding[]>;
  evaluatePermission: (
    context: PermissionContext,
    resource: Resource,
    action: Action
  ) => Promise<PermissionEvaluation>;
}
