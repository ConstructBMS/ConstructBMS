import type { Task } from './ganttTaskService';

export interface CriticalPathResult {
  criticalTasks: string[];
  criticalPath: string[];
  projectDuration: number;
  slackTimes: Map<string, number>;
  earlyStart: Map<string, number>;
  earlyFinish: Map<string, number>;
  lateStart: Map<string, number>;
  lateFinish: Map<string, number>;
}

export interface TaskSchedule {
  taskId: string;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
}

export class CriticalPathService {
  private static instance: CriticalPathService;

  static getInstance(): CriticalPathService {
    if (!CriticalPathService.instance) {
      CriticalPathService.instance = new CriticalPathService();
    }
    return CriticalPathService.instance;
  }

  /**
   * Calculate critical path for a project
   */
  calculateCriticalPath(tasks: Task[]): CriticalPathResult {
    if (tasks.length === 0) {
      return {
        criticalTasks: [],
        criticalPath: [],
        projectDuration: 0,
        slackTimes: new Map(),
        earlyStart: new Map(),
        earlyFinish: new Map(),
        lateStart: new Map(),
        lateFinish: new Map()
      };
    }

    // Create task map for quick lookup
    const taskMap = new Map<string, Task>();
    tasks.forEach(task => taskMap.set(task.id, task));

    // Forward pass - calculate early start and early finish
    const earlyStart = new Map<string, number>();
    const earlyFinish = new Map<string, number>();
    
    // Find tasks with no predecessors (start tasks)
    const startTasks = tasks.filter(task => !task.predecessors || task.predecessors.length === 0);
    
    // Initialize early start for start tasks
    startTasks.forEach(task => {
      earlyStart.set(task.id, 0);
      earlyFinish.set(task.id, task.duration);
    });

    // Process remaining tasks in topological order
    const processed = new Set<string>();
    startTasks.forEach(task => processed.add(task.id));

    while (processed.size < tasks.length) {
      let progress = false;
      
      for (const task of tasks) {
        if (processed.has(task.id)) continue;
        
        // Check if all predecessors are processed
        if (task.predecessors && task.predecessors.every(predId => processed.has(predId))) {
          // Calculate early start as max of predecessors' early finish
          let maxEarlyFinish = 0;
          task.predecessors.forEach(predId => {
            const predEarlyFinish = earlyFinish.get(predId) || 0;
            maxEarlyFinish = Math.max(maxEarlyFinish, predEarlyFinish);
          });
          
          earlyStart.set(task.id, maxEarlyFinish);
          earlyFinish.set(task.id, maxEarlyFinish + task.duration);
          processed.add(task.id);
          progress = true;
        }
      }
      
      if (!progress) {
        // Circular dependency detected
        console.warn('Circular dependency detected in task dependencies');
        break;
      }
    }

    // Find project duration (max early finish)
    const projectDuration = Math.max(...Array.from(earlyFinish.values()));

    // Backward pass - calculate late start and late finish
    const lateStart = new Map<string, number>();
    const lateFinish = new Map<string, number>();
    
    // Find tasks with no successors (end tasks)
    const endTasks = tasks.filter(task => !task.successors || task.successors.length === 0);
    
    // Initialize late finish for end tasks
    endTasks.forEach(task => {
      lateFinish.set(task.id, projectDuration);
      lateStart.set(task.id, projectDuration - task.duration);
    });

    // Process remaining tasks in reverse topological order
    const reverseProcessed = new Set<string>();
    endTasks.forEach(task => reverseProcessed.add(task.id));

    while (reverseProcessed.size < tasks.length) {
      let progress = false;
      
      for (const task of tasks) {
        if (reverseProcessed.has(task.id)) continue;
        
        // Check if all successors are processed
        if (task.successors && task.successors.every(succId => reverseProcessed.has(succId))) {
          // Calculate late finish as min of successors' late start
          let minLateStart = projectDuration;
          task.successors.forEach(succId => {
            const succLateStart = lateStart.get(succId) || projectDuration;
            minLateStart = Math.min(minLateStart, succLateStart);
          });
          
          lateFinish.set(task.id, minLateStart);
          lateStart.set(task.id, minLateStart - task.duration);
          reverseProcessed.add(task.id);
          progress = true;
        }
      }
      
      if (!progress) {
        break;
      }
    }

    // Calculate slack times and identify critical tasks
    const slackTimes = new Map<string, number>();
    const criticalTasks: string[] = [];

    for (const task of tasks) {
      const taskEarlyStart = earlyStart.get(task.id) || 0;
      const taskLateStart = lateStart.get(task.id) || 0;
      const slack = taskLateStart - taskEarlyStart;
      
      slackTimes.set(task.id, slack);
      
      // Task is critical if slack is 0 (or very close to 0 due to floating point)
      if (Math.abs(slack) < 0.01) {
        criticalTasks.push(task.id);
      }
    }

    // Build critical path
    const criticalPath = this.buildCriticalPath(tasks, criticalTasks, earlyStart, earlyFinish);

    return {
      criticalTasks,
      criticalPath,
      projectDuration,
      slackTimes,
      earlyStart,
      earlyFinish,
      lateStart,
      lateFinish
    };
  }

  /**
   * Build the critical path sequence
   */
  private buildCriticalPath(
    tasks: Task[],
    criticalTasks: string[],
    earlyStart: Map<string, number>,
    earlyFinish: Map<string, number>
  ): string[] {
    if (criticalTasks.length === 0) return [];

    // Find the start of critical path (task with earliest start time)
    let startTaskId = criticalTasks[0];
    let earliestStart = earlyStart.get(startTaskId) || 0;

    for (const taskId of criticalTasks) {
      const taskEarlyStart = earlyStart.get(taskId) || 0;
      if (taskEarlyStart < earliestStart) {
        earliestStart = taskEarlyStart;
        startTaskId = taskId;
      }
    }

    // Build path by following successors
    const path: string[] = [startTaskId];
    let currentTaskId = startTaskId;

    while (true) {
      const currentTask = tasks.find(t => t.id === currentTaskId);
      if (!currentTask || !currentTask.successors) break;

      // Find critical successor
      let nextTaskId: string | null = null;
      for (const succId of currentTask.successors) {
        if (criticalTasks.includes(succId)) {
          nextTaskId = succId;
          break;
        }
      }

      if (!nextTaskId) break;
      
      path.push(nextTaskId);
      currentTaskId = nextTaskId;
    }

    return path;
  }

  /**
   * Get task schedule information
   */
  getTaskSchedule(tasks: Task[], taskId: string): TaskSchedule | null {
    const result = this.calculateCriticalPath(tasks);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return null;

    const earlyStart = result.earlyStart.get(taskId) || 0;
    const earlyFinish = result.earlyFinish.get(taskId) || 0;
    const lateStart = result.lateStart.get(taskId) || 0;
    const lateFinish = result.lateFinish.get(taskId) || 0;
    const slack = result.slackTimes.get(taskId) || 0;
    const isCritical = result.criticalTasks.includes(taskId);

    return {
      taskId,
      earlyStart,
      earlyFinish,
      lateStart,
      lateFinish,
      slack,
      isCritical
    };
  }

  /**
   * Get all task schedules
   */
  getAllTaskSchedules(tasks: Task[]): TaskSchedule[] {
    const result = this.calculateCriticalPath(tasks);
    
    return tasks.map(task => {
      const earlyStart = result.earlyStart.get(task.id) || 0;
      const earlyFinish = result.earlyFinish.get(task.id) || 0;
      const lateStart = result.lateStart.get(task.id) || 0;
      const lateFinish = result.lateFinish.get(task.id) || 0;
      const slack = result.slackTimes.get(task.id) || 0;
      const isCritical = result.criticalTasks.includes(task.id);

      return {
        taskId: task.id,
        earlyStart,
        earlyFinish,
        lateStart,
        lateFinish,
        slack,
        isCritical
      };
    });
  }

  /**
   * Check if a task is on the critical path
   */
  isTaskCritical(tasks: Task[], taskId: string): boolean {
    const result = this.calculateCriticalPath(tasks);
    return result.criticalTasks.includes(taskId);
  }

  /**
   * Get project duration
   */
  getProjectDuration(tasks: Task[]): number {
    const result = this.calculateCriticalPath(tasks);
    return result.projectDuration;
  }

  /**
   * Get slack time for a task
   */
  getTaskSlack(tasks: Task[], taskId: string): number {
    const result = this.calculateCriticalPath(tasks);
    return result.slackTimes.get(taskId) || 0;
  }

  /**
   * Validate task dependencies for circular references
   */
  validateDependencies(tasks: Task[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCircularDependency = (taskId: string): boolean => {
      if (recursionStack.has(taskId)) {
        return true;
      }
      
      if (visited.has(taskId)) {
        return false;
      }

      visited.add(taskId);
      recursionStack.add(taskId);

      const task = tasks.find(t => t.id === taskId);
      if (task && task.predecessors) {
        for (const predId of task.predecessors) {
          if (hasCircularDependency(predId)) {
            errors.push(`Circular dependency detected involving task: ${task.name} (${taskId})`);
            return true;
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    // Check each task for circular dependencies
    for (const task of tasks) {
      if (!visited.has(task.id)) {
        hasCircularDependency(task.id);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const criticalPathService = CriticalPathService.getInstance(); 