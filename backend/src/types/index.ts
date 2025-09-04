export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
}

export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_ROLE_ASSIGN = 'user:role:assign',

  // Role Management
  ROLE_CREATE = 'role:create',
  ROLE_READ = 'role:read',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',
  ROLE_PERMISSION_ASSIGN = 'role:permission:assign',

  // Project Management
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_ASSIGN = 'project:assign',

  // Client Management
  CLIENT_CREATE = 'client:create',
  CLIENT_READ = 'client:read',
  CLIENT_UPDATE = 'client:update',
  CLIENT_DELETE = 'client:delete',

  // Task Management
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  TASK_ASSIGN = 'task:assign',

  // Module Management
  MODULE_CREATE = 'module:create',
  MODULE_READ = 'module:read',
  MODULE_UPDATE = 'module:update',
  MODULE_DELETE = 'module:delete',
  MODULE_ASSIGN = 'module:assign',

  // System Settings
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  SETTINGS_DELETE = 'settings:delete',

  // Reports & Analytics
  REPORTS_READ = 'reports:read',
  REPORTS_CREATE = 'reports:create',
  REPORTS_EXPORT = 'reports:export',

  // Override Permissions (Super Admin Only)
  OVERRIDE_ALL = 'override:all',
  OVERRIDE_USER_PERMISSIONS = 'override:user:permissions',
  OVERRIDE_ROLE_PERMISSIONS = 'override:role:permissions',
  OVERRIDE_SYSTEM_SETTINGS = 'override:system:settings',
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissions {
  userId: string;
  roleId: string;
  permissions: Permission[];
  overrides: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface PermissionMatrix {
  roles: Role[];
  permissions: Permission[];
  matrix: Record<string, Record<string, boolean>>;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  icon: string;
  route: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  isActive?: boolean;
  moduleId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  clientId: string;
  startDate: string;
  endDate?: string;
  budget: number;
  createdAt: string;
  updatedAt: string;
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contractor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  specialties: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Consultant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  expertise: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  projectId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  tags: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export enum DocumentType {
  CONTRACT = 'contract',
  PROPOSAL = 'proposal',
  INVOICE = 'invoice',
  REPORT = 'report',
  MANUAL = 'manual',
  OTHER = 'other',
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  clientId: string;
  startDate: string;
  endDate?: string;
  budget: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId?: string;
  projectId?: string;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  projectId?: string;
  dueDate?: string;
}
