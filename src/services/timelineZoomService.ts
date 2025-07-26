import { supabase } from './supabase';
import { demoModeService } from './demoModeService';
import { permissionsService } from './permissionsService';

export interface TimelineZoomSettings {
  demo: boolean;
  id: string;
  projectId: string;
  scrollPosition: { x: number; y: number };
  updatedAt: Date;
  userId: string;
  visibleRange: { end: Date; start: Date };
  zoomLevel: 'hour' | 'day' | 'week' | 'month';
}

export interface ZoomNavigationResult {
  error?: string;
  settings?: TimelineZoomSettings;
  success: boolean;
}

export interface ScrollToDateResult {
  error?: string;
  scrollPosition?: { x: number; y: number };
  success: boolean;
}

export interface FitToViewResult {
  error?: string;
  settings?: TimelineZoomSettings;
  success: boolean;
}

class TimelineZoomService {
  private readonly tableName = 'timeline_zoom_settings';

  /**
   * Get zoom settings for a project
   */
  async getProjectZoomSettings(
    projectId: string
  ): Promise<TimelineZoomSettings> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check permissions
      const canView = permissionsService.hasPermission('view_tasks', projectId);
      if (!canView.hasPermission) {
        throw new Error(
          'Insufficient permissions to view timeline zoom settings'
        );
      }

      // Query existing settings
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        // Apply demo mode restrictions
        if (isDemoMode) {
          data.zoom_level = this.restrictZoomLevelForDemo(data.zoom_level);
        }

        return this.mapDatabaseToSettings(data);
      }

      // Create default settings
      const defaultSettings: TimelineZoomSettings = {
        id: '',
        userId: user.id,
        projectId,
        zoomLevel: isDemoMode ? 'day' : 'week',
        scrollPosition: { x: 0, y: 0 },
        visibleRange: {
          start: new Date(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
        updatedAt: new Date(),
        demo: isDemoMode,
      };

      // Save default settings
      const savedSettings = await this.saveZoomSettings(defaultSettings);
      return savedSettings;
    } catch (error) {
      console.error('Error getting project zoom settings:', error);
      throw error;
    }
  }

  /**
   * Save zoom settings to Supabase
   */
  async saveZoomSettings(
    settings: TimelineZoomSettings
  ): Promise<TimelineZoomSettings> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      // Check permissions
      const canPersist = permissionsService.hasPermission(
        'view_tasks',
        settings.projectId
      );
      if (!canPersist.hasPermission) {
        throw new Error('Insufficient permissions to save zoom settings');
      }

      // Apply demo mode restrictions
      if (isDemoMode) {
        settings.zoomLevel = this.restrictZoomLevelForDemo(settings.zoomLevel);
        settings.demo = true;
      }

      const dbData = {
        user_id: settings.userId,
        project_id: settings.projectId,
        zoom_level: settings.zoomLevel,
        scroll_position_x: settings.scrollPosition.x,
        scroll_position_y: settings.scrollPosition.y,
        visible_range_start: settings.visibleRange.start.toISOString(),
        visible_range_end: settings.visibleRange.end.toISOString(),
        updated_at: new Date().toISOString(),
        demo: settings.demo,
      };

      let result;
      if (settings.id) {
        // Update existing
        const { data, error } = await supabase
          .from(this.tableName)
          .update(dbData)
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from(this.tableName)
          .insert(dbData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return this.mapDatabaseToSettings(result);
    } catch (error) {
      console.error('Error saving zoom settings:', error);
      throw error;
    }
  }

  /**
   * Zoom in to next level
   */
  async zoomIn(projectId: string): Promise<ZoomNavigationResult> {
    try {
      const settings = await this.getProjectZoomSettings(projectId);
      const zoomLevels: Array<'hour' | 'day' | 'week' | 'month'> = [
        'hour',
        'day',
        'week',
        'month',
      ];
      const currentIndex = zoomLevels.indexOf(settings.zoomLevel);

      if (currentIndex < zoomLevels.length - 1) {
        const newZoomLevel = zoomLevels[currentIndex + 1];
        const updatedSettings = {
          ...settings,
          zoomLevel: newZoomLevel,
          updatedAt: new Date(),
        };

        const savedSettings = await this.saveZoomSettings(updatedSettings);
        return { success: true, settings: savedSettings };
      }

      return { success: false, error: 'Already at maximum zoom level' };
    } catch (error) {
      console.error('Error zooming in:', error);
      return { success: false, error: 'Failed to zoom in' };
    }
  }

  /**
   * Zoom out to previous level
   */
  async zoomOut(projectId: string): Promise<ZoomNavigationResult> {
    try {
      const settings = await this.getProjectZoomSettings(projectId);
      const zoomLevels: Array<'hour' | 'day' | 'week' | 'month'> = [
        'hour',
        'day',
        'week',
        'month',
      ];
      const currentIndex = zoomLevels.indexOf(settings.zoomLevel);

      if (currentIndex > 0) {
        const newZoomLevel = zoomLevels[currentIndex - 1];
        const updatedSettings = {
          ...settings,
          zoomLevel: newZoomLevel,
          updatedAt: new Date(),
        };

        const savedSettings = await this.saveZoomSettings(updatedSettings);
        return { success: true, settings: savedSettings };
      }

      return { success: false, error: 'Already at minimum zoom level' };
    } catch (error) {
      console.error('Error zooming out:', error);
      return { success: false, error: 'Failed to zoom out' };
    }
  }

  /**
   * Reset zoom to default level
   */
  async resetZoom(projectId: string): Promise<ZoomNavigationResult> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      const settings = await this.getProjectZoomSettings(projectId);

      const defaultZoomLevel = isDemoMode ? 'day' : 'week';
      const updatedSettings = {
        ...settings,
        zoomLevel: defaultZoomLevel,
        scrollPosition: { x: 0, y: 0 },
        updatedAt: new Date(),
      };

      const savedSettings = await this.saveZoomSettings(updatedSettings);
      return { success: true, settings: savedSettings };
    } catch (error) {
      console.error('Error resetting zoom:', error);
      return { success: false, error: 'Failed to reset zoom' };
    }
  }

  /**
   * Change time scale
   */
  async changeTimeScale(
    projectId: string,
    scale: 'hour' | 'day' | 'week' | 'month'
  ): Promise<ZoomNavigationResult> {
    try {
      const settings = await this.getProjectZoomSettings(projectId);
      const updatedSettings = {
        ...settings,
        zoomLevel: scale,
        updatedAt: new Date(),
      };

      const savedSettings = await this.saveZoomSettings(updatedSettings);
      return { success: true, settings: savedSettings };
    } catch (error) {
      console.error('Error changing time scale:', error);
      return { success: false, error: 'Failed to change time scale' };
    }
  }

  /**
   * Scroll to today's date
   */
  async scrollToToday(projectId: string): Promise<ScrollToDateResult> {
    try {
      const settings = await this.getProjectZoomSettings(projectId);
      const today = new Date();

      // Calculate scroll position to center today
      const timelineStart = settings.visibleRange.start.getTime();
      const timelineEnd = settings.visibleRange.end.getTime();
      const todayTime = today.getTime();

      // Calculate what percentage today is within the visible range
      const timelineDuration = timelineEnd - timelineStart;
      const todayOffset = todayTime - timelineStart;
      const scrollPercentage = todayOffset / timelineDuration;

      // Calculate scroll position (assuming timeline width is 1000px for calculation)
      const timelineWidth = 1000; // This would be dynamic in real implementation
      const scrollX = Math.max(
        0,
        Math.min(timelineWidth, scrollPercentage * timelineWidth)
      );

      // Update settings with new scroll position
      const updatedSettings = {
        ...settings,
        scrollPosition: { x: scrollX, y: settings.scrollPosition.y },
        updatedAt: new Date(),
      };

      await this.saveZoomSettings(updatedSettings);

      return {
        success: true,
        scrollPosition: { x: scrollX, y: settings.scrollPosition.y },
      };
    } catch (error) {
      console.error('Error scrolling to today:', error);
      return { success: false, error: 'Failed to scroll to today' };
    }
  }

  /**
   * Scroll to specific date
   */
  async scrollToDate(
    projectId: string,
    targetDate: Date
  ): Promise<ScrollToDateResult> {
    try {
      const settings = await this.getProjectZoomSettings(projectId);

      // Calculate scroll position to center target date
      const timelineStart = settings.visibleRange.start.getTime();
      const timelineEnd = settings.visibleRange.end.getTime();
      const targetTime = targetDate.getTime();

      // Calculate what percentage target date is within the visible range
      const timelineDuration = timelineEnd - timelineStart;
      const targetOffset = targetTime - timelineStart;
      const scrollPercentage = targetOffset / timelineDuration;

      // Calculate scroll position
      const timelineWidth = 1000; // This would be dynamic in real implementation
      const scrollX = Math.max(
        0,
        Math.min(timelineWidth, scrollPercentage * timelineWidth)
      );

      // Update settings with new scroll position
      const updatedSettings = {
        ...settings,
        scrollPosition: { x: scrollX, y: settings.scrollPosition.y },
        updatedAt: new Date(),
      };

      await this.saveZoomSettings(updatedSettings);

      return {
        success: true,
        scrollPosition: { x: scrollX, y: settings.scrollPosition.y },
      };
    } catch (error) {
      console.error('Error scrolling to date:', error);
      return { success: false, error: 'Failed to scroll to date' };
    }
  }

  /**
   * Fit timeline to view all tasks
   */
  async fitToView(
    projectId: string,
    tasks: Array<{ endDate: Date; startDate: Date }>
  ): Promise<FitToViewResult> {
    try {
      if (tasks.length === 0) {
        return { success: false, error: 'No tasks to fit to view' };
      }

      // Calculate date range of tasks
      const startDates = tasks.map(task => task.startDate.getTime());
      const endDates = tasks.map(task => task.endDate.getTime());

      const minStartDate = new Date(Math.min(...startDates));
      const maxEndDate = new Date(Math.max(...endDates));

      // Add some padding (10% of total duration)
      const totalDuration = maxEndDate.getTime() - minStartDate.getTime();
      const padding = totalDuration * 0.1;

      const paddedStartDate = new Date(minStartDate.getTime() - padding);
      const paddedEndDate = new Date(maxEndDate.getTime() + padding);

      // Determine appropriate zoom level based on date range
      const dateRange = paddedEndDate.getTime() - paddedStartDate.getTime();
      const daysRange = dateRange / (1000 * 60 * 60 * 24);

      let zoomLevel: 'hour' | 'day' | 'week' | 'month' = 'week';
      if (daysRange <= 1) {
        zoomLevel = 'hour';
      } else if (daysRange <= 7) {
        zoomLevel = 'day';
      } else if (daysRange <= 30) {
        zoomLevel = 'week';
      } else {
        zoomLevel = 'month';
      }

      const settings = await this.getProjectZoomSettings(projectId);
      const updatedSettings = {
        ...settings,
        zoomLevel,
        visibleRange: {
          start: paddedStartDate,
          end: paddedEndDate,
        },
        scrollPosition: { x: 0, y: settings.scrollPosition.y },
        updatedAt: new Date(),
      };

      const savedSettings = await this.saveZoomSettings(updatedSettings);
      return { success: true, settings: savedSettings };
    } catch (error) {
      console.error('Error fitting to view:', error);
      return { success: false, error: 'Failed to fit to view' };
    }
  }

  /**
   * Get available zoom scales based on demo mode
   */
  getAvailableScales(
    isDemoMode: boolean
  ): Array<{
    description: string;
    label: string;
    value: 'hour' | 'day' | 'week' | 'month';
  }> {
    const allScales = [
      {
        value: 'hour' as const,
        label: 'Hour',
        description: 'Show timeline by hours',
      },
      {
        value: 'day' as const,
        label: 'Day',
        description: 'Show timeline by days',
      },
      {
        value: 'week' as const,
        label: 'Week',
        description: 'Show timeline by weeks',
      },
      {
        value: 'month' as const,
        label: 'Month',
        description: 'Show timeline by months',
      },
    ];

    if (isDemoMode) {
      return allScales.filter(
        scale => scale.value === 'day' || scale.value === 'week'
      );
    }

    return allScales;
  }

  /**
   * Get zoom level display name
   */
  getZoomLevelDisplayName(
    zoomLevel: 'hour' | 'day' | 'week' | 'month'
  ): string {
    const names = {
      hour: 'Hour View',
      day: 'Day View',
      week: 'Week View',
      month: 'Month View',
    };
    return names[zoomLevel];
  }

  /**
   * Get scale display name
   */
  getScaleDisplayName(scale: 'hour' | 'day' | 'week' | 'month'): string {
    return this.getZoomLevelDisplayName(scale);
  }

  /**
   * Restrict zoom level for demo mode
   */
  private restrictZoomLevelForDemo(
    zoomLevel: 'hour' | 'day' | 'week' | 'month'
  ): 'day' | 'week' {
    if (zoomLevel === 'hour' || zoomLevel === 'month') {
      return 'day';
    }
    return zoomLevel;
  }

  /**
   * Map database record to settings object
   */
  private mapDatabaseToSettings(dbRecord: any): TimelineZoomSettings {
    return {
      id: dbRecord.id,
      userId: dbRecord.user_id,
      projectId: dbRecord.project_id,
      zoomLevel: dbRecord.zoom_level,
      scrollPosition: {
        x: dbRecord.scroll_position_x || 0,
        y: dbRecord.scroll_position_y || 0,
      },
      visibleRange: {
        start: new Date(dbRecord.visible_range_start),
        end: new Date(dbRecord.visible_range_end),
      },
      updatedAt: new Date(dbRecord.updated_at),
      demo: dbRecord.demo || false,
    };
  }
}

export const timelineZoomService = new TimelineZoomService();
