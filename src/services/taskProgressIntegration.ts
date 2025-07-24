import { supabase } from './supabase';
import { progressTrackingService } from './progressTrackingService';
import { demoModeService } from './demoModeService';

export interface TaskWithProgress {
  actualFinishDate: string | null;
  actualStartDate: string | null;
  assignedTo?: string;
  demo: boolean;
  endDate: Date;
  id: string;
  level: number;
  name: string;
  parentId?: string;
  percentComplete: number;
  progress: number;
  progressUpdatedAt: Date | null;
  startDate: Date;
  status: string;
  progressUpdatedBy: string | null;
}

class TaskProgressIntegrationService {
  /**
   * Get tasks with progress data
   */
  async getTasksWithProgress(projectId: string): Promise<TaskWithProgress[]> {
    try {
      const { data, error } = await supabase
        .from('asta_tasks')
        .select(`
          id,
          name,
          start_date,
          end_date,
          progress,
          percent_complete,
          actual_start_date,
          actual_finish_date,
          progress_updated_by,
          progress_updated_at,
          demo,
          status,
          assigned_to,
          level,
          parent_task_id
        `)
        .eq('project_id', projectId)
        .order('level, start_date');

      if (error) throw error;

      return data.map(this.mapDatabaseTaskToTaskWithProgress);
    } catch (error) {
      console.error('Error fetching tasks with progress:', error);
      return [];
    }
  }

  /**
   * Get a single task with progress data
   */
  async getTaskWithProgress(taskId: string): Promise<TaskWithProgress | null> {
    try {
      const { data, error } = await supabase
        .from('asta_tasks')
        .select(`
          id,
          name,
          start_date,
          end_date,
          progress,
          percent_complete,
          actual_start_date,
          actual_finish_date,
          progress_updated_by,
          progress_updated_at,
          demo,
          status,
          assigned_to,
          level,
          parent_task_id
        `)
        .eq('id', taskId)
        .single();

      if (error) throw error;

      return this.mapDatabaseTaskToTaskWithProgress(data);
    } catch (error) {
      console.error('Error fetching task with progress:', error);
      return null;
    }
  }

  /**
   * Update task progress and sync with main progress field
   */
  async updateTaskProgressWithSync(update: {
    actualFinishDate?: string | null;
    actualStartDate?: string | null;
    percentComplete: number;
    taskId: string;
  }): Promise<boolean> {
    try {
      const isDemo = await demoModeService.isDemoMode();
      
      // Update progress tracking fields
      const progressSuccess = await progressTrackingService.updateTaskProgress({
        taskId: update.taskId,
        percentComplete: update.percentComplete,
        actualStartDate: update.actualStartDate,
        actualFinishDate: update.actualFinishDate,
        demoMode: isDemo
      });

      if (!progressSuccess) return false;

      // Sync with main progress field for backward compatibility
      const { error } = await supabase
        .from('asta_tasks')
        .update({
          progress: update.percentComplete
        })
        .eq('id', update.taskId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating task progress with sync:', error);
      return false;
    }
  }

  /**
   * Get progress statistics for a project
   */
  async getProjectProgressStats(projectId: string): Promise<{
    averageProgress: number;
    completedTasks: number;
    demoTasks: number;
    inProgressTasks: number;
    notStartedTasks: number;
    totalTasks: number;
  }> {
    try {
      const tasks = await this.getTasksWithProgress(projectId);
      
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.percentComplete === 100).length;
      const inProgressTasks = tasks.filter(t => t.percentComplete > 0 && t.percentComplete < 100).length;
      const notStartedTasks = tasks.filter(t => t.percentComplete === 0).length;
      const demoTasks = tasks.filter(t => t.demo).length;
      
      const totalProgress = tasks.reduce((sum, task) => sum + task.percentComplete, 0);
      const averageProgress = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        notStartedTasks,
        averageProgress,
        demoTasks
      };
    } catch (error) {
      console.error('Error getting project progress stats:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        notStartedTasks: 0,
        averageProgress: 0,
        demoTasks: 0
      };
    }
  }

  /**
   * Get tasks that need attention (overdue, behind schedule, etc.)
   */
  async getTasksNeedingAttention(projectId: string): Promise<TaskWithProgress[]> {
    try {
      const tasks = await this.getTasksWithProgress(projectId);
      const today = new Date();
      
      return tasks.filter(task => {
        // Tasks that are overdue
        if (task.endDate < today && task.percentComplete < 100) {
          return true;
        }
        
        // Tasks that are behind schedule (less than 50% complete and past halfway point)
        const taskDuration = task.endDate.getTime() - task.startDate.getTime();
        const elapsed = today.getTime() - task.startDate.getTime();
        const expectedProgress = Math.min(100, Math.round((elapsed / taskDuration) * 100));
        
        if (task.percentComplete < expectedProgress - 20) {
          return true;
        }
        
        return false;
      });
    } catch (error) {
      console.error('Error getting tasks needing attention:', error);
      return [];
    }
  }

  /**
   * Map database task to TaskWithProgress interface
   */
  private mapDatabaseTaskToTaskWithProgress(dbTask: any): TaskWithProgress {
    return {
      id: dbTask.id,
      name: dbTask.name,
      startDate: new Date(dbTask.start_date),
      endDate: new Date(dbTask.end_date),
      progress: dbTask.progress || 0,
      percentComplete: dbTask.percent_complete || 0,
      actualStartDate: dbTask.actual_start_date,
      actualFinishDate: dbTask.actual_finish_date,
      progressUpdatedBy: dbTask.progress_updated_by,
      progressUpdatedAt: dbTask.progress_updated_at ? new Date(dbTask.progress_updated_at) : null,
      demo: dbTask.demo || false,
      status: dbTask.status || 'not-started',
      assignedTo: dbTask.assigned_to,
      level: dbTask.level || 0,
      parentId: dbTask.parent_task_id
    };
  }

  /**
   * Initialize progress tracking for existing tasks
   */
  async initializeProgressTracking(projectId: string): Promise<boolean> {
    try {
      const { data: tasks, error } = await supabase
        .from('asta_tasks')
        .select('id, progress')
        .eq('project_id', projectId)
        .is('percent_complete', null);

      if (error) throw error;

      // Initialize percent_complete with existing progress values
      for (const task of tasks) {
        await supabase
          .from('asta_tasks')
          .update({
            percent_complete: task.progress || 0
          })
          .eq('id', task.id);
      }

      return true;
    } catch (error) {
      console.error('Error initializing progress tracking:', error);
      return false;
    }
  }
}

// Export singleton instance
export const taskProgressIntegration = new TaskProgressIntegrationService(); 