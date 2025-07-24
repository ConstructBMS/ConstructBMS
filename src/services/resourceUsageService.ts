import { persistentStorage } from './persistentStorage';
import { demoDataService } from './demoDataService';

export interface ResourceUsageConfig {
  demo?: boolean;
  groupBy: 'type' | 'task';
  visible: boolean;
}

export interface ResourceUsageData {
  cost: number;
  date: string;
  labour: number;
  material: number;
  total: number;
}

export interface TaskUsageData {
  cost: number;
  labour: number;
  material: number;
  taskId: string;
  taskName: string;
  total: number;
}

export interface ResourceUsageResult {
  data?: any;
  errors: string[];
  success: boolean;
}

const DEFAULT_CONFIG: ResourceUsageConfig = {
  visible: false,
  groupBy: 'type'
};

class ResourceUsageService {
  private config: ResourceUsageConfig = DEFAULT_CONFIG;

  async initialize(projectId: string): Promise<void> {
    try {
      const stored = await persistentStorage.get(`resourceUsage_${projectId}`);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...stored };
      }
    } catch (error) {
      console.error('Failed to initialize resource usage service:', error);
    }
  }

  async getResourceUsageConfig(projectId: string): Promise<ResourceUsageConfig> {
    try {
      const stored = await persistentStorage.get(`resourceUsage_${projectId}`);
      return stored ? { ...DEFAULT_CONFIG, ...stored } : DEFAULT_CONFIG;
    } catch (error) {
      console.error('Failed to get resource usage config:', error);
      return DEFAULT_CONFIG;
    }
  }

  async saveResourceUsageConfig(projectId: string, config: Partial<ResourceUsageConfig>): Promise<ResourceUsageResult> {
    try {
      const updatedConfig = { ...this.config, ...config };
      
      // Add demo flag if in demo mode
      if (demoDataService.isDemoMode()) {
        updatedConfig.demo = true;
      }

      this.config = updatedConfig;
      
      await persistentStorage.set(`resourceUsage_${projectId}`, updatedConfig);
      
      this.logResourceUsageActivity('config_updated', { config: updatedConfig });
      
      return { success: true, data: updatedConfig, errors: [] };
    } catch (error) {
      console.error('Failed to save resource usage config:', error);
      return { success: false, errors: ['Failed to save resource usage configuration'] };
    }
  }

  async toggleUsageView(projectId: string): Promise<ResourceUsageResult> {
    try {
      const newVisible = !this.config.visible;
      const result = await this.saveResourceUsageConfig(projectId, { visible: newVisible });
      
      this.logResourceUsageActivity('usage_view_toggled', { visible: newVisible });
      
      return result;
    } catch (error) {
      console.error('Failed to toggle usage view:', error);
      return { success: false, errors: ['Failed to toggle usage view'] };
    }
  }

  async setGroupingMode(projectId: string, groupBy: 'type' | 'task'): Promise<ResourceUsageResult> {
    try {
      const result = await this.saveResourceUsageConfig(projectId, { groupBy });
      
      this.logResourceUsageActivity('grouping_mode_changed', { groupBy });
      
      return result;
    } catch (error) {
      console.error('Failed to set grouping mode:', error);
      return { success: false, errors: ['Failed to set grouping mode'] };
    }
  }

  async getUsageDataByType(assignedResources: Record<string, any[]>): Promise<ResourceUsageData[]> {
    try {
      const usageByDate: Record<string, { cost: number, labour: number; material: number; }> = {};
      
      Object.values(assignedResources).flat().forEach((resource: any) => {
        const date = new Date().toISOString().split('T')[0]; // Simplified - use current date
        if (!usageByDate[date]) {
          usageByDate[date] = { labour: 0, material: 0, cost: 0 };
        }
        
        const totalCost = resource.quantity * resource.rate;
        switch (resource.type) {
          case 'labour':
            usageByDate[date].labour += totalCost;
            break;
          case 'material':
            usageByDate[date].material += totalCost;
            break;
          case 'cost':
            usageByDate[date].cost += totalCost;
            break;
        }
      });

      return Object.entries(usageByDate).map(([date, usage]) => ({
        date,
        labour: usage.labour,
        material: usage.material,
        cost: usage.cost,
        total: usage.labour + usage.material + usage.cost
      }));
    } catch (error) {
      console.error('Failed to calculate usage by type:', error);
      return [];
    }
  }

  async getUsageDataByTask(assignedResources: Record<string, any[]>, tasks: any[]): Promise<TaskUsageData[]> {
    try {
      return Object.entries(assignedResources).map(([taskId, resources]) => {
        const task = tasks.find(t => t.id === taskId);
        const usage = { labour: 0, material: 0, cost: 0 };
        
        resources.forEach((resource: any) => {
          const totalCost = resource.quantity * resource.rate;
          switch (resource.type) {
            case 'labour':
              usage.labour += totalCost;
              break;
            case 'material':
              usage.material += totalCost;
              break;
            case 'cost':
              usage.cost += totalCost;
              break;
          }
        });

        return {
          taskId,
          taskName: task?.name || `Task ${taskId}`,
          labour: usage.labour,
          material: usage.material,
          cost: usage.cost,
          total: usage.labour + usage.material + usage.cost
        };
      }).filter(data => data.total > 0);
    } catch (error) {
      console.error('Failed to calculate usage by task:', error);
      return [];
    }
  }

  async getUsageSummary(assignedResources: Record<string, any[]>): Promise<{
    taskCount: number;
    totalCost: number;
    totalLabour: number;
    totalMaterial: number;
    totalResources: number;
  }> {
    try {
      let totalLabour = 0;
      let totalMaterial = 0;
      let totalCost = 0;
      let totalResources = 0;

      Object.values(assignedResources).forEach(resources => {
        totalResources += resources.length;
        resources.forEach((resource: any) => {
          const totalResourceCost = resource.quantity * resource.rate;
          switch (resource.type) {
            case 'labour':
              totalLabour += totalResourceCost;
              break;
            case 'material':
              totalMaterial += totalResourceCost;
              break;
            case 'cost':
              totalCost += totalResourceCost;
              break;
          }
        });
      });

      return {
        totalLabour,
        totalMaterial,
        totalCost,
        totalResources,
        taskCount: Object.keys(assignedResources).length
      };
    } catch (error) {
      console.error('Failed to calculate usage summary:', error);
      return {
        totalLabour: 0,
        totalMaterial: 0,
        totalCost: 0,
        totalResources: 0,
        taskCount: 0
      };
    }
  }

  async getResourceUtilization(assignedResources: Record<string, any[]>): Promise<{
    costUtilization: number;
    labourUtilization: number;
    materialUtilization: number;
  }> {
    try {
      const summary = await this.getUsageSummary(assignedResources);
      const total = summary.totalLabour + summary.totalMaterial + summary.totalCost;
      
      return {
        labourUtilization: total > 0 ? (summary.totalLabour / total) * 100 : 0,
        materialUtilization: total > 0 ? (summary.totalMaterial / total) * 100 : 0,
        costUtilization: total > 0 ? (summary.totalCost / total) * 100 : 0
      };
    } catch (error) {
      console.error('Failed to calculate resource utilization:', error);
      return {
        labourUtilization: 0,
        materialUtilization: 0,
        costUtilization: 0
      };
    }
  }

  async clearDemoResourceUsage(projectId: string): Promise<void> {
    try {
      if (this.config.demo) {
        await persistentStorage.remove(`resourceUsage_${projectId}`);
        this.config = DEFAULT_CONFIG;
      }
    } catch (error) {
      console.error('Failed to clear demo resource usage:', error);
    }
  }

  async getResourceUsageHistory(projectId: string): Promise<any[]> {
    try {
      const history = await persistentStorage.get(`resourceUsage_history_${projectId}`);
      return history || [];
    } catch (error) {
      console.error('Failed to get resource usage history:', error);
      return [];
    }
  }

  private async logResourceUsageActivity(action: string, data: any): Promise<void> {
    try {
      const activity = {
        action,
        data,
        timestamp: new Date().toISOString(),
        demo: demoDataService.isDemoMode()
      };
      
      // Store in history
      const history = await this.getResourceUsageHistory('current');
      history.push(activity);
      
      // Keep only last 50 activities
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      await persistentStorage.set('resourceUsage_history_current', history);
    } catch (error) {
      console.error('Failed to log resource usage activity:', error);
    }
  }

  getCurrentConfig(): ResourceUsageConfig {
    return { ...this.config };
  }

  isUsageViewVisible(): boolean {
    return this.config.visible;
  }

  getGroupingMode(): 'type' | 'task' {
    return this.config.groupBy;
  }
}

export const resourceUsageService = new ResourceUsageService(); 