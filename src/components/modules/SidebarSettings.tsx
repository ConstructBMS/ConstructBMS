import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Settings,
  GripVertical,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  Shield,
  Star,
  Clock,
  Menu,
  LayoutDashboard,
  Users,
  FileSignature,
  CheckSquare,
  FileText,
  Building2,
  ShoppingCart,
  MessageCircle,
  Bell,
  TrendingUp,
  Calendar,
  PoundSterling,
  Key,
  Zap,
  ScrollText,
  UserCheck,
  CreditCard,
  Megaphone,
  Mail,
  Building,
  Target,
  Activity,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { persistentStorage } from '../../services/persistentStorage';

interface MenuItem {
  badge?: string | null;
  children?: MenuItem[];
  icon: string;
  id: string;
  isCore: boolean;
  isSubmenu: boolean;
  isVisible: boolean;
  name: string;
  orderIndex: number;
  parentId?: string | null;
  path: string;
  requiredPermissions?: string[];
}

interface SidebarSettingsProps {}

// Sortable menu item component
const SortableMenuItem: React.FC<{
  allItems: MenuItem[];
  canEdit: boolean;
  editingItem: MenuItem | null;
  isEditing: boolean;
  item: MenuItem;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onEdit: (item: MenuItem) => void;
  onMoveToParent: (id: string, parentId: string | null) => void;
  onSaveEdit: (item: MenuItem) => void;
  onToggleCore: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}> = ({
  item,
  canEdit,
  onEdit,
  onDelete,
  onToggleVisibility,
  onMoveToParent,
  onToggleCore,
  allItems,
  isEditing,
  editingItem,
  onSaveEdit,
  onCancelEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [editName, setEditName] = useState(item.name);
  const [editPath, setEditPath] = useState(item.path);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  useEffect(() => {
    if (editingItem?.id === item.id) {
      setEditName(item.name);
      setEditPath(item.path);
    }
  }, [editingItem, item]);

  const availableParents = allItems.filter(
    i => i.id !== item.id && !i.isSubmenu && i.id !== item.parentId
  );

  const getIconComponent = (iconName: string) => {
    const iconMap: {
      [key: string]: React.ComponentType<{ className?: string }>;
    } = {
      LayoutDashboard: () => (
        <div className='w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          D
        </div>
      ),
      Users: () => (
        <div className='w-5 h-5 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          U
        </div>
      ),
      FileSignature: () => (
        <div className='w-5 h-5 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          F
        </div>
      ),
      CheckSquare: () => (
        <div className='w-5 h-5 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          T
        </div>
      ),
      FileText: () => (
        <div className='w-5 h-5 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          D
        </div>
      ),
      Building2: () => (
        <div className='w-5 h-5 bg-indigo-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          B
        </div>
      ),
      ShoppingCart: () => (
        <div className='w-5 h-5 bg-pink-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          S
        </div>
      ),
      MessageCircle: () => (
        <div className='w-5 h-5 bg-teal-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          M
        </div>
      ),
      Bell: () => (
        <div className='w-5 h-5 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          N
        </div>
      ),
      Settings: () => (
        <div className='w-5 h-5 bg-gray-600 rounded flex items-center justify-center text-white text-xs font-bold'>
          S
        </div>
      ),
      Calendar: () => (
        <div className='w-5 h-5 bg-lime-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          C
        </div>
      ),
      PoundSterling: () => (
        <div className='w-5 h-5 bg-sky-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          £
        </div>
      ),
    };
    return (
      iconMap[iconName] ||
      (() => (
        <div className='w-5 h-5 bg-gray-400 rounded flex items-center justify-center text-white text-xs font-bold'>
          ?
        </div>
      ))
    );
  };

  const IconComponent = getIconComponent(item.icon);

  if (isEditing && editingItem?.id === item.id) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className='bg-white border-2 border-blue-200 rounded-lg p-4 mb-2 shadow-sm'
      >
        <div className='space-y-3'>
          <div className='flex items-center space-x-3'>
            <div
              {...attributes}
              {...listeners}
              className='cursor-grab active:cursor-grabbing text-gray-400'
            >
              <GripVertical className='h-4 w-4' />
            </div>
            <IconComponent className='h-5 w-5 flex-shrink-0' />
            <div className='flex-1 space-y-2'>
              <input
                type='text'
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
                placeholder='Menu item name'
                autoFocus
              />
              <input
                type='text'
                value={editPath}
                onChange={e => setEditPath(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
                placeholder='Menu path (e.g., dashboard, projects)'
              />
            </div>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <span className='text-xs text-gray-500'>
                {item.isCore ? 'Core Item' : 'Additional Item'}
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() =>
                  onSaveEdit({ ...item, name: editName, path: editPath })
                }
                className='px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center space-x-1'
              >
                <Check className='h-3 w-3' />
                <span>Save</span>
              </button>
              <button
                onClick={onCancelEdit}
                className='px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors flex items-center space-x-1'
              >
                <X className='h-3 w-3' />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-2 transition-all duration-200 hover:shadow-md ${
        item.isSubmenu ? 'ml-8 border-l-4 border-l-blue-300' : ''
      } ${!item.isVisible ? 'opacity-60 bg-gray-50' : ''}`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3 flex-1'>
          <div
            {...attributes}
            {...listeners}
            className='cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600'
          >
            <GripVertical className='h-4 w-4' />
          </div>

          <IconComponent className='h-5 w-5 flex-shrink-0' />

          <div className='flex-1'>
            <div className='flex items-center space-x-2'>
              <span
                className={`font-medium ${!item.isVisible ? 'line-through text-gray-500' : 'text-gray-900'}`}
              >
                {item.name}
              </span>
              <span className='text-xs text-gray-400'>/{item.path}</span>
              {item.isCore && (
                <span className='text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded flex items-center space-x-1'>
                  <Shield className='h-3 w-3' />
                  <span>Core</span>
                </span>
              )}
              {!item.isCore && !item.isSubmenu && (
                <span className='text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded flex items-center space-x-1'>
                  <Star className='h-3 w-3' />
                  <span>Additional</span>
                </span>
              )}
              {item.isSubmenu && (
                <span className='text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded'>
                  Submenu
                </span>
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center space-x-1'>
          {/* Visibility Toggle */}
          <button
            onClick={() => onToggleVisibility(item.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              item.isVisible
                ? 'text-green-600 hover:bg-green-100'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={item.isVisible ? 'Hide item' : 'Show item'}
          >
            {item.isVisible ? (
              <Eye className='h-3 w-3' />
            ) : (
              <EyeOff className='h-3 w-3' />
            )}
          </button>

          {/* Core/Additional Toggle */}
          {canEdit && (
            <button
              onClick={() => onToggleCore(item.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                item.isCore
                  ? 'text-yellow-600 hover:bg-yellow-100'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title={item.isCore ? 'Mark as Additional' : 'Mark as Core'}
            >
              {item.isCore ? (
                <Shield className='h-3 w-3' />
              ) : (
                <Star className='h-3 w-3' />
              )}
            </button>
          )}

          {/* Move to Parent */}
          {canEdit && (
            <div className='relative'>
              <button
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                className='p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors'
                title='Move to parent'
              >
                <Folder className='h-3 w-3' />
              </button>

              {showMoveMenu && (
                <div className='absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48'>
                  <div className='p-2'>
                    <button
                      onClick={() => {
                        onMoveToParent(item.id, null);
                        setShowMoveMenu(false);
                      }}
                      className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2'
                    >
                      <Menu className='h-3 w-3' />
                      <span>Make Main Item</span>
                    </button>
                    {availableParents.map(parent => (
                      <button
                        key={parent.id}
                        onClick={() => {
                          onMoveToParent(item.id, parent.id);
                          setShowMoveMenu(false);
                        }}
                        className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2'
                      >
                        <Folder className='h-3 w-3' />
                        <span>{parent.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit */}
          {canEdit && (
            <button
              onClick={() => onEdit(item)}
              className='p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
              title='Edit item'
            >
              <Edit className='h-3 w-3' />
            </button>
          )}

          {/* Delete */}
          {canEdit && !item.isCore && (
            <button
              onClick={() => onDelete(item.id)}
              className='p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors'
              title='Delete item'
            >
              <Trash2 className='h-3 w-3' />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SidebarSettings: React.FC<SidebarSettingsProps> = () => {
  const { user, checkPermission, checkRole } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [createType, setCreateType] = useState<'parent' | 'child'>('parent');
  const [selectedParent, setSelectedParent] = useState<string>('');

  // Permission checks
  const canViewMenuBuilder =
    checkPermission('manage_menu') ||
    checkRole('super_admin') ||
    checkRole('admin');
  const canEditMenu =
    checkPermission('manage_menu') ||
    checkRole('super_admin') ||
    checkRole('admin');
  const canOnlyReorder =
    checkRole('employee') || checkRole('contractor') || checkRole('customer');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      // Load from database or use default
      const saved = await persistentStorage.getSetting(
        'sidebarMenuItems',
        'menu'
      );
      if (saved) {
        const parsedItems = saved;
        const defaultItems = getDefaultMenuItems();

        // Check if we need to add new items that weren't in the saved version
        const savedIds = new Set(parsedItems.map((item: any) => item.id));
        const missingItems = defaultItems.filter(
          defaultItem => !savedIds.has(defaultItem.id)
        );

        let allItems = parsedItems.map((item: any, index: number) => ({
          ...item,
          orderIndex: index,
          isCore: item.hasOwnProperty('isCore') ? item.isCore : true, // Only default to true if property doesn't exist
          path: item.path || item.id,
        }));

        // Add any missing items to the end
        if (missingItems.length > 0) {
          const startIndex = allItems.length;
          const newItems = missingItems.map((item, index) => ({
            ...item,
            orderIndex: startIndex + index,
          }));
          allItems = [...allItems, ...newItems];

          // Auto-save the updated list
          setTimeout(() => autoSave(allItems), 100);
        }

        setMenuItems(allItems);
      } else {
        setMenuItems(getDefaultMenuItems());
      }
    } catch (error) {
      console.warn(
        'Error loading menu items from database, using defaults:',
        error
      );
      setMenuItems(getDefaultMenuItems());
    }
  };

  const getDefaultMenuItems = (): MenuItem[] => {
    // Check for custom default configuration first
    const loadCustomDefault = async () => {
      try {
        const customDefault = await persistentStorage.getSetting(
          'customDefaultMenu',
          'menu'
        );
        if (customDefault) {
          return customDefault.items;
        }
      } catch (error) {
        console.error('Error loading custom default menu:', error);
      }
      return null;
    };

    // For now, return built-in default - we'll handle async loading separately
    // Built-in default menu structure
    return [
      // Core Menu Items in order that matches what user specified
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: 'LayoutDashboard',
        path: 'dashboard',
        isVisible: true,
        isSubmenu: false,
        isCore: true,
        orderIndex: 0,
      },

      // CRM Parent and Children
      {
        id: 'crm',
        name: 'CRM',
        icon: 'Users',
        path: 'crm',
        isVisible: true,
        isSubmenu: false,
        isCore: true,
        orderIndex: 1,
      },
      {
        id: 'customers',
        name: 'Customers',
        icon: 'Users',
        path: 'customers',
        isVisible: true,
        isSubmenu: true,
        parentId: 'crm',
        isCore: true,
        orderIndex: 2,
      },
      {
        id: 'contractors',
        name: 'Contractors',
        icon: 'HardHat',
        path: 'contractors',
        isVisible: true,
        isSubmenu: true,
        parentId: 'crm',
        isCore: true,
        orderIndex: 3,
      },
      {
        id: 'sales',
        name: 'Sales Pipeline',
        icon: 'TrendingUp',
        path: 'sales',
        isVisible: true,
        isSubmenu: true,
        parentId: 'crm',
        isCore: true,
        orderIndex: 4,
      },

      {
        id: 'tasks',
        name: 'Tasks',
        icon: 'CheckSquare',
        path: 'tasks',
        isVisible: true,
        isSubmenu: false,
        isCore: true,
        orderIndex: 5,
      },
      {
        id: 'projects',
        name: 'Projects',
        icon: 'Building2',
        path: 'projects',
        isVisible: true,
        isSubmenu: false,
        isCore: true,
        orderIndex: 6,
      },
      {
        id: 'calendar',
        name: 'Calendar',
        icon: 'Calendar',
        path: 'calendar',
        isVisible: true,
        isSubmenu: false,
        isCore: true,
        orderIndex: 7,
      },
      {
        id: 'finance',
        name: 'Finance',
        icon: 'PoundSterling',
        path: 'finance',
        isVisible: true,
        isSubmenu: false,
        isCore: true,
        orderIndex: 8,
      },

      // Users & Roles Parent and Children
      {
        id: 'users',
        name: 'Users & Roles',
        icon: 'Shield',
        path: 'users',
        isVisible: true,
        isSubmenu: false,
        isCore: true,
        orderIndex: 9,
      },
      {
        id: 'user-management',
        name: 'User Management',
        icon: 'Users',
        path: 'user-management',
        isVisible: true,
        isSubmenu: true,
        parentId: 'users',
        isCore: true,
        orderIndex: 10,
      },
      {
        id: 'role-management',
        name: 'Role Management',
        icon: 'Shield',
        path: 'users',
        isVisible: true,
        isSubmenu: true,
        parentId: 'users',
        isCore: true,
        orderIndex: 11,
      },
      {
        id: 'permissions',
        name: 'Permissions',
        icon: 'Key',
        path: 'permissions',
        isVisible: true,
        isSubmenu: true,
        parentId: 'users',
        isCore: true,
        orderIndex: 12,
      },

      // Settings Parent and Children
      {
        id: 'settings',
        name: 'Settings',
        icon: 'Settings',
        path: 'settings',
        isVisible: true,
        isSubmenu: false,
        isCore: true,
        orderIndex: 13,
      },
      {
        id: 'general-settings',
        name: 'General Settings',
        icon: 'Settings',
        path: 'general-settings',
        isVisible: true,
        isSubmenu: true,
        parentId: 'settings',
        isCore: true,
        orderIndex: 14,
      },
      {
        id: 'system-permissions',
        name: 'System Permissions',
        icon: 'Shield',
        path: 'permissions',
        isVisible: true,
        isSubmenu: true,
        parentId: 'settings',
        isCore: true,
        orderIndex: 15,
      },
      {
        id: 'sidebar-settings',
        name: 'Menu Builder',
        icon: 'Target',
        path: 'sidebar-settings',
        isVisible: true,
        isSubmenu: true,
        parentId: 'settings',
        isCore: true,
        orderIndex: 16,
      },

      // Additional items (all the ones that were in additionalModules)
      {
        id: 'agile',
        name: 'Agile Projects',
        icon: 'Zap',
        path: 'agile',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 17,
      },
      {
        id: 'contracts',
        name: 'Contracts',
        icon: 'ScrollText',
        path: 'contracts',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 18,
      },
      {
        id: 'hr',
        name: 'HR',
        icon: 'UserCheck',
        path: 'hr',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 19,
      },
      {
        id: 'paye',
        name: 'PAYE',
        icon: 'CreditCard',
        path: 'paye',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 20,
      },
      {
        id: 'marketing',
        name: 'Marketing',
        icon: 'Megaphone',
        path: 'marketing',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 21,
      },
      {
        id: 'email',
        name: 'Email Client',
        icon: 'Mail',
        path: 'email',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 22,
      },
      {
        id: 'signature',
        name: 'Document Control Centre',
        icon: 'FileSignature',
        path: 'signature',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 23,
      },
      {
        id: 'estimating',
        name: 'Estimating',
        icon: 'FileText',
        path: 'estimating',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 24,
      },
      {
        id: 'site-tools',
        name: 'Site Tools',
        icon: 'Building2',
        path: 'site-tools',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 25,
      },
      {
        id: 'procurement',
        name: 'Procurement',
        icon: 'ShoppingCart',
        path: 'procurement',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 26,
      },
      {
        id: 'collaboration',
        name: 'Collaboration',
        icon: 'MessageCircle',
        path: 'collaboration',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 27,
      },
      {
        id: 'chat',
        name: 'Messenger',
        icon: 'MessageCircle',
        path: 'chat',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 28,
      },
      {
        id: 'notifications',
        name: 'Notifications',
        icon: 'Bell',
        path: 'notifications',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 29,
      },
      {
        id: 'activity-stream',
        name: 'Activity Stream',
        icon: 'Activity',
        path: 'activity-stream',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 30,
      },
      {
        id: 'backup',
        name: 'Backup',
        icon: 'Zap',
        path: 'backup',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 31,
      },
      {
        id: 'roadmap',
        name: 'Roadmap',
        icon: 'Target',
        path: 'roadmap',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 32,
      },
      {
        id: 'help',
        name: 'Knowledge Base',
        icon: 'BookOpen',
        path: 'help',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 33,
      },
      {
        id: 'support',
        name: 'Support',
        icon: 'HelpCircle',
        path: 'support',
        isVisible: true,
        isSubmenu: false,
        isCore: false,
        orderIndex: 34,
      },
    ];
  };

  if (!canViewMenuBuilder) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <Shield className='h-16 w-16 text-gray-400 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Access Restricted
          </h2>
          <p className='text-gray-600'>
            You don't have permission to access the Menu Builder.
          </p>
        </div>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = menuItems.findIndex(item => item.id === active.id);
      const newIndex = menuItems.findIndex(item => item.id === over.id);

      const newMenuItems = arrayMove(menuItems, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          orderIndex: index,
        })
      );

      setMenuItems(newMenuItems);
      autoSave(newMenuItems);
    }
  };

  const handleEdit = (item: MenuItem) => {
    if (!canEditMenu) return;
    setEditingItem(item);
    setIsEditing(true);
  };

  const handleSaveEdit = (updatedItem: MenuItem) => {
    const updatedItems = menuItems.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setMenuItems(updatedItems);
    setIsEditing(false);
    setEditingItem(null);
    autoSave(updatedItems);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (!canEditMenu) return;
    const updatedItems = menuItems.filter(
      item => item.id !== id && item.parentId !== id
    );
    setMenuItems(updatedItems);
    autoSave(updatedItems);
  };

  const handleToggleVisibility = (id: string) => {
    const updatedItems = menuItems.map(item =>
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    );
    setMenuItems(updatedItems);
    autoSave(updatedItems);
  };

  const handleMoveToParent = (id: string, parentId: string | null) => {
    if (!canEditMenu) return;
    const updatedItems = menuItems.map(item =>
      item.id === id
        ? {
            ...item,
            parentId,
            isSubmenu: !!parentId,
          }
        : item
    );
    setMenuItems(updatedItems);
    autoSave(updatedItems);
  };

  const handleToggleCore = (id: string) => {
    if (!canEditMenu) return;
    const updatedItems = menuItems.map(item =>
      item.id === id ? { ...item, isCore: !item.isCore } : item
    );
    setMenuItems(updatedItems);
    autoSave(updatedItems);
  };

  const handleCreateItem = (
    name: string,
    path: string,
    icon: string,
    parentId?: string
  ) => {
    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name,
      path,
      icon,
      isVisible: true,
      isSubmenu: !!parentId,
      parentId,
      isCore: false,
      orderIndex: menuItems.length,
    };

    const updatedItems = [...menuItems, newItem];
    setMenuItems(updatedItems);
    autoSave(updatedItems);
    setShowCreateModal(false);
  };

  const autoSave = async (items: MenuItem[]) => {
    try {
      // Save to database
      await persistentStorage.setSetting('sidebarMenuItems', items, 'menu');

      // Also save the order IDs for quick access
      const orderIds = items.map(item => item.id);
      await persistentStorage.setSetting(
        'sidebarCustomOrder',
        orderIds,
        'menu'
      );
    } catch (error) {
      console.warn('Failed to save menu items to database:', error);
      // Don't throw - just log the warning
    }
  };

  const handleSave = () => {
    setSaveStatus('saving');
    autoSave(menuItems);

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleReset = () => {
    const defaultItems = getDefaultMenuItems();
    setMenuItems(defaultItems);
    autoSave(defaultItems);
    setShowResetConfirm(false);
  };

  const handleResetToFactoryDefault = async () => {
    // Clear custom default and use built-in default
    try {
      await persistentStorage.setSetting('customDefaultMenu', null, 'menu');
    } catch (error) {
      console.warn('Failed to clear custom default menu:', error);
    }
    const defaultItems = getDefaultMenuItems(); // This will now return built-in default
    setMenuItems(defaultItems);
    autoSave(defaultItems);
    setShowResetConfirm(false);
  };

  const handleSaveAsDefault = async () => {
    // Save current menu configuration as the new "custom default"
    const customDefault = {
      items: menuItems,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    // Save to database as the new default configuration
    try {
      await persistentStorage.setSetting(
        'customDefaultMenu',
        customDefault,
        'menu'
      );
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.warn('Failed to save custom default menu:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const coreItems = menuItems.filter(item => item.isCore);
  const additionalItems = menuItems.filter(item => !item.isCore);
  const visibleItems = menuItems.filter(item => item.isVisible);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Menu Builder</h1>
          <p className='text-gray-600'>
            {canEditMenu
              ? 'Customize your sidebar menu layout and organization'
              : 'Reorder your menu items (editing restricted)'}
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          {canEditMenu && (
            <>
              <button
                onClick={() => setShowResetConfirm(true)}
                className='flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              >
                <RotateCcw className='h-4 w-4 mr-2' />
                Reset
              </button>
              <button
                onClick={handleSaveAsDefault}
                className='flex items-center px-4 py-2 border border-blue-300 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors'
              >
                <Shield className='h-4 w-4 mr-2' />
                Save as Default
              </button>
              <button
                onClick={handleResetToFactoryDefault}
                className='flex items-center px-4 py-2 border border-orange-300 bg-orange-50 rounded-lg text-orange-700 hover:bg-orange-100 transition-colors'
              >
                <RotateCcw className='h-4 w-4 mr-2' />
                Factory Reset
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              saveStatus === 'saving'
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <Save className='h-4 w-4 mr-2' />
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'saved'
                ? 'Saved!'
                : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white rounded-xl border p-4 text-center'>
          <div className='text-2xl font-bold text-blue-600'>
            {menuItems.length}
          </div>
          <div className='text-xs text-gray-500'>Total Items</div>
        </div>
        <div className='bg-white rounded-xl border p-4 text-center'>
          <div className='text-2xl font-bold text-yellow-600'>
            {coreItems.length}
          </div>
          <div className='text-xs text-gray-500'>Core Items</div>
        </div>
        <div className='bg-white rounded-xl border p-4 text-center'>
          <div className='text-2xl font-bold text-purple-600'>
            {additionalItems.length}
          </div>
          <div className='text-xs text-gray-500'>Additional Items</div>
        </div>
        <div className='bg-white rounded-xl border p-4 text-center'>
          <div className='text-2xl font-bold text-green-600'>
            {visibleItems.length}
          </div>
          <div className='text-xs text-gray-500'>Visible Items</div>
        </div>
      </div>

      {/* Instructions */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex items-start space-x-3'>
          <Info className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
          <div>
            <h3 className='font-medium text-blue-900 mb-1'>
              How to use the Menu Builder
            </h3>
            <ul className='text-sm text-blue-800 space-y-1'>
              <li>
                • <strong>Drag and drop</strong> items to reorder the menu
              </li>
              {canEditMenu && (
                <>
                  <li>
                    • <strong>Click the edit icon</strong> to rename menu items
                    and change paths
                  </li>
                  <li>
                    • <strong>Use the folder icon</strong> to move items between
                    parent menus
                  </li>
                  <li>
                    • <strong>Star icon</strong> marks items as Core (essential)
                    or Additional
                  </li>
                  <li>
                    • <strong>Eye icon</strong> toggles item visibility
                  </li>
                  <li>
                    • <strong>Create new items</strong> using the buttons below
                  </li>
                </>
              )}
              <li>
                • <strong>Changes save automatically</strong> and update the
                sidebar in real-time
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {canEditMenu && (
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => {
              setCreateType('parent');
              setShowCreateModal(true);
            }}
            className='flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
          >
            <FolderPlus className='h-4 w-4 mr-2' />
            Create Parent Menu
          </button>
          <button
            onClick={() => {
              setCreateType('child');
              setShowCreateModal(true);
            }}
            className='flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
          >
            <Plus className='h-4 w-4 mr-2' />
            Create Child Menu
          </button>
        </div>
      )}

      {/* Menu Items */}
      <div className='bg-white rounded-xl border p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-lg font-semibold'>Menu Items</h2>
          <div className='text-sm text-gray-500'>
            {canEditMenu ? 'Full edit access' : 'Reorder only'}
          </div>
        </div>

        <div className='max-h-96 overflow-y-auto'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={menuItems.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-2'>
                {menuItems.map(item => (
                  <SortableMenuItem
                    key={item.id}
                    item={item}
                    canEdit={canEditMenu}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                    onMoveToParent={handleMoveToParent}
                    onToggleCore={handleToggleCore}
                    allItems={menuItems}
                    isEditing={isEditing}
                    editingItem={editingItem}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {menuItems.length === 0 && (
          <div className='text-center py-8 text-gray-500'>
            <Menu className='h-12 w-12 mx-auto mb-4 text-gray-300' />
            <p>No menu items found. Reset to default to restore the menu.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateMenuModal
          type={createType}
          availableParents={menuItems.filter(item => !item.isSubmenu)}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateItem}
        />
      )}

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md shadow-xl'>
            <div className='flex items-center space-x-3 mb-4'>
              <AlertTriangle className='h-6 w-6 text-orange-500' />
              <h3 className='text-lg font-semibold'>Reset Menu to Default?</h3>
            </div>
            <p className='text-gray-600 mb-6'>
              This will reset all menu items to their default state. Any custom
              changes will be lost.
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => setShowResetConfirm(false)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className='px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors'
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Menu Modal Component
const CreateMenuModal: React.FC<{
  availableParents: MenuItem[];
  onClose: () => void;
  onCreate: (
    name: string,
    path: string,
    icon: string,
    parentId?: string
  ) => void;
  type: 'parent' | 'child';
}> = ({ type, availableParents, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('FileText');
  const [parentId, setParentId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && path) {
      onCreate(name, path, icon, type === 'child' ? parentId : undefined);
    }
  };

  const iconOptions = [
    'FileText',
    'Users',
    'Settings',
    'Calendar',
    'Building2',
    'CheckSquare',
    'PoundSterling',
    'MessageCircle',
    'Bell',
  ];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
      <div className='bg-white rounded-xl p-6 w-full max-w-md shadow-xl'>
        <div className='flex items-center space-x-3 mb-4'>
          {type === 'parent' ? (
            <FolderPlus className='h-6 w-6 text-blue-500' />
          ) : (
            <Plus className='h-6 w-6 text-green-500' />
          )}
          <h3 className='text-lg font-semibold'>
            Create {type === 'parent' ? 'Parent' : 'Child'} Menu Item
          </h3>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Name
            </label>
            <input
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Menu item name'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Path
            </label>
            <input
              type='text'
              value={path}
              onChange={e => setPath(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='menu-path'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Icon
            </label>
            <select
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {iconOptions.map(iconName => (
                <option key={iconName} value={iconName}>
                  {iconName}
                </option>
              ))}
            </select>
          </div>

          {type === 'child' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Parent Menu
              </label>
              <select
                value={parentId}
                onChange={e => setParentId(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              >
                <option value=''>Select parent menu</option>
                {availableParents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className='flex gap-3 justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SidebarSettings;
