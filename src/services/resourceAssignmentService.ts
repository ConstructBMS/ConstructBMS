import { persistentStorage } from './persistentStorage';
import { demoDataService } from './demoDataService';

export interface AssignedResource {
  demo?: boolean;
  fromDate: Date;
  quantity: number;
  rate: number;
  resourceId: string;
  toDate: Date;
  type: 'labour' | 'material' | 'cost';
  unit: string;
}

export interface TaskResourceAssignment {
  assignedResources: AssignedResource[];
  demo?: boolean;
  taskId: string;
}

export interface ResourceAssignmentConfig {
  assignments: Record<string, TaskResourceAssignment>;
  demo?: boolean;
}

export interface ResourceAssignmentResult {
  data?: any;
  errors: string[];
  success: boolean;
}

export interface QuickAssignResource {
  defaultQuantity: number;
  defaultRate: number;
  defaultUnit: string;
  frequency: number;
  id: string;
  name: string;
  type: 'labour' | 'material' | 'cost';
}

const DEFAULT_CONFIG: ResourceAssignmentConfig = {
  assignments: {}
};

class ResourceAssignmentService {
  private config: ResourceAssignmentConfig = DEFAULT_CONFIG;

  async initialize(projectId: string): Promise<void> {
    try {
      const stored = await persistentStorage.get(`resourceAssignments_${projectId}`);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...stored };
      }
    } catch (error) {
      console.error('Failed to initialize resource assignment service:', error);
    }
  }

  async getResourceAssignmentConfig(projectId: string): Promise<ResourceAssignmentConfig> {
    try {
      const stored = await persistentStorage.get(`resourceAssignments_${projectId}`);
      return stored ? { ...DEFAULT_CONFIG, ...stored } : DEFAULT_CONFIG;
    } catch (error) {
      console.error('Failed to get resource assignment config:', error);
      return DEFAULT_CONFIG;
    }
  }

  async saveResourceAssignmentConfig(projectId: string, config: Partial<ResourceAssignmentConfig>): Promise<ResourceAssignmentResult> {
    try {
      const updatedConfig = { ...this.config, ...config };
      
      // Add demo flag if in demo mode
      if (demoDataService.isDemoMode()) {
        updatedConfig.demo = true;
      }

      this.config = updatedConfig;
      
      await persistentStorage.set(`resourceAssignments_${projectId}`, updatedConfig);
      
      this.logResourceAssignmentActivity('config_updated', { config: updatedConfig });
      
      return { success: true, data: updatedConfig, errors: [] };
    } catch (error) {
      console.error('Failed to save resource assignment config:', error);
      return { success: false, errors: ['Failed to save resource assignment configuration'] };
    }
  }

  async assignResourcesToTask(projectId: string, taskId: string, resources: AssignedResource[]): Promise<ResourceAssignmentResult> {
    try {
      const existingAssignment = this.config.assignments[taskId] || { taskId, assignedResources: [] };
      
      const newAssignment: TaskResourceAssignment = {
        taskId,
        assignedResources: [
          ...existingAssignment.assignedResources,
          ...resources.map(resource => ({
            ...resource,
            demo: demoDataService.isDemoMode()
          }))
        ],
        demo: demoDataService.isDemoMode()
      };

      const updatedAssignments = {
        ...this.config.assignments,
        [taskId]: newAssignment
      };

      const result = await this.saveResourceAssignmentConfig(projectId, {
        assignments: updatedAssignments
      });
      
      this.logResourceAssignmentActivity('resources_assigned', { 
        taskId, 
        resourceCount: resources.length,
        resources: resources.map(r => ({ id: r.resourceId, type: r.type }))
      });
      
      return result;
    } catch (error) {
      console.error('Failed to assign resources to task:', error);
      return { success: false, errors: ['Failed to assign resources to task'] };
    }
  }

  async unassignResourcesFromTask(projectId: string, taskId: string, resourceIds: string[]): Promise<ResourceAssignmentResult> {
    try {
      const existingAssignment = this.config.assignments[taskId];
      if (!existingAssignment) {
        return { success: false, errors: ['No resources assigned to this task'] };
      }

      const updatedResources = existingAssignment.assignedResources.filter(
        resource => !resourceIds.includes(resource.resourceId)
      );

      const updatedAssignment: TaskResourceAssignment = {
        ...existingAssignment,
        assignedResources: updatedResources
      };

      const updatedAssignments = {
        ...this.config.assignments,
        [taskId]: updatedAssignment
      };

      const result = await this.saveResourceAssignmentConfig(projectId, {
        assignments: updatedAssignments
      });
      
      this.logResourceAssignmentActivity('resources_unassigned', { 
        taskId, 
        resourceCount: resourceIds.length,
        resourceIds 
      });
      
      return result;
    } catch (error) {
      console.error('Failed to unassign resources from task:', error);
      return { success: false, errors: ['Failed to unassign resources from task'] };
    }
  }

  async quickAssignResource(projectId: string, taskId: string, quickResource: QuickAssignResource): Promise<ResourceAssignmentResult> {
    try {
      const resource: AssignedResource = {
        resourceId: quickResource.id,
        type: quickResource.type,
        quantity: quickResource.defaultQuantity,
        unit: quickResource.defaultUnit,
        rate: quickResource.defaultRate,
        fromDate: new Date(),
        toDate: new Date(),
        demo: demoDataService.isDemoMode()
      };

      const result = await this.assignResourcesToTask(projectId, taskId, [resource]);
      
      this.logResourceAssignmentActivity('quick_assign', { 
        taskId, 
        resourceId: quickResource.id,
        resourceName: quickResource.name 
      });
      
      return result;
    } catch (error) {
      console.error('Failed to quick assign resource:', error);
      return { success: false, errors: ['Failed to quick assign resource'] };
    }
  }

  async updateResourceAssignment(projectId: string, taskId: string, resourceId: string, updates: Partial<AssignedResource>): Promise<ResourceAssignmentResult> {
    try {
      const existingAssignment = this.config.assignments[taskId];
      if (!existingAssignment) {
        return { success: false, errors: ['No resources assigned to this task'] };
      }

      const updatedResources = existingAssignment.assignedResources.map(resource =>
        resource.resourceId === resourceId
          ? { ...resource, ...updates }
          : resource
      );

      const updatedAssignment: TaskResourceAssignment = {
        ...existingAssignment,
        assignedResources: updatedResources
      };

      const updatedAssignments = {
        ...this.config.assignments,
        [taskId]: updatedAssignment
      };

      const result = await this.saveResourceAssignmentConfig(projectId, {
        assignments: updatedAssignments
      });
      
      this.logResourceAssignmentActivity('resource_updated', { 
        taskId, 
        resourceId,
        updates 
      });
      
      return result;
    } catch (error) {
      console.error('Failed to update resource assignment:', error);
      return { success: false, errors: ['Failed to update resource assignment'] };
    }
  }

  getTaskAssignments(taskId: string): AssignedResource[] {
    const assignment = this.config.assignments[taskId];
    return assignment ? assignment.assignedResources : [];
  }

  getAllAssignments(): Record<string, TaskResourceAssignment> {
    return this.config.assignments;
  }

  getResourceUsage(resourceId: string): { assignment: AssignedResource, taskId: string; }[] {
    const usage: { assignment: AssignedResource, taskId: string; }[] = [];
    
    Object.entries(this.config.assignments).forEach(([taskId, taskAssignment]) => {
      taskAssignment.assignedResources.forEach(assignment => {
        if (assignment.resourceId === resourceId) {
          usage.push({ taskId, assignment });
        }
      });
    });
    
    return usage;
  }

  calculateTaskCost(taskId: string): number {
    const assignments = this.getTaskAssignments(taskId);
    return assignments.reduce((total, assignment) => {
      return total + (assignment.quantity * assignment.rate);
    }, 0);
  }

  calculateTotalProjectCost(): number {
    return Object.keys(this.config.assignments).reduce((total, taskId) => {
      return total + this.calculateTaskCost(taskId);
    }, 0);
  }

  async getFrequentResources(): Promise<QuickAssignResource[]> {
    try {
      const history = await this.getResourceAssignmentHistory('current');
      const resourceUsage: Record<string, number> = {};
      
      // Count resource usage from history
      history.forEach(activity => {
        if (activity.action === 'resources_assigned' || activity.action === 'quick_assign') {
          const resources = activity.data.resources || [{ id: activity.data.resourceId }];
          resources.forEach((resource: any) => {
            resourceUsage[resource.id] = (resourceUsage[resource.id] || 0) + 1;
          });
        }
      });
      
      // Convert to QuickAssignResource format
      const frequentResources: QuickAssignResource[] = Object.entries(resourceUsage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id, frequency]) => ({
          id,
          name: `Resource ${id}`, // In real app, this would come from resource service
          type: 'labour' as const, // In real app, this would come from resource service
          defaultQuantity: 1,
          defaultUnit: 'hrs',
          defaultRate: 50,
          frequency
        }));
      
      return frequentResources;
    } catch (error) {
      console.error('Failed to get frequent resources:', error);
      return [];
    }
  }

  async clearDemoResourceAssignments(projectId: string): Promise<void> {
    try {
      if (this.config.demo) {
        await persistentStorage.remove(`resourceAssignments_${projectId}`);
        this.config = DEFAULT_CONFIG;
      }
    } catch (error) {
      console.error('Failed to clear demo resource assignments:', error);
    }
  }

  async getResourceAssignmentHistory(projectId: string): Promise<any[]> {
    try {
      const history = await persistentStorage.get(`resourceAssignment_history_${projectId}`);
      return history || [];
    } catch (error) {
      console.error('Failed to get resource assignment history:', error);
      return [];
    }
  }

  private async logResourceAssignmentActivity(action: string, data: any): Promise<void> {
    try {
      const activity = {
        action,
        data,
        timestamp: new Date().toISOString(),
        demo: demoDataService.isDemoMode()
      };
      
      // Store in history
      const history = await this.getResourceAssignmentHistory('current');
      history.push(activity);
      
      // Keep only last 100 activities
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      await persistentStorage.set('resourceAssignment_history_current', history);
    } catch (error) {
      console.error('Failed to log resource assignment activity:', error);
    }
  }

  validateResourceAssignment(assignment: AssignedResource): string[] {
    const errors: string[] = [];
    
    if (!assignment.resourceId) {
      errors.push('Resource ID is required');
    }

    if (!['labour', 'material', 'cost'].includes(assignment.type)) {
      errors.push('Invalid resource type');
    }

    if (assignment.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (assignment.rate < 0) {
      errors.push('Rate cannot be negative');
    }

    if (assignment.fromDate >= assignment.toDate) {
      errors.push('From date must be before to date');
    }

    return errors;
  }
}

export const resourceAssignmentService = new ResourceAssignmentService(); 