import { persistentStorage } from './persistentStorage';

export interface GroupingConfig {
  collapsedSummaries: { [taskId: string]: boolean };
  // Global toggle state
  demo?: boolean; 
  summariesCollapsed: boolean;
}

export interface GroupingResult {
  data?: any;
  errors: string[];
  success: boolean;
}

export interface Task {
  children?: string[];
  id: string;
  isSummary: boolean;
  isVisible?: boolean;
  name: string;
  parentId?: string;
}

export class GroupingService {
  /**
   * Get grouping configuration
   */
  static async getGroupingConfig(projectId: string = 'demo'): Promise<GroupingConfig> {
    try {
      const config = await persistentStorage.getSetting(`groupingConfig_${projectId}`, 'grouping') as GroupingConfig;
      
      if (!config) {
        // Return default config if none exists
        const defaultConfig: GroupingConfig = {
          collapsedSummaries: {},
          summariesCollapsed: false,
          demo: projectId.includes('demo')
        };
        await this.saveGroupingConfig(defaultConfig, projectId);
        return defaultConfig;
      }

      return config;
    } catch (error) {
      console.error('Failed to get grouping config:', error);
      return {
        collapsedSummaries: {},
        summariesCollapsed: false,
        demo: projectId.includes('demo')
      };
    }
  }

  /**
   * Save grouping configuration
   */
  static async saveGroupingConfig(config: GroupingConfig, projectId: string = 'demo'): Promise<GroupingResult> {
    try {
      const configWithDemo = {
        ...config,
        demo: projectId.includes('demo')
      };

      await persistentStorage.setSetting(`groupingConfig_${projectId}`, configWithDemo, 'grouping');
      
      if (projectId.includes('demo')) {
        console.log('Demo grouping config saved:', configWithDemo);
      }

      return { success: true, data: configWithDemo, errors: [] };
    } catch (error) {
      console.error('Failed to save grouping config:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Expand selected summary tasks
   */
  static async expandSelected(taskIds: string[], projectId: string = 'demo'): Promise<GroupingResult> {
    try {
      const config = await this.getGroupingConfig(projectId);
      const updatedCollapsedSummaries = { ...config.collapsedSummaries };
      
      // Expand selected summary tasks
      taskIds.forEach(taskId => {
        if (updatedCollapsedSummaries.hasOwnProperty(taskId)) {
          delete updatedCollapsedSummaries[taskId];
        }
      });

      const updatedConfig = {
        ...config,
        collapsedSummaries: updatedCollapsedSummaries
      };

      const result = await this.saveGroupingConfig(updatedConfig, projectId);
      
      if (result.success) {
        // Log activity
        await this.logGroupingActivity('expand_selected', {
          taskIds,
          expandedCount: taskIds.length
        }, projectId);
      }

      return result;
    } catch (error) {
      console.error('Failed to expand selected:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Collapse selected summary tasks
   */
  static async collapseSelected(taskIds: string[], projectId: string = 'demo'): Promise<GroupingResult> {
    try {
      const config = await this.getGroupingConfig(projectId);
      const updatedCollapsedSummaries = { ...config.collapsedSummaries };
      
      // Collapse selected summary tasks
      taskIds.forEach(taskId => {
        updatedCollapsedSummaries[taskId] = true;
      });

      const updatedConfig = {
        ...config,
        collapsedSummaries: updatedCollapsedSummaries
      };

      const result = await this.saveGroupingConfig(updatedConfig, projectId);
      
      if (result.success) {
        // Log activity
        await this.logGroupingActivity('collapse_selected', {
          taskIds,
          collapsedCount: taskIds.length
        }, projectId);
      }

      return result;
    } catch (error) {
      console.error('Failed to collapse selected:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Toggle all summaries
   */
  static async toggleAllSummaries(force?: boolean, projectId: string = 'demo'): Promise<GroupingResult> {
    try {
      const config = await this.getGroupingConfig(projectId);
      const newSummariesCollapsed = force !== undefined ? force : !config.summariesCollapsed;
      
      let updatedCollapsedSummaries = { ...config.collapsedSummaries };
      
      if (newSummariesCollapsed) {
        // Collapse all summary tasks
        // This would require getting all summary task IDs from the task list
        // For demo purposes, we'll use a mock approach
        const allSummaryTaskIds = await this.getAllSummaryTaskIds(projectId);
        allSummaryTaskIds.forEach(taskId => {
          updatedCollapsedSummaries[taskId] = true;
        });
      } else {
        // Expand all summary tasks
        updatedCollapsedSummaries = {};
      }

      const updatedConfig = {
        ...config,
        collapsedSummaries: updatedCollapsedSummaries,
        summariesCollapsed: newSummariesCollapsed
      };

      const result = await this.saveGroupingConfig(updatedConfig, projectId);
      
      if (result.success) {
        // Log activity
        await this.logGroupingActivity('toggle_all_summaries', {
          summariesCollapsed: newSummariesCollapsed,
          affectedCount: Object.keys(updatedCollapsedSummaries).length
        }, projectId);
      }

      return result;
    } catch (error) {
      console.error('Failed to toggle all summaries:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get all summary task IDs (mock implementation for demo)
   */
  private static async getAllSummaryTaskIds(projectId: string = 'demo'): Promise<string[]> {
    try {
      // In a real implementation, this would fetch from the task service
      // For demo purposes, return mock summary task IDs
      const mockSummaryTasks = [
        { id: 'summary-1', name: 'Phase 1', isSummary: true },
        { id: 'summary-2', name: 'Phase 2', isSummary: true },
        { id: 'summary-3', name: 'Phase 3', isSummary: true }
      ];
      
      return mockSummaryTasks.map(task => task.id);
    } catch (error) {
      console.error('Failed to get summary task IDs:', error);
      return [];
    }
  }

  /**
   * Check if a task is collapsed
   */
  static async isTaskCollapsed(taskId: string, projectId: string = 'demo'): Promise<boolean> {
    try {
      const config = await this.getGroupingConfig(projectId);
      return config.collapsedSummaries[taskId] === true;
    } catch (error) {
      console.error('Failed to check if task is collapsed:', error);
      return false;
    }
  }

  /**
   * Get visible tasks based on collapse state
   */
  static async getVisibleTasks(tasks: Task[], projectId: string = 'demo'): Promise<Task[]> {
    try {
      const config = await this.getGroupingConfig(projectId);
      const visibleTasks: Task[] = [];
      
      const processTask = (task: Task, parentCollapsed: boolean = false): void => {
        if (parentCollapsed) {
          // Parent is collapsed, skip this task and all its children
          return;
        }
        
        if (task.isSummary) {
          // This is a summary task
          const isCollapsed = config.collapsedSummaries[task.id] === true;
          visibleTasks.push(task);
          
          // Process children if not collapsed
          if (task.children && !isCollapsed) {
            task.children.forEach(childId => {
              const childTask = tasks.find(t => t.id === childId);
              if (childTask) {
                processTask(childTask, false);
              }
            });
          }
        } else {
          // This is a regular task
          visibleTasks.push(task);
        }
      };
      
      // Process all root tasks
      const rootTasks = tasks.filter(task => !task.parentId);
      rootTasks.forEach(task => {
        processTask(task, false);
      });
      
      return visibleTasks;
    } catch (error) {
      console.error('Failed to get visible tasks:', error);
      return tasks;
    }
  }

  /**
   * Get task hierarchy with collapse state
   */
  static async getTaskHierarchy(tasks: Task[], projectId: string = 'demo'): Promise<{
    hierarchy: { [taskId: string]: { children: string[], isCollapsed: boolean; level: number; } };
    tasks: Task[];
  }> {
    try {
      const config = await this.getGroupingConfig(projectId);
      const hierarchy: { [taskId: string]: { children: string[], isCollapsed: boolean; level: number; } } = {};
      
      const buildHierarchy = (task: Task, level: number = 0): void => {
        hierarchy[task.id] = {
          level,
          isCollapsed: config.collapsedSummaries[task.id] === true,
          children: task.children || []
        };
        
        // Process children if not collapsed
        if (task.children && !hierarchy[task.id].isCollapsed) {
          task.children.forEach(childId => {
            const childTask = tasks.find(t => t.id === childId);
            if (childTask) {
              buildHierarchy(childTask, level + 1);
            }
          });
        }
      };
      
      // Build hierarchy for all root tasks
      const rootTasks = tasks.filter(task => !task.parentId);
      rootTasks.forEach(task => {
        buildHierarchy(task);
      });
      
      return { tasks, hierarchy };
    } catch (error) {
      console.error('Failed to get task hierarchy:', error);
      return { tasks, hierarchy: {} };
    }
  }

  /**
   * Expand all tasks
   */
  static async expandAll(projectId: string = 'demo'): Promise<GroupingResult> {
    try {
      const config = await this.getGroupingConfig(projectId);
      const updatedConfig = {
        ...config,
        collapsedSummaries: {},
        summariesCollapsed: false
      };

      const result = await this.saveGroupingConfig(updatedConfig, projectId);
      
      if (result.success) {
        // Log activity
        await this.logGroupingActivity('expand_all', {
          expandedCount: Object.keys(config.collapsedSummaries).length
        }, projectId);
      }

      return result;
    } catch (error) {
      console.error('Failed to expand all:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Collapse all tasks
   */
  static async collapseAll(projectId: string = 'demo'): Promise<GroupingResult> {
    try {
      const config = await this.getGroupingConfig(projectId);
      const allSummaryTaskIds = await this.getAllSummaryTaskIds(projectId);
      
      const updatedCollapsedSummaries: { [taskId: string]: boolean } = {};
      allSummaryTaskIds.forEach(taskId => {
        updatedCollapsedSummaries[taskId] = true;
      });

      const updatedConfig = {
        ...config,
        collapsedSummaries: updatedCollapsedSummaries,
        summariesCollapsed: true
      };

      const result = await this.saveGroupingConfig(updatedConfig, projectId);
      
      if (result.success) {
        // Log activity
        await this.logGroupingActivity('collapse_all', {
          collapsedCount: allSummaryTaskIds.length
        }, projectId);
      }

      return result;
    } catch (error) {
      console.error('Failed to collapse all:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Clear demo grouping data
   */
  static async clearDemoGroupingData(projectId: string = 'demo'): Promise<GroupingResult> {
    try {
      // Remove demo grouping config
      await persistentStorage.removeSetting(`groupingConfig_${projectId}`, 'grouping');
      
      console.log('Demo grouping data cleared');
      
      return { success: true, errors: [] };
    } catch (error) {
      console.error('Failed to clear demo grouping data:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get grouping activity history
   */
  static async getGroupingHistory(projectId: string = 'demo'): Promise<{
    activities: any[];
  }> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      const activities = activityLog.filter((log: any) => log.type === 'grouping_activity');

      return { activities };
    } catch (error) {
      console.error('Failed to get grouping history:', error);
      return { activities: [] };
    }
  }

  /**
   * Log grouping activity
   */
  static async logGroupingActivity(
    action: string, 
    details: any, 
    projectId: string = 'demo'
  ): Promise<void> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      activityLog.push({
        id: `grouping_${Date.now()}`,
        type: 'grouping_activity',
        action,
        details,
        timestamp: new Date().toISOString(),
        demo: projectId.includes('demo')
      });

      await persistentStorage.setSetting(`activityLog_${projectId}`, activityLog, 'activity');
    } catch (error) {
      console.error('Failed to log grouping activity:', error);
    }
  }

  /**
   * Validate grouping configuration
   */
  static validateGroupingConfig(config: GroupingConfig): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];

    if (typeof config.summariesCollapsed !== 'boolean') {
      errors.push('summariesCollapsed must be a boolean');
    }

    if (!config.collapsedSummaries || typeof config.collapsedSummaries !== 'object') {
      errors.push('collapsedSummaries must be an object');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 