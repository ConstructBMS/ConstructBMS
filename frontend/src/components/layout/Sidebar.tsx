import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileStack,
  FileText,
  FolderOpen,
  GanttChart,
  Globe,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Workflow,
} from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebarStore } from '../../app/store/ui/sidebar.store';
import { cn } from '../../lib/utils/cn';
import { Button } from '../ui/Button';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  { id: 'notes', label: 'Notes', icon: FileText, href: '/notes' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, href: '/chat' },
  { id: 'portal', label: 'Portal', icon: Globe, href: '/portal' },
  { id: 'contacts', label: 'Contacts', icon: Users, href: '/contacts' },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    href: '/projects',
    children: [
      {
        id: 'projects-list',
        label: 'Projects',
        icon: FolderOpen,
        href: '/projects',
      },
      {
        id: 'programme',
        label: 'Programme Manager',
        icon: GanttChart,
        href: '/projects/programme',
      },
    ],
  },
  { id: 'documents', label: 'Documents', icon: FileStack, href: '/documents' },
  { id: 'workflows', label: 'Workflows', icon: Workflow, href: '/workflows' },
  { id: 'pipeline', label: 'Pipeline', icon: TrendingUp, href: '/pipeline' },
  { id: 'estimates', label: 'Estimates', icon: Calculator, href: '/estimates' },
  {
    id: 'purchase-orders',
    label: 'Purchase Orders',
    icon: ShoppingCart,
    href: '/purchase-orders',
  },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore();
  const location = useLocation();

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-card border-r transition-all duration-300',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        {!collapsed && (
          <h1 className='text-lg font-semibold text-foreground'>
            ConstructBMS
          </h1>
        )}
        <Button
          variant='ghost'
          size='icon'
          onClick={toggle}
          className='h-8 w-8'
        >
          {collapsed ? (
            <ChevronRight className='h-4 w-4' />
          ) : (
            <ChevronLeft className='h-4 w-4' />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-2'>
        {navigationItems.map(item => (
          <div key={item.id}>
            <Link
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center',
                location.pathname === item.href &&
                  'bg-accent text-accent-foreground'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className='h-5 w-5 flex-shrink-0' />
              {!collapsed && <span>{item.label}</span>}
            </Link>

            {/* Children */}
            {item.children && !collapsed && (
              <div className='ml-6 mt-1 space-y-1'>
                {item.children.map(child => (
                  <Link
                    key={child.id}
                    to={child.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                      location.pathname === child.href &&
                        'bg-accent text-accent-foreground'
                    )}
                  >
                    <child.icon className='h-4 w-4 flex-shrink-0' />
                    <span>{child.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
