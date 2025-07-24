import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  ShieldExclamationIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { usePermissions, type Permission, type UserRole } from '../../hooks/usePermissions';
import { permissionsService } from '../../services/permissionsService';
import { Card } from '../ui';

interface UserWithRole {
  email: string;
  role: UserRole;
  userId: string;
}

interface UserRoleManagerProps {
  className?: string;
}

const UserRoleManager: React.FC<UserRoleManagerProps> = ({ className = '' }) => {
  const { 
    hasPermission, 
    currentRole, 
    updateUserRole, 
    grantProjectPermission, 
    revokeProjectPermission,
    getPermissionsForRole,
    getAllPermissions 
  } = usePermissions();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<Permission>('view_tasks');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');

  // Check if user has admin permissions
  const canManageUsers = hasPermission('manage_users');
  const canManageRoles = hasPermission('manage_roles');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersWithRoles = await permissionsService.getUsersWithRoles();
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const success = await updateUserRole(userId, newRole);
      if (success) {
        await loadUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleGrantProjectPermission = async (userId: string, projectId: string, permission: Permission) => {
    try {
      const success = await grantProjectPermission(userId, projectId, permission);
      if (success) {
        await loadUsers();
      }
    } catch (error) {
      console.error('Failed to grant project permission:', error);
    }
  };

  const handleRevokeProjectPermission = async (userId: string, projectId: string, permission: Permission) => {
    try {
      const success = await revokeProjectPermission(userId, projectId, permission);
      if (success) {
        await loadUsers();
      }
    } catch (error) {
      console.error('Failed to revoke project permission:', error);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheckIcon className="w-5 h-5 text-red-600" />;
      case 'project_manager':
        return <ShieldExclamationIcon className="w-5 h-5 text-yellow-600" />;
      case 'viewer':
        return <UserIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <UserIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'project_manager':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'viewer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!canManageUsers) {
    return (
      <Card>
        <div className="p-6 text-center">
          <ShieldExclamationIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to manage users and roles.
          </p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Role Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user roles and permissions across the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Current Role: <span className="font-medium">{currentRole}</span>
          </span>
        </div>
      </div>

      {/* Users List */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Users ({users.length})
            </h3>
            {canManageRoles && (
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Add User
              </button>
            )}
          </div>

          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getRoleIcon(user.role)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingUser === user.userId ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="project_manager">Project Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => handleUpdateRole(user.userId, selectedRole)}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="p-1 text-gray-600 hover:text-gray-700"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingUser(user.userId);
                        setSelectedRole(user.role);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                      disabled={!canManageRoles}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Project Permissions */}
      {canManageRoles && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Project-Specific Permissions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User
                </label>
                <select
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project ID
                </label>
                <input
                  type="text"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  placeholder="Enter project ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permission
                </label>
                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value as Permission)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getAllPermissions().map((permission) => (
                    <option key={permission} value={permission}>
                      {permission.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (selectedUser && selectedProject && selectedPermission) {
                    handleGrantProjectPermission(selectedUser, selectedProject, selectedPermission);
                  }
                }}
                disabled={!selectedUser || !selectedProject || !selectedPermission}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Grant Permission
              </button>
              <button
                onClick={() => {
                  if (selectedUser && selectedProject && selectedPermission) {
                    handleRevokeProjectPermission(selectedUser, selectedProject, selectedPermission);
                  }
                }}
                disabled={!selectedUser || !selectedProject || !selectedPermission}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Revoke Permission
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Role Permissions Matrix */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Role Permissions Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Permission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Viewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Project Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {getAllPermissions().map((permission) => (
                  <tr key={permission}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {permission.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getPermissionsForRole('viewer').includes(permission) ? (
                        <CheckIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <XMarkIcon className="w-5 h-5 text-red-600" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getPermissionsForRole('project_manager').includes(permission) ? (
                        <CheckIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <XMarkIcon className="w-5 h-5 text-red-600" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getPermissionsForRole('admin').includes(permission) ? (
                        <CheckIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <XMarkIcon className="w-5 h-5 text-red-600" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserRoleManager; 