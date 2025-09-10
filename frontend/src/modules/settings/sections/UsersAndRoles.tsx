/**
 * Users & Roles Management Section
 *
 * Advanced user management with role assignment, custom permissions,
 * and granular access control.
 */

import {
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useEnterprisePermissionsStore } from '../../../app/store/enterprise-permissions.store';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
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
import type {
  CustomRole,
  EnterpriseUser,
} from '../../../lib/types/enterprise-permissions';

export function UsersAndRoles() {
  const {
    roles,
    users,
    selectedRole,
    selectedUser,
    isCreatingRole,
    isCreatingUser,
    getRoleSummary,
    getUserSummary,
    setSelectedRole,
    setSelectedUser,
    setCreatingRole,
    setCreatingUser,
    createRole,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    removeRole,
    addCustomPermission,
    removeCustomPermission,
  } = useEnterprisePermissionsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'inactive' | 'verified' | 'unverified'
  >('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  const roleSummary = getRoleSummary();
  const userSummary = getUserSummary();

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive) ||
      (filterStatus === 'verified' && user.isVerified) ||
      (filterStatus === 'unverified' && !user.isVerified);

    const matchesRole =
      filterRole === 'all' ||
      user.primaryRole === filterRole ||
      user.additionalRoles.includes(filterRole);

    return matchesSearch && matchesStatus && matchesRole;
  });

  const filteredRoles = roles.filter(role => {
    const matchesSearch =
      role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const toggleRoleExpansion = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
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

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      await assignRole(userId, roleId);
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      await removeRole(userId, roleId);
    } catch (error) {
      console.error('Failed to remove role:', error);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await updateUser(userId, { isActive });
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleToggleUserVerification = async (
    userId: string,
    isVerified: boolean
  ) => {
    try {
      await updateUser(userId, { isVerified });
    } catch (error) {
      console.error('Failed to update user verification:', error);
    }
  };

  const getUserInitials = (user: EnterpriseUser) => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getUserRoles = (user: EnterpriseUser) => {
    return [user.primaryRole, ...user.additionalRoles]
      .map(roleId => roles.find(role => role.id === roleId))
      .filter(Boolean) as CustomRole[];
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold'>Users & Roles</h2>
          <p className='text-muted-foreground'>
            Manage users, assign roles, and configure granular access
            permissions.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => setCreatingRole(true)}
            className='flex items-center gap-2'
          >
            <Shield className='h-4 w-4' />
            Create Role
          </Button>
          <Button
            onClick={() => setCreatingUser(true)}
            className='flex items-center gap-2'
          >
            <UserPlus className='h-4 w-4' />
            Create User
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{userSummary.totalUsers}</div>
            <p className='text-xs text-muted-foreground'>
              {userSummary.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Verified Users
            </CardTitle>
            <UserCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {userSummary.verifiedUsers}
            </div>
            <p className='text-xs text-muted-foreground'>
              {userSummary.totalUsers - userSummary.verifiedUsers} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Custom Permissions
            </CardTitle>
            <Settings className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {userSummary.usersWithCustomPermissions}
            </div>
            <p className='text-xs text-muted-foreground'>
              users with custom access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Roles</CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{roleSummary.totalRoles}</div>
            <p className='text-xs text-muted-foreground'>
              {roleSummary.customRoles} custom, {roleSummary.systemRoles} system
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='users' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='roles'>Roles</TabsTrigger>
          <TabsTrigger value='assignments'>Role Assignments</TabsTrigger>
          <TabsTrigger value='permissions'>Custom Permissions</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value='users' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search users...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10 w-64'
                />
              </div>
              <Select
                value={filterStatus}
                onValueChange={(value: any) => setFilterStatus(value)}
              >
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                  <SelectItem value='verified'>Verified</SelectItem>
                  <SelectItem value='unverified'>Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterRole}
                onValueChange={(value: any) => setFilterRole(value)}
              >
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreateUser}
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Create User
            </Button>
          </div>

          <div className='space-y-2'>
            {filteredUsers.map(user => {
              const userRoles = getUserRoles(user);
              const primaryRole = roles.find(
                role => role.id === user.primaryRole
              );

              return (
                <Card
                  key={user.id}
                  className='cursor-pointer hover:shadow-md transition-shadow'
                >
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
                        <Avatar className='h-10 w-10'>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className='font-medium'>{user.displayName}</h3>
                          <p className='text-sm text-muted-foreground'>
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1'>
                          <Badge
                            variant={user.isActive ? 'default' : 'secondary'}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge
                            variant={user.isVerified ? 'default' : 'outline'}
                          >
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </div>
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
                            onClick={() =>
                              handleToggleUserStatus(user.id, !user.isActive)
                            }
                          >
                            {user.isActive ? (
                              <UserX className='h-4 w-4' />
                            ) : (
                              <UserCheck className='h-4 w-4' />
                            )}
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
                          <h4 className='font-medium mb-2'>Role Information</h4>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <label className='text-sm font-medium text-muted-foreground'>
                                Primary Role
                              </label>
                              <div className='flex items-center gap-2 mt-1'>
                                {primaryRole && (
                                  <>
                                    <div
                                      className='w-3 h-3 rounded-full'
                                      style={{
                                        backgroundColor: primaryRole.color,
                                      }}
                                    />
                                    <span className='text-sm'>
                                      {primaryRole.displayName}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className='text-sm font-medium text-muted-foreground'>
                                Additional Roles
                              </label>
                              <div className='flex flex-wrap gap-1 mt-1'>
                                {user.additionalRoles.map(roleId => {
                                  const role = roles.find(r => r.id === roleId);
                                  return role ? (
                                    <Badge
                                      key={roleId}
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      {role.displayName}
                                    </Badge>
                                  ) : null;
                                })}
                                {user.additionalRoles.length === 0 && (
                                  <span className='text-sm text-muted-foreground'>
                                    None
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className='font-medium mb-2'>User Details</h4>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                            <div>
                              <span className='text-muted-foreground'>
                                Created:
                              </span>
                              <span className='ml-2'>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                Last Login:
                              </span>
                              <span className='ml-2'>
                                {user.lastLoginAt
                                  ? new Date(
                                      user.lastLoginAt
                                    ).toLocaleDateString()
                                  : 'Never'}
                              </span>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                Custom Permissions:
                              </span>
                              <span className='ml-2'>
                                {user.customPermissions.length}
                              </span>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                Restrictions:
                              </span>
                              <span className='ml-2'>
                                {user.restrictions.length}
                              </span>
                            </div>
                          </div>
                        </div>

                        {user.customPermissions.length > 0 && (
                          <div>
                            <h4 className='font-medium mb-2'>
                              Custom Permissions (
                              {user.customPermissions.length})
                            </h4>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                              {user.customPermissions.map(permission => (
                                <div
                                  key={permission.id}
                                  className='flex items-center justify-between p-2 bg-muted rounded'
                                >
                                  <span className='text-sm'>
                                    {permission.resource}.{permission.action}
                                  </span>
                                  <div className='flex items-center gap-2'>
                                    <Badge
                                      variant={
                                        permission.granted
                                          ? 'default'
                                          : 'destructive'
                                      }
                                    >
                                      {permission.granted
                                        ? 'Granted'
                                        : 'Denied'}
                                    </Badge>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() =>
                                        removeCustomPermission(
                                          user.id,
                                          permission.id
                                        )
                                      }
                                    >
                                      <Trash2 className='h-3 w-3' />
                                    </Button>
                                  </div>
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

        {/* Roles Tab */}
        <TabsContent value='roles' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search roles...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 w-64'
              />
            </div>
            <Button
              onClick={handleCreateRole}
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Create Role
            </Button>
          </div>

          <div className='space-y-2'>
            {filteredRoles.map(role => {
              const usersWithRole = users.filter(
                user =>
                  user.primaryRole === role.id ||
                  user.additionalRoles.includes(role.id)
              );

              return (
                <Card
                  key={role.id}
                  className='cursor-pointer hover:shadow-md transition-shadow'
                >
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
                            <p className='text-sm text-muted-foreground'>
                              {role.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={role.isSystem ? 'default' : 'secondary'}
                        >
                          {role.isSystem ? 'System' : 'Custom'}
                        </Badge>
                        <Badge variant='outline'>
                          {usersWithRole.length} users
                        </Badge>
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
                            onClick={() => {
                              /* TODO: Edit role */
                            }}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedRoles.has(role.id) && (
                    <CardContent className='pt-0'>
                      <div className='space-y-4'>
                        <div>
                          <h4 className='font-medium mb-2'>
                            Permissions ({role.permissions.length})
                          </h4>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                            {role.permissions.map(permission => (
                              <div
                                key={permission.id}
                                className='flex items-center justify-between p-2 bg-muted rounded'
                              >
                                <span className='text-sm'>
                                  {permission.resource}.{permission.action}
                                </span>
                                <Badge
                                  variant={
                                    permission.granted
                                      ? 'default'
                                      : 'destructive'
                                  }
                                >
                                  {permission.granted ? 'Granted' : 'Denied'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className='font-medium mb-2'>
                            Users with this Role ({usersWithRole.length})
                          </h4>
                          <div className='flex flex-wrap gap-2'>
                            {usersWithRole.map(user => (
                              <div
                                key={user.id}
                                className='flex items-center gap-2 p-2 bg-muted rounded'
                              >
                                <Avatar className='h-6 w-6'>
                                  <AvatarFallback className='text-xs'>
                                    {getUserInitials(user)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className='text-sm'>
                                  {user.displayName}
                                </span>
                                {user.primaryRole === role.id && (
                                  <Badge variant='outline' className='text-xs'>
                                    Primary
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Role Assignments Tab */}
        <TabsContent value='assignments' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Role Assignments</CardTitle>
              <CardDescription>
                Manage role assignments and user access levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-muted-foreground'>
                <Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Role assignment management coming soon...</p>
                <p className='text-sm'>
                  This will provide a comprehensive interface for managing role
                  assignments.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Permissions Tab */}
        <TabsContent value='permissions' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Custom Permissions</CardTitle>
              <CardDescription>
                Manage custom permissions and access overrides for specific
                users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-muted-foreground'>
                <Settings className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Custom permissions management coming soon...</p>
                <p className='text-sm'>
                  This will allow granular permission overrides for individual
                  users.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
