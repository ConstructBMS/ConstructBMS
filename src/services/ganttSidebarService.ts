import { supabase } from './supabase';
import { loggingService } from './loggingService';
import type { UserRole } from '../components/modules/GanttSidebar';

// Service-specific interface without icon requirement
export interface SidebarItemConfig {
  id: string;
  label: string;
  path: string;
  roles: UserRole[];
  badge?: string | number;
  children?: SidebarItemConfig[];
  isActive?: boolean;
}

export interface SidebarConfig {
  id: string;
  name: string;
  items: SidebarItemConfig[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSidebarPreferences {
  userId: string;
  sidebarConfigId: string;
  collapsed: boolean;
  expandedItems: string[];
  customOrder: string[];
  preferences: {
    showBadges: boolean;
    showIcons: boolean;
    compactMode: boolean;
    autoExpand: boolean;
  };
}

class GanttSidebarService {
  private cachedConfigs: Map<string, SidebarConfig> = new Map();
  private userPreferences: Map<string, UserSidebarPreferences> = new Map();

  // Load sidebar configuration from Supabase
  async loadSidebarConfig(configId?: string): Promise<SidebarConfig | null> {
    try {
      const { data, error } = await supabase
        .from('gantt_sidebar_configs')
        .select('*')
        .eq('is_active', true)
        .eq(configId ? 'id' : 'is_default', configId || true)
        .single();

      if (error) throw error;

      if (data) {
        const config: SidebarConfig = {
          id: data.id,
          name: data.name,
          items: data.items || [],
          isActive: data.is_active,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };

        this.cachedConfigs.set(config.id, config);
        return config;
      }

      return null;
    } catch (error) {
      console.error('Failed to load sidebar config:', error);
      loggingService.error('GanttSidebarService.loadSidebarConfig', error as Error);
      return null;
    }
  }

  // Get default sidebar items (fallback when no config is available)
  getDefaultSidebarItems(role: UserRole): SidebarItemConfig[] {
    const baseItems: SidebarItemConfig[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/gantt/dashboard',
        roles: ['super_admin', 'project_manager', 'viewer', 'scheduler', 'estimator', 'procurement']
      },
      {
        id: 'gantt-planner',
        label: 'Gantt Planner',
        path: '/gantt/planner',
        roles: ['super_admin', 'project_manager', 'scheduler']
      },
      {
        id: 'calendar',
        label: 'Calendar',
        path: '/gantt/calendar',
        roles: ['super_admin', 'project_manager', 'scheduler', 'viewer']
      },
      {
        id: 'clients',
        label: 'Clients',
        path: '/gantt/clients',
        roles: ['super_admin', 'project_manager', 'viewer']
      },
      {
        id: 'estimates',
        label: 'Estimates',
        path: '/gantt/estimates',
        roles: ['super_admin', 'project_manager', 'estimator']
      },
      {
        id: 'procurement',
        label: 'Procurement',
        path: '/gantt/procurement',
        roles: ['super_admin', 'project_manager', 'procurement']
      }
    ];

    // Add admin-only items
    if (role === 'super_admin') {
      baseItems.push(
        {
          id: 'reports',
          label: 'Reports',
          path: '/gantt/reports',
          roles: ['super_admin']
        },
        {
          id: 'user-management',
          label: 'User Management',
          path: '/gantt/users',
          roles: ['super_admin']
        },
        {
          id: 'settings',
          label: 'Settings',
          path: '/gantt/settings',
          roles: ['super_admin']
        }
      );
    }

    return baseItems;
  }

  // Load user sidebar preferences
  async loadUserPreferences(userId: string): Promise<UserSidebarPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('gantt_user_sidebar_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const preferences: UserSidebarPreferences = {
          userId: data.user_id,
          sidebarConfigId: data.sidebar_config_id,
          collapsed: data.collapsed,
          expandedItems: data.expanded_items || [],
          customOrder: data.custom_order || [],
          preferences: data.preferences || {
            showBadges: true,
            showIcons: true,
            compactMode: false,
            autoExpand: false
          }
        };

        this.userPreferences.set(userId, preferences);
        return preferences;
      }

      // Return default preferences if none exist
      return {
        userId,
        sidebarConfigId: 'default',
        collapsed: false,
        expandedItems: [],
        customOrder: [],
        preferences: {
          showBadges: true,
          showIcons: true,
          compactMode: false,
          autoExpand: false
        }
      };
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      loggingService.error('GanttSidebarService.loadUserPreferences', error as Error);
      return null;
    }
  }

  // Save user sidebar preferences
  async saveUserPreferences(preferences: UserSidebarPreferences): Promise<void> {
    try {
      const { error } = await supabase
        .from('gantt_user_sidebar_preferences')
        .upsert({
          user_id: preferences.userId,
          sidebar_config_id: preferences.sidebarConfigId,
          collapsed: preferences.collapsed,
          expanded_items: preferences.expandedItems,
          custom_order: preferences.customOrder,
          preferences: preferences.preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      this.userPreferences.set(preferences.userId, preferences);
      loggingService.info('GanttSidebarService.saveUserPreferences', 'Preferences saved successfully');
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      loggingService.error('GanttSidebarService.saveUserPreferences', error as Error);
    }
  }

  // Update user preference
  async updateUserPreference(userId: string, updates: Partial<UserSidebarPreferences>): Promise<void> {
    const currentPreferences = this.userPreferences.get(userId) || await this.loadUserPreferences(userId);
    
    if (currentPreferences) {
      const updatedPreferences = { ...currentPreferences, ...updates };
      await this.saveUserPreferences(updatedPreferences);
    }
  }

  // Get sidebar items for a specific user and role
  async getSidebarItemsForUser(userId: string, role: UserRole): Promise<SidebarItemConfig[]> {
    try {
      // Try to load user preferences first
      const userPrefs = await this.loadUserPreferences(userId);
      
      if (userPrefs && userPrefs.sidebarConfigId !== 'default') {
        // Load custom config
        const config = await this.loadSidebarConfig(userPrefs.sidebarConfigId);
        if (config) {
          return this.filterItemsByRole(config.items, role);
        }
      }

      // Fallback to default items
      return this.filterItemsByRole(this.getDefaultSidebarItems(role), role);
    } catch (error) {
      console.error('Failed to get sidebar items for user:', error);
      loggingService.error('GanttSidebarService.getSidebarItemsForUser', error as Error);
      return this.filterItemsByRole(this.getDefaultSidebarItems(role), role);
    }
  }

  // Filter items based on user role
  private filterItemsByRole(items: SidebarItemConfig[], role: UserRole): SidebarItemConfig[] {
    return items.filter(item => {
      // Check if user has access to this item
      if (!item['roles'].includes(role)) return false;

      // Filter children recursively
      if (item['children']) {
        item['children'] = this.filterItemsByRole(item['children'] as SidebarItemConfig[], role);
      }

      return true;
    });
  }

  // Create custom sidebar configuration
  async createSidebarConfig(config: Omit<SidebarConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('gantt_sidebar_configs')
        .insert({
          name: config.name,
          items: config.items,
          is_active: config.isActive,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;

      return data?.id || null;
    } catch (error) {
      console.error('Failed to create sidebar config:', error);
      loggingService.error('GanttSidebarService.createSidebarConfig', error as Error);
      return null;
    }
  }

  // Update sidebar configuration
  async updateSidebarConfig(configId: string, updates: Partial<SidebarConfig>): Promise<void> {
    try {
      const { error } = await supabase
        .from('gantt_sidebar_configs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', configId);

      if (error) throw error;

      // Clear cache for this config
      this.cachedConfigs.delete(configId);
      
      loggingService.info('GanttSidebarService.updateSidebarConfig', 'Config updated successfully');
    } catch (error) {
      console.error('Failed to update sidebar config:', error);
      loggingService.error('GanttSidebarService.updateSidebarConfig', error as Error);
    }
  }

  // Get all available sidebar configurations
  async getAllSidebarConfigs(): Promise<SidebarConfig[]> {
    try {
      const { data, error } = await supabase
        .from('gantt_sidebar_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(config => ({
        id: config.id,
        name: config.name,
        items: config.items || [],
        isActive: config.is_active,
        createdAt: new Date(config.created_at),
        updatedAt: new Date(config.updated_at)
      }));
    } catch (error) {
      console.error('Failed to get all sidebar configs:', error);
      loggingService.error('GanttSidebarService.getAllSidebarConfigs', error as Error);
      return [];
    }
  }

  // Delete sidebar configuration
  async deleteSidebarConfig(configId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('gantt_sidebar_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      // Clear cache
      this.cachedConfigs.delete(configId);
      
      loggingService.info('GanttSidebarService.deleteSidebarConfig', 'Config deleted successfully');
    } catch (error) {
      console.error('Failed to delete sidebar config:', error);
      loggingService.error('GanttSidebarService.deleteSidebarConfig', error as Error);
    }
  }

  // Clear cache
  clearCache(): void {
    this.cachedConfigs.clear();
    this.userPreferences.clear();
  }

  // Get cached config
  getCachedConfig(configId: string): SidebarConfig | undefined {
    return this.cachedConfigs.get(configId);
  }

  // Get cached user preferences
  getCachedUserPreferences(userId: string): UserSidebarPreferences | undefined {
    return this.userPreferences.get(userId);
  }
}

// Create singleton instance
export const ganttSidebarService = new GanttSidebarService(); 