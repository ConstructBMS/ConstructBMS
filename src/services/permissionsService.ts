import { supabase } from './supabase';

export type UserRole = 'viewer' | 'project_manager' | 'admin' | 'super_admin';
export type Permission =
  | 'view_projects'
  | 'edit_projects'
  | 'delete_projects'
  | 'create_projects'
  | 'view_tasks'
  | 'edit_tasks'
  | 'delete_tasks'
  | 'create_tasks'
  | 'view_links'
  | 'edit_links'
  | 'delete_links'
  | 'create_links'
  | 'view_resources'
  | 'edit_resources'
  | 'delete_resources'
  | 'create_resources'
  | 'view_reports'
  | 'export_data'
  | 'import_data'
  | 'manage_users'
  | 'manage_roles'
  | 'view_analytics'
  | 'edit_analytics'
  | 'view_settings'
  | 'edit_settings'
  | 'view_activity_log'
  | 'delete_activity_log'
  | 'programme.structure.view'
  | 'programme.structure.edit'
  | 'programme.structure.toggle'
  | 'programme.barstyles.view'
  | 'programme.barstyles.manage'
  | 'programme.constraints.view'
  | 'programme.constraints.assign';

export interface PermissionMatrix {
  [role: string]: {
    [permission: string]: boolean;
  };
}

export interface UserPermissions {
  permissions: Permission[];
  projectPermissions?: {
    [projectId: string]: Permission[];
  };
  role: UserRole;
  userId: string;
}

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
  requiredRole?: UserRole;
}

// Default permission matrix
const DEFAULT_PERMISSION_MATRIX: PermissionMatrix = {
  viewer: {
    view_projects: true,
    edit_projects: false,
    delete_projects: false,
    create_projects: false,
    view_tasks: true,
    edit_tasks: false,
    delete_tasks: false,
    create_tasks: false,
    view_links: true,
    edit_links: false,
    delete_links: false,
    create_links: false,
    view_resources: true,
    edit_resources: false,
    delete_resources: false,
    create_resources: false,
    view_reports: true,
    export_data: false,
    import_data: false,
    manage_users: false,
    manage_roles: false,
    view_analytics: true,
    edit_analytics: false,
    view_settings: false,
    edit_settings: false,
    view_activity_log: true,
    delete_activity_log: false,
    'programme.structure.view': true,
    'programme.structure.edit': false,
    'programme.structure.toggle': false,
    'programme.barstyles.view': false,
    'programme.barstyles.manage': false,
    'programme.constraints.view': false,
    'programme.constraints.assign': false,
  },
  project_manager: {
    view_projects: true,
    edit_projects: true,
    delete_projects: false,
    create_projects: true,
    view_tasks: true,
    edit_tasks: true,
    delete_tasks: true,
    create_tasks: true,
    view_links: true,
    edit_links: true,
    delete_links: true,
    create_links: true,
    view_resources: true,
    edit_resources: true,
    delete_resources: false,
    create_resources: true,
    view_reports: true,
    export_data: true,
    import_data: true,
    manage_users: false,
    manage_roles: false,
    view_analytics: true,
    edit_analytics: true,
    view_settings: true,
    edit_settings: true,
    view_activity_log: true,
    delete_activity_log: false,
    'programme.structure.view': true,
    'programme.structure.edit': true,
    'programme.structure.toggle': true,
    'programme.barstyles.view': true,
    'programme.barstyles.manage': true,
    'programme.constraints.view': true,
    'programme.constraints.assign': true,
    create_resources: true,
    view_reports: true,
    export_data: true,
    import_data: true,
    manage_users: false,
    manage_roles: false,
    view_analytics: true,
    edit_analytics: true,
    view_settings: true,
    edit_settings: true,
    view_activity_log: true,
    delete_activity_log: false,
  },
  admin: {
    view_projects: true,
    edit_projects: true,
    delete_projects: true,
    create_projects: true,
    view_tasks: true,
    edit_tasks: true,
    delete_tasks: true,
    create_tasks: true,
    view_links: true,
    edit_links: true,
    delete_links: true,
    create_links: true,
    view_resources: true,
    edit_resources: true,
    delete_resources: true,
    create_resources: true,
    view_reports: true,
    export_data: true,
    import_data: true,
    manage_users: true,
    manage_roles: true,
    view_analytics: true,
    edit_analytics: true,
    view_settings: true,
    edit_settings: true,
    view_activity_log: true,
    delete_activity_log: true,
    'programme.structure.view': true,
    'programme.structure.edit': true,
    'programme.structure.toggle': true,
    'programme.barstyles.view': true,
    'programme.barstyles.manage': true,
    'programme.constraints.view': true,
    'programme.constraints.assign': true,
  },
  super_admin: {
    view_projects: true,
    edit_projects: true,
    delete_projects: true,
    create_projects: true,
    view_tasks: true,
    edit_tasks: true,
    delete_tasks: true,
    create_tasks: true,
    view_links: true,
    edit_links: true,
    delete_links: true,
    create_links: true,
    view_resources: true,
    edit_resources: true,
    delete_resources: true,
    create_resources: true,
    view_reports: true,
    export_data: true,
    import_data: true,
    manage_users: true,
    manage_roles: true,
    view_analytics: true,
    edit_analytics: true,
    view_settings: true,
    edit_settings: true,
    view_activity_log: true,
    delete_activity_log: true,
    'programme.structure.view': true,
    'programme.structure.edit': true,
    'programme.structure.toggle': true,
    'programme.barstyles.view': true,
    'programme.barstyles.manage': true,
    'programme.constraints.view': true,
    'programme.constraints.assign': true,
  },
};

class PermissionsService {
  private permissionMatrix: PermissionMatrix = DEFAULT_PERMISSION_MATRIX;
  private currentUserPermissions: UserPermissions | null = null;

  // Initialize permissions service
  async initialize(): Promise<void> {
    try {
      // Load custom permission matrix from database if it exists
      const { data: customMatrix, error } = await supabase
        .from('permission_matrix')
        .select('*')
        .single();

      if (customMatrix && !error) {
        this.permissionMatrix = customMatrix.matrix;
      }

      // Load current user permissions
      await this.loadCurrentUserPermissions();
    } catch (error) {
      console.error('Failed to initialize permissions service:', error);
    }
  }

  // Load current user permissions
  async loadCurrentUserPermissions(): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        this.currentUserPermissions = null;
        return;
      }

      // Get user role and permissions from database
      try {
        const { data: userData, error } = await supabase
          .from('user_roles')
          .select('role, permissions, project_permissions')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.log(
            'User role not found, creating default role for user:',
            user.id
          );

          // Create default user role if not exists
          const defaultRole = 'viewer';
          const defaultPermissions = this.getPermissionsForRole(defaultRole);

          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: defaultRole,
              permissions: defaultPermissions,
              project_permissions: {},
            });

          if (insertError) {
            console.error('Failed to create default user role:', insertError);
            // Fallback to default role without database persistence
            this.currentUserPermissions = {
              userId: user.id,
              role: defaultRole,
              permissions: defaultPermissions,
            };
            return;
          }

          // Set the newly created permissions
          this.currentUserPermissions = {
            userId: user.id,
            role: defaultRole,
            permissions: defaultPermissions,
            projectPermissions: {},
          };
          return;
        }

        if (userData) {
          this.currentUserPermissions = {
            userId: user.id,
            role: userData.role,
            permissions:
              userData.permissions || this.getPermissionsForRole(userData.role),
            projectPermissions: userData.project_permissions,
          };
          return;
        }
      } catch (dbError) {
        console.error('Database error, using fallback permissions:', dbError);
      }

      // Fallback to default role if no user data found
      // Try to get from localStorage first
      const storedRole = localStorage.getItem(`user_role_${user.id}`);
      const storedPermissions = localStorage.getItem(`user_permissions_${user.id}`);
      
      if (storedRole && storedPermissions) {
        try {
          this.currentUserPermissions = {
            userId: user.id,
            role: storedRole as UserRole,
            permissions: JSON.parse(storedPermissions),
          };
          console.log('✅ Loaded permissions from localStorage');
          return;
        } catch (error) {
          console.log('⚠️ Failed to parse stored permissions, using default');
        }
      }
      
      // Set default super_admin role for development
      const defaultRole: UserRole = 'super_admin';
      const defaultPermissions = this.getPermissionsForRole(defaultRole);
      
      this.currentUserPermissions = {
        userId: user.id,
        role: defaultRole,
        permissions: defaultPermissions,
      };
      
      // Store in localStorage for persistence
      localStorage.setItem(`user_role_${user.id}`, defaultRole);
      localStorage.setItem(`user_permissions_${user.id}`, JSON.stringify(defaultPermissions));
      
      console.log('✅ Set default super_admin permissions with localStorage fallback');
    } catch (error) {
      console.error('Failed to load user permissions:', error);

      // Fallback to default permissions
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        this.currentUserPermissions = {
          userId: user.id,
          role: 'viewer',
          permissions: this.getPermissionsForRole('viewer'),
        };
      } else {
        this.currentUserPermissions = null;
      }
    }
  }

  // Check if user has permission
  hasPermission(permission: Permission, projectId?: string): PermissionCheck {
    if (!this.currentUserPermissions) {
      return {
        hasPermission: false,
        reason: 'User not authenticated',
        requiredRole: 'viewer',
      };
    }

    // Check project-specific permissions first
    if (projectId && this.currentUserPermissions.projectPermissions) {
      const projectPerms =
        this.currentUserPermissions.projectPermissions[projectId];
      if (projectPerms && projectPerms.includes(permission)) {
        return { hasPermission: true };
      }
    }

    // Check global permissions
    const hasGlobalPermission =
      this.currentUserPermissions.permissions.includes(permission);

    if (hasGlobalPermission) {
      return { hasPermission: true };
    }

    // Find required role for this permission
    const requiredRole = this.findRequiredRoleForPermission(permission);

    return {
      hasPermission: false,
      reason: `Requires ${requiredRole} role`,
      requiredRole,
    };
  }

  // Check if user has any of the given permissions
  hasAnyPermission(
    permissions: Permission[],
    projectId?: string
  ): PermissionCheck {
    for (const permission of permissions) {
      const check = this.hasPermission(permission, projectId);
      if (check.hasPermission) {
        return check;
      }
    }

    return {
      hasPermission: false,
      reason: `Requires one of: ${permissions.join(', ')}`,
      requiredRole: 'project_manager',
    };
  }

  // Check if user has all of the given permissions
  hasAllPermissions(
    permissions: Permission[],
    projectId?: string
  ): PermissionCheck {
    for (const permission of permissions) {
      const check = this.hasPermission(permission, projectId);
      if (!check.hasPermission) {
        return check;
      }
    }

    return { hasPermission: true };
  }

  // Get current user role
  getCurrentUserRole(): UserRole | null {
    return this.currentUserPermissions?.role || null;
  }

  // Get current user permissions
  getCurrentUserPermissions(): Permission[] {
    return this.currentUserPermissions?.permissions || [];
  }

  // Get permissions for a specific role
  getPermissionsForRole(role: UserRole): Permission[] {
    const rolePermissions = this.permissionMatrix[role];
    if (!rolePermissions) {
      return [];
    }

    return Object.entries(rolePermissions)
      .filter(([_, hasPermission]) => hasPermission)
      .map(([permission, _]) => permission as Permission);
  }

  // Get all available permissions
  getAllPermissions(): Permission[] {
    const adminPermissions = this.permissionMatrix['admin'];
    if (!adminPermissions) {
      return [];
    }
    return Object.keys(adminPermissions) as Permission[];
  }

  // Update user role
  async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase.from('user_roles').upsert({
        user_id: userId,
        role,
        permissions: this.getPermissionsForRole(role),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to update user role:', error);
        return false;
      }

      // Reload current user permissions if it's the current user
      if (this.currentUserPermissions?.userId === userId) {
        await this.loadCurrentUserPermissions();
      }

      return true;
    } catch (error) {
      console.error('Failed to update user role:', error);
      return false;
    }
  }

  // Grant project-specific permission
  async grantProjectPermission(
    userId: string,
    projectId: string,
    permission: Permission
  ): Promise<boolean> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('user_roles')
        .select('project_permissions')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Failed to fetch user permissions:', fetchError);
        return false;
      }

      const projectPermissions = existing?.project_permissions || {};
      if (!projectPermissions[projectId]) {
        projectPermissions[projectId] = [];
      }

      if (!projectPermissions[projectId].includes(permission)) {
        projectPermissions[projectId].push(permission);
      }

      const { error } = await supabase.from('user_roles').upsert({
        user_id: userId,
        project_permissions: projectPermissions,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to grant project permission:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to grant project permission:', error);
      return false;
    }
  }

  // Revoke project-specific permission
  async revokeProjectPermission(
    userId: string,
    projectId: string,
    permission: Permission
  ): Promise<boolean> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('user_roles')
        .select('project_permissions')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Failed to fetch user permissions:', fetchError);
        return false;
      }

      const projectPermissions = existing?.project_permissions || {};
      if (projectPermissions[projectId]) {
        projectPermissions[projectId] = projectPermissions[projectId].filter(
          (p: Permission) => p !== permission
        );
      }

      const { error } = await supabase.from('user_roles').upsert({
        user_id: userId,
        project_permissions: projectPermissions,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to revoke project permission:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to revoke project permission:', error);
      return false;
    }
  }

  // Get users with their roles
  async getUsersWithRoles(): Promise<
    Array<{ email: string; role: UserRole; userId: string }>
  > {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .order('role');

      if (error) {
        console.error('Failed to fetch users with roles:', error);
        return [];
      }

      return data.map(item => ({
        userId: item.user_id,
        role: item.role,
        email: 'Unknown', // Email not available in current schema
      }));
    } catch (error) {
      console.error('Failed to fetch users with roles:', error);
      return [];
    }
  }

  // Private helper methods
  private findRequiredRoleForPermission(permission: Permission): UserRole {
    for (const role of ['admin', 'project_manager', 'viewer'] as UserRole[]) {
      const rolePermissions = this.permissionMatrix[role];
      if (rolePermissions && rolePermissions[permission]) {
        return role;
      }
    }
    return 'admin';
  }

  // Demo data for testing
  getDemoUserPermissions(): UserPermissions {
    return {
      userId: 'demo-user-1',
      role: 'project_manager',
      permissions: this.getPermissionsForRole('project_manager'),
      projectPermissions: {
        'demo-project-1': ['edit_tasks', 'create_tasks', 'delete_tasks'],
        'demo-project-2': ['view_tasks', 'edit_tasks'],
      },
    };
  }

  // Set demo permissions for testing
  setDemoPermissions(): void {
    this.currentUserPermissions = this.getDemoUserPermissions();
  }
}

export const permissionsService = new PermissionsService();

// Initialize the service
permissionsService.initialize().catch(console.error);
