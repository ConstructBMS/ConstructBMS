import { supabase } from './supabase';
import type { GanttTask, GanttLink } from '../components/modules/GanttCanvas';

class GanttCanvasService {
  // Get tasks for a project
  async getProjectTasks(projectId: string): Promise<GanttTask[]> {
    try {
      const { data, error } = await supabase
        .from('asta_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('wbs_number');

      if (error) {
        console.warn('Failed to fetch tasks from database:', error);
        return this.getDemoTasks();
      }

      return data.map(this.mapDatabaseTaskToGanttTask);
    } catch (error) {
      console.warn('Get project tasks failed:', error);
      return this.getDemoTasks();
    }
  }

  // Get task links for a project
  async getProjectLinks(projectId: string): Promise<GanttLink[]> {
    try {
      const { data, error } = await supabase
        .from('asta_task_links')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        console.warn('Failed to fetch task links from database:', error);
        return this.getDemoLinks();
      }

      return data.map(this.mapDatabaseLinkToGanttLink);
    } catch (error) {
      console.warn('Get project links failed:', error);
      return this.getDemoLinks();
    }
  }

  // Update task dates and duration
  async updateTask(taskId: string, updates: Partial<GanttTask>): Promise<void> {
    try {
      const updateData: any = {};

      if (updates.startDate) {
        updateData.start_date = updates.startDate.toISOString();
      }
      if (updates.endDate) {
        updateData.end_date = updates.endDate.toISOString();
      }
      if (updates.progress !== undefined) {
        updateData.progress = updates.progress;
      }
      if (updates.status) {
        updateData.status = updates.status;
      }

      const { error } = await supabase
        .from('asta_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        console.warn('Failed to update task in database:', error);
      } else {
        console.log('Task updated successfully:', taskId);
      }
    } catch (error) {
      console.warn('Update task failed:', error);
    }
  }

  // Calculate critical path
  calculateCriticalPath(tasks: GanttTask[], links: GanttLink[]): string[] {
    try {
      // Simple critical path calculation
      // In a real implementation, this would use a more sophisticated algorithm
      
      const criticalTasks: string[] = [];
      
      // Find tasks with no float (or minimal float)
      tasks.forEach(task => {
        if (task.float <= 1) { // 1 day or less float
          criticalTasks.push(task.id);
        }
      });

      // If no critical tasks found, mark the longest task as critical
      if (criticalTasks.length === 0 && tasks.length > 0) {
        const longestTask = tasks.reduce((longest, current) => {
          const longestDuration = longest.endDate.getTime() - longest.startDate.getTime();
          const currentDuration = current.endDate.getTime() - current.startDate.getTime();
          return currentDuration > longestDuration ? current : longest;
        });
        criticalTasks.push(longestTask.id);
      }

      return criticalTasks;
    } catch (error) {
      console.warn('Critical path calculation failed:', error);
      return [];
    }
  }

  // Calculate float for all tasks
  calculateFloat(tasks: GanttTask[], links: GanttLink[]): Map<string, number> {
    try {
      const floatMap = new Map<string, number>();
      
      // Simple float calculation
      // In a real implementation, this would use forward/backward pass
      
      tasks.forEach(task => {
        // Calculate float based on dependencies
        const dependencies = links.filter(link => link.targetTaskId === task.id);
        let maxDependencyEnd = task.startDate;
        
        dependencies.forEach(dep => {
          const depTask = tasks.find(t => t.id === dep.sourceTaskId);
          if (depTask) {
            const depEnd = new Date(depTask.endDate.getTime() + dep.lag * 24 * 60 * 60 * 1000);
            if (depEnd > maxDependencyEnd) {
              maxDependencyEnd = depEnd;
            }
          }
        });

        const float = Math.max(0, (task.endDate.getTime() - maxDependencyEnd.getTime()) / (24 * 60 * 60 * 1000));
        floatMap.set(task.id, float);
      });

      return floatMap;
    } catch (error) {
      console.warn('Float calculation failed:', error);
      return new Map();
    }
  }

  // Get project date range
  getProjectDateRange(tasks: GanttTask[]): { startDate: Date; endDate: Date } {
    if (tasks.length === 0) {
      const now = new Date();
      return {
        startDate: now,
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };
    }

    const startDates = tasks.map(task => task.startDate);
    const endDates = tasks.map(task => task.endDate);

    const startDate = new Date(Math.min(...startDates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...endDates.map(d => d.getTime())));

    // Add some padding
    startDate.setDate(startDate.getDate() - 7);
    endDate.setDate(endDate.getDate() + 7);

    return { startDate, endDate };
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

  // Map database link to Gantt link
  private mapDatabaseLinkToGanttLink(dbLink: any): GanttLink {
    return {
      id: dbLink.id,
      sourceTaskId: dbLink.source_task_id,
      targetTaskId: dbLink.target_task_id,
      type: dbLink.link_type || 'finish-to-start',
      lag: dbLink.lag || 0
    };
  }

  // Get demo tasks for testing
  private getDemoTasks(): GanttTask[] {
    const now = new Date();
    const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Create tasks with fixed IDs for proper linking
    const task1 = crypto.randomUUID();
    const task2 = crypto.randomUUID();
    const task3 = crypto.randomUUID();
    const task4 = crypto.randomUUID();
    const task5 = crypto.randomUUID();
    const task6 = crypto.randomUUID();

    return [
      {
        id: task1,
        name: 'Project Planning',
        startDate: new Date(baseDate.getTime() + 0 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        progress: 100,
        isMilestone: false,
        isCritical: true,
        level: 0,
        assignedTo: 'John Smith',
        status: 'completed',
        float: 0
      },
      {
        id: task2,
        name: 'Foundation Design',
        startDate: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        progress: 75,
        isMilestone: false,
        isCritical: true,
        level: 0,
        assignedTo: 'Sarah Johnson',
        status: 'in-progress',
        float: 0
      },
      {
        id: task3,
        name: 'Foundation Complete',
        startDate: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        progress: 0,
        isMilestone: true,
        isCritical: true,
        level: 0,
        assignedTo: 'Mike Wilson',
        status: 'not-started',
        float: 0
      },
      {
        id: task4,
        name: 'Structural Framework',
        startDate: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 35 * 24 * 60 * 60 * 1000),
        progress: 0,
        isMilestone: false,
        isCritical: false,
        level: 0,
        assignedTo: 'Lisa Brown',
        status: 'not-started',
        float: 5
      },
      {
        id: task5,
        name: 'Electrical Installation',
        startDate: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000),
        progress: 0,
        isMilestone: false,
        isCritical: false,
        level: 0,
        assignedTo: 'David Lee',
        status: 'not-started',
        float: 10
      },
      {
        id: task6,
        name: 'Project Handover',
        startDate: new Date(baseDate.getTime() + 50 * 24 * 60 * 60 * 1000),
        endDate: new Date(baseDate.getTime() + 50 * 24 * 60 * 60 * 1000),
        progress: 0,
        isMilestone: true,
        isCritical: true,
        level: 0,
        assignedTo: 'Project Manager',
        status: 'not-started',
        float: 0
      }
    ];
  }

  // Get demo links for testing
  private getDemoLinks(): GanttLink[] {
    // Get the demo tasks to use their IDs for proper linking
    const demoTasks = this.getDemoTasks();
    
    if (demoTasks.length < 2) {
      return [];
    }

    return [
      {
        id: crypto.randomUUID(),
        sourceTaskId: demoTasks[0]?.id || '',
        targetTaskId: demoTasks[1]?.id || '',
        type: 'finish-to-start',
        lag: 0
      },
      {
        id: crypto.randomUUID(),
        sourceTaskId: demoTasks[1]?.id || '',
        targetTaskId: demoTasks[2]?.id || '',
        type: 'finish-to-start',
        lag: 0
      },
      {
        id: crypto.randomUUID(),
        sourceTaskId: demoTasks[2]?.id || '',
        targetTaskId: demoTasks[3]?.id || '',
        type: 'finish-to-start',
        lag: 0
      },
      {
        id: crypto.randomUUID(),
        sourceTaskId: demoTasks[3]?.id || '',
        targetTaskId: demoTasks[4]?.id || '',
        type: 'start-to-start',
        lag: 10
      },
      {
        id: crypto.randomUUID(),
        sourceTaskId: demoTasks[4]?.id || '',
        targetTaskId: demoTasks[5]?.id || '',
        type: 'finish-to-start',
        lag: 0
      }
    ];
  }

  // Save task updates to database
  async saveTaskUpdates(updates: Array<{ taskId: string; updates: Partial<GanttTask> }>): Promise<void> {
    try {
      for (const { taskId, updates: taskUpdates } of updates) {
        await this.updateTask(taskId, taskUpdates);
      }
      console.log('All task updates saved successfully');
    } catch (error) {
      console.warn('Save task updates failed:', error);
    }
  }

  // Get task dependencies
  getTaskDependencies(taskId: string, links: GanttLink[]): GanttLink[] {
    return links.filter(link => link.targetTaskId === taskId);
  }

  // Get task dependents
  getTaskDependents(taskId: string, links: GanttLink[]): GanttLink[] {
    return links.filter(link => link.sourceTaskId === taskId);
  }

  // Validate task dates
  validateTaskDates(task: GanttTask, tasks: GanttTask[], links: GanttLink[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if end date is after start date
    if (task.endDate <= task.startDate) {
      errors.push('End date must be after start date');
    }

    // Check dependencies
    const dependencies = this.getTaskDependencies(task.id, links);
    dependencies.forEach(dep => {
      const depTask = tasks.find(t => t.id === dep.sourceTaskId);
      if (depTask) {
        const earliestStart = new Date(depTask.endDate.getTime() + dep.lag * 24 * 60 * 60 * 1000);
        if (task.startDate < earliestStart) {
          errors.push(`Task must start after dependency "${depTask.name}"`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const ganttCanvasService = new GanttCanvasService(); 