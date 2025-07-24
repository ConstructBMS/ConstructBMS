import { persistentStorage } from './persistentStorage';
import { demoModeService } from './demoModeService';

export interface TaskDependency {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number; // in working days (positive = lag, negative = lead)
  projectId: string;
  demo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConstraintViolation {
  dependencyId: string;
  sourceTaskId: string;
  targetTaskId: string;
  type: string;
  lag: number;
  violation: string;
  severity: 'warning' | 'error';
}

export interface CreateDependencyData {
  sourceTaskId: string;
  targetTaskId: string;
  type?: 'FS' | 'SS' | 'FF' | 'SF';
  lag?: number;
  projectId: string;
}

export interface UpdateDependencyData {
  type?: 'FS' | 'SS' | 'FF' | 'SF';
  lag?: number;
}

export interface TaskSchedule {
  id: string;
  startDate: Date;
  endDate: Date;
  duration: number;
}

class DependencyConstraintsService {
  private readonly dependenciesKey = 'task_dependencies';
  private readonly maxDemoConstraints = 3;
  private readonly maxDemoLag = 2;

  /**
   * Get all dependencies for a project
   */
  async getProjectDependencies(projectId: string): Promise<TaskDependency[]> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      const allDependencies = await this.getAllDependencies();
      
      return allDependencies.filter(dep => 
        dep.projectId === projectId && 
        (isDemoMode ? dep.demo : true)
      );
    } catch (error) {
      console.error('Error getting project dependencies:', error);
      return [];
    }
  }

  /**
   * Get dependencies for a specific task
   */
  async getTaskDependencies(taskId: string): Promise<{
    predecessors: TaskDependency[];
    successors: TaskDependency[];
  }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      const allDependencies = await this.getAllDependencies();
      
      const filteredDeps = allDependencies.filter(dep => 
        (isDemoMode ? dep.demo : true)
      );
      
      return {
        predecessors: filteredDeps.filter(dep => dep.targetTaskId === taskId),
        successors: filteredDeps.filter(dep => dep.sourceTaskId === taskId)
      };
    } catch (error) {
      console.error('Error getting task dependencies:', error);
      return { predecessors: [], successors: [] };
    }
  }

  /**
   * Create a new dependency
   */
  async createDependency(data: CreateDependencyData): Promise<{ success: boolean; error?: string; dependency?: TaskDependency }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      const allDependencies = await this.getAllDependencies();
      
      // Demo mode restrictions
      if (isDemoMode) {
        const projectDeps = allDependencies.filter(dep => 
          dep.projectId === data.projectId && dep.demo
        );
        
        if (projectDeps.length >= this.maxDemoConstraints) {
          return { success: false, error: `Maximum ${this.maxDemoConstraints} constraints allowed in demo mode` };
        }
        
        // Only allow FS and SS types in demo mode
        if (data.type && !['FS', 'SS'].includes(data.type)) {
          return { success: false, error: 'Only FS and SS constraint types allowed in demo mode' };
        }
        
        // Limit lag in demo mode
        if (data.lag && (data.lag < 0 || data.lag > this.maxDemoLag)) {
          return { success: false, error: `Lag must be between 0 and ${this.maxDemoLag} days in demo mode` };
        }
      }
      
      // Validate dependency doesn't already exist
      const existingDep = allDependencies.find(dep => 
        dep.sourceTaskId === data.sourceTaskId && 
        dep.targetTaskId === data.targetTaskId &&
        dep.projectId === data.projectId
      );
      
      if (existingDep) {
        return { success: false, error: 'Dependency already exists between these tasks' };
      }
      
      // Validate no circular dependencies
      if (await this.wouldCreateCircularDependency(data.sourceTaskId, data.targetTaskId, data.projectId)) {
        return { success: false, error: 'This dependency would create a circular reference' };
      }
      
      const newDependency: TaskDependency = {
        id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sourceTaskId: data.sourceTaskId,
        targetTaskId: data.targetTaskId,
        type: data.type || 'FS',
        lag: data.lag || 0,
        projectId: data.projectId,
        demo: isDemoMode,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      allDependencies.push(newDependency);
      await persistentStorage.set(this.dependenciesKey, allDependencies);
      
      console.log('Dependency created:', newDependency);
      return { success: true, dependency: newDependency };
    } catch (error) {
      console.error('Error creating dependency:', error);
      return { success: false, error: 'Failed to create dependency' };
    }
  }

  /**
   * Update an existing dependency
   */
  async updateDependency(dependencyId: string, data: UpdateDependencyData): Promise<{ success: boolean; error?: string; dependency?: TaskDependency }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      const allDependencies = await this.getAllDependencies();
      
      const depIndex = allDependencies.findIndex(dep => dep.id === dependencyId);
      if (depIndex === -1) {
        return { success: false, error: 'Dependency not found' };
      }
      
      const dependency = allDependencies[depIndex];
      
      // Demo mode restrictions
      if (isDemoMode && !dependency.demo) {
        return { success: false, error: 'Cannot edit non-demo dependencies in demo mode' };
      }
      
      if (isDemoMode && data.type && !['FS', 'SS'].includes(data.type)) {
        return { success: false, error: 'Only FS and SS constraint types allowed in demo mode' };
      }
      
      if (isDemoMode && data.lag !== undefined && (data.lag < 0 || data.lag > this.maxDemoLag)) {
        return { success: false, error: `Lag must be between 0 and ${this.maxDemoLag} days in demo mode` };
      }
      
      // Update dependency
      allDependencies[depIndex] = {
        ...dependency,
        ...(data.type && { type: data.type }),
        ...(data.lag !== undefined && { lag: data.lag }),
        updatedAt: new Date()
      };
      
      await persistentStorage.set(this.dependenciesKey, allDependencies);
      
      console.log('Dependency updated:', allDependencies[depIndex]);
      return { success: true, dependency: allDependencies[depIndex] };
    } catch (error) {
      console.error('Error updating dependency:', error);
      return { success: false, error: 'Failed to update dependency' };
    }
  }

  /**
   * Delete a dependency
   */
  async deleteDependency(dependencyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      const allDependencies = await this.getAllDependencies();
      
      const dependency = allDependencies.find(dep => dep.id === dependencyId);
      if (!dependency) {
        return { success: false, error: 'Dependency not found' };
      }
      
      // Demo mode restrictions
      if (isDemoMode && !dependency.demo) {
        return { success: false, error: 'Cannot delete non-demo dependencies in demo mode' };
      }
      
      const updatedDependencies = allDependencies.filter(dep => dep.id !== dependencyId);
      await persistentStorage.set(this.dependenciesKey, updatedDependencies);
      
      console.log('Dependency deleted:', dependencyId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting dependency:', error);
      return { success: false, error: 'Failed to delete dependency' };
    }
  }

  /**
   * Check for constraint violations
   */
  async checkConstraintViolations(
    tasks: TaskSchedule[],
    dependencies: TaskDependency[],
    enforceConstraints: boolean = false
  ): Promise<ConstraintViolation[]> {
    const violations: ConstraintViolation[] = [];
    
    for (const dependency of dependencies) {
      const sourceTask = tasks.find(t => t.id === dependency.sourceTaskId);
      const targetTask = tasks.find(t => t.id === dependency.targetTaskId);
      
      if (!sourceTask || !targetTask) continue;
      
      const violation = this.checkSingleConstraint(dependency, sourceTask, targetTask);
      if (violation) {
        violations.push(violation);
        
        // Auto-correct if enforcement is enabled
        if (enforceConstraints) {
          await this.autoCorrectViolation(dependency, sourceTask, targetTask);
        }
      }
    }
    
    return violations;
  }

  /**
   * Check a single constraint for violations
   */
  private checkSingleConstraint(
    dependency: TaskDependency,
    sourceTask: TaskSchedule,
    targetTask: TaskSchedule
  ): ConstraintViolation | null {
    const lagMs = dependency.lag * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    let violation: ConstraintViolation | null = null;
    
    switch (dependency.type) {
      case 'FS': // Finish → Start
        const requiredStart = new Date(sourceTask.endDate.getTime() + lagMs);
        if (targetTask.startDate < requiredStart) {
          violation = {
            dependencyId: dependency.id,
            sourceTaskId: dependency.sourceTaskId,
            targetTaskId: dependency.targetTaskId,
            type: dependency.type,
            lag: dependency.lag,
            violation: `Target task starts before source task finishes + lag (${dependency.lag} days)`,
            severity: 'error'
          };
        }
        break;
        
      case 'SS': // Start → Start
        const requiredStartSS = new Date(sourceTask.startDate.getTime() + lagMs);
        if (targetTask.startDate < requiredStartSS) {
          violation = {
            dependencyId: dependency.id,
            sourceTaskId: dependency.sourceTaskId,
            targetTaskId: dependency.targetTaskId,
            type: dependency.type,
            lag: dependency.lag,
            violation: `Target task starts before source task starts + lag (${dependency.lag} days)`,
            severity: 'error'
          };
        }
        break;
        
      case 'FF': // Finish → Finish
        const requiredEnd = new Date(sourceTask.endDate.getTime() + lagMs);
        if (targetTask.endDate < requiredEnd) {
          violation = {
            dependencyId: dependency.id,
            sourceTaskId: dependency.sourceTaskId,
            targetTaskId: dependency.targetTaskId,
            type: dependency.type,
            lag: dependency.lag,
            violation: `Target task finishes before source task finishes + lag (${dependency.lag} days)`,
            severity: 'error'
          };
        }
        break;
        
      case 'SF': // Start → Finish
        const requiredEndSF = new Date(sourceTask.startDate.getTime() + lagMs);
        if (targetTask.endDate < requiredEndSF) {
          violation = {
            dependencyId: dependency.id,
            sourceTaskId: dependency.sourceTaskId,
            targetTaskId: dependency.targetTaskId,
            type: dependency.type,
            lag: dependency.lag,
            violation: `Target task finishes before source task starts + lag (${dependency.lag} days)`,
            severity: 'error'
          };
        }
        break;
    }
    
    return violation;
  }

  /**
   * Auto-correct a constraint violation
   */
  private async autoCorrectViolation(
    dependency: TaskDependency,
    sourceTask: TaskSchedule,
    targetTask: TaskSchedule
  ): Promise<void> {
    // This would typically update the task schedule
    // For now, we'll just log the correction
    console.log(`Auto-correcting violation for dependency ${dependency.id}`);
  }

  /**
   * Check if creating a dependency would create a circular reference
   */
  private async wouldCreateCircularDependency(
    sourceTaskId: string,
    targetTaskId: string,
    projectId: string
  ): Promise<boolean> {
    const allDependencies = await this.getAllDependencies();
    const projectDeps = allDependencies.filter(dep => dep.projectId === projectId);
    
    // Simple circular dependency check
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (taskId: string): boolean => {
      if (recursionStack.has(taskId)) return true;
      if (visited.has(taskId)) return false;
      
      visited.add(taskId);
      recursionStack.add(taskId);
      
      const successors = projectDeps
        .filter(dep => dep.sourceTaskId === taskId)
        .map(dep => dep.targetTaskId);
      
      for (const successor of successors) {
        if (hasCycle(successor)) return true;
      }
      
      recursionStack.delete(taskId);
      return false;
    };
    
    // Check if adding this dependency would create a cycle
    const tempDeps = [...projectDeps, {
      id: 'temp',
      sourceTaskId,
      targetTaskId,
      type: 'FS',
      lag: 0,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date()
    }];
    
    return hasCycle(targetTaskId);
  }

  /**
   * Get constraint type descriptions
   */
  getConstraintTypeDescription(type: 'FS' | 'SS' | 'FF' | 'SF'): string {
    const descriptions = {
      'FS': 'Finish to Start - Target task starts after source task finishes',
      'SS': 'Start to Start - Target task starts after source task starts',
      'FF': 'Finish to Finish - Target task finishes after source task finishes',
      'SF': 'Start to Finish - Target task finishes after source task starts'
    };
    return descriptions[type];
  }

  /**
   * Get demo mode restrictions
   */
  getDemoModeRestrictions(): string[] {
    return [
      `Maximum ${this.maxDemoConstraints} constraints per project`,
      'Only FS and SS constraint types available',
      `Lag limited to 0-${this.maxDemoLag} days`,
      'Visual indicators use "DEMO CONSTRAINT" badge',
      'All dependency records tagged as demo'
    ];
  }

  /**
   * Get all dependencies
   */
  private async getAllDependencies(): Promise<TaskDependency[]> {
    try {
      const dependencies = await persistentStorage.get(this.dependenciesKey);
      return dependencies || [];
    } catch (error) {
      console.error('Error getting all dependencies:', error);
      return [];
    }
  }

  /**
   * Clear all dependency data (for demo mode reset)
   */
  async clearAllDependencyData(): Promise<void> {
    try {
      await persistentStorage.remove(this.dependenciesKey);
      console.log('All dependency data cleared');
    } catch (error) {
      console.error('Error clearing dependency data:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      if (isDemoMode) {
        await this.clearAllDependencyData();
        console.log('Demo dependency data reset');
      }
    } catch (error) {
      console.error('Error resetting demo dependency data:', error);
      throw error;
    }
  }
}

export const dependencyConstraintsService = new DependencyConstraintsService(); 