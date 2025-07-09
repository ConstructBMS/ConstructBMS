import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  AlertTriangle,
  Users,
  Settings,
  FileText,
  Database,
  Bell,
  Calendar,
  CreditCard,
  MessageCircle,
  Building2,
  ShoppingCart,
  Activity,
  Zap,
  Target,
  BookOpen,
  HelpCircle,
  Folder,
  File,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Globe,
  Mail,
  UserPlus,
  Copy,
  Star,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PermissionTemplate {
  id: string;
  name: string;
  category: 'system' | 'module' | 'feature' | 'data' | 'file';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    admin: boolean;
    super_admin: boolean;
  };
  children?: PermissionTemplate[];
}

interface Role {
  id: string;
  name: string;
  level: 'super_admin' | 'admin' | 'employee' | 'contractor' | 'customer';
  permissions: { [key: string]: boolean };
  isSystemRole: boolean;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  customPermissions: { [key: string]: boolean };
  isActive: boolean;
}

const Permissions: React.FC = () => {
  const { user: currentUser, checkRole } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'roles' | 'users' | 'features' | 'files'
  >('overview');
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);

  // Permission Templates - Ultra Granular System
  const permissionTemplates: PermissionTemplate[] = [
    {
      id: 'system',
      name: 'System Administration',
      category: 'system',
      description: 'Core system administration and configuration',
      icon: Settings,
      permissions: {
        view: false,
        create: false,
        edit: false,
        delete: false,
        admin: true,
        super_admin: true,
      },
      children: [
        {
          id: 'system.users',
          name: 'User Management',
          category: 'system',
          description: 'Manage system users',
          icon: Users,
          permissions: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            admin: true,
            super_admin: true,
          },
          children: [
            {
              id: 'system.users.view',
              name: 'View Users',
              category: 'system',
              description: 'View user list and details',
              icon: Eye,
              permissions: {
                view: true,
                create: false,
                edit: false,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'system.users.create',
              name: 'Create Users',
              category: 'system',
              description: 'Create new user accounts',
              icon: UserPlus,
              permissions: {
                view: false,
                create: true,
                edit: false,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'system.users.edit',
              name: 'Edit Users',
              category: 'system',
              description: 'Modify user information',
              icon: Edit,
              permissions: {
                view: false,
                create: false,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'system.users.delete',
              name: 'Delete Users',
              category: 'system',
              description: 'Delete user accounts',
              icon: Trash2,
              permissions: {
                view: false,
                create: false,
                edit: false,
                delete: true,
                admin: false,
                super_admin: true,
              },
            },
            {
              id: 'system.users.roles',
              name: 'Assign Roles',
              category: 'system',
              description: 'Assign and modify user roles',
              icon: Shield,
              permissions: {
                view: false,
                create: false,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'system.users.permissions',
              name: 'Custom Permissions',
              category: 'system',
              description: 'Grant custom permissions to users',
              icon: Key,
              permissions: {
                view: false,
                create: false,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
          ],
        },
        {
          id: 'system.roles',
          name: 'Role Management',
          category: 'system',
          description: 'Manage system roles and permissions',
          icon: Shield,
          permissions: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            admin: true,
            super_admin: true,
          },
          children: [
            {
              id: 'system.roles.view',
              name: 'View Roles',
              category: 'system',
              description: 'View role definitions',
              icon: Eye,
              permissions: {
                view: true,
                create: false,
                edit: false,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'system.roles.create',
              name: 'Create Roles',
              category: 'system',
              description: 'Create custom roles',
              icon: Plus,
              permissions: {
                view: false,
                create: true,
                edit: false,
                delete: false,
                admin: false,
                super_admin: true,
              },
            },
            {
              id: 'system.roles.edit',
              name: 'Edit Roles',
              category: 'system',
              description: 'Modify role permissions',
              icon: Edit,
              permissions: {
                view: false,
                create: false,
                edit: true,
                delete: false,
                admin: false,
                super_admin: true,
              },
            },
            {
              id: 'system.roles.delete',
              name: 'Delete Roles',
              category: 'system',
              description: 'Delete custom roles',
              icon: Trash2,
              permissions: {
                view: false,
                create: false,
                edit: false,
                delete: true,
                admin: false,
                super_admin: true,
              },
            },
          ],
        },
        {
          id: 'system.settings',
          name: 'System Settings',
          category: 'system',
          description: 'Core system configuration',
          icon: Settings,
          permissions: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            admin: true,
            super_admin: true,
          },
          children: [
            {
              id: 'system.settings.general',
              name: 'General Settings',
              category: 'system',
              description: 'Basic system configuration',
              icon: Settings,
              permissions: {
                view: true,
                create: false,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'system.settings.security',
              name: 'Security Settings',
              category: 'system',
              description: 'Security and authentication settings',
              icon: Lock,
              permissions: {
                view: true,
                create: false,
                edit: false,
                delete: false,
                admin: false,
                super_admin: true,
              },
            },
            {
              id: 'system.settings.backup',
              name: 'Backup & Recovery',
              category: 'system',
              description: 'System backup configuration',
              icon: Database,
              permissions: {
                view: true,
                create: true,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
          ],
        },
      ],
    },
    {
      id: 'modules',
      name: 'Business Modules',
      category: 'module',
      description: 'Core business functionality modules',
      icon: Building2,
      permissions: {
        view: true,
        create: false,
        edit: false,
        delete: false,
        admin: true,
        super_admin: true,
      },
      children: [
        {
          id: 'modules.crm',
          name: 'Customer Relationship Management',
          category: 'module',
          description: 'CRM module access and permissions',
          icon: Users,
          permissions: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            admin: true,
            super_admin: true,
          },
          children: [
            {
              id: 'modules.crm.customers',
              name: 'Customer Management',
              category: 'feature',
              description: 'Manage customer records',
              icon: Users,
              permissions: {
                view: true,
                create: true,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'modules.crm.contractors',
              name: 'Contractor Management',
              category: 'feature',
              description: 'Manage contractor records',
              icon: Building2,
              permissions: {
                view: true,
                create: true,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'modules.crm.sales',
              name: 'Sales Pipeline',
              category: 'feature',
              description: 'Sales pipeline management',
              icon: Target,
              permissions: {
                view: true,
                create: true,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
          ],
        },
        {
          id: 'modules.projects',
          name: 'Project Management',
          category: 'module',
          description: 'Project management capabilities',
          icon: FileText,
          permissions: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            admin: true,
            super_admin: true,
          },
          children: [
            {
              id: 'modules.projects.view',
              name: 'View Projects',
              category: 'feature',
              description: 'View project information',
              icon: Eye,
              permissions: {
                view: true,
                create: false,
                edit: false,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'modules.projects.create',
              name: 'Create Projects',
              category: 'feature',
              description: 'Create new projects',
              icon: Plus,
              permissions: {
                view: false,
                create: true,
                edit: false,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'modules.projects.manage',
              name: 'Manage Projects',
              category: 'feature',
              description: 'Full project management',
              icon: Settings,
              permissions: {
                view: false,
                create: false,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'modules.projects.delete',
              name: 'Delete Projects',
              category: 'feature',
              description: 'Delete projects',
              icon: Trash2,
              permissions: {
                view: false,
                create: false,
                edit: false,
                delete: true,
                admin: false,
                super_admin: true,
              },
            },
          ],
        },
        {
          id: 'modules.finance',
          name: 'Financial Management',
          category: 'module',
          description: 'Financial operations and reporting',
          icon: CreditCard,
          permissions: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            admin: true,
            super_admin: true,
          },
          children: [
            {
              id: 'modules.finance.view',
              name: 'View Financial Data',
              category: 'feature',
              description: 'View financial reports and data',
              icon: Eye,
              permissions: {
                view: true,
                create: false,
                edit: false,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'modules.finance.transactions',
              name: 'Manage Transactions',
              category: 'feature',
              description: 'Create and edit transactions',
              icon: CreditCard,
              permissions: {
                view: false,
                create: true,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'modules.finance.reports',
              name: 'Financial Reports',
              category: 'feature',
              description: 'Generate financial reports',
              icon: FileText,
              permissions: {
                view: true,
                create: true,
                edit: false,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'modules.finance.admin',
              name: 'Financial Administration',
              category: 'feature',
              description: 'Advanced financial controls',
              icon: Lock,
              permissions: {
                view: false,
                create: false,
                edit: true,
                delete: true,
                admin: false,
                super_admin: true,
              },
            },
          ],
        },
      ],
    },
    {
      id: 'files',
      name: 'File & Document Management',
      category: 'file',
      description: 'Document and file system permissions',
      icon: FileText,
      permissions: {
        view: true,
        create: false,
        edit: false,
        delete: false,
        admin: true,
        super_admin: true,
      },
      children: [
        {
          id: 'files.documents',
          name: 'Documents Folder',
          category: 'file',
          description: 'General document storage',
          icon: Folder,
          permissions: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            admin: true,
            super_admin: true,
          },
          children: [
            {
              id: 'files.documents.contracts',
              name: 'Contracts',
              category: 'file',
              description: 'Contract documents',
              icon: FileText,
              permissions: {
                view: true,
                create: true,
                edit: false,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'files.documents.invoices',
              name: 'Invoices',
              category: 'file',
              description: 'Invoice documents',
              icon: CreditCard,
              permissions: {
                view: true,
                create: true,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'files.documents.reports',
              name: 'Reports',
              category: 'file',
              description: 'System and business reports',
              icon: FileText,
              permissions: {
                view: true,
                create: true,
                edit: false,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
          ],
        },
        {
          id: 'files.projects',
          name: 'Project Files',
          category: 'file',
          description: 'Project-specific documents',
          icon: Folder,
          permissions: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            admin: true,
            super_admin: true,
          },
          children: [
            {
              id: 'files.projects.drawings',
              name: 'Technical Drawings',
              category: 'file',
              description: 'CAD and technical drawings',
              icon: FileText,
              permissions: {
                view: true,
                create: true,
                edit: true,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
            {
              id: 'files.projects.photos',
              name: 'Project Photos',
              category: 'file',
              description: 'Site and progress photos',
              icon: File,
              permissions: {
                view: true,
                create: true,
                edit: false,
                delete: false,
                admin: true,
                super_admin: true,
              },
            },
          ],
        },
        {
          id: 'files.confidential',
          name: 'Confidential Files',
          category: 'file',
          description: 'Restricted access documents',
          icon: Lock,
          permissions: {
            view: false,
            create: false,
            edit: false,
            delete: false,
            admin: true,
            super_admin: true,
          },
          children: [
            {
              id: 'files.confidential.hr',
              name: 'HR Documents',
              category: 'file',
              description: 'Human resources files',
              icon: Users,
              permissions: {
                view: false,
                create: false,
                edit: false,
                delete: false,
                admin: false,
                super_admin: true,
              },
            },
            {
              id: 'files.confidential.legal',
              name: 'Legal Documents',
              category: 'file',
              description: 'Legal and compliance files',
              icon: Shield,
              permissions: {
                view: false,
                create: false,
                edit: false,
                delete: false,
                admin: false,
                super_admin: true,
              },
            },
          ],
        },
      ],
    },
  ];

  // Sample roles with different permission levels
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'super_admin',
      name: 'Super Administrator',
      level: 'super_admin',
      description: 'Full system access with all permissions',
      isSystemRole: true,
      permissions: {},
    },
    {
      id: 'admin',
      name: 'Administrator',
      level: 'admin',
      description: 'System administrator with limited super admin capabilities',
      isSystemRole: true,
      permissions: {},
    },
    {
      id: 'employee',
      name: 'Employee',
      level: 'employee',
      description: 'Regular employee with standard access',
      isSystemRole: true,
      permissions: {},
    },
    {
      id: 'contractor',
      name: 'Contractor',
      level: 'contractor',
      description: 'External contractor with limited access',
      isSystemRole: true,
      permissions: {},
    },
    {
      id: 'customer',
      name: 'Customer',
      level: 'customer',
      description: 'Customer with read-only project access',
      isSystemRole: true,
      permissions: {},
    },
  ]);

  // Sample users
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'super_admin',
      customPermissions: {},
      isActive: true,
    },
    {
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'admin',
      customPermissions: {},
      isActive: true,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'employee',
      customPermissions: {},
      isActive: true,
    },
  ]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const getAllPermissions = (
    templates: PermissionTemplate[]
  ): PermissionTemplate[] => {
    const allPermissions: PermissionTemplate[] = [];

    const traverse = (items: PermissionTemplate[]) => {
      items.forEach(item => {
        allPermissions.push(item);
        if (item.children) {
          traverse(item.children);
        }
      });
    };

    traverse(templates);
    return allPermissions;
  };

  const filteredPermissions = getAllPermissions(permissionTemplates).filter(
    permission => {
      const matchesSearch =
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterLevel === 'all' ||
        (filterLevel === 'admin' && permission.permissions.admin) ||
        (filterLevel === 'super_admin' && permission.permissions.super_admin);

      return matchesSearch && matchesFilter;
    }
  );

  const renderPermissionTree = (
    templates: PermissionTemplate[],
    level: number = 0
  ) => {
    return templates.map(template => {
      const isExpanded = expandedCategories[template.id];
      const Icon = template.icon;

      return (
        <div key={template.id} className={`${level > 0 ? 'ml-6' : ''}`}>
          <div className='flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 bg-white dark:bg-gray-800'>
            <div className='flex items-center space-x-3'>
              {template.children && (
                <button
                  onClick={() => toggleCategory(template.id)}
                  className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
                >
                  {isExpanded ? (
                    <ChevronDown className='h-4 w-4 text-gray-500' />
                  ) : (
                    <ChevronRight className='h-4 w-4 text-gray-500' />
                  )}
                </button>
              )}
              <Icon className='h-5 w-5 text-archer-green' />
              <div>
                <div className='font-medium text-gray-900 dark:text-white'>
                  {template.name}
                </div>
                <div className='text-sm text-gray-500 dark:text-gray-400'>
                  {template.description}
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              {/* Permission Level Indicators */}
              <div className='flex space-x-1'>
                {template.permissions.view && (
                  <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded'>
                    View
                  </span>
                )}
                {template.permissions.create && (
                  <span className='px-2 py-1 text-xs bg-green-100 text-green-800 rounded'>
                    Create
                  </span>
                )}
                {template.permissions.edit && (
                  <span className='px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded'>
                    Edit
                  </span>
                )}
                {template.permissions.delete && (
                  <span className='px-2 py-1 text-xs bg-red-100 text-red-800 rounded'>
                    Delete
                  </span>
                )}
                {template.permissions.admin && (
                  <span className='px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded'>
                    Admin
                  </span>
                )}
                {template.permissions.super_admin && (
                  <span className='px-2 py-1 text-xs bg-gray-900 text-white rounded'>
                    Super Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {isExpanded && template.children && (
            <div className='ml-4 space-y-2'>
              {renderPermissionTree(template.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderOverviewTab = () => (
    <div className='space-y-6'>
      {/* Permission Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <Shield className='h-8 w-8 text-blue-500' />
            <div className='ml-4'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {roles.length}
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                Active Roles
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <Users className='h-8 w-8 text-green-500' />
            <div className='ml-4'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {users.length}
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                System Users
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <Key className='h-8 w-8 text-purple-500' />
            <div className='ml-4'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {getAllPermissions(permissionTemplates).length}
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                Total Permissions
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <Lock className='h-8 w-8 text-red-500' />
            <div className='ml-4'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {
                  getAllPermissions(permissionTemplates).filter(
                    p => p.permissions.super_admin
                  ).length
                }
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                Super Admin Only
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
          Quick Actions
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <button
            onClick={() => setShowCreateRole(true)}
            className='flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
          >
            <Plus className='h-5 w-5 text-archer-green mr-3' />
            <div className='text-left'>
              <div className='font-medium text-gray-900 dark:text-white'>
                Create Role
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                Define new user role
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowCreateUser(true)}
            className='flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
          >
            <UserPlus className='h-5 w-5 text-archer-green mr-3' />
            <div className='text-left'>
              <div className='font-medium text-gray-900 dark:text-white'>
                Add User
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                Create new user account
              </div>
            </div>
          </button>

          <button className='flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
            <Copy className='h-5 w-5 text-archer-green mr-3' />
            <div className='text-left'>
              <div className='font-medium text-gray-900 dark:text-white'>
                Clone Permissions
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                Copy role permissions
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Permission Tree Overview */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            Permission Structure
          </h3>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setExpandedCategories({})}
              className='text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            >
              Collapse All
            </button>
            <button
              onClick={() => {
                const allExpanded: { [key: string]: boolean } = {};
                getAllPermissions(permissionTemplates).forEach(p => {
                  allExpanded[p.id] = true;
                });
                setExpandedCategories(allExpanded);
              }}
              className='text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            >
              Expand All
            </button>
          </div>
        </div>

        <div className='space-y-2'>
          {renderPermissionTree(permissionTemplates)}
        </div>
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
          Role Management
        </h3>
        <button
          onClick={() => setShowCreateRole(true)}
          className='inline-flex items-center px-4 py-2 bg-archer-green text-white rounded-lg hover:bg-archer-green/80 transition-colors'
        >
          <Plus className='h-4 w-4 mr-2' />
          Create Role
        </button>
      </div>

      <div className='grid grid-cols-1 gap-4'>
        {roles.map(role => (
          <div
            key={role.id}
            className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <Shield
                  className={`h-8 w-8 ${
                    role.level === 'super_admin'
                      ? 'text-red-500'
                      : role.level === 'admin'
                        ? 'text-blue-500'
                        : role.level === 'employee'
                          ? 'text-green-500'
                          : role.level === 'contractor'
                            ? 'text-yellow-500'
                            : 'text-gray-500'
                  }`}
                />
                <div>
                  <div className='text-lg font-medium text-gray-900 dark:text-white'>
                    {role.name}
                  </div>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>
                    {role.description}
                  </div>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                {role.isSystemRole && (
                  <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded'>
                    System Role
                  </span>
                )}
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    role.level === 'super_admin'
                      ? 'bg-red-100 text-red-800'
                      : role.level === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : role.level === 'employee'
                          ? 'bg-green-100 text-green-800'
                          : role.level === 'contractor'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {role.level.replace('_', ' ').toUpperCase()}
                </span>

                <button className='p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'>
                  <Edit className='h-4 w-4' />
                </button>

                {!role.isSystemRole && (
                  <button className='p-2 text-red-500 hover:text-red-700'>
                    <Trash2 className='h-4 w-4' />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
          User Management
        </h3>
        <button
          onClick={() => setShowCreateUser(true)}
          className='inline-flex items-center px-4 py-2 bg-archer-green text-white rounded-lg hover:bg-archer-green/80 transition-colors'
        >
          <UserPlus className='h-4 w-4 mr-2' />
          Add User
        </button>
      </div>

      <div className='grid grid-cols-1 gap-4'>
        {users.map(user => (
          <div
            key={user.id}
            className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-archer-green rounded-full flex items-center justify-center'>
                  <span className='text-white font-medium'>
                    {user.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <div className='text-lg font-medium text-gray-900 dark:text-white'>
                    {user.name}
                  </div>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>
                    {user.email}
                  </div>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>

                <span
                  className={`px-2 py-1 text-xs rounded ${
                    user.role === 'super_admin'
                      ? 'bg-red-100 text-red-800'
                      : user.role === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : user.role === 'employee'
                          ? 'bg-green-100 text-green-800'
                          : user.role === 'contractor'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.role.replace('_', ' ').toUpperCase()}
                </span>

                <button className='p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'>
                  <Edit className='h-4 w-4' />
                </button>

                <button className='p-2 text-red-500 hover:text-red-700'>
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
          Feature Permissions
        </h3>
        <div className='flex items-center space-x-2'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search permissions...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-archer-green focus:border-transparent'
            />
          </div>

          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-archer-green focus:border-transparent'
          >
            <option value='all'>All Levels</option>
            <option value='admin'>Admin Level</option>
            <option value='super_admin'>Super Admin Only</option>
          </select>
        </div>
      </div>

      <div className='space-y-2'>
        {renderPermissionTree(permissionTemplates)}
      </div>
    </div>
  );

  const renderFilesTab = () => (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
          File & Folder Permissions
        </h3>
        <button className='inline-flex items-center px-4 py-2 bg-archer-green text-white rounded-lg hover:bg-archer-green/80 transition-colors'>
          <Plus className='h-4 w-4 mr-2' />
          Add Folder Permission
        </button>
      </div>

      <div className='space-y-2'>
        {renderPermissionTree(
          permissionTemplates.filter(p => p.category === 'file')
        )}
      </div>
    </div>
  );

  // Check if current user is Super Admin
  const isSuperAdmin = checkRole('super_admin');
  const isAdmin = checkRole('admin') || isSuperAdmin;

  if (!isAdmin) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <Lock className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
            Access Denied
          </h3>
          <p className='text-gray-500 dark:text-gray-400'>
            You don't have permission to access this section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Advanced Permissions Management
            </h1>
            <p className='text-gray-600 dark:text-gray-400 mt-1'>
              Ultra-granular permission control for users, roles, features, and
              file system access
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                isSuperAdmin
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              }`}
            >
              {isSuperAdmin ? 'Super Administrator' : 'Administrator'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
        <div className='border-b border-gray-200 dark:border-gray-700'>
          <nav className='flex space-x-8 px-6'>
            {[
              { id: 'overview', name: 'Overview', icon: Target },
              { id: 'roles', name: 'Roles', icon: Shield },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'features', name: 'Features', icon: Settings },
              { id: 'files', name: 'Files & Folders', icon: Folder },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-archer-green text-archer-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className='h-4 w-4 mr-2' />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className='p-6'>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'roles' && renderRolesTab()}
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'features' && renderFeaturesTab()}
          {activeTab === 'files' && renderFilesTab()}
        </div>
      </div>
    </div>
  );
};

export default Permissions;
