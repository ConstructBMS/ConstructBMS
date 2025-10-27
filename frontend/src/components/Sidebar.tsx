import { useThemeStore } from '@/app/store/ui/theme.store';
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  GanttChart,
  HelpCircle,
  LayoutDashboard,
  Library,
  Mail,
  MessageSquare,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { MenuItem } from '../types/index';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'LayoutDashboard',
    route: '/dashboard',
  },
  {
    id: 'email',
    name: 'Email',
    icon: 'Mail',
    route: '/communications/email',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: 'Calendar',
    route: '/calendar',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    icon: 'CheckSquare',
    route: '/tasks',
  },
  {
    id: 'procurement',
    name: 'Procurement',
    icon: 'ShoppingCart',
    route: '/procurement',
  },
  {
    id: 'support',
    name: 'Support',
    icon: 'HelpCircle',
    route: '/support',
  },
  {
    id: 'crm',
    name: 'CRM',
    icon: 'Users',
    children: [
      { id: 'clients', name: 'Clients', route: '/crm/clients' },
      { id: 'contractors', name: 'Contractors', route: '/crm/contractors' },
      { id: 'consultants', name: 'Consultants', route: '/crm/consultants' },
    ],
  },
  {
    id: 'communications',
    name: 'Communications',
    icon: 'MessageSquare',
    children: [
      { id: 'email', name: 'Email', route: '/communications/email' },
      {
        id: 'messenger',
        name: 'Messenger',
        route: '/communications/messenger',
      },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: 'FolderOpen',
    children: [
      { id: 'projects-list', name: 'Projects', route: '/projects' },
      {
        id: 'programme-manager',
        name: 'Programme Manager',
        route: '/projects/programme-manager',
      },
    ],
  },
  {
    id: 'opportunities',
    name: 'Opportunities',
    icon: 'TrendingUp',
    children: [
      {
        id: 'sales-pipeline',
        name: 'Sales Pipeline',
        route: '/opportunities/pipeline',
      },
    ],
  },
  {
    id: 'document-hub',
    name: 'Document Hub',
    icon: 'Library',
    children: [
      { id: 'library', name: 'Library', route: '/documents/library' },
      {
        id: 'document-builder',
        name: 'Document Builder',
        route: '/documents/builder',
      },
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'Settings',
    children: [
      {
        id: 'general-settings',
        name: 'General Settings',
        route: '/settings/general',
      },
      {
        id: 'users-roles',
        name: 'Users & Roles',
        route: '/settings/users-and-roles',
      },
      { id: 'menu-builder', name: 'Menu Builder', route: '/settings/menu' },
      { id: 'modules', name: 'Modules', route: '/settings/modules' },
      {
        id: 'footer-builder',
        name: 'Footer Builder',
        route: '/settings/footer-builder',
      },
    ],
  },
];

const iconMap: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  FileText,
  ShoppingCart,
  GanttChart,
  HelpCircle,
  Users,
  MessageSquare,
  FolderOpen,
  TrendingUp,
  Library,
  Settings,
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme } = useThemeStore();

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (route?: string) => {
    if (!route) return false;
    return (
      location.pathname === route || location.pathname.startsWith(route + '/')
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const IconComponent = iconMap[item.icon];
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isItemActive = isActive(item.route);

    return (
      <div key={item.id}>
        {hasChildren ? (
          // Parent item with children - click to expand/collapse
          <div
            className={`sidebar-item ${isItemActive ? 'active' : ''} cursor-pointer`}
            onClick={() => {
              console.log(
                `📂 Toggling ${item.name} (${isExpanded ? 'collapse' : 'expand'})`
              );
              toggleExpanded(item.id);
            }}
          >
            {IconComponent && <IconComponent className='w-6 h-6 mr-3' />}
            <span className='flex-1 text-base'>{item.name}</span>
            {isExpanded ? (
              <ChevronDown className='w-4 h-4' />
            ) : (
              <ChevronRight className='w-4 h-4' />
            )}
          </div>
        ) : (
          // Main item without children - click to navigate
          <Link
            to={item.route!}
            className={`sidebar-item ${isItemActive ? 'active' : ''}`}
            onClick={() => console.log(`🔄 Navigating to: ${item.route}`)}
          >
            {IconComponent && <IconComponent className='w-6 h-6 mr-3' />}
            <span className='flex-1 text-base'>{item.name}</span>
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className='ml-6 space-y-1'>
            {item.children!.map(child => (
              <Link
                key={child.id}
                to={child.route!}
                className={`sidebar-item ${isActive(child.route) ? 'active' : ''} pl-8 text-base`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out ${
          isOpen
            ? 'w-64 translate-x-0'
            : 'w-0 -translate-x-full lg:w-12 lg:translate-x-0'
        } lg:relative lg:inset-0`}
        style={{
          backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
          width: isOpen ? '256px' : '48px',
        }}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-2 overflow-hidden min-h-[60px]'>
          <div className='flex items-center min-w-0'>
            <div
              className={`bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                isOpen ? 'w-8 h-8' : 'w-8 h-8'
              }`}
            >
              <span
                className={`text-white font-bold transition-all duration-300 ${
                  isOpen ? 'text-sm' : 'text-sm'
                }`}
              >
                C
              </span>
            </div>
            <span
              className={`ml-3 text-lg font-semibold transition-opacity duration-300 ${
                isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
              }`}
              style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
            >
              ConstructBMS
            </span>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onToggle}
            className='lg:hidden p-1 rounded-md transition-colors duration-200'
            style={{
              color: theme === 'light' ? '#1e293b' : '#f9fafb',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.backgroundColor =
                theme === 'light' ? '#f1f5f9' : '#374151')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 p-4 space-y-2 overflow-y-auto scrollbar-accent scrollbar-fade transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
          }`}
        >
          {menuItems.map(renderMenuItem)}
        </nav>

        {/* Collapsed Navigation Icons */}
        <div
          className={`lg:flex hidden flex-col items-center space-y-1 transition-opacity duration-300 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundColor: 'transparent',
          }}
        >
          {menuItems.map(item => {
            const IconComponent = iconMap[item.icon];
            const isItemActive = isActive(item.route);
            return (
              <div
                key={item.id}
                className='flex justify-center items-center w-full'
                style={{
                  backgroundColor: 'transparent',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <div
                  className='w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor =
                      theme === 'light' ? '#f1f5f9' : '#374151')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                  onClick={() => {
                    if (item.route) {
                      console.log(`🔄 Navigating to: ${item.route}`);
                      navigate(item.route);
                    } else {
                      console.log(`📂 Toggling ${item.name}`);
                      toggleExpanded(item.id);
                      // Expand sidebar when clicking parent items
                      if (!isOpen) {
                        onToggle();
                      }
                    }
                  }}
                >
                  {IconComponent && (
                    <IconComponent
                      className='w-7 h-7'
                      style={{
                        color: isItemActive
                          ? theme === 'light'
                            ? '#3b82f6'
                            : '#60a5fa'
                          : theme === 'light'
                            ? '#1e293b'
                            : '#f9fafb',
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
          }`}
          style={{ borderColor: theme === 'light' ? '#1e293b' : '#374151' }}
        >
          <button
            onClick={signOut}
            className='w-full px-3 py-2 text-sm rounded-md transition-colors duration-200'
            style={{
              color: theme === 'light' ? '#1e293b' : '#f9fafb',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.backgroundColor =
                theme === 'light' ? '#f1f5f9' : '#374151')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
