import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getIconStrict } from '@/design/icons';
import { useToast } from '@/hooks/use-toast';
import React, { useCallback, useEffect, useState } from 'react';
import { Permission } from '../types/index';

// Define interfaces locally to avoid import issues
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PermissionMatrix {
  roles: Role[];
  permissions: Permission[];
  matrix: Record<string, Record<string, boolean>>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UsersAndRolesProps {
  // Component props interface
}

const UsersAndRoles: React.FC<UsersAndRolesProps> = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionMatrix, setPermissionMatrix] =
    useState<PermissionMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars

  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      // Fetch users
      const usersResponse = await fetch('http://localhost:5174/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('Users response:', usersData);
        const usersArray = Array.isArray(usersData.data) ? usersData.data : [];
        console.log('Setting users to:', usersArray);
        setUsers(usersArray);
      } else {
        console.error(
          'Error fetching users:',
          usersResponse.status,
          usersResponse.statusText
        );
        setUsers([]);
      }

      // Fetch roles
      const rolesResponse = await fetch('http://localhost:5174/api/roles', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(Array.isArray(rolesData.data) ? rolesData.data : []);
      } else {
        console.error(
          'Error fetching roles:',
          rolesResponse.status,
          rolesResponse.statusText
        );
        setRoles([]);
      }

      // Fetch permissions
      const permissionsResponse = await fetch(
        'http://localhost:5174/api/roles/permissions/list',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setPermissions(
          Array.isArray(permissionsData.data) ? permissionsData.data : []
        );
      } else {
        console.error(
          'Error fetching permissions:',
          permissionsResponse.status,
          permissionsResponse.statusText
        );
        setPermissions([]);
      }

      // Fetch permission matrix (super admin only)
      if (isSuperAdmin) {
        const matrixResponse = await fetch(
          'http://localhost:5174/api/roles/permissions/matrix',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (matrixResponse.ok) {
          const matrixData = await matrixResponse.json();
          setPermissionMatrix(matrixData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5174/api/auth/register', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
        setShowCreateUserDialog(false);
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to create user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const handleCreateRole = async (roleData: Partial<Role>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5174/api/roles', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Role created successfully',
        });
        setShowCreateRoleDialog(false);
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to create role',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to create role',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (roleId: string, roleData: Partial<Role>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:5174/api/roles/${roleId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(roleData),
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Role updated successfully',
        });
        setEditingRole(null);
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to update role',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:5174/api/roles/${roleId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Role deleted successfully',
        });
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete role',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete role',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePermissionMatrix = async (
    matrix: Record<string, Record<string, boolean>>
  ) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        'http://localhost:5174/api/roles/permissions/matrix',
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ matrix }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Permissions matrix updated successfully',
        });
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to update permissions matrix',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating permissions matrix:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permissions matrix',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Users & Roles Management
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mt-2'>
          Manage users, roles, and permissions for the ConstructBMS system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='users'>Users & Roles</TabsTrigger>
          <TabsTrigger value='permissions' disabled={!isSuperAdmin}>
            Permissions Matrix {!isSuperAdmin && '(Super Admin Only)'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='users' className='mt-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Users Section */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                      Manage system users and their roles
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button onClick={() => setShowCreateUserDialog(true)}>
                      {getIconStrict('plus')} Add User
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {Array.isArray(users) ? (
                    users.map(user => (
                      <div
                        key={user.id}
                        className='flex items-center justify-between p-3 border rounded-lg'
                      >
                        <div>
                          <div className='font-medium'>{user.name}</div>
                          <div className='text-sm text-gray-500'>
                            {user.email}
                          </div>
                          <Badge
                            variant={
                              user.role === 'super_admin'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {user.role}
                          </Badge>
                        </div>
                        {isAdmin && user.id !== currentUser?.id && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setEditingUser(user)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-4 text-gray-500'>
                      {loading
                        ? 'Loading users...'
                        : 'No users found or error loading users'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Roles Section */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Roles</CardTitle>
                    <CardDescription>
                      Manage user roles and their permissions
                    </CardDescription>
                  </div>
                  {isSuperAdmin && (
                    <Button onClick={() => setShowCreateRoleDialog(true)}>
                      {getIconStrict('plus')} Add Role
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {Array.isArray(roles) ? (
                    roles.map(role => (
                      <div
                        key={role.id}
                        className='flex items-center justify-between p-3 border rounded-lg'
                      >
                        <div>
                          <div className='font-medium'>{role.name}</div>
                          <div className='text-sm text-gray-500'>
                            {role.description}
                          </div>
                          <div className='flex gap-1 mt-1'>
                            <Badge
                              variant={role.isSystem ? 'default' : 'secondary'}
                            >
                              {role.isSystem ? 'System' : 'Custom'}
                            </Badge>
                            <Badge variant='outline'>
                              {role.permissions.length} permissions
                            </Badge>
                          </div>
                        </div>
                        {isSuperAdmin && !role.isSystem && (
                          <div className='flex gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setEditingRole(role)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant='destructive'
                              size='sm'
                              onClick={() => handleDeleteRole(role.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-4 text-gray-500'>
                      {loading
                        ? 'Loading roles...'
                        : 'No roles found or error loading roles'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='permissions' className='mt-6'>
          {isSuperAdmin ? (
            <PermissionsMatrix
              permissionMatrix={permissionMatrix}
              onUpdateMatrix={handleUpdatePermissionMatrix}
            />
          ) : (
            <Card>
              <CardContent className='p-6'>
                <div className='text-center'>
                  <div className='text-lg font-medium mb-2'>
                    Access Restricted
                  </div>
                  <div className='text-gray-500'>
                    Only Super Administrators can access the permissions matrix.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={showCreateUserDialog}
        onOpenChange={setShowCreateUserDialog}
        roles={roles}
        onCreateUser={handleCreateUser}
      />

      {/* Create Role Dialog */}
      <CreateRoleDialog
        open={showCreateRoleDialog}
        onOpenChange={setShowCreateRoleDialog}
        permissions={permissions}
        onCreateRole={handleCreateRole}
      />

      {/* Edit Role Dialog */}
      {editingRole && (
        <EditRoleDialog
          open={!!editingRole}
          onOpenChange={() => setEditingRole(null)}
          role={editingRole}
          permissions={permissions}
          onUpdateRole={handleUpdateRole}
        />
      )}
    </div>
  );
};

// Permissions Matrix Component
interface PermissionsMatrixProps {
  permissionMatrix: PermissionMatrix | null;
  onUpdateMatrix: (matrix: Record<string, Record<string, boolean>>) => void;
}

const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({
  permissionMatrix,
  onUpdateMatrix,
}) => {
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>(
    {}
  );

  useEffect(() => {
    if (permissionMatrix) {
      setMatrix(permissionMatrix.matrix);
    }
  }, [permissionMatrix]);

  const handlePermissionChange = (
    roleId: string,
    permission: string,
    checked: boolean
  ) => {
    setMatrix(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permission]: checked,
      },
    }));
  };

  const handleSave = () => {
    onUpdateMatrix(matrix);
  };

  if (!permissionMatrix) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center'>Loading permissions matrix...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Permissions Matrix</CardTitle>
            <CardDescription>
              Configure permissions for each role. Super Admin has override
              capabilities.
            </CardDescription>
          </div>
          <Button onClick={handleSave}>
            {getIconStrict('save')} Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-48'>Permission</TableHead>
                {permissionMatrix.roles.map(role => (
                  <TableHead key={role.id} className='text-center'>
                    <div className='flex flex-col items-center'>
                      <div className='font-medium'>{role.name}</div>
                      <Badge
                        variant={role.isSystem ? 'default' : 'secondary'}
                        className='text-xs'
                      >
                        {role.isSystem ? 'System' : 'Custom'}
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionMatrix.permissions.map(permission => (
                <TableRow key={permission}>
                  <TableCell className='font-medium'>
                    <div className='flex flex-col'>
                      <div>{permission}</div>
                      <div className='text-xs text-gray-500'>
                        {getPermissionDescription(permission)}
                      </div>
                    </div>
                  </TableCell>
                  {permissionMatrix.roles.map(role => (
                    <TableCell key={role.id} className='text-center'>
                      <Checkbox
                        checked={matrix[role.id]?.[permission] || false}
                        onCheckedChange={checked =>
                          handlePermissionChange(
                            role.id,
                            permission,
                            checked as boolean
                          )
                        }
                        disabled={role.isSystem && role.name === 'super_admin'}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get permission descriptions
const getPermissionDescription = (permission: string): string => {
  const descriptions: Record<string, string> = {
    'user:create': 'Create new users',
    'user:read': 'View user information',
    'user:update': 'Update user details',
    'user:delete': 'Delete users',
    'user:role:assign': 'Assign roles to users',
    'role:create': 'Create new roles',
    'role:read': 'View role information',
    'role:update': 'Update role details',
    'role:delete': 'Delete roles',
    'role:permission:assign': 'Assign permissions to roles',
    'project:create': 'Create new projects',
    'project:read': 'View project information',
    'project:update': 'Update project details',
    'project:delete': 'Delete projects',
    'project:assign': 'Assign projects to users',
    'client:create': 'Create new clients',
    'client:read': 'View client information',
    'client:update': 'Update client details',
    'client:delete': 'Delete clients',
    'task:create': 'Create new tasks',
    'task:read': 'View task information',
    'task:update': 'Update task details',
    'task:delete': 'Delete tasks',
    'task:assign': 'Assign tasks to users',
    'module:create': 'Create new modules',
    'module:read': 'View module information',
    'module:update': 'Update module details',
    'module:delete': 'Delete modules',
    'module:assign': 'Assign modules to users',
    'settings:read': 'View system settings',
    'settings:update': 'Update system settings',
    'settings:delete': 'Delete system settings',
    'reports:read': 'View reports',
    'reports:create': 'Create reports',
    'reports:export': 'Export reports',
    'override:all': 'Override all permissions',
    'override:user:permissions': 'Override user permissions',
    'override:role:permissions': 'Override role permissions',
    'override:system:settings': 'Override system settings',
  };

  return descriptions[permission] || 'No description available';
};

// Create User Dialog Component
interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  onCreateUser: (userData: Partial<User>) => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onOpenChange,
  roles,
  onCreateUser,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateUser(formData);
    setFormData({ name: '', email: '', password: '', role: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system with appropriate role and permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={formData.email}
              onChange={e =>
                setFormData(prev => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              value={formData.password}
              onChange={e =>
                setFormData(prev => ({ ...prev, password: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor='role'>Role</Label>
            <Select
              value={formData.role}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a role' />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>Create User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Create Role Dialog Component
interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: Permission[];
  onCreateRole: (roleData: Partial<Role>) => void;
}

const CreateRoleDialog: React.FC<CreateRoleDialogProps> = ({
  open,
  onOpenChange,
  permissions,
  onCreateRole,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as Permission[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRole(formData);
    setFormData({ name: '', description: '', permissions: [] });
  };

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new role with specific permissions for the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='name'>Role Name</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label>Permissions</Label>
            <div className='grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-md p-4'>
              {permissions.map(permission => (
                <div key={permission} className='flex items-center space-x-2'>
                  <Checkbox
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={checked =>
                      handlePermissionChange(permission, checked as boolean)
                    }
                  />
                  <Label htmlFor={permission} className='text-sm'>
                    {permission}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>Create Role</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Role Dialog Component
interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  permissions: Permission[];
  onUpdateRole: (roleId: string, roleData: Partial<Role>) => void;
}

const EditRoleDialog: React.FC<EditRoleDialogProps> = ({
  open,
  onOpenChange,
  role,
  permissions,
  onUpdateRole,
}) => {
  const [formData, setFormData] = useState({
    name: role.name,
    description: role.description,
    permissions: role.permissions,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRole(role.id, formData);
  };

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit Role: {role.name}</DialogTitle>
          <DialogDescription>
            Update role details and permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='name'>Role Name</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label>Permissions</Label>
            <div className='grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-md p-4'>
              {permissions.map(permission => (
                <div key={permission} className='flex items-center space-x-2'>
                  <Checkbox
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={checked =>
                      handlePermissionChange(permission, checked as boolean)
                    }
                  />
                  <Label htmlFor={permission} className='text-sm'>
                    {permission}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>Update Role</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UsersAndRoles;
