import { supabase } from './supabase';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  visible: boolean;
  order: number;
  permissions?: string[];
}

export interface SidebarConfig {
  items: SidebarMenuItem[];
  userPreferences: {
    collapsed: boolean;
    pinnedItems: string[];
  };
}

class AstaSidebarService {
  private configCache: Map<string, SidebarConfig> = new Map();

  async getSidebarConfig(userRole: string): Promise<SidebarMenuItem[]> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    return this.getDefaultConfig(userRole);
  }

  private getDefaultConfig(userRole: string): SidebarMenuItem[] {
    const baseItems: SidebarMenuItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'ChartBarIcon',
        active: false,
        visible: true,
        order: 1,
        permissions: ['admin', 'project_manager', 'scheduler', 'viewer']
      },
      {
        id: 'gantt',
        label: 'Gantt Chart',
        icon: 'CalendarIcon',
        active: true,
        visible: true,
        order: 2,
        permissions: ['admin', 'project_manager', 'scheduler', 'viewer']
      },
      {
        id: 'resources',
        label: 'Resources',
        icon: 'UserGroupIcon',
        active: false,
        visible: true,
        order: 3,
        permissions: ['admin', 'project_manager', 'scheduler']
      },
      {
        id: 'costs',
        label: 'Costs',
        icon: 'CurrencyDollarIcon',
        active: false,
        visible: true,
        order: 4,
        permissions: ['admin', 'project_manager']
      },
      {
        id: 'documents',
        label: 'Documents',
        icon: 'DocumentTextIcon',
        active: false,
        visible: true,
        order: 5,
        permissions: ['admin', 'project_manager', 'scheduler', 'viewer']
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'PresentationChartLineIcon',
        active: false,
        visible: true,
        order: 6,
        permissions: ['admin', 'project_manager', 'scheduler']
      },
      {
        id: 'tasks',
        label: 'Tasks',
        icon: 'ClipboardDocumentListIcon',
        active: false,
        visible: true,
        order: 7,
        permissions: ['admin', 'project_manager', 'scheduler', 'viewer']
      },
      {
        id: 'tools',
        label: 'Tools',
        icon: 'WrenchScrewdriverIcon',
        active: false,
        visible: true,
        order: 8,
        permissions: ['admin', 'project_manager']
      }
    ];

    // Filter items based on user role permissions
    return baseItems.filter(item => 
      !item.permissions || item.permissions.includes(userRole)
    ).sort((a, b) => a.order - b.order);
  }

  async handleNavigation(itemId: string, activeProject: any): Promise<void> {
    try {
      // Log navigation for analytics
      await this.logNavigation(itemId, activeProject);

      // Handle specific navigation logic
      switch (itemId) {
        case 'dashboard':
          // Navigate to dashboard view
          console.log('Navigating to dashboard');
          break;
        case 'gantt':
          // Navigate to Gantt chart view
          console.log('Navigating to Gantt chart');
          break;
        case 'resources':
          // Navigate to resources view
          console.log('Navigating to resources');
          break;
        case 'costs':
          // Navigate to costs view
          console.log('Navigating to costs');
          break;
        case 'documents':
          // Navigate to documents view
          console.log('Navigating to documents');
          break;
        case 'reports':
          // Navigate to reports view
          console.log('Navigating to reports');
          break;
        case 'tasks':
          // Navigate to tasks view
          console.log('Navigating to tasks');
          break;
        case 'tools':
          // Navigate to tools view
          console.log('Navigating to tools');
          break;
        default:
          console.log(`Unknown navigation item: ${itemId}`);
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      throw error;
    }
  }

  private async logNavigation(itemId: string, activeProject: any): Promise<void> {
    // Skip navigation logging entirely for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    return;
  }

  async updateUserPreferences(userRole: string, preferences: any): Promise<void> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    return;
  }

  async getPinnedItems(userRole: string): Promise<string[]> {
    try {
      const config = await this.getSidebarConfig(userRole);
      const cachedConfig = this.configCache.get(userRole);
      return cachedConfig?.userPreferences?.pinnedItems || [];
    } catch (error) {
      // Silently handle errors and return empty array
      return [];
    }
  }

  async togglePinnedItem(userRole: string, itemId: string): Promise<void> {
    try {
      const pinnedItems = await this.getPinnedItems(userRole);
      const newPinnedItems = pinnedItems.includes(itemId)
        ? pinnedItems.filter(id => id !== itemId)
        : [...pinnedItems, itemId];

      await this.updateUserPreferences(userRole, {
        pinnedItems: newPinnedItems
      });
    } catch (error) {
      // Silently handle errors - pinned items are not critical functionality
    }
  }
}

export const astaSidebarService = new AstaSidebarService(); 