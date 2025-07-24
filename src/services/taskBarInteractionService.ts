import { taskService } from './taskService';
import { demoModeService } from './demoModeService';
import { persistentStorage } from './persistentStorage';

export interface TaskBarInteraction {
  taskId: string;
  type: 'drag' | 'resize' | 'click';
  startDate: Date;
  endDate: Date;
  originalStartDate: Date;
  originalEndDate: Date;
  timestamp: Date;
  userId: string;
  demo?: boolean;
}

export interface DragConstraints {
  minStartDate?: Date;
  maxEndDate?: Date;
  maxDuration?: number;
  snapToGrid?: boolean;
  gridSize?: number; // in days
}

export interface ResizeConstraints {
  minDuration?: number;
  maxDuration?: number;
  preserveStartDate?: boolean;
  preserveEndDate?: boolean;
}

class TaskBarInteractionService {
  private readonly interactionsKey = 'task_bar_interactions';
  private readonly constraintsKey = 'task_bar_constraints';

  /**
   * Validate drag operation
   */
  async validateDrag(
    taskId: string,
    newStartDate: Date,
    newEndDate: Date,
    constraints?: DragConstraints
  ): Promise<{ isValid: boolean; errors: string[]; adjustedDates?: { startDate: Date; endDate: Date } }> {
    const errors: string[] = [];
    let adjustedStartDate = new Date(newStartDate);
    let adjustedEndDate = new Date(newEndDate);

    // Check demo mode restrictions
    const isDemoMode = await demoModeService.isDemoMode();
    if (isDemoMode) {
      const taskCount = await taskService.getTaskCount('current-project'); // This should be passed as parameter
      if (taskCount >= 3) {
        errors.push('Maximum 3 tasks allowed in demo mode');
        return { isValid: false, errors };
      }

      // Demo mode drag constraints
      const maxDragRange = 5; // 5 days max
      const duration = Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24));
      if (duration > maxDragRange) {
        errors.push(`Drag limited to ${maxDragRange} days in demo mode`);
        return { isValid: false, errors };
      }
    }

    // Basic validation
    if (adjustedStartDate >= adjustedEndDate) {
      errors.push('Start date must be before end date');
      return { isValid: false, errors };
    }

    // Apply constraints
    if (constraints) {
      if (constraints.minStartDate && adjustedStartDate < constraints.minStartDate) {
        adjustedStartDate = new Date(constraints.minStartDate);
      }

      if (constraints.maxEndDate && adjustedEndDate > constraints.maxEndDate) {
        adjustedEndDate = new Date(constraints.maxEndDate);
      }

      if (constraints.maxDuration) {
        const duration = Math.ceil((adjustedEndDate.getTime() - adjustedStartDate.getTime()) / (1000 * 60 * 60 * 24));
        if (duration > constraints.maxDuration) {
          adjustedEndDate = new Date(adjustedStartDate.getTime() + constraints.maxDuration * 24 * 60 * 60 * 1000);
        }
      }

      // Snap to grid
      if (constraints.snapToGrid && constraints.gridSize) {
        adjustedStartDate = this.snapToGrid(adjustedStartDate, constraints.gridSize);
        adjustedEndDate = this.snapToGrid(adjustedEndDate, constraints.gridSize);
      }
    }

    const hasAdjustments = adjustedStartDate.getTime() !== newStartDate.getTime() || 
                          adjustedEndDate.getTime() !== newEndDate.getTime();

    return {
      isValid: errors.length === 0,
      errors,
      adjustedDates: hasAdjustments ? { startDate: adjustedStartDate, endDate: adjustedEndDate } : undefined
    };
  }

  /**
   * Validate resize operation
   */
  async validateResize(
    taskId: string,
    newStartDate: Date,
    newEndDate: Date,
    resizeHandle: 'left' | 'right',
    constraints?: ResizeConstraints
  ): Promise<{ isValid: boolean; errors: string[]; adjustedDates?: { startDate: Date; endDate: Date } }> {
    const errors: string[] = [];
    let adjustedStartDate = new Date(newStartDate);
    let adjustedEndDate = new Date(newEndDate);

    // Check demo mode restrictions
    const isDemoMode = await demoModeService.isDemoMode();
    if (isDemoMode) {
      const taskCount = await taskService.getTaskCount('current-project'); // This should be passed as parameter
      if (taskCount >= 3) {
        errors.push('Maximum 3 tasks allowed in demo mode');
        return { isValid: false, errors };
      }

      // Demo mode resize constraints
      const maxDuration = 10; // 10 days max
      const duration = Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24));
      if (duration > maxDuration) {
        errors.push(`Resize limited to ${maxDuration} days in demo mode`);
        return { isValid: false, errors };
      }
    }

    // Basic validation
    if (adjustedStartDate >= adjustedEndDate) {
      errors.push('Start date must be before end date');
      return { isValid: false, errors };
    }

    // Apply constraints
    if (constraints) {
      if (constraints.minDuration) {
        const duration = Math.ceil((adjustedEndDate.getTime() - adjustedStartDate.getTime()) / (1000 * 60 * 60 * 24));
        if (duration < constraints.minDuration) {
          if (resizeHandle === 'left') {
            adjustedStartDate = new Date(adjustedEndDate.getTime() - constraints.minDuration * 24 * 60 * 60 * 1000);
          } else {
            adjustedEndDate = new Date(adjustedStartDate.getTime() + constraints.minDuration * 24 * 60 * 60 * 1000);
          }
        }
      }

      if (constraints.maxDuration) {
        const duration = Math.ceil((adjustedEndDate.getTime() - adjustedStartDate.getTime()) / (1000 * 60 * 60 * 24));
        if (duration > constraints.maxDuration) {
          if (resizeHandle === 'left') {
            adjustedStartDate = new Date(adjustedEndDate.getTime() - constraints.maxDuration * 24 * 60 * 60 * 1000);
          } else {
            adjustedEndDate = new Date(adjustedStartDate.getTime() + constraints.maxDuration * 24 * 60 * 60 * 1000);
          }
        }
      }

      if (constraints.preserveStartDate && resizeHandle === 'left') {
        adjustedStartDate = new Date(newStartDate);
      }

      if (constraints.preserveEndDate && resizeHandle === 'right') {
        adjustedEndDate = new Date(newEndDate);
      }
    }

    const hasAdjustments = adjustedStartDate.getTime() !== newStartDate.getTime() || 
                          adjustedEndDate.getTime() !== newEndDate.getTime();

    return {
      isValid: errors.length === 0,
      errors,
      adjustedDates: hasAdjustments ? { startDate: adjustedStartDate, endDate: adjustedEndDate } : undefined
    };
  }

  /**
   * Execute drag operation
   */
  async executeDrag(
    taskId: string,
    newStartDate: Date,
    newEndDate: Date,
    originalStartDate: Date,
    originalEndDate: Date,
    projectId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate the drag operation
      const validation = await this.validateDrag(taskId, newStartDate, newEndDate);
      
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      const datesToUse = validation.adjustedDates || { startDate: newStartDate, endDate: newEndDate };

      // Update the task
      await taskService.updateTask(taskId, {
        startDate: datesToUse.startDate,
        endDate: datesToUse.endDate,
        demo: await demoModeService.isDemoMode()
      });

      // Log the interaction
      await this.logInteraction({
        taskId,
        type: 'drag',
        startDate: datesToUse.startDate,
        endDate: datesToUse.endDate,
        originalStartDate,
        originalEndDate,
        timestamp: new Date(),
        userId: 'current-user', // This should come from auth context
        demo: await demoModeService.isDemoMode()
      });

      return { success: true };
    } catch (error) {
      console.error('Error executing drag operation:', error);
      return { success: false, error: 'Failed to update task' };
    }
  }

  /**
   * Execute resize operation
   */
  async executeResize(
    taskId: string,
    newStartDate: Date,
    newEndDate: Date,
    originalStartDate: Date,
    originalEndDate: Date,
    resizeHandle: 'left' | 'right',
    projectId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate the resize operation
      const validation = await this.validateResize(taskId, newStartDate, newEndDate, resizeHandle);
      
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      const datesToUse = validation.adjustedDates || { startDate: newStartDate, endDate: newEndDate };

      // Update the task
      await taskService.updateTask(taskId, {
        startDate: datesToUse.startDate,
        endDate: datesToUse.endDate,
        demo: await demoModeService.isDemoMode()
      });

      // Log the interaction
      await this.logInteraction({
        taskId,
        type: 'resize',
        startDate: datesToUse.startDate,
        endDate: datesToUse.endDate,
        originalStartDate,
        originalEndDate,
        timestamp: new Date(),
        userId: 'current-user', // This should come from auth context
        demo: await demoModeService.isDemoMode()
      });

      return { success: true };
    } catch (error) {
      console.error('Error executing resize operation:', error);
      return { success: false, error: 'Failed to update task' };
    }
  }

  /**
   * Log interaction for audit trail
   */
  async logInteraction(interaction: TaskBarInteraction): Promise<void> {
    try {
      const interactions = await this.getAllInteractions();
      interactions.push(interaction);
      
      // Keep only last 1000 interactions
      if (interactions.length > 1000) {
        interactions.splice(0, interactions.length - 1000);
      }
      
      await persistentStorage.set(this.interactionsKey, interactions);
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }

  /**
   * Get interaction history for a task
   */
  async getTaskInteractions(taskId: string): Promise<TaskBarInteraction[]> {
    try {
      const interactions = await this.getAllInteractions();
      return interactions.filter(i => i.taskId === taskId);
    } catch (error) {
      console.error('Error getting task interactions:', error);
      return [];
    }
  }

  /**
   * Get interaction history for a project
   */
  async getProjectInteractions(projectId: string): Promise<TaskBarInteraction[]> {
    try {
      const interactions = await this.getAllInteractions();
      // Note: This would need projectId in the interaction data
      // For now, return all interactions
      return interactions;
    } catch (error) {
      console.error('Error getting project interactions:', error);
      return [];
    }
  }

  /**
   * Calculate optimal snap position
   */
  snapToGrid(date: Date, gridSize: number): Date {
    const dayOfYear = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
    const snappedDay = Math.round(dayOfYear / gridSize) * gridSize;
    return new Date(snappedDay * 1000 * 60 * 60 * 24);
  }

  /**
   * Calculate drag distance in days
   */
  calculateDragDistance(startX: number, currentX: number, dayWidth: number): number {
    const deltaX = currentX - startX;
    return Math.round(deltaX / dayWidth);
  }

  /**
   * Calculate resize distance in days
   */
  calculateResizeDistance(startX: number, currentX: number, dayWidth: number): number {
    const deltaX = currentX - startX;
    return Math.round(deltaX / dayWidth);
  }

  /**
   * Get default constraints for demo mode
   */
  getDemoModeConstraints(): { drag: DragConstraints; resize: ResizeConstraints } {
    return {
      drag: {
        maxDuration: 5,
        snapToGrid: true,
        gridSize: 1
      },
      resize: {
        minDuration: 1,
        maxDuration: 10
      }
    };
  }

  /**
   * Get default constraints for live mode
   */
  getLiveModeConstraints(): { drag: DragConstraints; resize: ResizeConstraints } {
    return {
      drag: {
        snapToGrid: true,
        gridSize: 1
      },
      resize: {
        minDuration: 1
      }
    };
  }

  /**
   * Clear interaction history
   */
  async clearInteractionHistory(): Promise<void> {
    try {
      await persistentStorage.remove(this.interactionsKey);
      console.log('Task bar interaction history cleared');
    } catch (error) {
      console.error('Error clearing interaction history:', error);
      throw error;
    }
  }

  /**
   * Get all interactions from storage
   */
  private async getAllInteractions(): Promise<TaskBarInteraction[]> {
    try {
      const interactions = await persistentStorage.get(this.interactionsKey);
      return interactions || [];
    } catch (error) {
      console.error('Error getting all interactions:', error);
      return [];
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      if (isDemoMode) {
        await this.clearInteractionHistory();
        console.log('Demo task bar interaction data reset');
      }
    } catch (error) {
      console.error('Error resetting demo interaction data:', error);
      throw error;
    }
  }
}

export const taskBarInteractionService = new TaskBarInteractionService(); 