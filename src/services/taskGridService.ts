import { persistentStorage } from './persistentStorage';
import { demoModeService } from './demoModeService';
import { taskService } from './taskService';

export interface TaskGridState {
  projectId: string;
  expandedTaskIds: string[];
  columnOrder: string[];
  columnWidths: Record<string, number>;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  userId: string;
  demo?: boolean;
}

export interface TaskHierarchy {
  id: string;
  name: string;
  level: number;
  parentTaskId?: string;
  children: TaskHierarchy[];
  expanded: boolean;
}

export interface GridColumn {
  id: string;
  label: string;
  width: number;
  editable: boolean;
  sortable: boolean;
  visible: boolean;
}

class TaskGridService {
  private readonly gridStateKey = 'task_grid_state';
  private readonly maxDemoTasks = 10;
  private readonly maxDemoExpandedLevels = 1;

  /**
   * Get grid state for a project
   */
  async getGridState(projectId: string): Promise<TaskGridState> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      const allStates = await this.getAllGridStates();
      
      let projectState = allStates.find(s => s.projectId === projectId);
      
      if (!projectState) {
        projectState = {
          projectId,
          expandedTaskIds: [],
          columnOrder: ['name', 'startDate', 'endDate', 'duration', 'statusId', 'tags', 'type'],
          columnWidths: {
            name: 200,
            startDate: 120,
            endDate: 120,
            duration: 100,
            statusId: 120,
            tags: 150,
            type: 100
          },
          userId: 'current-user',
          demo: isDemoMode
        };
        allStates.push(projectState);
        await persistentStorage.set(this.gridStateKey, allStates);
      }
      
      return projectState;
    } catch (error) {
      console.error('Error getting grid state:', error);
      return {
        projectId,
        expandedTaskIds: [],
        columnOrder: ['name', 'startDate', 'endDate', 'duration', 'statusId', 'tags', 'type'],
        columnWidths: {
          name: 200,
          startDate: 120,
          endDate: 120,
          duration: 100,
          statusId: 120,
          tags: 150,
          type: 100
        },
        userId: 'current-user'
      };
    }
  }

  /**
   * Update grid state
   */
  async updateGridState(projectId: string, updates: Partial<TaskGridState>): Promise<{ success: boolean; error?: string }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      const allStates = await this.getAllGridStates();
      
      let projectState = allStates.find(s => s.projectId === projectId);
      
      if (!projectState) {
        projectState = await this.getGridState(projectId);
        allStates.push(projectState);
      }
      
      // Apply updates
      Object.assign(projectState, updates);
      projectState.demo = isDemoMode;
      
      // Demo mode restrictions
      if (isDemoMode) {
        // Limit expanded levels
        if (projectState.expandedTaskIds && projectState.expandedTaskIds.length > this.maxDemoExpandedLevels) {
          projectState.expandedTaskIds = projectState.expandedTaskIds.slice(0, this.maxDemoExpandedLevels);
        }
      }
      
      await persistentStorage.set(this.gridStateKey, allStates);
      console.log('Grid state updated:', updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating grid state:', error);
      return { success: false, error: 'Failed to update grid state' };
    }
  }

  /**
   * Toggle task expansion
   */
  async toggleTaskExpansion(projectId: string, taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const state = await this.getGridState(projectId);
      const isDemoMode = await demoModeService.isDemoMode();
      
      let newExpandedTaskIds: string[];
      
      if (state.expandedTaskIds.includes(taskId)) {
        // Collapse task and all its children
        newExpandedTaskIds = state.expandedTaskIds.filter(id => id !== taskId);
      } else {
        // Expand task
        newExpandedTaskIds = [...state.expandedTaskIds, taskId];
        
        // Demo mode: limit expansion levels
        if (isDemoMode && newExpandedTaskIds.length > this.maxDemoExpandedLevels) {
          newExpandedTaskIds = newExpandedTaskIds.slice(0, this.maxDemoExpandedLevels);
        }
      }
      
      return await this.updateGridState(projectId, { expandedTaskIds: newExpandedTaskIds });
    } catch (error) {
      console.error('Error toggling task expansion:', error);
      return { success: false, error: 'Failed to toggle task expansion' };
    }
  }

  /**
   * Expand all tasks
   */
  async expandAllTasks(projectId: string, taskIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      let expandedTaskIds = taskIds;
      
      // Demo mode: limit expansion
      if (isDemoMode) {
        expandedTaskIds = taskIds.slice(0, this.maxDemoExpandedLevels);
      }
      
      return await this.updateGridState(projectId, { expandedTaskIds });
    } catch (error) {
      console.error('Error expanding all tasks:', error);
      return { success: false, error: 'Failed to expand all tasks' };
    }
  }

  /**
   * Collapse all tasks
   */
  async collapseAllTasks(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.updateGridState(projectId, { expandedTaskIds: [] });
    } catch (error) {
      console.error('Error collapsing all tasks:', error);
      return { success: false, error: 'Failed to collapse all tasks' };
    }
  }

  /**
   * Build task hierarchy
   */
  buildTaskHierarchy(tasks: any[]): TaskHierarchy[] {
    const taskMap = new Map<string, TaskHierarchy>();
    const rootTasks: TaskHierarchy[] = [];
    
    // Create task nodes
    tasks.forEach(task => {
      taskMap.set(task.id, {
        id: task.id,
        name: task.name,
        level: 0,
        parentTaskId: task.parentTaskId,
        children: [],
        expanded: false
      });
    });
    
    // Build hierarchy
    tasks.forEach(task => {
      const taskNode = taskMap.get(task.id)!;
      
      if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
        const parentNode = taskMap.get(task.parentTaskId)!;
        parentNode.children.push(taskNode);
        taskNode.level = parentNode.level + 1;
      } else {
        rootTasks.push(taskNode);
      }
    });
    
    return rootTasks;
  }

  /**
   * Flatten task hierarchy for grid display
   */
  flattenTaskHierarchy(tasks: any[], expandedTaskIds: string[]): any[] {
    const result: any[] = [];
    
    const addTask = (task: any, level: number) => {
      const taskWithLevel = { ...task, level };
      result.push(taskWithLevel);
      
      // Add children if expanded
      if (expandedTaskIds.includes(task.id)) {
        const children = tasks.filter(t => t.parentTaskId === task.id);
        children.forEach(child => addTask(child, level + 1));
      }
    };
    
    const rootTasks = tasks.filter(t => !t.parentTaskId);
    rootTasks.forEach(task => addTask(task, 0));
    
    return result;
  }

  /**
   * Get filtered tasks for demo mode
   */
  async getFilteredTasks(tasks: any[]): Promise<any[]> {
    const isDemoMode = await demoModeService.isDemoMode();
    
    if (isDemoMode) {
      return tasks.slice(0, this.maxDemoTasks);
    }
    
    return tasks;
  }

  /**
   * Update column order
   */
  async updateColumnOrder(projectId: string, columnOrder: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      if (isDemoMode) {
        return { success: false, error: 'Column reordering not available in demo mode' };
      }
      
      return await this.updateGridState(projectId, { columnOrder });
    } catch (error) {
      console.error('Error updating column order:', error);
      return { success: false, error: 'Failed to update column order' };
    }
  }

  /**
   * Update column width
   */
  async updateColumnWidth(projectId: string, columnId: string, width: number): Promise<{ success: boolean; error?: string }> {
    try {
      const state = await this.getGridState(projectId);
      const newColumnWidths = { ...state.columnWidths, [columnId]: width };
      
      return await this.updateGridState(projectId, { columnWidths: newColumnWidths });
    } catch (error) {
      console.error('Error updating column width:', error);
      return { success: false, error: 'Failed to update column width' };
    }
  }

  /**
   * Update sort settings
   */
  async updateSortSettings(projectId: string, sortColumn?: string, sortDirection?: 'asc' | 'desc'): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.updateGridState(projectId, { sortColumn, sortDirection });
    } catch (error) {
      console.error('Error updating sort settings:', error);
      return { success: false, error: 'Failed to update sort settings' };
    }
  }

  /**
   * Get default columns configuration
   */
  getDefaultColumns(): GridColumn[] {
    return [
      {
        id: 'name',
        label: 'Name',
        width: 200,
        editable: true,
        sortable: true,
        visible: true
      },
      {
        id: 'startDate',
        label: 'Start Date',
        width: 120,
        editable: true,
        sortable: true,
        visible: true
      },
      {
        id: 'endDate',
        label: 'End Date',
        width: 120,
        editable: true,
        sortable: true,
        visible: true
      },
      {
        id: 'duration',
        label: 'Duration',
        width: 100,
        editable: false,
        sortable: true,
        visible: true
      },
      {
        id: 'statusId',
        label: 'Status',
        width: 120,
        editable: true,
        sortable: true,
        visible: true
      },
      {
        id: 'tags',
        label: 'Tags',
        width: 150,
        editable: true,
        sortable: false,
        visible: true
      },
      {
        id: 'type',
        label: 'Type',
        width: 100,
        editable: false,
        sortable: true,
        visible: true
      }
    ];
  }

  /**
   * Sort tasks by column
   */
  sortTasks(tasks: any[], sortColumn: string, sortDirection: 'asc' | 'desc'): any[] {
    return [...tasks].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      // Handle different data types
      if (sortColumn === 'startDate' || sortColumn === 'endDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortColumn === 'tags') {
        aValue = aValue.length;
        bValue = bValue.length;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Get all grid states
   */
  private async getAllGridStates(): Promise<TaskGridState[]> {
    try {
      const states = await persistentStorage.get(this.gridStateKey);
      return states || [];
    } catch (error) {
      console.error('Error getting all grid states:', error);
      return [];
    }
  }

  /**
   * Clear all grid data (for demo mode reset)
   */
  async clearAllGridData(): Promise<void> {
    try {
      await persistentStorage.remove(this.gridStateKey);
      console.log('All grid data cleared');
    } catch (error) {
      console.error('Error clearing grid data:', error);
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
        await this.clearAllGridData();
        console.log('Demo grid data reset');
      }
    } catch (error) {
      console.error('Error resetting demo grid data:', error);
      throw error;
    }
  }
}

export const taskGridService = new TaskGridService(); 