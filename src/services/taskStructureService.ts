import type { TaskData } from '../components/modules/ribbonTabs/TaskEditModal';

export interface StructureOperation {
  affectedTasks: TaskData[];
  taskIds: string[];
  type: 'indent' | 'outdent' | 'summary';
}

export class TaskStructureService {
  /**
   * Indent selected tasks - make them children of the task above
   */
  static indentTasks(tasks: TaskData[], selectedTaskIds: string[]): TaskData[] {
    const updatedTasks = [...tasks];
    const sortedSelectedIds = this.sortTasksByPosition(tasks, selectedTaskIds);
    
    for (const taskId of sortedSelectedIds) {
      const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1 || taskIndex === 0) continue; // Can't indent first task
      
      const task = updatedTasks[taskIndex];
      if (!task) continue;
      const previousTask = updatedTasks[taskIndex - 1];
      
      // Find the immediate parent (task above with same or lower level)
      let parentIndex = taskIndex - 1;
      while (parentIndex >= 0) {
        const potentialParent = updatedTasks[parentIndex];
        if (potentialParent && potentialParent.level! <= task.level!) {
          break;
        }
        parentIndex--;
      }
      
      if (parentIndex >= 0) {
        const parent = updatedTasks[parentIndex];
        if (!parent || !task) continue;
        
        // Update task structure
        task.level = (parent.level || 0) + 1;
        task.parentId = parent.id;
        
        // Update parent's children array
        if (!parent.children) parent.children = [];
        if (!parent.children.includes(task.id)) {
          parent.children.push(task.id);
        }
        
        // Mark parent as summary if it has children
        if (parent.children.length > 0) {
          parent.isSummary = true;
        }
        
        // Recalculate parent duration if it's a summary
        if (parent.isSummary) {
          this.recalculateSummaryDuration(updatedTasks, parent.id);
        }
      }
    }
    
    return updatedTasks;
  }

  /**
   * Outdent selected tasks - move them up one level
   */
  static outdentTasks(tasks: TaskData[], selectedTaskIds: string[]): TaskData[] {
    const updatedTasks = [...tasks];
    const sortedSelectedIds = this.sortTasksByPosition(tasks, selectedTaskIds);
    
    for (const taskId of sortedSelectedIds) {
      const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) continue;
      
      const task = updatedTasks[taskIndex];
      if (!task.parentId || task.level === 0) continue; // Can't outdent root tasks
      
      // Find current parent
      const parentIndex = updatedTasks.findIndex(t => t.id === task.parentId);
      if (parentIndex === -1) continue;
      
      const parent = updatedTasks[parentIndex];
      
      // Find grandparent (parent's parent)
      let grandparentIndex = -1;
      if (parent.parentId) {
        grandparentIndex = updatedTasks.findIndex(t => t.id === parent.parentId);
      }
      
      // Update task structure
      task.level = grandparentIndex >= 0 ? (updatedTasks[grandparentIndex].level || 0) + 1 : 0;
      task.parentId = grandparentIndex >= 0 ? updatedTasks[grandparentIndex].id : undefined;
      
      // Remove from current parent's children
      if (parent.children) {
        parent.children = parent.children.filter(id => id !== task.id);
        if (parent.children.length === 0) {
          parent.isSummary = false;
        }
      }
      
      // Add to grandparent's children if exists
      if (grandparentIndex >= 0) {
        const grandparent = updatedTasks[grandparentIndex];
        if (!grandparent.children) grandparent.children = [];
        if (!grandparent.children.includes(task.id)) {
          grandparent.children.push(task.id);
        }
        grandparent.isSummary = true;
      }
      
      // Recalculate durations for affected parents
      if (parent.children && parent.children.length > 0) {
        this.recalculateSummaryDuration(updatedTasks, parent.id);
      }
      if (grandparentIndex >= 0) {
        this.recalculateSummaryDuration(updatedTasks, updatedTasks[grandparentIndex].id);
      }
    }
    
    return updatedTasks;
  }

  /**
   * Convert selected tasks to summary tasks
   */
  static makeSummaryTasks(tasks: TaskData[], selectedTaskIds: string[]): TaskData[] {
    const updatedTasks = [...tasks];
    const sortedSelectedIds = this.sortTasksByPosition(tasks, selectedTaskIds);
    
    for (const taskId of sortedSelectedIds) {
      const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) continue;
      
      const task = updatedTasks[taskIndex];
      
      // Mark as summary task
      task.isSummary = true;
      
      // Find and group following indented tasks as children
      const children: string[] = [];
      let currentLevel = task.level || 0;
      
      for (let i = taskIndex + 1; i < updatedTasks.length; i++) {
        const nextTask = updatedTasks[i];
        const nextLevel = nextTask.level || 0;
        
        // Stop if we encounter a task at same or higher level
        if (nextLevel <= currentLevel) {
          break;
        }
        
        // Add as child if it's indented under this task
        if (nextLevel === currentLevel + 1) {
          children.push(nextTask.id);
          nextTask.parentId = task.id;
        }
      }
      
      // Update task's children
      task.children = children;
      
      // Recalculate duration if it has children
      if (children.length > 0) {
        this.recalculateSummaryDuration(updatedTasks, task.id);
      }
    }
    
    return updatedTasks;
  }

  /**
   * Check if tasks can be indented
   */
  static canIndentTasks(tasks: TaskData[], selectedTaskIds: string[]): boolean {
    if (selectedTaskIds.length === 0) return false;
    
    const sortedSelectedIds = this.sortTasksByPosition(tasks, selectedTaskIds);
    const firstSelectedIndex = tasks.findIndex(t => t.id === sortedSelectedIds[0]);
    
    // Can't indent if first selected task is at the top
    if (firstSelectedIndex === 0) return false;
    
    // Check if there's a valid parent above
    const firstSelectedTask = tasks[firstSelectedIndex];
    const previousTask = tasks[firstSelectedIndex - 1];
    
    return previousTask.level! <= firstSelectedTask.level!;
  }

  /**
   * Check if tasks can be outdented
   */
  static canOutdentTasks(tasks: TaskData[], selectedTaskIds: string[]): boolean {
    if (selectedTaskIds.length === 0) return false;
    
    // Check if any selected task has a parent (can be outdented)
    return selectedTaskIds.some(taskId => {
      const task = tasks.find(t => t.id === taskId);
      return task && task.parentId && task.level! > 0;
    });
  }

  /**
   * Check if tasks can be made into summary tasks
   */
  static canMakeSummaryTasks(tasks: TaskData[], selectedTaskIds: string[]): boolean {
    if (selectedTaskIds.length === 0) return false;
    
    // Any task can be made into a summary task
    return true;
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
   * Recalculate duration for a summary task based on its children
   */
  private static recalculateSummaryDuration(tasks: TaskData[], summaryTaskId: string): void {
    const summaryTask = tasks.find(t => t.id === summaryTaskId);
    if (!summaryTask || !summaryTask.children || summaryTask.children.length === 0) {
      return;
    }
    
    let earliestStart = new Date();
    let latestEnd = new Date();
    let hasValidDates = false;
    
    // Find the earliest start and latest end among children
    for (const childId of summaryTask.children) {
      const child = tasks.find(t => t.id === childId);
      if (child) {
        if (!hasValidDates) {
          earliestStart = new Date(child.startDate);
          latestEnd = new Date(child.endDate);
          hasValidDates = true;
        } else {
          if (child.startDate < earliestStart) {
            earliestStart = new Date(child.startDate);
          }
          if (child.endDate > latestEnd) {
            latestEnd = new Date(child.endDate);
          }
        }
      }
    }
    
    if (hasValidDates) {
      summaryTask.startDate = earliestStart;
      summaryTask.endDate = latestEnd;
      summaryTask.duration = Math.ceil(
        (latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    }
  }

  /**
   * Get all children of a task (recursive)
   */
  static getAllChildren(tasks: TaskData[], taskId: string): string[] {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.children) return [];
    
    const allChildren = [...task.children];
    
    for (const childId of task.children) {
      const childChildren = this.getAllChildren(tasks, childId);
      allChildren.push(...childChildren);
    }
    
    return allChildren;
  }

  /**
   * Get all parents of a task (recursive)
   */
  static getAllParents(tasks: TaskData[], taskId: string): string[] {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.parentId) return [];
    
    const parents = [task.parentId];
    const grandParents = this.getAllParents(tasks, task.parentId);
    parents.push(...grandParents);
    
    return parents;
  }
} 