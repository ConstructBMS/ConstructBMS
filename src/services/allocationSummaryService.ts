import { persistentStorage } from './persistentStorage';

export interface TaskSummary {
  assignedResources: number;
  demo?: boolean;
  endDate: Date;
  resources: Array<{
    cost: number;
    quantity: number;
    rate: number;
    resourceId: string;
    resourceName: string;
    type: string;
    unit: string;
  }>;
  startDate: Date;
  taskId: string;
  taskName: string;
  totalCost: number;
  totalQuantity: number;
}

export interface ResourceSummary {
  demo?: boolean;
  peakUsage: number;
  resourceId: string;
  resourceName: string;
  tasks: Array<{
    cost: number;
    quantity: number;
    rate: number;
    taskId: string;
    taskName: string;
    unit: string;
  }>;
  tasksAssigned: number;
  totalCost: number;
  totalQuantity: number;
  type: string;
}

export interface AllocationSummaryConfig {
  demo?: boolean;
  lastGenerated: Date;
  summaryType: 'task' | 'resource';
}

class AllocationSummaryService {
  private configKey = 'allocationSummaryConfig';
  private taskSummariesKey = 'taskSummaries';
  private resourceSummariesKey = 'resourceSummaries';

  // Default configuration
  private defaultConfig: AllocationSummaryConfig = {
    lastGenerated: new Date(),
    summaryType: 'task',
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<AllocationSummaryConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting allocation summary config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<AllocationSummaryConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      // Log activity
      console.log('Allocation summary config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating allocation summary config:', error);
      throw error;
    }
  }

  /**
   * Generate task summary
   */
  async generateTaskSummary(assignedResources: Record<string, any[]>, tasks: any[]): Promise<TaskSummary[]> {
    try {
      const config = await this.getConfig();
      const summaries: TaskSummary[] = [];

      Object.entries(assignedResources).forEach(([taskId, resources]) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || resources.length === 0) return;

        const taskResources = resources.map((resource: any) => ({
          resourceId: resource.resourceId,
          resourceName: resource.name || `Resource ${resource.resourceId}`,
          type: resource.type,
          quantity: resource.quantity,
          unit: resource.unit,
          rate: resource.rate,
          cost: resource.quantity * resource.rate
        }));

        const totalQuantity = taskResources.reduce((sum, r) => sum + r.quantity, 0);
        const totalCost = taskResources.reduce((sum, r) => sum + r.cost, 0);

        summaries.push({
          taskId,
          taskName: task.name,
          assignedResources: resources.length,
          totalQuantity,
          totalCost,
          startDate: task.startDate,
          endDate: task.endDate,
          resources: taskResources,
          demo: config.demo
        });
      });

      // Limit summaries in demo mode
      if (config.demo && summaries.length > 10) {
        return summaries.slice(0, 10);
      }

      // Store summaries
      await persistentStorage.set(this.taskSummariesKey, summaries);
      await this.updateConfig({ lastGenerated: new Date(), summaryType: 'task' });

      return summaries;
    } catch (error) {
      console.error('Error generating task summary:', error);
      return [];
    }
  }

  /**
   * Generate resource summary
   */
  async generateResourceSummary(assignedResources: Record<string, any[]>, tasks: any[]): Promise<ResourceSummary[]> {
    try {
      const config = await this.getConfig();
      const resourceMap = new Map<string, ResourceSummary>();

      Object.entries(assignedResources).forEach(([taskId, resources]) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        resources.forEach((resource: any) => {
          const resourceId = resource.resourceId;
          const resourceName = resource.name || `Resource ${resourceId}`;
          const type = resource.type;

          if (!resourceMap.has(resourceId)) {
            resourceMap.set(resourceId, {
              resourceId,
              resourceName,
              type,
              tasksAssigned: 0,
              totalQuantity: 0,
              totalCost: 0,
              peakUsage: 0,
              tasks: [],
              demo: config.demo
            });
          }

          const summary = resourceMap.get(resourceId)!;
          const cost = resource.quantity * resource.rate;

          summary.tasksAssigned++;
          summary.totalQuantity += resource.quantity;
          summary.totalCost += cost;
          summary.peakUsage = Math.max(summary.peakUsage, resource.quantity);

          summary.tasks.push({
            taskId,
            taskName: task.name,
            quantity: resource.quantity,
            unit: resource.unit,
            rate: resource.rate,
            cost
          });
        });
      });

      const summaries = Array.from(resourceMap.values());

      // Limit summaries in demo mode
      if (config.demo && summaries.length > 10) {
        return summaries.slice(0, 10);
      }

      // Store summaries
      await persistentStorage.set(this.resourceSummariesKey, summaries);
      await this.updateConfig({ lastGenerated: new Date(), summaryType: 'resource' });

      return summaries;
    } catch (error) {
      console.error('Error generating resource summary:', error);
      return [];
    }
  }

  /**
   * Export allocation summary
   */
  async exportAllocationSummary(type: 'task' | 'resource', format: 'csv' | 'xlsx' | 'pdf'): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Check demo mode restrictions
      if (config.demo && (format === 'pdf' || format === 'xlsx')) {
        throw new Error('PDF and Excel exports are not available in demo mode. Please use CSV export.');
      }

      let data: any[] = [];
      let filename = '';

      if (type === 'task') {
        data = await this.getStoredTaskSummaries();
        filename = `task-allocation-summary-${new Date().toISOString().split('T')[0]}`;
      } else {
        data = await this.getStoredResourceSummaries();
        filename = `resource-allocation-summary-${new Date().toISOString().split('T')[0]}`;
      }

      // Add demo tag if in demo mode
      if (config.demo) {
        filename = `Demo - ${filename} - Not for official use`;
      }

      // Generate export based on format
      switch (format) {
        case 'csv':
          await this.exportToCSV(data, filename);
          break;
        case 'xlsx':
          await this.exportToXLSX(data, filename);
          break;
        case 'pdf':
          await this.exportToPDF(data, filename);
          break;
      }

      console.log(`Allocation summary exported as ${format.toUpperCase()}: ${filename}`);
    } catch (error) {
      console.error('Error exporting allocation summary:', error);
      throw error;
    }
  }

  /**
   * Export to CSV
   */
  private async exportToCSV(data: any[], filename: string): Promise<void> {
    // Mock CSV export
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export to XLSX
   */
  private async exportToXLSX(data: any[], filename: string): Promise<void> {
    // Mock XLSX export
    console.log('XLSX export would be implemented here');
    alert(`XLSX export for ${filename} would be implemented with a proper Excel library`);
  }

  /**
   * Export to PDF
   */
  private async exportToPDF(data: any[], filename: string): Promise<void> {
    // Mock PDF export
    console.log('PDF export would be implemented here');
    alert(`PDF export for ${filename} would be implemented with a proper PDF library`);
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Get stored task summaries
   */
  async getStoredTaskSummaries(): Promise<TaskSummary[]> {
    try {
      const summaries = await persistentStorage.get(this.taskSummariesKey);
      return summaries || [];
    } catch (error) {
      console.error('Error getting stored task summaries:', error);
      return [];
    }
  }

  /**
   * Get stored resource summaries
   */
  async getStoredResourceSummaries(): Promise<ResourceSummary[]> {
    try {
      const summaries = await persistentStorage.get(this.resourceSummariesKey);
      return summaries || [];
    } catch (error) {
      console.error('Error getting stored resource summaries:', error);
      return [];
    }
  }

  /**
   * Clear all summaries
   */
  async clearAll(): Promise<void> {
    try {
      await persistentStorage.remove(this.taskSummariesKey);
      await persistentStorage.remove(this.resourceSummariesKey);
      console.log('All allocation summaries cleared');
    } catch (error) {
      console.error('Error clearing allocation summaries:', error);
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
        console.log('Demo allocation summary data reset');
      }
    } catch (error) {
      console.error('Error resetting demo allocation summary data:', error);
      throw error;
    }
  }
}

export const allocationSummaryService = new AllocationSummaryService(); 