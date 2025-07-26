import { persistentStorage } from './persistentStorage';
import { demoModeService } from './demoModeService';
import { taskService } from './taskService';
import { dependenciesEngine } from './DependenciesEngine';
import { constraintsService } from './constraintsService';
import { milestoneService } from './milestoneService';

export interface TimelineAction {
  after: any;
  before: any;
  demo?: boolean;
  id: string;
  projectId: string;
  taskId?: string;
  timestamp: Date;
  type:
    | 'update_task'
    | 'create_task'
    | 'delete_task'
    | 'create_dependency'
    | 'delete_dependency'
    | 'update_constraint'
    | 'create_milestone'
    | 'update_milestone'
    | 'update_status'
    | 'update_tags';
  userId: string;
}

export interface UndoRedoState {
  maxStackSize: number;
  redoStack: TimelineAction[];
  undoStack: TimelineAction[];
}

export interface ActionPayload {
  after: any;
  before: any;
  projectId: string;
  taskId?: string;
  type: TimelineAction['type'];
}

class UndoRedoService {
  private readonly undoRedoKey = 'undo_redo_state';
  private readonly actionLogsKey = 'programme_action_logs';
  private readonly maxStackSize = 50; // Default max stack size
  private readonly demoMaxStackSize = 5; // Demo mode max stack size

  /**
   * Initialize undo/redo state for a project
   */
  async initializeProject(projectId: string): Promise<UndoRedoState> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      const maxStackSize = isDemoMode
        ? this.demoMaxStackSize
        : this.maxStackSize;

      const allStates = await this.getAllUndoRedoStates();
      let projectState = allStates.find(s => s.projectId === projectId);

      if (!projectState) {
        projectState = {
          projectId,
          undoStack: [],
          redoStack: [],
          maxStackSize,
        };
        allStates.push(projectState);
        await persistentStorage.set(this.undoRedoKey, allStates);
      }

      return projectState;
    } catch (error) {
      console.error('Error initializing project undo/redo state:', error);
      return {
        undoStack: [],
        redoStack: [],
        maxStackSize: this.maxStackSize,
      };
    }
  }

  /**
   * Record an action for undo/redo
   */
  async recordAction(
    payload: ActionPayload
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      const action: TimelineAction = {
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: payload.type,
        taskId: payload.taskId,
        projectId: payload.projectId,
        before: payload.before,
        after: payload.after,
        timestamp: new Date(),
        userId: 'current-user',
        demo: isDemoMode,
      };

      // Get current state
      const state = await this.getProjectState(payload.projectId);

      // Add to undo stack
      state.undoStack.push(action);

      // Limit stack size
      if (state.undoStack.length > state.maxStackSize) {
        state.undoStack.shift(); // Remove oldest action
      }

      // Clear redo stack when new action is recorded
      state.redoStack = [];

      // Save state
      await this.saveProjectState(payload.projectId, state);

      // Optionally log to action logs
      await this.logAction(action);

      console.log('Action recorded:', action.type, action.taskId);
      return { success: true };
    } catch (error) {
      console.error('Error recording action:', error);
      return { success: false, error: 'Failed to record action' };
    }
  }

  /**
   * Undo the last action
   */
  async undo(
    projectId: string
  ): Promise<{ action?: TimelineAction; error?: string; success: boolean }> {
    try {
      const state = await this.getProjectState(projectId);

      if (state.undoStack.length === 0) {
        return { success: false, error: 'No actions to undo' };
      }

      const action = state.undoStack.pop()!;

      // Apply reverse action
      const reverseResult = await this.applyReverseAction(action);

      if (!reverseResult.success) {
        // Put action back on stack if reverse failed
        state.undoStack.push(action);
        await this.saveProjectState(projectId, state);
        return { success: false, error: reverseResult.error };
      }

      // Add to redo stack (except in demo mode)
      const isDemoMode = await demoModeService.getDemoMode();
      if (!isDemoMode) {
        state.redoStack.push(action);
        if (state.redoStack.length > state.maxStackSize) {
          state.redoStack.shift();
        }
      }

      await this.saveProjectState(projectId, state);

      console.log('Action undone:', action.type, action.taskId);
      return { success: true, action };
    } catch (error) {
      console.error('Error undoing action:', error);
      return { success: false, error: 'Failed to undo action' };
    }
  }

  /**
   * Redo the last undone action
   */
  async redo(
    projectId: string
  ): Promise<{ action?: TimelineAction; error?: string; success: boolean }> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      if (isDemoMode) {
        return { success: false, error: 'Redo not available in demo mode' };
      }

      const state = await this.getProjectState(projectId);

      if (state.redoStack.length === 0) {
        return { success: false, error: 'No actions to redo' };
      }

      const action = state.redoStack.pop()!;

      // Apply action
      const applyResult = await this.applyAction(action);

      if (!applyResult.success) {
        // Put action back on redo stack if apply failed
        state.redoStack.push(action);
        await this.saveProjectState(projectId, state);
        return { success: false, error: applyResult.error };
      }

      // Add back to undo stack
      state.undoStack.push(action);
      if (state.undoStack.length > state.maxStackSize) {
        state.undoStack.shift();
      }

      await this.saveProjectState(projectId, state);

      console.log('Action redone:', action.type, action.taskId);
      return { success: true, action };
    } catch (error) {
      console.error('Error redoing action:', error);
      return { success: false, error: 'Failed to redo action' };
    }
  }

  /**
   * Check if undo is available
   */
  async canUndo(projectId: string): Promise<boolean> {
    try {
      const state = await this.getProjectState(projectId);
      return state.undoStack.length > 0;
    } catch (error) {
      console.error('Error checking undo availability:', error);
      return false;
    }
  }

  /**
   * Check if redo is available
   */
  async canRedo(projectId: string): Promise<boolean> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      if (isDemoMode) return false;

      const state = await this.getProjectState(projectId);
      return state.redoStack.length > 0;
    } catch (error) {
      console.error('Error checking redo availability:', error);
      return false;
    }
  }

  /**
   * Get undo stack count
   */
  async getUndoCount(projectId: string): Promise<number> {
    try {
      const state = await this.getProjectState(projectId);
      return state.undoStack.length;
    } catch (error) {
      console.error('Error getting undo count:', error);
      return 0;
    }
  }

  /**
   * Get redo stack count
   */
  async getRedoCount(projectId: string): Promise<number> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      if (isDemoMode) return 0;

      const state = await this.getProjectState(projectId);
      return state.redoStack.length;
    } catch (error) {
      console.error('Error getting redo count:', error);
      return 0;
    }
  }

  /**
   * Clear undo/redo history for a project
   */
  async clearHistory(
    projectId: string
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const state = await this.getProjectState(projectId);
      state.undoStack = [];
      state.redoStack = [];

      await this.saveProjectState(projectId, state);
      console.log('Undo/redo history cleared for project:', projectId);
      return { success: true };
    } catch (error) {
      console.error('Error clearing history:', error);
      return { success: false, error: 'Failed to clear history' };
    }
  }

  /**
   * Apply an action
   */
  private async applyAction(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      switch (action.type) {
        case 'update_task':
          return await this.applyTaskUpdate(action);
        case 'create_task':
          return await this.applyTaskCreate(action);
        case 'delete_task':
          return await this.applyTaskDelete(action);
        case 'create_dependency':
          return await this.applyDependencyCreate(action);
        case 'delete_dependency':
          return await this.applyDependencyDelete(action);
        case 'update_constraint':
          return await this.applyConstraintUpdate(action);
        case 'create_milestone':
          return await this.applyMilestoneCreate(action);
        case 'update_milestone':
          return await this.applyMilestoneUpdate(action);
        case 'update_status':
          return await this.applyStatusUpdate(action);
        case 'update_tags':
          return await this.applyTagsUpdate(action);
        default:
          return { success: false, error: 'Unknown action type' };
      }
    } catch (error) {
      console.error('Error applying action:', error);
      return { success: false, error: 'Failed to apply action' };
    }
  }

  /**
   * Apply reverse action
   */
  private async applyReverseAction(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      // Swap before and after for reverse action
      const reverseAction = {
        ...action,
        before: action.after,
        after: action.before,
      };

      return await this.applyAction(reverseAction);
    } catch (error) {
      console.error('Error applying reverse action:', error);
      return { success: false, error: 'Failed to apply reverse action' };
    }
  }

  /**
   * Apply task update action
   */
  private async applyTaskUpdate(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    if (!action.taskId) return { success: false, error: 'Task ID required' };

    const result = await taskService.updateTask(action.taskId, action.after);
    return { success: result.success, error: result.error };
  }

  /**
   * Apply task create action
   */
  private async applyTaskCreate(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    const result = await taskService.createTask(action.after);
    return { success: result.success, error: result.error };
  }

  /**
   * Apply task delete action
   */
  private async applyTaskDelete(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    if (!action.taskId) return { success: false, error: 'Task ID required' };

    const result = await taskService.deleteTask(action.taskId);
    return { success: result.success, error: result.error };
  }

  /**
   * Apply dependency create action
   */
  private async applyDependencyCreate(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    const { predecessorId, successorId, type, projectId } = action.after;
    const result = await dependenciesEngine.linkTasks(
      predecessorId,
      successorId,
      type,
      projectId
    );
    return { success: result.success, error: result.error };
  }

  /**
   * Apply dependency delete action
   */
  private async applyDependencyDelete(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    const result = await dependenciesEngine.unlinkTasks(
      action.after.dependencyId
    );
    return { success: result.success, error: result.error };
  }

  /**
   * Apply constraint update action
   */
  private async applyConstraintUpdate(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    if (!action.taskId) return { success: false, error: 'Task ID required' };

    if (action.after === null) {
      // Remove constraint
      const result = await constraintsService.removeConstraint(action.taskId);
      return { success: result.success, error: result.error };
    } else {
      // Set constraint
      const result = await constraintsService.setConstraint(
        action.taskId,
        action.after.type,
        action.after.constraintDate
      );
      return { success: result.success, error: result.error };
    }
  }

  /**
   * Apply milestone create action
   */
  private async applyMilestoneCreate(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    const result = await milestoneService.createMilestone(action.after);
    return { success: result.success, error: result.error };
  }

  /**
   * Apply milestone update action
   */
  private async applyMilestoneUpdate(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    if (!action.taskId) return { success: false, error: 'Task ID required' };

    const result = await milestoneService.updateMilestone(
      action.taskId,
      action.after
    );
    return { success: result.success, error: result.error };
  }

  /**
   * Apply status update action
   */
  private async applyStatusUpdate(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    if (!action.taskId) return { success: false, error: 'Task ID required' };

    const result = await taskService.updateTask(action.taskId, {
      statusId: action.after.statusId,
    });
    return { success: result.success, error: result.error };
  }

  /**
   * Apply tags update action
   */
  private async applyTagsUpdate(
    action: TimelineAction
  ): Promise<{ error?: string; success: boolean }> {
    if (!action.taskId) return { success: false, error: 'Task ID required' };

    const result = await taskService.updateTask(action.taskId, {
      tags: action.after.tags,
    });
    return { success: result.success, error: result.error };
  }

  /**
   * Get project state
   */
  private async getProjectState(projectId: string): Promise<UndoRedoState> {
    const allStates = await this.getAllUndoRedoStates();
    let projectState = allStates.find(s => s.projectId === projectId);

    if (!projectState) {
      projectState = await this.initializeProject(projectId);
    }

    return projectState;
  }

  /**
   * Save project state
   */
  private async saveProjectState(
    projectId: string,
    state: UndoRedoState
  ): Promise<void> {
    const allStates = await this.getAllUndoRedoStates();
    const existingIndex = allStates.findIndex(s => s.projectId === projectId);

    if (existingIndex >= 0) {
      allStates[existingIndex] = { ...state, projectId };
    } else {
      allStates.push({ ...state, projectId });
    }

    await persistentStorage.set(this.undoRedoKey, allStates);
  }

  /**
   * Get all undo/redo states
   */
  private async getAllUndoRedoStates(): Promise<
    Array<UndoRedoState & { projectId: string }>
  > {
    try {
      const states = await persistentStorage.get(this.undoRedoKey);
      return states || [];
    } catch (error) {
      console.error('Error getting all undo/redo states:', error);
      return [];
    }
  }

  /**
   * Log action to persistent storage (optional)
   */
  private async logAction(action: TimelineAction): Promise<void> {
    try {
      const allLogs = await this.getAllActionLogs();
      allLogs.push(action);

      // Keep only last 1000 logs
      if (allLogs.length > 1000) {
        allLogs.splice(0, allLogs.length - 1000);
      }

      await persistentStorage.set(this.actionLogsKey, allLogs);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }

  /**
   * Get all action logs
   */
  private async getAllActionLogs(): Promise<TimelineAction[]> {
    try {
      const logs = await persistentStorage.get(this.actionLogsKey);
      return logs || [];
    } catch (error) {
      console.error('Error getting action logs:', error);
      return [];
    }
  }

  /**
   * Clear all undo/redo data (for demo mode reset)
   */
  async clearAllUndoRedoData(): Promise<void> {
    try {
      await persistentStorage.remove(this.undoRedoKey);
      await persistentStorage.remove(this.actionLogsKey);
      console.log('All undo/redo data cleared');
    } catch (error) {
      console.error('Error clearing undo/redo data:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      if (isDemoMode) {
        await this.clearAllUndoRedoData();
        console.log('Demo undo/redo data reset');
      }
    } catch (error) {
      console.error('Error resetting demo undo/redo data:', error);
      throw error;
    }
  }
}

export const undoRedoService = new UndoRedoService();
