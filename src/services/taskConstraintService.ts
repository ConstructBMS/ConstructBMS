import { supabase } from './supabase';
import { demoModeService } from './demoModeService';
import type { TaskConstraint, ConstraintType } from '../components/modules/TaskConstraintsTab';

export interface ConstraintResult {
  success: boolean;
  constraint?: TaskConstraint;
  error?: string;
}

export interface ConstraintViolation {
  taskId: string;
  constraintType: ConstraintType;
  message: string;
  severity: 'warning' | 'error';
}

class TaskConstraintService {
  /**
   * Save or update a task constraint
   */
  async saveTaskConstraint(constraint: TaskConstraint): Promise<ConstraintResult> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      // Check demo mode restrictions
      if (isDemoMode) {
        if (constraint.constraintType !== 'SNET') {
          return { 
            success: false, 
            error: 'DEMO LIMIT - Only "Start No Earlier Than" constraint allowed in demo mode' 
          };
        }

        const constraintCount = await this.getConstraintCount(constraint.taskId.split('_')[0]); // Extract project ID
        if (constraintCount >= 2) {
          return { 
            success: false, 
            error: 'DEMO LIMIT - Maximum 2 tasks with constraints allowed in demo mode' 
          };
        }
      }

      // Prepare constraint data for database
      const constraintData = {
        task_id: constraint.taskId,
        constraint_type: constraint.constraintType,
        constraint_date: constraint.constraintDate,
        constraint_reason: constraint.constraintReason || null,
        demo: isDemoMode,
        updated_at: new Date().toISOString()
      };

      // Check if constraint already exists
      const { data: existingConstraint } = await supabase
        .from('programme_tasks')
        .select('constraint_type, constraint_date, constraint_reason')
        .eq('id', constraint.taskId)
        .single();

      if (existingConstraint?.constraint_type) {
        // Update existing constraint
        const { error } = await supabase
          .from('programme_tasks')
          .update(constraintData)
          .eq('id', constraint.taskId);

        if (error) {
          console.error('Error updating constraint:', error);
          return { success: false, error: 'Failed to update constraint' };
        }
      } else {
        // Insert new constraint
        const { error } = await supabase
          .from('programme_tasks')
          .update(constraintData)
          .eq('id', constraint.taskId);

        if (error) {
          console.error('Error inserting constraint:', error);
          return { success: false, error: 'Failed to save constraint' };
        }
      }

      // Return the saved constraint
      const savedConstraint: TaskConstraint = {
        id: constraint.taskId,
        taskId: constraint.taskId,
        constraintType: constraint.constraintType,
        constraintDate: constraint.constraintDate,
        constraintReason: constraint.constraintReason,
        demo: isDemoMode,
        updatedAt: new Date()
      };

      console.log('Constraint saved:', savedConstraint);
      return { success: true, constraint: savedConstraint };
    } catch (error) {
      console.error('Error saving constraint:', error);
      return { success: false, error: 'Failed to save constraint' };
    }
  }

  /**
   * Get constraint for a specific task
   */
  async getTaskConstraint(taskId: string): Promise<TaskConstraint | null> {
    try {
      const { data, error } = await supabase
        .from('programme_tasks')
        .select('constraint_type, constraint_date, constraint_reason, demo')
        .eq('id', taskId)
        .single();

      if (error || !data) {
        return null;
      }

      if (!data.constraint_type || !data.constraint_date) {
        return null;
      }

      return {
        id: taskId,
        taskId,
        constraintType: data.constraint_type as ConstraintType,
        constraintDate: data.constraint_date,
        constraintReason: data.constraint_reason,
        demo: data.demo || false
      };
    } catch (error) {
      console.error('Error getting task constraint:', error);
      return null;
    }
  }

  /**
   * Clear constraint from a task
   */
  async clearTaskConstraint(taskId: string): Promise<ConstraintResult> {
    try {
      const { error } = await supabase
        .from('programme_tasks')
        .update({
          constraint_type: null,
          constraint_date: null,
          constraint_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error clearing constraint:', error);
        return { success: false, error: 'Failed to clear constraint' };
      }

      console.log('Constraint cleared for task:', taskId);
      return { success: true };
    } catch (error) {
      console.error('Error clearing constraint:', error);
      return { success: false, error: 'Failed to clear constraint' };
    }
  }

  /**
   * Get all constraints for a project
   */
  async getProjectConstraints(projectId: string): Promise<TaskConstraint[]> {
    try {
      const { data, error } = await supabase
        .from('programme_tasks')
        .select('id, constraint_type, constraint_date, constraint_reason, demo')
        .eq('project_id', projectId)
        .not('constraint_type', 'is', null);

      if (error) {
        console.error('Error getting project constraints:', error);
        return [];
      }

      return data
        .filter(task => task.constraint_type && task.constraint_date)
        .map(task => ({
          id: task.id,
          taskId: task.id,
          constraintType: task.constraint_type as ConstraintType,
          constraintDate: task.constraint_date,
          constraintReason: task.constraint_reason,
          demo: task.demo || false
        }));
    } catch (error) {
      console.error('Error getting project constraints:', error);
      return [];
    }
  }

  /**
   * Get constraint count for demo mode
   */
  async getConstraintCount(projectId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('programme_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .not('constraint_type', 'is', null);

      if (error) {
        console.error('Error getting constraint count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting constraint count:', error);
      return 0;
    }
  }

  /**
   * Check for constraint violations
   */
  async checkConstraintViolations(taskId: string): Promise<ConstraintViolation[]> {
    try {
      const constraint = await this.getTaskConstraint(taskId);
      if (!constraint) return [];

      const { data: task } = await supabase
        .from('programme_tasks')
        .select('start_date, end_date')
        .eq('id', taskId)
        .single();

      if (!task) return [];

      const violations: ConstraintViolation[] = [];
      const startDate = new Date(task.start_date);
      const endDate = new Date(task.end_date);
      const constraintDate = new Date(constraint.constraintDate);

      switch (constraint.constraintType) {
        case 'MSO':
          if (startDate.getTime() !== constraintDate.getTime()) {
            violations.push({
              taskId,
              constraintType: 'MSO',
              message: `Task must start on ${constraintDate.toLocaleDateString()}`,
              severity: 'error'
            });
          }
          break;

        case 'MFO':
          if (endDate.getTime() !== constraintDate.getTime()) {
            violations.push({
              taskId,
              constraintType: 'MFO',
              message: `Task must finish on ${constraintDate.toLocaleDateString()}`,
              severity: 'error'
            });
          }
          break;

        case 'SNET':
          if (startDate < constraintDate) {
            violations.push({
              taskId,
              constraintType: 'SNET',
              message: `Task cannot start before ${constraintDate.toLocaleDateString()}`,
              severity: 'error'
            });
          }
          break;

        case 'FNLT':
          if (endDate > constraintDate) {
            violations.push({
              taskId,
              constraintType: 'FNLT',
              message: `Task cannot finish after ${constraintDate.toLocaleDateString()}`,
              severity: 'error'
            });
          }
          break;
      }

      return violations;
    } catch (error) {
      console.error('Error checking constraint violations:', error);
      return [];
    }
  }

  /**
   * Enforce constraint logic on task dates
   */
  async enforceConstraintLogic(taskId: string): Promise<{ success: boolean; updatedDates?: { startDate?: string; endDate?: string } }> {
    try {
      const constraint = await this.getTaskConstraint(taskId);
      if (!constraint) return { success: true };

      const { data: task } = await supabase
        .from('programme_tasks')
        .select('start_date, end_date, duration')
        .eq('id', taskId)
        .single();

      if (!task) return { success: false };

      let startDate = new Date(task.start_date);
      let endDate = new Date(task.end_date);
      const constraintDate = new Date(constraint.constraintDate);
      const duration = task.duration || 1; // Default to 1 day if no duration
      let needsUpdate = false;

      switch (constraint.constraintType) {
        case 'MSO':
          if (startDate.getTime() !== constraintDate.getTime()) {
            startDate = new Date(constraintDate);
            endDate = new Date(constraintDate.getTime() + (duration - 1) * 24 * 60 * 60 * 1000);
            needsUpdate = true;
          }
          break;

        case 'MFO':
          if (endDate.getTime() !== constraintDate.getTime()) {
            endDate = new Date(constraintDate);
            startDate = new Date(constraintDate.getTime() - (duration - 1) * 24 * 60 * 60 * 1000);
            needsUpdate = true;
          }
          break;

        case 'SNET':
          if (startDate < constraintDate) {
            startDate = new Date(constraintDate);
            endDate = new Date(constraintDate.getTime() + (duration - 1) * 24 * 60 * 60 * 1000);
            needsUpdate = true;
          }
          break;



        case 'FNLT':
          if (endDate > constraintDate) {
            endDate = new Date(constraintDate);
            startDate = new Date(constraintDate.getTime() - (duration - 1) * 24 * 60 * 60 * 1000);
            needsUpdate = true;
          }
          break;
      }

      if (needsUpdate) {
        const { error } = await supabase
          .from('programme_tasks')
          .update({
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (error) {
          console.error('Error enforcing constraint:', error);
          return { success: false };
        }

        return {
          success: true,
          updatedDates: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          }
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error enforcing constraint logic:', error);
      return { success: false };
    }
  }

  /**
   * Get constraint type label
   */
  getConstraintTypeLabel(type: ConstraintType): string {
    const labels = {
      none: 'No Constraint',
      MSO: 'Must Start On',
      MFO: 'Must Finish On',
      SNET: 'Start No Earlier Than',
      FNLT: 'Finish No Later Than'
    };
    return labels[type] || type;
  }

  /**
   * Get constraint type description
   */
  getConstraintTypeDescription(type: ConstraintType): string {
    const descriptions = {
      none: 'No constraint applied',
      MSO: 'Task must start on the specified date',
      MFO: 'Task must finish on the specified date',
      SNET: 'Task cannot start before the specified date',
      FNLT: 'Task cannot finish after the specified date'
    };
    return descriptions[type] || '';
  }
}

export const taskConstraintService = new TaskConstraintService(); 