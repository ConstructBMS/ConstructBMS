import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import {
  User,
  Role,
  Permission,
  SystemRoles,
  Permissions,
} from '../../types/auth';
import PermissionGuard from '../auth/PermissionGuard';
import {
  Users,
  Shield,
  Key,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

const UserManagement: React.FC = () => {
  const { user: currentUser, checkPermission, checkRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>(
    'users'
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData, permissionsData] = await Promise.all([
        authService.getUsers(),
        authService.getRoles(),
        authService.getPermissions(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case SystemRoles.SUPER_ADMIN:
        return 'bg-red-100 text-red-800 border-red-200';
      case SystemRoles.ADMIN:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case SystemRoles.EMPLOYEE:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPermissionIcon = (permission: Permission) => {
    if (permission.resource === 'menu') return <Shield className='h-4 w-4' />;
    if (permission.resource === 'users') return <Users className='h-4 w-4' />;
    if (permission.resource === 'roles') return <Shield className='h-4 w-4' />;
    if (permission.resource === 'permissions')
      return <Key className='h-4 w-4' />;
    return <Key className='h-4 w-4' />;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-archer-neon'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              User Management
            </h1>
            <p className='text-gray-600 mt-1'>
              Manage users, roles, and permissions for your organization
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='text-sm text-gray-500'>
              Logged in as:{' '}
              <span className='font-medium'>
                {currentUser?.firstName} {currentUser?.lastName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-archer-neon text-archer-neon'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className='inline h-4 w-4 mr-2' />
              Users ({users.length})
            </button>
            <PermissionGuard permissions={[Permissions.ROLES_VIEW]}>
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-archer-neon text-archer-neon'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className='inline h-4 w-4 mr-2' />
                Roles ({roles.length})
              </button>
            </PermissionGuard>
            <PermissionGuard permissions={[Permissions.PERMISSIONS_VIEW]}>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'permissions'
                    ? 'border-archer-neon text-archer-neon'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Key className='inline h-4 w-4 mr-2' />
                Permissions ({permissions.length})
              </button>
            </PermissionGuard>
          </nav>
        </div>

        <div className='p-6'>
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <h3 className='text-lg font-medium text-gray-900'>
                  System Users
                </h3>
                <PermissionGuard permissions={[Permissions.USERS_CREATE]}>
                  <button className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-archer-neon hover:bg-archer-black transition-colors'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add User
                  </button>
                </PermissionGuard>
              </div>

              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        User
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Email
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {users.map(user => (
                      <tr key={user.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center'>
                            <div className='w-8 h-8 rounded-full bg-archer-neon flex items-center justify-center'>
                              <span className='text-sm font-medium text-black'>
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                              </span>
                            </div>
                            <div className='ml-4'>
                              <div className='text-sm font-medium text-gray-900'>
                                {user.firstName} {user.lastName}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {user.email}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <CheckCircle className='h-3 w-3 mr-1' />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className='h-3 w-3 mr-1' />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <div className='flex space-x-2'>
                            <PermissionGuard
                              permissions={[Permissions.USERS_VIEW]}
                            >
                              <button className='text-archer-neon hover:text-archer-black'>
                                <Eye className='h-4 w-4' />
                              </button>
                            </PermissionGuard>
                            <PermissionGuard
                              permissions={[Permissions.USERS_EDIT]}
                            >
                              <button className='text-blue-600 hover:text-blue-900'>
                                <Edit className='h-4 w-4' />
                              </button>
                            </PermissionGuard>
                            <PermissionGuard
                              permissions={[Permissions.USERS_DELETE]}
                            >
                              <button className='text-red-600 hover:text-red-900'>
                                <Trash2 className='h-4 w-4' />
                              </button>
                            </PermissionGuard>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <h3 className='text-lg font-medium text-gray-900'>
                  System Roles
                </h3>
                <PermissionGuard permissions={[Permissions.ROLES_CREATE]}>
                  <button className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-archer-neon hover:bg-archer-black transition-colors'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Role
                  </button>
                </PermissionGuard>
              </div>

              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {roles.map(role => (
                  <div
                    key={role.id}
                    className='bg-gray-50 rounded-lg p-4 border border-gray-200'
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='text-sm font-medium text-gray-900'>
                        {role.name}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role.name)}`}
                      >
                        {role.isSystemRole ? 'System' : 'Custom'}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 mb-3'>
                      {role.description}
                    </p>
                    <div className='flex space-x-2'>
                      <PermissionGuard permissions={[Permissions.ROLES_VIEW]}>
                        <button className='text-archer-neon hover:text-archer-black'>
                          <Eye className='h-4 w-4' />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permissions={[Permissions.ROLES_EDIT]}>
                        <button className='text-blue-600 hover:text-blue-900'>
                          <Edit className='h-4 w-4' />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permissions={[Permissions.ROLES_DELETE]}>
                        <button className='text-red-600 hover:text-red-900'>
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </PermissionGuard>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <h3 className='text-lg font-medium text-gray-900'>
                  System Permissions
                </h3>
                <PermissionGuard permissions={[Permissions.PERMISSIONS_CREATE]}>
                  <button className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-archer-neon hover:bg-archer-black transition-colors'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Permission
                  </button>
                </PermissionGuard>
              </div>

              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Permission
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Resource
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Action
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Type
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {permissions.map(permission => (
                      <tr key={permission.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center'>
                            {getPermissionIcon(permission)}
                            <div className='ml-3'>
                              <div className='text-sm font-medium text-gray-900'>
                                {permission.name}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {permission.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {permission.resource}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {permission.action}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              permission.isSystemPermission
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {permission.isSystemPermission
                              ? 'System'
                              : 'Custom'}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <div className='flex space-x-2'>
                            <PermissionGuard
                              permissions={[Permissions.PERMISSIONS_VIEW]}
                            >
                              <button className='text-archer-neon hover:text-archer-black'>
                                <Eye className='h-4 w-4' />
                              </button>
                            </PermissionGuard>
                            <PermissionGuard
                              permissions={[Permissions.PERMISSIONS_EDIT]}
                            >
                              <button className='text-blue-600 hover:text-blue-900'>
                                <Edit className='h-4 w-4' />
                              </button>
                            </PermissionGuard>
                            <PermissionGuard
                              permissions={[Permissions.PERMISSIONS_DELETE]}
                            >
                              <button className='text-red-600 hover:text-red-900'>
                                <Trash2 className='h-4 w-4' />
                              </button>
                            </PermissionGuard>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permission Info */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex'>
          <AlertTriangle className='h-5 w-5 text-blue-400 mt-0.5' />
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-blue-800'>
              Permission-Based Access Control
            </h3>
            <div className='mt-2 text-sm text-blue-700'>
              <p>
                This page demonstrates role-based access control. Different
                users see different options based on their permissions:
              </p>
              <ul className='mt-1 list-disc list-inside space-y-1'>
                <li>
                  <strong>Super Admin:</strong> Can view, create, edit, and
                  delete users, roles, and permissions
                </li>
                <li>
                  <strong>Admin:</strong> Can view and edit users, but has
                  limited role/permission access
                </li>
                <li>
                  <strong>Employee:</strong> Can only view basic information
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
