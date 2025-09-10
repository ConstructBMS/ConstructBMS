/**
 * Enterprise-Grade Permissions System Types
 * 
 * This file defines the comprehensive types for a fully customizable,
 * granular permissions system with custom roles, logic-based rules,
 * and enterprise-level access control.
 */

// ============================================================================
// CORE PERMISSION TYPES
// ============================================================================

export type PermissionAction = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'view' | 'edit' | 'manage' | 'admin'
  | 'approve' | 'reject' | 'publish' | 'archive'
  | 'download' | 'upload' | 'share' | 'export'
  | 'import' | 'backup' | 'restore' | 'audit';

export type PermissionResource = 
  | 'users' | 'roles' | 'permissions' | 'organizations'
  | 'projects' | 'contacts' | 'documents' | 'files'
  | 'estimates' | 'invoices' | 'purchase_orders' | 'workflows'
  | 'settings' | 'reports' | 'analytics' | 'integrations'
  | 'notifications' | 'audit_logs' | 'backups' | 'system';

export type PermissionScope = 'global' | 'organization' | 'project' | 'user' | 'resource';

export type PermissionCondition = 
  | 'equals' | 'not_equals' | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than'
  | 'in' | 'not_in' | 'is_null' | 'is_not_null'
  | 'regex' | 'date_range' | 'time_range';

// ============================================================================
// PERMISSION RULE TYPES
// ============================================================================

export interface PermissionRule {
  id: string;
  name: string;
  description?: string;
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
  scopeId?: string;
  conditions?: PermissionCondition[];
  logic?: PermissionLogic;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PermissionLogic {
  type: 'simple' | 'complex' | 'conditional' | 'script';
  expression?: string; // For complex logic expressions
  conditions?: LogicCondition[];
  script?: string; // For custom JavaScript logic
}

export interface LogicCondition {
  id: string;
  field: string;
  operator: PermissionCondition;
  value: any;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
}

// ============================================================================
// ROLE TYPES
// ============================================================================

export interface CustomRole {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  icon?: string;
  isSystem: boolean;
  isActive: boolean;
  permissions: RolePermission[];
  inheritance?: string[]; // Role IDs this role inherits from
  restrictions?: RoleRestriction[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RolePermission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
  scopeId?: string;
  conditions?: PermissionCondition[];
  granted: boolean;
  priority: number;
}

export interface RoleRestriction {
  id: string;
  type: 'time_based' | 'ip_based' | 'device_based' | 'location_based' | 'custom';
  name: string;
  description?: string;
  conditions: LogicCondition[];
  enabled: boolean;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface EnterpriseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  primaryRole: string; // Role ID
  additionalRoles: string[]; // Additional role IDs
  customPermissions: UserCustomPermission[];
  restrictions: UserRestriction[];
  metadata?: Record<string, any>;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface UserCustomPermission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
  scopeId?: string;
  granted: boolean;
  expiresAt?: string;
  reason?: string;
  grantedBy: string;
  grantedAt: string;
}

export interface UserRestriction {
  id: string;
  type: 'time_based' | 'ip_based' | 'device_based' | 'location_based' | 'custom';
  name: string;
  description?: string;
  conditions: LogicCondition[];
  enabled: boolean;
  expiresAt?: string;
}

// ============================================================================
// GRANULAR RESOURCE PERMISSIONS
// ============================================================================

export interface ResourcePermission {
  id: string;
  resourceId: string;
  resourceType: PermissionResource;
  permissions: ResourceAccessPermission[];
  inheritsFrom?: string; // Parent resource ID
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceAccessPermission {
  id: string;
  userId?: string;
  roleId?: string;
  action: PermissionAction;
  granted: boolean;
  conditions?: PermissionCondition[];
  expiresAt?: string;
  grantedBy: string;
  grantedAt: string;
}

// ============================================================================
// FILE/FOLDER SPECIFIC PERMISSIONS
// ============================================================================

export interface FilePermission {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  permissions: FileAccessPermission[];
  folderPermissions?: FolderPermission[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FileAccessPermission {
  id: string;
  userId?: string;
  roleId?: string;
  action: FileAction;
  granted: boolean;
  conditions?: FileCondition[];
  expiresAt?: string;
  grantedBy: string;
  grantedAt: string;
}

export interface FolderPermission {
  id: string;
  folderId: string;
  folderName: string;
  folderPath: string;
  permissions: FolderAccessPermission[];
  subfolderInheritance: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FolderAccessPermission {
  id: string;
  userId?: string;
  roleId?: string;
  action: FileAction;
  granted: boolean;
  conditions?: FileCondition[];
  expiresAt?: string;
  grantedBy: string;
  grantedAt: string;
}

export type FileAction = 
  | 'view' | 'download' | 'upload' | 'edit' | 'delete'
  | 'share' | 'move' | 'copy' | 'rename' | 'archive'
  | 'restore' | 'version_control' | 'comment' | 'approve';

export interface FileCondition {
  id: string;
  field: 'file_type' | 'file_size' | 'file_name' | 'file_path' | 'created_date' | 'modified_date' | 'owner' | 'tags';
  operator: PermissionCondition;
  value: any;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
}

// ============================================================================
// PERMISSION EVALUATION TYPES
// ============================================================================

export interface PermissionEvaluation {
  id: string;
  userId: string;
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
  scopeId?: string;
  context?: PermissionContext;
  result: PermissionResult;
  matchedRules: string[];
  evaluationTime: number;
  evaluatedAt: string;
}

export interface PermissionContext {
  userId: string;
  userRoles: string[];
  userAttributes: Record<string, any>;
  resourceAttributes: Record<string, any>;
  environmentAttributes: Record<string, any>;
  scope: PermissionScope;
  scopeId?: string;
  timestamp: string;
}

export interface PermissionResult {
  granted: boolean;
  reason: string;
  restrictions?: string[];
  expiresAt?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// PERMISSION MATRIX TYPES
// ============================================================================

export interface PermissionMatrix {
  id: string;
  name: string;
  description?: string;
  resources: PermissionMatrixResource[];
  roles: PermissionMatrixRole[];
  permissions: PermissionMatrixEntry[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PermissionMatrixResource {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  actions: PermissionAction[];
  subResources?: PermissionMatrixResource[];
}

export interface PermissionMatrixRole {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  icon?: string;
  isSystem: boolean;
}

export interface PermissionMatrixEntry {
  id: string;
  roleId: string;
  resourceId: string;
  action: PermissionAction;
  granted: boolean;
  conditions?: PermissionCondition[];
  priority: number;
}

// ============================================================================
// AUDIT AND LOGGING TYPES
// ============================================================================

export interface PermissionAuditLog {
  id: string;
  userId: string;
  action: 'grant' | 'revoke' | 'modify' | 'create' | 'delete';
  resource: PermissionResource;
  resourceId?: string;
  targetUserId?: string;
  targetRoleId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface PermissionChangeLog {
  id: string;
  entityType: 'role' | 'permission' | 'user' | 'resource';
  entityId: string;
  changeType: 'create' | 'update' | 'delete';
  changes: Record<string, { old: any; new: any }>;
  changedBy: string;
  reason?: string;
  timestamp: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PermissionApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateRoleForm {
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  icon?: string;
  permissions: RolePermission[];
  inheritance?: string[];
  restrictions?: RoleRestriction[];
}

export interface CreateUserForm {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  primaryRole: string;
  additionalRoles: string[];
  customPermissions: UserCustomPermission[];
  restrictions: UserRestriction[];
}

export interface PermissionRuleForm {
  name: string;
  description?: string;
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
  scopeId?: string;
  conditions?: PermissionCondition[];
  logic?: PermissionLogic;
  priority: number;
  enabled: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type PermissionStatus = 'granted' | 'denied' | 'conditional' | 'expired' | 'restricted';

export interface PermissionSummary {
  totalPermissions: number;
  grantedPermissions: number;
  deniedPermissions: number;
  conditionalPermissions: number;
  expiredPermissions: number;
  restrictedPermissions: number;
}

export interface RoleSummary {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
  usersWithRoles: number;
}

export interface UserSummary {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  usersWithCustomPermissions: number;
  usersWithRestrictions: number;
}
