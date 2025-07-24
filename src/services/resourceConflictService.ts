import { persistentStorage } from './persistentStorage';

export interface ResourceConflict {
  assignedHours: number;
  date: Date;
  demo?: boolean;
  id: string;
  maxCapacity: number;
  overallocation: number;
  resourceId: string;
  resourceName: string;
  taskId: string;
  taskName: string;
  type: 'overallocation' | 'double-booking';
}

export interface ConflictResolution {
  conflictId: string;
  demo?: boolean;
  details?: string;
  resolution: 'split' | 'delay' | 'reassign' | 'ignore';
}

export interface ResourceConflictConfig {
  autoResolve: boolean;
  demo?: boolean;
  enabled: boolean;
  highlightConflicts: boolean;
}

class ResourceConflictService {
  private configKey = 'resourceConflictConfig';
  private conflictsKey = 'resourceConflicts';
  private resolutionsKey = 'conflictResolutions';

  // Default configuration
  private defaultConfig: ResourceConflictConfig = {
    enabled: false,
    highlightConflicts: true,
    autoResolve: false,
    demo: false
  };

  // Mock resource capacity data
  private mockResourceCapacities = {
    'labour-1': { maxHoursPerDay: 8, name: 'Project Manager' },
    'labour-2': { maxHoursPerDay: 8, name: 'Site Engineer' },
    'labour-3': { maxHoursPerDay: 8, name: 'Foreman' },
    'labour-4': { maxHoursPerDay: 8, name: 'Carpenter' },
    'labour-5': { maxHoursPerDay: 8, name: 'Electrician' },
    'material-1': { maxHoursPerDay: 24, name: 'Cement' },
    'material-2': { maxHoursPerDay: 24, name: 'Steel' },
    'material-3': { maxHoursPerDay: 24, name: 'Timber' },
    'cost-1': { maxHoursPerDay: 24, name: 'Subcontractor' },
    'cost-2': { maxHoursPerDay: 24, name: 'Equipment Rental' }
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<ResourceConflictConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting resource conflict config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<ResourceConflictConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      // Log activity
      console.log('Resource conflict config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating resource conflict config:', error);
      throw error;
    }
  }

  /**
   * Toggle conflict detection
   */
  async toggleConflictDetection(enabled: boolean): Promise<void> {
    await this.updateConfig({ enabled });
  }

  /**
   * Toggle conflict highlighting
   */
  async toggleConflictHighlighting(enabled: boolean): Promise<void> {
    await this.updateConfig({ highlightConflicts: enabled });
  }

  /**
   * Scan for resource conflicts
   */
  async scanForConflicts(assignedResources: Record<string, any[]>, tasks: any[]): Promise<ResourceConflict[]> {
    try {
      const config = await this.getConfig();
      if (!config.enabled) {
        return [];
      }

      const conflicts: ResourceConflict[] = [];
      const resourceAssignments: Record<string, { date: Date; hours: number; taskId: string; taskName: string }[]> = {};

      // Collect all resource assignments by date
      Object.entries(assignedResources).forEach(([taskId, resources]) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        resources.forEach((resource: any) => {
          const resourceId = resource.resourceId;
          if (!resourceAssignments[resourceId]) {
            resourceAssignments[resourceId] = [];
          }

          // Calculate daily hours for the resource
          const startDate = new Date(resource.fromDate);
          const endDate = new Date(resource.toDate);
          const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const dailyHours = resource.quantity / totalDays;

          // Add assignment for each day
          for (let i = 0; i < totalDays; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            resourceAssignments[resourceId].push({
              date,
              hours: dailyHours,
              taskId,
              taskName: task.name
            });
          }
        });
      });

      // Check for conflicts
      Object.entries(resourceAssignments).forEach(([resourceId, assignments]) => {
        const capacity = this.mockResourceCapacities[resourceId as keyof typeof this.mockResourceCapacities];
        if (!capacity) return;

        // Group assignments by date
        const assignmentsByDate: Record<string, { date: Date; hours: number; taskId: string; taskName: string }[]> = {};
        assignments.forEach(assignment => {
          const dateKey = assignment.date.toISOString().split('T')[0];
          if (!assignmentsByDate[dateKey]) {
            assignmentsByDate[dateKey] = [];
          }
          assignmentsByDate[dateKey].push(assignment);
        });

        // Check each date for conflicts
        Object.entries(assignmentsByDate).forEach(([dateKey, dayAssignments]) => {
          const totalHours = dayAssignments.reduce((sum, assignment) => sum + assignment.hours, 0);
          
          if (totalHours > capacity.maxHoursPerDay) {
            // Overallocation conflict
            dayAssignments.forEach(assignment => {
              conflicts.push({
                id: `${resourceId}-${dateKey}-${assignment.taskId}`,
                taskId: assignment.taskId,
                taskName: assignment.taskName,
                resourceId,
                resourceName: capacity.name,
                date: assignment.date,
                assignedHours: assignment.hours,
                maxCapacity: capacity.maxHoursPerDay,
                overallocation: totalHours - capacity.maxHoursPerDay,
                type: 'overallocation',
                demo: config.demo
              });
            });
          } else if (dayAssignments.length > 1) {
            // Double-booking conflict
            dayAssignments.forEach(assignment => {
              conflicts.push({
                id: `${resourceId}-${dateKey}-${assignment.taskId}`,
                taskId: assignment.taskId,
                taskName: assignment.taskName,
                resourceId,
                resourceName: capacity.name,
                date: assignment.date,
                assignedHours: assignment.hours,
                maxCapacity: capacity.maxHoursPerDay,
                overallocation: 0,
                type: 'double-booking',
                demo: config.demo
              });
            });
          }
        });
      });

      // Limit conflicts in demo mode
      if (config.demo && conflicts.length > 5) {
        return conflicts.slice(0, 5);
      }

      return conflicts;
    } catch (error) {
      console.error('Error scanning for conflicts:', error);
      return [];
    }
  }

  /**
   * Apply conflict resolutions
   */
  async applyResolutions(resolutions: ConflictResolution[]): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Store resolutions
      await persistentStorage.set(this.resolutionsKey, resolutions.map(r => ({ ...r, demo: config.demo })));
      
      // Log activity
      console.log('Conflict resolutions applied:', resolutions);
    } catch (error) {
      console.error('Error applying conflict resolutions:', error);
      throw error;
    }
  }

  /**
   * Get stored conflicts
   */
  async getStoredConflicts(): Promise<ResourceConflict[]> {
    try {
      const conflicts = await persistentStorage.get(this.conflictsKey);
      return conflicts || [];
    } catch (error) {
      console.error('Error getting stored conflicts:', error);
      return [];
    }
  }

  /**
   * Get stored resolutions
   */
  async getStoredResolutions(): Promise<ConflictResolution[]> {
    try {
      const resolutions = await persistentStorage.get(this.resolutionsKey);
      return resolutions || [];
    } catch (error) {
      console.error('Error getting stored resolutions:', error);
      return [];
    }
  }

  /**
   * Clear all conflicts and resolutions
   */
  async clearAll(): Promise<void> {
    try {
      await persistentStorage.remove(this.conflictsKey);
      await persistentStorage.remove(this.resolutionsKey);
      console.log('All conflicts and resolutions cleared');
    } catch (error) {
      console.error('Error clearing conflicts and resolutions:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const config = await this.getConfig();
      if (config.demo) {
        await this.clearAll();
        await this.updateConfig({ demo: false });
        console.log('Demo conflict data reset');
      }
    } catch (error) {
      console.error('Error resetting demo conflict data:', error);
      throw error;
    }
  }
}

export const resourceConflictService = new ResourceConflictService(); 