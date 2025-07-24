import { supabase } from './supabase';

// Drag reschedule interfaces
export interface DragState {
  isDragging: boolean;
  taskId: string | null;
  originalStart: Date | null;
  originalEnd: Date | null;
  currentOffset: number;
  startX: number;
}

export interface UndoAction {
  taskId: string;
  previousStart: Date;
  previousEnd: Date;
  action: 'reschedule';
  timestamp: Date;
  demoMode?: boolean;
}

export interface RescheduleResult {
  success: boolean;
  newStart: Date;
  newEnd: Date;
  daysMoved: number;
  message: string;
  demoMode?: boolean;
}

export interface SnapConfig {
  enabled: boolean;
  type: 'day' | 'week' | 'month';
  gridWidth: number; // pixels per grid unit
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxDraggableTasks: 3,
  snapType: 'day' as const,
  maxUndoActions: 1,
  toastPrefix: 'DEMO LIMIT: '
};

class DragRescheduleService {
  private dragState: DragState = {
    isDragging: false,
    taskId: null,
    originalStart: null,
    originalEnd: null,
    currentOffset: 0,
    startX: 0
  };

  private undoBuffer: UndoAction[] = [];
  private maxUndoActions = 10;
  private isDemoMode = false;

  constructor() {
    this.isDemoMode = this.checkDemoMode();
  }

  private checkDemoMode(): boolean {
    // Check user role or environment to determine demo mode
    // For now, we'll use a simple check - you can enhance this
    return false; // Set to true for demo mode testing
  }

  /**
   * Start drag operation
   */
  startDrag(taskId: string, startDate: Date, endDate: Date, startX: number): boolean {
    // Check demo mode limits
    if (this.isDemoMode) {
      const taskIndex = this.getTaskIndex(taskId);
      if (taskIndex >= DEMO_MODE_CONFIG.maxDraggableTasks) {
        return false;
      }
    }

    this.dragState = {
      isDragging: true,
      taskId,
      originalStart: new Date(startDate),
      originalEnd: new Date(endDate),
      currentOffset: 0,
      startX
    };

    return true;
  }

  /**
   * Update drag position
   */
  updateDrag(currentX: number, dayWidth: number, snapConfig: SnapConfig): DragState {
    if (!this.dragState.isDragging) return this.dragState;

    const offsetX = currentX - this.dragState.startX;
    
    // Apply snap-to-grid
    let snappedOffset = offsetX;
    if (snapConfig.enabled) {
      const gridWidth = this.getGridWidth(snapConfig.type, dayWidth);
      snappedOffset = Math.round(offsetX / gridWidth) * gridWidth;
    }

    this.dragState.currentOffset = snappedOffset;
    return { ...this.dragState };
  }

  /**
   * Complete drag operation and reschedule task
   */
  async completeDrag(
    currentX: number, 
    dayWidth: number, 
    snapConfig: SnapConfig,
    onDependencyRecalculate?: () => void
  ): Promise<RescheduleResult> {
    if (!this.dragState.isDragging || !this.dragState.taskId) {
      return {
        success: false,
        newStart: new Date(),
        newEnd: new Date(),
        daysMoved: 0,
        message: 'No active drag operation'
      };
    }

    const offsetX = currentX - this.dragState.startX;
    let snappedOffset = offsetX;
    
    // Apply snap-to-grid
    if (snapConfig.enabled) {
      const gridWidth = this.getGridWidth(snapConfig.type, dayWidth);
      snappedOffset = Math.round(offsetX / gridWidth) * gridWidth;
    }

    const daysMoved = Math.round(snappedOffset / dayWidth);
    
    if (daysMoved === 0) {
      this.resetDrag();
      return {
        success: false,
        newStart: this.dragState.originalStart!,
        newEnd: this.dragState.originalEnd!,
        daysMoved: 0,
        message: 'No movement detected'
      };
    }

    // Calculate new dates
    const newStart = new Date(this.dragState.originalStart!);
    newStart.setDate(newStart.getDate() + daysMoved);
    
    const newEnd = new Date(this.dragState.originalEnd!);
    newEnd.setDate(newEnd.getDate() + daysMoved);

    // Validate constraints (you can integrate with dependency service here)
    const constraintCheck = await this.validateConstraints(
      this.dragState.taskId,
      newStart,
      newEnd
    );

    if (!constraintCheck.valid) {
      this.resetDrag();
      return {
        success: false,
        newStart: this.dragState.originalStart!,
        newEnd: this.dragState.originalEnd!,
        daysMoved,
        message: constraintCheck.message
      };
    }

    // Update task in Supabase
    const updateSuccess = await this.updateTaskDates(
      this.dragState.taskId,
      newStart,
      newEnd
    );

    if (!updateSuccess) {
      this.resetDrag();
      return {
        success: false,
        newStart: this.dragState.originalStart!,
        newEnd: this.dragState.originalEnd!,
        daysMoved,
        message: 'Failed to update task'
      };
    }

    // Add to undo buffer
    this.addToUndoBuffer({
      taskId: this.dragState.taskId,
      previousStart: this.dragState.originalStart!,
      previousEnd: this.dragState.originalEnd!,
      action: 'reschedule',
      timestamp: new Date(),
      demoMode: this.isDemoMode
    });

    // Trigger dependency recalculation
    if (onDependencyRecalculate) {
      onDependencyRecalculate();
    }

    const result: RescheduleResult = {
      success: true,
      newStart,
      newEnd,
      daysMoved,
      message: this.isDemoMode 
        ? `${DEMO_MODE_CONFIG.toastPrefix}Task rescheduled to ${newStart.toLocaleDateString()}`
        : `Task rescheduled to ${newStart.toLocaleDateString()}`,
      demoMode: this.isDemoMode
    };

    this.resetDrag();
    return result;
  }

  /**
   * Cancel drag operation
   */
  cancelDrag(): void {
    this.resetDrag();
  }

  /**
   * Get current drag state
   */
  getDragState(): DragState {
    return { ...this.dragState };
  }

  /**
   * Check if currently dragging
   */
  isDragging(): boolean {
    return this.dragState.isDragging;
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
   * Validate task constraints
   */
  private async validateConstraints(
    taskId: string, 
    newStart: Date, 
    newEnd: Date
  ): Promise<{ valid: boolean; message: string }> {
    try {
      // Check if new dates are valid
      if (newStart >= newEnd) {
        return {
          valid: false,
          message: 'End date must be after start date'
        };
      }

      // Check for negative dates (before project start)
      if (newStart < new Date('2020-01-01')) {
        return {
          valid: false,
          message: 'Start date cannot be before 2020'
        };
      }

      // You can add more constraint checks here:
      // - Dependency constraints
      // - Resource availability
      // - Project deadlines
      // - Working days/holidays

      return { valid: true, message: 'Valid' };
    } catch (error) {
      console.error('Error validating constraints:', error);
      return {
        valid: false,
        message: 'Error validating constraints'
      };
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
  private addToUndoBuffer(action: UndoAction): void {
    const maxActions = this.isDemoMode ? DEMO_MODE_CONFIG.maxUndoActions : this.maxUndoActions;
    
    this.undoBuffer.unshift(action);
    
    // Keep only the last N actions
    if (this.undoBuffer.length > maxActions) {
      this.undoBuffer = this.undoBuffer.slice(0, maxActions);
    }
  }

  /**
   * Undo last action
   */
  async undoLastAction(): Promise<{ success: boolean; message: string }> {
    if (this.undoBuffer.length === 0) {
      return {
        success: false,
        message: 'No actions to undo'
      };
    }

    const lastAction = this.undoBuffer.shift()!;

    try {
      const { error } = await supabase
        .from('asta_tasks')
        .update({
          start_date: lastAction.previousStart.toISOString().split('T')[0],
          end_date: lastAction.previousEnd.toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
          demo_mode: this.isDemoMode
        })
        .eq('id', lastAction.taskId);

      if (error) throw error;

      return {
        success: true,
        message: this.isDemoMode 
          ? `${DEMO_MODE_CONFIG.toastPrefix}Undo successful`
          : 'Undo successful'
      };
    } catch (error) {
      console.error('Error undoing action:', error);
      return {
        success: false,
        message: 'Failed to undo action'
      };
    }
  }

  /**
   * Get undo buffer
   */
  getUndoBuffer(): UndoAction[] {
    return [...this.undoBuffer];
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoBuffer.length > 0;
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
   * Reset drag state
   */
  private resetDrag(): void {
    this.dragState = {
      isDragging: false,
      taskId: null,
      originalStart: null,
      originalEnd: null,
      currentOffset: 0,
      startX: 0
    };
  }

  /**
   * Clear undo buffer
   */
  clearUndoBuffer(): void {
    this.undoBuffer = [];
  }
}

// Export singleton instance
export const dragRescheduleService = new DragRescheduleService(); 