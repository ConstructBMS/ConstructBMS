import { persistentStorage } from './persistentStorage';
import { demoModeService } from './demoModeService';
import { taskService } from './taskService';

export interface TaskConstraint {
  constraintDate: Date;
  createdAt: Date;
  demo?: boolean;
  id: string;
  taskId: string;
  type: 'SNET' | 'FNLT' | 'MSO' | 'MFO' | 'ASAP';
  userId: string;
}

export interface ConstraintViolation {
  isViolated: boolean;
  message: string;
  severity: 'warning' | 'error';
}

export interface ConstraintValidation {
  isValid: boolean;
  suggestedDates?: {
    endDate?: Date;
    startDate?: Date;
  };
  violations: ConstraintViolation[];
}

class ConstraintsService {
  private readonly constraintsKey = 'task_constraints';

  /**
   * Set a constraint for a task
   */
  async setConstraint(
    taskId: string,
    type: 'SNET' | 'FNLT' | 'MSO' | 'MFO' | 'ASAP',
    constraintDate: Date
  ): Promise<{ constraint?: TaskConstraint, error?: string; success: boolean; }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      // Check demo mode restrictions
      if (isDemoMode) {
        const constraintCount = await this.getConstraintCount();
        if (constraintCount >= 3) {
          return { success: false, error: 'Maximum 3 tasks with constraints allowed in demo mode' };
        }

        const taskConstraintCount = await this.getTaskConstraintCount(taskId);
        if (taskConstraintCount >= 1) {
          return { success: false, error: 'Only one constraint per task allowed in demo mode' };
        }
      }

      // Remove existing constraint for this task
      await this.removeConstraint(taskId);

      // Create new constraint
      const constraint: TaskConstraint = {
        id: `constraint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        taskId,
        type,
        constraintDate: new Date(constraintDate),
        userId: 'current-user', // This should come from auth context
        createdAt: new Date(),
        demo: isDemoMode
      };

      // Save to storage
      const constraints = await this.getAllConstraints();
      constraints.push(constraint);
      await persistentStorage.set(this.constraintsKey, constraints);

      // Enforce constraint logic
      await this.enforceConstraintLogic(constraint);

      console.log('Constraint set:', taskId, type, constraintDate);
      return { success: true, constraint };
    } catch (error) {
      console.error('Error setting constraint:', error);
      return { success: false, error: 'Failed to set constraint' };
    }
  }

  /**
   * Remove constraint for a task
   */
  async removeConstraint(taskId: string): Promise<{ error?: string, success: boolean; }> {
    try {
      const constraints = await this.getAllConstraints();
      const filteredConstraints = constraints.filter(c => c.taskId !== taskId);
      
      if (filteredConstraints.length === constraints.length) {
        return { success: false, error: 'No constraint found for this task' };
      }

      await persistentStorage.set(this.constraintsKey, filteredConstraints);
      console.log('Constraint removed for task:', taskId);
      return { success: true };
    } catch (error) {
      console.error('Error removing constraint:', error);
      return { success: false, error: 'Failed to remove constraint' };
    }
  }

  /**
   * Get constraint for a task
   */
  async getTaskConstraint(taskId: string): Promise<TaskConstraint | null> {
    try {
      const constraints = await this.getAllConstraints();
      return constraints.find(c => c.taskId === taskId) || null;
    } catch (error) {
      console.error('Error getting task constraint:', error);
      return null;
    }
  }

  /**
   * Get all constraints
   */
  async getAllTaskConstraints(): Promise<TaskConstraint[]> {
    try {
      const constraints = await this.getAllConstraints();
      return constraints;
    } catch (error) {
      console.error('Error getting all constraints:', error);
      return [];
    }
  }

  /**
   * Validate task dates against constraints
   */
  async validateTaskDates(
    taskId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ConstraintValidation> {
    try {
      const constraint = await this.getTaskConstraint(taskId);
      const violations: ConstraintViolation[] = [];

      if (!constraint) {
        return { isValid: true, violations: [] };
      }

      const isDemoMode = await demoModeService.isDemoMode();

      switch (constraint.type) {
        case 'SNET': // Start No Earlier Than
          if (startDate < constraint.constraintDate) {
            violations.push({
              isViolated: true,
              message: `Task cannot start before ${constraint.constraintDate.toLocaleDateString()}`,
              severity: isDemoMode ? 'warning' : 'error'
            });
          }
          break;

        case 'FNLT': // Finish No Later Than
          if (endDate > constraint.constraintDate) {
            violations.push({
              isViolated: true,
              message: `Task cannot finish after ${constraint.constraintDate.toLocaleDateString()}`,
              severity: isDemoMode ? 'warning' : 'error'
            });
          }
          break;

        case 'MSO': // Must Start On
          if (startDate.getTime() !== constraint.constraintDate.getTime()) {
            violations.push({
              isViolated: true,
              message: `Task must start on ${constraint.constraintDate.toLocaleDateString()}`,
              severity: isDemoMode ? 'warning' : 'error'
            });
          }
          break;

        case 'MFO': // Must Finish On
          if (endDate.getTime() !== constraint.constraintDate.getTime()) {
            violations.push({
              isViolated: true,
              message: `Task must finish on ${constraint.constraintDate.toLocaleDateString()}`,
              severity: isDemoMode ? 'warning' : 'error'
            });
          }
          break;

        case 'ASAP': // As Soon As Possible
          // No validation needed for ASAP
          break;
      }

      const isValid = violations.length === 0 || (isDemoMode && violations.every(v => v.severity === 'warning'));

      return {
        isValid,
        violations,
        suggestedDates: violations.length > 0 ? this.getSuggestedDates(constraint, startDate, endDate) : undefined
      };
    } catch (error) {
      console.error('Error validating task dates:', error);
      return { isValid: true, violations: [] };
    }
  }

  /**
   * Enforce constraint logic when constraint is set
   */
  async enforceConstraintLogic(constraint: TaskConstraint): Promise<void> {
    try {
      const task = await taskService.getTask(constraint.taskId);
      if (!task) return;

      let newStartDate: Date | null = null;
      let newEndDate: Date | null = null;

      switch (constraint.type) {
        case 'SNET': // Start No Earlier Than
          if (task.startDate < constraint.constraintDate) {
            newStartDate = new Date(constraint.constraintDate);
            const duration = task.endDate.getTime() - task.startDate.getTime();
            newEndDate = new Date(newStartDate.getTime() + duration);
          }
          break;

        case 'FNLT': // Finish No Later Than
          if (task.endDate > constraint.constraintDate) {
            newEndDate = new Date(constraint.constraintDate);
            const duration = task.endDate.getTime() - task.startDate.getTime();
            newStartDate = new Date(newEndDate.getTime() - duration);
          }
          break;

        case 'MSO': // Must Start On
          if (task.startDate.getTime() !== constraint.constraintDate.getTime()) {
            newStartDate = new Date(constraint.constraintDate);
            const duration = task.endDate.getTime() - task.startDate.getTime();
            newEndDate = new Date(newStartDate.getTime() + duration);
          }
          break;

        case 'MFO': // Must Finish On
          if (task.endDate.getTime() !== constraint.constraintDate.getTime()) {
            newEndDate = new Date(constraint.constraintDate);
            const duration = task.endDate.getTime() - task.startDate.getTime();
            newStartDate = new Date(newEndDate.getTime() - duration);
          }
          break;

        case 'ASAP': // As Soon As Possible
          // No enforcement needed for ASAP
          break;
      }

      // Update task if needed
      if (newStartDate && newEndDate) {
        await taskService.updateTask(constraint.taskId, {
          startDate: newStartDate,
          endDate: newEndDate,
          demo: constraint.demo
        });
        console.log('Constraint logic enforced for task:', constraint.taskId);
      }
    } catch (error) {
      console.error('Error enforcing constraint logic:', error);
    }
  }

  /**
   * Get suggested dates to resolve constraint violations
   */
  private getSuggestedDates(
    constraint: TaskConstraint,
    currentStartDate: Date,
    currentEndDate: Date
  ): { endDate?: Date, startDate?: Date; } {
    const duration = currentEndDate.getTime() - currentStartDate.getTime();

    switch (constraint.type) {
      case 'SNET':
        return {
          startDate: new Date(constraint.constraintDate),
          endDate: new Date(constraint.constraintDate.getTime() + duration)
        };

      case 'FNLT':
        return {
          startDate: new Date(constraint.constraintDate.getTime() - duration),
          endDate: new Date(constraint.constraintDate)
        };

      case 'MSO':
        return {
          startDate: new Date(constraint.constraintDate),
          endDate: new Date(constraint.constraintDate.getTime() + duration)
        };

      case 'MFO':
        return {
          startDate: new Date(constraint.constraintDate.getTime() - duration),
          endDate: new Date(constraint.constraintDate)
        };

      default:
        return {};
    }
  }

  /**
   * Check if task has constraint violations
   */
  async hasConstraintViolations(taskId: string): Promise<boolean> {
    try {
      const task = await taskService.getTask(taskId);
      if (!task) return false;

      const validation = await this.validateTaskDates(taskId, task.startDate, task.endDate);
      return !validation.isValid;
    } catch (error) {
      console.error('Error checking constraint violations:', error);
      return false;
    }
  }

  /**
   * Get constraint count for demo mode
   */
  async getConstraintCount(): Promise<number> {
    try {
      const constraints = await this.getAllConstraints();
      return constraints.length;
    } catch (error) {
      console.error('Error getting constraint count:', error);
      return 0;
    }
  }

  /**
   * Get constraint count for a specific task
   */
  async getTaskConstraintCount(taskId: string): Promise<number> {
    try {
      const constraints = await this.getAllConstraints();
      return constraints.filter(c => c.taskId === taskId).length;
    } catch (error) {
      console.error('Error getting task constraint count:', error);
      return 0;
    }
  }

  /**
   * Get constraint type display name
   */
  getConstraintTypeName(type: 'SNET' | 'FNLT' | 'MSO' | 'MFO' | 'ASAP'): string {
    switch (type) {
      case 'SNET': return 'Start No Earlier Than';
      case 'FNLT': return 'Finish No Later Than';
      case 'MSO': return 'Must Start On';
      case 'MFO': return 'Must Finish On';
      case 'ASAP': return 'As Soon As Possible';
      default: return 'Unknown';
    }
  }

  /**
   * Get constraint type description
   */
  getConstraintTypeDescription(type: 'SNET' | 'FNLT' | 'MSO' | 'MFO' | 'ASAP'): string {
    switch (type) {
      case 'SNET': return 'Task cannot start before the specified date';
      case 'FNLT': return 'Task cannot finish after the specified date';
      case 'MSO': return 'Task must start exactly on the specified date';
      case 'MFO': return 'Task must finish exactly on the specified date';
      case 'ASAP': return 'Task should start as soon as possible after predecessors';
      default: return 'Unknown constraint type';
    }
  }

  /**
   * Get constraint icon
   */
  getConstraintIcon(type: 'SNET' | 'FNLT' | 'MSO' | 'MFO' | 'ASAP'): string {
    switch (type) {
      case 'SNET': return '📅';
      case 'FNLT': return '⏰';
      case 'MSO': return '📌';
      case 'MFO': return '🎯';
      case 'ASAP': return '⚡';
      default: return '❓';
    }
  }

  /**
   * Get all constraints from storage
   */
  private async getAllConstraints(): Promise<TaskConstraint[]> {
    try {
      const constraints = await persistentStorage.get(this.constraintsKey);
      return constraints || [];
    } catch (error) {
      console.error('Error getting all constraints:', error);
      return [];
    }
  }

  /**
   * Clear all constraint data (for demo mode reset)
   */
  async clearAllConstraintData(): Promise<void> {
    try {
      await persistentStorage.remove(this.constraintsKey);
      console.log('All constraint data cleared');
    } catch (error) {
      console.error('Error clearing constraint data:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      if (isDemoMode) {
        await this.clearAllConstraintData();
        console.log('Demo constraint data reset');
      }
    } catch (error) {
      console.error('Error resetting demo constraint data:', error);
      throw error;
    }
  }
}

export const constraintsService = new ConstraintsService(); 