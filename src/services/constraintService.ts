import { persistentStorage } from './persistentStorage';
import type { ConstraintType, TaskConstraint } from '../components/modules/ribbonTabs/SetConstraintModal';
import type { ConstrainedTask } from '../components/modules/ribbonTabs/ConstraintReportModal';

export interface ConstraintResult {
  success: boolean;
  data?: any;
  errors: string[];
}

export interface ConstraintApplicationResult {
  success: boolean;
  tasksUpdated: number;
  errors: string[];
}

export class ConstraintService {
  /**
   * Apply constraint to tasks
   */
  static async applyConstraintToTasks(
    taskIds: string[],
    constraint: TaskConstraint,
    projectId: string = 'demo'
  ): Promise<ConstraintApplicationResult> {
    try {
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const updatedTasks = [...tasks];
      let tasksUpdated = 0;

      for (const task of updatedTasks) {
        if (taskIds.includes(task.id)) {
          task.constraintType = constraint.type;
          task.constraintDate = constraint.date;
          task.demo = constraint.demo;
          tasksUpdated++;
        }
      }

      await persistentStorage.setSetting(`tasks_${projectId}`, updatedTasks, 'tasks');
      
      if (projectId.includes('demo')) {
        console.log('Demo constraint applied to', tasksUpdated, 'tasks:', constraint);
      }

      return {
        success: true,
        tasksUpdated,
        errors: []
      };
    } catch (error) {
      console.error('Failed to apply constraint to tasks:', error);
      return {
        success: false,
        tasksUpdated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Clear constraint from tasks
   */
  static async clearConstraintFromTasks(
    taskIds: string[],
    projectId: string = 'demo'
  ): Promise<ConstraintApplicationResult> {
    try {
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const updatedTasks = [...tasks];
      let tasksUpdated = 0;

      for (const task of updatedTasks) {
        if (taskIds.includes(task.id)) {
          delete task.constraintType;
          delete task.constraintDate;
          task.demo = projectId.includes('demo');
          tasksUpdated++;
        }
      }

      await persistentStorage.setSetting(`tasks_${projectId}`, updatedTasks, 'tasks');
      
      if (projectId.includes('demo')) {
        console.log('Demo constraints cleared from', tasksUpdated, 'tasks');
      }

      return {
        success: true,
        tasksUpdated,
        errors: []
      };
    } catch (error) {
      console.error('Failed to clear constraint from tasks:', error);
      return {
        success: false,
        tasksUpdated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get all constrained tasks
   */
  static async getAllConstrainedTasks(projectId: string = 'demo'): Promise<ConstrainedTask[]> {
    try {
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const constrainedTasks: ConstrainedTask[] = [];

      for (const task of tasks) {
        if (task.constraintType && task.constraintDate) {
          // Determine if constraint is influencing the task
          const isInfluenced = this.isConstraintInfluencing(task);
          
          constrainedTasks.push({
            id: task.id,
            name: task.name || `Task ${task.id}`,
            constraintType: task.constraintType,
            constraintDate: task.constraintDate,
            startDate: task.startDate,
            finishDate: task.finishDate,
            isInfluenced,
            demo: task.demo
          });
        }
      }

      return constrainedTasks;
    } catch (error) {
      console.error('Failed to get constrained tasks:', error);
      return [];
    }
  }

  /**
   * Check if a constraint is influencing a task
   */
  static isConstraintInfluencing(task: any): boolean {
    if (!task.constraintType || !task.constraintDate || !task.startDate || !task.finishDate) {
      return false;
    }

    const constraintDate = new Date(task.constraintDate);
    const startDate = new Date(task.startDate);
    const finishDate = new Date(task.finishDate);

    switch (task.constraintType) {
      case 'SNET': // Start No Earlier Than
        return startDate.getTime() === constraintDate.getTime();
      
      case 'SNLT': // Start No Later Than
        return startDate.getTime() === constraintDate.getTime();
      
      case 'FNET': // Finish No Earlier Than
        return finishDate.getTime() === constraintDate.getTime();
      
      case 'FNLT': // Finish No Later Than
        return finishDate.getTime() === constraintDate.getTime();
      
      case 'MSO': // Must Start On
        return startDate.getTime() === constraintDate.getTime();
      
      case 'MFO': // Must Finish On
        return finishDate.getTime() === constraintDate.getTime();
      
      default:
        return false;
    }
  }

  /**
   * Get constraint statistics
   */
  static async getConstraintStatistics(projectId: string = 'demo'): Promise<{
    totalConstraints: number;
    byType: Record<ConstraintType, number>;
    influencedCount: number;
    demoCount: number;
  }> {
    try {
      const constrainedTasks = await this.getAllConstrainedTasks(projectId);
      
      const byType: Record<ConstraintType, number> = {
        SNET: 0,
        SNLT: 0,
        FNET: 0,
        FNLT: 0,
        MSO: 0,
        MFO: 0
      };

      let influencedCount = 0;
      let demoCount = 0;

      for (const task of constrainedTasks) {
        byType[task.constraintType]++;
        if (task.isInfluenced) influencedCount++;
        if (task.demo) demoCount++;
      }

      return {
        totalConstraints: constrainedTasks.length,
        byType,
        influencedCount,
        demoCount
      };
    } catch (error) {
      console.error('Failed to get constraint statistics:', error);
      return {
        totalConstraints: 0,
        byType: {
          SNET: 0,
          SNLT: 0,
          FNET: 0,
          FNLT: 0,
          MSO: 0,
          MFO: 0
        },
        influencedCount: 0,
        demoCount: 0
      };
    }
  }

  /**
   * Validate constraint data
   */
  static validateConstraint(constraint: TaskConstraint): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!constraint.type) {
      errors.push('Constraint type is required');
    }
    
    if (!constraint.date) {
      errors.push('Constraint date is required');
    } else {
      const date = new Date(constraint.date);
      if (isNaN(date.getTime())) {
        errors.push('Invalid constraint date');
      }
    }
    
    const validTypes: ConstraintType[] = ['SNET', 'SNLT', 'FNET', 'FNLT', 'MSO', 'MFO'];
    if (!validTypes.includes(constraint.type)) {
      errors.push('Invalid constraint type');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get constraint type description
   */
  static getConstraintTypeDescription(type: ConstraintType): string {
    const descriptions = {
      SNET: 'Start No Earlier Than - Task cannot start before the specified date',
      SNLT: 'Start No Later Than - Task cannot start after the specified date',
      FNET: 'Finish No Earlier Than - Task cannot finish before the specified date',
      FNLT: 'Finish No Later Than - Task cannot finish after the specified date',
      MSO: 'Must Start On - Task must start on the specified date',
      MFO: 'Must Finish On - Task must finish on the specified date'
    };
    return descriptions[type];
  }

  /**
   * Get constraint type label
   */
  static getConstraintTypeLabel(type: ConstraintType): string {
    const labels = {
      SNET: 'Start No Earlier Than',
      SNLT: 'Start No Later Than',
      FNET: 'Finish No Earlier Than',
      FNLT: 'Finish No Later Than',
      MSO: 'Must Start On',
      MFO: 'Must Finish On'
    };
    return labels[type];
  }

  /**
   * Reschedule tasks based on constraints
   */
  static async rescheduleTasksWithConstraints(projectId: string = 'demo'): Promise<ConstraintApplicationResult> {
    try {
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const updatedTasks = [...tasks];
      let tasksUpdated = 0;

      for (const task of updatedTasks) {
        if (task.constraintType && task.constraintDate) {
          // Apply constraint logic to reschedule task
          const rescheduled = this.applyConstraintLogic(task);
          if (rescheduled) {
            task.demo = projectId.includes('demo');
            tasksUpdated++;
          }
        }
      }

      await persistentStorage.setSetting(`tasks_${projectId}`, updatedTasks, 'tasks');
      
      if (projectId.includes('demo')) {
        console.log('Demo tasks rescheduled with constraints:', tasksUpdated, 'tasks updated');
      }

      return {
        success: true,
        tasksUpdated,
        errors: []
      };
    } catch (error) {
      console.error('Failed to reschedule tasks with constraints:', error);
      return {
        success: false,
        tasksUpdated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Apply constraint logic to a task
   */
  private static applyConstraintLogic(task: any): boolean {
    if (!task.constraintType || !task.constraintDate) {
      return false;
    }

    const constraintDate = new Date(task.constraintDate);
    let modified = false;

    switch (task.constraintType) {
      case 'SNET': // Start No Earlier Than
        if (task.startDate && new Date(task.startDate) < constraintDate) {
          task.startDate = constraintDate.toISOString().split('T')[0];
          modified = true;
        }
        break;
      
      case 'SNLT': // Start No Later Than
        if (task.startDate && new Date(task.startDate) > constraintDate) {
          task.startDate = constraintDate.toISOString().split('T')[0];
          modified = true;
        }
        break;
      
      case 'FNET': // Finish No Earlier Than
        if (task.finishDate && new Date(task.finishDate) < constraintDate) {
          task.finishDate = constraintDate.toISOString().split('T')[0];
          modified = true;
        }
        break;
      
      case 'FNLT': // Finish No Later Than
        if (task.finishDate && new Date(task.finishDate) > constraintDate) {
          task.finishDate = constraintDate.toISOString().split('T')[0];
          modified = true;
        }
        break;
      
      case 'MSO': // Must Start On
        if (task.startDate && new Date(task.startDate).getTime() !== constraintDate.getTime()) {
          task.startDate = constraintDate.toISOString().split('T')[0];
          modified = true;
        }
        break;
      
      case 'MFO': // Must Finish On
        if (task.finishDate && new Date(task.finishDate).getTime() !== constraintDate.getTime()) {
          task.finishDate = constraintDate.toISOString().split('T')[0];
          modified = true;
        }
        break;
    }

    return modified;
  }

  /**
   * Clear all demo constraints
   */
  static async clearDemoConstraints(projectId: string = 'demo'): Promise<ConstraintApplicationResult> {
    try {
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const updatedTasks = [...tasks];
      let tasksUpdated = 0;

      for (const task of updatedTasks) {
        if (task.demo && (task.constraintType || task.constraintDate)) {
          delete task.constraintType;
          delete task.constraintDate;
          tasksUpdated++;
        }
      }

      await persistentStorage.setSetting(`tasks_${projectId}`, updatedTasks, 'tasks');
      
      console.log('Demo constraints cleared:', tasksUpdated, 'tasks updated');

      return {
        success: true,
        tasksUpdated,
        errors: []
      };
    } catch (error) {
      console.error('Failed to clear demo constraints:', error);
      return {
        success: false,
        tasksUpdated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Export constraint data
   */
  static async exportConstraintData(projectId: string = 'demo'): Promise<{
    constrainedTasks: ConstrainedTask[];
    statistics: any;
    exportDate: string;
  }> {
    try {
      const constrainedTasks = await this.getAllConstrainedTasks(projectId);
      const statistics = await this.getConstraintStatistics(projectId);

      return {
        constrainedTasks,
        statistics,
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to export constraint data:', error);
      return {
        constrainedTasks: [],
        statistics: {
          totalConstraints: 0,
          byType: {
            SNET: 0,
            SNLT: 0,
            FNET: 0,
            FNLT: 0,
            MSO: 0,
            MFO: 0
          },
          influencedCount: 0,
          demoCount: 0
        },
        exportDate: new Date().toISOString()
      };
    }
  }
} 