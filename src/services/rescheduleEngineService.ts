import { supabase } from './supabase';

// Asta-specific interfaces based on database schema
export interface Task {
  assigned_to?: string;
  constraint_date?: string;
  constraint_type?: 'asap' | 'start-no-earlier' | 'must-finish' | 'finish-no-later' | 'start-no-later' | 'must-start';
  created_at: string;
  deadline?: string;
  dependencies?: string[];
  description?: string;
  duration: number;
  end_date: string;
  id: string;
  level: number;
  name: string;
  parent_task_id?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  project_id: string;
  start_date: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  updated_at: string;
  wbs_number?: string;
}

export interface TaskLink {
  created_at: string;
  id: string;
  lag: number;
  link_type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  project_id: string;
  source_task_id: string;
  target_task_id: string;
  updated_at: string;
}

export interface Project {
  assigned_to?: string;
  created_at: string;
  created_by: string;
  description?: string;
  end_date: string;
  id: string;
  name: string;
  start_date: string;
  status: string;
  updated_at: string;
}

export interface Calendar {
  created_at: string;
  holidays: string[];
  id: string;
  name: string;
  updated_at: string;
  working_days: number[];
  working_hours: { end: string, start: string; };
}

export interface RescheduleSettings {
  backwardPass: boolean;
  forwardPass: boolean;
  levelResources: boolean;
  maxDuration?: number;
  respectConstraints: boolean;
  skipWeekends: boolean;
}

export interface RescheduleChange {
  changeType: 'moved_forward' | 'moved_backward' | 'duration_changed';
  fieldName: string;
  newValue: string;
  oldValue: string;
  reason: string;
  taskId: string;
}

export interface RescheduleOperation {
  changesCount: number;
  completedAt?: string;
  createdAt: string;
  id: string;
  operationType: 'forward_pass' | 'backward_pass' | 'full_reschedule';
  projectId: string;
  settings: RescheduleSettings;
  status: 'pending' | 'running' | 'completed' | 'failed';
  userId: string;
}

export interface RescheduleResult {
  changes: RescheduleChange[];
  error?: string;
  operationId: string;
  success: boolean;
  summary: {
    tasksChanged: number;
    tasksProcessed: number;
    totalDaysShifted: number;
  };
}

class RescheduleEngineService {
  private isWorkingDay(date: Date): boolean {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Skip Saturday (6) and Sunday (0)
  }

  private addWorkingDays(date: Date, days: number): Date {
    let result = new Date(date);
    let workingDaysAdded = 0;
    
    while (workingDaysAdded < days) {
      result.setDate(result.getDate() + 1);
      if (this.isWorkingDay(result)) {
        workingDaysAdded++;
      }
    }
    
    return result;
  }

  private getNextWorkingDay(date: Date): Date {
    let nextDay = new Date(date);
    do {
      nextDay.setDate(nextDay.getDate() + 1);
    } while (!this.isWorkingDay(nextDay));
    return nextDay;
  }

  private calculateTaskDependencies(tasks: Task[], links: TaskLink[]): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();
    
    // Initialize empty arrays for all tasks
    tasks.forEach(task => {
      dependencies.set(task.id, []);
    });
    
    // Build dependency map from links
    links.forEach(link => {
      const targetDeps = dependencies.get(link.target_task_id) || [];
      targetDeps.push(link.source_task_id);
      dependencies.set(link.target_task_id, targetDeps);
    });
    
    return dependencies;
  }

  private getTaskPredecessors(taskId: string, links: TaskLink[]): TaskLink[] {
    return links.filter(link => link.target_task_id === taskId);
  }

  private getTaskSuccessors(taskId: string, links: TaskLink[]): TaskLink[] {
    return links.filter(link => link.source_task_id === taskId);
  }

  private calculateEarliestStartDate(task: Task, predecessors: TaskLink[], tasks: Task[], settings: RescheduleSettings): Date {
    if (predecessors.length === 0) {
      return new Date(task.start_date);
    }

    let latestFinishDate = new Date(0);
    
    predecessors.forEach(pred => {
      const predTask = tasks.find(t => t.id === pred.source_task_id);
      if (predTask) {
        let predFinishDate = new Date(predTask.end_date);
        
        // Add lag if specified
        if (pred.lag) {
          predFinishDate = this.addWorkingDays(predFinishDate, pred.lag);
        }
        
        if (predFinishDate > latestFinishDate) {
          latestFinishDate = predFinishDate;
        }
      }
    });

    // Apply constraints
    if (settings.respectConstraints && task.constraint_type) {
      const constraintDate = new Date(task.constraint_date || task.start_date);
      
      switch (task.constraint_type) {
        case 'asap':
          return latestFinishDate;
        case 'start-no-earlier':
          return constraintDate > latestFinishDate ? constraintDate : latestFinishDate;
        case 'must-finish':
          // For Must Finish, we'll handle in backward pass
          return latestFinishDate;
        default:
          return latestFinishDate;
      }
    }

    return latestFinishDate;
  }

  private calculateLatestFinishDate(task: Task, successors: TaskLink[], tasks: Task[], settings: RescheduleSettings): Date {
    if (successors.length === 0) {
      return new Date(task.end_date);
    }

    let earliestStartDate = new Date(9999, 11, 31);
    
    successors.forEach(succ => {
      const succTask = tasks.find(t => t.id === succ.target_task_id);
      if (succTask) {
        let succStartDate = new Date(succTask.start_date);
        
        // Subtract lag if specified
        if (succ.lag) {
          succStartDate = this.addWorkingDays(succStartDate, -succ.lag);
        }
        
        if (succStartDate < earliestStartDate) {
          earliestStartDate = succStartDate;
        }
      }
    });

    // Apply constraints
    if (settings.respectConstraints && task.constraint_type === 'must-finish') {
      const constraintDate = new Date(task.constraint_date || task.end_date);
      return constraintDate < earliestStartDate ? constraintDate : earliestStartDate;
    }

    return earliestStartDate;
  }

  private forwardPass(tasks: Task[], links: TaskLink[], settings: RescheduleSettings): RescheduleChange[] {
    const changes: RescheduleChange[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const dependencies = this.calculateTaskDependencies(tasks, links);
    
    // Sort tasks by dependency order (topological sort)
    const sortedTasks = this.topologicalSort(tasks, dependencies);
    
    sortedTasks.forEach(task => {
      const predecessors = this.getTaskPredecessors(task.id, links);
      let newStartDate = this.calculateEarliestStartDate(task, predecessors, tasks, settings);
      
      if (settings.skipWeekends && !this.isWorkingDay(newStartDate)) {
        newStartDate = this.getNextWorkingDay(newStartDate);
      }
      
      const oldStartDate = new Date(task.start_date);
      const duration = task.duration || 1;
      const newEndDate = this.addWorkingDays(newStartDate, duration - 1);
      
      if (newStartDate.getTime() !== oldStartDate.getTime()) {
        changes.push({
          taskId: task.id,
          fieldName: 'start_date',
          oldValue: oldStartDate.toISOString().split('T')[0],
          newValue: newStartDate.toISOString().split('T')[0],
          changeType: 'moved_forward',
          reason: 'Dependency constraint'
        });
        
        changes.push({
          taskId: task.id,
          fieldName: 'end_date',
          oldValue: task.end_date,
          newValue: newEndDate.toISOString().split('T')[0],
          changeType: 'moved_forward',
          reason: 'Dependency constraint'
        });
        
        // Update task in memory
        task.start_date = newStartDate.toISOString().split('T')[0];
        task.end_date = newEndDate.toISOString().split('T')[0];
      }
    });
    
    return changes;
  }

  private backwardPass(tasks: Task[], links: TaskLink[], settings: RescheduleSettings): RescheduleChange[] {
    const changes: RescheduleChange[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    // Sort tasks by reverse dependency order
    const dependencies = this.calculateTaskDependencies(tasks, links);
    const sortedTasks = this.topologicalSort(tasks, dependencies).reverse();
    
    sortedTasks.forEach(task => {
      const successors = this.getTaskSuccessors(task.id, links);
      let newEndDate = this.calculateLatestFinishDate(task, successors, tasks, settings);
      
      if (settings.skipWeekends && !this.isWorkingDay(newEndDate)) {
        newEndDate = this.getNextWorkingDay(newEndDate);
      }
      
      const oldEndDate = new Date(task.end_date);
      const duration = task.duration || 1;
      const newStartDate = this.addWorkingDays(newEndDate, -(duration - 1));
      
      if (newEndDate.getTime() !== oldEndDate.getTime()) {
        changes.push({
          taskId: task.id,
          fieldName: 'end_date',
          oldValue: oldEndDate.toISOString().split('T')[0],
          newValue: newEndDate.toISOString().split('T')[0],
          changeType: 'moved_backward',
          reason: 'Successor constraint'
        });
        
        changes.push({
          taskId: task.id,
          fieldName: 'start_date',
          oldValue: task.start_date,
          newValue: newStartDate.toISOString().split('T')[0],
          changeType: 'moved_backward',
          reason: 'Successor constraint'
        });
        
        // Update task in memory
        task.end_date = newEndDate.toISOString().split('T')[0];
        task.start_date = newStartDate.toISOString().split('T')[0];
      }
    });
    
    return changes;
  }

  private topologicalSort(tasks: Task[], dependencies: Map<string, string[]>): Task[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: Task[] = [];
    
    const visit = (taskId: string) => {
      if (temp.has(taskId)) {
        throw new Error('Circular dependency detected');
      }
      if (visited.has(taskId)) {
        return;
      }
      
      temp.add(taskId);
      const deps = dependencies.get(taskId) || [];
      deps.forEach(depId => visit(depId));
      temp.delete(taskId);
      visited.add(taskId);
      
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        result.push(task);
      }
    };
    
    tasks.forEach(task => {
      if (!visited.has(task.id)) {
        visit(task.id);
      }
    });
    
    return result;
  }

  async createRescheduleOperation(projectId: string, settings: RescheduleSettings): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reschedule_operations')
      .insert({
        project_id: projectId,
        user_id: user.id,
        operation_type: settings.forwardPass && settings.backwardPass ? 'full_reschedule' : 
                       settings.forwardPass ? 'forward_pass' : 'backward_pass',
        status: 'pending',
        settings: settings
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateRescheduleOperation(operationId: string, status: string, changesCount?: number): Promise<void> {
    const updateData: any = { status };
    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }
    if (changesCount !== undefined) {
      updateData.changes_count = changesCount;
    }

    const { error } = await supabase
      .from('reschedule_operations')
      .update(updateData)
      .eq('id', operationId);

    if (error) throw error;
  }

  async saveRescheduleChanges(operationId: string, changes: RescheduleChange[]): Promise<void> {
    if (changes.length === 0) return;

    const changeRecords = changes.map(change => ({
      operation_id: operationId,
      task_id: change.taskId,
      field_name: change.fieldName,
      old_value: change.oldValue,
      new_value: change.newValue,
      change_type: change.changeType,
      reason: change.reason
    }));

    const { error } = await supabase
      .from('reschedule_changes')
      .insert(changeRecords);

    if (error) throw error;
  }

  async updateTasks(tasks: Task[]): Promise<void> {
    const updates = tasks.map(task => ({
      id: task.id,
      start_date: task.start_date,
      end_date: task.end_date,
      duration: task.duration,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('asta_tasks')
      .upsert(updates);

    if (error) throw error;
  }

  async rescheduleProject(projectId: string, settings: RescheduleSettings): Promise<RescheduleResult> {
    try {
      // Create operation record
      const operationId = await this.createRescheduleOperation(projectId, settings);
      await this.updateRescheduleOperation(operationId, 'running');

      // Fetch project data
      const { data: tasks, error: tasksError } = await supabase
        .from('asta_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('wbs_number');

      if (tasksError) throw tasksError;

      const { data: links, error: linksError } = await supabase
        .from('asta_task_links')
        .select('*')
        .eq('project_id', projectId);

      if (linksError) throw linksError;

      if (!tasks || tasks.length === 0) {
        await this.updateRescheduleOperation(operationId, 'completed', 0);
        return {
          success: true,
          operationId,
          changes: [],
          summary: { tasksProcessed: 0, tasksChanged: 0, totalDaysShifted: 0 }
        };
      }

      let allChanges: RescheduleChange[] = [];
      const tasksCopy = JSON.parse(JSON.stringify(tasks)) as Task[];

      // Forward pass
      if (settings.forwardPass) {
        const forwardChanges = this.forwardPass(tasksCopy, links || [], settings);
        allChanges.push(...forwardChanges);
      }

      // Backward pass
      if (settings.backwardPass) {
        const backwardChanges = this.backwardPass(tasksCopy, links || [], settings);
        allChanges.push(...backwardChanges);
      }

      // Save changes to database
      await this.saveRescheduleChanges(operationId, allChanges);

      // Update tasks in database
      await this.updateTasks(tasksCopy);

      // Calculate summary
      const uniqueChangedTasks = new Set(allChanges.map(c => c.taskId)).size;
      const totalDaysShifted = allChanges.reduce((sum, change) => {
        if (change.fieldName === 'start_date' || change.fieldName === 'end_date') {
          const oldDate = new Date(change.oldValue);
          const newDate = new Date(change.newValue);
          return sum + Math.abs((newDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24));
        }
        return sum;
      }, 0);

      await this.updateRescheduleOperation(operationId, 'completed', allChanges.length);

      return {
        success: true,
        operationId,
        changes: allChanges,
        summary: {
          tasksProcessed: tasks.length,
          tasksChanged: uniqueChangedTasks,
          totalDaysShifted: Math.round(totalDaysShifted)
        }
      };

    } catch (error) {
      console.error('Reschedule error:', error);
      return {
        success: false,
        operationId: '',
        changes: [],
        summary: { tasksProcessed: 0, tasksChanged: 0, totalDaysShifted: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getRescheduleHistory(projectId: string): Promise<RescheduleOperation[]> {
    const { data, error } = await supabase
      .from('reschedule_operations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRescheduleChanges(operationId: string): Promise<RescheduleChange[]> {
    const { data, error } = await supabase
      .from('reschedule_changes')
      .select('*')
      .eq('operation_id', operationId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  // Demo data for testing
  getDemoRescheduleSettings(): RescheduleSettings {
    return {
      skipWeekends: true,
      respectConstraints: true,
      forwardPass: true,
      backwardPass: false,
      levelResources: false
    };
  }

  getDemoRescheduleResult(): RescheduleResult {
    return {
      success: true,
      operationId: 'demo-operation-id',
      changes: [
        {
          taskId: 'task-1',
          fieldName: 'start_date',
          oldValue: '2024-01-15',
          newValue: '2024-01-16',
          changeType: 'moved_forward',
          reason: 'Dependency constraint'
        },
        {
          taskId: 'task-2',
          fieldName: 'end_date',
          oldValue: '2024-02-15',
          newValue: '2024-02-18',
          changeType: 'moved_forward',
          reason: 'Weekend skipped'
        }
      ],
      summary: {
        tasksProcessed: 5,
        tasksChanged: 2,
        totalDaysShifted: 4
      }
    };
  }
}

export const rescheduleEngineService = new RescheduleEngineService(); 