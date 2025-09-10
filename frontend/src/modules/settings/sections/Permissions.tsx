/**
 * Enterprise Permissions Management Section
 * 
 * Comprehensive permissions management with custom roles, granular permissions,
 * and enterprise-grade access control.
 */

import {
  Building2,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useEnterprisePermissionsStore } from '../../../app/store/enterprise-permissions.store';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui';
import type { CustomRole, EnterpriseUser } from '../../../lib/types/enterprise-permissions';

export function Permissions() {
  const {
    roles,
    users,
    selectedRole,
    selectedUser,
    isMatrixView,
    isCreatingRole,
    isCreatingUser,
    getRoleSummary,
    getUserSummary,
    getPermissionSummary,
    setSelectedRole,
    setSelectedUser,
    setMatrixView,
    setCreatingRole,
    setCreatingUser,
    createRole,
    createUser,
    updateRole,
    updateUser,
    deleteRole,
    deleteUser,
    duplicateRole,
    assignRole,
    removeRole,
  } = useEnterprisePermissionsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom'>('all');
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const roleSummary = getRoleSummary();
  const userSummary = getUserSummary();
  const permissionSummary = getPermissionSummary();

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'system' && role.isSystem) ||
                         (filterType === 'custom' && !role.isSystem);
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleRoleExpansion = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const handleCreateRole = async () => {
    try {
      await createRole({
        name: 'new_role',
        displayName: 'New Role',
        description: 'A new custom role',
        permissions: [],
      });
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser({
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        displayName: 'New User',
        primaryRole: roles[0]?.id || '',
        additionalRoles: [],
        customPermissions: [],
        restrictions: [],
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleDuplicateRole = async (roleId: string) => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (role) {
        await duplicateRole(roleId, `${role.name}_copy`);
      }
    } catch (error) {
      console.error('Failed to duplicate role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(roleId);
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold'>Enterprise Permissions</h2>
          <p className='text-muted-foreground'>
            Manage roles, users, and granular permissions with enterprise-grade access control.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => setMatrixView(!isMatrixView)}
            className='flex items-center gap-2'
          >
            <Shield className='h-4 w-4' />
            {isMatrixView ? 'List View' : 'Matrix View'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Roles</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{roleSummary.totalRoles}</div>
            <p className='text-xs text-muted-foreground'>
              {roleSummary.customRoles} custom, {roleSummary.systemRoles} system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Users</CardTitle>
            <User className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{userSummary.totalUsers}</div>
            <p className='text-xs text-muted-foreground'>
              {userSummary.activeUsers} active, {userSummary.verifiedUsers} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Permissions</CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{permissionSummary.totalPermissions}</div>
            <p className='text-xs text-muted-foreground'>
              {permissionSummary.grantedPermissions} granted, {permissionSummary.deniedPermissions} denied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='roles' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='roles'>Roles & Permissions</TabsTrigger>
          <TabsTrigger value='users'>Users & Access</TabsTrigger>
          <TabsTrigger value='matrix'>Permission Matrix</TabsTrigger>
          <TabsTrigger value='audit'>Audit Logs</TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value='roles' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search roles...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10 w-64'
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Roles</SelectItem>
                  <SelectItem value='system'>System</SelectItem>
                  <SelectItem value='custom'>Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateRole} className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              Create Role
            </Button>
          </div>

          <div className='space-y-2'>
            {filteredRoles.map((role) => (
              <Card key={role.id} className='cursor-pointer hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() => toggleRoleExpansion(role.id)}
                        className='p-1 hover:bg-muted rounded'
                      >
                        {expandedRoles.has(role.id) ? (
                          <ChevronDown className='h-4 w-4' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                      </button>
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{ backgroundColor: role.color }}
                        />
                        <div>
                          <h3 className='font-medium'>{role.displayName}</h3>
                          <p className='text-sm text-muted-foreground'>{role.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        role.isSystem 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {role.isSystem ? 'System' : 'Custom'}
                      </span>
                      <div className='flex items-center gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setSelectedRole(role.id)}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDuplicateRole(role.id)}
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                        {!role.isSystem && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {expandedRoles.has(role.id) && (
                  <CardContent className='pt-0'>
                    <div className='space-y-4'>
                      <div>
                        <h4 className='font-medium mb-2'>Permissions ({role.permissions.length})</h4>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                          {role.permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className='flex items-center justify-between p-2 bg-muted rounded'
                            >
                              <span className='text-sm'>
                                {permission.resource}.{permission.action}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                permission.granted
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {permission.granted ? 'Granted' : 'Denied'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {role.inheritance && role.inheritance.length > 0 && (
                        <div>
                          <h4 className='font-medium mb-2'>Inherits From</h4>
                          <div className='flex flex-wrap gap-2'>
                            {role.inheritance.map((inheritedRoleId) => {
                              const inheritedRole = roles.find(r => r.id === inheritedRoleId);
                              return inheritedRole ? (
                                <span
                                  key={inheritedRoleId}
                                  className='px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded'
                                >
                                  {inheritedRole.displayName}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value='users' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search users...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10 w-64'
              />
            </div>
            <Button onClick={handleCreateUser} className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              Create User
            </Button>
          </div>

          <div className='space-y-2'>
            {filteredUsers.map((user) => {
              const userRoles = [user.primaryRole, ...user.additionalRoles]
                .map(roleId => roles.find(role => role.id === roleId))
                .filter(Boolean) as CustomRole[];

              return (
                <Card key={user.id} className='cursor-pointer hover:shadow-md transition-shadow'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <button
                          onClick={() => toggleUserExpansion(user.id)}
                          className='p-1 hover:bg-muted rounded'
                        >
                          {expandedUsers.has(user.id) ? (
                            <ChevronDown className='h-4 w-4' />
                          ) : (
                            <ChevronRight className='h-4 w-4' />
                          )}
                        </button>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center'>
                            <span className='text-sm font-medium text-primary-foreground'>
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className='font-medium'>{user.displayName}</h3>
                            <p className='text-sm text-muted-foreground'>{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setSelectedUser(user.id)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedUsers.has(user.id) && (
                    <CardContent className='pt-0'>
                      <div className='space-y-4'>
                        <div>
                          <h4 className='font-medium mb-2'>Roles ({userRoles.length})</h4>
                          <div className='flex flex-wrap gap-2'>
                            {userRoles.map((role) => (
                              <span
                                key={role.id}
                                className='px-2 py-1 text-xs rounded-full flex items-center gap-1'
                                style={{ 
                                  backgroundColor: `${role.color}20`,
                                  color: role.color,
                                  border: `1px solid ${role.color}40`
                                }}
                              >
                                {role.displayName}
                                {role.id === user.primaryRole && (
                                  <span className='text-xs'>(Primary)</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {user.customPermissions.length > 0 && (
                          <div>
                            <h4 className='font-medium mb-2'>Custom Permissions ({user.customPermissions.length})</h4>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                              {user.customPermissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className='flex items-center justify-between p-2 bg-muted rounded'
                                >
                                  <span className='text-sm'>
                                    {permission.resource}.{permission.action}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    permission.granted
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {permission.granted ? 'Granted' : 'Denied'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Permission Matrix Tab */}
        <TabsContent value='matrix' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Visual representation of roles and their permissions across all resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-muted-foreground'>
                <Shield className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Permission Matrix view coming soon...</p>
                <p className='text-sm'>This will show a comprehensive grid of roles vs permissions.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value='audit' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Track all permission changes and access attempts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-muted-foreground'>
                <UserCheck className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Audit logging coming soon...</p>
                <p className='text-sm'>This will show detailed logs of all permission changes.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
