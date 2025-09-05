import React from 'react';
import { cn } from '../../lib/utils/cn';
import { useSidebarStore } from '../../app/store/ui/sidebar.store';
import { Button } from '../ui/Button';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Globe,
  Users,
  FolderOpen,
  GanttChart,
  FileStack,
  Workflow,
  TrendingUp,
  Calculator,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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
            <a
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className='h-5 w-5 flex-shrink-0' />
              {!collapsed && <span>{item.label}</span>}
            </a>

            {/* Children */}
            {item.children && !collapsed && (
              <div className='ml-6 mt-1 space-y-1'>
                {item.children.map(child => (
                  <a
                    key={child.id}
                    href={child.href}
                    className='flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
                  >
                    <child.icon className='h-4 w-4 flex-shrink-0' />
                    <span>{child.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
