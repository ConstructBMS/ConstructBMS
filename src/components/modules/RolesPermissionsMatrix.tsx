import React, { useState, useEffect } from 'react';
import { SystemRoles, Permissions } from '../../types/auth';
import { DEFAULT_ROLE_TEMPLATES } from '../../services/permissionMatrix';

const roleList = Object.values(SystemRoles);
const permissionList = Object.values(Permissions);

// Mock permission explanations
const permissionExplanations: Record<Permissions, string> = {
  [Permissions.USERS_VIEW_ALL]: 'See all users of all roles',
  [Permissions.USERS_CREATE]: 'Create new users',
  // ... (add explanations for all permissions as needed)
} as any;

const TABS = [
  { key: 'matrix', label: 'Matrix' },
  { key: 'users', label: 'Users' },
  { key: 'roles', label: 'Roles' },
  { key: 'permissions', label: 'Permissions' },
  { key: 'custom-rules', label: 'Custom Rules' },
  { key: 'audit-log', label: 'Audit Log' },
];

// Mock users data
const mockUsers = [
  {
    id: '1',
    email: 'archerbuildltd@gmail.com',
    firstName: 'Archer',
    lastName: 'Admin',
    role: SystemRoles.SUPER_ADMIN,
    isActive: true,
    lastLogin: '2024-01-15T10:30:00Z',
    assignedProjects: ['project-1', 'project-2'],
    profileCompleted: true,
    twoFactorEnabled: true,
  },
  {
    id: '2',
    email: 'admin@archer.com',
    firstName: 'Admin',
    lastName: 'User',
    role: SystemRoles.ADMIN,
    isActive: true,
    lastLogin: '2024-01-14T15:45:00Z',
    assignedProjects: ['project-1'],
    profileCompleted: true,
    twoFactorEnabled: false,
  },
  {
    id: '3',
    email: 'employee@archer.com',
    firstName: 'Employee',
    lastName: 'User',
    role: SystemRoles.EMPLOYEE,
    isActive: true,
    lastLogin: '2024-01-13T09:15:00Z',
    assignedProjects: ['project-1'],
    profileCompleted: false,
    twoFactorEnabled: false,
  },
  {
    id: '4',
    email: 'contractor@example.com',
    firstName: 'John',
    lastName: 'Contractor',
    role: SystemRoles.CONTRACTOR,
    isActive: true,
    lastLogin: '2024-01-12T14:20:00Z',
    assignedProjects: ['project-2'],
    profileCompleted: true,
    twoFactorEnabled: false,
  },
  {
    id: '5',
    email: 'customer@example.com',
    firstName: 'Jane',
    lastName: 'Customer',
    role: SystemRoles.CUSTOMER,
    isActive: true,
    lastLogin: '2024-01-11T11:30:00Z',
    assignedProjects: ['project-3'],
    profileCompleted: true,
    twoFactorEnabled: false,
  },
];

// Mock roles data (combining system roles with some custom ones)
const mockRoles = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description:
      'Has every possible permission. Manages system-wide settings, security policies, integrations, and all custom logic.',
    level: SystemRoles.SUPER_ADMIN,
    isSystemRole: true,
    isActive: true,
    userCount: 1,
    priority: 1,
    permissions:
      DEFAULT_ROLE_TEMPLATES[SystemRoles.SUPER_ADMIN]?.permissions || [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'admin',
    name: 'Administrator',
    description:
      'Runs daily operations. Manages employees and contractors. Does not have system-level control.',
    level: SystemRoles.ADMIN,
    isSystemRole: true,
    isActive: true,
    userCount: 1,
    priority: 2,
    permissions: DEFAULT_ROLE_TEMPLATES[SystemRoles.ADMIN]?.permissions || [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'employee',
    name: 'Employee',
    description:
      'Internal team member. Works on assigned projects only. No financial or user management power.',
    level: SystemRoles.EMPLOYEE,
    isSystemRole: true,
    isActive: true,
    userCount: 1,
    priority: 3,
    permissions:
      DEFAULT_ROLE_TEMPLATES[SystemRoles.EMPLOYEE]?.permissions || [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'contractor',
    name: 'Contractor',
    description:
      'External collaborator. Very limited access to internal data. Works only on assigned tasks.',
    level: SystemRoles.CONTRACTOR,
    isSystemRole: true,
    isActive: true,
    userCount: 1,
    priority: 4,
    permissions:
      DEFAULT_ROLE_TEMPLATES[SystemRoles.CONTRACTOR]?.permissions || [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'customer',
    name: 'Customer',
    description:
      'External client. Very restricted. Can only see items relevant to their project.',
    level: SystemRoles.CUSTOMER,
    isSystemRole: true,
    isActive: true,
    userCount: 1,
    priority: 5,
    permissions:
      DEFAULT_ROLE_TEMPLATES[SystemRoles.CUSTOMER]?.permissions || [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'project_manager',
    name: 'Project Manager',
    description:
      'Custom role for managing specific projects with enhanced project permissions.',
    level: SystemRoles.ADMIN, // Inherits from Admin level
    isSystemRole: false,
    isActive: true,
    userCount: 0,
    priority: 6,
    permissions: [
      Permissions.PROJECTS_VIEW_ASSIGNED,
      Permissions.TASKS_CREATE,
      Permissions.TASKS_EDIT,
      Permissions.TASKS_ASSIGN,
      Permissions.FILES_UPLOAD,
      Permissions.FILES_DOWNLOAD,
      Permissions.CHAT_VIEW_PROJECT,
      Permissions.CHAT_SEND_INTERNAL,
      Permissions.TIME_VIEW_REPORTS,
    ],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
];

// Comprehensive permission explanations and metadata
const permissionMetadata: Record<
  Permissions,
  {
    displayName: string;
    description: string;
    category: string;
    dependencies?: Permissions[];
    conflicts?: Permissions[];
    uiElements?: string[];
    dataScope?: string;
    examples?: string[];
  }
> = {
  [Permissions.USERS_VIEW_ALL]: {
    displayName: 'View All Users',
    description:
      'See all users of all roles, including Super Admins and other administrators',
    category: 'User Management',
    dataScope: 'all',
    examples: ['User directory', 'System administration', 'Audit trails'],
  },
  [Permissions.USERS_VIEW_SCOPE]: {
    displayName: 'View Users in Scope',
    description:
      'View employees, contractors, and customers within assigned scope (cannot see Super Admins)',
    category: 'User Management',
    dataScope: 'organization',
    examples: ['Team management', 'Project assignments', 'User administration'],
  },
  [Permissions.USERS_CREATE]: {
    displayName: 'Create Users',
    description: 'Create new user accounts and set initial roles',
    category: 'User Management',
    dependencies: [Permissions.USERS_VIEW_SCOPE],
    examples: [
      'Onboarding new employees',
      'Adding contractors',
      'Creating customer accounts',
    ],
  },
  [Permissions.USERS_EDIT]: {
    displayName: 'Edit Users',
    description: 'Modify user information, profiles, and settings',
    category: 'User Management',
    dependencies: [Permissions.USERS_VIEW_SCOPE],
    examples: [
      'Updating contact information',
      'Changing user settings',
      'Profile management',
    ],
  },
  [Permissions.USERS_DELETE]: {
    displayName: 'Delete Users',
    description: 'Permanently remove user accounts from the system',
    category: 'User Management',
    dependencies: [Permissions.USERS_VIEW_SCOPE],
    conflicts: [Permissions.USERS_VIEW_ALL], // Super Admin only
    examples: [
      'Account termination',
      'System cleanup',
      'Compliance requirements',
    ],
  },
  [Permissions.USERS_ASSIGN_ROLES]: {
    displayName: 'Assign Roles',
    description: 'Change user roles and assign new permissions',
    category: 'User Management',
    dependencies: [Permissions.USERS_VIEW_SCOPE],
    examples: ['Promoting employees', 'Role changes', 'Permission updates'],
  },
  [Permissions.USERS_FORCE_PASSWORD_RESET]: {
    displayName: 'Force Password Reset',
    description: 'Require users to change their password immediately',
    category: 'User Management',
    dependencies: [Permissions.USERS_VIEW_SCOPE],
    examples: [
      'Security incidents',
      'Compliance requirements',
      'Account recovery',
    ],
  },
  [Permissions.ROLES_CREATE]: {
    displayName: 'Create Roles',
    description: 'Define entirely new roles with custom permission sets',
    category: 'Roles & Permissions',
    dataScope: 'all',
    examples: [
      'Custom job roles',
      'Project-specific roles',
      'Temporary access roles',
    ],
  },
  [Permissions.ROLES_EDIT]: {
    displayName: 'Edit Roles',
    description: 'Modify existing role definitions and permissions',
    category: 'Roles & Permissions',
    dependencies: [Permissions.ROLES_CREATE],
    examples: [
      'Updating role permissions',
      'Role refinement',
      'Policy changes',
    ],
  },
  [Permissions.ROLES_DELETE]: {
    displayName: 'Delete Roles',
    description: 'Remove custom roles from the system',
    category: 'Roles & Permissions',
    dependencies: [Permissions.ROLES_CREATE],
    conflicts: [Permissions.USERS_VIEW_ALL], // Super Admin only
    examples: ['Role cleanup', 'System maintenance', 'Policy updates'],
  },
  [Permissions.ROLES_ASSIGN_EXISTING]: {
    displayName: 'Assign Existing Roles',
    description: 'Assign predefined roles to users (cannot create new roles)',
    category: 'Roles & Permissions',
    dependencies: [Permissions.USERS_VIEW_SCOPE],
    examples: ['User role assignment', 'Team management', 'Access control'],
  },
  [Permissions.PERMISSIONS_CREATE_CUSTOM]: {
    displayName: 'Create Custom Permissions',
    description: 'Define granular logic-based permissions with custom rules',
    category: 'Roles & Permissions',
    dataScope: 'all',
    examples: [
      'If-this-then-that rules',
      'Conditional access',
      'Advanced security policies',
    ],
  },
  [Permissions.PERMISSIONS_EDIT_CUSTOM]: {
    displayName: 'Edit Custom Permissions',
    description: 'Modify existing custom permission rules and logic',
    category: 'Roles & Permissions',
    dependencies: [Permissions.PERMISSIONS_CREATE_CUSTOM],
    examples: ['Rule updates', 'Policy refinement', 'Logic modifications'],
  },
  [Permissions.AUDIT_LOGS_VIEW_ALL]: {
    displayName: 'View All Audit Logs',
    description:
      'Access complete system audit trail including Super Admin activities',
    category: 'Security & Compliance',
    dataScope: 'all',
    conflicts: [Permissions.AUDIT_LOGS_VIEW_SCOPE], // Super Admin only
    examples: ['Security audits', 'Compliance reporting', 'System monitoring'],
  },
  [Permissions.AUDIT_LOGS_VIEW_SCOPE]: {
    displayName: 'View Scope Audit Logs',
    description:
      'View audit logs for assigned projects and users (not system-wide)',
    category: 'Security & Compliance',
    dataScope: 'assigned',
    examples: ['Project monitoring', 'Team activity', 'Access tracking'],
  },
  [Permissions.SECURITY_2FA_MANAGE]: {
    displayName: 'Manage 2FA/MFA',
    description: 'Configure and enforce two-factor authentication policies',
    category: 'Security & Compliance',
    dataScope: 'all',
    examples: [
      'Security policies',
      'Authentication setup',
      'Compliance requirements',
    ],
  },
  [Permissions.SECURITY_IP_WHITELIST]: {
    displayName: 'Manage IP Whitelist',
    description: 'Configure IP address restrictions for platform access',
    category: 'Security & Compliance',
    dataScope: 'all',
    examples: ['Network security', 'Access control', 'Geographic restrictions'],
  },
  [Permissions.SECURITY_SESSION_TIMEOUT]: {
    displayName: 'Manage Session Timeouts',
    description: 'Set idle session limits and timeout policies',
    category: 'Security & Compliance',
    dataScope: 'all',
    examples: [
      'Security policies',
      'Session management',
      'Compliance settings',
    ],
  },
  [Permissions.SECURITY_DATA_RETENTION]: {
    displayName: 'Manage Data Retention',
    description: 'Configure data deletion schedules and retention policies',
    category: 'Security & Compliance',
    dataScope: 'all',
    examples: ['Compliance policies', 'Data lifecycle', 'Storage management'],
  },
  [Permissions.DATA_ACCESS_ALL]: {
    displayName: 'Access All Data',
    description: 'Full access to all projects, files, and system data',
    category: 'Data & File Management',
    dataScope: 'all',
    examples: [
      'System administration',
      'Data management',
      'Full system access',
    ],
  },
  [Permissions.DATA_ACCESS_PROJECT]: {
    displayName: 'Access Project Data',
    description: 'Access data for assigned projects only',
    category: 'Data & File Management',
    dataScope: 'assigned',
    examples: ['Project work', 'Team collaboration', 'Task management'],
  },
  [Permissions.FILES_LOCK_UNLOCK]: {
    displayName: 'Lock/Unlock Files',
    description: 'Prevent changes or hide visibility of files and folders',
    category: 'Data & File Management',
    dependencies: [Permissions.DATA_ACCESS_PROJECT],
    examples: ['Document protection', 'Version control', 'Access control'],
  },
  [Permissions.FILES_ASSIGN_PERMISSIONS]: {
    displayName: 'Assign File Permissions',
    description:
      'Set read, write, delete, share permissions on individual files/folders',
    category: 'Data & File Management',
    dependencies: [Permissions.DATA_ACCESS_PROJECT],
    examples: ['Document sharing', 'Access control', 'Collaboration setup'],
  },
  [Permissions.FILES_RESTORE_DELETED]: {
    displayName: 'Restore Deleted Files',
    description: 'Recover deleted files and data from system backups',
    category: 'Data & File Management',
    dataScope: 'all',
    examples: ['Data recovery', 'Accident recovery', 'System maintenance'],
  },
  [Permissions.FILES_UPLOAD]: {
    displayName: 'Upload Files',
    description: 'Upload files to assigned projects and folders',
    category: 'Data & File Management',
    dependencies: [Permissions.DATA_ACCESS_PROJECT],
    examples: ['Document upload', 'Photo sharing', 'File management'],
  },
  [Permissions.FILES_DOWNLOAD]: {
    displayName: 'Download Files',
    description: 'Download files from accessible projects and folders',
    category: 'Data & File Management',
    dependencies: [Permissions.DATA_ACCESS_PROJECT],
    examples: ['Document access', 'File retrieval', 'Data export'],
  },
  [Permissions.FILES_SHARE_EXTERNAL]: {
    displayName: 'Share Files Externally',
    description: 'Share files with external users (customers, contractors)',
    category: 'Data & File Management',
    dependencies: [Permissions.FILES_DOWNLOAD],
    examples: ['Client sharing', 'Contractor access', 'External collaboration'],
  },
  [Permissions.FINANCIALS_VIEW_ALL]: {
    displayName: 'View All Financials',
    description:
      'Access all financial data including costs, profits, and company finances',
    category: 'Financials',
    dataScope: 'all',
    conflicts: [Permissions.FINANCIALS_VIEW_SCOPE], // Super Admin only
    examples: ['Financial reporting', 'Cost analysis', 'Profit tracking'],
  },
  [Permissions.FINANCIALS_VIEW_SCOPE]: {
    displayName: 'View Scope Financials',
    description: 'View financial data for assigned projects and scope',
    category: 'Financials',
    dataScope: 'assigned',
    examples: ['Project budgets', 'Cost tracking', 'Financial management'],
  },
  [Permissions.FINANCIALS_EDIT_ALL]: {
    displayName: 'Edit All Financials',
    description: 'Modify all financial records and data',
    category: 'Financials',
    dependencies: [Permissions.FINANCIALS_VIEW_ALL],
    examples: ['Financial corrections', 'Data updates', 'System maintenance'],
  },
  [Permissions.FINANCIALS_CREATE_QUOTES]: {
    displayName: 'Create Quotes',
    description: 'Generate quotes and estimates for projects',
    category: 'Financials',
    dependencies: [Permissions.FINANCIALS_VIEW_SCOPE],
    examples: ['Client quotes', 'Project estimates', 'Proposal creation'],
  },
  [Permissions.FINANCIALS_CREATE_INVOICES]: {
    displayName: 'Create Invoices',
    description: 'Generate invoices for completed work',
    category: 'Financials',
    dependencies: [Permissions.FINANCIALS_VIEW_SCOPE],
    examples: ['Client billing', 'Payment requests', 'Revenue tracking'],
  },
  [Permissions.FINANCIALS_VIEW_REPORTS]: {
    displayName: 'View Financial Reports',
    description: 'Access financial reports and analytics',
    category: 'Financials',
    dependencies: [Permissions.FINANCIALS_VIEW_SCOPE],
    examples: ['Financial analysis', 'Reporting', 'Business intelligence'],
  },
  [Permissions.FINANCIALS_VIEW_COSTS]: {
    displayName: 'View Costs',
    description: 'View cost information and pricing data',
    category: 'Financials',
    dataScope: 'limited',
    examples: ['Cost analysis', 'Pricing information', 'Budget planning'],
  },
  [Permissions.FINANCIALS_VIEW_PAYMENT_STATUS]: {
    displayName: 'View Payment Status',
    description: 'Check payment status for invoices and accounts',
    category: 'Financials',
    dataScope: 'own',
    examples: ['Payment tracking', 'Account status', 'Invoice monitoring'],
  },
  [Permissions.INTEGRATIONS_CONFIGURE]: {
    displayName: 'Configure Integrations',
    description: 'Set up and manage external system integrations',
    category: 'Integrations',
    dataScope: 'all',
    examples: ['Email setup', 'Accounting integration', 'File storage setup'],
  },
  [Permissions.SYSTEM_FEATURE_FLAGS]: {
    displayName: 'Manage Feature Flags',
    description: 'Turn features on/off and control experimental functionality',
    category: 'System Settings',
    dataScope: 'all',
    examples: ['Feature testing', 'System configuration', 'Rollout management'],
  },
  [Permissions.SYSTEM_UI_SETTINGS]: {
    displayName: 'Manage UI Settings',
    description: 'Configure system-wide UI settings, themes, and branding',
    category: 'System Settings',
    dataScope: 'all',
    examples: ['Theme customization', 'Branding setup', 'UI configuration'],
  },
  [Permissions.SYSTEM_EMAIL_TEMPLATES]: {
    displayName: 'Manage Email Templates',
    description: 'Modify system notification and email templates',
    category: 'System Settings',
    dataScope: 'all',
    examples: [
      'Email customization',
      'Notification setup',
      'Communication templates',
    ],
  },
  [Permissions.SYSTEM_PROJECT_SETTINGS]: {
    displayName: 'Manage Project Settings',
    description: 'Configure project-specific settings and configurations',
    category: 'System Settings',
    dataScope: 'project',
    examples: [
      'Project configuration',
      'Workflow setup',
      'Project customization',
    ],
  },
  [Permissions.CUSTOM_LOGIC_CREATE]: {
    displayName: 'Create Custom Logic',
    description: 'Build "if-this-then-that" rules and custom business logic',
    category: 'Custom Logic',
    dataScope: 'all',
    examples: ['Automation rules', 'Business logic', 'Conditional workflows'],
  },
  [Permissions.CUSTOM_LOGIC_EDIT]: {
    displayName: 'Edit Custom Logic',
    description: 'Modify existing custom rules and business logic',
    category: 'Custom Logic',
    dependencies: [Permissions.CUSTOM_LOGIC_CREATE],
    examples: ['Rule updates', 'Logic modifications', 'Workflow changes'],
  },
  [Permissions.CUSTOM_LOGIC_DELETE]: {
    displayName: 'Delete Custom Logic',
    description: 'Remove custom rules and business logic',
    category: 'Custom Logic',
    dependencies: [Permissions.CUSTOM_LOGIC_CREATE],
    examples: ['Rule cleanup', 'System maintenance', 'Logic removal'],
  },
  [Permissions.PROJECTS_VIEW_ALL]: {
    displayName: 'View All Projects',
    description: 'Access all projects in the system',
    category: 'Project Access',
    dataScope: 'all',
    examples: [
      'Project overview',
      'System administration',
      'Cross-project work',
    ],
  },
  [Permissions.PROJECTS_VIEW_ASSIGNED]: {
    displayName: 'View Assigned Projects',
    description: 'Access only projects assigned to the user',
    category: 'Project Access',
    dataScope: 'assigned',
    examples: ['Project work', 'Team collaboration', 'Task management'],
  },
  [Permissions.PROJECTS_VIEW_OWN]: {
    displayName: 'View Own Projects',
    description: 'Access only projects owned by the user',
    category: 'Project Access',
    dataScope: 'own',
    examples: ['Personal projects', 'Client access', 'Owned work'],
  },
  [Permissions.TASKS_CREATE]: {
    displayName: 'Create Tasks',
    description: 'Create new tasks and work items',
    category: 'Task Management',
    dependencies: [Permissions.PROJECTS_VIEW_ASSIGNED],
    examples: ['Task creation', 'Work planning', 'Project management'],
  },
  [Permissions.TASKS_EDIT]: {
    displayName: 'Edit Tasks',
    description: 'Modify existing tasks and work items',
    category: 'Task Management',
    dependencies: [Permissions.PROJECTS_VIEW_ASSIGNED],
    examples: ['Task updates', 'Work modifications', 'Project changes'],
  },
  [Permissions.TASKS_DELETE]: {
    displayName: 'Delete Tasks',
    description: 'Remove tasks and work items from projects',
    category: 'Task Management',
    dependencies: [Permissions.TASKS_EDIT],
    examples: ['Task cleanup', 'Work removal', 'Project maintenance'],
  },
  [Permissions.TASKS_ASSIGN]: {
    displayName: 'Assign Tasks',
    description: 'Assign tasks to team members and users',
    category: 'Task Management',
    dependencies: [Permissions.TASKS_CREATE],
    examples: ['Work distribution', 'Team management', 'Project coordination'],
  },
  [Permissions.TASKS_EDIT_OWN]: {
    displayName: 'Edit Own Tasks',
    description: 'Modify tasks assigned to the current user',
    category: 'Task Management',
    dataScope: 'own',
    examples: ['Personal task management', 'Work updates', 'Progress tracking'],
  },
  [Permissions.CHAT_VIEW_ALL]: {
    displayName: 'View All Chats',
    description: 'Access all chat conversations and messages',
    category: 'Communication',
    dataScope: 'all',
    examples: [
      'System monitoring',
      'Communication oversight',
      'Support management',
    ],
  },
  [Permissions.CHAT_VIEW_PROJECT]: {
    displayName: 'View Project Chats',
    description: 'Access chat conversations for assigned projects',
    category: 'Communication',
    dataScope: 'assigned',
    examples: ['Team communication', 'Project discussions', 'Collaboration'],
  },
  [Permissions.CHAT_SEND_INTERNAL]: {
    displayName: 'Send Internal Messages',
    description: 'Send messages to internal team members',
    category: 'Communication',
    dependencies: [Permissions.CHAT_VIEW_PROJECT],
    examples: [
      'Team communication',
      'Internal discussions',
      'Work coordination',
    ],
  },
  [Permissions.CHAT_SEND_EXTERNAL]: {
    displayName: 'Send External Messages',
    description: 'Send messages to external users (customers, contractors)',
    category: 'Communication',
    dependencies: [Permissions.CHAT_VIEW_PROJECT],
    examples: [
      'Client communication',
      'Contractor coordination',
      'External collaboration',
    ],
  },
  [Permissions.CHAT_MENTION_USERS]: {
    displayName: 'Mention Users',
    description: 'Tag and mention other users in chat messages',
    category: 'Communication',
    dependencies: [Permissions.CHAT_SEND_INTERNAL],
    examples: ['User notifications', 'Team coordination', 'Attention drawing'],
  },
  [Permissions.TIME_LOG]: {
    displayName: 'Log Time',
    description: 'Record time spent on tasks and projects',
    category: 'Time Tracking',
    dataScope: 'own',
    examples: ['Time tracking', 'Work logging', 'Billing records'],
  },
  [Permissions.TIME_VIEW_REPORTS]: {
    displayName: 'View Time Reports',
    description: 'Access time tracking reports and analytics',
    category: 'Time Tracking',
    dataScope: 'assigned',
    examples: ['Time analysis', 'Reporting', 'Workload management'],
  },
  [Permissions.ACCOUNT_CREATE]: {
    displayName: 'Create Account',
    description: 'Register new user accounts',
    category: 'Account & Profile',
    dataScope: 'none',
    examples: ['User registration', 'Account setup', 'Onboarding'],
  },
  [Permissions.ACCOUNT_COMPLETE_PROFILE]: {
    displayName: 'Complete Profile',
    description: 'Fill in required profile information',
    category: 'Account & Profile',
    dataScope: 'own',
    examples: ['Profile completion', 'User setup', 'Account configuration'],
  },
  [Permissions.DASHBOARD_ACCESS_PORTAL]: {
    displayName: 'Access Portal',
    description: 'Access the main dashboard and portal interface',
    category: 'Dashboard Access',
    dataScope: 'none',
    examples: ['Portal access', 'Dashboard viewing', 'System entry'],
  },
  [Permissions.MESSAGING_SEND_PROJECT]: {
    displayName: 'Send Project Messages',
    description: 'Send messages to project team members',
    category: 'Messaging',
    dataScope: 'assigned',
    examples: ['Project communication', 'Team messaging', 'Work coordination'],
  },
  [Permissions.NOTIFICATIONS_RECEIVE]: {
    displayName: 'Receive Notifications',
    description: 'Receive system notifications and alerts',
    category: 'Notifications',
    dataScope: 'own',
    examples: ['System alerts', 'Update notifications', 'Communication'],
  },
  [Permissions.E_SIGNING_SIGN]: {
    displayName: 'Sign Documents',
    description: 'Electronically sign documents and contracts',
    category: 'E-Signing',
    dataScope: 'own',
    examples: ['Contract signing', 'Document approval', 'Legal compliance'],
  },
};

// Mock custom rules data
const mockCustomRules = [
  {
    id: 'rule-1',
    name: 'Project Manager Auto-Assign',
    description:
      'Automatically assign project manager role when user is assigned to 3+ projects',
    isActive: true,
    priority: 1,
    conditions: [
      {
        type: 'user_projects_count',
        operator: 'gte',
        value: 3,
        field: 'assigned_projects',
      },
    ],
    actions: [
      {
        type: 'assign_role',
        value: 'project_manager',
        target: 'user',
      },
    ],
    targetRoles: [SystemRoles.EMPLOYEE],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    createdBy: 'super_admin',
    executionCount: 15,
    lastExecuted: '2024-01-15T14:30:00Z',
  },
  {
    id: 'rule-2',
    name: 'Financial Access Based on Project',
    description:
      'Grant financial view access to users working on projects with budgets over $50k',
    isActive: true,
    priority: 2,
    conditions: [
      {
        type: 'project_budget',
        operator: 'gt',
        value: 50000,
        field: 'project.budget',
      },
      {
        type: 'user_project_assignment',
        operator: 'exists',
        value: true,
        field: 'user.projects',
      },
    ],
    actions: [
      {
        type: 'grant_permission',
        value: Permissions.FINANCIALS_VIEW_SCOPE,
        target: 'user',
      },
    ],
    targetRoles: [SystemRoles.EMPLOYEE, SystemRoles.CONTRACTOR],
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
    createdBy: 'admin',
    executionCount: 8,
    lastExecuted: '2024-01-14T09:15:00Z',
  },
  {
    id: 'rule-3',
    name: 'Customer File Access Restriction',
    description:
      'Restrict customer file access to only their own project files',
    isActive: true,
    priority: 3,
    conditions: [
      {
        type: 'user_role',
        operator: 'eq',
        value: SystemRoles.CUSTOMER,
        field: 'user.role',
      },
    ],
    actions: [
      {
        type: 'restrict_permission',
        value: Permissions.FILES_DOWNLOAD,
        target: 'user',
        scope: 'own_projects_only',
      },
    ],
    targetRoles: [SystemRoles.CUSTOMER],
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z',
    createdBy: 'super_admin',
    executionCount: 45,
    lastExecuted: '2024-01-15T16:45:00Z',
  },
];

// Available condition types
const conditionTypes = [
  {
    value: 'user_role',
    label: 'User Role',
    operators: ['eq', 'ne', 'in', 'nin'],
  },
  {
    value: 'user_projects_count',
    label: 'User Projects Count',
    operators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
  },
  {
    value: 'project_budget',
    label: 'Project Budget',
    operators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
  },
  {
    value: 'user_project_assignment',
    label: 'User Project Assignment',
    operators: ['exists', 'not_exists'],
  },
  {
    value: 'user_login_frequency',
    label: 'User Login Frequency',
    operators: ['gt', 'gte', 'lt', 'lte'],
  },
  {
    value: 'user_profile_completed',
    label: 'User Profile Completed',
    operators: ['eq'],
  },
  {
    value: 'user_two_factor_enabled',
    label: 'User 2FA Enabled',
    operators: ['eq'],
  },
  {
    value: 'time_of_day',
    label: 'Time of Day',
    operators: ['between', 'before', 'after'],
  },
  { value: 'day_of_week', label: 'Day of Week', operators: ['eq', 'in'] },
  {
    value: 'user_permission_count',
    label: 'User Permission Count',
    operators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
  },
];

// Available action types
const actionTypes = [
  { value: 'assign_role', label: 'Assign Role', requiresValue: true },
  { value: 'grant_permission', label: 'Grant Permission', requiresValue: true },
  {
    value: 'revoke_permission',
    label: 'Revoke Permission',
    requiresValue: true,
  },
  {
    value: 'restrict_permission',
    label: 'Restrict Permission',
    requiresValue: true,
  },
  {
    value: 'send_notification',
    label: 'Send Notification',
    requiresValue: true,
  },
  { value: 'log_activity', label: 'Log Activity', requiresValue: true },
  { value: 'trigger_workflow', label: 'Trigger Workflow', requiresValue: true },
  { value: 'set_user_flag', label: 'Set User Flag', requiresValue: true },
  { value: 'schedule_task', label: 'Schedule Task', requiresValue: true },
];

// Mock audit log data
const mockAuditLogs = [
  {
    id: 'log-1',
    timestamp: '2024-01-15T16:45:23Z',
    action: 'PERMISSION_GRANTED',
    userId: '1',
    userEmail: 'archerbuildltd@gmail.com',
    userRole: SystemRoles.SUPER_ADMIN,
    targetUserId: '3',
    targetUserEmail: 'employee@archer.com',
    details: {
      permission: Permissions.FINANCIALS_VIEW_SCOPE,
      reason: 'Project budget exceeded threshold',
      ruleId: 'rule-2',
      ruleName: 'Financial Access Based on Project',
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'session-12345',
    severity: 'INFO',
    category: 'PERMISSIONS',
  },
  {
    id: 'log-2',
    timestamp: '2024-01-15T16:30:15Z',
    action: 'ROLE_ASSIGNED',
    userId: '1',
    userEmail: 'archerbuildltd@gmail.com',
    userRole: SystemRoles.SUPER_ADMIN,
    targetUserId: '2',
    targetUserEmail: 'admin@archer.com',
    details: {
      oldRole: SystemRoles.EMPLOYEE,
      newRole: SystemRoles.ADMIN,
      reason: 'Promotion to administrator',
      effectiveDate: '2024-01-15T00:00:00Z',
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'session-12345',
    severity: 'INFO',
    category: 'ROLES',
  },
  {
    id: 'log-3',
    timestamp: '2024-01-15T16:15:42Z',
    action: 'CUSTOM_RULE_EXECUTED',
    userId: 'system',
    userEmail: 'system@archer.com',
    userRole: null,
    targetUserId: '3',
    targetUserEmail: 'employee@archer.com',
    details: {
      ruleId: 'rule-1',
      ruleName: 'Project Manager Auto-Assign',
      conditions: ['user_projects_count >= 3'],
      actions: ['assign_role: project_manager'],
      executionTime: 45,
      result: 'SUCCESS',
    },
    ipAddress: 'system',
    userAgent: 'Archer System',
    sessionId: 'system-session',
    severity: 'INFO',
    category: 'CUSTOM_RULES',
  },
  {
    id: 'log-4',
    timestamp: '2024-01-15T16:00:18Z',
    action: 'PERMISSION_REVOKED',
    userId: '2',
    userEmail: 'admin@archer.com',
    userRole: SystemRoles.ADMIN,
    targetUserId: '4',
    targetUserEmail: 'contractor@example.com',
    details: {
      permission: Permissions.FILES_SHARE_EXTERNAL,
      reason: 'Project completed, external access no longer needed',
      effectiveDate: '2024-01-15T16:00:00Z',
    },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'session-67890',
    severity: 'WARNING',
    category: 'PERMISSIONS',
  },
  {
    id: 'log-5',
    timestamp: '2024-01-15T15:45:33Z',
    action: 'USER_LOGIN',
    userId: '5',
    userEmail: 'customer@example.com',
    userRole: SystemRoles.CUSTOMER,
    targetUserId: null,
    targetUserEmail: null,
    details: {
      loginMethod: 'email_password',
      twoFactorUsed: false,
      location: 'London, UK',
      deviceType: 'desktop',
    },
    ipAddress: '203.0.113.45',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    sessionId: 'session-11111',
    severity: 'INFO',
    category: 'AUTHENTICATION',
  },
  {
    id: 'log-6',
    timestamp: '2024-01-15T15:30:07Z',
    action: 'CUSTOM_RULE_CREATED',
    userId: '1',
    userEmail: 'archerbuildltd@gmail.com',
    userRole: SystemRoles.SUPER_ADMIN,
    targetUserId: null,
    targetUserEmail: null,
    details: {
      ruleId: 'rule-3',
      ruleName: 'Customer File Access Restriction',
      conditions: ['user_role == CUSTOMER'],
      actions: ['restrict_permission: FILES_DOWNLOAD'],
      targetRoles: [SystemRoles.CUSTOMER],
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'session-12345',
    severity: 'INFO',
    category: 'CUSTOM_RULES',
  },
  {
    id: 'log-7',
    timestamp: '2024-01-15T15:15:22Z',
    action: 'PERMISSION_DENIED',
    userId: '4',
    userEmail: 'contractor@example.com',
    userRole: SystemRoles.CONTRACTOR,
    targetUserId: null,
    targetUserEmail: null,
    details: {
      permission: Permissions.FINANCIALS_VIEW_ALL,
      reason: 'Insufficient permissions',
      attemptedAction: 'View financial reports',
      resource: 'financial_reports',
    },
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'session-22222',
    severity: 'WARNING',
    category: 'PERMISSIONS',
  },
  {
    id: 'log-8',
    timestamp: '2024-01-15T15:00:55Z',
    action: 'USER_LOGOUT',
    userId: '3',
    userEmail: 'employee@archer.com',
    userRole: SystemRoles.EMPLOYEE,
    targetUserId: null,
    targetUserEmail: null,
    details: {
      sessionDuration: 3600,
      logoutReason: 'user_initiated',
      lastActivity: '2024-01-15T14:55:00Z',
    },
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'session-33333',
    severity: 'INFO',
    category: 'AUTHENTICATION',
  },
];

// Audit log categories
const auditCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'PERMISSIONS', label: 'Permissions' },
  { value: 'ROLES', label: 'Roles' },
  { value: 'CUSTOM_RULES', label: 'Custom Rules' },
  { value: 'AUTHENTICATION', label: 'Authentication' },
  { value: 'USER_MANAGEMENT', label: 'User Management' },
  { value: 'SYSTEM', label: 'System' },
];

// Audit log severities
const auditSeverities = [
  { value: 'all', label: 'All Severities' },
  { value: 'INFO', label: 'Info', color: 'bg-blue-100 text-blue-800' },
  {
    value: 'WARNING',
    label: 'Warning',
    color: 'bg-yellow-100 text-yellow-800',
  },
  { value: 'ERROR', label: 'Error', color: 'bg-red-100 text-red-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-200 text-red-900' },
];

// Type-safe checkbox component to handle the boolean state properly
const PermissionCheckbox: React.FC<{
  checked: boolean;
  onChange: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  className: string;
}> = ({ checked, onChange, disabled, className }) => {
  return (
    <input
      type='checkbox'
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  );
};

interface RolesPermissionsMatrixProps {
  defaultTab?: string;
}

const RolesPermissionsMatrix: React.FC<RolesPermissionsMatrixProps> = ({
  defaultTab = 'matrix',
}) => {
  // Mock state for toggles (in real app, fetch from backend)
  const [matrix, setMatrix] = useState(() => {
    const initial: Record<
      SystemRoles,
      Record<Permissions, boolean>
    > = {} as any;
    roleList.forEach(role => {
      initial[role] = {} as any;
      permissionList.forEach(perm => {
        initial[role][perm] =
          DEFAULT_ROLE_TEMPLATES[role]?.permissions.includes(perm) || false;
      });
    });
    return initial;
  });

  const [previewRole, setPreviewRole] = useState<SystemRoles | null>(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [permissionSearchTerm, setPermissionSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPermission, setSelectedPermission] =
    useState<Permissions | null>(null);
  const [customRules, setCustomRules] = useState(mockCustomRules);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [ruleSearchTerm, setRuleSearchTerm] = useState('');
  const [ruleConditions, setRuleConditions] = useState<any[]>([]);
  const [ruleActions, setRuleActions] = useState<any[]>([]);
  const [testRuleData, setTestRuleData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isRealTime, setIsRealTime] = useState(false);

  // Update activeTab when defaultTab prop changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleToggle = (role: SystemRoles, perm: Permissions) => {
    setMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm],
      },
    }));
  };

  const handleCreateRule = () => {
    setEditingRule({
      id: `rule-${Date.now()}`,
      name: '',
      description: '',
      isActive: true,
      priority: 1,
      conditions: [],
      actions: [],
      targetRoles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user',
      executionCount: 0,
      lastExecuted: null,
    });
    setRuleConditions([]);
    setRuleActions([]);
    setShowRuleBuilder(true);
  };

  const handleSaveRule = () => {
    if (editingRule) {
      const newRule = {
        ...editingRule,
        conditions: ruleConditions,
        actions: ruleActions,
        updatedAt: new Date().toISOString(),
      };

      if (customRules.find(r => r.id === newRule.id)) {
        setCustomRules(
          customRules.map(r => (r.id === newRule.id ? newRule : r))
        );
      } else {
        setCustomRules([...customRules, newRule]);
      }

      setEditingRule(null);
      setShowRuleBuilder(false);
      setRuleConditions([]);
      setRuleActions([]);
    }
  };

  const handleAddCondition = () => {
    setRuleConditions([
      ...ruleConditions,
      {
        type: '',
        operator: '',
        value: '',
        field: '',
      },
    ]);
  };

  const handleAddAction = () => {
    setRuleActions([
      ...ruleActions,
      {
        type: '',
        value: '',
        target: 'user',
      },
    ]);
  };

  const handleTestRule = (rule: any) => {
    // Mock test data
    setTestRuleData({
      user: {
        id: 'test-user',
        role: SystemRoles.EMPLOYEE,
        assignedProjects: ['project-1', 'project-2', 'project-3'],
        profileCompleted: true,
        twoFactorEnabled: false,
        lastLogin: '2024-01-15T10:30:00Z',
      },
      project: {
        id: 'project-1',
        budget: 75000,
        name: 'Test Project',
      },
      currentTime: new Date().toISOString(),
    });
  };

  const filteredUsers = mockUsers.filter(
    user =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRoles = mockRoles.filter(
    role =>
      role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      (role.isSystemRole ? 'system' : 'custom').includes(
        roleSearchTerm.toLowerCase()
      )
  );

  const getRoleBadgeColor = (role: SystemRoles) => {
    switch (role) {
      case SystemRoles.SUPER_ADMIN:
        return 'bg-red-100 text-red-800 border-red-200';
      case SystemRoles.ADMIN:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case SystemRoles.EMPLOYEE:
        return 'bg-green-100 text-green-800 border-green-200';
      case SystemRoles.CONTRACTOR:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case SystemRoles.CUSTOMER:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffectivePermissions = (user: any) => {
    const template = DEFAULT_ROLE_TEMPLATES[user.role as SystemRoles];
    return template ? template.permissions.length : 0;
  };

  const getRoleLevelColor = (level: SystemRoles) => {
    switch (level) {
      case SystemRoles.SUPER_ADMIN:
        return 'bg-red-100 text-red-800 border-red-200';
      case SystemRoles.ADMIN:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case SystemRoles.EMPLOYEE:
        return 'bg-green-100 text-green-800 border-green-200';
      case SystemRoles.CONTRACTOR:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case SystemRoles.CUSTOMER:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPermissionCategoryName = (permission: Permissions) => {
    const parts = permission.split('.');
    return parts[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const permissionCategories = Array.from(
    new Set(Object.values(permissionMetadata).map(p => p.category))
  ).sort();

  const filteredPermissions = Object.values(Permissions).filter(permission => {
    const meta = permissionMetadata[permission];
    const matchesSearch =
      permission.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
      meta.displayName
        .toLowerCase()
        .includes(permissionSearchTerm.toLowerCase()) ||
      meta.description
        .toLowerCase()
        .includes(permissionSearchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || meta.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRolesWithPermission = (permission: Permissions) => {
    return mockRoles.filter(role => role.permissions.includes(permission));
  };

  const filteredRules = customRules.filter(
    rule =>
      rule.name.toLowerCase().includes(ruleSearchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(ruleSearchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    const severityInfo = auditSeverities.find(s => s.value === severity);
    return severityInfo?.color || 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'PERMISSION_GRANTED':
        return '🔓';
      case 'PERMISSION_REVOKED':
        return '🔒';
      case 'ROLE_ASSIGNED':
        return '👤';
      case 'CUSTOM_RULE_EXECUTED':
        return '⚡';
      case 'USER_LOGIN':
        return '🔑';
      case 'USER_LOGOUT':
        return '🚪';
      case 'PERMISSION_DENIED':
        return '❌';
      default:
        return '📝';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = auditLogs.filter((log: any) => {
    const matchesSearch =
      log.action.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      (log.targetUserEmail &&
        log.targetUserEmail
          .toLowerCase()
          .includes(logSearchTerm.toLowerCase())) ||
      log.details?.reason?.toLowerCase().includes(logSearchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || log.category === selectedCategory;
    const matchesSeverity =
      selectedSeverity === 'all' || log.severity === selectedSeverity;

    const matchesDateRange =
      (!dateRange.start || log.timestamp >= dateRange.start) &&
      (!dateRange.end || log.timestamp <= dateRange.end);

    const matchesUser = selectedUser === 'all' || log.userId === selectedUser;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSeverity &&
      matchesDateRange &&
      matchesUser
    );
  });

  const exportLogs = () => {
    const csvContent = [
      [
        'Timestamp',
        'Action',
        'User',
        'Target User',
        'Category',
        'Severity',
        'Details',
      ],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.action,
        log.userEmail,
        log.targetUserEmail || '',
        log.category,
        log.severity,
        JSON.stringify(log.details),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className='p-6'>
      <div className='mb-4 border-b'>
        <nav className='flex space-x-6'>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-archer-neon text-archer-neon'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'matrix' && (
        <>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-2xl font-bold'>Roles & Permissions Matrix</h1>
            <div className='flex items-center space-x-3'>
              <label className='font-medium'>Preview as Role:</label>
              <select
                value={previewRole || ''}
                onChange={e =>
                  setPreviewRole((e.target.value as SystemRoles) || null)
                }
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-archer-neon'
              >
                <option value=''>Select Role</option>
                {roleList.map(role => (
                  <option key={role} value={role}>
                    {DEFAULT_ROLE_TEMPLATES[role]?.name || role}
                  </option>
                ))}
              </select>
              {previewRole && (
                <button
                  onClick={() => setPreviewRole(null)}
                  className='px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'
                >
                  Clear Preview
                </button>
              )}
              {previewRole && (
                <div className='text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded'>
                  Previewing:{' '}
                  <span className='font-medium'>
                    {DEFAULT_ROLE_TEMPLATES[previewRole]?.name || previewRole}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className='overflow-x-auto border rounded-lg bg-white'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr>
                  <th className='p-2 border-b bg-gray-50 text-left'>
                    Permission
                  </th>
                  {roleList.map(role => {
                    const isPreviewRole = previewRole === role;
                    const isOtherRoleInPreview = previewRole && !isPreviewRole;

                    return (
                      <th
                        key={role}
                        className={`p-2 border-b text-center ${
                          isPreviewRole
                            ? 'bg-gray-100'
                            : isOtherRoleInPreview
                              ? 'bg-gray-50 opacity-60'
                              : 'bg-gray-50'
                        }`}
                      >
                        <div className='text-gray-900'>
                          {DEFAULT_ROLE_TEMPLATES[role]?.name || role}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {permissionList.map(perm => (
                  <tr key={perm}>
                    <td className='p-2 border-b text-left'>
                      <span
                        className='cursor-help font-medium'
                        title={permissionExplanations[perm] || perm}
                      >
                        {perm}
                      </span>
                    </td>
                    {roleList.map(role => {
                      // Show the actual permission state
                      const isChecked: boolean = previewRole
                        ? Boolean(
                            DEFAULT_ROLE_TEMPLATES[
                              previewRole
                            ]?.permissions.includes(perm)
                          )
                        : Boolean(matrix[role]?.[perm] ?? false);

                      const isPreviewRole = previewRole === role;
                      const isOtherRoleInPreview =
                        previewRole && !isPreviewRole;

                      return (
                        <td
                          key={role}
                          className={`p-2 border-b text-center ${
                            isPreviewRole ? 'bg-gray-50' : ''
                          }`}
                        >
                          <PermissionCheckbox
                            checked={isChecked as boolean}
                            onChange={() => handleToggle(role, perm)}
                            disabled={
                              role === SystemRoles.SUPER_ADMIN ||
                              (previewRole && !isPreviewRole)
                            }
                            className={`permission-checkbox ${
                              isPreviewRole
                                ? 'cursor-not-allowed opacity-90'
                                : isOtherRoleInPreview
                                  ? 'opacity-40 cursor-not-allowed'
                                  : ''
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>User Management</h1>
            <button
              onClick={() => setShowUserModal(true)}
              className='bg-archer-neon text-white px-4 py-2 rounded-md hover:bg-archer-black transition-colors'
            >
              Add User
            </button>
          </div>

          <div className='bg-white rounded-lg border'>
            <div className='p-4 border-b'>
              <div className='flex items-center space-x-4'>
                <div className='flex-1'>
                  <input
                    type='text'
                    placeholder='Search users by name, email, or role...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-archer-neon'
                  />
                </div>
                <div className='text-sm text-gray-500'>
                  {filteredUsers.length} of {mockUsers.length} users
                </div>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      User
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Role
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Last Login
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Permissions
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10'>
                            <div className='h-10 w-10 rounded-full bg-archer-neon flex items-center justify-center text-white font-medium'>
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </div>
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {user.firstName} {user.lastName}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}
                        >
                          {DEFAULT_ROLE_TEMPLATES[user.role]?.name || user.role}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {getEffectivePermissions(user)} permissions
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <button
                          onClick={() => setSelectedUser(user.id)}
                          className='text-archer-neon hover:text-archer-black mr-3'
                        >
                          Edit
                        </button>
                        <button className='text-red-600 hover:text-red-900'>
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Details Modal */}
          {selectedUser && (
            <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
              <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
                <div className='mt-3'>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    User Details
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Role
                      </label>
                      <select className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'>
                        {roleList.map(role => (
                          <option key={role} value={role}>
                            {DEFAULT_ROLE_TEMPLATES[role]?.name || role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Assigned Projects
                      </label>
                      <div className='mt-1 text-sm text-gray-500'>
                        {mockUsers.find(u => u.id === selectedUser)
                          ?.assignedProjects?.length || 0}{' '}
                        projects
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Effective Permissions
                      </label>
                      <div className='mt-1 text-sm text-gray-500'>
                        {getEffectivePermissions(
                          mockUsers.find(u => u.id === selectedUser)
                        )}{' '}
                        permissions
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-end space-x-3 mt-6'>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                    >
                      Cancel
                    </button>
                    <button className='px-4 py-2 bg-archer-neon text-white rounded-md hover:bg-archer-black'>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'roles' && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>Role Management</h1>
            <button
              onClick={() => {
                setEditingRole(null);
                setShowRoleModal(true);
              }}
              className='bg-archer-neon text-white px-4 py-2 rounded-md hover:bg-archer-black transition-colors'
            >
              Create Role
            </button>
          </div>

          <div className='bg-white rounded-lg border'>
            <div className='p-4 border-b'>
              <div className='flex items-center space-x-4'>
                <div className='flex-1'>
                  <input
                    type='text'
                    placeholder='Search roles by name, description, or type...'
                    value={roleSearchTerm}
                    onChange={e => setRoleSearchTerm(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-archer-neon'
                  />
                </div>
                <div className='text-sm text-gray-500'>
                  {filteredRoles.length} of {mockRoles.length} roles
                </div>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Role
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Type
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Users
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Permissions
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Priority
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredRoles.map(role => (
                    <tr key={role.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {role.name}
                          </div>
                          <div className='text-sm text-gray-500 max-w-xs truncate'>
                            {role.description}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            role.isSystemRole
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-green-100 text-green-800 border-green-200'
                          }`}
                        >
                          {role.isSystemRole ? 'System' : 'Custom'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {role.userCount} users
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {role.permissions.length} permissions
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {role.priority}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <button
                          onClick={() => {
                            setEditingRole(role);
                            setSelectedRole(role.id);
                          }}
                          className='text-archer-neon hover:text-archer-black mr-3'
                          disabled={
                            role.isSystemRole && role.id === 'super_admin'
                          }
                        >
                          Edit
                        </button>
                        {!role.isSystemRole && (
                          <button className='text-red-600 hover:text-red-900'>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Details Modal */}
          {selectedRole && (
            <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
              <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white'>
                <div className='mt-3'>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    {editingRole ? 'Edit Role' : 'Role Details'}
                  </h3>

                  {editingRole && (
                    <div className='space-y-4 mb-6'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Role Name
                        </label>
                        <input
                          type='text'
                          defaultValue={editingRole.name}
                          className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Description
                        </label>
                        <textarea
                          defaultValue={editingRole.description}
                          rows={3}
                          className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Base Level
                        </label>
                        <select
                          defaultValue={editingRole.level}
                          className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                        >
                          {roleList.map(role => (
                            <option key={role} value={role}>
                              {DEFAULT_ROLE_TEMPLATES[role]?.name || role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className='mb-4'>
                    <h4 className='text-md font-medium text-gray-900 mb-2'>
                      Permissions
                    </h4>
                    <div className='max-h-64 overflow-y-auto border rounded-md p-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {Object.values(Permissions).map(permission => {
                          const isGranted =
                            editingRole?.permissions.includes(permission) ||
                            false;
                          return (
                            <div
                              key={permission}
                              className='flex items-center space-x-3'
                            >
                              <PermissionCheckbox
                                checked={isGranted}
                                onChange={() => {
                                  // Handle permission toggle
                                }}
                                disabled={
                                  editingRole?.isSystemRole &&
                                  editingRole?.id === 'super_admin'
                                }
                                className='rounded border-gray-300 text-archer-neon focus:ring-archer-neon'
                              />
                              <div className='flex-1'>
                                <div className='text-sm font-medium text-gray-900'>
                                  {permission}
                                </div>
                                <div className='text-xs text-gray-500'>
                                  {getPermissionCategoryName(permission)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-end space-x-3'>
                    <button
                      onClick={() => {
                        setSelectedRole(null);
                        setEditingRole(null);
                      }}
                      className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                    >
                      Cancel
                    </button>
                    {editingRole && (
                      <button className='px-4 py-2 bg-archer-neon text-white rounded-md hover:bg-archer-black'>
                        Save Changes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>Permissions Management</h1>
            <div className='text-sm text-gray-500'>
              {filteredPermissions.length} of{' '}
              {Object.values(Permissions).length} permissions
            </div>
          </div>

          <div className='bg-white rounded-lg border'>
            <div className='p-4 border-b'>
              <div className='flex items-center space-x-4'>
                <div className='flex-1'>
                  <input
                    type='text'
                    placeholder='Search permissions by name, description, or category...'
                    value={permissionSearchTerm}
                    onChange={e => setPermissionSearchTerm(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-archer-neon'
                  />
                </div>
                <div className='w-48'>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-archer-neon'
                  >
                    <option value='all'>All Categories</option>
                    {permissionCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Permission
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Category
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Description
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Data Scope
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Roles
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredPermissions.map(permission => {
                    const meta = permissionMetadata[permission];
                    const rolesWithPermission =
                      getRolesWithPermission(permission);
                    return (
                      <tr key={permission} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>
                              {meta.displayName}
                            </div>
                            <div className='text-sm text-gray-500 font-mono'>
                              {permission}
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {meta.category}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='text-sm text-gray-900 max-w-xs'>
                            {meta.description}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              meta.dataScope === 'all'
                                ? 'bg-red-100 text-red-800'
                                : meta.dataScope === 'organization'
                                  ? 'bg-orange-100 text-orange-800'
                                  : meta.dataScope === 'assigned'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : meta.dataScope === 'own'
                                      ? 'bg-green-100 text-green-800'
                                      : meta.dataScope === 'limited'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {meta.dataScope || 'none'}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex flex-wrap gap-1'>
                            {rolesWithPermission.slice(0, 3).map(role => (
                              <span
                                key={role.id}
                                className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'
                              >
                                {role.name}
                              </span>
                            ))}
                            {rolesWithPermission.length > 3 && (
                              <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'>
                                +{rolesWithPermission.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <button
                            onClick={() => setSelectedPermission(permission)}
                            className='text-archer-neon hover:text-archer-black'
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permission Details Modal */}
          {selectedPermission && (
            <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
              <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white'>
                <div className='mt-3'>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    Permission Details
                  </h3>

                  {(() => {
                    const meta = permissionMetadata[selectedPermission];
                    const rolesWithPermission =
                      getRolesWithPermission(selectedPermission);
                    return (
                      <div className='space-y-6'>
                        <div>
                          <h4 className='text-md font-medium text-gray-900 mb-2'>
                            Basic Information
                          </h4>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <label className='block text-sm font-medium text-gray-700'>
                                Display Name
                              </label>
                              <div className='mt-1 text-sm text-gray-900'>
                                {meta.displayName}
                              </div>
                            </div>
                            <div>
                              <label className='block text-sm font-medium text-gray-700'>
                                Permission ID
                              </label>
                              <div className='mt-1 text-sm font-mono text-gray-900'>
                                {selectedPermission}
                              </div>
                            </div>
                            <div>
                              <label className='block text-sm font-medium text-gray-700'>
                                Category
                              </label>
                              <div className='mt-1 text-sm text-gray-900'>
                                {meta.category}
                              </div>
                            </div>
                            <div>
                              <label className='block text-sm font-medium text-gray-700'>
                                Data Scope
                              </label>
                              <div className='mt-1 text-sm text-gray-900'>
                                {meta.dataScope || 'none'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className='text-md font-medium text-gray-900 mb-2'>
                            Description
                          </h4>
                          <p className='text-sm text-gray-700'>
                            {meta.description}
                          </p>
                        </div>

                        {meta.examples && meta.examples.length > 0 && (
                          <div>
                            <h4 className='text-md font-medium text-gray-900 mb-2'>
                              Examples
                            </h4>
                            <ul className='list-disc list-inside text-sm text-gray-700 space-y-1'>
                              {meta.examples.map((example, index) => (
                                <li key={index}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {meta.dependencies && meta.dependencies.length > 0 && (
                          <div>
                            <h4 className='text-md font-medium text-gray-900 mb-2'>
                              Dependencies
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                              {meta.dependencies.map(dep => (
                                <span
                                  key={dep}
                                  className='inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'
                                >
                                  {permissionMetadata[dep]?.displayName || dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {meta.conflicts && meta.conflicts.length > 0 && (
                          <div>
                            <h4 className='text-md font-medium text-gray-900 mb-2'>
                              Conflicts
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                              {meta.conflicts.map(conflict => (
                                <span
                                  key={conflict}
                                  className='inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800'
                                >
                                  {permissionMetadata[conflict]?.displayName ||
                                    conflict}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className='text-md font-medium text-gray-900 mb-2'>
                            Roles with this Permission
                          </h4>
                          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                            {rolesWithPermission.map(role => (
                              <div
                                key={role.id}
                                className='flex items-center space-x-2'
                              >
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    role.isSystemRole
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : 'bg-green-100 text-green-800 border-green-200'
                                  }`}
                                >
                                  {role.isSystemRole ? 'System' : 'Custom'}
                                </span>
                                <span className='text-sm text-gray-900'>
                                  {role.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className='flex justify-end'>
                          <button
                            onClick={() => setSelectedPermission(null)}
                            className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'custom-rules' && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>Custom Rules Management</h1>
            <button
              onClick={handleCreateRule}
              className='px-4 py-2 bg-archer-neon text-white rounded-md hover:bg-archer-black'
            >
              Create New Rule
            </button>
          </div>

          <div className='bg-white rounded-lg border'>
            <div className='p-4 border-b'>
              <input
                type='text'
                placeholder='Search rules by name or description...'
                value={ruleSearchTerm}
                onChange={e => setRuleSearchTerm(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-archer-neon'
              />
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Rule
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Priority
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Conditions
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Executions
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredRules.map(rule => (
                    <tr key={rule.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4'>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {rule.name}
                          </div>
                          <div className='text-sm text-gray-500 max-w-xs truncate'>
                            {rule.description}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rule.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {rule.priority}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {rule.conditions.length} condition
                        {rule.conditions.length !== 1 ? 's' : ''}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {rule.actions.length} action
                        {rule.actions.length !== 1 ? 's' : ''}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {rule.executionCount} times
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <button
                          onClick={() => {
                            setSelectedRule(rule);
                            setEditingRule(rule);
                            setRuleConditions(rule.conditions);
                            setRuleActions(rule.actions);
                          }}
                          className='text-archer-neon hover:text-archer-black mr-3'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleTestRule(rule)}
                          className='text-blue-600 hover:text-blue-900 mr-3'
                        >
                          Test
                        </button>
                        <button className='text-red-600 hover:text-red-900'>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rule Builder Modal */}
          {showRuleBuilder && (
            <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
              <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-6xl shadow-lg rounded-md bg-white'>
                <div className='mt-3'>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    {editingRule?.id ? 'Edit Rule' : 'Create New Rule'}
                  </h3>

                  <div className='space-y-6'>
                    {/* Basic Information */}
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Rule Name
                        </label>
                        <input
                          type='text'
                          value={editingRule?.name || ''}
                          onChange={e =>
                            setEditingRule({
                              ...editingRule,
                              name: e.target.value,
                            })
                          }
                          className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                          placeholder='Enter rule name'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Priority
                        </label>
                        <input
                          type='number'
                          value={editingRule?.priority || 1}
                          onChange={e =>
                            setEditingRule({
                              ...editingRule,
                              priority: parseInt(e.target.value),
                            })
                          }
                          className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                          min='1'
                          max='100'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Description
                      </label>
                      <textarea
                        value={editingRule?.description || ''}
                        onChange={e =>
                          setEditingRule({
                            ...editingRule,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                        placeholder='Describe what this rule does...'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Target Roles
                      </label>
                      <div className='mt-2 space-y-2'>
                        {roleList.map(role => (
                          <label key={role} className='flex items-center'>
                            <PermissionCheckbox
                              checked={
                                editingRule?.targetRoles?.includes(role) ||
                                false
                              }
                              onChange={e => {
                                if (e?.target) {
                                  const currentRoles =
                                    editingRule?.targetRoles || [];
                                  const newRoles = e.target.checked
                                    ? [...currentRoles, role]
                                    : currentRoles.filter(
                                        (r: any) => r !== role
                                      );
                                  setEditingRule({
                                    ...editingRule,
                                    targetRoles: newRoles,
                                  });
                                }
                              }}
                              disabled={
                                editingRole?.isSystemRole &&
                                editingRole?.id === 'super_admin'
                              }
                              className='rounded border-gray-300 text-archer-neon focus:ring-archer-neon'
                            />
                            <span className='ml-2 text-sm text-gray-900'>
                              {role}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Conditions Section */}
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='text-md font-medium text-gray-900'>
                          Conditions (IF)
                        </h4>
                        <button
                          onClick={handleAddCondition}
                          className='px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200'
                        >
                          Add Condition
                        </button>
                      </div>

                      <div className='space-y-3'>
                        {ruleConditions.map((condition, index) => (
                          <div
                            key={index}
                            className='flex items-center space-x-3 p-3 border rounded-md'
                          >
                            <select
                              value={condition.type}
                              onChange={e => {
                                const newConditions = [...ruleConditions];
                                newConditions[index].type = e.target.value;
                                setRuleConditions(newConditions);
                              }}
                              className='border border-gray-300 rounded-md px-3 py-2'
                            >
                              <option value=''>Select condition type</option>
                              {conditionTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>

                            <select
                              value={condition.operator}
                              onChange={e => {
                                const newConditions = [...ruleConditions];
                                newConditions[index].operator = e.target.value;
                                setRuleConditions(newConditions);
                              }}
                              className='border border-gray-300 rounded-md px-3 py-2'
                            >
                              <option value=''>Operator</option>
                              {condition.type &&
                                conditionTypes
                                  .find(t => t.value === condition.type)
                                  ?.operators.map(op => (
                                    <option key={op} value={op}>
                                      {op}
                                    </option>
                                  ))}
                            </select>

                            <input
                              type='text'
                              value={condition.value}
                              onChange={e => {
                                const newConditions = [...ruleConditions];
                                newConditions[index].value = e.target.value;
                                setRuleConditions(newConditions);
                              }}
                              className='border border-gray-300 rounded-md px-3 py-2'
                              placeholder='Value'
                            />

                            <button
                              onClick={() => {
                                setRuleConditions(
                                  ruleConditions.filter((_, i) => i !== index)
                                );
                              }}
                              className='text-red-600 hover:text-red-900'
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='text-md font-medium text-gray-900'>
                          Actions (THEN)
                        </h4>
                        <button
                          onClick={handleAddAction}
                          className='px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200'
                        >
                          Add Action
                        </button>
                      </div>

                      <div className='space-y-3'>
                        {ruleActions.map((action, index) => (
                          <div
                            key={index}
                            className='flex items-center space-x-3 p-3 border rounded-md'
                          >
                            <select
                              value={action.type}
                              onChange={e => {
                                const newActions = [...ruleActions];
                                newActions[index].type = e.target.value;
                                setRuleActions(newActions);
                              }}
                              className='border border-gray-300 rounded-md px-3 py-2'
                            >
                              <option value=''>Select action type</option>
                              {actionTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>

                            {action.type &&
                              actionTypes.find(t => t.value === action.type)
                                ?.requiresValue && (
                                <input
                                  type='text'
                                  value={action.value}
                                  onChange={e => {
                                    const newActions = [...ruleActions];
                                    newActions[index].value = e.target.value;
                                    setRuleActions(newActions);
                                  }}
                                  className='border border-gray-300 rounded-md px-3 py-2'
                                  placeholder='Action value'
                                />
                              )}

                            <button
                              onClick={() => {
                                setRuleActions(
                                  ruleActions.filter((_, i) => i !== index)
                                );
                              }}
                              className='text-red-600 hover:text-red-900'
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rule Preview */}
                    <div className='bg-gray-50 p-4 rounded-md'>
                      <h4 className='text-md font-medium text-gray-900 mb-2'>
                        Rule Preview
                      </h4>
                      <div className='text-sm text-gray-700'>
                        <div className='mb-2'>
                          <strong>IF:</strong>{' '}
                          {ruleConditions.length > 0
                            ? ruleConditions
                                .map(
                                  (c, i) =>
                                    `${i > 0 ? ' AND ' : ''}${conditionTypes.find(t => t.value === c.type)?.label || c.type} ${c.operator} ${c.value}`
                                )
                                .join('')
                            : 'No conditions set'}
                        </div>
                        <div>
                          <strong>THEN:</strong>{' '}
                          {ruleActions.length > 0
                            ? ruleActions
                                .map(
                                  (a, i) =>
                                    `${i > 0 ? ' AND ' : ''}${actionTypes.find(t => t.value === a.type)?.label || a.type} ${a.value || ''}`
                                )
                                .join('')
                            : 'No actions set'}
                        </div>
                      </div>
                    </div>

                    <div className='flex justify-end space-x-3'>
                      <button
                        onClick={() => {
                          setShowRuleBuilder(false);
                          setEditingRule(null);
                          setRuleConditions([]);
                          setRuleActions([]);
                        }}
                        className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveRule}
                        disabled={
                          !editingRule?.name ||
                          ruleConditions.length === 0 ||
                          ruleActions.length === 0
                        }
                        className='px-4 py-2 bg-archer-neon text-white rounded-md hover:bg-archer-black disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        Save Rule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rule Test Modal */}
          {testRuleData && (
            <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
              <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white'>
                <div className='mt-3'>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    Test Rule
                  </h3>

                  <div className='space-y-4'>
                    <div>
                      <h4 className='text-md font-medium text-gray-900 mb-2'>
                        Test Data
                      </h4>
                      <pre className='bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-64'>
                        {JSON.stringify(testRuleData, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h4 className='text-md font-medium text-gray-900 mb-2'>
                        Test Results
                      </h4>
                      <div className='bg-green-50 border border-green-200 rounded-md p-4'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0'>
                            <svg
                              className='h-5 w-5 text-green-400'
                              viewBox='0 0 20 20'
                              fill='currentColor'
                            >
                              <path
                                fillRule='evenodd'
                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                          <div className='ml-3'>
                            <p className='text-sm text-green-800'>
                              Rule would execute successfully with the provided
                              test data.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex justify-end'>
                      <button
                        onClick={() => setTestRuleData(null)}
                        className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit-log' && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>Audit Log</h1>
            <div className='flex items-center space-x-4'>
              <label className='flex items-center'>
                <PermissionCheckbox
                  checked={isRealTime}
                  onChange={e => {
                    if (e?.target) {
                      setIsRealTime(e.target.checked);
                    }
                  }}
                  disabled={
                    editingRole?.isSystemRole &&
                    editingRole?.id === 'super_admin'
                  }
                  className='rounded border-gray-300 text-archer-neon focus:ring-archer-neon'
                />
                <span className='ml-2 text-sm text-gray-700'>
                  Real-time updates
                </span>
              </label>
              <button
                onClick={exportLogs}
                className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className='bg-white rounded-lg border'>
            <div className='p-4 border-b'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4'>
                <div className='lg:col-span-2'>
                  <input
                    type='text'
                    placeholder='Search logs by action, user, or details...'
                    value={logSearchTerm}
                    onChange={e => setLogSearchTerm(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-archer-neon'
                  />
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-archer-neon'
                  >
                    {auditCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedSeverity}
                    onChange={e => setSelectedSeverity(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-archer-neon'
                  >
                    {auditSeverities.map(severity => (
                      <option key={severity.value} value={severity.value}>
                        {severity.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type='date'
                    value={dateRange.start}
                    onChange={e =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-archer-neon'
                    placeholder='Start date'
                  />
                </div>
                <div>
                  <input
                    type='date'
                    value={dateRange.end}
                    onChange={e =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-archer-neon'
                    placeholder='End date'
                  />
                </div>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Timestamp
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Action
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      User
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Target
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Category
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Severity
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredLogs.map(log => (
                    <tr key={log.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <span className='text-lg mr-2'>
                            {getActionIcon(log.action)}
                          </span>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>
                              {log.action}
                            </div>
                            {log.details?.reason && (
                              <div className='text-xs text-gray-500 max-w-xs truncate'>
                                {log.details.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {log.userEmail}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {log.userRole || 'System'}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {log.targetUserEmail ? (
                          <div>
                            <div className='text-sm font-medium text-gray-900'>
                              {log.targetUserEmail}
                            </div>
                            <div className='text-xs text-gray-500'>
                              Target User
                            </div>
                          </div>
                        ) : (
                          <span className='text-sm text-gray-500'>-</span>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                          {log.category}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className='text-archer-neon hover:text-archer-black'
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='px-6 py-3 border-t bg-gray-50'>
              <div className='text-sm text-gray-500'>
                Showing {filteredLogs.length} of {auditLogs.length} log entries
              </div>
            </div>
          </div>

          {/* Log Details Modal */}
          {selectedLog && (
            <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
              <div className='relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white'>
                <div className='mt-3'>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    Audit Log Details
                  </h3>

                  <div className='space-y-6'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Timestamp
                        </label>
                        <div className='mt-1 text-sm text-gray-900'>
                          {formatTimestamp(selectedLog.timestamp)}
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Action
                        </label>
                        <div className='mt-1 text-sm text-gray-900'>
                          {selectedLog.action}
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          User
                        </label>
                        <div className='mt-1 text-sm text-gray-900'>
                          {selectedLog.userEmail}
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          User Role
                        </label>
                        <div className='mt-1 text-sm text-gray-900'>
                          {selectedLog.userRole || 'System'}
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Category
                        </label>
                        <div className='mt-1 text-sm text-gray-900'>
                          {selectedLog.category}
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Severity
                        </label>
                        <div className='mt-1 text-sm text-gray-900'>
                          {selectedLog.severity}
                        </div>
                      </div>
                    </div>

                    {selectedLog.targetUserEmail && (
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Target User
                        </label>
                        <div className='mt-1 text-sm text-gray-900'>
                          {selectedLog.targetUserEmail}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Details
                      </label>
                      <div className='mt-1 bg-gray-50 p-4 rounded-md'>
                        <pre className='text-sm text-gray-900 overflow-auto max-h-64'>
                          {JSON.stringify(selectedLog.details, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          IP Address
                        </label>
                        <div className='mt-1 text-sm text-gray-900'>
                          {selectedLog.ipAddress}
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Session ID
                        </label>
                        <div className='mt-1 text-sm text-gray-900'>
                          {selectedLog.sessionId}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        User Agent
                      </label>
                      <div className='mt-1 text-sm text-gray-900 break-all'>
                        {selectedLog.userAgent}
                      </div>
                    </div>

                    <div className='flex justify-end'>
                      <button
                        onClick={() => setSelectedLog(null)}
                        className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsMatrix;
