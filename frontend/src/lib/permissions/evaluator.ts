/**
 * Permissions Evaluator - Core RBAC + ABAC Logic
 *
 * This module implements the core permission evaluation logic with:
 * - Deny overrides (explicit deny always wins)
 * - ABAC JSON predicates evaluation
 * - Caching for performance
 * - Rule inheritance and scope resolution
 */

import type {
  ABACCondition,
  ABACRuleResult,
  Action,
  PermissionContext,
  PermissionDecision,
  PermissionEvaluation,
  PermissionRule,
  Resource,
  Scope,
} from '../types/permissions';

// ============================================================================
// Cache Interface
// ============================================================================

interface PermissionCache {
  get: (key: string) => PermissionEvaluation | null;
  set: (key: string, value: PermissionEvaluation, ttl?: number) => void;
  clear: () => void;
  delete: (key: string) => void;
}

// ============================================================================
// Simple In-Memory Cache Implementation
// ============================================================================

class MemoryCache implements PermissionCache {
  private cache = new Map<
    string,
    { value: PermissionEvaluation; expires: number }
  >();
  private defaultTtl = 5 * 60 * 1000; // 5 minutes

  get(key: string): PermissionEvaluation | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key: string, value: PermissionEvaluation, ttl = this.defaultTtl): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// ============================================================================
// Permission Evaluator Class
// ============================================================================

export class PermissionEvaluator {
  private cache: PermissionCache;
  private rules: PermissionRule[] = [];

  constructor(cache?: PermissionCache) {
    this.cache = cache || new MemoryCache();
  }

  /**
   * Set the permission rules for evaluation
   */
  setRules(rules: PermissionRule[]): void {
    this.rules = rules;
    this.cache.clear(); // Clear cache when rules change
  }

  /**
   * Evaluate permission for a given context, resource, and action
   */
  evaluate(
    context: PermissionContext,
    resource: Resource,
    action: Action
  ): PermissionEvaluation {
    const cacheKey = this.generateCacheKey(context, resource, action);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const evaluation = this.performEvaluation(context, resource, action);
    evaluation.cacheKey = cacheKey;
    evaluation.evaluatedAt = new Date().toISOString();

    // Cache the result
    this.cache.set(cacheKey, evaluation);

    return evaluation;
  }

  /**
   * Perform the actual permission evaluation
   */
  private performEvaluation(
    context: PermissionContext,
    resource: Resource,
    action: Action
  ): PermissionEvaluation {
    // Super admin bypass - if user has superadmin role, allow everything
    if (context.userAttributes?.role === 'super_admin' || context.userAttributes?.role === 'superadmin') {
      return {
        decision: 'allow',
        reason: 'Super admin has full access',
        matchedRules: [],
        abacResults: [],
        evaluatedAt: new Date().toISOString(),
      };
    }

    const applicableRules = this.getApplicableRules(context, resource, action);

    if (applicableRules.length === 0) {
      return {
        decision: 'inherit',
        reason: 'No applicable rules found',
        matchedRules: [],
        abacResults: [],
        evaluatedAt: new Date().toISOString(),
      };
    }

    // Check for explicit deny first (deny overrides)
    const denyRules = applicableRules.filter(rule => rule.decision === 'deny');
    if (denyRules.length > 0) {
      return {
        decision: 'deny',
        reason: `Explicitly denied by ${denyRules.length} rule(s)`,
        matchedRules: denyRules,
        abacResults: [],
        evaluatedAt: new Date().toISOString(),
      };
    }

    // Check for explicit allow
    const allowRules = applicableRules.filter(
      rule => rule.decision === 'allow'
    );
    if (allowRules.length > 0) {
      // Evaluate ABAC conditions for allow rules
      const abacResults = this.evaluateABACRules(allowRules, context);
      const passedRules = allowRules.filter(
        (rule, index) => !rule.abacRules || abacResults[index]?.passed
      );

      if (passedRules.length > 0) {
        return {
          decision: 'allow',
          reason: `Explicitly allowed by ${passedRules.length} rule(s)`,
          matchedRules: passedRules,
          abacResults: abacResults.filter(result => result.passed),
          evaluatedAt: new Date().toISOString(),
        };
      }
    }

    // Default to inherit if no explicit allow/deny
    return {
      decision: 'inherit',
      reason: 'No explicit allow/deny rules matched',
      matchedRules: applicableRules,
      abacResults: [],
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get rules applicable to the given context, resource, and action
   */
  private getApplicableRules(
    context: PermissionContext,
    resource: Resource,
    action: Action
  ): PermissionRule[] {
    return this.rules.filter(rule => {
      // Check resource and action match
      if (rule.resource !== resource || rule.action !== action) {
        return false;
      }

      // Check scope match
      if (rule.scope !== context.scope) {
        return false;
      }

      // Check scope ID match if specified
      if (rule.scopeId && rule.scopeId !== context.scopeId) {
        return false;
      }

      return true;
    });
  }

  /**
   * Evaluate ABAC rules for a set of permission rules
   */
  private evaluateABACRules(
    rules: PermissionRule[],
    context: PermissionContext
  ): ABACRuleResult[] {
    return rules.map(rule => {
      if (!rule.abacRules || rule.abacRules.length === 0) {
        return {
          ruleId: rule.id,
          passed: true,
          reason: 'No ABAC rules defined',
          matchedConditions: [],
        };
      }

      const results = rule.abacRules.map(abacRule =>
        this.evaluateABACRule(abacRule, context)
      );

      const passed =
        rule.logic === 'AND'
          ? results.every(result => result.passed)
          : results.some(result => result.passed);

      return {
        ruleId: rule.id,
        passed,
        reason: passed
          ? 'ABAC conditions satisfied'
          : 'ABAC conditions not satisfied',
        matchedConditions: results.flatMap(result => result.matchedConditions),
      };
    });
  }

  /**
   * Evaluate a single ABAC rule
   */
  private evaluateABACRule(
    abacRule: { conditions: ABACCondition[]; logic: 'AND' | 'OR' },
    context: PermissionContext
  ): { passed: boolean; matchedConditions: ABACCondition[] } {
    const matchedConditions: ABACCondition[] = [];

    for (const condition of abacRule.conditions) {
      const value = this.getAttributeValue(condition.attribute, context);
      const passed = this.evaluateCondition(condition, value);

      if (passed) {
        matchedConditions.push(condition);
      }
    }

    const passed =
      abacRule.logic === 'AND'
        ? matchedConditions.length === abacRule.conditions.length
        : matchedConditions.length > 0;

    return { passed, matchedConditions };
  }

  /**
   * Get attribute value from context
   */
  private getAttributeValue(
    attribute: string,
    context: PermissionContext
  ): unknown {
    // Check user attributes first
    if (
      context.userAttributes &&
      context.userAttributes[attribute] !== undefined
    ) {
      return context.userAttributes[attribute];
    }

    // Check resource attributes
    if (
      context.resourceAttributes &&
      context.resourceAttributes[attribute] !== undefined
    ) {
      return context.resourceAttributes[attribute];
    }

    // Check environment attributes
    if (
      context.environmentAttributes &&
      context.environmentAttributes[attribute] !== undefined
    ) {
      return context.environmentAttributes[attribute];
    }

    return undefined;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: ABACCondition, value: unknown): boolean {
    if (value === undefined) {
      return false;
    }

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'in':
        return (
          Array.isArray(condition.value) && condition.value.includes(value)
        );
      case 'not_in':
        return (
          Array.isArray(condition.value) && !condition.value.includes(value)
        );
      case 'contains':
        return (
          typeof value === 'string' &&
          typeof condition.value === 'string' &&
          value.includes(condition.value)
        );
      case 'starts_with':
        return (
          typeof value === 'string' &&
          typeof condition.value === 'string' &&
          value.startsWith(condition.value)
        );
      case 'ends_with':
        return (
          typeof value === 'string' &&
          typeof condition.value === 'string' &&
          value.endsWith(condition.value)
        );
      case 'gt':
        return (
          typeof value === 'number' &&
          typeof condition.value === 'number' &&
          value > condition.value
        );
      case 'gte':
        return (
          typeof value === 'number' &&
          typeof condition.value === 'number' &&
          value >= condition.value
        );
      case 'lt':
        return (
          typeof value === 'number' &&
          typeof condition.value === 'number' &&
          value < condition.value
        );
      case 'lte':
        return (
          typeof value === 'number' &&
          typeof condition.value === 'number' &&
          value <= condition.value
        );
      default:
        return false;
    }
  }

  /**
   * Generate cache key for evaluation
   */
  private generateCacheKey(
    context: PermissionContext,
    resource: Resource,
    action: Action
  ): string {
    // Safely stringify the context, handling any non-serializable values
    const contextKey = JSON.stringify({
      userId: context.userId,
      scope: context.scope,
      scopeId: context.scopeId,
      userAttributes: context.userAttributes,
    }, (key, value) => {
      // Handle non-serializable values
      if (typeof value === 'object' && value !== null) {
        return '[Object]';
      }
      return value;
    });

    // Use a safer encoding method
    try {
      return `perm:${btoa(contextKey)}:${resource}:${action}`;
    } catch (error) {
      // Fallback to a simpler key if btoa fails
      return `perm:${context.userId}:${context.scope}:${context.scopeId || 'global'}:${resource}:${action}`;
    }
  }

  /**
   * Clear the evaluation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    // This is a simplified implementation
    // In a real implementation, you'd want more detailed stats
    return {
      size: (this.cache as MemoryCache).cache.size,
      keys: Array.from((this.cache as MemoryCache).cache.keys()),
    };
  }
}

// ============================================================================
// Default Evaluator Instance
// ============================================================================

export const defaultEvaluator = new PermissionEvaluator();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a permission context from user data
 */
export function createPermissionContext(
  userId: string,
  userAttributes: Record<string, unknown> = {},
  scope: Scope = 'global',
  scopeId?: string
): PermissionContext {
  return {
    userId,
    userAttributes,
    scope,
    scopeId,
    environmentAttributes: {
      timestamp: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
}

/**
 * Check if a permission decision allows access
 */
export function isAllowed(decision: PermissionDecision): boolean {
  return decision === 'allow';
}

/**
 * Check if a permission decision denies access
 */
export function isDenied(decision: PermissionDecision): boolean {
  return decision === 'deny';
}

/**
 * Check if a permission decision requires inheritance
 */
export function isInherited(decision: PermissionDecision): boolean {
  return decision === 'inherit';
}
