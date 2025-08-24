import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  FileText, 
  ShoppingCart, 
  HelpCircle,
  Users,
  MessageSquare,
  FolderOpen,
  TrendingUp,
  Library,
  Settings,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
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
    route: '/dashboard'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: 'Calendar',
    route: '/calendar'
  },
  {
    id: 'tasks',
    name: 'Tasks',
    icon: 'CheckSquare',
    route: '/tasks'
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: 'FileText',
    route: '/notes'
  },
  {
    id: 'procurement',
    name: 'Procurement',
    icon: 'ShoppingCart',
    route: '/procurement'
  },
  {
    id: 'support',
    name: 'Support',
    icon: 'HelpCircle',
    route: '/support'
  },
  {
    id: 'crm',
    name: 'CRM',
    icon: 'Users',
    children: [
      { id: 'clients', name: 'Clients', route: '/crm/clients' },
      { id: 'contractors', name: 'Contractors', route: '/crm/contractors' },
      { id: 'consultants', name: 'Consultants', route: '/crm/consultants' }
    ]
  },
  {
    id: 'communications',
    name: 'Communications',
    icon: 'MessageSquare',
    children: [
      { id: 'email', name: 'Email', route: '/communications/email' },
      { id: 'messenger', name: 'Messenger', route: '/communications/messenger' }
    ]
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: 'FolderOpen',
    children: [
      { id: 'projects-list', name: 'Projects', route: '/projects' },
      { id: 'project-planner', name: 'Project Planner', route: '/projects/planner' }
    ]
  },
  {
    id: 'opportunities',
    name: 'Opportunities',
    icon: 'TrendingUp',
    children: [
      { id: 'sales-pipeline', name: 'Sales Pipeline', route: '/opportunities/pipeline' }
    ]
  },
  {
    id: 'document-hub',
    name: 'Document Hub',
    icon: 'Library',
    children: [
      { id: 'library', name: 'Library', route: '/documents/library' },
      { id: 'document-builder', name: 'Document Builder', route: '/documents/builder' }
    ]
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'Settings',
    children: [
      { id: 'general-settings', name: 'General Settings', route: '/settings/general' },
      { id: 'users-roles', name: 'Users & Roles', route: '/settings/users' },
      { id: 'menu-builder', name: 'Menu Builder', route: '/settings/menu' },
      { id: 'modules', name: 'Modules', route: '/settings/modules' }
    ]
  }
];

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  FileText,
  ShoppingCart,
  HelpCircle,
  Users,
  MessageSquare,
  FolderOpen,
  TrendingUp,
  Library,
  Settings
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { signOut } = useAuth();

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
    return location.pathname === route || location.pathname.startsWith(route + '/');
  };

  const renderMenuItem = (item: MenuItem) => {
    const IconComponent = iconMap[item.icon];
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isItemActive = isActive(item.route);

    return (
      <div key={item.id}>
        <div
          className={`sidebar-item ${isItemActive ? 'active' : ''} ${
            hasChildren ? 'cursor-pointer' : ''
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            }
          }}
        >
          {IconComponent && <IconComponent className="w-5 h-5 mr-3" />}
          <span className="flex-1">{item.name}</span>
          {hasChildren && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-6 space-y-1">
            {item.children!.map((child) => (
              <Link
                key={child.id}
                to={child.route!}
                className={`sidebar-item ${isActive(child.route) ? 'active' : ''} pl-8`}
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">ConstructBMS</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(renderMenuItem)}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
