import type { TaskData } from '../components/modules/ribbonTabs/TaskEditModal';
import type { TaskDependency } from '../components/modules/ribbonTabs/LagTimeModal';

export interface DependencyOperation {
  dependencies: TaskDependency[];
  taskIds: string[];
  type: 'link' | 'unlink' | 'lag';
}

export class TaskDependencyService {
  /**
   * Link tasks in selection order (Finish-to-Start dependencies)
   */
  static linkTasks(tasks: TaskData[], selectedTaskIds: string[]): { dependencies: TaskDependency[], tasks: TaskData[] } {
    const updatedTasks = [...tasks];
    const newDependencies: TaskDependency[] = [];
    
    // Sort tasks by their position in the list
    const sortedTaskIds = this.sortTasksByPosition(tasks, selectedTaskIds);
    
    // Create Finish-to-Start dependencies between consecutive tasks
    for (let i = 0; i < sortedTaskIds.length - 1; i++) {
      const predecessorId = sortedTaskIds[i];
      const successorId = sortedTaskIds[i + 1];
      
      // Check if dependency already exists
      const existingDependency = this.findDependency(predecessorId, successorId);
      if (existingDependency) {
        continue; // Skip if already linked
      }
      
      // Create new dependency
      const dependency: TaskDependency = {
        id: predecessorId,
        targetId: successorId,
        type: 'FS',
        lag: '0d',
        demo: true
      };
      
      newDependencies.push(dependency);
      
      // Update task dependencies
      const predecessor = updatedTasks.find(t => t.id === predecessorId);
      const successor = updatedTasks.find(t => t.id === successorId);
      
      if (predecessor && successor) {
        if (!predecessor.dependencies) predecessor.dependencies = [];
        if (!successor.dependencies) successor.dependencies = [];
        
        predecessor.dependencies.push(dependency);
        successor.dependencies.push({
          ...dependency,
          id: successorId,
          targetId: predecessorId,
          type: 'FS'
        });
      }
    }
    
    return { tasks: updatedTasks, dependencies: newDependencies };
  }

  /**
   * Unlink tasks (remove dependencies between selected tasks)
   */
  static unlinkTasks(tasks: TaskData[], selectedTaskIds: string[]): { removedDependencies: TaskDependency[], tasks: TaskData[] } {
    const updatedTasks = [...tasks];
    const removedDependencies: TaskDependency[] = [];
    
    // Find all dependencies between selected tasks
    for (let i = 0; i < selectedTaskIds.length; i++) {
      for (let j = i + 1; j < selectedTaskIds.length; j++) {
        const task1Id = selectedTaskIds[i];
        const task2Id = selectedTaskIds[j];
        
        const task1 = updatedTasks.find(t => t.id === task1Id);
        const task2 = updatedTasks.find(t => t.id === task2Id);
        
        if (task1 && task2) {
          // Remove dependencies from both tasks
          if (task1.dependencies) {
            const removedFromTask1 = task1.dependencies.filter(dep => dep.targetId === task2Id);
            task1.dependencies = task1.dependencies.filter(dep => dep.targetId !== task2Id);
            removedDependencies.push(...removedFromTask1);
          }
          
          if (task2.dependencies) {
            const removedFromTask2 = task2.dependencies.filter(dep => dep.targetId === task1Id);
            task2.dependencies = task2.dependencies.filter(dep => dep.targetId !== task1Id);
            removedDependencies.push(...removedFromTask2);
          }
        }
      }
    }
    
    return { tasks: updatedTasks, removedDependencies };
  }

  /**
   * Update lag time for a specific dependency
   */
  static updateLagTime(
    tasks: TaskData[], 
    dependency: TaskDependency
  ): { tasks: TaskData[], updatedDependency: TaskDependency } {
    const updatedTasks = [...tasks];
    
    // Find and update the dependency in both tasks
    const predecessor = updatedTasks.find(t => t.id === dependency.id);
    const successor = updatedTasks.find(t => t.id === dependency.targetId);
    
    if (predecessor && successor) {
      // Update in predecessor
      if (predecessor.dependencies) {
        const depIndex = predecessor.dependencies.findIndex(dep => dep.targetId === dependency.targetId);
        if (depIndex !== -1) {
          predecessor.dependencies[depIndex] = { ...dependency };
        }
      }
      
      // Update in successor (reverse dependency)
      if (successor.dependencies) {
        const depIndex = successor.dependencies.findIndex(dep => dep.targetId === dependency.id);
        if (depIndex !== -1) {
          successor.dependencies[depIndex] = {
            ...dependency,
            id: dependency.targetId,
            targetId: dependency.id
          };
        }
      }
    }
    
    return { tasks: updatedTasks, updatedDependency: dependency };
  }

  /**
   * Check if tasks can be linked
   */
  static canLinkTasks(tasks: TaskData[], selectedTaskIds: string[]): boolean {
    if (selectedTaskIds.length < 2) return false;
    
    // Check for circular dependencies
    const sortedTaskIds = this.sortTasksByPosition(tasks, selectedTaskIds);
    
    for (let i = 0; i < sortedTaskIds.length - 1; i++) {
      const predecessorId = sortedTaskIds[i];
      const successorId = sortedTaskIds[i + 1];
      
      // Check if this would create a circular dependency
      if (this.wouldCreateCircularDependency(tasks, predecessorId, successorId)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if tasks can be unlinked
   */
  static canUnlinkTasks(tasks: TaskData[], selectedTaskIds: string[]): boolean {
    if (selectedTaskIds.length < 2) return false;
    
    // Check if there are any dependencies between selected tasks
    for (let i = 0; i < selectedTaskIds.length; i++) {
      for (let j = i + 1; j < selectedTaskIds.length; j++) {
        const task1Id = selectedTaskIds[i];
        const task2Id = selectedTaskIds[j];
        
        const task1 = tasks.find(t => t.id === task1Id);
        const task2 = tasks.find(t => t.id === task2Id);
        
        if (task1?.dependencies?.some(dep => dep.targetId === task2Id) ||
            task2?.dependencies?.some(dep => dep.targetId === task1Id)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Check if tasks can have lag time managed
   */
  static canManageLagTime(tasks: TaskData[], selectedTaskIds: string[]): boolean {
    if (selectedTaskIds.length !== 2) return false;
    
    const task1Id = selectedTaskIds[0];
    const task2Id = selectedTaskIds[1];
    
    const task1 = tasks.find(t => t.id === task1Id);
    const task2 = tasks.find(t => t.id === task2Id);
    
    // Check if there's a dependency between the two tasks
    return !!(task1?.dependencies?.some(dep => dep.targetId === task2Id) ||
             task2?.dependencies?.some(dep => dep.targetId === task1Id));
  }

  /**
   * Find existing dependency between two tasks
   */
  static findDependency(predecessorId: string, successorId: string): TaskDependency | null {
    // This would typically query the global dependency store
    // For now, return null as dependencies are stored in tasks
    return null;
  }

  /**
   * Check if linking would create a circular dependency
   */
  private static wouldCreateCircularDependency(tasks: TaskData[], predecessorId: string, successorId: string): boolean {
    // Simple check: if successor already has predecessor as a dependency (direct or indirect)
    const visited = new Set<string>();
    const stack = [successorId];
    
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      
      if (currentId === predecessorId) {
        return true; // Circular dependency detected
      }
      
      if (visited.has(currentId)) {
        continue;
      }
      
      visited.add(currentId);
      
      const currentTask = tasks.find(t => t.id === currentId);
      if (currentTask?.dependencies) {
        for (const dep of currentTask.dependencies) {
          stack.push(dep.targetId);
        }
      }
    }
    
    return false;
  }

  /**
   * Sort task IDs by their position in the task list
   */
  private static sortTasksByPosition(tasks: TaskData[], taskIds: string[]): string[] {
    return taskIds.sort((a, b) => {
      const indexA = tasks.findIndex(t => t.id === a);
      const indexB = tasks.findIndex(t => t.id === b);
      return indexA - indexB;
    });
  }

  /**
   * Get all dependencies for a task
   */
  static getTaskDependencies(tasks: TaskData[], taskId: string): TaskDependency[] {
    const task = tasks.find(t => t.id === taskId);
    return task?.dependencies || [];
  }

  /**
   * Get all tasks that depend on a given task
   */
  static getDependentTasks(tasks: TaskData[], taskId: string): string[] {
    const dependentTasks: string[] = [];
    
    for (const task of tasks) {
      if (task.dependencies?.some(dep => dep.targetId === taskId)) {
        dependentTasks.push(task.id);
      }
    }
    
    return dependentTasks;
  }

  /**
   * Get all tasks that a given task depends on
   */
  static getPredecessorTasks(tasks: TaskData[], taskId: string): string[] {
    const task = tasks.find(t => t.id === taskId);
    return task?.dependencies?.map(dep => dep.targetId) || [];
  }
} 