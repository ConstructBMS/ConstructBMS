import { supabase } from './supabase';
import { demoModeService } from './demoModeService';

export interface CriticalPathTask {
  earlyFinish: number;
  earlyStart: number;
  id: string;
  isCritical: boolean;
  lateFinish: number;
  lateStart: number;
  totalFloat: number;
}

export interface CriticalPathResult {
  criticalDependencies: string[];
  criticalTasks: string[];
  projectDuration: number;
  tasks: Record<string, CriticalPathTask>;
}

export interface TaskSchedule {
  dependencies: string[];
  duration: number;
  end: Date;
  id: string;
  name: string;
  start: Date;
}

export interface TaskDependency {
  id: string;
  lag: number;
  sourceTaskId: string;
  targetTaskId: string;
  type:
    | 'finish-to-start'
    | 'start-to-start'
    | 'finish-to-finish'
    | 'start-to-finish';
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxCriticalTasks: 5,
  watermark: 'DEMO LIMIT - Not full critical path shown',
  demo: true,
};

class CriticalPathService {
  private readonly cacheKey = 'programme_critical_path_cache';
  private readonly maxDemoCriticalPaths = 1;

  /**
   * Calculate critical path for a project
   */
  async calculateCriticalPath(
    projectId: string,
    tasks: TaskSchedule[],
    dependencies: TaskDependency[]
  ): Promise<CriticalPathResult> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      // Build dependency graph
      const graph = this.buildDependencyGraph(tasks, dependencies);

      // Calculate early start/finish times (forward pass)
      const earlyTimes = this.calculateEarlyTimes(graph, tasks);

      // Calculate late start/finish times (backward pass)
      const lateTimes = this.calculateLateTimes(graph, tasks, earlyTimes);

      // Calculate total float and identify critical tasks
      const criticalPathTasks: Record<string, CriticalPathTask> = {};
      const criticalTasks: string[] = [];
      const criticalDependencies: string[] = [];

      tasks.forEach(task => {
        const earlyStart = earlyTimes[task.id]?.earlyStart || 0;
        const earlyFinish = earlyTimes[task.id]?.earlyFinish || 0;
        const lateStart = lateTimes[task.id]?.lateStart || 0;
        const lateFinish = lateTimes[task.id]?.lateFinish || 0;

        const totalFloat = lateStart - earlyStart;
        const isCritical = totalFloat === 0;

        criticalPathTasks[task.id] = {
          id: task.id,
          earlyStart,
          earlyFinish,
          lateStart,
          lateFinish,
          totalFloat,
          isCritical,
        };

        if (isCritical) {
          criticalTasks.push(task.id);
        }
      });

      // Identify critical dependencies
      dependencies.forEach(dependency => {
        const sourceTask = criticalPathTasks[dependency.sourceTaskId];
        const targetTask = criticalPathTasks[dependency.targetTaskId];

        if (sourceTask?.isCritical && targetTask?.isCritical) {
          // Check if this dependency is on the critical path
          const isCriticalDependency = this.isCriticalDependency(
            dependency,
            sourceTask,
            targetTask,
            earlyTimes
          );

          if (isCriticalDependency) {
            criticalDependencies.push(dependency.id);
          }
        }
      });

      // Demo mode restrictions
      if (isDemoMode) {
        // Limit to max 5 critical tasks in demo mode
        const limitedCriticalTasks = criticalTasks.slice(
          0,
          DEMO_MODE_CONFIG.maxCriticalTasks
        );
        const limitedCriticalDependencies = criticalDependencies.slice(
          0,
          DEMO_MODE_CONFIG.maxCriticalTasks - 1
        );

        // Update isCritical flags for demo mode
        Object.keys(criticalPathTasks).forEach(taskId => {
          criticalPathTasks[taskId].isCritical =
            limitedCriticalTasks.includes(taskId);
        });

        return {
          criticalTasks: limitedCriticalTasks,
          criticalDependencies: limitedCriticalDependencies,
          projectDuration: Math.max(
            ...Object.values(criticalPathTasks).map(t => t.earlyFinish)
          ),
          tasks: criticalPathTasks,
        };
      }

      const result: CriticalPathResult = {
        criticalTasks,
        criticalDependencies,
        projectDuration: Math.max(
          ...Object.values(criticalPathTasks).map(t => t.earlyFinish)
        ),
        tasks: criticalPathTasks,
      };

      // Cache the result
      await this.cacheCriticalPath(projectId, result);

      return result;
    } catch (error) {
      console.error('Error calculating critical path:', error);
      throw error;
    }
  }

  /**
   * Update task critical path data in database
   */
  async updateTaskCriticalPathData(
    projectId: string,
    taskId: string,
    isCritical: boolean,
    totalFloat: number
  ): Promise<void> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      const { error } = await supabase
        .from('asta_tasks')
        .update({
          is_critical: isCritical,
          total_float: totalFloat,
          demo: isDemoMode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('project_id', projectId);

      if (error) {
        throw error;
      }

      console.log(`Updated critical path data for task ${taskId}:`, {
        isCritical,
        totalFloat,
      });
    } catch (error) {
      console.error('Error updating task critical path data:', error);
      throw error;
    }
  }

  /**
   * Get critical path settings for project
   */
  async getCriticalPathSettings(projectId: string): Promise<{
    criticalOnly: boolean;
    showCriticalPath: boolean;
  }> {
    try {
      const { data, error } = await supabase
        .from('programme_settings')
        .select('critical_path_settings')
        .eq('project_id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return (
        data?.critical_path_settings || {
          showCriticalPath: false,
          criticalOnly: false,
        }
      );
    } catch (error) {
      console.error('Error getting critical path settings:', error);
      return {
        showCriticalPath: false,
        criticalOnly: false,
      };
    }
  }

  /**
   * Save critical path settings for project
   */
  async saveCriticalPathSettings(
    projectId: string,
    settings: {
      criticalOnly: boolean;
      showCriticalPath: boolean;
    }
  ): Promise<void> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();

      // Demo mode restrictions
      if (isDemoMode) {
        settings.criticalOnly = false; // Disable critical only view in demo
      }

      const { error } = await supabase.from('programme_settings').upsert({
        project_id: projectId,
        critical_path_settings: settings,
        demo: isDemoMode,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      console.log('Critical path settings saved for project:', projectId);
    } catch (error) {
      console.error('Error saving critical path settings:', error);
      throw error;
    }
  }

  /**
   * Get demo mode configuration
   */
  getDemoModeConfig() {
    return DEMO_MODE_CONFIG;
  }

  /**
   * Build dependency graph from tasks and dependencies
   */
  private buildDependencyGraph(
    tasks: TaskSchedule[],
    dependencies: TaskDependency[]
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    // Initialize graph with all tasks
    tasks.forEach(task => {
      graph.set(task.id, []);
    });

    // Add dependencies
    dependencies.forEach(dependency => {
      const successors = graph.get(dependency.sourceTaskId) || [];
      successors.push(dependency.targetTaskId);
      graph.set(dependency.sourceTaskId, successors);
    });

    return graph;
  }

  /**
   * Calculate early start and finish times (forward pass)
   */
  private calculateEarlyTimes(
    graph: Map<string, string[]>,
    tasks: TaskSchedule[]
  ): Record<string, { earlyFinish: number; earlyStart: number }> {
    const earlyTimes: Record<
      string,
      { earlyFinish: number; earlyStart: number }
    > = {};
    const visited = new Set<string>();

    // Find tasks with no predecessors (start tasks)
    const startTasks = tasks.filter(task => {
      const predecessors = Array.from(graph.entries())
        .filter(([_, successors]) => successors.includes(task.id))
        .map(([id]) => id);
      return predecessors.length === 0;
    });

    // Process start tasks
    startTasks.forEach(task => {
      earlyTimes[task.id] = {
        earlyStart: 0,
        earlyFinish: task.duration,
      };
      visited.add(task.id);
    });

    // Process remaining tasks in topological order
    const queue = [...startTasks];

    while (queue.length > 0) {
      const currentTask = queue.shift()!;

      const successors = graph.get(currentTask.id) || [];

      successors.forEach(successorId => {
        const successor = tasks.find(t => t.id === successorId);
        if (!successor) return;

        // Check if all predecessors of successor have been processed
        const predecessors = Array.from(graph.entries())
          .filter(([_, successors]) => successors.includes(successorId))
          .map(([id]) => id);

        const allPredecessorsProcessed = predecessors.every(predId =>
          visited.has(predId)
        );

        if (allPredecessorsProcessed && !visited.has(successorId)) {
          // Calculate early start as max of all predecessor early finish times
          const predecessorEarlyFinishes = predecessors.map(
            predId => earlyTimes[predId]?.earlyFinish || 0
          );
          const earlyStart = Math.max(...predecessorEarlyFinishes);

          earlyTimes[successorId] = {
            earlyStart,
            earlyFinish: earlyStart + successor.duration,
          };

          visited.add(successorId);
          queue.push(successor);
        }
      });
    }

    return earlyTimes;
  }

  /**
   * Calculate late start and finish times (backward pass)
   */
  private calculateLateTimes(
    graph: Map<string, string[]>,
    tasks: TaskSchedule[],
    earlyTimes: Record<string, { earlyFinish: number; earlyStart: number }>
  ): Record<string, { lateFinish: number; lateStart: number }> {
    const lateTimes: Record<string, { lateFinish: number; lateStart: number }> =
      {};
    const visited = new Set<string>();

    // Find project duration
    const projectDuration = Math.max(
      ...Object.values(earlyTimes).map(t => t.earlyFinish)
    );

    // Find tasks with no successors (end tasks)
    const endTasks = tasks.filter(task => {
      const successors = graph.get(task.id) || [];
      return successors.length === 0;
    });

    // Process end tasks
    endTasks.forEach(task => {
      lateTimes[task.id] = {
        lateFinish: projectDuration,
        lateStart: projectDuration - task.duration,
      };
      visited.add(task.id);
    });

    // Process remaining tasks in reverse topological order
    const queue = [...endTasks];

    while (queue.length > 0) {
      const currentTask = queue.shift()!;

      // Find predecessors of current task
      const predecessors = Array.from(graph.entries())
        .filter(([_, successors]) => successors.includes(currentTask.id))
        .map(([id]) => id);

      predecessors.forEach(predecessorId => {
        const predecessor = tasks.find(t => t.id === predecessorId);
        if (!predecessor) return;

        // Check if all successors of predecessor have been processed
        const successors = graph.get(predecessorId) || [];
        const allSuccessorsProcessed = successors.every(succId =>
          visited.has(succId)
        );

        if (allSuccessorsProcessed && !visited.has(predecessorId)) {
          // Calculate late finish as min of all successor late start times
          const successorLateStarts = successors.map(
            succId => lateTimes[succId]?.lateStart || projectDuration
          );
          const lateFinish = Math.min(...successorLateStarts);

          lateTimes[predecessorId] = {
            lateFinish,
            lateStart: lateFinish - predecessor.duration,
          };

          visited.add(predecessorId);
          queue.push(predecessor);
        }
      });
    }

    return lateTimes;
  }

  /**
   * Check if a dependency is on the critical path
   */
  private isCriticalDependency(
    dependency: TaskDependency,
    sourceTask: CriticalPathTask,
    targetTask: CriticalPathTask,
    earlyTimes: Record<string, { earlyFinish: number; earlyStart: number }>
  ): boolean {
    // A dependency is critical if:
    // 1. Both tasks are critical
    // 2. The target task's early start equals the source task's early finish + lag
    const sourceEarlyFinish =
      earlyTimes[dependency.sourceTaskId]?.earlyFinish || 0;
    const targetEarlyStart =
      earlyTimes[dependency.targetTaskId]?.earlyStart || 0;
    const lagDays = dependency.lag || 0;

    return Math.abs(targetEarlyStart - (sourceEarlyFinish + lagDays)) < 0.01; // Small tolerance for floating point
  }

  /**
   * Cache critical path result
   */
  private async cacheCriticalPath(
    projectId: string,
    result: CriticalPathResult
  ): Promise<void> {
    try {
      const { error } = await supabase.from('programme_cache').upsert({
        project_id: projectId,
        cache_key: this.cacheKey,
        cache_data: result,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.warn('Failed to cache critical path result:', error);
      }
    } catch (error) {
      console.warn('Error caching critical path result:', error);
    }
  }

  /**
   * Get cached critical path result
   */
  async getCachedCriticalPath(
    projectId: string
  ): Promise<CriticalPathResult | null> {
    try {
      const { data, error } = await supabase
        .from('programme_cache')
        .select('cache_data, expires_at')
        .eq('project_id', projectId)
        .eq('cache_key', this.cacheKey)
        .single();

      if (error || !data) {
        return null;
      }

      // Check if cache is expired
      if (new Date(data.expires_at) < new Date()) {
        return null;
      }

      return data.cache_data as CriticalPathResult;
    } catch (error) {
      console.warn('Error getting cached critical path:', error);
      return null;
    }
  }

  /**
   * Clear critical path cache for project
   */
  async clearCriticalPathCache(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('programme_cache')
        .delete()
        .eq('project_id', projectId)
        .eq('cache_key', this.cacheKey);

      if (error) {
        console.warn('Failed to clear critical path cache:', error);
      }
    } catch (error) {
      console.warn('Error clearing critical path cache:', error);
    }
  }
}

export const criticalPathService = new CriticalPathService();
