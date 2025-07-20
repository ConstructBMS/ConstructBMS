import type { Task } from './ganttTaskService';

export interface Baseline {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  projectData: {
    tasks: Task[];
    projectStartDate: Date;
    projectEndDate: Date;
    totalDuration: number;
    totalCost: number;
  };
  metadata: {
    version: string;
    createdBy: string;
    notes?: string;
  };
}

export interface BaselineComparison {
  baselineId: string;
  baselineName: string;
  currentData: {
    tasks: Task[];
    projectStartDate: Date;
    projectEndDate: Date;
    totalDuration: number;
    totalCost: number;
  };
  differences: {
    addedTasks: Task[];
    removedTasks: Task[];
    modifiedTasks: Array<{
      taskId: string;
      taskName: string;
      changes: Array<{
        field: string;
        baselineValue: any;
        currentValue: any;
      }>;
    }>;
    scheduleVariance: {
      startDateVariance: number;
      endDateVariance: number;
      durationVariance: number;
    };
    costVariance: {
      totalCostVariance: number;
      costVariancePercentage: number;
    };
  };
}

export class BaselineService {
  private static instance: BaselineService;
  private baselines: Map<string, Baseline> = new Map();

  static getInstance(): BaselineService {
    if (!BaselineService.instance) {
      BaselineService.instance = new BaselineService();
    }
    return BaselineService.instance;
  }

  /**
   * Create a new baseline
   */
  createBaseline(
    name: string,
    tasks: Task[],
    description?: string,
    createdBy: string = 'System',
    notes?: string
  ): Baseline {
    const id = `baseline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate project metrics
    const projectStartDate = this.getProjectStartDate(tasks);
    const projectEndDate = this.getProjectEndDate(tasks);
    const totalDuration = this.getProjectDuration(tasks);
    const totalCost = this.getProjectCost(tasks);

    const baseline: Baseline = {
      id,
      name,
      ...(description && { description }),
      createdAt: new Date(),
      projectData: {
        tasks: JSON.parse(JSON.stringify(tasks)), // Deep copy
        projectStartDate,
        projectEndDate,
        totalDuration,
        totalCost
      },
      metadata: {
        version: '1.0',
        createdBy,
        ...(notes && { notes })
      }
    };

    this.baselines.set(id, baseline);
    this.saveBaselinesToStorage();
    
    return baseline;
  }

  /**
   * Get all baselines
   */
  getAllBaselines(): Baseline[] {
    return Array.from(this.baselines.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get a specific baseline
   */
  getBaseline(baselineId: string): Baseline | null {
    return this.baselines.get(baselineId) || null;
  }

  /**
   * Delete a baseline
   */
  deleteBaseline(baselineId: string): boolean {
    const deleted = this.baselines.delete(baselineId);
    if (deleted) {
      this.saveBaselinesToStorage();
    }
    return deleted;
  }

  /**
   * Update baseline metadata
   */
  updateBaseline(baselineId: string, updates: Partial<Baseline>): Baseline | null {
    const baseline = this.baselines.get(baselineId);
    if (!baseline) return null;

    const updatedBaseline = { ...baseline, ...updates };
    this.baselines.set(baselineId, updatedBaseline);
    this.saveBaselinesToStorage();
    
    return updatedBaseline;
  }

  /**
   * Compare current project with a baseline
   */
  compareWithBaseline(baselineId: string, currentTasks: Task[]): BaselineComparison | null {
    const baseline = this.baselines.get(baselineId);
    if (!baseline) return null;

    const baselineTasks = baseline.projectData.tasks;
    const currentData = {
      tasks: currentTasks,
      projectStartDate: this.getProjectStartDate(currentTasks),
      projectEndDate: this.getProjectEndDate(currentTasks),
      totalDuration: this.getProjectDuration(currentTasks),
      totalCost: this.getProjectCost(currentTasks)
    };

    // Find added, removed, and modified tasks
    const baselineTaskIds = new Set(baselineTasks.map(t => t.id));
    const currentTaskIds = new Set(currentTasks.map(t => t.id));

    const addedTasks = currentTasks.filter(task => !baselineTaskIds.has(task.id));
    const removedTasks = baselineTasks.filter(task => !currentTaskIds.has(task.id));

    const modifiedTasks = this.findModifiedTasks(baselineTasks, currentTasks);

    // Calculate schedule variance
    const scheduleVariance = {
      startDateVariance: currentData.projectStartDate.getTime() - baseline.projectData.projectStartDate.getTime(),
      endDateVariance: currentData.projectEndDate.getTime() - baseline.projectData.projectEndDate.getTime(),
      durationVariance: currentData.totalDuration - baseline.projectData.totalDuration
    };

    // Calculate cost variance
    const costVariance = {
      totalCostVariance: currentData.totalCost - baseline.projectData.totalCost,
      costVariancePercentage: baseline.projectData.totalCost > 0 
        ? ((currentData.totalCost - baseline.projectData.totalCost) / baseline.projectData.totalCost) * 100
        : 0
    };

    return {
      baselineId,
      baselineName: baseline.name,
      currentData,
      differences: {
        addedTasks,
        removedTasks,
        modifiedTasks,
        scheduleVariance,
        costVariance
      }
    };
  }

  /**
   * Find tasks that have been modified between baseline and current
   */
  private findModifiedTasks(baselineTasks: Task[], currentTasks: Task[]): Array<{
    taskId: string;
    taskName: string;
    changes: Array<{
      field: string;
      baselineValue: any;
      currentValue: any;
    }>;
  }> {
    const modifiedTasks: Array<{
      taskId: string;
      taskName: string;
      changes: Array<{
        field: string;
        baselineValue: any;
        currentValue: any;
      }>;
    }> = [];

    const baselineTaskMap = new Map(baselineTasks.map(t => [t.id, t]));
    const currentTaskMap = new Map(currentTasks.map(t => [t.id, t]));

    // Check for modifications in existing tasks
    for (const [taskId, baselineTask] of baselineTaskMap) {
      const currentTask = currentTaskMap.get(taskId);
      if (!currentTask) continue; // Task was removed (handled separately)

      const changes: Array<{
        field: string;
        baselineValue: any;
        currentValue: any;
      }> = [];

      // Compare key fields
      const fieldsToCompare = [
        'name', 'startDate', 'endDate', 'duration', 'percentComplete', 
        'status', 'priority', 'assignedTo', 'cost', 'predecessors', 'successors'
      ];

      for (const field of fieldsToCompare) {
        const baselineValue = (baselineTask as any)[field];
        const currentValue = (currentTask as any)[field];

        if (this.hasValueChanged(baselineValue, currentValue)) {
          changes.push({
            field,
            baselineValue,
            currentValue
          });
        }
      }

      if (changes.length > 0) {
        modifiedTasks.push({
          taskId,
          taskName: currentTask.name,
          changes
        });
      }
    }

    return modifiedTasks;
  }

  /**
   * Check if two values are different
   */
  private hasValueChanged(baselineValue: any, currentValue: any): boolean {
    // Handle arrays (like predecessors, successors)
    if (Array.isArray(baselineValue) && Array.isArray(currentValue)) {
      if (baselineValue.length !== currentValue.length) return true;
      return baselineValue.some((val, index) => val !== currentValue[index]);
    }

    // Handle dates
    if (baselineValue instanceof Date && currentValue instanceof Date) {
      return baselineValue.getTime() !== currentValue.getTime();
    }

    // Handle primitive values
    return baselineValue !== currentValue;
  }

  /**
   * Get project start date
   */
  private getProjectStartDate(tasks: Task[]): Date {
    if (tasks.length === 0) return new Date();
    
    const startDates = tasks.map(task => task.startDate);
    return new Date(Math.min(...startDates.map(date => date.getTime())));
  }

  /**
   * Get project end date
   */
  private getProjectEndDate(tasks: Task[]): Date {
    if (tasks.length === 0) return new Date();
    
    const endDates = tasks.map(task => task.endDate);
    return new Date(Math.max(...endDates.map(date => date.getTime())));
  }

  /**
   * Get project duration
   */
  private getProjectDuration(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    
    const startDate = this.getProjectStartDate(tasks);
    const endDate = this.getProjectEndDate(tasks);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Get project total cost
   */
  private getProjectCost(tasks: Task[]): number {
    return tasks.reduce((total, task) => total + (task.cost || 0), 0);
  }

  /**
   * Save baselines to localStorage
   */
  private saveBaselinesToStorage(): void {
    try {
      const baselinesArray = Array.from(this.baselines.values());
      localStorage.setItem('gantt_baselines', JSON.stringify(baselinesArray));
    } catch (error) {
      console.error('Failed to save baselines to storage:', error);
    }
  }

  /**
   * Load baselines from localStorage
   */
  loadBaselinesFromStorage(): void {
    try {
      const stored = localStorage.getItem('gantt_baselines');
      if (stored) {
        const baselinesArray = JSON.parse(stored);
        this.baselines.clear();
        
        baselinesArray.forEach((baseline: any) => {
          // Convert date strings back to Date objects
          baseline.createdAt = new Date(baseline.createdAt);
          baseline.projectData.projectStartDate = new Date(baseline.projectData.projectStartDate);
          baseline.projectData.projectEndDate = new Date(baseline.projectData.projectEndDate);
          baseline.projectData.tasks.forEach((task: any) => {
            task.startDate = new Date(task.startDate);
            task.endDate = new Date(task.endDate);
          });
          
          this.baselines.set(baseline.id, baseline);
        });
      }
    } catch (error) {
      console.error('Failed to load baselines from storage:', error);
    }
  }

  /**
   * Clear all baselines
   */
  clearAllBaselines(): void {
    this.baselines.clear();
    localStorage.removeItem('gantt_baselines');
  }

  /**
   * Get baseline statistics
   */
  getBaselineStatistics(): {
    totalBaselines: number;
    oldestBaseline: Date | null;
    newestBaseline: Date | null;
    averageTasksPerBaseline: number;
  } {
    const baselines = this.getAllBaselines();
    
    if (baselines.length === 0) {
      return {
        totalBaselines: 0,
        oldestBaseline: null,
        newestBaseline: null,
        averageTasksPerBaseline: 0
      };
    }

    const dates = baselines.map(b => b.createdAt);
    const totalTasks = baselines.reduce((sum, b) => sum + b.projectData.tasks.length, 0);

    return {
      totalBaselines: baselines.length,
      oldestBaseline: new Date(Math.min(...dates.map(d => d.getTime()))),
      newestBaseline: new Date(Math.max(...dates.map(d => d.getTime()))),
      averageTasksPerBaseline: Math.round(totalTasks / baselines.length)
    };
  }
}

export const baselineService = BaselineService.getInstance();

// Load baselines on service initialization
baselineService.loadBaselinesFromStorage(); 