import {
  SystemRoles,
  Permissions,
  PermissionCategories,
  RoleTemplate,
  PermissionMatrixEntry,
  CustomRule,
  PermissionCheckResult,
  User,
  Role,
} from '../types/auth';

// Default Role Templates
export const DEFAULT_ROLE_TEMPLATES: Record<SystemRoles, RoleTemplate> = {
  [SystemRoles.SUPER_ADMIN]: {
    name: 'Super Administrator',
    description:
      'Has every possible permission. Manages system-wide settings, security policies, integrations, and all custom logic.',
    level: SystemRoles.SUPER_ADMIN,
    permissions: [
      // User Management - All
      Permissions.USERS_VIEW_ALL,
      Permissions.USERS_CREATE,
      Permissions.USERS_EDIT,
      Permissions.USERS_DELETE,
      Permissions.USERS_ASSIGN_ROLES,
      Permissions.USERS_FORCE_PASSWORD_RESET,

      // Roles & Permissions - All
      Permissions.ROLES_CREATE,
      Permissions.ROLES_EDIT,
      Permissions.ROLES_DELETE,
      Permissions.ROLES_ASSIGN_EXISTING,
      Permissions.PERMISSIONS_CREATE_CUSTOM,
      Permissions.PERMISSIONS_EDIT_CUSTOM,

      // Security & Compliance - All
      Permissions.AUDIT_LOGS_VIEW_ALL,
      Permissions.SECURITY_2FA_MANAGE,
      Permissions.SECURITY_IP_WHITELIST,
      Permissions.SECURITY_SESSION_TIMEOUT,
      Permissions.SECURITY_DATA_RETENTION,

      // Data & File Management - All
      Permissions.DATA_ACCESS_ALL,
      Permissions.FILES_LOCK_UNLOCK,
      Permissions.FILES_ASSIGN_PERMISSIONS,
      Permissions.FILES_RESTORE_DELETED,
      Permissions.FILES_UPLOAD,
      Permissions.FILES_DOWNLOAD,
      Permissions.FILES_SHARE_EXTERNAL,

      // Financials - All
      Permissions.FINANCIALS_VIEW_ALL,
      Permissions.FINANCIALS_EDIT_ALL,
      Permissions.FINANCIALS_CREATE_QUOTES,
      Permissions.FINANCIALS_CREATE_INVOICES,
      Permissions.FINANCIALS_VIEW_REPORTS,
      Permissions.FINANCIALS_VIEW_COSTS,
      Permissions.FINANCIALS_VIEW_PAYMENT_STATUS,

      // Integrations
      Permissions.INTEGRATIONS_CONFIGURE,

      // System Settings - All
      Permissions.SYSTEM_FEATURE_FLAGS,
      Permissions.SYSTEM_UI_SETTINGS,
      Permissions.SYSTEM_EMAIL_TEMPLATES,
      Permissions.SYSTEM_PROJECT_SETTINGS,

      // Custom Logic - All
      Permissions.CUSTOM_LOGIC_CREATE,
      Permissions.CUSTOM_LOGIC_EDIT,
      Permissions.CUSTOM_LOGIC_DELETE,

      // Project Access - All
      Permissions.PROJECTS_VIEW_ALL,

      // Task Management - All
      Permissions.TASKS_CREATE,
      Permissions.TASKS_EDIT,
      Permissions.TASKS_DELETE,
      Permissions.TASKS_ASSIGN,
      Permissions.TASKS_EDIT_OWN,

      // Communication - All
      Permissions.CHAT_VIEW_ALL,
      Permissions.CHAT_SEND_INTERNAL,
      Permissions.CHAT_SEND_EXTERNAL,
      Permissions.CHAT_MENTION_USERS,

      // Time Tracking - All
      Permissions.TIME_LOG,
      Permissions.TIME_VIEW_REPORTS,

      // Account & Profile
      Permissions.ACCOUNT_CREATE,
      Permissions.ACCOUNT_COMPLETE_PROFILE,

      // Dashboard Access
      Permissions.DASHBOARD_ACCESS_PORTAL,

      // Messaging
      Permissions.MESSAGING_SEND_PROJECT,

      // Notifications
      Permissions.NOTIFICATIONS_RECEIVE,

      // E-Signing
      Permissions.E_SIGNING_SIGN,
    ],
    dataScopes: {
      users: 'all',
      roles: 'all',
      permissions: 'all',
      projects: 'all',
      tasks: 'all',
      files: 'all',
      financials: 'all',
      chat: 'all',
      system: 'all',
      audit: 'all',
      security: 'all',
      integrations: 'all',
      time: 'all',
      notifications: 'all',
    },
  },

  [SystemRoles.ADMIN]: {
    name: 'Administrator',
    description:
      'Runs daily operations. Manages employees and contractors. Does not have system-level control.',
    level: SystemRoles.ADMIN,
    permissions: [
      // User Management - Scope only
      Permissions.USERS_VIEW_SCOPE,
      Permissions.USERS_CREATE,
      Permissions.USERS_EDIT,
      Permissions.USERS_DELETE,
      Permissions.ROLES_ASSIGN_EXISTING,

      // Security & Compliance - Scope only
      Permissions.AUDIT_LOGS_VIEW_SCOPE,

      // Data & File Management - Project scope
      Permissions.DATA_ACCESS_PROJECT,
      Permissions.FILES_UPLOAD,
      Permissions.FILES_DOWNLOAD,
      Permissions.FILES_SHARE_EXTERNAL,

      // Financials - Scope only
      Permissions.FINANCIALS_VIEW_SCOPE,
      Permissions.FINANCIALS_CREATE_QUOTES,
      Permissions.FINANCIALS_CREATE_INVOICES,
      Permissions.FINANCIALS_VIEW_REPORTS,

      // System Settings - Project scope
      Permissions.SYSTEM_PROJECT_SETTINGS,

      // Project Access - Assigned
      Permissions.PROJECTS_VIEW_ASSIGNED,

      // Task Management - Full
      Permissions.TASKS_CREATE,
      Permissions.TASKS_EDIT,
      Permissions.TASKS_DELETE,
      Permissions.TASKS_ASSIGN,
      Permissions.TASKS_EDIT_OWN,

      // Communication - Project scope
      Permissions.CHAT_VIEW_PROJECT,
      Permissions.CHAT_SEND_INTERNAL,
      Permissions.CHAT_SEND_EXTERNAL,
      Permissions.CHAT_MENTION_USERS,

      // Time Tracking
      Permissions.TIME_LOG,
      Permissions.TIME_VIEW_REPORTS,

      // Dashboard Access
      Permissions.DASHBOARD_ACCESS_PORTAL,

      // Messaging
      Permissions.MESSAGING_SEND_PROJECT,

      // Notifications
      Permissions.NOTIFICATIONS_RECEIVE,
    ],
    dataScopes: {
      users: 'organization',
      roles: 'organization',
      permissions: 'organization',
      projects: 'assigned',
      tasks: 'assigned',
      files: 'assigned',
      financials: 'assigned',
      chat: 'assigned',
      system: 'project',
      audit: 'assigned',
      security: 'none',
      integrations: 'none',
      time: 'assigned',
      notifications: 'all',
    },
  },

  [SystemRoles.EMPLOYEE]: {
    name: 'Employee',
    description:
      'Internal team member. Works on assigned projects only. No financial or user management power.',
    level: SystemRoles.EMPLOYEE,
    permissions: [
      // Project Access - Assigned only
      Permissions.PROJECTS_VIEW_ASSIGNED,

      // Task Management - Own tasks
      Permissions.TASKS_EDIT_OWN,

      // Data & File Management - Project scope
      Permissions.DATA_ACCESS_PROJECT,
      Permissions.FILES_UPLOAD,
      Permissions.FILES_DOWNLOAD,

      // Communication - Project scope
      Permissions.CHAT_VIEW_PROJECT,
      Permissions.CHAT_SEND_INTERNAL,
      Permissions.CHAT_MENTION_USERS,

      // Time Tracking
      Permissions.TIME_LOG,

      // Financials - Limited
      Permissions.FINANCIALS_VIEW_COSTS,

      // Dashboard Access
      Permissions.DASHBOARD_ACCESS_PORTAL,

      // Notifications
      Permissions.NOTIFICATIONS_RECEIVE,
    ],
    dataScopes: {
      users: 'none',
      roles: 'none',
      permissions: 'none',
      projects: 'assigned',
      tasks: 'own',
      files: 'assigned',
      financials: 'limited',
      chat: 'assigned',
      system: 'none',
      audit: 'none',
      security: 'none',
      integrations: 'none',
      time: 'own',
      notifications: 'all',
    },
  },

  [SystemRoles.CONTRACTOR]: {
    name: 'Contractor',
    description:
      'External collaborator. Very limited access to internal data. Works only on assigned tasks.',
    level: SystemRoles.CONTRACTOR,
    permissions: [
      // Project Access - Assigned only
      Permissions.PROJECTS_VIEW_ASSIGNED,

      // Task Management - Own tasks
      Permissions.TASKS_EDIT_OWN,

      // Data & File Management - Limited
      Permissions.FILES_UPLOAD,
      Permissions.FILES_DOWNLOAD,

      // Communication - Project scope
      Permissions.CHAT_VIEW_PROJECT,
      Permissions.CHAT_SEND_EXTERNAL,

      // Time Tracking
      Permissions.TIME_LOG,

      // Financials - Own only
      Permissions.FINANCIALS_VIEW_PAYMENT_STATUS,

      // Dashboard Access
      Permissions.DASHBOARD_ACCESS_PORTAL,

      // Notifications
      Permissions.NOTIFICATIONS_RECEIVE,
    ],
    dataScopes: {
      users: 'none',
      roles: 'none',
      permissions: 'none',
      projects: 'assigned',
      tasks: 'own',
      files: 'assigned',
      financials: 'own',
      chat: 'assigned',
      system: 'none',
      audit: 'none',
      security: 'none',
      integrations: 'none',
      time: 'own',
      notifications: 'all',
    },
  },

  [SystemRoles.CUSTOMER]: {
    name: 'Customer',
    description:
      'External client. Very restricted. Can only see items relevant to their project.',
    level: SystemRoles.CUSTOMER,
    permissions: [
      // Account & Profile
      Permissions.ACCOUNT_CREATE,
      Permissions.ACCOUNT_COMPLETE_PROFILE,

      // Project Access - Own only
      Permissions.PROJECTS_VIEW_OWN,

      // Data & File Management - Limited
      Permissions.FILES_DOWNLOAD,

      // Financials - Own only
      Permissions.FINANCIALS_VIEW_PAYMENT_STATUS,

      // Communication - Limited
      Permissions.CHAT_SEND_EXTERNAL,

      // Dashboard Access
      Permissions.DASHBOARD_ACCESS_PORTAL,

      // Messaging
      Permissions.MESSAGING_SEND_PROJECT,

      // Notifications
      Permissions.NOTIFICATIONS_RECEIVE,

      // E-Signing
      Permissions.E_SIGNING_SIGN,
    ],
    dataScopes: {
      users: 'none',
      roles: 'none',
      permissions: 'none',
      projects: 'own',
      tasks: 'none',
      files: 'own',
      financials: 'own',
      chat: 'own',
      system: 'none',
      audit: 'none',
      security: 'none',
      integrations: 'none',
      time: 'none',
      notifications: 'own',
    },
  },
};

// Permission Matrix Service
export class PermissionMatrixService {
  private static instance: PermissionMatrixService;
  private customRules: CustomRule[] = [];
  private roles: Role[] = [];
  private users: User[] = [];

  static getInstance(): PermissionMatrixService {
    if (!PermissionMatrixService.instance) {
      PermissionMatrixService.instance = new PermissionMatrixService();
    }
    return PermissionMatrixService.instance;
  }

  // Initialize with default roles
  initializeDefaultRoles(): Role[] {
    const defaultRoles: Role[] = Object.entries(DEFAULT_ROLE_TEMPLATES).map(
      ([roleKey, template]) => ({
        id: roleKey,
        name: template.name,
        description: template.description,
        level: template.level as SystemRoles,
        permissions: this.createPermissionMap(template.permissions),
        customRules: template.customRules || [],
        isSystemRole: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: '1',
        createdBy: 'system',
        userCount: 0,
        priority: this.getRolePriority(template.level as SystemRoles),
      })
    );

    this.roles = defaultRoles;
    return defaultRoles;
  }

  private createPermissionMap(
    permissions: Permissions[]
  ): Record<Permissions, boolean> {
    const permissionMap: Record<Permissions, boolean> = {} as Record<
      Permissions,
      boolean
    >;

    // Initialize all permissions to false
    Object.values(Permissions).forEach(permission => {
      permissionMap[permission] = false;
    });

    // Set specified permissions to true
    permissions.forEach(permission => {
      permissionMap[permission] = true;
    });

    return permissionMap;
  }

  private getRolePriority(role: SystemRoles): number {
    const priorities = {
      [SystemRoles.SUPER_ADMIN]: 1,
      [SystemRoles.ADMIN]: 2,
      [SystemRoles.EMPLOYEE]: 3,
      [SystemRoles.CONTRACTOR]: 4,
      [SystemRoles.CUSTOMER]: 5,
    };
    return priorities[role];
  }

  // Check if user has permission
  checkPermission(
    user: User,
    permission: Permissions,
    context?: {
      projectId?: string;
      resourceId?: string;
      dataScope?: 'all' | 'organization' | 'project' | 'own' | 'assigned';
    }
  ): PermissionCheckResult {
    const result: PermissionCheckResult = {
      granted: false,
      reason: 'Permission denied',
      customRules: [],
      dataScope: 'none',
      restrictions: [],
    };

    // Get user's role
    const userRole = this.roles.find(role => role.id === user.role);
    if (!userRole) {
      result.reason = 'User role not found';
      return result;
    }

    // Check if role has the permission
    if (!userRole.permissions[permission]) {
      result.reason = `Role ${userRole.name} does not have permission ${permission}`;
      return result;
    }

    // Check custom permissions
    if (user.customPermissions[permission] === false) {
      result.reason = 'Permission explicitly denied by custom permission';
      return result;
    }

    // Check custom rules
    const applicableRules = this.getApplicableCustomRules(
      user,
      permission,
      context
    );
    if (applicableRules.length > 0) {
      const ruleResult = this.evaluateCustomRules(
        applicableRules,
        user,
        context
      );
      if (!ruleResult.granted) {
        result.reason = ruleResult.reason;
        result.customRules = applicableRules;
        return result;
      }
      result.customRules = applicableRules;
    }

    // Determine data scope
    const template = DEFAULT_ROLE_TEMPLATES[user.role];
    if (template && template.dataScopes) {
      const resource = this.getResourceFromPermission(permission);
      result.dataScope = template.dataScopes[resource] || 'none';
    }

    result.granted = true;
    result.reason = 'Permission granted';
    return result;
  }

  private getResourceFromPermission(permission: Permissions): string {
    const parts = permission.split('.');
    return parts[0];
  }

  private getApplicableCustomRules(
    user: User,
    permission: Permissions,
    context?: any
  ): CustomRule[] {
    return this.customRules.filter(rule => {
      if (!rule.isActive) return false;

      // Check if rule affects this permission
      const permissionActions = rule.actions.filter(
        action =>
          action.type === 'grant_permission' ||
          action.type === 'revoke_permission'
      );

      return permissionActions.some(action => action.target === permission);
    });
  }

  private evaluateCustomRules(
    rules: CustomRule[],
    user: User,
    context?: any
  ): { granted: boolean; reason?: string } {
    // Sort rules by priority
    const sortedRules = rules.sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      const conditionsMet = this.evaluateConditions(
        rule.conditions,
        user,
        context
      );

      if (conditionsMet) {
        const actions = this.evaluateActions(rule.actions, user, context);

        // If any action revokes permission, deny access
        if (actions.some(action => action.type === 'revoke_permission')) {
          return {
            granted: false,
            reason: `Access denied by custom rule: ${rule.name}`,
          };
        }

        // If any action grants permission, allow access
        if (actions.some(action => action.type === 'grant_permission')) {
          return { granted: true };
        }
      }
    }

    return { granted: true }; // Default to granted if no rules apply
  }

  private evaluateConditions(
    conditions: any[],
    user: User,
    context?: any
  ): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let logicalOperator = 'AND';

    for (const condition of conditions) {
      const conditionMet = this.evaluateSingleCondition(
        condition,
        user,
        context
      );

      if (logicalOperator === 'AND') {
        result = result && conditionMet;
      } else {
        result = result || conditionMet;
      }

      logicalOperator = condition.logicalOperator || 'AND';
    }

    return result;
  }

  private evaluateSingleCondition(
    condition: any,
    user: User,
    context?: any
  ): boolean {
    const { type, field, operator, value } = condition;

    switch (type) {
      case 'user_role':
        return this.compareValues(user.role, operator, value);
      case 'user_specific':
        return this.compareValues(user.id, operator, value);
      case 'project':
        return context?.projectId
          ? this.compareValues(context.projectId, operator, value)
          : false;
      case 'tag':
        return this.compareValues(context?.tags || [], operator, value);
      case 'file_type':
        return this.compareValues(context?.fileType, operator, value);
      case 'date_time':
        return this.compareValues(new Date(), operator, new Date(value));
      case 'financial_threshold':
        return this.compareValues(context?.amount || 0, operator, value);
      case 'workflow_status':
        return this.compareValues(context?.status, operator, value);
      default:
        return false;
    }
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'contains':
        return Array.isArray(actual)
          ? actual.includes(expected)
          : String(actual).includes(String(expected));
      case 'not_contains':
        return Array.isArray(actual)
          ? !actual.includes(expected)
          : !String(actual).includes(String(expected));
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'in':
        return Array.isArray(expected) ? expected.includes(actual) : false;
      case 'not_in':
        return Array.isArray(expected) ? !expected.includes(actual) : false;
      default:
        return false;
    }
  }

  private evaluateActions(actions: any[], user: User, context?: any): any[] {
    return actions.map(action => {
      // Here you would implement the actual action execution
      // For now, we just return the action for permission checking
      return action;
    });
  }

  // Get permission matrix for all roles
  getPermissionMatrix(): PermissionMatrixEntry[] {
    const matrix: PermissionMatrixEntry[] = [];

    Object.values(SystemRoles).forEach(role => {
      const template = DEFAULT_ROLE_TEMPLATES[role];
      if (template) {
        Object.values(Permissions).forEach(permission => {
          const granted = template.permissions.includes(permission);
          const category = this.getPermissionCategory(permission);

          matrix.push({
            role,
            category,
            permission,
            granted,
            notes: this.getPermissionNotes(permission, role),
          });
        });
      }
    });

    return matrix;
  }

  private getPermissionCategory(permission: Permissions): PermissionCategories {
    const categoryMap: Record<Permissions, PermissionCategories> = {
      // User Management
      [Permissions.USERS_VIEW_ALL]: PermissionCategories.USER_MANAGEMENT,
      [Permissions.USERS_VIEW_SCOPE]: PermissionCategories.USER_MANAGEMENT,
      [Permissions.USERS_CREATE]: PermissionCategories.USER_MANAGEMENT,
      [Permissions.USERS_EDIT]: PermissionCategories.USER_MANAGEMENT,
      [Permissions.USERS_DELETE]: PermissionCategories.USER_MANAGEMENT,
      [Permissions.USERS_ASSIGN_ROLES]: PermissionCategories.USER_MANAGEMENT,
      [Permissions.USERS_FORCE_PASSWORD_RESET]:
        PermissionCategories.USER_MANAGEMENT,

      // Roles & Permissions
      [Permissions.ROLES_CREATE]: PermissionCategories.ROLES_PERMISSIONS,
      [Permissions.ROLES_EDIT]: PermissionCategories.ROLES_PERMISSIONS,
      [Permissions.ROLES_DELETE]: PermissionCategories.ROLES_PERMISSIONS,
      [Permissions.ROLES_ASSIGN_EXISTING]:
        PermissionCategories.ROLES_PERMISSIONS,
      [Permissions.PERMISSIONS_CREATE_CUSTOM]:
        PermissionCategories.ROLES_PERMISSIONS,
      [Permissions.PERMISSIONS_EDIT_CUSTOM]:
        PermissionCategories.ROLES_PERMISSIONS,

      // Security & Compliance
      [Permissions.AUDIT_LOGS_VIEW_ALL]:
        PermissionCategories.SECURITY_COMPLIANCE,
      [Permissions.AUDIT_LOGS_VIEW_SCOPE]:
        PermissionCategories.SECURITY_COMPLIANCE,
      [Permissions.SECURITY_2FA_MANAGE]:
        PermissionCategories.SECURITY_COMPLIANCE,
      [Permissions.SECURITY_IP_WHITELIST]:
        PermissionCategories.SECURITY_COMPLIANCE,
      [Permissions.SECURITY_SESSION_TIMEOUT]:
        PermissionCategories.SECURITY_COMPLIANCE,
      [Permissions.SECURITY_DATA_RETENTION]:
        PermissionCategories.SECURITY_COMPLIANCE,

      // Data & File Management
      [Permissions.DATA_ACCESS_ALL]: PermissionCategories.DATA_FILE_MANAGEMENT,
      [Permissions.DATA_ACCESS_PROJECT]:
        PermissionCategories.DATA_FILE_MANAGEMENT,
      [Permissions.FILES_LOCK_UNLOCK]:
        PermissionCategories.DATA_FILE_MANAGEMENT,
      [Permissions.FILES_ASSIGN_PERMISSIONS]:
        PermissionCategories.DATA_FILE_MANAGEMENT,
      [Permissions.FILES_RESTORE_DELETED]:
        PermissionCategories.DATA_FILE_MANAGEMENT,
      [Permissions.FILES_UPLOAD]: PermissionCategories.DATA_FILE_MANAGEMENT,
      [Permissions.FILES_DOWNLOAD]: PermissionCategories.DATA_FILE_MANAGEMENT,
      [Permissions.FILES_SHARE_EXTERNAL]:
        PermissionCategories.DATA_FILE_MANAGEMENT,

      // Financials
      [Permissions.FINANCIALS_VIEW_ALL]: PermissionCategories.FINANCIALS,
      [Permissions.FINANCIALS_VIEW_SCOPE]: PermissionCategories.FINANCIALS,
      [Permissions.FINANCIALS_EDIT_ALL]: PermissionCategories.FINANCIALS,
      [Permissions.FINANCIALS_CREATE_QUOTES]: PermissionCategories.FINANCIALS,
      [Permissions.FINANCIALS_CREATE_INVOICES]: PermissionCategories.FINANCIALS,
      [Permissions.FINANCIALS_VIEW_REPORTS]: PermissionCategories.FINANCIALS,
      [Permissions.FINANCIALS_VIEW_COSTS]: PermissionCategories.FINANCIALS,
      [Permissions.FINANCIALS_VIEW_PAYMENT_STATUS]:
        PermissionCategories.FINANCIALS,

      // Integrations
      [Permissions.INTEGRATIONS_CONFIGURE]: PermissionCategories.INTEGRATIONS,

      // System Settings
      [Permissions.SYSTEM_FEATURE_FLAGS]: PermissionCategories.SYSTEM_SETTINGS,
      [Permissions.SYSTEM_UI_SETTINGS]: PermissionCategories.SYSTEM_SETTINGS,
      [Permissions.SYSTEM_EMAIL_TEMPLATES]:
        PermissionCategories.SYSTEM_SETTINGS,
      [Permissions.SYSTEM_PROJECT_SETTINGS]:
        PermissionCategories.SYSTEM_SETTINGS,

      // Custom Logic
      [Permissions.CUSTOM_LOGIC_CREATE]: PermissionCategories.CUSTOM_LOGIC,
      [Permissions.CUSTOM_LOGIC_EDIT]: PermissionCategories.CUSTOM_LOGIC,
      [Permissions.CUSTOM_LOGIC_DELETE]: PermissionCategories.CUSTOM_LOGIC,

      // Project Access
      [Permissions.PROJECTS_VIEW_ALL]: PermissionCategories.PROJECT_ACCESS,
      [Permissions.PROJECTS_VIEW_ASSIGNED]: PermissionCategories.PROJECT_ACCESS,
      [Permissions.PROJECTS_VIEW_OWN]: PermissionCategories.PROJECT_ACCESS,

      // Task Management
      [Permissions.TASKS_CREATE]: PermissionCategories.TASK_MANAGEMENT,
      [Permissions.TASKS_EDIT]: PermissionCategories.TASK_MANAGEMENT,
      [Permissions.TASKS_DELETE]: PermissionCategories.TASK_MANAGEMENT,
      [Permissions.TASKS_ASSIGN]: PermissionCategories.TASK_MANAGEMENT,
      [Permissions.TASKS_EDIT_OWN]: PermissionCategories.TASK_MANAGEMENT,

      // Communication
      [Permissions.CHAT_VIEW_ALL]: PermissionCategories.COMMUNICATION,
      [Permissions.CHAT_VIEW_PROJECT]: PermissionCategories.COMMUNICATION,
      [Permissions.CHAT_SEND_INTERNAL]: PermissionCategories.COMMUNICATION,
      [Permissions.CHAT_SEND_EXTERNAL]: PermissionCategories.COMMUNICATION,
      [Permissions.CHAT_MENTION_USERS]: PermissionCategories.COMMUNICATION,

      // Time Tracking
      [Permissions.TIME_LOG]: PermissionCategories.TIME_TRACKING,
      [Permissions.TIME_VIEW_REPORTS]: PermissionCategories.TIME_TRACKING,

      // Account & Profile
      [Permissions.ACCOUNT_CREATE]: PermissionCategories.ACCOUNT_PROFILE,
      [Permissions.ACCOUNT_COMPLETE_PROFILE]:
        PermissionCategories.ACCOUNT_PROFILE,

      // Dashboard Access
      [Permissions.DASHBOARD_ACCESS_PORTAL]:
        PermissionCategories.DASHBOARD_ACCESS,

      // Messaging
      [Permissions.MESSAGING_SEND_PROJECT]: PermissionCategories.MESSAGING,

      // Notifications
      [Permissions.NOTIFICATIONS_RECEIVE]: PermissionCategories.NOTIFICATIONS,

      // E-Signing
      [Permissions.E_SIGNING_SIGN]: PermissionCategories.E_SIGNING,
    };

    return categoryMap[permission] || PermissionCategories.USER_MANAGEMENT;
  }

  private getPermissionNotes(
    permission: Permissions,
    role: SystemRoles
  ): string {
    const notes: Record<string, Record<SystemRoles, string>> = {
      [Permissions.USERS_VIEW_ALL]: {
        [SystemRoles.SUPER_ADMIN]:
          'Can see all users including other Super Admins',
        [SystemRoles.ADMIN]: 'Cannot see Super Admins',
        [SystemRoles.EMPLOYEE]: 'No access',
        [SystemRoles.CONTRACTOR]: 'No access',
        [SystemRoles.CUSTOMER]: 'No access',
      },
      [Permissions.FINANCIALS_VIEW_ALL]: {
        [SystemRoles.SUPER_ADMIN]: 'Full access to all financial data',
        [SystemRoles.ADMIN]: 'Limited to assigned projects',
        [SystemRoles.EMPLOYEE]: 'Only cost information if granted',
        [SystemRoles.CONTRACTOR]: 'Only own payment status',
        [SystemRoles.CUSTOMER]: 'Only own project financials',
      },
    };

    return notes[permission]?.[role] || '';
  }

  // Add custom rule
  addCustomRule(rule: CustomRule): void {
    this.customRules.push(rule);
  }

  // Remove custom rule
  removeCustomRule(ruleId: string): void {
    this.customRules = this.customRules.filter(rule => rule.id !== ruleId);
  }

  // Get all custom rules
  getCustomRules(): CustomRule[] {
    return this.customRules;
  }

  // Set roles
  setRoles(roles: Role[]): void {
    this.roles = roles;
  }

  // Set users
  setUsers(users: User[]): void {
    this.users = users;
  }

  // Get role template
  getRoleTemplate(role: SystemRoles): RoleTemplate | undefined {
    return DEFAULT_ROLE_TEMPLATES[role];
  }

  // Get all role templates
  getAllRoleTemplates(): Record<SystemRoles, RoleTemplate> {
    return DEFAULT_ROLE_TEMPLATES;
  }
}

export default PermissionMatrixService;
