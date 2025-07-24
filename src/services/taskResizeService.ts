import { supabase } from './supabase';

// Task resize interfaces
export interface ResizeState {
  currentOffset: number;
  isResizing: boolean;
  originalEnd: Date | null;
  originalStart: Date | null;
  resizeEdge: 'start' | 'end' | null;
  startX: number;
  taskId: string | null;
}

export interface ResizeResult {
  constraintViolations?: string[] | undefined;
  daysChanged: number;
  demoMode?: boolean;
  message: string;
  newDuration: number;
  newEnd: Date;
  newStart: Date;
  success: boolean;
}

export interface ResizeConstraint {
  allowOverlap: boolean;
  enforceDependencies: boolean;
  maxDuration: number;
  minDuration: number;
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxResizeDays: 2,
  maxResizableTasks: 2,
  maxUndoActions: 1,
  toastPrefix: 'DEMO LIMIT: '
};

class TaskResizeService {
  private resizeState: ResizeState = {
    isResizing: false,
    taskId: null,
    originalStart: null,
    originalEnd: null,
    resizeEdge: null,
    currentOffset: 0,
    startX: 0
  };

  private isDemoMode = false;

  constructor() {
    this.isDemoMode = this.checkDemoMode();
  }

  private checkDemoMode(): boolean {
    // Check user role or environment to determine demo mode
    return false; // Set to true for demo mode testing
  }

  /**
   * Start resize operation
   */
  startResize(
    taskId: string, 
    startDate: Date, 
    endDate: Date, 
    resizeEdge: 'start' | 'end',
    startX: number
  ): boolean {
    // Check if task is a milestone (duration = 0)
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (duration === 0) {
      return false;
    }

    // Check demo mode limits
    if (this.isDemoMode) {
      const taskIndex = this.getTaskIndex(taskId);
      if (taskIndex >= DEMO_MODE_CONFIG.maxResizableTasks) {
        return false;
      }
    }

    this.resizeState = {
      isResizing: true,
      taskId,
      originalStart: new Date(startDate),
      originalEnd: new Date(endDate),
      resizeEdge,
      currentOffset: 0,
      startX
    };

    return true;
  }

  /**
   * Update resize position
   */
  updateResize(currentX: number, dayWidth: number, snapConfig: { enabled: boolean; type: 'day' | 'week' | 'month' }): ResizeState {
    if (!this.resizeState.isResizing) return this.resizeState;

    const offsetX = currentX - this.resizeState.startX;
    
    // Apply snap-to-grid
    let snappedOffset = offsetX;
    if (snapConfig.enabled) {
      const gridWidth = this.getGridWidth(snapConfig.type, dayWidth);
      snappedOffset = Math.round(offsetX / gridWidth) * gridWidth;
    }

    this.resizeState.currentOffset = snappedOffset;
    return { ...this.resizeState };
  }

  /**
   * Complete resize operation
   */
  async completeResize(
    currentX: number,
    dayWidth: number,
    snapConfig: { enabled: boolean; type: 'day' | 'week' | 'month' },
    constraints: ResizeConstraint,
    onDependencyRecalculate?: () => void
  ): Promise<ResizeResult> {
    if (!this.resizeState.isResizing || !this.resizeState.taskId) {
      return {
        success: false,
        newStart: new Date(),
        newEnd: new Date(),
        newDuration: 0,
        daysChanged: 0,
        message: 'No active resize operation'
      };
    }

    const offsetX = currentX - this.resizeState.startX;
    let snappedOffset = offsetX;
    
    // Apply snap-to-grid
    if (snapConfig.enabled) {
      const gridWidth = this.getGridWidth(snapConfig.type, dayWidth);
      snappedOffset = Math.round(offsetX / gridWidth) * gridWidth;
    }

    const daysChanged = Math.round(snappedOffset / dayWidth);
    
    if (daysChanged === 0) {
      this.resetResize();
      return {
        success: false,
        newStart: this.resizeState.originalStart!,
        newEnd: this.resizeState.originalEnd!,
        newDuration: Math.ceil((this.resizeState.originalEnd!.getTime() - this.resizeState.originalStart!.getTime()) / (1000 * 60 * 60 * 24)),
        daysChanged: 0,
        message: 'No resize detected'
      };
    }

    // Calculate new dates based on resize edge
    let newStart = new Date(this.resizeState.originalStart!);
    let newEnd = new Date(this.resizeState.originalEnd!);

    if (this.resizeState.resizeEdge === 'start') {
      newStart.setDate(newStart.getDate() + daysChanged);
    } else if (this.resizeState.resizeEdge === 'end') {
      newEnd.setDate(newEnd.getDate() + daysChanged);
    }

    // Apply demo mode limits
    if (this.isDemoMode) {
      const originalDuration = Math.ceil((this.resizeState.originalEnd!.getTime() - this.resizeState.originalStart!.getTime()) / (1000 * 60 * 60 * 24));
      const newDuration = Math.ceil((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24));
      const durationChange = Math.abs(newDuration - originalDuration);
      
      if (durationChange > DEMO_MODE_CONFIG.maxResizeDays) {
        this.resetResize();
        return {
          success: false,
          newStart: this.resizeState.originalStart!,
          newEnd: this.resizeState.originalEnd!,
          newDuration: originalDuration,
          daysChanged,
          message: `${DEMO_MODE_CONFIG.toastPrefix}Maximum resize is ±${DEMO_MODE_CONFIG.maxResizeDays} days`
        };
      }
    }

    // Validate constraints
    const constraintCheck = await this.validateConstraints(
      this.resizeState.taskId,
      newStart,
      newEnd,
      constraints
    );

    if (!constraintCheck.valid) {
      this.resetResize();
      return {
        success: false,
        newStart: this.resizeState.originalStart!,
        newEnd: this.resizeState.originalEnd!,
        newDuration: Math.ceil((this.resizeState.originalEnd!.getTime() - this.resizeState.originalStart!.getTime()) / (1000 * 60 * 60 * 24)),
        daysChanged,
        message: constraintCheck.message,
        constraintViolations: constraintCheck.violations
      };
    }

    // Update task in Supabase
    const updateSuccess = await this.updateTaskDates(
      this.resizeState.taskId,
      newStart,
      newEnd
    );

    if (!updateSuccess) {
      this.resetResize();
      return {
        success: false,
        newStart: this.resizeState.originalStart!,
        newEnd: this.resizeState.originalEnd!,
        newDuration: Math.ceil((this.resizeState.originalEnd!.getTime() - this.resizeState.originalStart!.getTime()) / (1000 * 60 * 60 * 24)),
        daysChanged,
        message: 'Failed to update task'
      };
    }

    // Add to undo buffer (integrate with dragRescheduleService)
    this.addToUndoBuffer({
      taskId: this.resizeState.taskId,
      previousStart: this.resizeState.originalStart!,
      previousEnd: this.resizeState.originalEnd!,
      action: 'resize',
      timestamp: new Date(),
      demoMode: this.isDemoMode
    });

    // Trigger dependency recalculation
    if (onDependencyRecalculate) {
      onDependencyRecalculate();
    }

    const newDuration = Math.ceil((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24));
    const originalDuration = Math.ceil((this.resizeState.originalEnd!.getTime() - this.resizeState.originalStart!.getTime()) / (1000 * 60 * 60 * 24));

    const result: ResizeResult = {
      success: true,
      newStart,
      newEnd,
      newDuration,
      daysChanged,
      message: this.isDemoMode 
        ? `${DEMO_MODE_CONFIG.toastPrefix}Task duration updated to ${newDuration} days`
        : `Task duration updated to ${newDuration} days`,
      demoMode: this.isDemoMode
    };

    this.resetResize();
    return result;
  }

  /**
   * Cancel resize operation
   */
  cancelResize(): void {
    this.resetResize();
  }

  /**
   * Get current resize state
   */
  getResizeState(): ResizeState {
    return { ...this.resizeState };
  }

  /**
   * Check if currently resizing
   */
  isResizing(): boolean {
    return this.resizeState.isResizing;
  }

  /**
   * Get grid width based on snap type
   */
  private getGridWidth(snapType: 'day' | 'week' | 'month', dayWidth: number): number {
    switch (snapType) {
      case 'day':
        return dayWidth;
      case 'week':
        return dayWidth * 7;
      case 'month':
        return dayWidth * 30; // Approximate
      default:
        return dayWidth;
    }
  }

  /**
   * Validate resize constraints
   */
  private async validateConstraints(
    taskId: string,
    newStart: Date,
    newEnd: Date,
    constraints: ResizeConstraint
  ): Promise<{ message: string; valid: boolean; violations?: string[] }> {
    try {
      const violations: string[] = [];

      // Check minimum duration
      const newDuration = Math.ceil((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24));
      if (newDuration < constraints.minDuration) {
        violations.push(`Duration cannot be less than ${constraints.minDuration} days`);
      }

      // Check maximum duration
      if (newDuration > constraints.maxDuration) {
        violations.push(`Duration cannot exceed ${constraints.maxDuration} days`);
      }

      // Check if end date is after start date
      if (newStart >= newEnd) {
        violations.push('End date must be after start date');
      }

      // Check for negative dates
      if (newStart < new Date('2020-01-01')) {
        violations.push('Start date cannot be before 2020');
      }

      // Check dependency constraints if enabled
      if (constraints.enforceDependencies) {
        const dependencyViolations = await this.checkDependencyConstraints(taskId, newStart, newEnd);
        violations.push(...dependencyViolations);
      }

      // Check for overlaps if not allowed
      if (!constraints.allowOverlap) {
        const overlapViolations = await this.checkOverlapConstraints(taskId, newStart, newEnd);
        violations.push(...overlapViolations);
      }

      return {
        valid: violations.length === 0,
        message: violations.length > 0 ? violations.join('; ') : 'Valid',
        violations
      };
    } catch (error) {
      console.error('Error validating constraints:', error);
      return {
        valid: false,
        message: 'Error validating constraints'
      };
    }
  }

  /**
   * Check dependency constraints
   */
  private async checkDependencyConstraints(
    taskId: string,
    newStart: Date,
    newEnd: Date
  ): Promise<string[]> {
    try {
      // Get task dependencies
      const { data: dependencies, error } = await supabase
        .from('asta_task_links')
        .select('source_task_id, target_task_id, link_type')
        .or(`source_task_id.eq.${taskId},target_task_id.eq.${taskId}`);

      if (error) throw error;

      const violations: string[] = [];

      for (const dep of dependencies || []) {
        if (dep.source_task_id === taskId) {
          // This task is a predecessor
          const { data: successor } = await supabase
            .from('asta_tasks')
            .select('name, start_date')
            .eq('id', dep.target_task_id)
            .single();

          if (successor && newEnd > new Date(successor.start_date)) {
            violations.push(`Violates dependency with "${successor.name}"`);
          }
        } else if (dep.target_task_id === taskId) {
          // This task is a successor
          const { data: predecessor } = await supabase
            .from('asta_tasks')
            .select('name, end_date')
            .eq('id', dep.source_task_id)
            .single();

          if (predecessor && newStart < new Date(predecessor.end_date)) {
            violations.push(`Violates dependency with "${predecessor.name}"`);
          }
        }
      }

      return violations;
    } catch (error) {
      console.error('Error checking dependency constraints:', error);
      return [];
    }
  }

  /**
   * Check overlap constraints
   */
  private async checkOverlapConstraints(
    taskId: string,
    newStart: Date,
    newEnd: Date
  ): Promise<string[]> {
    try {
      // Get project ID for this task
      const { data: task } = await supabase
        .from('asta_tasks')
        .select('project_id')
        .eq('id', taskId)
        .single();

      if (!task) return [];

      // Check for overlapping tasks in the same project
      const { data: overlappingTasks, error } = await supabase
        .from('asta_tasks')
        .select('name')
        .eq('project_id', task.project_id)
        .neq('id', taskId)
        .or(`and(start_date.lt.${newEnd.toISOString()},end_date.gt.${newStart.toISOString()})`);

      if (error) throw error;

      return overlappingTasks?.map(t => `Overlaps with "${t.name}"`) || [];
    } catch (error) {
      console.error('Error checking overlap constraints:', error);
      return [];
    }
  }

  /**
   * Update task dates in Supabase
   */
  private async updateTaskDates(
    taskId: string,
    newStart: Date,
    newEnd: Date
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('asta_tasks')
        .update({
          start_date: newStart.toISOString().split('T')[0],
          end_date: newEnd.toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
          demo_mode: this.isDemoMode
        })
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating task dates:', error);
      return false;
    }
  }

  /**
   * Add action to undo buffer
   */
  private addToUndoBuffer(action: {
    action: 'resize';
    demoMode?: boolean;
    previousEnd: Date;
    previousStart: Date;
    taskId: string;
    timestamp: Date;
  }): void {
    // This would integrate with the existing undo buffer from dragRescheduleService
    // For now, we'll use a simple implementation
    console.log('Added resize action to undo buffer:', action);
  }

  /**
   * Get demo mode configuration
   */
  getDemoModeConfig() {
    return DEMO_MODE_CONFIG;
  }

  /**
   * Check if current mode is demo
   */
  isInDemoMode(): boolean {
    return this.isDemoMode;
  }

  /**
   * Get task index for demo mode limits
   */
  private getTaskIndex(taskId: string): number {
    // This is a simplified implementation
    // In a real app, you'd get the actual task index from your task list
    const taskIdNum = parseInt(taskId.replace(/\D/g, ''), 10);
    return isNaN(taskIdNum) ? 0 : taskIdNum - 1;
  }

  /**
   * Reset resize state
   */
  private resetResize(): void {
    this.resizeState = {
      isResizing: false,
      taskId: null,
      originalStart: null,
      originalEnd: null,
      resizeEdge: null,
      currentOffset: 0,
      startX: 0
    };
  }
}

// Export singleton instance
export const taskResizeService = new TaskResizeService(); 