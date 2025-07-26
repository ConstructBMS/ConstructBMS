import { supabase } from './supabase';
import { demoModeService } from './demoModeService';

// Progress tracking interfaces
export interface TaskProgress {
  actualFinishDate: string | null;
  // 0-100
  actualStartDate: string | null;
  demo: boolean;
  id: string;
  percentComplete: number;
  progressUpdatedAt: Date | null;
  progressUpdatedBy: string | null;
}

export interface ProgressUpdate {
  actualFinishDate?: string | null;
  actualStartDate?: string | null;
  demoMode?: boolean;
  percentComplete: number;
  taskId: string;
}

export interface ProgressAggregation {
  calculatedProgress: number;
  childCount: number;
  hasChildren: boolean;
  taskId: string;
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxProgress: 75,
  maxEditableTasks: 10,
  autoProgressDisabled: true,
  barColor: 'bg-blue-300', // Light blue for demo mode
  tooltipSuffix: ' (DEMO MODE)',
  watermarkPattern: 'bg-gradient-to-r from-blue-200 to-blue-300',
};

class ProgressTrackingService {
  private isDemoMode: boolean = false;

  constructor() {
    // Check if we're in demo mode
    this.isDemoMode = this.checkDemoMode();
  }

  /**
   * Check if we're in demo mode
   */
  private checkDemoMode(): boolean {
    // This should be integrated with your demo mode service
    return demoModeService.getDemoMode();
  }

  /**
   * Get demo mode configuration
   */
  getDemoModeConfig() {
    return DEMO_MODE_CONFIG;
  }

  /**
   * Check if we're in demo mode
   */
  isInDemoMode(): boolean {
    return this.isDemoMode;
  }

  /**
   * Get task progress from Supabase
   */
  async getTaskProgress(taskId: string): Promise<TaskProgress | null> {
    try {
      const { data, error } = await supabase
        .from('asta_tasks')
        .select(
          'id, percent_complete, actual_start_date, actual_finish_date, progress_updated_by, progress_updated_at, demo'
        )
        .eq('id', taskId)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        percentComplete: data.percent_complete || 0,
        actualStartDate: data.actual_start_date,
        actualFinishDate: data.actual_finish_date,
        progressUpdatedBy: data.progress_updated_by,
        progressUpdatedAt: data.progress_updated_at
          ? new Date(data.progress_updated_at)
          : null,
        demo: data.demo || false,
      };
    } catch (error) {
      console.error('Error fetching task progress:', error);
      return null;
    }
  }

  /**
   * Update task progress in Supabase
   */
  async updateTaskProgress(update: ProgressUpdate): Promise<boolean> {
    try {
      // Apply demo mode limits
      let finalProgress = update.percentComplete;
      let finalActualStartDate = update.actualStartDate;
      let finalActualFinishDate = update.actualFinishDate;

      if (this.isDemoMode) {
        finalProgress = Math.min(finalProgress, DEMO_MODE_CONFIG.maxProgress);
        // Disable actual dates in demo mode
        finalActualStartDate = null;
        finalActualFinishDate = null;
      }

      // If progress is 100%, automatically set actual finish date if not already set
      if (finalProgress === 100 && !finalActualFinishDate) {
        finalActualFinishDate = new Date().toISOString().split('T')[0];
      }

      // If progress > 0 and no actual start date, set it
      if (finalProgress > 0 && !finalActualStartDate) {
        finalActualStartDate = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('asta_tasks')
        .update({
          percent_complete: finalProgress,
          actual_start_date: finalActualStartDate,
          actual_finish_date: finalActualFinishDate,
          progress_updated_by: (await supabase.auth.getUser()).data.user?.id,
          progress_updated_at: new Date().toISOString(),
          demo: this.isDemoMode,
        })
        .eq('id', update.taskId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating task progress:', error);
      return false;
    }
  }

  /**
   * Get demo mode task count limit
   */
  async getDemoTaskCount(): Promise<number> {
    if (!this.isDemoMode) return 0;

    try {
      const { count, error } = await supabase
        .from('asta_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('demo', true);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting demo task count:', error);
      return 0;
    }
  }

  /**
   * Check if demo mode allows editing more tasks
   */
  async canEditInDemoMode(): Promise<boolean> {
    if (!this.isDemoMode) return true;

    const currentCount = await this.getDemoTaskCount();
    return currentCount < DEMO_MODE_CONFIG.maxEditableTasks;
  }

  /**
   * Calculate aggregated progress for parent tasks
   */
  async calculateAggregatedProgress(
    taskId: string
  ): Promise<ProgressAggregation> {
    try {
      // Get all child tasks
      const { data: children, error } = await supabase
        .from('asta_tasks')
        .select('id, percent_complete')
        .eq('parent_task_id', taskId);

      if (error) throw error;

      const childCount = children?.length || 0;
      let calculatedProgress = 0;

      if (childCount > 0) {
        const totalProgress =
          children?.reduce(
            (sum, child) => sum + (child.percent_complete || 0),
            0
          ) || 0;
        calculatedProgress = Math.round(totalProgress / childCount);
      }

      return {
        taskId,
        calculatedProgress,
        childCount,
        hasChildren: childCount > 0,
      };
    } catch (error) {
      console.error('Error calculating aggregated progress:', error);
      return {
        taskId,
        calculatedProgress: 0,
        childCount: 0,
        hasChildren: false,
      };
    }
  }

  /**
   * Get progress bar styling based on mode and progress
   */
  getProgressBarStyle(
    progress: number,
    isDemo: boolean = false
  ): {
    color: string;
    tooltip: string;
    watermarkClass?: string;
    width: string;
  } {
    const maxProgress = isDemo ? DEMO_MODE_CONFIG.maxProgress : 100;
    const width = `${Math.min(progress, maxProgress)}%`;

    let color = 'bg-blue-500';
    let tooltip = `Progress: ${progress}%`;
    let watermarkClass: string | undefined;

    if (isDemo) {
      color = DEMO_MODE_CONFIG.barColor;
      tooltip += DEMO_MODE_CONFIG.tooltipSuffix;
      watermarkClass = DEMO_MODE_CONFIG.watermarkPattern;
    } else if (progress >= 100) {
      color = 'bg-green-500';
    } else if (progress >= 75) {
      color = 'bg-blue-500';
    } else if (progress >= 50) {
      color = 'bg-yellow-500';
    } else if (progress >= 25) {
      color = 'bg-orange-500';
    } else {
      color = 'bg-red-500';
    }

    return { width, color, tooltip, watermarkClass };
  }

  /**
   * Validate progress value
   */
  validateProgress(progress: number): boolean {
    return progress >= 0 && progress <= 100;
  }

  /**
   * Apply demo mode limits to progress value
   */
  applyDemoLimits(progress: number): number {
    if (this.isDemoMode) {
      return Math.min(progress, DEMO_MODE_CONFIG.maxProgress);
    }
    return progress;
  }

  /**
   * Get actual date marker styling
   */
  getActualDateMarkerStyle(
    date: string | null,
    type: 'start' | 'finish'
  ): {
    color: string;
    icon: string;
    tooltip: string;
  } {
    if (!date) {
      return {
        icon: type === 'start' ? '⬅️' : '➡️',
        tooltip: `No actual ${type} date set`,
        color: 'text-gray-400',
      };
    }

    const formattedDate = new Date(date).toLocaleDateString();
    return {
      icon: type === 'start' ? '⬅️' : '➡️',
      tooltip: `Actual ${type}: ${formattedDate}`,
      color: 'text-blue-600',
    };
  }
}

// Export singleton instance
export const progressTrackingService = new ProgressTrackingService();
