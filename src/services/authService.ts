import {
  User,
  Role,
  Permission,
  SystemRoles,
  Permissions,
} from '../types/auth';

// Mock data - in real app this would come from database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'superadmin@archer.com',
    firstName: 'Super',
    lastName: 'Admin',
    organizationId: '1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'admin@archer.com',
    firstName: 'Admin',
    lastName: 'User',
    organizationId: '1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'employee@archer.com',
    firstName: 'Employee',
    lastName: 'User',
    organizationId: '1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: SystemRoles.SUPER_ADMIN,
    description: 'Full system access with all permissions',
    isSystemRole: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: SystemRoles.ADMIN,
    description: 'Administrative access with limited system permissions',
    isSystemRole: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: SystemRoles.EMPLOYEE,
    description: 'Standard employee access',
    isSystemRole: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockPermissions: Permission[] = [
  // Menu permissions
  {
    id: '1',
    name: Permissions.MENU_VIEW,
    description: 'View menu items',
    resource: 'menu',
    action: 'read',
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: Permissions.MENU_EDIT,
    description: 'Edit menu structure',
    resource: 'menu',
    action: 'update',
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: Permissions.MENU_CREATE,
    description: 'Create new menu items',
    resource: 'menu',
    action: 'create',
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: Permissions.MENU_DELETE,
    description: 'Delete menu items',
    resource: 'menu',
    action: 'delete',
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: Permissions.MENU_RESET,
    description: 'Reset menu to default',
    resource: 'menu',
    action: 'reset',
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // User management permissions
  {
    id: '6',
    name: Permissions.USERS_VIEW,
    description: 'View users',
    resource: 'users',
    action: 'read',
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: Permissions.USERS_CREATE,
    description: 'Create users',
    resource: 'users',
    action: 'create',
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    name: Permissions.USERS_EDIT,
    description: 'Edit users',
    resource: 'users',
    action: 'update',
    isSystemPermission: true,
    isActive: true,
    organizationId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '9',
    name: Permissions.USERS_DELETE,
    description: 'Delete users',
    resource: 'users',
    action: 'delete',
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
    Permissions.MENU_VIEW,
    Permissions.MENU_EDIT,
    Permissions.MENU_CREATE,
    Permissions.MENU_DELETE,
    Permissions.MENU_RESET,
    Permissions.USERS_VIEW,
    Permissions.USERS_CREATE,
    Permissions.USERS_EDIT,
    Permissions.USERS_DELETE,
    Permissions.ROLES_VIEW,
    Permissions.ROLES_CREATE,
    Permissions.ROLES_EDIT,
    Permissions.ROLES_DELETE,
    Permissions.PERMISSIONS_VIEW,
    Permissions.PERMISSIONS_CREATE,
    Permissions.PERMISSIONS_EDIT,
    Permissions.PERMISSIONS_DELETE,
    Permissions.DASHBOARD_VIEW,
    Permissions.SETTINGS_VIEW,
    Permissions.SETTINGS_EDIT,
  ],
  [SystemRoles.ADMIN]: [
    Permissions.MENU_VIEW,
    Permissions.MENU_EDIT,
    Permissions.MENU_CREATE,
    Permissions.MENU_DELETE,
    Permissions.USERS_VIEW,
    Permissions.USERS_CREATE,
    Permissions.USERS_EDIT,
    Permissions.DASHBOARD_VIEW,
    Permissions.SETTINGS_VIEW,
    Permissions.SETTINGS_EDIT,
  ],
  [SystemRoles.EMPLOYEE]: [
    Permissions.MENU_VIEW,
    Permissions.DASHBOARD_VIEW,
    Permissions.SETTINGS_VIEW,
  ],
};

// User-role mappings
const userRoles: Record<string, string[]> = {
  '1': [SystemRoles.SUPER_ADMIN], // superadmin@archer.com
  '2': [SystemRoles.ADMIN], // admin@archer.com
  '3': [SystemRoles.EMPLOYEE], // employee@archer.com
};

class AuthService {
  private currentUser: User | null = null;
  private currentUserRoles: Role[] = [];
  private currentUserPermissions: string[] = [];

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; roles: Role[]; permissions: string[] }> {
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
    user: User | null;
    roles: Role[];
    permissions: string[];
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
    if (!this.checkPermission(Permissions.USERS_VIEW)) {
      throw new Error('Insufficient permissions');
    }
    return mockUsers;
  }

  async getRoles(): Promise<Role[]> {
    if (!this.checkPermission(Permissions.ROLES_VIEW)) {
      throw new Error('Insufficient permissions');
    }
    return mockRoles;
  }

  async getPermissions(): Promise<Permission[]> {
    if (!this.checkPermission(Permissions.PERMISSIONS_VIEW)) {
      throw new Error('Insufficient permissions');
    }
    return mockPermissions;
  }
}

export const authService = new AuthService();
