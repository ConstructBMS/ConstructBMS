import {
  SystemRoles,
  Permissions,
  PermissionResources,
  PermissionActions,
  PermissionCategories,
} from '../types/auth';
import type { User, Role, Permission } from '../types/auth';

// Mock data - will be populated from database
const mockUsers: User[] = [];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    level: SystemRoles.SUPER_ADMIN,
    permissions: Object.values(Permissions).reduce((acc, permission) => {
      acc[permission] = true;
      return acc;
    }, {} as Record<Permissions, boolean>),
    customRules: [],
    isSystemRole: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    userCount: 1,
    priority: 1,
  },
  {
    id: '2',
    name: 'Administrator',
    description: 'Administrative access with limited system permissions',
    level: SystemRoles.ADMIN,
    permissions: Object.values(Permissions).reduce((acc, permission) => {
      acc[permission] = false;
      return acc;
    }, {} as Record<Permissions, boolean>),
    customRules: [],
    isSystemRole: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    userCount: 1,
    priority: 2,
  },
  {
    id: '3',
    name: 'Employee',
    description: 'Standard employee access',
    level: SystemRoles.EMPLOYEE,
    permissions: Object.values(Permissions).reduce((acc, permission) => {
      acc[permission] = false;
      return acc;
    }, {} as Record<Permissions, boolean>),
    customRules: [],
    isSystemRole: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    userCount: 1,
    priority: 3,
  },
];

const mockPermissions: Permission[] = [
  // User management permissions
  {
    id: '1',
    name: Permissions.USERS_VIEW_ALL,
    displayName: 'View All Users',
    description: 'View all users in the system',
    category: PermissionCategories.USER_MANAGEMENT,
    resource: PermissionResources.USERS,
    action: PermissionActions.VIEW,
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: Permissions.USERS_CREATE,
    displayName: 'Create Users',
    description: 'Create new user accounts',
    category: PermissionCategories.USER_MANAGEMENT,
    resource: PermissionResources.USERS,
    action: PermissionActions.CREATE,
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: Permissions.USERS_EDIT,
    displayName: 'Edit Users',
    description: 'Edit user information',
    category: PermissionCategories.USER_MANAGEMENT,
    resource: PermissionResources.USERS,
    action: PermissionActions.EDIT,
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: Permissions.USERS_DELETE,
    displayName: 'Delete Users',
    description: 'Delete user accounts',
    category: PermissionCategories.USER_MANAGEMENT,
    resource: PermissionResources.USERS,
    action: PermissionActions.DELETE,
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Role-permission mappings
const rolePermissions: Record<string, string[]> = {
  [SystemRoles.SUPER_ADMIN]: [
    Permissions.USERS_VIEW_ALL,
    Permissions.USERS_CREATE,
    Permissions.USERS_EDIT,
    Permissions.USERS_DELETE,
    Permissions.ROLES_CREATE,
    Permissions.ROLES_EDIT,
    Permissions.ROLES_DELETE,
    Permissions.PERMISSIONS_CREATE_CUSTOM,
    Permissions.PERMISSIONS_EDIT_CUSTOM,
    Permissions.AUDIT_LOGS_VIEW_ALL,
    Permissions.SECURITY_2FA_MANAGE,
    Permissions.DATA_ACCESS_ALL,
    Permissions.FINANCIALS_VIEW_ALL,
    Permissions.FINANCIALS_EDIT_ALL,
    Permissions.INTEGRATIONS_CONFIGURE,
    Permissions.SYSTEM_FEATURE_FLAGS,
    Permissions.CUSTOM_LOGIC_CREATE,
    Permissions.PROJECTS_VIEW_ALL,
    Permissions.TASKS_CREATE,
    Permissions.TASKS_EDIT,
    Permissions.TASKS_DELETE,
    Permissions.CHAT_VIEW_ALL,
    Permissions.CHAT_SEND_EXTERNAL,
    Permissions.TIME_VIEW_REPORTS,
    Permissions.DASHBOARD_ACCESS_PORTAL,
    Permissions.MESSAGING_SEND_PROJECT,
    Permissions.NOTIFICATIONS_RECEIVE,
    Permissions.E_SIGNING_SIGN,
  ],
  [SystemRoles.ADMIN]: [
    Permissions.USERS_VIEW_ALL,
    Permissions.USERS_CREATE,
    Permissions.USERS_EDIT,
    Permissions.ROLES_ASSIGN_EXISTING,
    Permissions.AUDIT_LOGS_VIEW_SCOPE,
    Permissions.DATA_ACCESS_PROJECT,
    Permissions.FINANCIALS_VIEW_SCOPE,
    Permissions.PROJECTS_VIEW_ALL,
    Permissions.TASKS_CREATE,
    Permissions.TASKS_EDIT,
    Permissions.CHAT_VIEW_PROJECT,
    Permissions.CHAT_SEND_INTERNAL,
    Permissions.TIME_LOG,
    Permissions.DASHBOARD_ACCESS_PORTAL,
    Permissions.NOTIFICATIONS_RECEIVE,
  ],
  [SystemRoles.EMPLOYEE]: [
    Permissions.PROJECTS_VIEW_ASSIGNED,
    Permissions.TASKS_EDIT_OWN,
    Permissions.DATA_ACCESS_PROJECT,
    Permissions.FILES_UPLOAD,
    Permissions.FILES_DOWNLOAD,
    Permissions.CHAT_VIEW_PROJECT,
    Permissions.CHAT_SEND_INTERNAL,
    Permissions.CHAT_MENTION_USERS,
    Permissions.TIME_LOG,
    Permissions.FINANCIALS_VIEW_COSTS,
    Permissions.DASHBOARD_ACCESS_PORTAL,
    Permissions.NOTIFICATIONS_RECEIVE,
  ],
};

// User-role mappings
const userRoles: Record<string, string[]> = {
  '1': [SystemRoles.SUPER_ADMIN], // superadmin@constructbms.com
  '2': [SystemRoles.ADMIN], // admin@constructbms.com
  '3': [SystemRoles.EMPLOYEE], // employee@constructbms.com
};

class AuthService {
  private currentUser: User | null = null;
  private currentUserRoles: Role[] = [];
  private currentUserPermissions: string[] = [];

  async login(
    email: string,
    password: string
  ): Promise<{ permissions: string[], roles: Role[]; user: User; }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // In real app, verify password hash here
    if (password !== 'password') {
      throw new Error('Invalid credentials');
    }

    const userRoleNames = userRoles[user.id] || [];
    const roles = mockRoles.filter(role => userRoleNames.includes(role.name));
    const permissions = this.getPermissionsForRoles(roles);

    this.currentUser = user;
    this.currentUserRoles = roles;
    this.currentUserPermissions = permissions;

    // Store in localStorage for persistence (temporary until we have real backend)
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_roles', JSON.stringify(roles));
    localStorage.setItem('auth_permissions', JSON.stringify(permissions));

    return { user, roles, permissions };
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.currentUserRoles = [];
    this.currentUserPermissions = [];

    // Clear authentication data but keep "Remember Me" data
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_roles');
    localStorage.removeItem('auth_permissions');

    // Note: We don't clear 'remembered_email' and 'remember_me' here
    // as the user might want to stay logged in next time
  }

  async getCurrentUser(): Promise<{
    permissions: string[];
    roles: Role[];
    user: User | null;
  }> {
    // Check localStorage first (for persistence across page reloads)
    const storedUser = localStorage.getItem('auth_user');
    const storedRoles = localStorage.getItem('auth_roles');
    const storedPermissions = localStorage.getItem('auth_permissions');

    if (storedUser && storedRoles && storedPermissions) {
      this.currentUser = JSON.parse(storedUser);
      this.currentUserRoles = JSON.parse(storedRoles);
      this.currentUserPermissions = JSON.parse(storedPermissions);
    }

    return {
      user: this.currentUser,
      roles: this.currentUserRoles,
      permissions: this.currentUserPermissions,
    };
  }

  checkPermission(permission: string): boolean {
    // Check for demo mode permissions in localStorage
    const demoSession = localStorage.getItem('demo_user_session');
    if (demoSession) {
      try {
        const { permissions } = JSON.parse(demoSession);
        if (permissions.includes('*')) {
          return true; // Full access in demo mode
        }
        return permissions.includes(permission);
      } catch (error) {
        console.error('Error parsing demo session:', error);
      }
    }

    return this.currentUserPermissions.includes(permission);
  }

  checkRole(role: string): boolean {
    // Check for demo mode roles in localStorage
    const demoSession = localStorage.getItem('demo_user_session');
    if (demoSession) {
      try {
        const { roles } = JSON.parse(demoSession);
        return roles.some((r: any) => r.name === role);
      } catch (error) {
        console.error('Error parsing demo session:', error);
      }
    }

    return this.currentUserRoles.some(r => r.name === role);
  }

  hasAnyRole(roles: string[]): boolean {
    // Check for demo mode roles in localStorage
    const demoSession = localStorage.getItem('demo_user_session');
    if (demoSession) {
      try {
        const { roles: demoRoles } = JSON.parse(demoSession);
        return demoRoles.some((r: any) => roles.includes(r.name));
      } catch (error) {
        console.error('Error parsing demo session:', error);
      }
    }

    return this.currentUserRoles.some(r => roles.includes(r.name));
  }

  hasAnyPermission(permissions: string[]): boolean {
    // Check for demo mode permissions in localStorage
    const demoSession = localStorage.getItem('demo_user_session');
    if (demoSession) {
      try {
        const { permissions: demoPermissions } = JSON.parse(demoSession);
        if (demoPermissions.includes('*')) {
          return true; // Full access in demo mode
        }
        return permissions.some(p => demoPermissions.includes(p));
      } catch (error) {
        console.error('Error parsing demo session:', error);
      }
    }

    return permissions.some(p => this.currentUserPermissions.includes(p));
  }

  private getPermissionsForRoles(roles: Role[]): string[] {
    const permissions: string[] = [];

    roles.forEach(role => {
      const rolePerms = rolePermissions[role.name] || [];
      permissions.push(...rolePerms);
    });

    return [...new Set(permissions)]; // Remove duplicates
  }

  // Admin methods for managing users, roles, permissions
  async getUsers(): Promise<User[]> {
    try {
      // Fetch users from the database
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getRoles(): Promise<Role[]> {
    if (!this.checkPermission(Permissions.ROLES_CREATE)) {
      throw new Error('Insufficient permissions');
    }
    return mockRoles;
  }

  async getPermissions(): Promise<Permission[]> {
    if (!this.checkPermission(Permissions.PERMISSIONS_CREATE_CUSTOM)) {
      throw new Error('Insufficient permissions');
    }
    return mockPermissions;
  }
}

export const authService = new AuthService();
