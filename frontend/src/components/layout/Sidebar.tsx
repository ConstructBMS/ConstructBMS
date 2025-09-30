import {
  Building2,
  Calculator,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileStack,
  FolderOpen,
  GanttChart,
  Globe,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingCart,
  TrendingUp,
  User,
  Users,
  Workflow,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFeatureFlag } from '../../app/store/featureFlags.store';
import { useSidebarStore } from '../../app/store/ui/sidebar.store';
import { cn } from '../../lib/utils/cn';
import { Button } from '../ui';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard-home',
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: TrendingUp,
    href: '/pipeline',
    flag: 'pipeline' as const,
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageSquare,
    href: '/chat',
    flag: 'chat' as const,
  },
  {
    id: 'portal',
    label: 'Portal',
    icon: Globe,
    href: '/portal',
    flag: 'portal' as const,
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: Users,
    href: '/contacts',
    flag: 'contacts' as const,
    children: [
      {
        id: 'contacts-clients',
        label: 'Clients',
        icon: Users,
        href: '/contacts/clients',
        flag: 'contacts' as const,
      },
      {
        id: 'contacts-contractors',
        label: 'Contractors',
        icon: User,
        href: '/contacts/contractors',
        flag: 'contacts' as const,
      },
      {
        id: 'contacts-consultants',
        label: 'Consultants',
        icon: Building2,
        href: '/contacts/consultants',
        flag: 'contacts' as const,
      },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: LayoutDashboard,
    href: '/projects',
    flag: 'projects' as const,
    children: [
      {
        id: 'projects-management',
        label: 'Project Management',
        icon: FolderOpen,
        href: '/projects/management',
        flag: 'projects' as const,
      },
      {
        id: 'programme',
        label: 'Programme Manager',
        icon: GanttChart,
        href: '/projects/programme',
        flag: 'programme' as const,
      },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileStack,
    href: '/documents',
    flag: 'documents.library' as const,
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: Workflow,
    href: '/workflows',
    flag: 'workflows' as const,
  },
  {
    id: 'estimates',
    label: 'Estimates',
    icon: Calculator,
    href: '/estimates',
    flag: 'estimates' as const,
  },
  {
    id: 'purchase-orders',
    label: 'Purchase Orders',
    icon: ShoppingCart,
    href: '/purchase-orders',
    flag: 'purchaseOrders' as const,
  },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Persist expansion state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded-items');
    if (saved) {
      try {
        setExpandedItems(new Set(JSON.parse(saved)));
      } catch (e) {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Save expansion state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      'sidebar-expanded-items',
      JSON.stringify([...expandedItems])
    );
  }, [expandedItems]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Get feature flags for all items
  const contactsFlag = useFeatureFlag('contacts');
  const projectsFlag = useFeatureFlag('projects');
  const programmeFlag = useFeatureFlag('programme');
  const chatFlag = useFeatureFlag('chat');
  const portalFlag = useFeatureFlag('portal');
  const documentsFlag = useFeatureFlag('documents.library');
  const workflowsFlag = useFeatureFlag('workflows');
  const pipelineFlag = useFeatureFlag('pipeline');
  const estimatesFlag = useFeatureFlag('estimates');
  const purchaseOrdersFlag = useFeatureFlag('purchaseOrders');

  // Filter navigation items based on feature flags
  const filteredItems = navigationItems
    .filter(item => {
      if (!item.flag) return true;
      switch (item.flag) {
        case 'contacts':
          return contactsFlag;
        case 'projects':
          return projectsFlag;
        case 'chat':
          return chatFlag;
        case 'portal':
          return portalFlag;
        case 'documents.library':
          return documentsFlag;
        case 'workflows':
          return workflowsFlag;
        case 'pipeline':
          return pipelineFlag;
        case 'estimates':
          return estimatesFlag;
        case 'purchaseOrders':
          return purchaseOrdersFlag;
        default:
          return true;
      }
    })
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => {
            if (!child.flag) return true;
            switch (child.flag) {
              case 'contacts':
                return contactsFlag;
              case 'projects':
                return projectsFlag;
              case 'programme':
                return programmeFlag;
              default:
                return true;
            }
          }),
        };
      }
      return item;
    });

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
        {filteredItems.map(item => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.has(item.id);
          const isActive =
            location.pathname === item.href ||
            (hasChildren &&
              item.children?.some(child => location.pathname === child.href));

          return (
            <div key={item.id}>
              <div className='flex items-center'>
                {hasChildren ? (
                  // Parent item with children - click to expand/collapse and navigate
                  <div
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex-1 cursor-pointer',
                      collapsed && 'justify-center',
                      isActive && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => {
                      const isCurrentlyExpanded = expandedItems.has(item.id);

                      // Toggle expansion state
                      toggleExpanded(item.id);

                      // Only navigate to parent page if we're expanding (not collapsing)
                      if (!isCurrentlyExpanded) {
                        navigate(item.href);
                      }
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className='h-5 w-5 flex-shrink-0' />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && (
                      <div className='ml-auto'>
                        {isExpanded ? (
                          <ChevronUp className='h-4 w-4' />
                        ) : (
                          <ChevronDown className='h-4 w-4' />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular item without children - click to navigate
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex-1',
                      collapsed && 'justify-center',
                      isActive && 'bg-accent text-accent-foreground'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className='h-5 w-5 flex-shrink-0' />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )}
              </div>

              {/* Children */}
              {hasChildren && !collapsed && isExpanded && (
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
          );
        })}
      </nav>
    </div>
  );
}
