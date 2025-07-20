// Advanced Gantt Chart Service - PowerProject Competitive Features
// This service provides enterprise-grade project management capabilities

export interface GanttTask {
  id: string;
  name: string;
  wbsId: string;
  parentId: string | null;
  type: 'summary' | 'task' | 'milestone';
  start: Date;
  end: Date;
  duration: number;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  isCritical: boolean;
  expanded: boolean;
  children?: GanttTask[];
  level?: number;
  constraints?: TaskConstraint;
  dependencies?: TaskDependency[];
  resources?: TaskResource[];
  baseline?: TaskBaseline;
  actuals?: TaskActuals;
  notes?: string;
  customFields?: Record<string, any>;
}

export interface TaskConstraint {
  type: 'start-no-earlier-than' | 'finish-no-later-than' | 'must-start-on' | 'must-finish-on' | 'as-soon-as-possible' | 'as-late-as-possible';
  date?: Date;
}

export interface TaskDependency {
  id: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag?: number;
}

export interface TaskResource {
  id: string;
  name: string;
  type: 'work' | 'material' | 'cost';
  units: number;
  cost?: number;
}

export interface TaskBaseline {
  start: Date;
  end: Date;
  duration: number;
  progress: number;
}

export interface TaskActuals {
  start?: Date;
  end?: Date;
  duration?: number;
  progress?: number;
  cost?: number;
}

export interface Resource {
  id: string;
  name: string;
  type: 'work' | 'material' | 'cost';
  maxUnits: number;
  costPerUnit?: number;
  calendar?: ResourceCalendar;
  availability: number;
  currentUtilization: number;
}

export interface ResourceCalendar {
  workingDays: number[];
  workingHours: { start: string; end: string };
  holidays: Date[];
}

export interface CriticalPathAnalysis {
  criticalTasks: string[];
  totalFloat: Record<string, number>;
  freeFloat: Record<string, number>;
  projectDuration: number;
  criticalPathDuration: number;
  slack: Record<string, number>;
}

export interface ScheduleOptimization {
  optimizedTasks: GanttTask[];
  resourceLeveling: ResourceLevelingResult;
  costOptimization: CostOptimizationResult;
  durationOptimization: DurationOptimizationResult;
}

export interface ResourceLevelingResult {
  leveledTasks: GanttTask[];
  resourceConflicts: ResourceConflict[];
  levelingActions: LevelingAction[];
}

export interface ResourceConflict {
  resourceId: string;
  resourceName: string;
  conflictingTasks: string[];
  conflictPeriod: { start: Date; end: Date };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface LevelingAction {
  type: 'delay' | 'split' | 'reassign' | 'extend';
  taskId: string;
  description: string;
  impact: { duration: number; cost: number };
}

export interface CostOptimizationResult {
  originalCost: number;
  optimizedCost: number;
  savings: number;
  optimizationActions: OptimizationAction[];
}

export interface DurationOptimizationResult {
  originalDuration: number;
  optimizedDuration: number;
  reduction: number;
  optimizationActions: OptimizationAction[];
}

export interface OptimizationAction {
  type: 'crash' | 'fast-track' | 'resource-reallocation' | 'scope-reduction';
  taskId: string;
  description: string;
  impact: { duration: number; cost: number; risk: number };
}

export interface PerformanceMetrics {
  schedulePerformanceIndex: number;
  costPerformanceIndex: number;
  resourceUtilization: number;
  criticalPathVariance: number;
  earnedValue: number;
  plannedValue: number;
  actualCost: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
}

class AdvancedGanttService {
  private tasks: GanttTask[] = [];
  private resources: Resource[] = [];
  private criticalPathAnalysis: CriticalPathAnalysis | null = null;

  // Initialize the service
  async initialize(projectId: string): Promise<void> {
    try {
      // Load project data
      await this.loadProjectData(projectId);
      
      // Perform initial analysis
      this.performCriticalPathAnalysis();
      this.calculateResourceUtilization();
      
      console.log('Advanced Gantt Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Advanced Gantt Service:', error);
      throw error;
    }
  }

  // Load project data from various sources
  private async loadProjectData(projectId: string): Promise<void> {
    // This would integrate with your existing data services
    const { demoDataService } = await import('./demoData');
    
    // Load tasks
    const allTasks = await demoDataService.getGanttTasks();
    this.tasks = allTasks.filter((task: any) => task.projectId === projectId);
    
    // Load resources - create sample resources for now
    this.resources = this.createSampleResources();
    
    // If no data, create sample data
    if (this.tasks.length === 0) {
      this.tasks = this.createSampleTasks();
    }
  }

  // Critical Path Analysis (CPM Algorithm)
  performCriticalPathAnalysis(): CriticalPathAnalysis {
    const taskMap = new Map<string, GanttTask>();
    const dependencies = new Map<string, string[]>();
    const predecessors = new Map<string, string[]>();
    
    // Build task map and dependency relationships
    this.tasks.forEach(task => {
      taskMap.set(task.id, task);
      dependencies.set(task.id, []);
      predecessors.set(task.id, []);
    });
    
    // Build dependency graph
    this.tasks.forEach(task => {
      if (task.dependencies) {
        task.dependencies.forEach(dep => {
          const depList = dependencies.get(task.id) || [];
          depList.push(dep.id);
          dependencies.set(task.id, depList);
          
          const predList = predecessors.get(dep.id) || [];
          predList.push(task.id);
          predecessors.set(dep.id, predList);
        });
      }
    });
    
    // Forward Pass - Calculate Early Start and Early Finish
    const earlyStart = new Map<string, number>();
    const earlyFinish = new Map<string, number>();
    
    const forwardPass = (taskId: string): number => {
      if (earlyStart.has(taskId)) {
        return earlyStart.get(taskId)!;
      }
      
      const task = taskMap.get(taskId);
      if (!task) return 0;
      
      const preds = predecessors.get(taskId) || [];
      let maxEarlyFinish = 0;
      
      preds.forEach(predId => {
        const predEarlyFinish = forwardPass(predId);
        maxEarlyFinish = Math.max(maxEarlyFinish, predEarlyFinish);
      });
      
      earlyStart.set(taskId, maxEarlyFinish);
      earlyFinish.set(taskId, maxEarlyFinish + task.duration);
      
      return earlyFinish.get(taskId)!;
    };
    
    // Backward Pass - Calculate Late Start and Late Finish
    const lateStart = new Map<string, number>();
    const lateFinish = new Map<string, number>();
    
    const backwardPass = (taskId: string): number => {
      if (lateFinish.has(taskId)) {
        return lateFinish.get(taskId)!;
      }
      
      const task = taskMap.get(taskId);
      if (!task) return 0;
      
      const deps = dependencies.get(taskId) || [];
      let minLateStart = deps.length === 0 ? earlyFinish.get(taskId)! : Infinity;
      
      deps.forEach(depId => {
        const depLateStart = backwardPass(depId);
        minLateStart = Math.min(minLateStart, depLateStart);
      });
      
      lateFinish.set(taskId, minLateStart);
      lateStart.set(taskId, minLateStart - task.duration);
      
      return lateStart.get(taskId)!;
    };
    
    // Execute passes
    this.tasks.forEach(task => {
      if (predecessors.get(task.id)?.length === 0) {
        forwardPass(task.id);
      }
    });
    
    this.tasks.forEach(task => {
      if (dependencies.get(task.id)?.length === 0) {
        backwardPass(task.id);
      }
    });
    
    // Calculate float and identify critical path
    const criticalTasks: string[] = [];
    const totalFloat: Record<string, number> = {};
    const freeFloat: Record<string, number> = {};
    const slack: Record<string, number> = {};
    
    this.tasks.forEach(task => {
      const es = earlyStart.get(task.id) || 0;
      const ef = earlyFinish.get(task.id) || 0;
      const ls = lateStart.get(task.id) || 0;
      const lf = lateFinish.get(task.id) || 0;
      
      const tf = ls - es; // Total Float
      const ff = Math.min(...(dependencies.get(task.id) || []).map(depId => 
        (earlyStart.get(depId) || 0) - ef
      ), Infinity); // Free Float
      
      totalFloat[task.id] = tf;
      freeFloat[task.id] = ff;
      slack[task.id] = tf;
      
      if (tf === 0) {
        criticalTasks.push(task.id);
        task.isCritical = true;
      } else {
        task.isCritical = false;
      }
    });
    
    const projectDuration = Math.max(...Array.from(earlyFinish.values()));
    const criticalPathDuration = projectDuration;
    
    this.criticalPathAnalysis = {
      criticalTasks,
      totalFloat,
      freeFloat,
      projectDuration,
      criticalPathDuration,
      slack
    };
    
    return this.criticalPathAnalysis;
  }

  // Resource Leveling
  performResourceLeveling(): ResourceLevelingResult {
    const resourceConflicts: ResourceConflict[] = [];
    const levelingActions: LevelingAction[] = [];
    const leveledTasks = [...this.tasks];
    
    // Identify resource conflicts
    this.resources.forEach(resource => {
      const resourceTasks = this.tasks.filter(task => 
        task.resources?.some(r => r.id === resource.id)
      );
      
      // Check for overlapping assignments
      for (let i = 0; i < resourceTasks.length; i++) {
        for (let j = i + 1; j < resourceTasks.length; j++) {
          const task1 = resourceTasks[i];
          const task2 = resourceTasks[j];
          
          if (task1 && task2 && this.tasksOverlap(task1, task2)) {
            const conflict: ResourceConflict = {
              resourceId: resource.id,
              resourceName: resource.name,
              conflictingTasks: [task1.id, task2.id],
              conflictPeriod: {
                start: new Date(Math.max(task1.start.getTime(), task2.start.getTime())),
                end: new Date(Math.min(task1.end.getTime(), task2.end.getTime()))
              },
              severity: this.calculateConflictSeverity(task1, task2, resource)
            };
            
            resourceConflicts.push(conflict);
            
            // Generate leveling action
            const action: LevelingAction = {
              type: 'delay',
              taskId: task2.id,
              description: `Delay task "${task2.name}" to resolve resource conflict with "${task1.name}"`,
              impact: {
                duration: this.calculateDelayImpact(task2),
                cost: this.calculateDelayCost(task2)
              }
            };
            
            levelingActions.push(action);
          }
        }
      }
    });
    
    return {
      leveledTasks,
      resourceConflicts,
      levelingActions
    };
  }

  // Schedule Optimization
  optimizeSchedule(options: {
    optimizeDuration?: boolean;
    optimizeCost?: boolean;
    optimizeResources?: boolean;
    maxDuration?: number;
    maxCost?: number;
  }): ScheduleOptimization {
    const optimizationActions: OptimizationAction[] = [];
    let optimizedTasks = [...this.tasks];
    
    // Duration optimization (Crashing)
    if (options.optimizeDuration) {
      const criticalTasks = optimizedTasks.filter(task => task.isCritical);
      
      criticalTasks.forEach(task => {
        if (task.duration > 1) {
          const action: OptimizationAction = {
            type: 'crash',
            taskId: task.id,
            description: `Crash task "${task.name}" to reduce duration`,
            impact: {
              duration: -1,
              cost: this.calculateCrashCost(task),
              risk: 0.3
            }
          };
          optimizationActions.push(action);
        }
      });
    }
    
    // Cost optimization
    if (options.optimizeCost) {
      const expensiveTasks = optimizedTasks.filter(task => 
        task.resources?.reduce((sum, res) => sum + (res.cost || 0), 0) || 0 > 1000
      );
      
      expensiveTasks.forEach(task => {
        const action: OptimizationAction = {
          type: 'resource-reallocation',
          taskId: task.id,
          description: `Reallocate resources for task "${task.name}" to reduce cost`,
          impact: {
            duration: 0,
            cost: -this.calculateCostSavings(task),
            risk: 0.2
          }
        };
        optimizationActions.push(action);
      });
    }
    
    // Resource optimization
    if (options.optimizeResources) {
      const resourceLeveling = this.performResourceLeveling();
      
      resourceLeveling.levelingActions.forEach(levelingAction => {
        const action: OptimizationAction = {
          type: 'resource-reallocation',
          taskId: levelingAction.taskId,
          description: levelingAction.description,
          impact: {
            duration: levelingAction.impact.duration,
            cost: levelingAction.impact.cost,
            risk: 0.1
          }
        };
        optimizationActions.push(action);
      });
    }
    
    const costOptimization: CostOptimizationResult = {
      originalCost: this.calculateTotalCost(this.tasks),
      optimizedCost: this.calculateTotalCost(optimizedTasks),
      savings: 0,
      optimizationActions: optimizationActions.filter(a => a.type === 'resource-reallocation')
    };
    
    const durationOptimization: DurationOptimizationResult = {
      originalDuration: this.calculateProjectDuration(this.tasks),
      optimizedDuration: this.calculateProjectDuration(optimizedTasks),
      reduction: 0,
      optimizationActions: optimizationActions.filter(a => a.type === 'crash')
    };
    
    return {
      optimizedTasks,
      resourceLeveling: this.performResourceLeveling(),
      costOptimization,
      durationOptimization
    };
  }

  // Performance Metrics Calculation (EVM)
  calculatePerformanceMetrics(): PerformanceMetrics {
    const tasks = this.getFlattenedTasks();
    
    // Earned Value Management calculations
    const plannedValue = tasks.reduce((sum, task) => 
      sum + (task.progress / 100) * this.calculateTaskCost(task), 0
    );
    
    const earnedValue = tasks.reduce((sum, task) => 
      sum + (task.actuals?.progress || 0) / 100 * this.calculateTaskCost(task), 0
    );
    
    const actualCost = tasks.reduce((sum, task) => 
      sum + (task.actuals?.cost || 0), 0
    );
    
    const schedulePerformanceIndex = plannedValue > 0 ? earnedValue / plannedValue : 0;
    const costPerformanceIndex = actualCost > 0 ? earnedValue / actualCost : 0;
    
    const resourceUtilization = this.resources.reduce((sum, res) => 
      sum + res.currentUtilization, 0
    ) / this.resources.length || 0;
    
    const criticalPathVariance = this.criticalPathAnalysis ? 
      (this.criticalPathAnalysis.projectDuration - this.criticalPathAnalysis.criticalPathDuration) / 
      this.criticalPathAnalysis.projectDuration : 0;
    
    const estimateAtCompletion = actualCost + (earnedValue - actualCost) / costPerformanceIndex;
    const estimateToComplete = estimateAtCompletion - actualCost;
    const varianceAtCompletion = earnedValue - estimateAtCompletion;
    
    return {
      schedulePerformanceIndex,
      costPerformanceIndex,
      resourceUtilization,
      criticalPathVariance,
      earnedValue,
      plannedValue,
      actualCost,
      estimateAtCompletion,
      estimateToComplete,
      varianceAtCompletion
    };
  }

  // Utility methods
  private getFlattenedTasks(): GanttTask[] {
    const flattened: GanttTask[] = [];
    
    const flatten = (tasks: GanttTask[], level = 0) => {
      tasks.forEach(task => {
        task.level = level;
        flattened.push(task);
        if (task.children && task.children.length > 0) {
          flatten(task.children, level + 1);
        }
      });
    };
    
    flatten(this.tasks);
    return flattened;
  }

  private tasksOverlap(task1: GanttTask, task2: GanttTask): boolean {
    return task1.start < task2.end && task2.start < task1.end;
  }

  private calculateConflictSeverity(task1: GanttTask, task2: GanttTask, resource: Resource): 'low' | 'medium' | 'high' | 'critical' {
    const overlapDuration = Math.min(task1.end.getTime(), task2.end.getTime()) - 
                           Math.max(task1.start.getTime(), task2.start.getTime());
    const totalDuration = Math.max(task1.end.getTime(), task2.end.getTime()) - 
                         Math.min(task1.start.getTime(), task2.start.getTime());
    const overlapRatio = overlapDuration / totalDuration;
    
    if (overlapRatio > 0.8) return 'critical';
    if (overlapRatio > 0.5) return 'high';
    if (overlapRatio > 0.2) return 'medium';
    return 'low';
  }

  private calculateDelayImpact(task: GanttTask): number {
    return task.duration * 0.1; // 10% delay impact
  }

  private calculateDelayCost(task: GanttTask): number {
    return this.calculateTaskCost(task) * 0.05; // 5% cost increase
  }

  private calculateCrashCost(task: GanttTask): number {
    return this.calculateTaskCost(task) * 0.2; // 20% crash cost
  }

  private calculateCostSavings(task: GanttTask): number {
    return this.calculateTaskCost(task) * 0.15; // 15% cost savings
  }

  private calculateTaskCost(task: GanttTask): number {
    return task.resources?.reduce((sum, res) => sum + (res.cost || 0), 0) || 0;
  }

  private calculateTotalCost(tasks: GanttTask[]): number {
    return tasks.reduce((sum, task) => sum + this.calculateTaskCost(task), 0);
  }

  private calculateProjectDuration(tasks: GanttTask[]): number {
    if (tasks.length === 0) return 0;
    const endDates = tasks.map(task => task.end.getTime());
    const startDates = tasks.map(task => task.start.getTime());
    return Math.max(...endDates) - Math.min(...startDates);
  }

  private calculateResourceUtilization(): void {
    this.resources.forEach(resource => {
      const resourceTasks = this.tasks.filter(task => 
        task.resources?.some(r => r.id === resource.id)
      );
      
      const totalAssignedUnits = resourceTasks.reduce((sum, task) => {
        const taskResource = task.resources?.find(r => r.id === resource.id);
        return sum + (taskResource?.units || 0);
      }, 0);
      
      resource.currentUtilization = totalAssignedUnits / resource.maxUnits;
    });
  }

  // Sample data creation
  private createSampleTasks(): GanttTask[] {
    return [
      {
        id: '1',
        name: 'Project Planning',
        wbsId: '1.0',
        parentId: null,
        type: 'summary',
        start: new Date('2024-01-01'),
        end: new Date('2024-01-15'),
        duration: 15,
        progress: 100,
        status: 'completed',
        priority: 'high',
        assignee: 'Project Manager',
        isCritical: true,
        expanded: true,
        constraints: { type: 'as-soon-as-possible' },
        resources: [
          { id: 'res1', name: 'Project Manager', type: 'work', units: 1, cost: 100 }
        ],
        baseline: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-15'),
          duration: 15,
          progress: 100
        },
        actuals: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-15'),
          duration: 15,
          progress: 100,
          cost: 1500
        },
        notes: 'Project planning phase completed successfully',
        children: []
      }
    ];
  }

  private createSampleResources(): Resource[] {
    return [
      {
        id: 'res1',
        name: 'Project Manager',
        type: 'work',
        maxUnits: 1,
        costPerUnit: 100,
        calendar: {
          workingDays: [1, 2, 3, 4, 5],
          workingHours: { start: '09:00', end: '17:00' },
          holidays: []
        },
        availability: 1,
        currentUtilization: 0.8
      }
    ];
  }

  // Public API methods
  getTasks(): GanttTask[] {
    return this.tasks;
  }

  getResources(): Resource[] {
    return this.resources;
  }

  getCriticalPathAnalysis(): CriticalPathAnalysis | null {
    return this.criticalPathAnalysis;
  }

  updateTask(taskId: string, updates: Partial<GanttTask>): void {
    const updateTaskRecursive = (tasks: GanttTask[]): GanttTask[] => {
      return tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, ...updates };
        }
        if (task.children) {
          return { ...task, children: updateTaskRecursive(task.children) };
        }
        return task;
      });
    };
    
    this.tasks = updateTaskRecursive(this.tasks);
    this.performCriticalPathAnalysis();
  }

  addTask(task: GanttTask): void {
    this.tasks.push(task);
    this.performCriticalPathAnalysis();
  }

  deleteTask(taskId: string): void {
    const removeTaskRecursive = (tasks: GanttTask[]): GanttTask[] => {
      return tasks.filter(task => {
        if (task.id === taskId) {
          return false;
        }
        if (task.children) {
          task.children = removeTaskRecursive(task.children);
        }
        return true;
      });
    };
    
    this.tasks = removeTaskRecursive(this.tasks);
    this.performCriticalPathAnalysis();
  }
}

// Export singleton instance
export const advancedGanttService = new AdvancedGanttService(); 