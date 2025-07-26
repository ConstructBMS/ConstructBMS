import { persistentStorage } from './persistentStorage';
import type { ValidationIssue } from '../components/modules/ribbonTabs/ValidationResultsModal';

export interface Task {
  assignedResource?: string;
  constraintDate?: string;
  constraintType?: string;
  demo?: boolean;
  duration?: number;
  endDate?: string;
  id: string;
  isSummary?: boolean;
  level?: number;
  name: string;
  predecessors?: string[];
  slack?: {
    free: number;
    total: number;
  };
  startDate?: string;
  successors?: string[];
}

export interface SlackCalculationResult {
  errors: string[];
  success: boolean;
  tasks: Task[];
}

export interface ConstraintClearResult {
  errors: string[];
  success: boolean;
  tasksCleared: number;
}

export interface ValidationResult {
  errors: string[];
  issues: ValidationIssue[];
  success: boolean;
}

export class SecondaryToolsService {
  /**
   * Recalculate slack for all tasks
   */
  static async recalculateSlack(projectId: string = 'default'): Promise<SlackCalculationResult> {
    try {
      const tasks = await this.getTasks(projectId);
      const updatedTasks = [...tasks];
      const errors: string[] = [];

      // Calculate slack for each task
      for (const task of updatedTasks) {
        try {
          const slack = this.calculateTaskSlack(task, updatedTasks);
          task.slack = slack;
          task.demo = true; // Mark as demo data
        } catch (error) {
          errors.push(`Failed to calculate slack for task "${task.name}": ${error}`);
        }
      }

      // Save updated tasks
      const success = await this.saveTasks(updatedTasks, projectId);
      
      if (success) {
        console.log('Demo slack recalculation completed for', updatedTasks.length, 'tasks');
      }

      return {
        success,
        tasks: updatedTasks,
        errors
      };
    } catch (error) {
      console.error('Failed to recalculate slack:', error);
      return {
        success: false,
        tasks: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Clear constraints from tasks
   */
  static async clearConstraints(
    taskIds?: string[], 
    projectId: string = 'default'
  ): Promise<ConstraintClearResult> {
    try {
      const tasks = await this.getTasks(projectId);
      const updatedTasks = [...tasks];
      const errors: string[] = [];
      let tasksCleared = 0;

      // Determine which tasks to clear constraints from
      const tasksToClear = taskIds 
        ? updatedTasks.filter(task => taskIds.includes(task.id))
        : updatedTasks;

      // Clear constraints from selected tasks
      for (const task of tasksToClear) {
        if (task.constraintType || task.constraintDate) {
          delete task.constraintType;
          delete task.constraintDate;
          task.demo = true; // Mark as demo data
          tasksCleared++;
        }
      }

      // Save updated tasks
      const success = await this.saveTasks(updatedTasks, projectId);
      
      if (success) {
        console.log('Demo constraints cleared from', tasksCleared, 'tasks');
      }

      return {
        success,
        tasksCleared,
        errors
      };
    } catch (error) {
      console.error('Failed to clear constraints:', error);
      return {
        success: false,
        tasksCleared: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Validate project logic
   */
  static async validateLogic(projectId: string = 'default'): Promise<ValidationResult> {
    try {
      const tasks = await this.getTasks(projectId);
      const issues: ValidationIssue[] = [];
      const errors: string[] = [];

      // Check for circular dependencies
      const circularDeps = this.detectCircularDependencies(tasks);
      issues.push(...circularDeps);

      // Check for tasks without successors
      const noSuccessors = this.detectTasksWithoutSuccessors(tasks);
      issues.push(...noSuccessors);

      // Check for overlapping tasks within same resource
      const overlappingTasks = this.detectOverlappingTasks(tasks);
      issues.push(...overlappingTasks);

      // Check for invalid constraints
      const invalidConstraints = this.detectInvalidConstraints(tasks);
      issues.push(...invalidConstraints);

      // Check for missing predecessors
      const missingPredecessors = this.detectMissingPredecessors(tasks);
      issues.push(...missingPredecessors);

      console.log('Demo logic validation completed:', issues.length, 'issues found');

      return {
        success: true,
        issues,
        errors
      };
    } catch (error) {
      console.error('Failed to validate logic:', error);
      return {
        success: false,
        issues: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Auto-fix validation issues
   */
  static async autoFixIssues(
    issueIds: string[], 
    projectId: string = 'default'
  ): Promise<{ errors: string[], fixedCount: number; success: boolean; }> {
    try {
      const tasks = await this.getTasks(projectId);
      const updatedTasks = [...tasks];
      const errors: string[] = [];
      let fixedCount = 0;

      // Get validation issues to know what to fix
      const validationResult = await this.validateLogic(projectId);
      const issuesToFix = validationResult.issues.filter(issue => 
        issueIds.includes(issue.taskId) && issue.fixable
      );

             for (const issue of issuesToFix) {
         try {
           const task = updatedTasks.find(t => t.id === issue.taskId);
           if (task) {
             // Apply fixes based on issue type
             if (issue.issue.includes('missing successor')) {
               // Add a default successor if possible
               const availableTasks = updatedTasks.filter(t => 
                 t.id !== task.id && !task.successors?.includes(t.id)
               );
               if (availableTasks.length > 0) {
                 task.successors = task.successors || [];
                 task.successors.push(availableTasks[0]?.id || '');
                 fixedCount++;
               }
             } else if (issue.issue.includes('invalid constraint')) {
               // Clear invalid constraints
               delete task.constraintType;
               delete task.constraintDate;
               fixedCount++;
             }
             
             task.demo = true; // Mark as demo data
           }
         } catch (error) {
           errors.push(`Failed to fix issue for task "${issue.taskName}": ${error}`);
         }
       }

      // Save updated tasks
      const success = await this.saveTasks(updatedTasks, projectId);
      
      if (success) {
        console.log('Demo auto-fix completed:', fixedCount, 'issues fixed');
      }

      return {
        success,
        fixedCount,
        errors
      };
    } catch (error) {
      console.error('Failed to auto-fix issues:', error);
      return {
        success: false,
        fixedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Calculate slack for a single task
   */
  private static calculateTaskSlack(task: Task, allTasks: Task[]): { free: number, total: number; } {
    // Simple slack calculation (in a real implementation, this would be more complex)
    const totalSlack = Math.max(0, (task.duration || 0) * 0.2); // 20% of duration as total slack
    const freeSlack = Math.max(0, totalSlack * 0.5); // 50% of total slack as free slack
    
    return {
      total: Math.round(totalSlack * 100) / 100,
      free: Math.round(freeSlack * 100) / 100
    };
  }

  /**
   * Detect circular dependencies
   */
  private static detectCircularDependencies(tasks: Task[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Simple circular dependency detection
    for (const task of tasks) {
      if (task.predecessors && task.successors) {
        const hasCircular = task.predecessors.some(predId => 
          task.successors?.includes(predId)
        );
        
        if (hasCircular) {
          issues.push({
            taskId: task.id,
            taskName: task.name,
            issue: 'Task has circular dependency (predecessor is also successor)',
            fixable: true,
            severity: 'error',
            suggestedFix: 'Remove the circular dependency by editing task relationships'
          });
        }
      }
    }
    
    return issues;
  }

  /**
   * Detect tasks without successors
   */
  private static detectTasksWithoutSuccessors(tasks: Task[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    for (const task of tasks) {
      if (!task.isSummary && (!task.successors || task.successors.length === 0)) {
        issues.push({
          taskId: task.id,
          taskName: task.name,
          issue: 'Task has no successors (may be disconnected from project)',
          fixable: true,
          severity: 'warning',
          suggestedFix: 'Add successor tasks or mark as project end task'
        });
      }
    }
    
    return issues;
  }

  /**
   * Detect overlapping tasks within same resource
   */
  private static detectOverlappingTasks(tasks: Task[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Group tasks by resource
    const tasksByResource = new Map<string, Task[]>();
    for (const task of tasks) {
      if (task.assignedResource) {
        const resourceTasks = tasksByResource.get(task.assignedResource) || [];
        resourceTasks.push(task);
        tasksByResource.set(task.assignedResource, resourceTasks);
      }
    }
    
    // Check for overlaps within each resource
    for (const [resource, resourceTasks] of tasksByResource) {
      for (let i = 0; i < resourceTasks.length; i++) {
        for (let j = i + 1; j < resourceTasks.length; j++) {
          const task1 = resourceTasks[i];
          const task2 = resourceTasks[j];
          
          if (task1.startDate && task1.endDate && task2.startDate && task2.endDate) {
            const start1 = new Date(task1.startDate);
            const end1 = new Date(task1.endDate);
            const start2 = new Date(task2.startDate);
            const end2 = new Date(task2.endDate);
            
            if (start1 < end2 && start2 < end1) {
              issues.push({
                taskId: task1.id,
                taskName: task1.name,
                issue: `Task overlaps with "${task2.name}" (both assigned to ${resource})`,
                fixable: false,
                severity: 'warning',
                suggestedFix: 'Adjust task dates or reassign resources to avoid overlap'
              });
            }
          }
        }
      }
    }
    
    return issues;
  }

  /**
   * Detect invalid constraints
   */
  private static detectInvalidConstraints(tasks: Task[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    for (const task of tasks) {
      if (task.constraintType && !task.constraintDate) {
        issues.push({
          taskId: task.id,
          taskName: task.name,
          issue: 'Task has constraint type but no constraint date',
          fixable: true,
          severity: 'error',
          suggestedFix: 'Add constraint date or remove constraint type'
        });
      }
      
      if (task.constraintDate && !task.constraintType) {
        issues.push({
          taskId: task.id,
          taskName: task.name,
          issue: 'Task has constraint date but no constraint type',
          fixable: true,
          severity: 'error',
          suggestedFix: 'Add constraint type or remove constraint date'
        });
      }
    }
    
    return issues;
  }

  /**
   * Detect missing predecessors
   */
  private static detectMissingPredecessors(tasks: Task[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    for (const task of tasks) {
      if (!task.isSummary && (!task.predecessors || task.predecessors.length === 0)) {
        issues.push({
          taskId: task.id,
          taskName: task.name,
          issue: 'Task has no predecessors (may be disconnected from project)',
          fixable: true,
          severity: 'info',
          suggestedFix: 'Add predecessor tasks or mark as project start task'
        });
      }
    }
    
    return issues;
  }

  /**
   * Get tasks from storage
   */
  private static async getTasks(projectId: string): Promise<Task[]> {
    try {
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks');
      return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  }

  /**
   * Save tasks to storage
   */
  private static async saveTasks(tasks: Task[], projectId: string): Promise<boolean> {
    try {
      await persistentStorage.setSetting(`tasks_${projectId}`, tasks, 'tasks');
      return true;
    } catch (error) {
      console.error('Failed to save tasks:', error);
      return false;
    }
  }
} 