import { persistentStorage } from './persistentStorage';

export interface LayoutConfig {
  collapsedSections: string[];
  demo?: boolean;
  fullscreen: boolean;
  paneSizes: {
    taskList: number; // percentage
    timeline: number; // percentage
  };
  scrollPositions: {
    taskList: { x: number; y: number };
    timeline: { x: number; y: number };
  };
  splitView: boolean;
  zoomLevel: number;
}

export interface LayoutResult {
  data?: LayoutConfig;
  errors: string[];
  success: boolean;
}

export class LayoutService {
  private static readonly DEFAULT_LAYOUT: LayoutConfig = {
    splitView: true,
    fullscreen: false,
    paneSizes: {
      taskList: 40,
      timeline: 60
    },
    collapsedSections: [],
    scrollPositions: {
      taskList: { x: 0, y: 0 },
      timeline: { x: 0, y: 0 }
    },
    zoomLevel: 1
  };

  /**
   * Get current layout configuration
   */
  static async getLayoutConfig(projectId: string = 'demo'): Promise<LayoutResult> {
    try {
      const config = await persistentStorage.getSetting(`layout_${projectId}`, 'layout') as LayoutConfig;
      
      if (!config) {
        // Return default layout if none exists
        const defaultConfig = { ...this.DEFAULT_LAYOUT, demo: projectId.includes('demo') };
        await this.saveLayoutConfig(defaultConfig, projectId);
        return { success: true, data: defaultConfig, errors: [] };
      }

      return { success: true, data: config, errors: [] };
    } catch (error) {
      console.error('Failed to get layout config:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Save layout configuration
   */
  static async saveLayoutConfig(config: LayoutConfig, projectId: string = 'demo'): Promise<LayoutResult> {
    try {
      const configWithDemo = {
        ...config,
        demo: projectId.includes('demo')
      };

      await persistentStorage.setSetting(`layout_${projectId}`, configWithDemo, 'layout');
      
      if (projectId.includes('demo')) {
        console.log('Demo layout config saved:', configWithDemo);
      }

      return { success: true, data: configWithDemo, errors: [] };
    } catch (error) {
      console.error('Failed to save layout config:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Toggle split view
   */
  static async toggleSplitView(projectId: string = 'demo'): Promise<LayoutResult> {
    try {
      const currentConfig = await this.getLayoutConfig(projectId);
      
      if (!currentConfig.success || !currentConfig.data) {
        return currentConfig;
      }

      const updatedConfig = {
        ...currentConfig.data,
        splitView: !currentConfig.data.splitView
      };

      return await this.saveLayoutConfig(updatedConfig, projectId);
    } catch (error) {
      console.error('Failed to toggle split view:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Toggle fullscreen mode
   */
  static async toggleFullscreen(projectId: string = 'demo'): Promise<LayoutResult> {
    try {
      const currentConfig = await this.getLayoutConfig(projectId);
      
      if (!currentConfig.success || !currentConfig.data) {
        return currentConfig;
      }

      const updatedConfig = {
        ...currentConfig.data,
        fullscreen: !currentConfig.data.fullscreen
      };

      return await this.saveLayoutConfig(updatedConfig, projectId);
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Reset layout to defaults
   */
  static async resetLayout(projectId: string = 'demo'): Promise<LayoutResult> {
    try {
      const defaultConfig = { 
        ...this.DEFAULT_LAYOUT, 
        demo: projectId.includes('demo') 
      };

      return await this.saveLayoutConfig(defaultConfig, projectId);
    } catch (error) {
      console.error('Failed to reset layout:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update pane sizes
   */
  static async updatePaneSizes(
    taskListSize: number, 
    timelineSize: number, 
    projectId: string = 'demo'
  ): Promise<LayoutResult> {
    try {
      const currentConfig = await this.getLayoutConfig(projectId);
      
      if (!currentConfig.success || !currentConfig.data) {
        return currentConfig;
      }

      const updatedConfig = {
        ...currentConfig.data,
        paneSizes: {
          taskList: taskListSize,
          timeline: timelineSize
        }
      };

      return await this.saveLayoutConfig(updatedConfig, projectId);
    } catch (error) {
      console.error('Failed to update pane sizes:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update scroll positions
   */
  static async updateScrollPositions(
    taskListScroll: { x: number; y: number },
    timelineScroll: { x: number; y: number },
    projectId: string = 'demo'
  ): Promise<LayoutResult> {
    try {
      const currentConfig = await this.getLayoutConfig(projectId);
      
      if (!currentConfig.success || !currentConfig.data) {
        return currentConfig;
      }

      const updatedConfig = {
        ...currentConfig.data,
        scrollPositions: {
          taskList: taskListScroll,
          timeline: timelineScroll
        }
      };

      return await this.saveLayoutConfig(updatedConfig, projectId);
    } catch (error) {
      console.error('Failed to update scroll positions:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update zoom level
   */
  static async updateZoomLevel(zoomLevel: number, projectId: string = 'demo'): Promise<LayoutResult> {
    try {
      const currentConfig = await this.getLayoutConfig(projectId);
      
      if (!currentConfig.success || !currentConfig.data) {
        return currentConfig;
      }

      const updatedConfig = {
        ...currentConfig.data,
        zoomLevel: Math.max(0.1, Math.min(3, zoomLevel)) // Clamp between 0.1 and 3
      };

      return await this.saveLayoutConfig(updatedConfig, projectId);
    } catch (error) {
      console.error('Failed to update zoom level:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Toggle collapsed section
   */
  static async toggleCollapsedSection(sectionId: string, projectId: string = 'demo'): Promise<LayoutResult> {
    try {
      const currentConfig = await this.getLayoutConfig(projectId);
      
      if (!currentConfig.success || !currentConfig.data) {
        return currentConfig;
      }

      const currentCollapsed = currentConfig.data.collapsedSections || [];
      const isCollapsed = currentCollapsed.includes(sectionId);
      
      const updatedCollapsed = isCollapsed
        ? currentCollapsed.filter(id => id !== sectionId)
        : [...currentCollapsed, sectionId];

      const updatedConfig = {
        ...currentConfig.data,
        collapsedSections: updatedCollapsed
      };

      return await this.saveLayoutConfig(updatedConfig, projectId);
    } catch (error) {
      console.error('Failed to toggle collapsed section:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Clear demo layout data
   */
  static async clearDemoLayoutData(projectId: string = 'demo'): Promise<LayoutResult> {
    try {
      // Remove demo layout config
      await persistentStorage.removeSetting(`layout_${projectId}`, 'layout');
      
      console.log('Demo layout data cleared');
      
      return { success: true, errors: [] };
    } catch (error) {
      console.error('Failed to clear demo layout data:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get layout history
   */
  static async getLayoutHistory(projectId: string = 'demo'): Promise<{
    changes: any[];
    lastReset?: string;
  }> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      const layoutChanges = activityLog.filter((log: any) => log.type === 'layout_change');
      const lastReset = activityLog
        .filter((log: any) => log.type === 'layout_reset')
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      return { 
        changes: layoutChanges,
        lastReset: lastReset?.timestamp
      };
    } catch (error) {
      console.error('Failed to get layout history:', error);
      return { changes: [] };
    }
  }

  /**
   * Log layout activity
   */
  static async logLayoutActivity(
    action: string, 
    details: any, 
    projectId: string = 'demo'
  ): Promise<void> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      activityLog.push({
        id: `layout_${Date.now()}`,
        type: 'layout_change',
        action,
        details,
        timestamp: new Date().toISOString(),
        demo: projectId.includes('demo')
      });

      await persistentStorage.setSetting(`activityLog_${projectId}`, activityLog, 'activity');
    } catch (error) {
      console.error('Failed to log layout activity:', error);
    }
  }
} 