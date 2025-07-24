import { persistentStorage } from './persistentStorage';
import { demoModeService } from './demoModeService';
import { taskService } from './taskService';

export interface TaskDependency {
  id: string;
  projectId: string;
  predecessorId: string;
  successorId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF'; // Finish-to-Start, Start-to-Start, Finish-to-Finish, Start-to-Finish
  userId: string;
  createdAt: Date;
  demo?: boolean;
}

export interface DependencyLink {
  id: string;
  predecessorId: string;
  successorId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  predecessorName: string;
  successorName: string;
}

export interface ArrowCoordinates {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: 'FS' | 'SS' | 'FF' | 'SF';
}

class DependenciesEngine {
  private readonly dependenciesKey = 'task_dependencies';

  /**
   * Link two tasks with a dependency
   */
  async linkTasks(
    predecessorId: string,
    successorId: string,
    type: 'FS' | 'SS' | 'FF' | 'SF',
    projectId: string
  ): Promise<{ success: boolean; error?: string; dependency?: TaskDependency }> {
    try {
      // Validate inputs
      if (predecessorId === successorId) {
        return { success: false, error: 'A task cannot depend on itself' };
      }

      // Check demo mode restrictions
      const isDemoMode = await demoModeService.isDemoMode();
      if (isDemoMode) {
        const dependencyCount = await this.getDependencyCount(projectId);
        if (dependencyCount >= 3) {
          return { success: false, error: 'Maximum 3 dependencies allowed in demo mode' };
        }

        // Demo mode only allows FS dependencies
        if (type !== 'FS') {
          return { success: false, error: 'Only Finish-to-Start dependencies allowed in demo mode' };
        }
      }

      // Check for circular dependencies
      const wouldCreateCycle = await this.wouldCreateCircularDependency(predecessorId, successorId);
      if (wouldCreateCycle) {
        return { success: false, error: 'This would create a circular dependency' };
      }

      // Check if dependency already exists
      const existingDependency = await this.getDependency(predecessorId, successorId);
      if (existingDependency) {
        return { success: false, error: 'Dependency already exists' };
      }

      // Create the dependency
      const dependency: TaskDependency = {
        id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        predecessorId,
        successorId,
        type,
        userId: 'current-user', // This should come from auth context
        createdAt: new Date(),
        demo: isDemoMode
      };

      // Save to storage
      const dependencies = await this.getAllDependencies();
      dependencies.push(dependency);
      await persistentStorage.set(this.dependenciesKey, dependencies);

      // Enforce scheduling logic
      await this.enforceSchedulingLogic(dependency);

      console.log('Tasks linked:', predecessorId, '→', successorId, type);
      return { success: true, dependency };
    } catch (error) {
      console.error('Error linking tasks:', error);
      return { success: false, error: 'Failed to link tasks' };
    }
  }

  /**
   * Unlink tasks by dependency ID
   */
  async unlinkTasks(dependencyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const dependencies = await this.getAllDependencies();
      const dependencyIndex = dependencies.findIndex(d => d.id === dependencyId);
      
      if (dependencyIndex === -1) {
        return { success: false, error: 'Dependency not found' };
      }

      const dependency = dependencies[dependencyIndex];
      
      // Remove the dependency
      dependencies.splice(dependencyIndex, 1);
      await persistentStorage.set(this.dependenciesKey, dependencies);

      console.log('Tasks unlinked:', dependency.predecessorId, '→', dependency.successorId);
      return { success: true };
    } catch (error) {
      console.error('Error unlinking tasks:', error);
      return { success: false, error: 'Failed to unlink tasks' };
    }
  }

  /**
   * Get all dependencies for a task (both predecessors and successors)
   */
  async getDependencies(taskId: string): Promise<{
    predecessors: DependencyLink[];
    successors: DependencyLink[];
  }> {
    try {
      const dependencies = await this.getAllDependencies();
      const taskDependencies = dependencies.filter(d => 
        d.predecessorId === taskId || d.successorId === taskId
      );

      const predecessors: DependencyLink[] = [];
      const successors: DependencyLink[] = [];

      for (const dep of taskDependencies) {
        if (dep.successorId === taskId) {
          // This task is a successor, so dep.predecessorId is a predecessor
          const predecessorTask = await taskService.getTask(dep.predecessorId);
          if (predecessorTask) {
            predecessors.push({
              id: dep.id,
              predecessorId: dep.predecessorId,
              successorId: dep.successorId,
              type: dep.type,
              predecessorName: predecessorTask.name,
              successorName: predecessorTask.name // This will be the current task
            });
          }
        } else {
          // This task is a predecessor, so dep.successorId is a successor
          const successorTask = await taskService.getTask(dep.successorId);
          if (successorTask) {
            successors.push({
              id: dep.id,
              predecessorId: dep.predecessorId,
              successorId: dep.successorId,
              type: dep.type,
              predecessorName: predecessorTask?.name || 'Unknown',
              successorName: successorTask.name
            });
          }
        }
      }

      return { predecessors, successors };
    } catch (error) {
      console.error('Error getting dependencies:', error);
      return { predecessors: [], successors: [] };
    }
  }

  /**
   * Get all dependencies for a project
   */
  async getProjectDependencies(projectId: string): Promise<TaskDependency[]> {
    try {
      const dependencies = await this.getAllDependencies();
      return dependencies.filter(d => d.projectId === projectId);
    } catch (error) {
      console.error('Error getting project dependencies:', error);
      return [];
    }
  }

  /**
   * Get dependency count for demo mode
   */
  async getDependencyCount(projectId: string): Promise<number> {
    try {
      const dependencies = await this.getProjectDependencies(projectId);
      return dependencies.length;
    } catch (error) {
      console.error('Error getting dependency count:', error);
      return 0;
    }
  }

  /**
   * Calculate arrow coordinates for visual display
   */
  calculateArrowCoordinates(
    predecessorTask: any,
    successorTask: any,
    predecessorRect: DOMRect,
    successorRect: DOMRect,
    type: 'FS' | 'SS' | 'FF' | 'SF'
  ): ArrowCoordinates {
    let startX: number, startY: number, endX: number, endY: number;

    switch (type) {
      case 'FS': // Finish-to-Start
        startX = predecessorRect.right;
        startY = predecessorRect.top + predecessorRect.height / 2;
        endX = successorRect.left;
        endY = successorRect.top + successorRect.height / 2;
        break;
      case 'SS': // Start-to-Start
        startX = predecessorRect.left;
        startY = predecessorRect.top + predecessorRect.height / 2;
        endX = successorRect.left;
        endY = successorRect.top + successorRect.height / 2;
        break;
      case 'FF': // Finish-to-Finish
        startX = predecessorRect.right;
        startY = predecessorRect.top + predecessorRect.height / 2;
        endX = successorRect.right;
        endY = successorRect.top + successorRect.height / 2;
        break;
      case 'SF': // Start-to-Finish
        startX = predecessorRect.left;
        startY = predecessorRect.top + predecessorRect.height / 2;
        endX = successorRect.right;
        endY = successorRect.top + successorRect.height / 2;
        break;
      default:
        startX = predecessorRect.right;
        startY = predecessorRect.top + predecessorRect.height / 2;
        endX = successorRect.left;
        endY = successorRect.top + successorRect.height / 2;
    }

    return {
      startX,
      startY,
      endX,
      endY,
      type
    };
  }

  /**
   * Enforce scheduling logic when dependencies are created or tasks are moved
   */
  async enforceSchedulingLogic(dependency: TaskDependency): Promise<void> {
    try {
      const predecessorTask = await taskService.getTask(dependency.predecessorId);
      const successorTask = await taskService.getTask(dependency.successorId);

      if (!predecessorTask || !successorTask) return;

      let newStartDate: Date | null = null;
      let newEndDate: Date | null = null;

      switch (dependency.type) {
        case 'FS': // Finish-to-Start
          if (successorTask.startDate < predecessorTask.endDate) {
            newStartDate = new Date(predecessorTask.endDate);
            const duration = successorTask.endDate.getTime() - successorTask.startDate.getTime();
            newEndDate = new Date(newStartDate.getTime() + duration);
          }
          break;
        case 'SS': // Start-to-Start
          if (successorTask.startDate < predecessorTask.startDate) {
            newStartDate = new Date(predecessorTask.startDate);
            const duration = successorTask.endDate.getTime() - successorTask.startDate.getTime();
            newEndDate = new Date(newStartDate.getTime() + duration);
          }
          break;
        case 'FF': // Finish-to-Finish
          if (successorTask.endDate < predecessorTask.endDate) {
            newEndDate = new Date(predecessorTask.endDate);
            const duration = successorTask.endDate.getTime() - successorTask.startDate.getTime();
            newStartDate = new Date(newEndDate.getTime() - duration);
          }
          break;
        case 'SF': // Start-to-Finish
          if (successorTask.endDate < predecessorTask.startDate) {
            newEndDate = new Date(predecessorTask.startDate);
            const duration = successorTask.endDate.getTime() - successorTask.startDate.getTime();
            newStartDate = new Date(newEndDate.getTime() - duration);
          }
          break;
      }

      // Update successor task if needed
      if (newStartDate && newEndDate) {
        await taskService.updateTask(dependency.successorId, {
          startDate: newStartDate,
          endDate: newEndDate,
          demo: dependency.demo
        });
        console.log('Scheduling logic enforced for task:', dependency.successorId);
      }
    } catch (error) {
      console.error('Error enforcing scheduling logic:', error);
    }
  }

  /**
   * Check if creating a dependency would create a circular dependency
   */
  async wouldCreateCircularDependency(predecessorId: string, successorId: string): Promise<boolean> {
    try {
      const visited = new Set<string>();
      const recursionStack = new Set<string>();

      const hasCycle = async (taskId: string): Promise<boolean> => {
        if (recursionStack.has(taskId)) {
          return true; // Back edge found, cycle exists
        }

        if (visited.has(taskId)) {
          return false; // Already processed
        }

        visited.add(taskId);
        recursionStack.add(taskId);

        // Get all successors of this task
        const dependencies = await this.getAllDependencies();
        const successors = dependencies.filter(d => d.predecessorId === taskId);

        for (const dep of successors) {
          if (await hasCycle(dep.successorId)) {
            return true;
          }
        }

        recursionStack.delete(taskId);
        return false;
      };

      // Temporarily add the new dependency
      const dependencies = await this.getAllDependencies();
      const tempDependency: TaskDependency = {
        id: 'temp',
        projectId: 'temp',
        predecessorId,
        successorId,
        type: 'FS',
        userId: 'temp',
        createdAt: new Date()
      };
      dependencies.push(tempDependency);

      // Check for cycles starting from the successor
      const hasCircularDependency = await hasCycle(successorId);

      return hasCircularDependency;
    } catch (error) {
      console.error('Error checking for circular dependencies:', error);
      return false;
    }
  }

  /**
   * Get a specific dependency between two tasks
   */
  async getDependency(predecessorId: string, successorId: string): Promise<TaskDependency | null> {
    try {
      const dependencies = await this.getAllDependencies();
      return dependencies.find(d => 
        d.predecessorId === predecessorId && d.successorId === successorId
      ) || null;
    } catch (error) {
      console.error('Error getting dependency:', error);
      return null;
    }
  }

  /**
   * Get all dependencies from storage
   */
  private async getAllDependencies(): Promise<TaskDependency[]> {
    try {
      const dependencies = await persistentStorage.get(this.dependenciesKey);
      return dependencies || [];
    } catch (error) {
      console.error('Error getting all dependencies:', error);
      return [];
    }
  }

  /**
   * Clear all dependency data (for demo mode reset)
   */
  async clearAllDependencyData(): Promise<void> {
    try {
      await persistentStorage.remove(this.dependenciesKey);
      console.log('All dependency data cleared');
    } catch (error) {
      console.error('Error clearing dependency data:', error);
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
        await this.clearAllDependencyData();
        console.log('Demo dependency data reset');
      }
    } catch (error) {
      console.error('Error resetting demo dependency data:', error);
      throw error;
    }
  }

  /**
   * Validate dependency type
   */
  validateDependencyType(type: string): type is 'FS' | 'SS' | 'FF' | 'SF' {
    return ['FS', 'SS', 'FF', 'SF'].includes(type);
  }

  /**
   * Get dependency type display name
   */
  getDependencyTypeName(type: 'FS' | 'SS' | 'FF' | 'SF'): string {
    switch (type) {
      case 'FS': return 'Finish-to-Start';
      case 'SS': return 'Start-to-Start';
      case 'FF': return 'Finish-to-Finish';
      case 'SF': return 'Start-to-Finish';
      default: return 'Unknown';
    }
  }

  /**
   * Get dependency type description
   */
  getDependencyTypeDescription(type: 'FS' | 'SS' | 'FF' | 'SF'): string {
    switch (type) {
      case 'FS': return 'Successor cannot start until predecessor finishes';
      case 'SS': return 'Successor cannot start until predecessor starts';
      case 'FF': return 'Successor cannot finish until predecessor finishes';
      case 'SF': return 'Successor cannot finish until predecessor starts';
      default: return 'Unknown dependency type';
    }
  }
}

export const dependenciesEngine = new DependenciesEngine(); 