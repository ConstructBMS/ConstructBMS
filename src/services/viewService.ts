import { persistentStorage } from './persistentStorage';

export interface ViewConfig {
  filters: FilterRule[];
  floatOptions?: {
    free: boolean;
    highlightNegative: boolean;
    total: boolean;
  };
  timelineRange: { end: Date, start: Date; };
  visibleFields: string[];
  zoomLevel: 'hour' | 'day' | 'week' | 'month';
}

export interface FilterRule {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
}

export interface View {
  config: ViewConfig;
  createdAt?: string;
  createdBy: string;
  demo?: boolean;
  id: string;
  isDefault?: boolean;
  name: string;
  shared: boolean;
  type: 'system' | 'custom';
}

export interface ViewResult {
  data?: any;
  errors: string[];
  success: boolean;
}

export class ViewService {
  /**
   * Get all views for a project
   */
  static async getViews(projectId: string = 'demo'): Promise<View[]> {
    try {
      const views = await persistentStorage.getSetting(`views_${projectId}`, 'views') as View[];
      return views || [];
    } catch (error) {
      console.error('Failed to get views:', error);
      return [];
    }
  }

  /**
   * Get active view
   */
  static async getActiveView(projectId: string = 'demo'): Promise<View | null> {
    try {
      const activeViewId = await persistentStorage.getSetting(`activeViewId_${projectId}`, 'views') as string;
      if (!activeViewId) return null;

      const views = await this.getViews(projectId);
      return views.find(v => v.id === activeViewId) || null;
    } catch (error) {
      console.error('Failed to get active view:', error);
      return null;
    }
  }

  /**
   * Save a new view
   */
  static async saveView(
    name: string,
    config: ViewConfig,
    isShared: boolean,
    projectId: string = 'demo',
    userId: string = 'demo-user'
  ): Promise<ViewResult> {
    try {
      const views = await this.getViews(projectId);
      
      // Check if name already exists
      if (views.some(v => v.name === name)) {
        return {
          success: false,
          errors: ['A view with this name already exists']
        };
      }

      const newView: View = {
        id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        type: 'custom',
        config,
        createdBy: userId,
        shared: isShared,
        demo: projectId.includes('demo'),
        createdAt: new Date().toISOString()
      };

      views.push(newView);
      await persistentStorage.setSetting(`views_${projectId}`, views, 'views');

      // Log activity
      await this.logViewActivity('save_view', {
        viewName: name,
        isShared,
        viewId: newView.id
      }, projectId);

      return { success: true, data: newView, errors: [] };
    } catch (error) {
      console.error('Failed to save view:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update an existing view
   */
  static async updateView(view: View, projectId: string = 'demo'): Promise<ViewResult> {
    try {
      const views = await this.getViews(projectId);
      const viewIndex = views.findIndex(v => v.id === view.id);
      
      if (viewIndex === -1) {
        return {
          success: false,
          errors: ['View not found']
        };
      }

      // Check if name already exists (excluding current view)
      if (views.some(v => v.name === view.name && v.id !== view.id)) {
        return {
          success: false,
          errors: ['A view with this name already exists']
        };
      }

      views[viewIndex] = view;
      await persistentStorage.setSetting(`views_${projectId}`, views, 'views');

      // Log activity
      await this.logViewActivity('update_view', {
        viewName: view.name,
        viewId: view.id
      }, projectId);

      return { success: true, data: view, errors: [] };
    } catch (error) {
      console.error('Failed to update view:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Delete a view
   */
  static async deleteView(viewId: string, projectId: string = 'demo'): Promise<ViewResult> {
    try {
      const views = await this.getViews(projectId);
      const viewIndex = views.findIndex(v => v.id === viewId);
      
      if (viewIndex === -1) {
        return {
          success: false,
          errors: ['View not found']
        };
      }

      const deletedView = views[viewIndex];
      views.splice(viewIndex, 1);
      await persistentStorage.setSetting(`views_${projectId}`, views, 'views');

      // If this was the active view, clear active view
      const activeViewId = await persistentStorage.getSetting(`activeViewId_${projectId}`, 'views') as string;
      if (activeViewId === viewId) {
        await persistentStorage.removeSetting(`activeViewId_${projectId}`, 'views');
      }

      // Log activity
      await this.logViewActivity('delete_view', {
        viewName: deletedView.name,
        viewId: viewId
      }, projectId);

      return { success: true, errors: [] };
    } catch (error) {
      console.error('Failed to delete view:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Set active view
   */
  static async setActiveView(viewId: string, projectId: string = 'demo'): Promise<ViewResult> {
    try {
      const views = await this.getViews(projectId);
      const view = views.find(v => v.id === viewId);
      
      if (!view) {
        return {
          success: false,
          errors: ['View not found']
        };
      }

      await persistentStorage.setSetting(`activeViewId_${projectId}`, viewId, 'views');

      // Log activity
      await this.logViewActivity('apply_view', {
        viewName: view.name,
        viewId: viewId
      }, projectId);

      return { success: true, data: view, errors: [] };
    } catch (error) {
      console.error('Failed to set active view:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Set default view
   */
  static async setDefaultView(viewId: string, projectId: string = 'demo'): Promise<ViewResult> {
    try {
      const views = await this.getViews(projectId);
      
      // Remove default from all views
      views.forEach(v => v.isDefault = false);
      
      // Set new default
      const viewIndex = views.findIndex(v => v.id === viewId);
      if (viewIndex !== -1) {
        views[viewIndex].isDefault = true;
      }

      await persistentStorage.setSetting(`views_${projectId}`, views, 'views');
      await persistentStorage.setSetting(`defaultViewId_${projectId}`, viewId, 'views');

      // Log activity
      await this.logViewActivity('set_default_view', {
        viewId: viewId
      }, projectId);

      return { success: true, errors: [] };
    } catch (error) {
      console.error('Failed to set default view:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get default view
   */
  static async getDefaultView(projectId: string = 'demo'): Promise<View | null> {
    try {
      const defaultViewId = await persistentStorage.getSetting(`defaultViewId_${projectId}`, 'views') as string;
      if (!defaultViewId) return null;

      const views = await this.getViews(projectId);
      return views.find(v => v.id === defaultViewId) || null;
    } catch (error) {
      console.error('Failed to get default view:', error);
      return null;
    }
  }

  /**
   * Apply view configuration to current state
   */
  static async applyViewConfig(config: ViewConfig, projectId: string = 'demo'): Promise<ViewResult> {
    try {
      // Apply filters
      await persistentStorage.setSetting(`activeFilters_${projectId}`, config.filters, 'filters');

      // Apply visible fields
      await persistentStorage.setSetting(`visibleFields_${projectId}`, config.visibleFields, 'layout');

      // Apply zoom level
      const layoutConfig = await persistentStorage.getSetting(`layoutConfig_${projectId}`, 'layout') || {};
      layoutConfig.zoomLevel = config.zoomLevel;
      await persistentStorage.setSetting(`layoutConfig_${projectId}`, layoutConfig, 'layout');

      // Apply timeline range
      await persistentStorage.setSetting(`timelineRange_${projectId}`, config.timelineRange, 'layout');

      // Apply float options
      if (config.floatOptions) {
        await persistentStorage.setSetting(`floatConfig_${projectId}`, config.floatOptions, 'float');
      }

      return { success: true, errors: [] };
    } catch (error) {
      console.error('Failed to apply view config:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get current view configuration from state
   */
  static async getCurrentViewConfig(projectId: string = 'demo'): Promise<ViewConfig> {
    try {
      const filters = await persistentStorage.getSetting(`activeFilters_${projectId}`, 'filters') || [];
      const visibleFields = await persistentStorage.getSetting(`visibleFields_${projectId}`, 'layout') || [];
      const layoutConfig = await persistentStorage.getSetting(`layoutConfig_${projectId}`, 'layout') || {};
      const timelineRange = await persistentStorage.getSetting(`timelineRange_${projectId}`, 'layout') || { start: new Date(), end: new Date() };
      const floatOptions = await persistentStorage.getSetting(`floatConfig_${projectId}`, 'float') || { total: false, free: false, highlightNegative: false };

      return {
        filters,
        visibleFields,
        zoomLevel: layoutConfig.zoomLevel || 'week',
        timelineRange,
        floatOptions
      };
    } catch (error) {
      console.error('Failed to get current view config:', error);
      return {
        filters: [],
        visibleFields: ['name', 'startDate', 'finishDate', 'duration', 'percentComplete'],
        zoomLevel: 'week',
        timelineRange: { start: new Date(), end: new Date() },
        floatOptions: { total: false, free: false, highlightNegative: false }
      };
    }
  }

  /**
   * Clear demo view data
   */
  static async clearDemoViewData(projectId: string = 'demo'): Promise<ViewResult> {
    try {
      // Remove demo views
      const views = await this.getViews(projectId);
      const nonDemoViews = views.filter(v => !v.demo);
      await persistentStorage.setSetting(`views_${projectId}`, nonDemoViews, 'views');

      // Clear demo-related settings
      await persistentStorage.removeSetting(`activeViewId_${projectId}`, 'views');
      await persistentStorage.removeSetting(`defaultViewId_${projectId}`, 'views');

      console.log('Demo view data cleared');
      
      return { success: true, errors: [] };
    } catch (error) {
      console.error('Failed to clear demo view data:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get view activity history
   */
  static async getViewHistory(projectId: string = 'demo'): Promise<{
    activities: any[];
  }> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      const activities = activityLog.filter((log: any) => log.type === 'view_activity');

      return { activities };
    } catch (error) {
      console.error('Failed to get view history:', error);
      return { activities: [] };
    }
  }

  /**
   * Log view activity
   */
  static async logViewActivity(
    action: string, 
    details: any, 
    projectId: string = 'demo'
  ): Promise<void> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      activityLog.push({
        id: `view_${Date.now()}`,
        type: 'view_activity',
        action,
        details,
        timestamp: new Date().toISOString(),
        demo: projectId.includes('demo')
      });

      await persistentStorage.setSetting(`activityLog_${projectId}`, activityLog, 'activity');
    } catch (error) {
      console.error('Failed to log view activity:', error);
    }
  }

  /**
   * Validate view configuration
   */
  static validateViewConfig(config: ViewConfig): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];

    if (!config.name || config.name.trim().length === 0) {
      errors.push('View name is required');
    }

    if (config.name && config.name.length > 50) {
      errors.push('View name must be 50 characters or less');
    }

    if (!['hour', 'day', 'week', 'month'].includes(config.zoomLevel)) {
      errors.push('Invalid zoom level');
    }

    if (!config.timelineRange || !config.timelineRange.start || !config.timelineRange.end) {
      errors.push('Timeline range is required');
    }

    if (config.timelineRange && config.timelineRange.start >= config.timelineRange.end) {
      errors.push('Timeline start must be before end');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 