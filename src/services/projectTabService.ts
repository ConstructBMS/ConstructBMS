import { supabase } from './supabase';
import type { ProjectOperation, ProjectCalendar, TaskConstraint, WBSNumbering } from '../components/modules/ribbonTabs/ProjectTab';

class ProjectTabService {
  // Handle project operations
  async handleProjectOperation(operation: ProjectOperation): Promise<void> {
    try {
      switch (operation.type) {
        case 'set-calendar':
          await this.handleSetCalendar(operation.data);
          break;
        case 'set-constraint':
          await this.handleSetConstraint(operation.data);
          break;
        case 'define-deadline':
          await this.handleDefineDeadline(operation.data);
          break;
        case 'toggle-summary':
          await this.handleToggleSummary(operation.data);
          break;
        case 'apply-wbs':
          await this.handleApplyWBS(operation.data);
          break;
        case 'update-task':
          await this.handleUpdateTask(operation.data);
          break;
        default:
          console.warn('Unknown project operation:', operation.type);
      }
    } catch (error) {
      console.error('Project operation failed:', error);
      throw error;
    }
  }

  // Handle setting project calendar
  private async handleSetCalendar(data: any): Promise<void> {
    if (data.action === 'edit') {
      console.log('Opening calendar editor...');
      // TODO: Open calendar editor modal
      return;
    }

    if (data.calendar) {
      console.log('Setting project calendar:', data.calendar.name);
      
      try {
        // Update project settings in database
        const { error } = await supabase
          .from('projects')
          .update({
            calendar_id: data.calendar.id,
            calendar_settings: data.calendar,
            updated_at: new Date().toISOString()
          })
          .eq('id', this.getCurrentProjectId());

        if (error) {
          console.warn('Failed to update project calendar in database:', error);
          // Continue with local update
        }

        // Update local state
        this.updateProjectCalendar(data.calendar);
      } catch (error) {
        console.warn('Calendar update failed, using local state only:', error);
        this.updateProjectCalendar(data.calendar);
      }
    }
  }

  // Handle setting task constraints
  private async handleSetConstraint(data: any): Promise<void> {
    if (data.action === 'clear') {
      console.log('Clearing constraints for tasks:', data.taskIds);
      await this.clearTaskConstraints(data.taskIds);
      return;
    }

    if (data.constraint && data.taskIds) {
      console.log(`Setting constraint '${data.constraint}' for tasks:`, data.taskIds);
      
      try {
        // Update tasks in database
        const updates = data.taskIds.map((taskId: string) => ({
          id: taskId,
          constraint_type: data.constraint,
          constraint_date: data.date || null,
          updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('tasks')
          .upsert(updates, { onConflict: 'id' });

        if (error) {
          console.warn('Failed to update task constraints in database:', error);
          // Continue with local update
        }

        // Update local state
        this.updateTaskConstraints(data.taskIds, data.constraint, data.date);
      } catch (error) {
        console.warn('Constraint update failed, using local state only:', error);
        this.updateTaskConstraints(data.taskIds, data.constraint, data.date);
      }
    }
  }

  // Handle defining deadlines
  private async handleDefineDeadline(data: any): Promise<void> {
    if (data.action === 'clear') {
      console.log('Clearing deadlines for tasks:', data.taskIds);
      await this.clearTaskDeadlines(data.taskIds);
      return;
    }

    if (data.action === 'set' && data.taskIds) {
      console.log('Setting deadlines for tasks:', data.taskIds);
      
      // Prompt for deadline date
      const deadlineDate = await this.promptForDeadline();
      if (!deadlineDate) return;

      try {
        // Update tasks in database
        const updates = data.taskIds.map((taskId: string) => ({
          id: taskId,
          deadline: deadlineDate.toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('tasks')
          .upsert(updates, { onConflict: 'id' });

        if (error) {
          console.warn('Failed to update task deadlines in database:', error);
          // Continue with local update
        }

        // Update local state
        this.updateTaskDeadlines(data.taskIds, deadlineDate);
      } catch (error) {
        console.warn('Deadline update failed, using local state only:', error);
        this.updateTaskDeadlines(data.taskIds, deadlineDate);
      }
    }
  }

  // Handle toggling project summary
  private async handleToggleSummary(data: any): Promise<void> {
    console.log('Toggling project summary task');
    
    try {
      // Update project settings in database
      const { error } = await supabase
        .from('projects')
        .update({
          show_summary_task: data.show,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.getCurrentProjectId());

      if (error) {
        console.warn('Failed to update project summary setting in database:', error);
        // Continue with local update
      }

      // Update local state
      this.updateProjectSummary(data.show);
    } catch (error) {
      console.warn('Project summary update failed, using local state only:', error);
      this.updateProjectSummary(data.show);
    }
  }

  // Handle applying WBS numbering
  private async handleApplyWBS(data: any): Promise<void> {
    console.log('Applying WBS numbering:', data);
    
    try {
      // Update project settings in database
      const { error } = await supabase
        .from('projects')
        .update({
          wbs_enabled: data.enabled,
          wbs_format: data.format || null,
          wbs_separator: data.separator || '.',
          wbs_auto_update: data.autoUpdate !== false,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.getCurrentProjectId());

      if (error) {
        console.warn('Failed to update WBS settings in database:', error);
        // Continue with local update
      }

      // Update local state
      this.updateWBSNumbering(data);

      // If WBS is enabled, apply numbering to all tasks
      if (data.enabled && data.format) {
        await this.applyWBSNumberingToTasks(data.format, data.separator);
      }
    } catch (error) {
      console.warn('WBS update failed, using local state only:', error);
      this.updateWBSNumbering(data);
    }
  }

  // Handle updating task information
  private async handleUpdateTask(data: any): Promise<void> {
    console.log('Updating task:', data);
    
    switch (data.action) {
      case 'project-info':
        // TODO: Open project info modal
        console.log('Opening project info modal...');
        break;
      case 'project-options':
        // TODO: Open project options modal
        console.log('Opening project options modal...');
        break;
      default:
        console.warn('Unknown task update action:', data.action);
    }
  }

  // Helper methods for local state updates
  private updateProjectCalendar(calendar: ProjectCalendar): void {
    // TODO: Update local project state
    console.log('Updated project calendar locally:', calendar);
  }

  private updateTaskConstraints(taskIds: string[], constraint: string, date?: Date): void {
    // TODO: Update local task state
    console.log('Updated task constraints locally:', { taskIds, constraint, date });
  }

  private updateTaskDeadlines(taskIds: string[], deadline: Date): void {
    // TODO: Update local task state
    console.log('Updated task deadlines locally:', { taskIds, deadline });
  }

  private updateProjectSummary(show: boolean): void {
    // TODO: Update local project state
    console.log('Updated project summary locally:', show);
  }

  private updateWBSNumbering(wbs: WBSNumbering): void {
    // TODO: Update local project state
    console.log('Updated WBS numbering locally:', wbs);
  }

  // Helper methods for database operations
  private async clearTaskConstraints(taskIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          constraint_type: null,
          constraint_date: null,
          updated_at: new Date().toISOString()
        })
        .in('id', taskIds);

      if (error) {
        console.warn('Failed to clear task constraints in database:', error);
      }
    } catch (error) {
      console.warn('Clear constraints failed:', error);
    }
  }

  private async clearTaskDeadlines(taskIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          deadline: null,
          updated_at: new Date().toISOString()
        })
        .in('id', taskIds);

      if (error) {
        console.warn('Failed to clear task deadlines in database:', error);
      }
    } catch (error) {
      console.warn('Clear deadlines failed:', error);
    }
  }

  private async applyWBSNumberingToTasks(format: string, separator: string): Promise<void> {
    try {
      // Get all tasks for current project
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, name, parent_id, level')
        .eq('project_id', this.getCurrentProjectId())
        .order('level, name');

      if (error) {
        console.warn('Failed to fetch tasks for WBS numbering:', error);
        return;
      }

      // Generate WBS numbers
      const wbsUpdates = this.generateWBSNumbers(tasks, format, separator);

      // Update tasks in database
      const { error: updateError } = await supabase
        .from('tasks')
        .upsert(wbsUpdates, { onConflict: 'id' });

      if (updateError) {
        console.warn('Failed to update WBS numbers in database:', updateError);
      }
    } catch (error) {
      console.warn('WBS numbering failed:', error);
    }
  }

  private generateWBSNumbers(tasks: any[], format: string, separator: string): any[] {
    const updates: any[] = [];
    let levelCounts: { [key: number]: number } = {};

    tasks.forEach((task) => {
      const level = task.level || 0;
      levelCounts[level] = (levelCounts[level] || 0) + 1;

      let wbsNumber = '';
      if (format === 'n.n.n') {
        wbsNumber = `${levelCounts[0] || 1}${separator}${levelCounts[1] || 1}${separator}${levelCounts[2] || 1}`;
      } else if (format === 'n-n-n') {
        wbsNumber = `${levelCounts[0] || 1}-${levelCounts[1] || 1}-${levelCounts[2] || 1}`;
      } else if (format === 'n_n_n') {
        wbsNumber = `${levelCounts[0] || 1}_${levelCounts[1] || 1}_${levelCounts[2] || 1}`;
      } else if (format === 'a.n.n') {
        const letter = String.fromCharCode(65 + (levelCounts[0] || 1) - 1);
        wbsNumber = `${letter}${separator}${levelCounts[1] || 1}${separator}${levelCounts[2] || 1}`;
      } else if (format === 'n.n') {
        wbsNumber = `${levelCounts[0] || 1}${separator}${levelCounts[1] || 1}`;
      }

      updates.push({
        id: task.id,
        wbs_number: wbsNumber,
        updated_at: new Date().toISOString()
      });
    });

    return updates;
  }

  // Helper methods
  private getCurrentProjectId(): string {
    // TODO: Get current project ID from context or state
    return 'current-project-id';
  }

  private async promptForDeadline(): Promise<Date | null> {
    // TODO: Implement date picker modal
    // For now, return a default date
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
  }

  // Get project calendar
  async getProjectCalendar(projectId: string): Promise<ProjectCalendar | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('calendar_settings')
        .eq('id', projectId)
        .single();

      if (error) {
        console.warn('Failed to fetch project calendar:', error);
        return null;
      }

      return data?.calendar_settings || null;
    } catch (error) {
      console.warn('Get project calendar failed:', error);
      return null;
    }
  }

  // Get WBS settings
  async getWBSSettings(projectId: string): Promise<WBSNumbering | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('wbs_enabled, wbs_format, wbs_separator, wbs_auto_update')
        .eq('id', projectId)
        .single();

      if (error) {
        console.warn('Failed to fetch WBS settings:', error);
        return null;
      }

      return {
        enabled: data?.wbs_enabled || false,
        format: data?.wbs_format || 'n.n.n',
        separator: data?.wbs_separator || '.',
        autoUpdate: data?.wbs_auto_update !== false
      };
    } catch (error) {
      console.warn('Get WBS settings failed:', error);
      return null;
    }
  }
}

export const projectTabService = new ProjectTabService(); 