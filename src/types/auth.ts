// System Roles
export enum SystemRoles {
  ADMIN = 'admin',
  CONTRACTOR = 'contractor',
  CUSTOMER = 'customer',
  EMPLOYEE = 'employee',
  SUPER_ADMIN = 'super_admin'
}

// Permission Categories
export enum PermissionCategories {
  ACCOUNT_PROFILE = 'account_profile',
  COMMUNICATION = 'communication',
  CUSTOM_LOGIC = 'custom_logic',
  DASHBOARD_ACCESS = 'dashboard_access',
  DATA_FILE_MANAGEMENT = 'data_file_management',
  E_SIGNING = 'e_signing',
  FINANCIALS = 'financials',
  INTEGRATIONS = 'integrations',
  MESSAGING = 'messaging',
  NOTIFICATIONS = 'notifications',
  PROJECT_ACCESS = 'project_access',
  ROLES_PERMISSIONS = 'roles_permissions',
  SECURITY_COMPLIANCE = 'security_compliance',
  SYSTEM_SETTINGS = 'system_settings',
  TASK_MANAGEMENT = 'task_management',
  TIME_TRACKING = 'time_tracking',
  USER_MANAGEMENT = 'user_management'
}

// Granular Permissions
export enum Permissions {
  // Account & Profile
  // Security & Compliance
  // Communication
  // Custom Logic
  // Dashboard Access
  // Data & File Management
  // E-Signing
  // Integrations
  // Notifications
  // Project Access
  // System Settings
  // Roles & Permissions
  // Task Management
  // Time Tracking
  // Financials
  // Messaging
  // User Management
  ACCOUNT_COMPLETE_PROFILE = 'account.complete_profile',
  ACCOUNT_CREATE = 'account.create',
  AUDIT_LOGS_VIEW_ALL = 'audit_logs.view_all',
  AUDIT_LOGS_VIEW_SCOPE = 'audit_logs.view_scope',
  CHAT_MENTION_USERS = 'chat.mention_users',
  CHAT_SEND_EXTERNAL = 'chat.send_external',
  CHAT_SEND_INTERNAL = 'chat.send_internal',
  CHAT_VIEW_ALL = 'chat.view_all',
  CHAT_VIEW_PROJECT = 'chat.view_project',
  CUSTOM_LOGIC_CREATE = 'custom_logic.create',
  CUSTOM_LOGIC_DELETE = 'custom_logic.delete',
  CUSTOM_LOGIC_EDIT = 'custom_logic.edit',
  DASHBOARD_ACCESS_PORTAL = 'dashboard.access_portal',
  DATA_ACCESS_ALL = 'data.access_all',
  DATA_ACCESS_PROJECT = 'data.access_project',
  E_SIGNING_SIGN = 'e_signing.sign',
  FILES_ASSIGN_PERMISSIONS = 'files.assign_permissions',
  FILES_DOWNLOAD = 'files.download',
  FILES_LOCK_UNLOCK = 'files.lock_unlock',
  FILES_RESTORE_DELETED = 'files.restore_deleted',
  FILES_SHARE_EXTERNAL = 'files.share_external',
  FILES_UPLOAD = 'files.upload',
  FINANCIALS_CREATE_INVOICES = 'financials.create_invoices',
  FINANCIALS_CREATE_QUOTES = 'financials.create_quotes',
  FINANCIALS_EDIT_ALL = 'financials.edit_all',
  FINANCIALS_VIEW_ALL = 'financials.view_all',
  FINANCIALS_VIEW_COSTS = 'financials.view_costs',
  FINANCIALS_VIEW_PAYMENT_STATUS = 'financials.view_payment_status',
  FINANCIALS_VIEW_REPORTS = 'financials.view_reports',
  FINANCIALS_VIEW_SCOPE = 'financials.view_scope',
  INTEGRATIONS_CONFIGURE = 'integrations.configure',
  MESSAGING_SEND_PROJECT = 'messaging.send_project',
  NOTIFICATIONS_RECEIVE = 'notifications.receive',
  PERMISSIONS_CREATE_CUSTOM = 'permissions.create_custom',
  PERMISSIONS_EDIT_CUSTOM = 'permissions.edit_custom',
  PROJECTS_VIEW_ALL = 'projects.view_all',
  PROJECTS_VIEW_ASSIGNED = 'projects.view_assigned',
  PROJECTS_VIEW_OWN = 'projects.view_own',
  ROLES_ASSIGN_EXISTING = 'roles.assign_existing',
  ROLES_CREATE = 'roles.create',
  ROLES_DELETE = 'roles.delete',
  ROLES_EDIT = 'roles.edit',
  SECURITY_2FA_MANAGE = 'security.2fa_manage',
  SECURITY_DATA_RETENTION = 'security.data_retention',
  SECURITY_IP_WHITELIST = 'security.ip_whitelist',
  SECURITY_SESSION_TIMEOUT = 'security.session_timeout',
  SYSTEM_EMAIL_TEMPLATES = 'system.email_templates',
  SYSTEM_FEATURE_FLAGS = 'system.feature_flags',
  SYSTEM_PROJECT_SETTINGS = 'system.project_settings',
  SYSTEM_UI_SETTINGS = 'system.ui_settings',
  TASKS_ASSIGN = 'tasks.assign',
  TASKS_CREATE = 'tasks.create',
  TASKS_DELETE = 'tasks.delete',
  TASKS_EDIT = 'tasks.edit',
  TASKS_EDIT_OWN = 'tasks.edit_own',
  TIME_LOG = 'time.log',
  TIME_VIEW_REPORTS = 'time.view_reports',
  USERS_ASSIGN_ROLES = 'users.assign_roles',
  USERS_CREATE = 'users.create',
  USERS_DELETE = 'users.delete',
  USERS_EDIT = 'users.edit',
  USERS_FORCE_PASSWORD_RESET = 'users.force_password_reset',
  USERS_VIEW_ALL = 'users.view_all',
  USERS_VIEW_SCOPE = 'users.view_scope',
}

// Permission Resource Types
export enum PermissionResources {
  AUDIT = 'audit',
  CHAT = 'chat',
  FILES = 'files',
  FINANCIALS = 'financials',
  INTEGRATIONS = 'integrations',
  NOTIFICATIONS = 'notifications',
  PERMISSIONS = 'permissions',
  PROJECTS = 'projects',
  ROLES = 'roles',
  SECURITY = 'security',
  SYSTEM = 'system',
  TASKS = 'tasks',
  TIME = 'time',
  USERS = 'users'
}

// Permission Actions
export enum PermissionActions {
  ASSIGN = 'assign',
  CONFIGURE = 'configure',
  CREATE = 'create',
  DELETE = 'delete',
  EDIT = 'edit',
  LOG = 'log',
  MANAGE = 'manage',
  SIGN = 'sign',
  VIEW = 'view'
}

// Custom Rule Condition Types
export type CustomRuleOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in';

export type CustomRuleField =
  | 'user_role'
  | 'user_specific'
  | 'project'
  | 'tag'
  | 'file_type'
  | 'date_time'
  | 'financial_threshold'
  | 'workflow_status';

export interface CustomRuleCondition {
  field: CustomRuleField;
  id: string;
  logicalOperator?: 'AND' | 'OR';
  operator: CustomRuleOperator;
  type: string;
  value: any;
}

// Custom Rule Action Types
export type CustomRuleActionType =
  | 'grant_permission'
  | 'revoke_permission'
  | 'show_ui'
  | 'hide_ui'
  | 'send_notification'
  | 'log_action'
  | 'execute_webhook'
  | 'lock_data'
  | 'unlock_data';

export interface CustomRuleAction {
  id: string;
  parameters?: Record<string, any>;
  target: string;
  type: CustomRuleActionType;
  value: any;
}

// Custom Rule
export interface CustomRule {
  actions: CustomRuleAction[];
  conditions: CustomRuleCondition[];
  createdAt: string;
  createdBy: string;
  description: string;
  id: string;
  isActive: boolean;
  name: string;
  priority: number;
  updatedAt: string;
}

// Permission Matrix Entry
export interface PermissionMatrixEntry {
  category: PermissionCategories;
  conditions?: CustomRuleCondition[];
  granted: boolean;
  notes?: string;
  permission: Permissions;
  role: SystemRoles;
}

// User Interface
export interface User {
  // Array of custom rule IDs
  address?: string;
  assignedProjects?: string[];
  assignedTasks?: string[];
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string; 
  customPermissions: Record<string, boolean>;
  customRules: string[];
  dateOfBirth?: string;
  department?: string;
  email: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  firstName: string;
  id: string;
  ipWhitelist?: string[];
  isActive: boolean;
  jobTitle?: string;
  lastLogin?: string;
  lastName: string;
  location?: string;
  organizationId: string;
  phone?: string;
  profileCompleted: boolean;
  role: SystemRoles;
  sessionTimeout?: number;
  twoFactorEnabled: boolean;
  updatedAt: string;
}

// Auth Context Type
export interface AuthContextType {
  checkPermission: (permission: string) => boolean;
  checkRole: (role: string) => boolean;
  hasAnyPermission: (permissionList: string[]) => boolean;
  hasAnyRole: (roleList: string[]) => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  permissions: string[];
  resetPassword: (email: string) => Promise<void>;
  roles: Role[];
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  user: User | null;
}

// Role Interface
export interface Role {
  createdAt: string;
  createdBy: string;
  customRules: string[];
  description: string;
  id: string;
  isActive: boolean; // Array of custom rule IDs
  isSystemRole: boolean;
  level: SystemRoles;
  name: string;
  organizationId: string;
  permissions: Record<Permissions, boolean>;
  priority: number;
  updatedAt: string;
  userCount: number;
}

// Permission Interface
export interface Permission {
  // Which UI elements this permission affects
  action: PermissionActions;
  category: PermissionCategories;
  conflicts?: Permissions[];
  createdAt: string;
  dataScope?: 'all' | 'organization' | 'project' | 'own' | 'assigned';
  dependencies?: Permissions[];
  description: string;
  displayName: string;
  id: string;
  isActive: boolean;
  isSystemPermission: boolean;
  name: Permissions;
  organizationId: string;
  resource: PermissionResources;
  uiElements?: string[]; 
  updatedAt: string;
}

// File/Folder Permission
export interface FilePermission {
  createdAt: string;
  customRules: string[];
    delete: boolean;
    download: boolean;
  fileId: string;
  folderId?: string;
  id: string;
  isLocked: boolean;
  lockReason?: string;
  lockedAt?: string;
  lockedBy?: string;
  permissions: {
    read: boolean;
    share: boolean;
    write: boolean;
};
  roleId?: string;
  updatedAt: string;
  userId?: string;
}

// Audit Log Entry
export interface AuditLogEntry {
  action: string;
  details: Record<string, any>;
  id: string;
  ipAddress?: string;
  organizationId: string;
  projectId?: string;
  resource: string;
  resourceId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userAgent?: string;
  userEmail: string;
  userId: string;
  userRole: SystemRoles;
}

// Permission Check Result
export interface PermissionCheckResult {
  customRules?: CustomRule[];
  dataScope?: 'all' | 'organization' | 'project' | 'own' | 'assigned';
  granted: boolean;
  reason?: string;
  restrictions?: string[];
}

// Role Template for easy role creation
export interface RoleTemplate {
  customRules?: CustomRule[];
  dataScopes?: Record<'all' | 'organization' | 'project' | 'own' | 'assigned', boolean>;
  description: string;
  level: SystemRoles;
  name: string;
  permissions: Permissions[];
  resources?: PermissionResources[];
  uiElements?: string[];
}
