import React, { useState } from 'react';
import { Card } from '../ui';
import { usePermissions, type Permission, type UserRole } from '../../hooks/usePermissions';
import PermissionGuard from './PermissionGuard';
import PermissionButton from './PermissionGuard';
import UserRoleManager from './UserRoleManager';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  DocumentArrowDownIcon,
  CogIcon,
  UserGroupIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const PermissionsTest: React.FC = () => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    checkPermission,
    currentRole, 
    currentPermissions,
    updateUserRole,
    getPermissionsForRole,
    getAllPermissions 
  } = usePermissions();

  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');
  const [testProjectId, setTestProjectId] = useState<string>('demo-project-1');
  const [testPermission, setTestPermission] = useState<Permission>('view_tasks');

  const handleRoleChange = async (newRole: UserRole) => {
    setSelectedRole(newRole);
    // In a real app, this would update the current user's role
    // For demo purposes, we'll just simulate it
    console.log(`Switching to role: ${newRole}`);
  };

  const testPermissions: Permission[] = [
    'view_projects',
    'edit_projects',
    'delete_projects',
    'create_projects',
    'view_tasks',
    'edit_tasks',
    'delete_tasks',
    'create_tasks',
    'view_links',
    'edit_links',
    'delete_links',
    'create_links',
    'view_resources',
    'edit_resources',
    'delete_resources',
    'create_resources',
    'view_reports',
    'export_data',
    'import_data',
    'manage_users',
    'manage_roles',
    'view_analytics',
    'edit_analytics',
    'view_settings',
    'edit_settings',
    'view_activity_log',
    'delete_activity_log'
  ];

  const getPermissionIcon = (permission: Permission) => {
    if (permission.includes('view')) return <EyeIcon className="w-4 h-4" />;
    if (permission.includes('edit')) return <PencilIcon className="w-4 h-4" />;
    if (permission.includes('delete')) return <TrashIcon className="w-4 h-4" />;
    if (permission.includes('create')) return <PlusIcon className="w-4 h-4" />;
    if (permission.includes('export')) return <DocumentArrowDownIcon className="w-4 h-4" />;
    if (permission.includes('manage')) return <UserGroupIcon className="w-4 h-4" />;
    if (permission.includes('settings')) return <CogIcon className="w-4 h-4" />;
    return <ShieldCheckIcon className="w-4 h-4" />;
  };

  const getPermissionColor = (hasPermission: boolean) => {
    return hasPermission 
      ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200' 
      : 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Permissions System Test</h2>
        <p className="text-purple-100">
          Test the role-based access control system with different user roles and permissions.
        </p>
      </div>

      {/* Role Selector */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Role</h3>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Role:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
                {currentRole || 'Not Set'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="project_manager">Project Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Project ID
              </label>
              <input
                type="text"
                value={testProjectId}
                onChange={(e) => setTestProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project ID for testing"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Permission
              </label>
              <select
                value={testPermission}
                onChange={(e) => setTestPermission(e.target.value as Permission)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {testPermissions.map((permission) => (
                  <option key={permission} value={permission}>
                    {permission.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Permission Test Results */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permission Test Results</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Single Permission</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Permission:</span>
                    <span className="text-sm font-medium">{testPermission.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Has Permission:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPermissionColor(hasPermission(testPermission, testProjectId))}`}>
                      {hasPermission(testPermission, testProjectId) ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {checkPermission(testPermission, testProjectId).reason}
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Any Permission</h4>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Can edit tasks OR create tasks:
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Result:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPermissionColor(hasAnyPermission(['edit_tasks', 'create_tasks'], testProjectId))}`}>
                      {hasAnyPermission(['edit_tasks', 'create_tasks'], testProjectId) ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">All Permissions</h4>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Can view AND edit tasks:
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Result:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPermissionColor(hasAllPermissions(['view_tasks', 'edit_tasks'], testProjectId))}`}>
                      {hasAllPermissions(['view_tasks', 'edit_tasks'], testProjectId) ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Permission Guard Examples */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permission Guard Examples</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <PermissionGuard permission="create_tasks" projectId={testProjectId}>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Create Task</h4>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    This content is visible because you have permission to create tasks.
                  </p>
                </div>
              </PermissionGuard>

              <PermissionGuard permission="delete_tasks" projectId={testProjectId}>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Delete Task</h4>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    This content is visible because you have permission to delete tasks.
                  </p>
                </div>
              </PermissionGuard>

              <PermissionGuard permission="manage_users" projectId={testProjectId}>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Manage Users</h4>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    This content is visible because you have permission to manage users.
                  </p>
                </div>
              </PermissionGuard>

              <PermissionGuard permission="export_data" projectId={testProjectId}>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Export Data</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    This content is visible because you have permission to export data.
                  </p>
                </div>
              </PermissionGuard>
            </div>
          </div>
        </div>
      </Card>

      {/* Permission Button Examples */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permission Button Examples</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <PermissionButton
                permission="create_tasks"
                projectId={testProjectId}
                onClick={() => console.log('Create task clicked')}
                variant="primary"
                showTooltip={true}
              >
                Create Task
              </PermissionButton>

              <PermissionButton
                permission="edit_tasks"
                projectId={testProjectId}
                onClick={() => console.log('Edit task clicked')}
                variant="secondary"
                showTooltip={true}
              >
                Edit Task
              </PermissionButton>

              <PermissionButton
                permission="delete_tasks"
                projectId={testProjectId}
                onClick={() => console.log('Delete task clicked')}
                variant="danger"
                showTooltip={true}
              >
                Delete Task
              </PermissionButton>

              <PermissionButton
                permission="export_data"
                projectId={testProjectId}
                onClick={() => console.log('Export clicked')}
                variant="ghost"
                showTooltip={true}
              >
                Export Data
              </PermissionButton>
            </div>
          </div>
        </div>
      </Card>

      {/* All Permissions Matrix */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Permissions Matrix</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Permission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Required Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {testPermissions.map((permission) => {
                  const check = checkPermission(permission, testProjectId);
                  return (
                    <tr key={permission}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getPermissionIcon(permission)}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {permission.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPermissionColor(check.hasPermission)}`}>
                          {check.hasPermission ? 'Allowed' : 'Denied'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {check.requiredRole || 'Unknown'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* User Role Manager */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Role Manager</h3>
          <UserRoleManager />
        </div>
      </Card>
    </div>
  );
};

export default PermissionsTest; 