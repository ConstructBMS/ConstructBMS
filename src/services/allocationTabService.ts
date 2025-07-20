import { supabase } from './supabase';
import type { AllocationOperation, Resource, TaskAllocation } from '../components/modules/ribbonTabs/AllocationTab';

class AllocationTabService {
  // Handle allocation operations
  async handleAllocationOperation(operation: AllocationOperation): Promise<void> {
    try {
      switch (operation.type) {
        case 'assign-resource':
          await this.handleAssignResource(operation.data);
          break;
        case 'combine-work-rate':
          await this.handleCombineWorkRate(operation.data);
          break;
        case 'set-delay':
          await this.handleSetDelay(operation.data);
          break;
        case 'load-profiles':
          await this.handleLoadProfiles(operation.data);
          break;
        case 'update-allocation':
          await this.handleUpdateAllocation(operation.data);
          break;
        default:
          console.warn('Unknown allocation operation:', operation.type);
      }
    } catch (error) {
      console.error('Allocation operation failed:', error);
      throw error;
    }
  }

  // Handle resource assignment
  private async handleAssignResource(data: any): Promise<void> {
    if (data.action === 'remove') {
      console.log('Removing resources from tasks:', data.taskIds);
      await this.removeResourceFromTasks(data.taskIds);
      return;
    }

    if (data.resourceId && data.taskIds) {
      console.log(`Assigning resource '${data.resourceName}' to tasks:`, data.taskIds);
      
      try {
        // Get resource details
        const resource = await this.getResource(data.resourceId);
        if (!resource) {
          throw new Error('Resource not found');
        }

        // Create allocations for each task
        const allocations = data.taskIds.map((taskId: string) => ({
          task_id: taskId,
          resource_id: data.resourceId,
          allocation_rate: 100, // Default to 100%
          delay: 0, // Default no delay
          work_type: 'effort-driven', // Default work type
          units: resource.max_units, // Default to max units
          created_at: new Date().toISOString()
        }));

        // Insert allocations into database
        const { error } = await supabase
          .from('asta_task_assignments')
          .upsert(allocations, { onConflict: 'task_id,resource_id' });

        if (error) {
          console.warn('Failed to create task allocations in database:', error);
          // Continue with local update
        }

        // Update local state
        this.updateTaskAllocations(data.taskIds, data.resourceId, allocations);
      } catch (error) {
        console.warn('Resource assignment failed, using local state only:', error);
        this.updateTaskAllocations(data.taskIds, data.resourceId, []);
      }
    }
  }

  // Handle combine work rate toggle
  private async handleCombineWorkRate(data: any): Promise<void> {
    console.log('Combining work rate:', data.action);
    
    try {
      // Update project settings in database
      const { error } = await supabase
        .from('asta_projects')
        .update({
          combine_work_rate: data.combine,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.getCurrentProjectId());

      if (error) {
        console.warn('Failed to update combine work rate setting in database:', error);
        // Continue with local update
      }

      // Update local state
      this.updateCombineWorkRate(data.combine);
    } catch (error) {
      console.warn('Combine work rate update failed, using local state only:', error);
      this.updateCombineWorkRate(data.combine);
    }
  }

  // Handle setting delay
  private async handleSetDelay(data: any): Promise<void> {
    if (data.action === 'clear') {
      console.log('Clearing delays for tasks:', data.taskIds);
      await this.clearTaskDelays(data.taskIds);
      return;
    }

    if (data.action === 'set' && data.taskIds) {
      console.log('Setting delays for tasks:', data.taskIds);
      
      // Prompt for delay value
      const delayDays = await this.promptForDelay();
      if (delayDays === null) return;

      try {
        // Update task allocations in database
        const { error } = await supabase
          .from('asta_task_assignments')
          .update({
            delay: delayDays,
            updated_at: new Date().toISOString()
          })
          .in('task_id', data.taskIds);

        if (error) {
          console.warn('Failed to update task delays in database:', error);
          // Continue with local update
        }

        // Update local state
        this.updateTaskDelays(data.taskIds, delayDays);
      } catch (error) {
        console.warn('Delay update failed, using local state only:', error);
        this.updateTaskDelays(data.taskIds, delayDays);
      }
    }
  }

  // Handle loading resource profiles
  private async handleLoadProfiles(data: any): Promise<void> {
    console.log('Loading resource profiles');
    
    try {
      // Load resource availability profiles from database
      const { data: profiles, error } = await supabase
        .from('asta_resources')
        .select('id, name, availability, current_utilization')
        .eq('project_id', this.getCurrentProjectId());

      if (error) {
        console.warn('Failed to load resource profiles from database:', error);
        return;
      }

      // Update local state with profiles
      this.updateResourceProfiles(profiles || []);
    } catch (error) {
      console.warn('Load profiles failed:', error);
    }
  }

  // Handle updating allocations
  private async handleUpdateAllocation(data: any): Promise<void> {
    console.log('Updating allocation:', data);
    
    switch (data.action) {
      case 'set-rate':
        await this.setAllocationRate(data.taskIds, data.rate);
        break;
      case 'schedule':
        await this.setAllocationSchedule(data.taskIds, data.schedule);
        break;
      case 'usage-report':
        await this.generateUsageReport();
        break;
      case 'overallocation':
        await this.checkOverallocation();
        break;
      case 'level-resources':
        await this.levelResources();
        break;
      default:
        if (data.workType) {
          await this.setWorkType(data.taskIds, data.workType);
        } else {
          console.warn('Unknown allocation update action:', data.action);
        }
    }
  }

  // Helper methods for database operations
  private async getResource(resourceId: string): Promise<Resource | null> {
    try {
      const { data, error } = await supabase
        .from('asta_resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (error) {
        console.warn('Failed to fetch resource:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Get resource failed:', error);
      return null;
    }
  }

  private async removeResourceFromTasks(taskIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('asta_task_assignments')
        .delete()
        .in('task_id', taskIds);

      if (error) {
        console.warn('Failed to remove resources from tasks in database:', error);
      }
    } catch (error) {
      console.warn('Remove resources failed:', error);
    }
  }

  private async clearTaskDelays(taskIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('asta_task_assignments')
        .update({
          delay: 0,
          updated_at: new Date().toISOString()
        })
        .in('task_id', taskIds);

      if (error) {
        console.warn('Failed to clear task delays in database:', error);
      }
    } catch (error) {
      console.warn('Clear delays failed:', error);
    }
  }

  private async setAllocationRate(taskIds: string[], rate: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('asta_task_assignments')
        .update({
          allocation_rate: rate,
          updated_at: new Date().toISOString()
        })
        .in('task_id', taskIds);

      if (error) {
        console.warn('Failed to set allocation rate in database:', error);
      }
    } catch (error) {
      console.warn('Set allocation rate failed:', error);
    }
  }

  private async setWorkType(taskIds: string[], workType: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('asta_task_assignments')
        .update({
          work_type: workType,
          updated_at: new Date().toISOString()
        })
        .in('task_id', taskIds);

      if (error) {
        console.warn('Failed to set work type in database:', error);
      }
    } catch (error) {
      console.warn('Set work type failed:', error);
    }
  }

  private async setAllocationSchedule(taskIds: string[], schedule: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('asta_task_assignments')
        .update({
          start_date: schedule.startDate,
          end_date: schedule.endDate,
          updated_at: new Date().toISOString()
        })
        .in('task_id', taskIds);

      if (error) {
        console.warn('Failed to set allocation schedule in database:', error);
      }
    } catch (error) {
      console.warn('Set allocation schedule failed:', error);
    }
  }

  private async generateUsageReport(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('asta_task_assignments')
        .select(`
          *,
          asta_tasks(name, project_id),
          asta_resources(name, type, max_units)
        `)
        .eq('asta_tasks.project_id', this.getCurrentProjectId());

      if (error) {
        console.warn('Failed to generate usage report:', error);
        return;
      }

      console.log('Resource Usage Report:', data);
      // TODO: Display report in UI
    } catch (error) {
      console.warn('Generate usage report failed:', error);
    }
  }

  private async checkOverallocation(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('asta_resources')
        .select('*')
        .eq('project_id', this.getCurrentProjectId())
        .gt('current_utilization', 'max_units');

      if (error) {
        console.warn('Failed to check overallocation:', error);
        return;
      }

      if (data && data.length > 0) {
        console.warn('Overallocated resources found:', data);
        // TODO: Display overallocation warning in UI
      }
    } catch (error) {
      console.warn('Check overallocation failed:', error);
    }
  }

  private async levelResources(): Promise<void> {
    console.log('Leveling resources...');
    // TODO: Implement resource leveling algorithm
    // This would involve redistributing work to balance resource utilization
  }

  // Helper methods for local state updates
  private updateTaskAllocations(taskIds: string[], resourceId: string, allocations: any[]): void {
    // TODO: Update local task allocation state
    console.log('Updated task allocations locally:', { taskIds, resourceId, allocations });
  }

  private updateCombineWorkRate(combine: boolean): void {
    // TODO: Update local combine work rate state
    console.log('Updated combine work rate locally:', combine);
  }

  private updateTaskDelays(taskIds: string[], delay: number): void {
    // TODO: Update local task delay state
    console.log('Updated task delays locally:', { taskIds, delay });
  }

  private updateResourceProfiles(profiles: any[]): void {
    // TODO: Update local resource profiles state
    console.log('Updated resource profiles locally:', profiles);
  }

  // Helper methods
  private getCurrentProjectId(): string {
    // TODO: Get current project ID from context or state
    return 'current-project-id';
  }

  private async promptForDelay(): Promise<number | null> {
    // TODO: Implement delay input modal
    // For now, return a default value
    return 0;
  }

  // Get available resources for current project
  async getAvailableResources(projectId: string): Promise<Resource[]> {
    try {
      const { data, error } = await supabase
        .from('asta_resources')
        .select('*')
        .eq('project_id', projectId)
        .order('name');

      if (error) {
        console.warn('Failed to fetch available resources:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Get available resources failed:', error);
      return [];
    }
  }

  // Get current task allocations
  async getTaskAllocations(taskIds: string[]): Promise<TaskAllocation[]> {
    try {
      const { data, error } = await supabase
        .from('asta_task_assignments')
        .select(`
          *,
          asta_resources(name, type)
        `)
        .in('task_id', taskIds);

      if (error) {
        console.warn('Failed to fetch task allocations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Get task allocations failed:', error);
      return [];
    }
  }
}

export const allocationTabService = new AllocationTabService(); 