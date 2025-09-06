/**
 * Permission Evaluator Tests
 *
 * This module contains comprehensive tests for the permission evaluator,
 * covering RBAC, ABAC, caching, and edge cases.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import type { Action, PermissionRule, Resource } from '../../types/permissions';
import {
  PermissionEvaluator,
  createPermissionContext,
  isAllowed,
  isDenied,
  isInherited,
} from '../evaluator';

// ============================================================================
// Test Setup
// ============================================================================

describe('PermissionEvaluator', () => {
  let evaluator: PermissionEvaluator;
  let mockRules: PermissionRule[];

  beforeEach(() => {
    evaluator = new PermissionEvaluator();
    mockRules = [
      {
        id: 'rule1',
        roleId: 'admin',
        resource: 'projects' as Resource,
        action: 'read' as Action,
        decision: 'allow',
        scope: 'global',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: 'rule2',
        roleId: 'admin',
        resource: 'projects' as Resource,
        action: 'delete' as Action,
        decision: 'deny',
        scope: 'global',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: 'rule3',
        roleId: 'manager',
        resource: 'projects' as Resource,
        action: 'read' as Action,
        decision: 'allow',
        scope: 'project',
        scopeId: 'project-123',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
      },
    ];
    evaluator.setRules(mockRules);
  });

  // ============================================================================
  // Basic Evaluation Tests
  // ============================================================================

  describe('Basic Permission Evaluation', () => {
    it('should allow access when explicit allow rule exists', () => {
      const context = createPermissionContext('user1', { role: 'admin' });
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('allow');
      expect(result.reason).toContain('Explicitly allowed');
      expect(result.matchedRules).toHaveLength(1);
      expect(result.matchedRules[0].id).toBe('rule1');
    });

    it('should deny access when explicit deny rule exists', () => {
      const context = createPermissionContext('user1', { role: 'admin' });
      const result = evaluator.evaluate(context, 'projects', 'delete');

      expect(result.decision).toBe('deny');
      expect(result.reason).toContain('Explicitly denied');
      expect(result.matchedRules).toHaveLength(1);
      expect(result.matchedRules[0].id).toBe('rule2');
    });

    it('should return inherit when no rules match', () => {
      const context = createPermissionContext('user1', { role: 'admin' });
      const result = evaluator.evaluate(context, 'users', 'read');

      expect(result.decision).toBe('inherit');
      expect(result.reason).toContain('No applicable rules found');
      expect(result.matchedRules).toHaveLength(0);
    });

    it('should return inherit when no explicit allow/deny rules match', () => {
      const context = createPermissionContext('user1', { role: 'admin' });
      const result = evaluator.evaluate(context, 'projects', 'update');

      expect(result.decision).toBe('inherit');
      expect(result.reason).toContain('No explicit allow/deny rules matched');
    });
  });

  // ============================================================================
  // Deny Override Tests
  // ============================================================================

  describe('Deny Override Logic', () => {
    it('should prioritize deny over allow when both exist', () => {
      const rulesWithBoth: PermissionRule[] = [
        {
          id: 'allow-rule',
          roleId: 'admin',
          resource: 'projects' as Resource,
          action: 'read' as Action,
          decision: 'allow',
          scope: 'global',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          createdBy: 'system',
        },
        {
          id: 'deny-rule',
          roleId: 'admin',
          resource: 'projects' as Resource,
          action: 'read' as Action,
          decision: 'deny',
          scope: 'global',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];

      evaluator.setRules(rulesWithBoth);
      const context = createPermissionContext('user1', { role: 'admin' });
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('deny');
      expect(result.reason).toContain('Explicitly denied');
      expect(result.matchedRules).toHaveLength(1);
      expect(result.matchedRules[0].id).toBe('deny-rule');
    });

    it('should handle multiple deny rules', () => {
      const rulesWithMultipleDeny: PermissionRule[] = [
        {
          id: 'deny-rule-1',
          roleId: 'admin',
          resource: 'projects' as Resource,
          action: 'read' as Action,
          decision: 'deny',
          scope: 'global',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          createdBy: 'system',
        },
        {
          id: 'deny-rule-2',
          roleId: 'manager',
          resource: 'projects' as Resource,
          action: 'read' as Action,
          decision: 'deny',
          scope: 'global',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];

      evaluator.setRules(rulesWithMultipleDeny);
      const context = createPermissionContext('user1', { role: 'admin' });
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('deny');
      expect(result.reason).toContain('2 rule(s)');
      expect(result.matchedRules).toHaveLength(2);
    });
  });

  // ============================================================================
  // Scope Tests
  // ============================================================================

  describe('Scope-based Evaluation', () => {
    it('should match rules with correct scope', () => {
      const context = createPermissionContext(
        'user1',
        { role: 'manager' },
        'project',
        'project-123'
      );
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('allow');
      expect(result.matchedRules).toHaveLength(1);
      expect(result.matchedRules[0].id).toBe('rule3');
    });

    it('should not match rules with different scope', () => {
      const context = createPermissionContext(
        'user1',
        { role: 'manager' },
        'project',
        'project-456'
      );
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('inherit');
      expect(result.matchedRules).toHaveLength(0);
    });

    it('should match global scope rules when no specific scope rule exists', () => {
      const context = createPermissionContext(
        'user1',
        { role: 'admin' },
        'project',
        'project-123'
      );
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('allow');
      expect(result.matchedRules).toHaveLength(1);
      expect(result.matchedRules[0].id).toBe('rule1');
    });
  });

  // ============================================================================
  // ABAC Tests
  // ============================================================================

  describe('ABAC Rule Evaluation', () => {
    it('should allow access when ABAC conditions are satisfied', () => {
      const rulesWithABAC: PermissionRule[] = [
        {
          id: 'abac-rule',
          roleId: 'admin',
          resource: 'projects' as Resource,
          action: 'read' as Action,
          decision: 'allow',
          scope: 'global',
          abacRules: [
            {
              id: 'abac-1',
              name: 'Department Check',
              conditions: [
                {
                  attribute: 'department',
                  operator: 'equals',
                  value: 'engineering',
                },
              ],
              logic: 'AND',
            },
          ],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];

      evaluator.setRules(rulesWithABAC);
      const context = createPermissionContext('user1', {
        role: 'admin',
        department: 'engineering',
      });
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('allow');
      expect(result.abacResults).toHaveLength(1);
      expect(result.abacResults[0].passed).toBe(true);
    });

    it('should deny access when ABAC conditions are not satisfied', () => {
      const rulesWithABAC: PermissionRule[] = [
        {
          id: 'abac-rule',
          roleId: 'admin',
          resource: 'projects' as Resource,
          action: 'read' as Action,
          decision: 'allow',
          scope: 'global',
          abacRules: [
            {
              id: 'abac-1',
              name: 'Department Check',
              conditions: [
                {
                  attribute: 'department',
                  operator: 'equals',
                  value: 'engineering',
                },
              ],
              logic: 'AND',
            },
          ],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];

      evaluator.setRules(rulesWithABAC);
      const context = createPermissionContext('user1', {
        role: 'admin',
        department: 'marketing',
      });
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('inherit');
      expect(result.abacResults).toHaveLength(1);
      expect(result.abacResults[0].passed).toBe(false);
    });

    it('should handle multiple ABAC conditions with AND logic', () => {
      const rulesWithABAC: PermissionRule[] = [
        {
          id: 'abac-rule',
          roleId: 'admin',
          resource: 'projects' as Resource,
          action: 'read' as Action,
          decision: 'allow',
          scope: 'global',
          abacRules: [
            {
              id: 'abac-1',
              name: 'Multi Condition Check',
              conditions: [
                {
                  attribute: 'department',
                  operator: 'equals',
                  value: 'engineering',
                },
                {
                  attribute: 'level',
                  operator: 'gte',
                  value: 5,
                },
              ],
              logic: 'AND',
            },
          ],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];

      evaluator.setRules(rulesWithABAC);
      const context = createPermissionContext('user1', {
        role: 'admin',
        department: 'engineering',
        level: 5,
      });
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('allow');
      expect(result.abacResults[0].passed).toBe(true);
      expect(result.abacResults[0].matchedConditions).toHaveLength(2);
    });

    it('should handle multiple ABAC conditions with OR logic', () => {
      const rulesWithABAC: PermissionRule[] = [
        {
          id: 'abac-rule',
          roleId: 'admin',
          resource: 'projects' as Resource,
          action: 'read' as Action,
          decision: 'allow',
          scope: 'global',
          abacRules: [
            {
              id: 'abac-1',
              name: 'OR Condition Check',
              conditions: [
                {
                  attribute: 'department',
                  operator: 'equals',
                  value: 'engineering',
                },
                {
                  attribute: 'department',
                  operator: 'equals',
                  value: 'product',
                },
              ],
              logic: 'OR',
            },
          ],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];

      evaluator.setRules(rulesWithABAC);
      const context = createPermissionContext('user1', {
        role: 'admin',
        department: 'product',
      });
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('allow');
      expect(result.abacResults[0].passed).toBe(true);
      expect(result.abacResults[0].matchedConditions).toHaveLength(1);
    });
  });

  // ============================================================================
  // Caching Tests
  // ============================================================================

  describe('Caching', () => {
    it('should cache evaluation results', () => {
      const context = createPermissionContext('user1', { role: 'admin' });

      // First evaluation
      const result1 = evaluator.evaluate(context, 'projects', 'read');
      expect(result1.cacheKey).toBeDefined();

      // Second evaluation should use cache
      const result2 = evaluator.evaluate(context, 'projects', 'read');
      expect(result2.cacheKey).toBe(result1.cacheKey);
    });

    it('should clear cache when rules change', () => {
      const context = createPermissionContext('user1', { role: 'admin' });

      // First evaluation
      evaluator.evaluate(context, 'projects', 'read');

      // Change rules
      evaluator.setRules([]);

      // Cache should be cleared
      const stats = evaluator.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should generate different cache keys for different contexts', () => {
      const context1 = createPermissionContext('user1', { role: 'admin' });
      const context2 = createPermissionContext('user2', { role: 'admin' });

      const result1 = evaluator.evaluate(context1, 'projects', 'read');
      const result2 = evaluator.evaluate(context2, 'projects', 'read');

      expect(result1.cacheKey).not.toBe(result2.cacheKey);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle empty rule set', () => {
      evaluator.setRules([]);
      const context = createPermissionContext('user1', { role: 'admin' });
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('inherit');
      expect(result.reason).toContain('No applicable rules found');
      expect(result.matchedRules).toHaveLength(0);
    });

    it('should handle rules with missing attributes', () => {
      const context = createPermissionContext('user1', {});
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('inherit');
    });

    it('should handle invalid ABAC operators gracefully', () => {
      const rulesWithInvalidABAC: PermissionRule[] = [
        {
          id: 'invalid-abac-rule',
          roleId: 'admin',
          resource: 'projects' as Resource,
          action: 'read' as Action,
          decision: 'allow',
          scope: 'global',
          abacRules: [
            {
              id: 'abac-1',
              name: 'Invalid Operator',
              conditions: [
                {
                  attribute: 'department',
                  operator: 'invalid_operator' as never,
                  value: 'engineering',
                },
              ],
              logic: 'AND',
            },
          ],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];

      evaluator.setRules(rulesWithInvalidABAC);
      const context = createPermissionContext('user1', {
        role: 'admin',
        department: 'engineering',
      });
      const result = evaluator.evaluate(context, 'projects', 'read');

      expect(result.decision).toBe('inherit');
      expect(result.abacResults[0].passed).toBe(false);
    });
  });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('Utility Functions', () => {
  describe('createPermissionContext', () => {
    it('should create a valid permission context', () => {
      const context = createPermissionContext(
        'user1',
        { role: 'admin' },
        'project',
        'project-123'
      );

      expect(context.userId).toBe('user1');
      expect(context.userAttributes.role).toBe('admin');
      expect(context.scope).toBe('project');
      expect(context.scopeId).toBe('project-123');
      expect(context.environmentAttributes).toBeDefined();
    });

    it('should create context with default values', () => {
      const context = createPermissionContext('user1');

      expect(context.userId).toBe('user1');
      expect(context.userAttributes).toEqual({});
      expect(context.scope).toBe('global');
      expect(context.scopeId).toBeUndefined();
    });
  });

  describe('Decision Helper Functions', () => {
    it('should correctly identify allow decisions', () => {
      expect(isAllowed('allow')).toBe(true);
      expect(isAllowed('deny')).toBe(false);
      expect(isAllowed('inherit')).toBe(false);
    });

    it('should correctly identify deny decisions', () => {
      expect(isDenied('allow')).toBe(false);
      expect(isDenied('deny')).toBe(true);
      expect(isDenied('inherit')).toBe(false);
    });

    it('should correctly identify inherit decisions', () => {
      expect(isInherited('allow')).toBe(false);
      expect(isInherited('deny')).toBe(false);
      expect(isInherited('inherit')).toBe(true);
    });
  });
});
