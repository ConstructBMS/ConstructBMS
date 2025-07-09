// System Roles
export enum SystemRoles {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  CONTRACTOR = 'contractor',
  CUSTOMER = 'customer',
}

// Permission Categories
export enum PermissionCategories {
  USER_MANAGEMENT = 'user_management',
  ROLES_PERMISSIONS = 'roles_permissions',
  SECURITY_COMPLIANCE = 'security_compliance',
  DATA_FILE_MANAGEMENT = 'data_file_management',
  FINANCIALS = 'financials',
  INTEGRATIONS = 'integrations',
  SYSTEM_SETTINGS = 'system_settings',
  CUSTOM_LOGIC = 'custom_logic',
  PROJECT_ACCESS = 'project_access',
  TASK_MANAGEMENT = 'task_management',
  COMMUNICATION = 'communication',
  TIME_TRACKING = 'time_tracking',
  ACCOUNT_PROFILE = 'account_profile',
  DASHBOARD_ACCESS = 'dashboard_access',
  MESSAGING = 'messaging',
  NOTIFICATIONS = 'notifications',
  E_SIGNING = 'e_signing',
}

// Granular Permissions
export enum Permissions {
  // User Management
  USERS_VIEW_ALL = 'users.view_all',
  USERS_VIEW_SCOPE = 'users.view_scope',
  USERS_CREATE = 'users.create',
  USERS_EDIT = 'users.edit',
  USERS_DELETE = 'users.delete',
  USERS_ASSIGN_ROLES = 'users.assign_roles',
  USERS_FORCE_PASSWORD_RESET = 'users.force_password_reset',

  // Roles & Permissions
  ROLES_CREATE = 'roles.create',
  ROLES_EDIT = 'roles.edit',
  ROLES_DELETE = 'roles.delete',
  ROLES_ASSIGN_EXISTING = 'roles.assign_existing',
  PERMISSIONS_CREATE_CUSTOM = 'permissions.create_custom',
  PERMISSIONS_EDIT_CUSTOM = 'permissions.edit_custom',

  // Security & Compliance
  AUDIT_LOGS_VIEW_ALL = 'audit_logs.view_all',
  AUDIT_LOGS_VIEW_SCOPE = 'audit_logs.view_scope',
  SECURITY_2FA_MANAGE = 'security.2fa_manage',
  SECURITY_IP_WHITELIST = 'security.ip_whitelist',
  SECURITY_SESSION_TIMEOUT = 'security.session_timeout',
  SECURITY_DATA_RETENTION = 'security.data_retention',

  // Data & File Management
  DATA_ACCESS_ALL = 'data.access_all',
  DATA_ACCESS_PROJECT = 'data.access_project',
  FILES_LOCK_UNLOCK = 'files.lock_unlock',
  FILES_ASSIGN_PERMISSIONS = 'files.assign_permissions',
  FILES_RESTORE_DELETED = 'files.restore_deleted',
  FILES_UPLOAD = 'files.upload',
  FILES_DOWNLOAD = 'files.download',
  FILES_SHARE_EXTERNAL = 'files.share_external',

  // Financials
  FINANCIALS_VIEW_ALL = 'financials.view_all',
  FINANCIALS_VIEW_SCOPE = 'financials.view_scope',
  FINANCIALS_EDIT_ALL = 'financials.edit_all',
  FINANCIALS_CREATE_QUOTES = 'financials.create_quotes',
  FINANCIALS_CREATE_INVOICES = 'financials.create_invoices',
  FINANCIALS_VIEW_REPORTS = 'financials.view_reports',
  FINANCIALS_VIEW_COSTS = 'financials.view_costs',
  FINANCIALS_VIEW_PAYMENT_STATUS = 'financials.view_payment_status',

  // Integrations
  INTEGRATIONS_CONFIGURE = 'integrations.configure',

  // System Settings
  SYSTEM_FEATURE_FLAGS = 'system.feature_flags',
  SYSTEM_UI_SETTINGS = 'system.ui_settings',
  SYSTEM_EMAIL_TEMPLATES = 'system.email_templates',
  SYSTEM_PROJECT_SETTINGS = 'system.project_settings',

  // Custom Logic
  CUSTOM_LOGIC_CREATE = 'custom_logic.create',
  CUSTOM_LOGIC_EDIT = 'custom_logic.edit',
  CUSTOM_LOGIC_DELETE = 'custom_logic.delete',

  // Project Access
  PROJECTS_VIEW_ALL = 'projects.view_all',
  PROJECTS_VIEW_ASSIGNED = 'projects.view_assigned',
  PROJECTS_VIEW_OWN = 'projects.view_own',

  // Task Management
  TASKS_CREATE = 'tasks.create',
  TASKS_EDIT = 'tasks.edit',
  TASKS_DELETE = 'tasks.delete',
  TASKS_ASSIGN = 'tasks.assign',
  TASKS_EDIT_OWN = 'tasks.edit_own',

  // Communication
  CHAT_VIEW_ALL = 'chat.view_all',
  CHAT_VIEW_PROJECT = 'chat.view_project',
  CHAT_SEND_INTERNAL = 'chat.send_internal',
  CHAT_SEND_EXTERNAL = 'chat.send_external',
  CHAT_MENTION_USERS = 'chat.mention_users',

  // Time Tracking
  TIME_LOG = 'time.log',
  TIME_VIEW_REPORTS = 'time.view_reports',

  // Account & Profile
  ACCOUNT_CREATE = 'account.create',
  ACCOUNT_COMPLETE_PROFILE = 'account.complete_profile',

  // Dashboard Access
  DASHBOARD_ACCESS_PORTAL = 'dashboard.access_portal',

  // Messaging
  MESSAGING_SEND_PROJECT = 'messaging.send_project',

  // Notifications
  NOTIFICATIONS_RECEIVE = 'notifications.receive',

  // E-Signing
  E_SIGNING_SIGN = 'e_signing.sign',
}

// Permission Resource Types
export enum PermissionResources {
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  PROJECTS = 'projects',
  TASKS = 'tasks',
  FILES = 'files',
  FINANCIALS = 'financials',
  CHAT = 'chat',
  SYSTEM = 'system',
  AUDIT = 'audit',
  SECURITY = 'security',
  INTEGRATIONS = 'integrations',
  TIME = 'time',
  NOTIFICATIONS = 'notifications',
}

// Permission Actions
export enum PermissionActions {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  ASSIGN = 'assign',
  MANAGE = 'manage',
  CONFIGURE = 'configure',
  SIGN = 'sign',
  LOG = 'log',
}

// Custom Rule Conditions
export interface CustomRuleCondition {
  id: string;
  type:
    | 'user_role'
    | 'user_specific'
    | 'project'
    | 'tag'
    | 'file_type'
    | 'date_time'
    | 'financial_threshold'
    | 'workflow_status';
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

// Custom Rule Actions
export interface CustomRuleAction {
  id: string;
  type:
    | 'grant_permission'
    | 'revoke_permission'
    | 'show_ui'
    | 'hide_ui'
    | 'send_notification'
    | 'log_action'
    | 'execute_webhook'
    | 'lock_data'
    | 'unlock_data';
  target: string;
  value: any;
  parameters?: Record<string, any>;
}

// Custom Rule
export interface CustomRule {
  id: string;
  name: string;
  description: string;
  conditions: CustomRuleCondition[];
  actions: CustomRuleAction[];
  isActive: boolean;
  priority: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Permission Matrix Entry
export interface PermissionMatrixEntry {
  role: SystemRoles;
  category: PermissionCategories;
  permission: Permissions;
  granted: boolean;
  conditions?: CustomRuleCondition[];
  notes?: string;
}

// User Interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: SystemRoles;
  customPermissions: Record<string, boolean>;
  customRules: string[]; // Array of custom rule IDs
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  assignedProjects?: string[];
  assignedTasks?: string[];
  profileCompleted: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout?: number;
  ipWhitelist?: string[];
  avatarUrl?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  avatar?: string;
}

// Auth Context Type
export interface AuthContextType {
  user: User | null;
  roles: Role[];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkPermission: (permission: string) => boolean;
  checkRole: (role: string) => boolean;
  hasAnyRole: (roleList: string[]) => boolean;
  hasAnyPermission: (permissionList: string[]) => boolean;
}

// Role Interface
export interface Role {
  id: string;
  name: string;
  description: string;
  level: SystemRoles;
  permissions: Record<Permissions, boolean>;
  customRules: string[]; // Array of custom rule IDs
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  createdBy: string;
  userCount: number;
  priority: number;
}

// Permission Interface
export interface Permission {
  id: string;
  name: Permissions;
  displayName: string;
  description: string;
  category: PermissionCategories;
  resource: PermissionResources;
  action: PermissionActions;
  isSystemPermission: boolean;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  dependencies?: Permissions[];
  conflicts?: Permissions[];
  uiElements?: string[]; // Which UI elements this permission affects
  dataScope?: 'all' | 'organization' | 'project' | 'own' | 'assigned';
}

// File/Folder Permission
export interface FilePermission {
  id: string;
  fileId: string;
  folderId?: string;
  userId?: string;
  roleId?: string;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    share: boolean;
    download: boolean;
  };
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  customRules: string[];
  createdAt: string;
  updatedAt: string;
}

// Audit Log Entry
export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  userRole: SystemRoles;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  organizationId: string;
  projectId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Permission Check Result
export interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
  customRules?: CustomRule[];
  dataScope?: 'all' | 'organization' | 'project' | 'own' | 'assigned';
  restrictions?: string[];
}

// Role Template for easy role creation
export interface RoleTemplate {
  name: string;
  description: string;
  level: SystemRoles;
  permissions: Permissions[];
  customRules?: CustomRule[];
  uiElements?: string[];
  dataScopes?: Record<
    PermissionResources,
    'all' | 'organization' | 'project' | 'own' | 'assigned'
  >;
}
