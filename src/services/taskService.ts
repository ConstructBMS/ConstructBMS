import { persistentStorage } from './persistentStorage';
import { demoModeService } from './demoModeService';
import { taskCommentsService } from './taskCommentsService';

export interface Task {
  // null = root level
  collapsed?: boolean;
  createdAt: Date;
  // optional: highlight bar background
  demo?: boolean;
  description?: string;
  endDate: Date;
  // whether child tasks are hidden
  groupColor?: string | null;
  id: string;
  name: string;
  parentId?: string | null;
  projectId: string;
  startDate: Date;
  statusId: string;
  tags: string[];
  type: 'task' | 'milestone' | 'phase' | 'summary';
  updatedAt: Date;
  userId: string;
}

export interface TaskCustomField {
  demo?: boolean;
  fieldId: string;
  taskId: string;
  value: any;
}

export interface CreateTaskData {
  collapsed?: boolean;
  demo?: boolean;
  description?: string;
  endDate: Date;
  groupColor?: string | null;
  name: string;
  parentId?: string | null;
  projectId: string;
  startDate: Date;
  statusId: string;
  tags: string[];
  type: 'task' | 'milestone' | 'phase' | 'summary';
}

export interface UpdateTaskData {
  collapsed?: boolean;
  demo?: boolean;
  description?: string;
  endDate?: Date;
  groupColor?: string | null;
  name?: string;
  parentId?: string | null;
  startDate?: Date;
  statusId?: string;
  tags?: string[];
  type?: 'task' | 'milestone' | 'phase' | 'summary';
}

class TaskService {
  private readonly tasksKey = 'tasks';
  private readonly taskCustomFieldsKey = 'task_custom_fields';

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<Task | null> {
    try {
      const tasks = await this.getAllTasks();
      const task = tasks.find(t => t.id === taskId);

      if (task) {
        return {
          ...task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting task:', error);
      return null;
    }
  }

  /**
   * Get all tasks for a project
   */
  async getProjectTasks(projectId: string): Promise<Task[]> {
    try {
      const tasks = await this.getAllTasks();
      const projectTasks = tasks.filter(task => task.projectId === projectId);

      return projectTasks.map(task => ({
        ...task,
        startDate: new Date(task.startDate),
        endDate: new Date(task.endDate),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting project tasks:', error);
      return [];
    }
  }

  /**
   * Get task count for demo mode
   */
  async getTaskCount(projectId: string): Promise<number> {
    try {
      const tasks = await this.getProjectTasks(projectId);
      return tasks.length;
    } catch (error) {
      console.error('Error getting task count:', error);
      return 0;
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      // Check demo mode restrictions
      if (isDemoMode) {
        const taskCount = await this.getTaskCount(taskData.projectId);
        if (taskCount >= 3) {
          throw new Error('Maximum 3 tasks allowed in demo mode');
        }
      }

      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...taskData,
        userId: 'current-user', // This would come from auth context
        demo: isDemoMode,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tasks = await this.getAllTasks();
      tasks.push(newTask);
      await persistentStorage.setSetting(this.tasksKey, tasks, 'tasks');

      console.log('Task created:', newTask.id);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, taskData: UpdateTaskData): Promise<Task> {
    try {
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const isDemoMode = await demoModeService.getDemoMode();
      const originalTask = tasks[taskIndex];

      const updatedTask: Task = {
        ...originalTask,
        ...taskData,
        demo: isDemoMode,
        updatedAt: new Date(),
      };

      tasks[taskIndex] = updatedTask;
      await persistentStorage.setSetting(this.tasksKey, tasks, 'tasks');

      // Log changes to history
      await this.logTaskChanges(taskId, originalTask, updatedTask);

      console.log('Task updated:', taskId);
      return {
        ...updatedTask,
        startDate: new Date(updatedTask.startDate),
        endDate: new Date(updatedTask.endDate),
        createdAt: new Date(updatedTask.createdAt),
        updatedAt: new Date(updatedTask.updatedAt),
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getAllTasks();
      const filteredTasks = tasks.filter(t => t.id !== taskId);

      if (filteredTasks.length === tasks.length) {
        throw new Error('Task not found');
      }

      await persistentStorage.setSetting(this.tasksKey, filteredTasks, 'tasks');

      // Also delete custom fields for this task
      await this.deleteTaskCustomFields(taskId);

      console.log('Task deleted:', taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Get custom fields for a task
   */
  async getTaskCustomFields(taskId: string): Promise<TaskCustomField[]> {
    try {
      const allCustomFields = await this.getAllTaskCustomFields();
      return allCustomFields.filter(field => field.taskId === taskId);
    } catch (error) {
      console.error('Error getting task custom fields:', error);
      return [];
    }
  }

  /**
   * Save a custom field value for a task
   */
  async saveTaskCustomField(customField: TaskCustomField): Promise<void> {
    try {
      const allCustomFields = await this.getAllTaskCustomFields();

      // Remove existing value for this task/field combination
      const filteredFields = allCustomFields.filter(
        field =>
          !(
            field.taskId === customField.taskId &&
            field.fieldId === customField.fieldId
          )
      );

      // Add new value
      filteredFields.push(customField);

      await persistentStorage.setSetting(
        this.taskCustomFieldsKey,
        filteredFields,
        'task_custom_fields'
      );
      console.log(
        'Task custom field saved:',
        customField.taskId,
        customField.fieldId
      );
    } catch (error) {
      console.error('Error saving task custom field:', error);
      throw error;
    }
  }

  /**
   * Delete all custom fields for a task
   */
  async deleteTaskCustomFields(taskId: string): Promise<void> {
    try {
      const allCustomFields = await this.getAllTaskCustomFields();
      const filteredFields = allCustomFields.filter(
        field => field.taskId !== taskId
      );
      await persistentStorage.set(this.taskCustomFieldsKey, filteredFields);
      console.log('Task custom fields deleted for task:', taskId);
    } catch (error) {
      console.error('Error deleting task custom fields:', error);
      throw error;
    }
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(projectId: string, statusId: string): Promise<Task[]> {
    try {
      const tasks = await this.getProjectTasks(projectId);
      return tasks.filter(task => task.statusId === statusId);
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      return [];
    }
  }

  /**
   * Get tasks by type
   */
  async getTasksByType(projectId: string, type: string): Promise<Task[]> {
    try {
      const tasks = await this.getProjectTasks(projectId);
      return tasks.filter(task => task.type === type);
    } catch (error) {
      console.error('Error getting tasks by type:', error);
      return [];
    }
  }

  /**
   * Get tasks with specific tags
   */
  async getTasksByTags(projectId: string, tagIds: string[]): Promise<Task[]> {
    try {
      const tasks = await this.getProjectTasks(projectId);
      return tasks.filter(task =>
        tagIds.some(tagId => task.tags.includes(tagId))
      );
    } catch (error) {
      console.error('Error getting tasks by tags:', error);
      return [];
    }
  }

  /**
   * Get tasks in date range
   */
  async getTasksInDateRange(
    projectId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Task[]> {
    try {
      const tasks = await this.getProjectTasks(projectId);
      return tasks.filter(
        task => task.startDate >= startDate && task.endDate <= endDate
      );
    } catch (error) {
      console.error('Error getting tasks in date range:', error);
      return [];
    }
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(projectId: string): Promise<Task[]> {
    try {
      const tasks = await this.getProjectTasks(projectId);
      const now = new Date();
      return tasks.filter(
        task => task.endDate < now && task.statusId !== 'completed'
      );
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      return [];
    }
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(projectId: string, days: number = 7): Promise<Task[]> {
    try {
      const tasks = await this.getProjectTasks(projectId);
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      return tasks.filter(
        task => task.startDate >= now && task.startDate <= futureDate
      );
    } catch (error) {
      console.error('Error getting upcoming tasks:', error);
      return [];
    }
  }

  /**
   * Calculate task duration in days
   */
  calculateTaskDuration(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if task is critical (no float)
   */
  isTaskCritical(task: Task): boolean {
    // This would implement critical path logic
    // For now, return false
    return false;
  }

  /**
   * Get children of a task
   */
  async getChildTasks(parentId: string): Promise<Task[]> {
    try {
      const tasks = await this.getAllTasks();
      return tasks.filter(task => task.parentId === parentId);
    } catch (error) {
      console.error('Error getting child tasks:', error);
      return [];
    }
  }

  /**
   * Get all descendants of a task
   */
  async getDescendantTasks(parentId: string): Promise<Task[]> {
    try {
      const descendants: Task[] = [];
      const children = await this.getChildTasks(parentId);

      for (const child of children) {
        descendants.push(child);
        const grandChildren = await this.getDescendantTasks(child.id);
        descendants.push(...grandChildren);
      }

      return descendants;
    } catch (error) {
      console.error('Error getting descendant tasks:', error);
      return [];
    }
  }

  /**
   * Get parent of a task
   */
  async getParentTask(taskId: string): Promise<Task | null> {
    try {
      const tasks = await this.getAllTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task || !task.parentId) return null;

      return tasks.find(t => t.id === task.parentId) || null;
    } catch (error) {
      console.error('Error getting parent task:', error);
      return null;
    }
  }

  /**
   * Get level of a task in hierarchy
   */
  async getTaskLevel(taskId: string): Promise<number> {
    try {
      let level = 0;
      let currentId = taskId;

      while (true) {
        const parent = await this.getParentTask(currentId);
        if (!parent) break;
        level++;
        currentId = parent.id;
      }

      return level;
    } catch (error) {
      console.error('Error getting task level:', error);
      return 0;
    }
  }

  /**
   * Check if task is visible (not collapsed by any parent)
   */
  async isTaskVisible(taskId: string): Promise<boolean> {
    try {
      let currentId = taskId;

      while (true) {
        const parent = await this.getParentTask(currentId);
        if (!parent) break;

        if (parent.collapsed) return false;
        currentId = parent.id;
      }

      return true;
    } catch (error) {
      console.error('Error checking task visibility:', error);
      return true;
    }
  }

  /**
   * Get visible tasks (flattened hierarchy)
   */
  async getVisibleTasks(projectId: string): Promise<Task[]> {
    try {
      const allTasks = await this.getProjectTasks(projectId);
      const visible: Task[] = [];

      for (const task of allTasks) {
        if (await this.isTaskVisible(task.id)) {
          visible.push(task);
        }
      }

      return visible;
    } catch (error) {
      console.error('Error getting visible tasks:', error);
      return [];
    }
  }

  /**
   * Toggle collapse state of a task
   */
  async toggleTaskCollapse(taskId: string): Promise<boolean> {
    try {
      const task = await this.getTask(taskId);
      if (!task) return false;

      const result = await this.updateTask(taskId, {
        collapsed: !task.collapsed,
      });

      return result.success;
    } catch (error) {
      console.error('Error toggling task collapse:', error);
      return false;
    }
  }

  /**
   * Calculate group duration span for parent task
   */
  async calculateGroupDuration(
    parentId: string
  ): Promise<{
    duration: number;
    endDate: Date | null;
    startDate: Date | null;
  }> {
    try {
      const children = await this.getChildTasks(parentId);
      if (children.length === 0) {
        return { startDate: null, endDate: null, duration: 0 };
      }

      const startDates = children.map(task => task.startDate).filter(Boolean);
      const endDates = children.map(task => task.endDate).filter(Boolean);

      const startDate =
        startDates.length > 0
          ? new Date(Math.min(...startDates.map(d => d.getTime())))
          : null;
      const endDate =
        endDates.length > 0
          ? new Date(Math.max(...endDates.map(d => d.getTime())))
          : null;

      const duration =
        startDate && endDate
          ? this.calculateTaskDuration(startDate, endDate)
          : 0;

      return { startDate, endDate, duration };
    } catch (error) {
      console.error('Error calculating group duration:', error);
      return { startDate: null, endDate: null, duration: 0 };
    }
  }

  /**
   * Build hierarchical structure
   */
  async buildHierarchy(projectId: string): Promise<Task[]> {
    try {
      const tasks = await this.getProjectTasks(projectId);
      const taskMap = new Map(
        tasks.map(task => [task.id, { ...task, children: [] }])
      );
      const rootTasks: Task[] = [];

      for (const task of tasks) {
        if (task.parentId) {
          const parent = taskMap.get(task.parentId);
          if (parent) {
            parent.children.push(taskMap.get(task.id)!);
          }
        } else {
          rootTasks.push(taskMap.get(task.id)!);
        }
      }

      return rootTasks;
    } catch (error) {
      console.error('Error building hierarchy:', error);
      return [];
    }
  }

  /**
   * Validate task data
   */
  validateTaskData(taskData: CreateTaskData | UpdateTaskData): {
    errors: string[];
    isValid: boolean;
  } {
    const errors: string[] = [];

    if ('name' in taskData && (!taskData.name || taskData.name.trim() === '')) {
      errors.push('Task name is required');
    }

    if ('startDate' in taskData && taskData.startDate) {
      if ('endDate' in taskData && taskData.endDate) {
        if (taskData.startDate > taskData.endDate) {
          errors.push('Start date must be before end date');
        }
      }
    }

    if (
      'statusId' in taskData &&
      (!taskData.statusId || taskData.statusId.trim() === '')
    ) {
      errors.push('Status is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get all tasks from storage
   */
  private async getAllTasks(): Promise<Task[]> {
    try {
      const tasks = await persistentStorage.get(this.tasksKey);
      return tasks || [];
    } catch (error) {
      console.error('Error getting all tasks:', error);
      return [];
    }
  }

  /**
   * Get all task custom fields from storage
   */
  private async getAllTaskCustomFields(): Promise<TaskCustomField[]> {
    try {
      const customFields = await persistentStorage.get(
        this.taskCustomFieldsKey
      );
      return customFields || [];
    } catch (error) {
      console.error('Error getting all task custom fields:', error);
      return [];
    }
  }

  /**
   * Clear all task data (for demo mode reset)
   */
  async clearAllTaskData(): Promise<void> {
    try {
      await persistentStorage.remove(this.tasksKey);
      await persistentStorage.remove(this.taskCustomFieldsKey);
      console.log('All task data cleared');
    } catch (error) {
      console.error('Error clearing task data:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      if (isDemoMode) {
        await this.clearAllTaskData();
        console.log('Demo task data reset');
      }
    } catch (error) {
      console.error('Error resetting demo task data:', error);
      throw error;
    }
  }

  /**
   * Log task changes to history
   */
  private async logTaskChanges(
    taskId: string,
    originalTask: Task,
    updatedTask: Task
  ): Promise<void> {
    try {
      const fieldsToTrack = [
        'name',
        'startDate',
        'endDate',
        'statusId',
        'description',
        'type',
        'parentId',
        'collapsed',
        'groupColor',
      ];

      for (const field of fieldsToTrack) {
        const originalValue = originalTask[field as keyof Task];
        const updatedValue = updatedTask[field as keyof Task];

        if (originalValue !== updatedValue) {
          let previousValue = originalValue;
          let newValue = updatedValue;

          // Format dates for display
          if (field === 'startDate' || field === 'endDate') {
            previousValue = originalValue
              ? new Date(originalValue).toISOString().split('T')[0]
              : null;
            newValue = updatedValue
              ? new Date(updatedValue).toISOString().split('T')[0]
              : null;
          }

          // Format arrays for display
          if (Array.isArray(originalValue) && Array.isArray(updatedValue)) {
            previousValue = originalValue.join(', ');
            newValue = updatedValue.join(', ');
          }

          await taskCommentsService.logTaskHistory(
            taskId,
            field,
            previousValue?.toString() || '',
            newValue?.toString() || ''
          );
        }
      }
    } catch (error) {
      console.error('Error logging task changes:', error);
    }
  }
}

export const taskService = new TaskService();
