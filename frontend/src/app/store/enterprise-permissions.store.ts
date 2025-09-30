/**
 * Enterprise Permissions Store
 *
 * Comprehensive Zustand store for managing enterprise-grade permissions,
 * roles, users, and granular access control.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CreateRoleForm,
  CreateUserForm,
  CustomRole,
  EnterpriseUser,
  FilePermission,
  FolderPermission,
  PermissionAuditLog,
  PermissionChangeLog,
  PermissionEvaluation,
  PermissionMatrix,
  PermissionRule,
  PermissionRuleForm,
  PermissionSummary,
  ResourcePermission,
  RoleSummary,
  UserSummary,
} from '../../lib/types/enterprise-permissions';

// ============================================================================
// STORE STATE INTERFACES
// ============================================================================

interface EnterprisePermissionsState {
  // Core Data
  roles: CustomRole[];
  users: EnterpriseUser[];
  permissionRules: PermissionRule[];
  resourcePermissions: ResourcePermission[];
  filePermissions: FilePermission[];
  folderPermissions: FolderPermission[];
  permissionMatrix: PermissionMatrix | null;

  // Audit & Logging
  auditLogs: PermissionAuditLog[];
  changeLogs: PermissionChangeLog[];

  // UI State
  selectedRole: string | null;
  selectedUser: string | null;
  selectedResource: string | null;
  isMatrixView: boolean;
  isCreatingRole: boolean;
  isCreatingUser: boolean;
  isCreatingRule: boolean;

  // Loading States
  isLoading: boolean;
  isSaving: boolean;
  isEvaluating: boolean;

  // Error States
  error: string | null;
  lastError: string | null;

  // Actions - Roles
  createRole: (roleData: CreateRoleForm) => Promise<CustomRole>;
  updateRole: (
    roleId: string,
    updates: Partial<CustomRole>
  ) => Promise<CustomRole>;
  deleteRole: (roleId: string) => Promise<void>;
  duplicateRole: (roleId: string, newName: string) => Promise<CustomRole>;
  getRole: (roleId: string) => CustomRole | undefined;
  getRolesByUser: (userId: string) => CustomRole[];

  // Actions - Users
  createUser: (userData: CreateUserForm) => Promise<EnterpriseUser>;
  updateUser: (
    userId: string,
    updates: Partial<EnterpriseUser>
  ) => Promise<EnterpriseUser>;
  deleteUser: (userId: string) => Promise<void>;
  assignRole: (userId: string, roleId: string) => Promise<void>;
  removeRole: (userId: string, roleId: string) => Promise<void>;
  addCustomPermission: (userId: string, permission: any) => Promise<void>;
  removeCustomPermission: (
    userId: string,
    permissionId: string
  ) => Promise<void>;
  getUser: (userId: string) => EnterpriseUser | undefined;
  getUsersByRole: (roleId: string) => EnterpriseUser[];

  // Actions - Permission Rules
  createPermissionRule: (
    ruleData: PermissionRuleForm
  ) => Promise<PermissionRule>;
  updatePermissionRule: (
    ruleId: string,
    updates: Partial<PermissionRule>
  ) => Promise<PermissionRule>;
  deletePermissionRule: (ruleId: string) => Promise<void>;
  enableRule: (ruleId: string) => Promise<void>;
  disableRule: (ruleId: string) => Promise<void>;
  getRule: (ruleId: string) => PermissionRule | undefined;
  getRulesByResource: (resource: string) => PermissionRule[];

  // Actions - Resource Permissions
  setResourcePermission: (resourceId: string, permission: any) => Promise<void>;
  removeResourcePermission: (
    resourceId: string,
    permissionId: string
  ) => Promise<void>;
  getResourcePermissions: (
    resourceId: string
  ) => ResourcePermission | undefined;

  // Actions - File/Folder Permissions
  setFilePermission: (fileId: string, permission: any) => Promise<void>;
  removeFilePermission: (fileId: string, permissionId: string) => Promise<void>;
  setFolderPermission: (folderId: string, permission: any) => Promise<void>;
  removeFolderPermission: (
    folderId: string,
    permissionId: string
  ) => Promise<void>;
  getFilePermissions: (fileId: string) => FilePermission | undefined;
  getFolderPermissions: (folderId: string) => FolderPermission | undefined;

  // Actions - Permission Matrix
  createPermissionMatrix: (
    matrixData: Partial<PermissionMatrix>
  ) => Promise<PermissionMatrix>;
  updatePermissionMatrix: (
    matrixId: string,
    updates: Partial<PermissionMatrix>
  ) => Promise<PermissionMatrix>;
  deletePermissionMatrix: (matrixId: string) => Promise<void>;
  getPermissionMatrix: (matrixId: string) => PermissionMatrix | undefined;

  // Actions - Permission Evaluation
  evaluatePermission: (
    userId: string,
    resource: string,
    action: string,
    context?: any
  ) => Promise<PermissionEvaluation>;
  evaluateUserPermissions: (userId: string) => Promise<PermissionEvaluation[]>;
  evaluateRolePermissions: (roleId: string) => Promise<PermissionEvaluation[]>;

  // Actions - Audit & Logging
  logPermissionChange: (
    change: Omit<PermissionChangeLog, 'id' | 'timestamp'>
  ) => Promise<void>;
  logPermissionAudit: (
    audit: Omit<PermissionAuditLog, 'id' | 'timestamp'>
  ) => Promise<void>;
  getAuditLogs: (filters?: any) => Promise<PermissionAuditLog[]>;
  getChangeLogs: (filters?: any) => Promise<PermissionChangeLog[]>;

  // Actions - UI State
  setSelectedRole: (roleId: string | null) => void;
  setSelectedUser: (userId: string | null) => void;
  setSelectedResource: (resourceId: string | null) => void;
  setMatrixView: (isMatrixView: boolean) => void;
  setCreatingRole: (isCreating: boolean) => void;
  setCreatingUser: (isCreating: boolean) => void;
  setCreatingRule: (isCreating: boolean) => void;

  // Actions - Utility
  getPermissionSummary: () => PermissionSummary;
  getRoleSummary: () => RoleSummary;
  getUserSummary: () => UserSummary;
  exportPermissions: (format: 'json' | 'csv' | 'xlsx') => Promise<string>;
  importPermissions: (
    data: string,
    format: 'json' | 'csv' | 'xlsx'
  ) => Promise<void>;
  resetStore: () => void;

  // Actions - Loading & Error
  setLoading: (isLoading: boolean) => void;
  setSaving: (isSaving: boolean) => void;
  setEvaluating: (isEvaluating: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockRoles: CustomRole[] = [
  {
    id: 'role-1',
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access with no restrictions',
    color: '#dc2626',
    icon: 'Shield',
    isSystem: true,
    isActive: true,
    permissions: [
      {
        id: 'perm-1',
        resource: 'users',
        action: 'manage',
        scope: 'global',
        granted: true,
        priority: 1,
      },
      {
        id: 'perm-2',
        resource: 'roles',
        action: 'manage',
        scope: 'global',
        granted: true,
        priority: 1,
      },
      {
        id: 'perm-3',
        resource: 'permissions',
        action: 'manage',
        scope: 'global',
        granted: true,
        priority: 1,
      },
      {
        id: 'perm-4',
        resource: 'files',
        action: 'manage',
        scope: 'global',
        granted: true,
        priority: 1,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    id: 'role-2',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Administrative access with most permissions',
    color: '#2563eb',
    icon: 'UserCog',
    isSystem: true,
    isActive: true,
    permissions: [
      {
        id: 'perm-5',
        resource: 'users',
        action: 'read',
        scope: 'organization',
        granted: true,
        priority: 2,
      },
      {
        id: 'perm-6',
        resource: 'projects',
        action: 'manage',
        scope: 'organization',
        granted: true,
        priority: 2,
      },
      {
        id: 'perm-7',
        resource: 'files',
        action: 'read',
        scope: 'organization',
        granted: true,
        priority: 2,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    id: 'role-3',
    name: 'contractor',
    displayName: 'Contractor',
    description: 'Limited access for external contractors',
    color: '#059669',
    icon: 'HardHat',
    isSystem: false,
    isActive: true,
    permissions: [
      {
        id: 'perm-8',
        resource: 'projects',
        action: 'read',
        scope: 'project',
        granted: true,
        priority: 3,
      },
      {
        id: 'perm-9',
        resource: 'files',
        action: 'read',
        scope: 'project',
        granted: true,
        priority: 3,
        conditions: [
          {
            id: 'cond-1',
            field: 'file_type',
            operator: 'in',
            value: ['job_sheets', 'specifications', 'project_photos'],
          },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
  },
];

const mockUsers: EnterpriseUser[] = [
  {
    id: 'user-1',
    email: 'constructbms@gmail.com',
    firstName: 'Super',
    lastName: 'Admin',
    displayName: 'Super Administrator',
    isActive: true,
    isVerified: true,
    primaryRole: 'role-1',
    additionalRoles: [],
    customPermissions: [],
    restrictions: [],
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    id: 'user-2',
    email: 'joe.bloggs@contractor.com',
    firstName: 'Joe',
    lastName: 'Bloggs',
    displayName: 'Joe Bloggs',
    isActive: true,
    isVerified: true,
    primaryRole: 'role-3',
    additionalRoles: [],
    customPermissions: [],
    restrictions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user-1',
  },
];

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useEnterprisePermissionsStore =
  create<EnterprisePermissionsState>()(
    persist(
      (set, get) => ({
        // Initial State
        roles: mockRoles,
        users: mockUsers,
        permissionRules: [],
        resourcePermissions: [],
        filePermissions: [],
        folderPermissions: [],
        permissionMatrix: null,
        auditLogs: [],
        changeLogs: [],
        selectedRole: null,
        selectedUser: null,
        selectedResource: null,
        isMatrixView: false,
        isCreatingRole: false,
        isCreatingUser: false,
        isCreatingRule: false,
        isLoading: false,
        isSaving: false,
        isEvaluating: false,
        error: null,
        lastError: null,

        // Role Actions
        createRole: async (roleData: CreateRoleForm) => {
          set({ isSaving: true, error: null });
          try {
            const newRole: CustomRole = {
              id: `role-${Date.now()}`,
              name: roleData.name,
              displayName: roleData.displayName,
              description: roleData.description,
              color: roleData.color,
              icon: roleData.icon,
              isSystem: false,
              isActive: true,
              permissions: roleData.permissions,
              inheritance: roleData.inheritance,
              restrictions: roleData.restrictions,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'current-user', // TODO: Get from auth context
            };

            set(state => ({
              roles: [...state.roles, newRole],
              isSaving: false,
            }));

            return newRole;
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to create role',
              isSaving: false,
            });
            throw error;
          }
        },

        updateRole: async (roleId: string, updates: Partial<CustomRole>) => {
          set({ isSaving: true, error: null });
          try {
            set(state => ({
              roles: state.roles.map(role =>
                role.id === roleId
                  ? { ...role, ...updates, updatedAt: new Date().toISOString() }
                  : role
              ),
              isSaving: false,
            }));

            const updatedRole = get().roles.find(role => role.id === roleId);
            if (!updatedRole) throw new Error('Role not found');
            return updatedRole;
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to update role',
              isSaving: false,
            });
            throw error;
          }
        },

        deleteRole: async (roleId: string) => {
          set({ isSaving: true, error: null });
          try {
            set(state => ({
              roles: state.roles.filter(role => role.id !== roleId),
              isSaving: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to delete role',
              isSaving: false,
            });
            throw error;
          }
        },

        duplicateRole: async (roleId: string, newName: string) => {
          const originalRole = get().roles.find(role => role.id === roleId);
          if (!originalRole) throw new Error('Role not found');

          const duplicatedRole: CustomRole = {
            ...originalRole,
            id: `role-${Date.now()}`,
            name: newName,
            displayName: `${originalRole.displayName} (Copy)`,
            isSystem: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set(state => ({
            roles: [...state.roles, duplicatedRole],
          }));

          return duplicatedRole;
        },

        getRole: (roleId: string) => {
          return get().roles.find(role => role.id === roleId);
        },

        getRolesByUser: (userId: string) => {
          const user = get().users.find(u => u.id === userId);
          if (!user) return [];

          const allRoles = get().roles;
          const userRoles = [user.primaryRole, ...user.additionalRoles]
            .map(roleId => allRoles.find(role => role.id === roleId))
            .filter(Boolean) as CustomRole[];

          return userRoles;
        },

        // User Actions
        createUser: async (userData: CreateUserForm) => {
          set({ isSaving: true, error: null });
          try {
            const newUser: EnterpriseUser = {
              id: `user-${Date.now()}`,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              displayName: userData.displayName,
              isActive: true,
              isVerified: false,
              primaryRole: userData.primaryRole,
              additionalRoles: userData.additionalRoles,
              customPermissions: userData.customPermissions,
              restrictions: userData.restrictions,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'current-user', // TODO: Get from auth context
            };

            set(state => ({
              users: [...state.users, newUser],
              isSaving: false,
            }));

            return newUser;
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to create user',
              isSaving: false,
            });
            throw error;
          }
        },

        updateUser: async (
          userId: string,
          updates: Partial<EnterpriseUser>
        ) => {
          set({ isSaving: true, error: null });
          try {
            set(state => ({
              users: state.users.map(user =>
                user.id === userId
                  ? { ...user, ...updates, updatedAt: new Date().toISOString() }
                  : user
              ),
              isSaving: false,
            }));

            const updatedUser = get().users.find(user => user.id === userId);
            if (!updatedUser) throw new Error('User not found');
            return updatedUser;
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to update user',
              isSaving: false,
            });
            throw error;
          }
        },

        deleteUser: async (userId: string) => {
          set({ isSaving: true, error: null });
          try {
            set(state => ({
              users: state.users.filter(user => user.id !== userId),
              isSaving: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to delete user',
              isSaving: false,
            });
            throw error;
          }
        },

        assignRole: async (userId: string, roleId: string) => {
          set({ isSaving: true, error: null });
          try {
            set(state => ({
              users: state.users.map(user =>
                user.id === userId
                  ? {
                      ...user,
                      additionalRoles: [...user.additionalRoles, roleId],
                      updatedAt: new Date().toISOString(),
                    }
                  : user
              ),
              isSaving: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to assign role',
              isSaving: false,
            });
            throw error;
          }
        },

        removeRole: async (userId: string, roleId: string) => {
          set({ isSaving: true, error: null });
          try {
            set(state => ({
              users: state.users.map(user =>
                user.id === userId
                  ? {
                      ...user,
                      additionalRoles: user.additionalRoles.filter(
                        id => id !== roleId
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : user
              ),
              isSaving: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to remove role',
              isSaving: false,
            });
            throw error;
          }
        },

        addCustomPermission: async (userId: string, permission: any) => {
          set({ isSaving: true, error: null });
          try {
            set(state => ({
              users: state.users.map(user =>
                user.id === userId
                  ? {
                      ...user,
                      customPermissions: [
                        ...user.customPermissions,
                        permission,
                      ],
                      updatedAt: new Date().toISOString(),
                    }
                  : user
              ),
              isSaving: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to add custom permission',
              isSaving: false,
            });
            throw error;
          }
        },

        removeCustomPermission: async (
          userId: string,
          permissionId: string
        ) => {
          set({ isSaving: true, error: null });
          try {
            set(state => ({
              users: state.users.map(user =>
                user.id === userId
                  ? {
                      ...user,
                      customPermissions: user.customPermissions.filter(
                        p => p.id !== permissionId
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : user
              ),
              isSaving: false,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to remove custom permission',
              isSaving: false,
            });
            throw error;
          }
        },

        getUser: (userId: string) => {
          return get().users.find(user => user.id === userId);
        },

        getUsersByRole: (roleId: string) => {
          return get().users.filter(
            user =>
              user.primaryRole === roleId ||
              user.additionalRoles.includes(roleId)
          );
        },

        // Permission Rule Actions (simplified for now)
        createPermissionRule: async (ruleData: PermissionRuleForm) => {
          // TODO: Implement permission rule creation
          console.log('Creating permission rule:', ruleData);
          throw new Error('Not implemented yet');
        },

        updatePermissionRule: async (
          ruleId: string,
          updates: Partial<PermissionRule>
        ) => {
          // TODO: Implement permission rule update
          console.log('Updating permission rule:', ruleId, updates);
          throw new Error('Not implemented yet');
        },

        deletePermissionRule: async (ruleId: string) => {
          // TODO: Implement permission rule deletion
          console.log('Deleting permission rule:', ruleId);
          throw new Error('Not implemented yet');
        },

        enableRule: async (ruleId: string) => {
          // TODO: Implement rule enabling
          console.log('Enabling rule:', ruleId);
          throw new Error('Not implemented yet');
        },

        disableRule: async (ruleId: string) => {
          // TODO: Implement rule disabling
          console.log('Disabling rule:', ruleId);
          throw new Error('Not implemented yet');
        },

        getRule: (ruleId: string) => {
          return get().permissionRules.find(rule => rule.id === ruleId);
        },

        getRulesByResource: (resource: string) => {
          return get().permissionRules.filter(
            rule => rule.resource === resource
          );
        },

        // Resource Permission Actions (simplified for now)
        setResourcePermission: async (
          resourceId: string,
          permission: Record<string, unknown>
        ) => {
          // TODO: Implement resource permission setting
          console.log('Setting resource permission:', resourceId, permission);
          throw new Error('Not implemented yet');
        },

        removeResourcePermission: async (
          resourceId: string,
          permissionId: string
        ) => {
          // TODO: Implement resource permission removal
          console.log(
            'Removing resource permission:',
            resourceId,
            permissionId
          );
          throw new Error('Not implemented yet');
        },

        getResourcePermissions: (resourceId: string) => {
          return get().resourcePermissions.find(
            rp => rp.resourceId === resourceId
          );
        },

        // File/Folder Permission Actions (simplified for now)
        setFilePermission: async (
          fileId: string,
          permission: Record<string, unknown>
        ) => {
          // TODO: Implement file permission setting
          console.log('Setting file permission:', fileId, permission);
          throw new Error('Not implemented yet');
        },

        removeFilePermission: async (fileId: string, permissionId: string) => {
          // TODO: Implement file permission removal
          console.log('Removing file permission:', fileId, permissionId);
          throw new Error('Not implemented yet');
        },

        setFolderPermission: async (
          folderId: string,
          permission: Record<string, unknown>
        ) => {
          // TODO: Implement folder permission setting
          console.log('Setting folder permission:', folderId, permission);
          throw new Error('Not implemented yet');
        },

        removeFolderPermission: async (
          folderId: string,
          permissionId: string
        ) => {
          // TODO: Implement folder permission removal
          console.log('Removing folder permission:', folderId, permissionId);
          throw new Error('Not implemented yet');
        },

        getFilePermissions: (fileId: string) => {
          return get().filePermissions.find(fp => fp.fileId === fileId);
        },

        getFolderPermissions: (folderId: string) => {
          return get().folderPermissions.find(fp => fp.folderId === folderId);
        },

        // Permission Matrix Actions (simplified for now)
        createPermissionMatrix: async (
          matrixData: Partial<PermissionMatrix>
        ) => {
          // TODO: Implement permission matrix creation
          console.log('Creating permission matrix:', matrixData);
          throw new Error('Not implemented yet');
        },

        updatePermissionMatrix: async (
          matrixId: string,
          updates: Partial<PermissionMatrix>
        ) => {
          // TODO: Implement permission matrix update
          console.log('Updating permission matrix:', matrixId, updates);
          throw new Error('Not implemented yet');
        },

        deletePermissionMatrix: async (matrixId: string) => {
          // TODO: Implement permission matrix deletion
          console.log('Deleting permission matrix:', matrixId);
          throw new Error('Not implemented yet');
        },

        getPermissionMatrix: () => {
          return get().permissionMatrix;
        },

        // Permission Evaluation Actions (simplified for now)
        evaluatePermission: async (
          userId: string,
          resource: string,
          action: string,
          context?: Record<string, unknown>
        ) => {
          // TODO: Implement permission evaluation
          console.log(
            'Evaluating permission:',
            userId,
            resource,
            action,
            context
          );
          throw new Error('Not implemented yet');
        },

        evaluateUserPermissions: async (userId: string) => {
          // TODO: Implement user permission evaluation
          console.log('Evaluating user permissions:', userId);
          throw new Error('Not implemented yet');
        },

        evaluateRolePermissions: async (roleId: string) => {
          // TODO: Implement role permission evaluation
          console.log('Evaluating role permissions:', roleId);
          throw new Error('Not implemented yet');
        },

        // Audit & Logging Actions (simplified for now)
        logPermissionChange: async (
          change: Omit<PermissionChangeLog, 'id' | 'timestamp'>
        ) => {
          // TODO: Implement permission change logging
          console.log('Logging permission change:', change);
          throw new Error('Not implemented yet');
        },

        logPermissionAudit: async (
          audit: Omit<PermissionAuditLog, 'id' | 'timestamp'>
        ) => {
          // TODO: Implement permission audit logging
          console.log('Logging permission audit:', audit);
          throw new Error('Not implemented yet');
        },

        getAuditLogs: async (filters?: Record<string, unknown>) => {
          // TODO: Implement audit log retrieval
          console.log('Getting audit logs:', filters);
          throw new Error('Not implemented yet');
        },

        getChangeLogs: async (filters?: Record<string, unknown>) => {
          // TODO: Implement change log retrieval
          console.log('Getting change logs:', filters);
          throw new Error('Not implemented yet');
        },

        // UI State Actions
        setSelectedRole: (roleId: string | null) =>
          set({ selectedRole: roleId }),
        setSelectedUser: (userId: string | null) =>
          set({ selectedUser: userId }),
        setSelectedResource: (resourceId: string | null) =>
          set({ selectedResource: resourceId }),
        setMatrixView: (isMatrixView: boolean) => set({ isMatrixView }),
        setCreatingRole: (isCreating: boolean) =>
          set({ isCreatingRole: isCreating }),
        setCreatingUser: (isCreating: boolean) =>
          set({ isCreatingUser: isCreating }),
        setCreatingRule: (isCreating: boolean) =>
          set({ isCreatingRule: isCreating }),

        // Utility Actions
        getPermissionSummary: () => {
          const state = get();
          const totalPermissions = state.roles.reduce(
            (sum, role) => sum + role.permissions.length,
            0
          );
          const grantedPermissions = state.roles.reduce(
            (sum, role) => sum + role.permissions.filter(p => p.granted).length,
            0
          );

          return {
            totalPermissions,
            grantedPermissions,
            deniedPermissions: totalPermissions - grantedPermissions,
            conditionalPermissions: 0,
            expiredPermissions: 0,
            restrictedPermissions: 0,
          };
        },

        getRoleSummary: () => {
          const state = get();
          return {
            totalRoles: state.roles.length,
            activeRoles: state.roles.filter(role => role.isActive).length,
            systemRoles: state.roles.filter(role => role.isSystem).length,
            customRoles: state.roles.filter(role => !role.isSystem).length,
            usersWithRoles: state.users.length,
          };
        },

        getUserSummary: () => {
          const state = get();
          return {
            totalUsers: state.users.length,
            activeUsers: state.users.filter(user => user.isActive).length,
            verifiedUsers: state.users.filter(user => user.isVerified).length,
            usersWithCustomPermissions: state.users.filter(
              user => user.customPermissions.length > 0
            ).length,
            usersWithRestrictions: state.users.filter(
              user => user.restrictions.length > 0
            ).length,
          };
        },

        exportPermissions: async (format: 'json' | 'csv' | 'xlsx') => {
          // TODO: Implement permissions export
          console.log('Exporting permissions in format:', format);
          throw new Error('Not implemented yet');
        },

        importPermissions: async (
          data: string,
          format: 'json' | 'csv' | 'xlsx'
        ) => {
          // TODO: Implement permissions import
          console.log('Importing permissions:', data, format);
          throw new Error('Not implemented yet');
        },

        resetStore: () => {
          set({
            roles: mockRoles,
            users: mockUsers,
            permissionRules: [],
            resourcePermissions: [],
            filePermissions: [],
            folderPermissions: [],
            permissionMatrix: null,
            auditLogs: [],
            changeLogs: [],
            selectedRole: null,
            selectedUser: null,
            selectedResource: null,
            isMatrixView: false,
            isCreatingRole: false,
            isCreatingUser: false,
            isCreatingRule: false,
            isLoading: false,
            isSaving: false,
            isEvaluating: false,
            error: null,
            lastError: null,
          });
        },

        // Loading & Error Actions
        setLoading: (isLoading: boolean) => set({ isLoading }),
        setSaving: (isSaving: boolean) => set({ isSaving }),
        setEvaluating: (isEvaluating: boolean) => set({ isEvaluating }),
        setError: (error: string | null) => set({ error, lastError: error }),
        clearError: () => set({ error: null }),
      }),
      {
        name: 'enterprise-permissions-storage',
        getStorage: () => localStorage,
        partialize: state => ({
          roles: state.roles,
          users: state.users,
          permissionRules: state.permissionRules,
          resourcePermissions: state.resourcePermissions,
          filePermissions: state.filePermissions,
          folderPermissions: state.folderPermissions,
          permissionMatrix: state.permissionMatrix,
        }),
      }
    )
  );
