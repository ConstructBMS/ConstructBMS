import { persistentStorage } from './persistentStorage';

export interface FloatConfig {
  demo?: boolean;
  highlightNegativeFloat: boolean;
  showFreeFloat: boolean;
  showTotalFloat: boolean;
}

export interface TaskFloat {
  free: number;
  isNegative: boolean;
  total: number;
}

export interface FloatResult {
  data?: any;
  errors: string[];
  success: boolean;
}

export class FloatService {
  /**
   * Get float display configuration
   */
  static async getFloatConfig(projectId: string = 'demo'): Promise<FloatConfig> {
    try {
      const config = await persistentStorage.getSetting(`floatConfig_${projectId}`, 'float') as FloatConfig;
      
      if (!config) {
        // Return default config if none exists
        const defaultConfig: FloatConfig = {
          showTotalFloat: false,
          showFreeFloat: false,
          highlightNegativeFloat: false,
          demo: projectId.includes('demo')
        };
        await this.saveFloatConfig(defaultConfig, projectId);
        return defaultConfig;
      }

      return config;
    } catch (error) {
      console.error('Failed to get float config:', error);
      return {
        showTotalFloat: false,
        showFreeFloat: false,
        highlightNegativeFloat: false,
        demo: projectId.includes('demo')
      };
    }
  }

  /**
   * Save float display configuration
   */
  static async saveFloatConfig(config: FloatConfig, projectId: string = 'demo'): Promise<FloatResult> {
    try {
      const configWithDemo = {
        ...config,
        demo: projectId.includes('demo')
      };

      await persistentStorage.setSetting(`floatConfig_${projectId}`, configWithDemo, 'float');
      
      if (projectId.includes('demo')) {
        console.log('Demo float config saved:', configWithDemo);
      }

      return { success: true, data: configWithDemo, errors: [] };
    } catch (error) {
      console.error('Failed to save float config:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Toggle total float display
   */
  static async toggleTotalFloat(projectId: string = 'demo'): Promise<FloatResult> {
    try {
      const currentConfig = await this.getFloatConfig(projectId);
      
      const updatedConfig = {
        ...currentConfig,
        showTotalFloat: !currentConfig.showTotalFloat
      };

      return await this.saveFloatConfig(updatedConfig, projectId);
    } catch (error) {
      console.error('Failed to toggle total float:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Toggle free float display
   */
  static async toggleFreeFloat(projectId: string = 'demo'): Promise<FloatResult> {
    try {
      const currentConfig = await this.getFloatConfig(projectId);
      
      const updatedConfig = {
        ...currentConfig,
        showFreeFloat: !currentConfig.showFreeFloat
      };

      return await this.saveFloatConfig(updatedConfig, projectId);
    } catch (error) {
      console.error('Failed to toggle free float:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Toggle negative float highlighting
   */
  static async toggleNegativeFloat(projectId: string = 'demo'): Promise<FloatResult> {
    try {
      const currentConfig = await this.getFloatConfig(projectId);
      
      const updatedConfig = {
        ...currentConfig,
        highlightNegativeFloat: !currentConfig.highlightNegativeFloat
      };

      return await this.saveFloatConfig(updatedConfig, projectId);
    } catch (error) {
      console.error('Failed to toggle negative float:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Calculate float for all tasks
   */
  static calculateTaskFloat(tasks: any[]): Map<string, TaskFloat> {
    const taskFloatMap = new Map<string, TaskFloat>();
    
    // First pass: calculate earliest start and finish times
    const earliestTimes = this.calculateEarliestTimes(tasks);
    
    // Second pass: calculate latest start and finish times
    const latestTimes = this.calculateLatestTimes(tasks, earliestTimes);
    
    // Third pass: calculate float values
    tasks.forEach(task => {
      const earliestStart = earliestTimes.get(task.id)?.start || 0;
      const earliestFinish = earliestTimes.get(task.id)?.finish || 0;
      const latestStart = latestTimes.get(task.id)?.start || 0;
      const latestFinish = latestTimes.get(task.id)?.finish || 0;
      
      const totalFloat = latestStart - earliestStart;
      const freeFloat = this.calculateFreeFloat(task, tasks, earliestTimes);
      
      taskFloatMap.set(task.id, {
        total: totalFloat,
        free: freeFloat,
        isNegative: totalFloat < 0 || freeFloat < 0
      });
    });
    
    return taskFloatMap;
  }

  /**
   * Calculate earliest start and finish times using forward pass
   */
  private static calculateEarliestTimes(tasks: any[]): Map<string, { finish: number, start: number; }> {
    const earliestTimes = new Map<string, { finish: number, start: number; }>();
    
    // Sort tasks by dependencies (topological sort)
    const sortedTasks = this.topologicalSort(tasks);
    
    sortedTasks.forEach(task => {
      let earliestStart = 0;
      
      // Find earliest start based on predecessors
      if (task.dependencies && task.dependencies.length > 0) {
        earliestStart = Math.max(
          ...task.dependencies.map((depId: string) => {
            const depTimes = earliestTimes.get(depId);
            return depTimes ? depTimes.finish : 0;
          })
        );
      }
      
      const earliestFinish = earliestStart + (task.duration || 0);
      
      earliestTimes.set(task.id, {
        start: earliestStart,
        finish: earliestFinish
      });
    });
    
    return earliestTimes;
  }

  /**
   * Calculate latest start and finish times using backward pass
   */
  private static calculateLatestTimes(
    tasks: any[], 
    earliestTimes: Map<string, { finish: number, start: number; }>
  ): Map<string, { finish: number, start: number; }> {
    const latestTimes = new Map<string, { finish: number, start: number; }>();
    
    // Find project duration (maximum earliest finish time)
    const projectDuration = Math.max(
      ...Array.from(earliestTimes.values()).map(times => times.finish)
    );
    
    // Sort tasks in reverse dependency order
    const sortedTasks = this.topologicalSort(tasks).reverse();
    
    sortedTasks.forEach(task => {
      let latestFinish = projectDuration;
      
      // Find latest finish based on successors
      const successors = tasks.filter(t => 
        t.dependencies && t.dependencies.includes(task.id)
      );
      
      if (successors.length > 0) {
        latestFinish = Math.min(
          ...successors.map(successor => {
            const successorTimes = latestTimes.get(successor.id);
            return successorTimes ? successorTimes.start : projectDuration;
          })
        );
      }
      
      const latestStart = latestFinish - (task.duration || 0);
      
      latestTimes.set(task.id, {
        start: latestStart,
        finish: latestFinish
      });
    });
    
    return latestTimes;
  }

  /**
   * Calculate free float for a task
   */
  private static calculateFreeFloat(
    task: any, 
    allTasks: any[], 
    earliestTimes: Map<string, { finish: number, start: number; }>
  ): number {
    const taskEarliestFinish = earliestTimes.get(task.id)?.finish || 0;
    
    // Find immediate successors
    const successors = allTasks.filter(t => 
      t.dependencies && t.dependencies.includes(task.id)
    );
    
    if (successors.length === 0) {
      return 0; // No successors, no free float
    }
    
    // Find minimum earliest start of successors
    const minSuccessorStart = Math.min(
      ...successors.map(successor => 
        earliestTimes.get(successor.id)?.start || 0
      )
    );
    
    return minSuccessorStart - taskEarliestFinish;
  }

  /**
   * Topological sort for dependency ordering
   */
  private static topologicalSort(tasks: any[]): any[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: any[] = [];
    
    const visit = (taskId: string) => {
      if (temp.has(taskId)) {
        throw new Error('Circular dependency detected');
      }
      if (visited.has(taskId)) {
        return;
      }
      
      temp.add(taskId);
      
      const task = tasks.find(t => t.id === taskId);
      if (task && task.dependencies) {
        task.dependencies.forEach((depId: string) => visit(depId));
      }
      
      temp.delete(taskId);
      visited.add(taskId);
      result.push(task);
    };
    
    tasks.forEach(task => {
      if (!visited.has(task.id)) {
        visit(task.id);
      }
    });
    
    return result;
  }

  /**
   * Get float visualization data for Gantt chart
   */
  static getFloatVisualization(
    task: any, 
    taskFloat: TaskFloat, 
    config: FloatConfig
  ): {
    freeFloatWidth: number;
    highlightNegative: boolean;
    showFreeFloat: boolean;
    showTotalFloat: boolean;
    styles: any;
    totalFloatWidth: number;
  } {
    const showTotalFloat = config.showTotalFloat && taskFloat.total > 0;
    const showFreeFloat = config.showFreeFloat && taskFloat.free > 0;
    const highlightNegative = config.highlightNegativeFloat && taskFloat.isNegative;
    
    // Calculate float widths (assuming 1 day = 20px for visualization)
    const totalFloatWidth = taskFloat.total * 20;
    const freeFloatWidth = taskFloat.free * 20;
    
    const styles = {
      totalFloat: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        border: '1px dashed rgba(59, 130, 246, 0.5)'
      },
      freeFloat: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        border: '1px dashed rgba(34, 197, 94, 0.5)'
      },
      negativeFloat: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        border: '2px solid rgba(239, 68, 68, 0.8)',
        boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
      }
    };
    
    return {
      showTotalFloat,
      showFreeFloat,
      highlightNegative,
      totalFloatWidth,
      freeFloatWidth,
      styles
    };
  }

  /**
   * Clear demo float data
   */
  static async clearDemoFloatData(projectId: string = 'demo'): Promise<FloatResult> {
    try {
      // Remove demo float config
      await persistentStorage.removeSetting(`floatConfig_${projectId}`, 'float');
      
      console.log('Demo float data cleared');
      
      return { success: true, errors: [] };
    } catch (error) {
      console.error('Failed to clear demo float data:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get float activity history
   */
  static async getFloatHistory(projectId: string = 'demo'): Promise<{
    toggles: any[];
  }> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      const toggles = activityLog.filter((log: any) => log.type === 'float_toggle');

      return { toggles };
    } catch (error) {
      console.error('Failed to get float history:', error);
      return { toggles: [] };
    }
  }

  /**
   * Log float activity
   */
  static async logFloatActivity(
    action: string, 
    details: any, 
    projectId: string = 'demo'
  ): Promise<void> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      activityLog.push({
        id: `float_${Date.now()}`,
        type: 'float_toggle',
        action,
        details,
        timestamp: new Date().toISOString(),
        demo: projectId.includes('demo')
      });

      await persistentStorage.setSetting(`activityLog_${projectId}`, activityLog, 'activity');
    } catch (error) {
      console.error('Failed to log float activity:', error);
    }
  }
} 