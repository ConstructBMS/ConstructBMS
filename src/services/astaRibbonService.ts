import { supabase } from './supabase';

export interface RibbonTab {
  active: boolean;
  icon: string;
  id: string;
  label: string;
  order: number;
  permissions?: string[];
  visible: boolean;
}

export interface RibbonConfig {
  tabs: RibbonTab[];
  userPreferences: {
    customTabs: string[];
    defaultTab: string;
  };
}

class AstaRibbonService {
  private configCache: Map<string, RibbonConfig> = new Map();

  async getRibbonConfig(userRole: string): Promise<RibbonConfig> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    return this.getDefaultConfig(userRole);
  }

  private getDefaultConfig(userRole: string): RibbonConfig {
    const baseTabs: RibbonTab[] = [
      {
        id: 'home',
        label: 'Home',
        icon: 'HomeIcon',
        active: true,
        visible: true,
        order: 1,
        permissions: ['admin', 'project_manager', 'scheduler', 'viewer']
      },
      {
        id: 'view',
        label: 'View',
        icon: 'EyeIcon',
        active: false,
        visible: true,
        order: 2,
        permissions: ['admin', 'project_manager', 'scheduler', 'viewer']
      },
      {
        id: 'project',
        label: 'Project',
        icon: 'FolderIcon',
        active: false,
        visible: true,
        order: 3,
        permissions: ['admin', 'project_manager', 'scheduler']
      },
      {
        id: 'allocation',
        label: 'Allocation',
        icon: 'UserGroupIcon',
        active: false,
        visible: true,
        order: 4,
        permissions: ['admin', 'project_manager', 'scheduler']
      },
      {
        id: 'format',
        label: 'Format',
        icon: 'PaintBrushIcon',
        active: false,
        visible: true,
        order: 5,
        permissions: ['admin', 'project_manager']
      },
      {
        id: 'output',
        label: 'Output',
        icon: 'DocumentArrowDownIcon',
        active: false,
        visible: true,
        order: 6,
        permissions: ['admin', 'project_manager', 'scheduler']
      }
    ];

    // Filter tabs based on user role permissions
    const filteredTabs = baseTabs.filter(tab => 
      !tab.permissions || tab.permissions.includes(userRole)
    ).sort((a, b) => a.order - b.order);

    return {
      tabs: filteredTabs,
      userPreferences: {
        defaultTab: 'home',
        customTabs: []
      }
    };
  }

  async handleTabChange(tabId: string): Promise<void> {
    try {
      // Log tab change for analytics
      await this.logTabChange(tabId);

      // Handle specific tab change logic
      switch (tabId) {
        case 'home':
          console.log('Switched to Home tab');
          break;
        case 'view':
          console.log('Switched to View tab');
          break;
        case 'project':
          console.log('Switched to Project tab');
          break;
        case 'allocation':
          console.log('Switched to Allocation tab');
          break;
        case 'format':
          console.log('Switched to Format tab');
          break;
        case 'output':
          console.log('Switched to Output tab');
          break;
        default:
          console.log(`Unknown tab: ${tabId}`);
      }
    } catch (error) {
      console.error('Tab change failed:', error);
      throw error;
    }
  }

  private async logTabChange(tabId: string): Promise<void> {
    // Skip tab change logging for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    return;
  }

  async updateUserPreferences(userRole: string, preferences: any): Promise<void> {
    // Skip database calls for now to prevent 404 errors
    // This can be re-enabled once the database tables are set up
    return;
  }

  async getDefaultTab(userRole: string): Promise<string> {
    try {
      const config = await this.getRibbonConfig(userRole);
      return config.userPreferences.defaultTab || 'home';
    } catch (error) {
      console.error('Failed to get default tab:', error);
      return 'home';
    }
  }

  async setDefaultTab(userRole: string, tabId: string): Promise<void> {
    try {
      const config = await this.getRibbonConfig(userRole);
      await this.updateUserPreferences(userRole, {
        ...config.userPreferences,
        defaultTab: tabId
      });
    } catch (error) {
      console.error('Failed to set default tab:', error);
      throw error;
    }
  }

  // Clear caches (useful for testing or when data becomes stale)
  clearCaches(): void {
    this.configCache.clear();
  }
}

export const astaRibbonService = new AstaRibbonService(); 