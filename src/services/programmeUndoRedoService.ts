import { supabase } from './supabase';
import { demoModeService } from './demoModeService';
import { taskService } from './taskService';
import { dependenciesEngine } from './DependenciesEngine';
import { constraintsService } from './constraintsService';
import { milestoneService } from './milestoneService';

export interface ProgrammeAction {
  actionType:
    | 'task_create'
    | 'task_update'
    | 'task_delete'
    | 'bar_move'
    | 'bar_resize'
    | 'dependency_link'
    | 'dependency_unlink'
    | 'milestone_create'
    | 'milestone_edit'
    | 'flag_update'
    | 'note_update'
    | 'structure_collapse'
    | 'structure_expand'
    | 'calendar_override';
  afterState: any;
  beforeState: any;
  demo?: boolean;
  description: string;
  id: string;
  projectId: string;
  taskId?: string;
  timestamp: Date;
  userId: string;
}

export interface ProgrammeUndoRedoState {
  maxStackSize: number;
  redoStack: ProgrammeAction[];
  undoStack: ProgrammeAction[];
}

export interface ActionPayload {
  actionType: ProgrammeAction['actionType'];
  afterState: any;
  beforeState: any;
  description: string;
  projectId: string;
  taskId?: string;
}

class ProgrammeUndoRedoService {
  private readonly maxStackSize = 20; // Default max stack size per user/project
  private readonly demoMaxStackSize = 3; // Demo mode max stack size
  private readonly demoMaxUndos = 3; // Max undos allowed in demo mode

  // In-memory command stacks (not localStorage as per prompt requirements)
  private commandStacks: Map<string, ProgrammeUndoRedoState> = new Map();

  /**
   * Get or create command stack for a project/user combination
   */
  private getCommandStack(
    projectId: string,
    userId: string
  ): ProgrammeUndoRedoState {
    const key = `${projectId}_${userId}`;
    if (!this.commandStacks.has(key)) {
      this.commandStacks.set(key, {
        undoStack: [],
        redoStack: [],
        maxStackSize: this.maxStackSize,
      });
    }
    return this.commandStacks.get(key)!;
  }

  /**
   * Initialize undo/redo state for a project
   */
  async initializeProject(
    projectId: string,
    userId: string
  ): Promise<ProgrammeUndoRedoState> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      const maxStackSize = isDemoMode
        ? this.demoMaxStackSize
        : this.maxStackSize;

      // Get or create in-memory stack
      const stack = this.getCommandStack(projectId, userId);
      stack.maxStackSize = maxStackSize;

      return stack;
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

      const action: ProgrammeAction = {
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'current-user', // This should be replaced with actual user ID
        projectId: payload.projectId,
        actionType: payload.actionType,
        timestamp: new Date(),
        beforeState: payload.beforeState,
        afterState: payload.afterState,
        taskId: payload.taskId,
        description: payload.description,
        demo: isDemoMode,
      };

      // Get in-memory stack
      const stack = this.getCommandStack(payload.projectId, action.userId);

      // Add to undo stack
      stack.undoStack.push(action);

      // Limit stack size
      if (stack.undoStack.length > stack.maxStackSize) {
        stack.undoStack.shift(); // Remove oldest action
      }

      // Clear redo stack when new action is recorded
      stack.redoStack = [];

      // Log to Supabase audit log (permanent record)
      await this.logToAuditLog(action);

      console.log('Action recorded:', action.actionType, action.taskId);
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
    projectId: string,
    userId: string
  ): Promise<{ action?: ProgrammeAction; error?: string; success: boolean }> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      // Get in-memory stack
      const stack = this.getCommandStack(projectId, userId);

      // Check demo mode limits
      if (isDemoMode) {
        if (stack.undoStack.length >= this.demoMaxUndos) {
          return { success: false, error: 'Undo limit reached in demo mode' };
        }
      }

      if (stack.undoStack.length === 0) {
        return { success: false, error: 'No actions to undo' };
      }

      const action = stack.undoStack.pop()!;

      // Apply reverse action
      const reverseResult = await this.applyReverseAction(action);

      if (!reverseResult.success) {
        // Put action back on stack if reverse failed
        stack.undoStack.push(action);
        return { success: false, error: reverseResult.error };
      }

      // Add to redo stack (except in demo mode)
      if (!isDemoMode) {
        stack.redoStack.push(action);
        if (stack.redoStack.length > stack.maxStackSize) {
          stack.redoStack.shift();
        }
      }

      console.log('Action undone:', action.actionType, action.taskId);
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
    projectId: string,
    userId: string
  ): Promise<{ action?: ProgrammeAction; error?: string; success: boolean }> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      if (isDemoMode) {
        return { success: false, error: 'Redo not available in demo mode' };
      }

      // Get in-memory stack
      const stack = this.getCommandStack(projectId, userId);

      if (stack.redoStack.length === 0) {
        return { success: false, error: 'No actions to redo' };
      }

      const action = stack.redoStack.pop()!;

      // Apply action
      const applyResult = await this.applyAction(action);

      if (!applyResult.success) {
        // Put action back on redo stack if apply failed
        stack.redoStack.push(action);
        return { success: false, error: applyResult.error };
      }

      // Add back to undo stack
      stack.undoStack.push(action);
      if (stack.undoStack.length > stack.maxStackSize) {
        stack.undoStack.shift();
      }

      console.log('Action redone:', action.actionType, action.taskId);
      return { success: true, action };
    } catch (error) {
      console.error('Error redoing action:', error);
      return { success: false, error: 'Failed to redo action' };
    }
  }

  /**
   * Check if undo is available
   */
  async canUndo(projectId: string, userId: string): Promise<boolean> {
    try {
      const stack = this.getCommandStack(projectId, userId);
      const isDemoMode = await demoModeService.getDemoMode();

      if (isDemoMode && stack.undoStack.length >= this.demoMaxUndos) {
        return false;
      }

      return stack.undoStack.length > 0;
    } catch (error) {
      console.error('Error checking undo availability:', error);
      return false;
    }
  }

  /**
   * Check if redo is available
   */
  async canRedo(projectId: string, userId: string): Promise<boolean> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      if (isDemoMode) return false;

      const stack = this.getCommandStack(projectId, userId);
      return stack.redoStack.length > 0;
    } catch (error) {
      console.error('Error checking redo availability:', error);
      return false;
    }
  }

  /**
   * Get undo stack count
   */
  async getUndoCount(projectId: string, userId: string): Promise<number> {
    try {
      const stack = this.getCommandStack(projectId, userId);
      return stack.undoStack.length;
    } catch (error) {
      console.error('Error getting undo count:', error);
      return 0;
    }
  }

  /**
   * Get redo stack count
   */
  async getRedoCount(projectId: string, userId: string): Promise<number> {
    try {
      const stack = this.getCommandStack(projectId, userId);
      return stack.redoStack.length;
    } catch (error) {
      console.error('Error getting redo count:', error);
      return 0;
    }
  }

  /**
   * Clear undo/redo history for a project
   */
  async clearHistory(
    projectId: string,
    userId: string
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const key = `${projectId}_${userId}`;
      this.commandStacks.delete(key);

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
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      switch (action.actionType) {
        case 'task_create':
          return await this.applyTaskCreate(action);
        case 'task_update':
          return await this.applyTaskUpdate(action);
        case 'task_delete':
          return await this.applyTaskDelete(action);
        case 'bar_move':
        case 'bar_resize':
          return await this.applyBarChange(action);
        case 'dependency_link':
          return await this.applyDependencyLink(action);
        case 'dependency_unlink':
          return await this.applyDependencyUnlink(action);
        case 'milestone_create':
          return await this.applyMilestoneCreate(action);
        case 'milestone_edit':
          return await this.applyMilestoneEdit(action);
        case 'flag_update':
        case 'note_update':
          return await this.applyFlagNoteUpdate(action);
        case 'structure_collapse':
        case 'structure_expand':
          return await this.applyStructureChange(action);
        case 'calendar_override':
          return await this.applyCalendarOverride(action);
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
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      // For reverse actions, we swap before and after states
      const reverseAction: ProgrammeAction = {
        ...action,
        beforeState: action.afterState,
        afterState: action.beforeState,
      };

      return await this.applyAction(reverseAction);
    } catch (error) {
      console.error('Error applying reverse action:', error);
      return { success: false, error: 'Failed to apply reverse action' };
    }
  }

  // Action-specific implementations
  private async applyTaskCreate(
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('asta_tasks')
        .insert(action.afterState);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying task create:', error);
      return { success: false, error: 'Failed to create task' };
    }
  }

  private async applyTaskUpdate(
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('asta_tasks')
        .update(action.afterState)
        .eq('id', action.taskId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying task update:', error);
      return { success: false, error: 'Failed to update task' };
    }
  }

  private async applyTaskDelete(
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('asta_tasks')
        .delete()
        .eq('id', action.taskId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying task delete:', error);
      return { success: false, error: 'Failed to delete task' };
    }
  }

  private async applyBarChange(
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('asta_tasks')
        .update({
          start_date: action.afterState.start_date,
          end_date: action.afterState.end_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', action.taskId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying bar change:', error);
      return { success: false, error: 'Failed to update task dates' };
    }
  }

  private async applyDependencyLink(
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('task_dependencies')
        .insert(action.afterState);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying dependency link:', error);
      return { success: false, error: 'Failed to create dependency' };
    }
  }

  private async applyDependencyUnlink(
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', action.afterState.dependency_id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying dependency unlink:', error);
      return { success: false, error: 'Failed to remove dependency' };
    }
  }

  private async applyMilestoneCreate(
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('milestones')
        .insert(action.afterState);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying milestone create:', error);
      return { success: false, error: 'Failed to create milestone' };
    }
  }

  private async applyMilestoneEdit(
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('milestones')
        .update(action.afterState)
        .eq('id', action.afterState.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying milestone edit:', error);
      return { success: false, error: 'Failed to update milestone' };
    }
  }

  private async applyFlagNoteUpdate(
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('asta_tasks')
        .update({
          flags: action.afterState.flags,
          notes: action.afterState.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', action.taskId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying flag/note update:', error);
      return { success: false, error: 'Failed to update flags/notes' };
    }
  }

  private async applyStructureChange(
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('asta_tasks')
        .update({
          parent_id: action.afterState.parent_id,
          level: action.afterState.level,
          updated_at: new Date().toISOString(),
        })
        .eq('id', action.taskId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying structure change:', error);
      return { success: false, error: 'Failed to update task structure' };
    }
  }

  private async applyCalendarOverride(
    action: ProgrammeAction
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('calendar_overrides')
        .upsert(action.afterState);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying calendar override:', error);
      return { success: false, error: 'Failed to update calendar override' };
    }
  }

  // Helper methods
  private async logToAuditLog(action: ProgrammeAction): Promise<void> {
    try {
      await supabase.from('programme_audit_logs').insert({
        user_id: action.userId,
        project_id: action.projectId,
        action_type: action.actionType,
        task_id: action.taskId,
        description: action.description,
        before_state: action.beforeState,
        after_state: action.afterState,
        timestamp: action.timestamp.toISOString(),
        demo: action.demo,
      });
    } catch (error) {
      console.error('Error logging to audit log:', error);
    }
  }
}

export const programmeUndoRedoService = new ProgrammeUndoRedoService();
