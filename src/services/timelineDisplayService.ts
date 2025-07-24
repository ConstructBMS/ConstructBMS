import { persistentStorage } from './persistentStorage';

export type ZoomLevel = 'hour' | 'day' | 'week' | 'month';

export interface TimelineConfig {
  demo?: boolean;
  scrollPosition: { x: number; y: number };
  visibleRange: { end: Date, start: Date; };
  zoomLevel: ZoomLevel;
}

export interface TimelineDisplayResult {
  data?: any;
  errors: string[];
  success: boolean;
}

export interface Task {
  duration: number;
  finishDate: string;
  id: string;
  isVisible?: boolean;
  name: string;
  percentComplete: number;
  startDate: string;
}

export class TimelineDisplayService {
  private static readonly ZOOM_LEVELS: ZoomLevel[] = ['hour', 'day', 'week', 'month'];
  private static readonly ZOOM_LEVEL_NAMES = {
    hour: 'Hour',
    day: 'Day',
    week: 'Week',
    month: 'Month'
  };

  /**
   * Get timeline configuration
   */
  static async getTimelineConfig(projectId: string = 'demo'): Promise<TimelineConfig> {
    try {
      const config = await persistentStorage.getSetting(`timelineConfig_${projectId}`, 'timeline') as TimelineConfig;
      
      if (!config) {
        // Return default config if none exists
        const defaultConfig: TimelineConfig = {
          zoomLevel: 'week',
          scrollPosition: { x: 0, y: 0 },
          visibleRange: {
            start: new Date(),
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          },
          demo: projectId.includes('demo')
        };
        await this.saveTimelineConfig(defaultConfig, projectId);
        return defaultConfig;
      }

      return config;
    } catch (error) {
      console.error('Failed to get timeline config:', error);
      return {
        zoomLevel: 'week',
        scrollPosition: { x: 0, y: 0 },
        visibleRange: {
          start: new Date(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        demo: projectId.includes('demo')
      };
    }
  }

  /**
   * Save timeline configuration
   */
  static async saveTimelineConfig(config: TimelineConfig, projectId: string = 'demo'): Promise<TimelineDisplayResult> {
    try {
      const configWithDemo = {
        ...config,
        demo: projectId.includes('demo')
      };

      await persistentStorage.setSetting(`timelineConfig_${projectId}`, configWithDemo, 'timeline');
      
      if (projectId.includes('demo')) {
        console.log('Demo timeline config saved:', configWithDemo);
      }

      return { success: true, data: configWithDemo, errors: [] };
    } catch (error) {
      console.error('Failed to save timeline config:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Zoom in to next level
   */
  static async zoomIn(projectId: string = 'demo'): Promise<TimelineDisplayResult> {
    try {
      const currentConfig = await this.getTimelineConfig(projectId);
      const currentIndex = this.ZOOM_LEVELS.indexOf(currentConfig.zoomLevel);
      
      if (currentIndex < this.ZOOM_LEVELS.length - 1) {
        const newZoomLevel = this.ZOOM_LEVELS[currentIndex + 1];
        const updatedConfig = {
          ...currentConfig,
          zoomLevel: newZoomLevel
        };

        const result = await this.saveTimelineConfig(updatedConfig, projectId);
        
        if (result.success) {
          // Log activity
          await this.logTimelineActivity('zoom_in', {
            fromLevel: currentConfig.zoomLevel,
            toLevel: newZoomLevel
          }, projectId);
        }

        return result;
      }

      return { success: false, errors: ['Already at maximum zoom level'] };
    } catch (error) {
      console.error('Failed to zoom in:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Zoom out to previous level
   */
  static async zoomOut(projectId: string = 'demo'): Promise<TimelineDisplayResult> {
    try {
      const currentConfig = await this.getTimelineConfig(projectId);
      const currentIndex = this.ZOOM_LEVELS.indexOf(currentConfig.zoomLevel);
      
      if (currentIndex > 0) {
        const newZoomLevel = this.ZOOM_LEVELS[currentIndex - 1];
        const updatedConfig = {
          ...currentConfig,
          zoomLevel: newZoomLevel
        };

        const result = await this.saveTimelineConfig(updatedConfig, projectId);
        
        if (result.success) {
          // Log activity
          await this.logTimelineActivity('zoom_out', {
            fromLevel: currentConfig.zoomLevel,
            toLevel: newZoomLevel
          }, projectId);
        }

        return result;
      }

      return { success: false, errors: ['Already at minimum zoom level'] };
    } catch (error) {
      console.error('Failed to zoom out:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Set specific zoom level
   */
  static async setZoomLevel(zoomLevel: ZoomLevel, projectId: string = 'demo'): Promise<TimelineDisplayResult> {
    try {
      const currentConfig = await this.getTimelineConfig(projectId);
      const updatedConfig = {
        ...currentConfig,
        zoomLevel
      };

      const result = await this.saveTimelineConfig(updatedConfig, projectId);
      
      if (result.success) {
        // Log activity
        await this.logTimelineActivity('set_zoom_level', {
          zoomLevel
        }, projectId);
      }

      return result;
    } catch (error) {
      console.error('Failed to set zoom level:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Fit timeline to visible tasks
   */
  static async fitToView(tasks: Task[], projectId: string = 'demo'): Promise<TimelineDisplayResult> {
    try {
      const visibleTasks = tasks.filter(task => task.isVisible !== false);
      
      if (visibleTasks.length === 0) {
        return { success: false, errors: ['No visible tasks to fit to view'] };
      }

      // Calculate date range of visible tasks
      const startDates = visibleTasks.map(task => new Date(task.startDate));
      const finishDates = visibleTasks.map(task => new Date(task.finishDate));
      
      const minStartDate = new Date(Math.min(...startDates.map(d => d.getTime())));
      const maxFinishDate = new Date(Math.max(...finishDates.map(d => d.getTime())));
      
      // Add some padding (10% of total duration)
      const totalDuration = maxFinishDate.getTime() - minStartDate.getTime();
      const padding = totalDuration * 0.1;
      
      const paddedStartDate = new Date(minStartDate.getTime() - padding);
      const paddedFinishDate = new Date(maxFinishDate.getTime() + padding);

      // Determine appropriate zoom level based on date range
      const dateRange = paddedFinishDate.getTime() - paddedStartDate.getTime();
      const daysRange = dateRange / (1000 * 60 * 60 * 24);
      
      let zoomLevel: ZoomLevel = 'week';
      if (daysRange <= 7) {
        zoomLevel = 'day';
      } else if (daysRange <= 30) {
        zoomLevel = 'week';
      } else if (daysRange <= 90) {
        zoomLevel = 'month';
      } else {
        zoomLevel = 'month';
      }

      const currentConfig = await this.getTimelineConfig(projectId);
      const updatedConfig = {
        ...currentConfig,
        zoomLevel,
        visibleRange: {
          start: paddedStartDate,
          end: paddedFinishDate
        },
        scrollPosition: { x: 0, y: currentConfig.scrollPosition.y }
      };

      const result = await this.saveTimelineConfig(updatedConfig, projectId);
      
      if (result.success) {
        // Log activity
        await this.logTimelineActivity('fit_to_view', {
          taskCount: visibleTasks.length,
          dateRange: daysRange,
          zoomLevel
        }, projectId);
      }

      return result;
    } catch (error) {
      console.error('Failed to fit to view:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Scroll to today's date
   */
  static async scrollToToday(projectId: string = 'demo'): Promise<TimelineDisplayResult> {
    try {
      const currentConfig = await this.getTimelineConfig(projectId);
      const today = new Date();
      
      // Calculate scroll position to center today
      const timelineStart = currentConfig.visibleRange.start.getTime();
      const timelineEnd = currentConfig.visibleRange.end.getTime();
      const todayTime = today.getTime();
      
      // Calculate what percentage today is within the visible range
      const timelineDuration = timelineEnd - timelineStart;
      const todayOffset = todayTime - timelineStart;
      const scrollPercentage = todayOffset / timelineDuration;
      
      // Calculate scroll position (assuming timeline width is 1000px for calculation)
      const timelineWidth = 1000; // This would be dynamic in real implementation
      const scrollX = Math.max(0, Math.min(timelineWidth, scrollPercentage * timelineWidth));

      const updatedConfig = {
        ...currentConfig,
        scrollPosition: { x: scrollX, y: currentConfig.scrollPosition.y }
      };

      const result = await this.saveTimelineConfig(updatedConfig, projectId);
      
      if (result.success) {
        // Log activity
        await this.logTimelineActivity('scroll_to_today', {
          today: today.toISOString(),
          scrollPosition: scrollX
        }, projectId);
      }

      return result;
    } catch (error) {
      console.error('Failed to scroll to today:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update scroll position
   */
  static async updateScrollPosition(
    scrollPosition: { x: number; y: number }, 
    projectId: string = 'demo'
  ): Promise<TimelineDisplayResult> {
    try {
      const currentConfig = await this.getTimelineConfig(projectId);
      const updatedConfig = {
        ...currentConfig,
        scrollPosition
      };

      return await this.saveTimelineConfig(updatedConfig, projectId);
    } catch (error) {
      console.error('Failed to update scroll position:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update visible date range
   */
  static async updateVisibleRange(
    visibleRange: { end: Date, start: Date; }, 
    projectId: string = 'demo'
  ): Promise<TimelineDisplayResult> {
    try {
      const currentConfig = await this.getTimelineConfig(projectId);
      const updatedConfig = {
        ...currentConfig,
        visibleRange
      };

      return await this.saveTimelineConfig(updatedConfig, projectId);
    } catch (error) {
      console.error('Failed to update visible range:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get zoom level information
   */
  static getZoomLevelInfo(zoomLevel: ZoomLevel): {
    canZoomIn: boolean;
    canZoomOut: boolean;
    index: number;
    name: string;
    pixelWidth: number; // Approximate pixel width per unit
  } {
    const index = this.ZOOM_LEVELS.indexOf(zoomLevel);
    return {
      name: this.ZOOM_LEVEL_NAMES[zoomLevel],
      index,
      canZoomIn: index < this.ZOOM_LEVELS.length - 1,
      canZoomOut: index > 0,
      pixelWidth: this.getPixelWidthForZoomLevel(zoomLevel)
    };
  }

  /**
   * Get pixel width for zoom level
   */
  private static getPixelWidthForZoomLevel(zoomLevel: ZoomLevel): number {
    switch (zoomLevel) {
      case 'hour':
        return 60; // 60px per hour
      case 'day':
        return 120; // 120px per day
      case 'week':
        return 200; // 200px per week
      case 'month':
        return 300; // 300px per month
      default:
        return 200;
    }
  }

  /**
   * Calculate task bar width based on zoom level
   */
  static calculateTaskBarWidth(startDate: Date, finishDate: Date, zoomLevel: ZoomLevel): number {
    const duration = finishDate.getTime() - startDate.getTime();
    const pixelWidth = this.getPixelWidthForZoomLevel(zoomLevel);
    
    switch (zoomLevel) {
      case 'hour':
        return Math.max(20, (duration / (1000 * 60 * 60)) * pixelWidth);
      case 'day':
        return Math.max(20, (duration / (1000 * 60 * 60 * 24)) * pixelWidth);
      case 'week':
        return Math.max(20, (duration / (1000 * 60 * 60 * 24 * 7)) * pixelWidth);
      case 'month':
        return Math.max(20, (duration / (1000 * 60 * 60 * 24 * 30)) * pixelWidth);
      default:
        return Math.max(20, (duration / (1000 * 60 * 60 * 24)) * pixelWidth);
    }
  }

  /**
   * Clear demo timeline data
   */
  static async clearDemoTimelineData(projectId: string = 'demo'): Promise<TimelineDisplayResult> {
    try {
      // Remove demo timeline config
      await persistentStorage.removeSetting(`timelineConfig_${projectId}`, 'timeline');
      
      console.log('Demo timeline data cleared');
      
      return { success: true, errors: [] };
    } catch (error) {
      console.error('Failed to clear demo timeline data:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get timeline activity history
   */
  static async getTimelineHistory(projectId: string = 'demo'): Promise<{
    activities: any[];
  }> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      const activities = activityLog.filter((log: any) => log.type === 'timeline_activity');

      return { activities };
    } catch (error) {
      console.error('Failed to get timeline history:', error);
      return { activities: [] };
    }
  }

  /**
   * Log timeline activity
   */
  static async logTimelineActivity(
    action: string, 
    details: any, 
    projectId: string = 'demo'
  ): Promise<void> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      activityLog.push({
        id: `timeline_${Date.now()}`,
        type: 'timeline_activity',
        action,
        details,
        timestamp: new Date().toISOString(),
        demo: projectId.includes('demo')
      });

      await persistentStorage.setSetting(`activityLog_${projectId}`, activityLog, 'activity');
    } catch (error) {
      console.error('Failed to log timeline activity:', error);
    }
  }
} 