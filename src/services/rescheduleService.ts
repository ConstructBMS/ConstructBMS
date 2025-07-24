import type { TaskData } from '../components/modules/ribbonTabs/TaskEditModal';
import type { TaskDependency } from '../components/modules/ribbonTabs/LagTimeModal';

export interface RescheduleResult {
  errors: string[];
  success: boolean;
  updatedTasks: TaskData[];
  warnings: string[];
}

export interface TaskConstraint {
  date: Date;
  type: 'start_no_earlier_than' | 'must_finish_on' | 'start_no_later_than' | 'must_start_on';
}

export class RescheduleService {
  /**
   * Reschedule the entire programme or selected tasks
   */
  static async rescheduleProgramme(
    tasks: TaskData[], 
    selectedTaskIds?: string[]
  ): Promise<RescheduleResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const updatedTasks = [...tasks];

    try {
      // Check for circular dependencies
      const circularDeps = this.detectCircularDependencies(updatedTasks);
      if (circularDeps.length > 0) {
        errors.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
        return {
          success: false,
          updatedTasks,
          errors,
          warnings
        };
      }

      // Determine which tasks to reschedule
      const tasksToReschedule = selectedTaskIds 
        ? updatedTasks.filter(task => selectedTaskIds.includes(task.id))
        : updatedTasks;

      if (tasksToReschedule.length === 0) {
        warnings.push('No tasks selected for rescheduling');
        return {
          success: true,
          updatedTasks,
          errors,
          warnings
        };
      }

      // Sort tasks by dependencies (topological sort)
      const sortedTasks = this.topologicalSort(updatedTasks);
      
      // Reschedule tasks in dependency order
      for (const task of sortedTasks) {
        if (tasksToReschedule.some(t => t.id === task.id)) {
          const result = this.rescheduleTask(task, updatedTasks);
          if (!result.success) {
            errors.push(`Failed to reschedule task "${task.name}": ${result.error}`);
          }
        }
      }

      // Update task dates based on dependencies
      this.updateTaskDates(updatedTasks);

      // Log demo data changes
      const demoTasks = updatedTasks.filter(task => task.demo);
      if (demoTasks.length > 0) {
        console.log('Demo tasks rescheduled:', demoTasks.map(t => t.id));
      }

      return {
        success: errors.length === 0,
        updatedTasks,
        errors,
        warnings
      };

    } catch (error) {
      errors.push(`Rescheduling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        updatedTasks,
        errors,
        warnings
      };
    }
  }

  /**
   * Reschedule a single task
   */
  private static rescheduleTask(task: TaskData, allTasks: TaskData[]): { error?: string, success: boolean; } {
    try {
      // Get predecessor tasks
      const predecessors = this.getPredecessorTasks(task, allTasks);
      
      if (predecessors.length === 0) {
        // No predecessors, task can start at its current start date
        return { success: true };
      }

      // Find the latest finish date among predecessors
      let latestPredecessorFinish = new Date(0);
      
      for (const pred of predecessors) {
        const predFinishDate = new Date(pred.endDate);
        if (predFinishDate > latestPredecessorFinish) {
          latestPredecessorFinish = predFinishDate;
        }
      }

      // Check constraints
      const constraints = this.getTaskConstraints(task);
      let newStartDate = latestPredecessorFinish;

      // Apply constraints
      for (const constraint of constraints) {
        switch (constraint.type) {
          case 'start_no_earlier_than':
            if (constraint.date > newStartDate) {
              newStartDate = constraint.date;
            }
            break;
          case 'must_start_on':
            newStartDate = constraint.date;
            break;
          case 'start_no_later_than':
            if (constraint.date < newStartDate) {
              return { 
                success: false, 
                error: `Task "${task.name}" cannot start before ${constraint.date.toDateString()} due to constraint` 
              };
            }
            break;
        }
      }

      // Calculate new end date
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + task.duration);

      // Check finish constraints
      for (const constraint of constraints) {
        if (constraint.type === 'must_finish_on' && constraint.date < newEndDate) {
          return { 
            success: false, 
            error: `Task "${task.name}" cannot finish by ${constraint.date.toDateString()} due to duration` 
          };
        }
      }

      // Update task dates
      task.startDate = newStartDate;
      task.endDate = newEndDate;

      return { success: true };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update all task dates based on dependencies
   */
  private static updateTaskDates(tasks: TaskData[]): void {
    const sortedTasks = this.topologicalSort(tasks);
    
    for (const task of sortedTasks) {
      this.rescheduleTask(task, tasks);
    }
  }

  /**
   * Get predecessor tasks for a given task
   */
  private static getPredecessorTasks(task: TaskData, allTasks: TaskData[]): TaskData[] {
    if (!task.dependencies) return [];
    
    const predecessorIds = task.dependencies.map(dep => dep.id);
    return allTasks.filter(t => predecessorIds.includes(t.id));
  }

  /**
   * Get task constraints (placeholder for future implementation)
   */
  private static getTaskConstraints(task: TaskData): TaskConstraint[] {
    // For now, return empty array
    // In the future, this would read from task.constraints property
    return [];
  }

  /**
   * Detect circular dependencies
   */
  private static detectCircularDependencies(tasks: TaskData[]): string[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const circularDeps: string[] = [];

    const dfs = (taskId: string, path: string[]): boolean => {
      if (recursionStack.has(taskId)) {
        // Circular dependency found
        const cycle = [...path.slice(path.indexOf(taskId)), taskId];
        circularDeps.push(cycle.join(' → '));
        return true;
      }

      if (visited.has(taskId)) {
        return false;
      }

      visited.add(taskId);
      recursionStack.add(taskId);

      const task = tasks.find(t => t.id === taskId);
      if (task?.dependencies) {
        for (const dep of task.dependencies) {
          if (dfs(dep.targetId, [...path, taskId])) {
            return true;
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        dfs(task.id, []);
      }
    }

    return circularDeps;
  }

  /**
   * Topological sort of tasks based on dependencies
   */
  private static topologicalSort(tasks: TaskData[]): TaskData[] {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();
    const result: TaskData[] = [];

    // Initialize
    for (const task of tasks) {
      inDegree.set(task.id, 0);
      graph.set(task.id, []);
    }

    // Build graph and calculate in-degrees
    for (const task of tasks) {
      if (task.dependencies) {
        for (const dep of task.dependencies) {
          const predecessors = graph.get(dep.targetId) || [];
          predecessors.push(task.id);
          graph.set(dep.targetId, predecessors);
          
          inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1);
        }
      }
    }

    // Kahn's algorithm
    const queue: string[] = [];
    for (const [taskId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(taskId);
      }
    }

    while (queue.length > 0) {
      const taskId = queue.shift()!;
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        result.push(task);
      }

      const successors = graph.get(taskId) || [];
      for (const successorId of successors) {
        const currentDegree = inDegree.get(successorId) || 0;
        inDegree.set(successorId, currentDegree - 1);
        
        if (currentDegree - 1 === 0) {
          queue.push(successorId);
        }
      }
    }

    // Check for cycles
    if (result.length !== tasks.length) {
      throw new Error('Circular dependencies detected in task graph');
    }

    return result;
  }

  /**
   * Check if rescheduling is possible
   */
  static canReschedule(tasks: TaskData[], selectedTaskIds?: string[]): boolean {
    try {
      // Check for circular dependencies
      const circularDeps = this.detectCircularDependencies(tasks);
      if (circularDeps.length > 0) {
        return false;
      }

      // Check if selected tasks exist
      if (selectedTaskIds) {
        const existingTasks = tasks.filter(task => selectedTaskIds.includes(task.id));
        if (existingTasks.length !== selectedTaskIds.length) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get rescheduling warnings
   */
  static getRescheduleWarnings(tasks: TaskData[], selectedTaskIds?: string[]): string[] {
    const warnings: string[] = [];

    // Check for tasks with no dependencies
    const tasksToCheck = selectedTaskIds 
      ? tasks.filter(task => selectedTaskIds.includes(task.id))
      : tasks;

    const tasksWithoutDeps = tasksToCheck.filter(task => 
      !task.dependencies || task.dependencies.length === 0
    );

    if (tasksWithoutDeps.length > 0) {
      warnings.push(`${tasksWithoutDeps.length} task(s) have no dependencies and may not be affected by rescheduling`);
    }

    // Check for demo tasks
    const demoTasks = tasksToCheck.filter(task => task.demo);
    if (demoTasks.length > 0) {
      warnings.push(`${demoTasks.length} demo task(s) will be updated`);
    }

    return warnings;
  }
} 