import { supabase } from './supabase';
import type { GanttTask, GanttLink } from '../components/modules/GanttCanvas';

class TaskTableService {
  // Get tasks with WBS numbering
  async getTasksWithWBS(projectId: string): Promise<GanttTask[]> {
    try {
      const { data, error } = await supabase
        .from('asta_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('wbs_number');

      if (error) {
        console.warn('Failed to fetch tasks from database:', error);
        return this.getDemoTasksWithWBS();
      }

      return data.map(this.mapDatabaseTaskToGanttTask);
    } catch (error) {
      console.warn('Get tasks with WBS failed:', error);
      return this.getDemoTasksWithWBS();
    }
  }

  // Update task with validation
  async updateTask(taskId: string, updates: Partial<GanttTask>): Promise<{ errors: string[], success: boolean; }> {
    const errors: string[] = [];

    try {
      // Validate updates
      if (updates.name !== undefined && (!updates.name || updates.name.trim().length === 0)) {
        errors.push('Task name is required');
      }

      if (updates.startDate && updates.endDate && updates.startDate >= updates.endDate) {
        errors.push('Start date must be before end date');
      }

      if (updates.progress !== undefined && (updates.progress < 0 || updates.progress > 100)) {
        errors.push('Progress must be between 0 and 100');
      }

      if (errors.length > 0) {
        return { success: false, errors };
      }

      // Prepare update data
      const updateData: any = {};

      if (updates.name !== undefined) {
        updateData.name = updates.name;
      }
      if (updates.startDate) {
        updateData.start_date = updates.startDate.toISOString();
      }
      if (updates.endDate) {
        updateData.end_date = updates.endDate.toISOString();
      }
      if (updates.progress !== undefined) {
        updateData.progress = updates.progress;
      }
      if (updates.assignedTo !== undefined) {
        updateData.assigned_to = updates.assignedTo;
      }
      if (updates.status) {
        updateData.status = updates.status;
      }
      if (updates.wbsNumber !== undefined) {
        updateData.wbs_number = updates.wbsNumber;
      }

      // Update in database
      const { error } = await supabase
        .from('asta_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        console.warn('Failed to update task in database:', error);
        errors.push('Database update failed');
        return { success: false, errors };
      }

      console.log('Task updated successfully:', taskId);
      return { success: true, errors: [] };

    } catch (error) {
      console.warn('Update task failed:', error);
      errors.push('Update operation failed');
      return { success: false, errors };
    }
  }

  // Generate WBS numbering
  generateWBSNumbering(tasks: GanttTask[]): GanttTask[] {
    const updatedTasks = [...tasks];
    let wbsCounter = 1;

    const assignWBS = (taskList: GanttTask[], parentWBS: string = '') => {
      taskList.forEach(task => {
        const currentWBS = parentWBS ? `${parentWBS}.${wbsCounter}` : `${wbsCounter}`;
        
        const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
          updatedTasks[taskIndex] = { 
            ...updatedTasks[taskIndex], 
            wbsNumber: currentWBS 
          } as GanttTask;
        }

        wbsCounter++;

        // Process children
        if (task.children && task.children.length > 0) {
          const childTasks = task.children.map(childId => 
            updatedTasks.find(t => t.id === childId)
          ).filter(Boolean) as GanttTask[];
          
          assignWBS(childTasks, currentWBS);
        }
      });
    };

    // Start with root tasks
    const rootTasks = updatedTasks.filter(task => !task.parentId);
    assignWBS(rootTasks);

    return updatedTasks;
  }

  // Save WBS numbering to database
  async saveWBSNumbering(tasks: GanttTask[]): Promise<void> {
    try {
      const updates = tasks.map(task => ({
        id: task.id,
        wbs_number: task.wbsNumber
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('asta_tasks')
          .update({ wbs_number: update.wbs_number })
          .eq('id', update.id);

        if (error) {
          console.warn('Failed to update WBS for task:', update.id, error);
        }
      }

      console.log('WBS numbering saved successfully');
    } catch (error) {
      console.warn('Save WBS numbering failed:', error);
    }
  }

  // Calculate task duration
  calculateDuration(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Format date for display
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Validate task data
  validateTask(task: GanttTask, field: keyof GanttTask, value: any): string | null {
    switch (field) {
      case 'name':
        if (!value || String(value).trim().length === 0) {
          return 'Task name is required';
        }
        break;
      case 'startDate':
        if (value instanceof Date && task.endDate && value >= task.endDate) {
          return 'Start date must be before end date';
        }
        break;
      case 'endDate':
        if (value instanceof Date && task.startDate && value <= task.startDate) {
          return 'End date must be after start date';
        }
        break;
      case 'progress':
        const progress = Number(value);
        if (isNaN(progress) || progress < 0 || progress > 100) {
          return 'Progress must be between 0 and 100';
        }
        break;
      case 'wbsNumber':
        if (value && !/^\d+(\.\d+)*$/.test(value)) {
          return 'WBS number must be in format 1.2.3';
        }
        break;
    }
    return null;
  }

  // Get task dependencies
  getTaskDependencies(taskId: string, links: GanttLink[]): GanttLink[] {
    return links.filter(link => link.targetTaskId === taskId);
  }

  // Get task dependents
  getTaskDependents(taskId: string, links: GanttLink[]): GanttLink[] {
    return links.filter(link => link.sourceTaskId === taskId);
  }

  // Check if task can be moved
  canMoveTask(taskId: string, newStartDate: Date, tasks: GanttTask[], links: GanttLink[]): { canMove: boolean; reason?: string } {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { canMove: false, reason: 'Task not found' };

    const duration = this.calculateDuration(task.startDate, task.endDate);
    const newEndDate = new Date(newStartDate.getTime() + duration * 24 * 60 * 60 * 1000);

    // Check dependencies
    const dependencies = this.getTaskDependencies(taskId, links);
    for (const dep of dependencies) {
      const depTask = tasks.find(t => t.id === dep.sourceTaskId);
      if (depTask) {
        const earliestStart = new Date(depTask.endDate.getTime() + dep.lag * 24 * 60 * 60 * 1000);
        if (newStartDate < earliestStart) {
          return { canMove: false, reason: `Cannot start before dependency "${depTask.name}"` };
        }
      }
    }

    return { canMove: true };
  }

  // Auto-save task updates
  async autoSaveTask(taskId: string, updates: Partial<GanttTask>): Promise<void> {
    try {
      await this.updateTask(taskId, updates);
    } catch (error) {
      console.warn('Auto-save failed for task:', taskId, error);
    }
  }

  // Batch update tasks
  async batchUpdateTasks(updates: Array<{ taskId: string; updates: Partial<GanttTask> }>): Promise<{ errors: string[], success: boolean; }> {
    const errors: string[] = [];

    try {
      for (const { taskId, updates: taskUpdates } of updates) {
        const result = await this.updateTask(taskId, taskUpdates);
        if (!result.success) {
          errors.push(...result.errors.map(error => `Task ${taskId}: ${error}`));
        }
      }

      return { success: errors.length === 0, errors };
    } catch (error) {
      console.warn('Batch update failed:', error);
      errors.push('Batch update operation failed');
      return { success: false, errors };
    }
  }

  // Map database task to Gantt task
  private mapDatabaseTaskToGanttTask(dbTask: any): GanttTask {
    const task: GanttTask = {
      id: dbTask.id,
      name: dbTask.name,
      startDate: new Date(dbTask.start_date),
      endDate: new Date(dbTask.end_date),
      progress: dbTask.progress || 0,
      isMilestone: dbTask.is_milestone || false,
      isCritical: dbTask.is_critical || false,
      level: dbTask.level || 0,
      parentId: dbTask.parent_task_id,
      children: dbTask.children || [],
      assignedTo: dbTask.assigned_to,
      status: dbTask.status || 'not-started',
      float: dbTask.float || 0,
      constraintType: dbTask.constraint_type,
      wbsNumber: dbTask.wbs_number
    };

    if (dbTask.constraint_date) {
      task.constraintDate = new Date(dbTask.constraint_date);
    }

    return task;
  }

  // Get demo tasks with WBS numbering
  private getDemoTasksWithWBS(): GanttTask[] {
    const now = new Date();
    const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return [
      {
        id: 'task-1',
        name: 'Project Planning',
        startDate: new Date(baseDate.getTime() + 0 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        progress: 100,
        isMilestone: false,
        isCritical: true,
        level: 0,
        wbsNumber: '1',
        assignedTo: 'John Smith',
        status: 'completed',
        float: 0
      },
      {
        id: 'task-2',
        name: 'Foundation Design',
        startDate: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        progress: 75,
        isMilestone: false,
        isCritical: true,
        level: 0,
        wbsNumber: '2',
        assignedTo: 'Sarah Johnson',
        status: 'in-progress',
        float: 0
      },
      {
        id: 'task-3',
        name: 'Foundation Complete',
        startDate: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        progress: 0,
        isMilestone: true,
        isCritical: true,
        level: 0,
        wbsNumber: '3',
        assignedTo: 'Mike Wilson',
        status: 'not-started',
        float: 0
      },
      {
        id: 'task-4',
        name: 'Structural Framework',
        startDate: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 35 * 24 * 60 * 60 * 1000),
        progress: 0,
        isMilestone: false,
        isCritical: false,
        level: 0,
        wbsNumber: '4',
        assignedTo: 'Lisa Brown',
        status: 'not-started',
        float: 5
      },
      {
        id: 'task-5',
        name: 'Electrical Installation',
        startDate: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000),
        progress: 0,
        isMilestone: false,
        isCritical: false,
        level: 0,
        wbsNumber: '5',
        assignedTo: 'David Lee',
        status: 'not-started',
        float: 10
      },
      {
        id: 'task-6',
        name: 'Project Handover',
        startDate: new Date(baseDate.getTime() + 50 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 50 * 24 * 60 * 60 * 1000),
        progress: 0,
        isMilestone: true,
        isCritical: true,
        level: 0,
        wbsNumber: '6',
        assignedTo: 'Project Manager',
        status: 'not-started',
        float: 0
      }
    ];
  }
}

export const taskTableService = new TaskTableService(); 