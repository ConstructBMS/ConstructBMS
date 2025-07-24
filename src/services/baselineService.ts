import { supabase } from './supabase';

// Baseline interfaces
export interface Baseline {
  createdAt: Date;
  createdBy: string;
  demo?: boolean;
  id: string;
  isActive: boolean;
  name: string;
  projectId: string;
}

export interface BaselineTask {
  baselineEnd: Date;
  baselineId: string;
  baselineStart: Date;
  demo?: boolean;
  id: string;
  isMilestone: boolean;
  name: string;
  parentId?: string;
  percentComplete: number;
  taskId: string;
}

export interface BaselineVariance {
  baselineEnd: Date;
  baselineStart: Date;
  currentEnd: Date;
  currentStart: Date;
  // days
  durationVariance: number;
  durationVariancePercent: number; // days
  endVariance: number; 
  endVariancePercent: number; 
  startVariance: number;
  // days
  startVariancePercent: number;
  taskId: string;
}

export interface BaselinePreferences {
  activeBaselineId: string | null;
  comparisonMode: 'bars' | 'variance' | 'delta';
  demo: boolean;
  projectId: string;
  showBaselineBars: boolean;
  userId: string;
}

export interface BaselineComparison {
  delayedTasks: number;
  earlyTasks: number;
  onTimeTasks: number;
  totalDurationChange: number;
  totalTasks: number;
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxBaselinesPerProject: 1,
  maxTasksPerBaseline: 10,
  tooltipMessage: 'DEMO BASELINE – Limited comparison',
  baselineStateTag: 'demo'
};

class BaselineService {
  private baselines: Map<string, Baseline> = new Map();
  private baselineTasks: Map<string, BaselineTask[]> = new Map();
  private preferences: BaselinePreferences;
  private isDemoMode = false;

  constructor() {
    this.isDemoMode = this.checkDemoMode();
    this.preferences = {
      userId: 'current-user',
      projectId: 'current-project',
      showBaselineBars: true,
      comparisonMode: 'bars',
      activeBaselineId: null,
      demo: this.isDemoMode
    };
  }

  private checkDemoMode(): boolean {
    // Check user role or environment to determine demo mode
    return false; // Set to true for demo mode testing
  }

  /**
   * Get baseline by ID
   */
  getBaseline(baselineId: string): Baseline | null {
    return this.baselines.get(baselineId) || null;
  }

  /**
   * Get all baselines for project
   */
  async getBaselinesForProject(projectId: string): Promise<Baseline[]> {
    try {
      const { data, error } = await supabase
        .from('programme_baselines')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Clear existing baselines and add new ones
      this.baselines.clear();
      if (data) {
        data.forEach(baseline => {
          this.baselines.set(baseline.id, {
            ...baseline,
            createdAt: new Date(baseline.created_at),
            demo: this.isDemoMode
          });
        });
      }

      return Array.from(this.baselines.values());
    } catch (error) {
      console.error('Error loading baselines:', error);
      return [];
    }
  }

  /**
   * Get baseline tasks
   */
  async getBaselineTasks(baselineId: string): Promise<BaselineTask[]> {
    try {
      const { data, error } = await supabase
        .from('programme_baseline_tasks')
        .select('*')
        .eq('baseline_id', baselineId);

      if (error) throw error;

      const tasks = data?.map(task => ({
        ...task,
        baselineStart: new Date(task.baseline_start),
        baselineEnd: new Date(task.baseline_end),
        percentComplete: task.percent_complete || 0,
        isMilestone: task.is_milestone || false,
        parentId: task.parent_id,
        name: task.name,
        demo: this.isDemoMode
      })) || [];

      this.baselineTasks.set(baselineId, tasks);
      return tasks;
    } catch (error) {
      console.error('Error loading baseline tasks:', error);
      return [];
    }
  }

  /**
   * Create new baseline
   */
  async createBaseline(
    projectId: string,
    name: string,
    tasks: Array<{ 
      end: Date; 
      id: string; 
      isMilestone?: boolean; 
      name: string;
      parentId?: string;
      percentComplete?: number;
      start: Date;
    }>
  ): Promise<Baseline | null> {
    // Check demo mode restrictions
    if (this.isDemoMode) {
      const existingBaselines = Array.from(this.baselines.values());
      if (existingBaselines.length >= DEMO_MODE_CONFIG.maxBaselinesPerProject) {
        console.warn('Maximum baselines reached in demo mode');
        return null;
      }

      if (tasks.length > DEMO_MODE_CONFIG.maxTasksPerBaseline) {
        console.warn('Maximum tasks per baseline reached in demo mode');
        return null;
      }
    }

    try {
      const now = new Date();
      const baselineData = {
        project_id: projectId,
        name: name,
        created_by: 'current-user', // This should come from auth context
        created_at: now.toISOString(),
        is_active: false,
        demo: this.isDemoMode
      };

      // Create baseline
      const { data: baseline, error: baselineError } = await supabase
        .from('programme_baselines')
        .insert(baselineData)
        .select()
        .single();

      if (baselineError) throw baselineError;

      // Create baseline tasks
      const baselineTasksData = tasks.map(task => ({
        baseline_id: baseline.id,
        task_id: task.id,
        baseline_start: task.start.toISOString().split('T')[0], // Convert to DATE format
        baseline_end: task.end.toISOString().split('T')[0], // Convert to DATE format
        percent_complete: task.percentComplete || 0,
        is_milestone: task.isMilestone || false,
        parent_id: task.parentId || null,
        name: task.name,
        demo: this.isDemoMode
      }));

      const { error: tasksError } = await supabase
        .from('programme_baseline_tasks')
        .insert(baselineTasksData);

      if (tasksError) throw tasksError;

      // Update local cache
      const newBaseline: Baseline = {
        ...baseline,
        createdAt: now,
        demo: this.isDemoMode
      };
      this.baselines.set(baseline.id, newBaseline);

      // Cache baseline tasks
      const baselineTasks = tasks.map(task => ({
        id: `${baseline.id}-${task.id}`,
        baselineId: baseline.id,
        taskId: task.id,
        baselineStart: task.start,
        baselineEnd: task.end,
        percentComplete: task.percentComplete || 0,
        isMilestone: task.isMilestone || false,
        parentId: task.parentId,
        name: task.name,
        demo: this.isDemoMode
      }));
      this.baselineTasks.set(baseline.id, baselineTasks);

      return newBaseline;
    } catch (error) {
      console.error('Error creating baseline:', error);
      return null;
    }
  }

  /**
   * Set active baseline
   */
  async setActiveBaseline(baselineId: string): Promise<boolean> {
    try {
      // Deactivate all other baselines
      const { error: deactivateError } = await supabase
        .from('programme_baselines')
        .update({ is_active: false })
        .eq('project_id', this.preferences.projectId);

      if (deactivateError) throw deactivateError;

      // Activate selected baseline
      const { error: activateError } = await supabase
        .from('programme_baselines')
        .update({ is_active: true })
        .eq('id', baselineId);

      if (activateError) throw activateError;

      // Update local cache
      this.baselines.forEach(baseline => {
        baseline.isActive = baseline.id === baselineId;
      });

      // Update preferences
      this.preferences.activeBaselineId = baselineId;
      await this.savePreferences();

      return true;
    } catch (error) {
      console.error('Error setting active baseline:', error);
      return false;
    }
  }

  /**
   * Delete baseline
   */
  async deleteBaseline(baselineId: string): Promise<boolean> {
    try {
      // Delete baseline tasks first
      const { error: tasksError } = await supabase
        .from('programme_baseline_tasks')
        .delete()
        .eq('baseline_id', baselineId);

      if (tasksError) throw tasksError;

      // Delete baseline
      const { error: baselineError } = await supabase
        .from('programme_baselines')
        .delete()
        .eq('id', baselineId);

      if (baselineError) throw baselineError;

      // Update local cache
      this.baselines.delete(baselineId);
      this.baselineTasks.delete(baselineId);

      // If this was the active baseline, clear it
      if (this.preferences.activeBaselineId === baselineId) {
        this.preferences.activeBaselineId = null;
        await this.savePreferences();
      }

      return true;
    } catch (error) {
      console.error('Error deleting baseline:', error);
      return false;
    }
  }

  /**
   * Get active baseline
   */
  getActiveBaseline(): Baseline | null {
    return Array.from(this.baselines.values()).find(b => b.isActive) || null;
  }

  /**
   * Get active baseline for project
   */
  async getActiveBaselineForProject(projectId: string): Promise<Baseline | null> {
    try {
      const { data, error } = await supabase
        .from('programme_baselines')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .single();

      if (error || !data) return null;

      const baseline: Baseline = {
        ...data,
        createdAt: new Date(data.created_at),
        demo: this.isDemoMode
      };

      return baseline;
    } catch (error) {
      console.error('Error getting active baseline:', error);
      return null;
    }
  }

  /**
   * Get project baselines
   */
  async getProjectBaselines(projectId: string): Promise<Baseline[]> {
    return this.getBaselinesForProject(projectId);
  }

  /**
   * Set baseline active
   */
  async setBaselineActive(baselineId: string): Promise<{ error?: string, success: boolean; }> {
    try {
      const success = await this.setActiveBaseline(baselineId);
      return { success };
    } catch (error) {
      console.error('Error setting baseline active:', error);
      return { success: false, error: 'Failed to set baseline active' };
    }
  }

  /**
   * Create baseline with enhanced interface
   */
  async createBaselineWithParams(params: {
    name?: string;
    projectId: string;
    tasks: Array<{
      endDate: Date;
      id: string;
      isMilestone?: boolean;
      name: string;
      parentId?: string;
      percentComplete?: number;
      startDate: Date;
    }>;
  }): Promise<{ baseline?: Baseline; error?: string, success: boolean; }> {
    try {
      const baseline = await this.createBaseline(
        params.projectId,
        params.name || `Baseline ${new Date().toLocaleDateString()}`,
        params.tasks.map(task => ({
          id: task.id,
          start: task.startDate,
          end: task.endDate,
          percentComplete: task.percentComplete || 0,
          isMilestone: task.isMilestone || false,
          parentId: task.parentId,
          name: task.name
        }))
      );

      if (baseline) {
        return { success: true, baseline };
      } else {
        return { success: false, error: 'Failed to create baseline' };
      }
    } catch (error) {
      console.error('Error creating baseline:', error);
      return { success: false, error: 'Failed to create baseline' };
    }
  }

  /**
   * Delete baseline with enhanced interface
   */
  async deleteBaselineWithResponse(baselineId: string): Promise<{ error?: string, success: boolean; }> {
    try {
      const success = await this.deleteBaseline(baselineId);
      return { success };
    } catch (error) {
      console.error('Error deleting baseline:', error);
      return { success: false, error: 'Failed to delete baseline' };
    }
  }

  /**
   * Calculate baseline deltas
   */
  async calculateBaselineDeltas(projectId: string, currentTasks: Array<{
    endDate: Date;
    id: string;
    startDate: Date;
  }>): Promise<BaselineComparison | null> {
    const activeBaseline = await this.getActiveBaseline(projectId);
    if (!activeBaseline) return null;

    const baselineTasks = await this.getBaselineTasks(activeBaseline.id);
    const variances = await this.getVarianceForActiveBaseline(
      currentTasks.map(task => ({
        id: task.id,
        start: task.startDate,
        end: task.endDate
      }))
    );

    const onTimeTasks = variances.filter(v => Math.abs(v.startVariance) <= 1 && Math.abs(v.endVariance) <= 1).length;
    const delayedTasks = variances.filter(v => v.startVariance > 1 || v.endVariance > 1).length;
    const earlyTasks = variances.filter(v => v.startVariance < -1 || v.endVariance < -1).length;
    const totalDurationChange = variances.reduce((sum, v) => sum + v.durationVariance, 0);

    return {
      onTimeTasks,
      delayedTasks,
      earlyTasks,
      totalDurationChange,
      totalTasks: variances.length
    };
  }

  /**
   * Get demo mode restrictions
   */
  getDemoModeRestrictions(): string[] {
    return [
      `Maximum ${DEMO_MODE_CONFIG.maxBaselinesPerProject} baseline per project`,
      `Maximum ${DEMO_MODE_CONFIG.maxTasksPerBaseline} tasks per baseline`,
      'All data tagged as demo',
      'Limited comparison features'
    ];
  }

  /**
   * Calculate variance between baseline and current dates
   */
  calculateVariance(
    baselineTask: BaselineTask,
    currentStart: Date,
    currentEnd: Date
  ): BaselineVariance {
    const baselineStart = baselineTask.baselineStart;
    const baselineEnd = baselineTask.baselineEnd;

    // Calculate variances in days
    const startVariance = Math.round((currentStart.getTime() - baselineStart.getTime()) / (1000 * 60 * 60 * 24));
    const endVariance = Math.round((currentEnd.getTime() - baselineEnd.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate duration variances
    const baselineDuration = Math.round((baselineEnd.getTime() - baselineStart.getTime()) / (1000 * 60 * 60 * 24));
    const currentDuration = Math.round((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
    const durationVariance = currentDuration - baselineDuration;

    // Calculate percentage variances
    const startVariancePercent = baselineDuration > 0 ? (startVariance / baselineDuration) * 100 : 0;
    const endVariancePercent = baselineDuration > 0 ? (endVariance / baselineDuration) * 100 : 0;
    const durationVariancePercent = baselineDuration > 0 ? (durationVariance / baselineDuration) * 100 : 0;

    return {
      taskId: baselineTask.taskId,
      baselineStart,
      baselineEnd,
      currentStart,
      currentEnd,
      startVariance,
      endVariance,
      durationVariance,
      startVariancePercent,
      endVariancePercent,
      durationVariancePercent
    };
  }

  /**
   * Get variance for all tasks in active baseline
   */
  async getVarianceForActiveBaseline(currentTasks: Array<{ end: Date, id: string; start: Date; }>): Promise<BaselineVariance[]> {
    const activeBaseline = this.getActiveBaseline();
    if (!activeBaseline) return [];

    const baselineTasks = await this.getBaselineTasks(activeBaseline.id);
    const variances: BaselineVariance[] = [];

    baselineTasks.forEach(baselineTask => {
      const currentTask = currentTasks.find(t => t.id === baselineTask.taskId);
      if (currentTask) {
        const variance = this.calculateVariance(baselineTask, currentTask.start, currentTask.end);
        variances.push(variance);
      }
    });

    return variances;
  }

  /**
   * Get variance for specific task
   */
  async getVarianceForTask(taskId: string, currentStart: Date, currentEnd: Date): Promise<BaselineVariance | null> {
    const activeBaseline = this.getActiveBaseline();
    if (!activeBaseline) return null;

    const baselineTasks = await this.getBaselineTasks(activeBaseline.id);
    const baselineTask = baselineTasks.find(t => t.taskId === taskId);
    
    if (!baselineTask) return null;

    return this.calculateVariance(baselineTask, currentStart, currentEnd);
  }

  /**
   * Load baseline preferences
   */
  async loadPreferences(userId: string, projectId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('baseline_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single();

      if (error || !data) {
        return;
      }

      this.preferences = {
        userId: data.user_id || 'current-user',
        projectId: data.project_id || 'current-project',
        showBaselineBars: data.show_baseline_bars ?? true,
        comparisonMode: data.comparison_mode || 'bars',
        activeBaselineId: data.active_baseline_id,
        demo: this.isDemoMode
      };
    } catch (error) {
      console.error('Error loading baseline preferences:', error);
    }
  }

  /**
   * Save baseline preferences
   */
  async savePreferences(): Promise<void> {
    try {
      const { error } = await supabase
        .from('baseline_preferences')
        .upsert({
          user_id: this.preferences.userId,
          project_id: this.preferences.projectId,
          show_baseline_bars: this.preferences.showBaselineBars,
          comparison_mode: this.preferences.comparisonMode,
          active_baseline_id: this.preferences.activeBaselineId,
          demo: this.isDemoMode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving baseline preferences:', error);
    }
  }

  /**
   * Update preferences
   */
  async updatePreferences(updates: Partial<BaselinePreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...updates };
    await this.savePreferences();
  }

  /**
   * Get current preferences
   */
  getPreferences(): BaselinePreferences {
    return { ...this.preferences };
  }

  /**
   * Get demo mode configuration
   */
  getDemoModeConfig() {
    return DEMO_MODE_CONFIG;
  }

  /**
   * Check if current mode is demo
   */
  isInDemoMode(): boolean {
    return this.isDemoMode;
  }

  /**
   * Get baseline change callback
   */
  onBaselineChange?: (baselines: Baseline[]) => void;

  /**
   * Cleanup
   */
  destroy(): void {
    this.baselines.clear();
    this.baselineTasks.clear();
  }
}

// Export singleton instance
export const baselineService = new BaselineService(); 