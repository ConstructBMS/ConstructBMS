import React, { useState, useEffect } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  UsersIcon,
  CalculatorIcon,
  ShoppingCartIcon,
  CogIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartPieIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// Types
export type UserRole = 'super_admin' | 'project_manager' | 'viewer' | 'scheduler' | 'estimator' | 'procurement';

export interface SidebarItem {
  badge?: string | number;
  children?: SidebarItem[];
  icon: React.ComponentType<any>;
  id: string;
  isActive?: boolean;
  label: string;
  path: string;
  roles: UserRole[];
}

interface GanttSidebarProps {
  activeSection: string;
  className?: string;
  collapsed: boolean;
  onSectionChange: (section: string) => void;
  onToggle: () => void;
  userRole: UserRole;
}

const GanttSidebar: React.FC<GanttSidebarProps> = ({
  collapsed,
  onToggle,
  activeSection,
  userRole,
  onSectionChange,
  className = ''
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Sidebar configuration based on user role
  const getSidebarItems = (role: UserRole): SidebarItem[] => {
    const baseItems: SidebarItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: HomeIcon,
        path: '/gantt/dashboard',
        roles: ['super_admin', 'project_manager', 'viewer', 'scheduler', 'estimator', 'procurement'],
        isActive: activeSection === 'dashboard'
      },
      {
        id: 'gantt-planner',
        label: 'Gantt Planner',
        icon: ChartBarIcon,
        path: '/gantt/planner',
        roles: ['super_admin', 'project_manager', 'scheduler'],
        isActive: activeSection === 'gantt-planner'
      },
      {
        id: 'calendar',
        label: 'Calendar',
        icon: CalendarIcon,
        path: '/gantt/calendar',
        roles: ['super_admin', 'project_manager', 'scheduler', 'viewer'],
        isActive: activeSection === 'calendar'
      },
      {
        id: 'clients',
        label: 'Clients',
        icon: UsersIcon,
        path: '/gantt/clients',
        roles: ['super_admin', 'project_manager', 'viewer'],
        children: [
          {
            id: 'client-list',
            label: 'Client List',
            icon: UsersIcon,
            path: '/gantt/clients/list',
            roles: ['super_admin', 'project_manager', 'viewer']
          },
          {
            id: 'client-projects',
            label: 'Client Projects',
            icon: BuildingOfficeIcon,
            path: '/gantt/clients/projects',
            roles: ['super_admin', 'project_manager', 'viewer']
          }
        ],
        isActive: activeSection === 'clients'
      },
      {
        id: 'estimates',
        label: 'Estimates',
        icon: CalculatorIcon,
        path: '/gantt/estimates',
        roles: ['super_admin', 'project_manager', 'estimator'],
        children: [
          {
            id: 'estimate-builder',
            label: 'Estimate Builder',
            icon: CalculatorIcon,
            path: '/gantt/estimates/builder',
            roles: ['super_admin', 'project_manager', 'estimator']
          },
          {
            id: 'estimate-history',
            label: 'Estimate History',
            icon: DocumentTextIcon,
            path: '/gantt/estimates/history',
            roles: ['super_admin', 'project_manager', 'estimator']
          }
        ],
        isActive: activeSection === 'estimates'
      },
      {
        id: 'procurement',
        label: 'Procurement',
        icon: ShoppingCartIcon,
        path: '/gantt/procurement',
        roles: ['super_admin', 'project_manager', 'procurement'],
        children: [
          {
            id: 'purchase-orders',
            label: 'Purchase Orders',
            icon: ShoppingCartIcon,
            path: '/gantt/procurement/orders',
            roles: ['super_admin', 'project_manager', 'procurement']
          },
          {
            id: 'suppliers',
            label: 'Suppliers',
            icon: BuildingOfficeIcon,
            path: '/gantt/procurement/suppliers',
            roles: ['super_admin', 'project_manager', 'procurement']
          }
        ],
        isActive: activeSection === 'procurement'
      }
    ];

    // Add admin-only items for super_admin
    if (role === 'super_admin') {
      baseItems.push(
        {
          id: 'reports',
          label: 'Reports',
          icon: ChartPieIcon,
          path: '/gantt/reports',
          roles: ['super_admin'],
          isActive: activeSection === 'reports'
        },
        {
          id: 'time-tracking',
          label: 'Time Tracking',
          icon: ClockIcon,
          path: '/gantt/time-tracking',
          roles: ['super_admin', 'project_manager'],
          isActive: activeSection === 'time-tracking'
        },
        {
          id: 'user-management',
          label: 'User Management',
          icon: UserGroupIcon,
          path: '/gantt/users',
          roles: ['super_admin'],
          children: [
            {
              id: 'users',
              label: 'Users',
              icon: UsersIcon,
              path: '/gantt/users/list',
              roles: ['super_admin']
            },
            {
              id: 'roles',
              label: 'Roles & Permissions',
              icon: KeyIcon,
              path: '/gantt/users/roles',
              roles: ['super_admin']
            }
          ],
          isActive: activeSection === 'user-management'
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: CogIcon,
          path: '/gantt/settings',
          roles: ['super_admin'],
          children: [
            {
              id: 'general-settings',
              label: 'General Settings',
              icon: CogIcon,
              path: '/gantt/settings/general',
              roles: ['super_admin']
            },
            {
              id: 'security',
              label: 'Security',
              icon: ShieldCheckIcon,
              path: '/gantt/settings/security',
              roles: ['super_admin']
            }
          ],
          isActive: activeSection === 'settings'
        }
      );
    }

    return baseItems;
  };

  // Filter items based on user role
  const sidebarItems = getSidebarItems(userRole).filter(item => 
    item.roles.includes(userRole)
  );

  // Handle item click
  const handleItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      // Toggle expanded state for items with children
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else {
      // Navigate to the section
      onSectionChange(item.id);
    }
  };

  // Check if item or any of its children is active
  const isItemActive = (item: SidebarItem): boolean => {
    if (item.isActive) return true;
    if (item.children) {
      return item.children.some(child => child.isActive);
    }
    return false;
  };

  // Render sidebar item
  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const paddingLeft = level * 16 + 16; // 16px base + 16px per level

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={`
            w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
            ${isActive 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }
            ${collapsed ? 'justify-center px-2' : 'justify-start'}
          `}
          style={{ paddingLeft: collapsed ? undefined : `${paddingLeft}px` }}
          title={collapsed ? item.label : undefined}
        >
          <item.icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
          
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <ChevronRightIcon 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`} 
                />
              )}
            </>
          )}
        </button>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`
      bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 
      border-r border-gray-700 
      flex flex-col 
      transition-all duration-300 ease-in-out
      ${collapsed ? 'w-16' : 'w-64'} 
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 font-bold text-white text-lg">Gantt</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map(item => renderSidebarItem(item))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {userRole.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <p className="text-xs text-gray-400">Active</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default GanttSidebar; 