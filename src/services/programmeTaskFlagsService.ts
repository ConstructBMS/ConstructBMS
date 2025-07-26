import { supabase } from './supabase';
import { demoModeService } from './demoModeService';

// Programme Task Flags interfaces
export interface ProgrammeTaskFlag {
  createdAt: Date;
  createdBy: string;
  demo: boolean;
  flagColor: 'red' | 'yellow' | 'green' | 'blue';
  id: string;
  note: string;
  taskId: string;
}

export interface TaskFlagFilter {
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  flagColor?: 'red' | 'yellow' | 'green' | 'blue';
  taskId?: string;
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxFlagsPerProject: 1, // Only 1 flag per 5 tasks
  maxNoteLength: 100, // Note length capped to 100 characters
  tooltipMessage: 'DEMO FLAG – Limited note capacity',
  flagStateTag: 'demo',
};

class ProgrammeTaskFlagsService {
  private flags: Map<string, ProgrammeTaskFlag> = new Map();
  private isDemoMode = false;

  constructor() {
    this.checkDemoMode();
  }

  private checkDemoMode() {
    this.isDemoMode = demoModeService.getDemoMode();
  }

  /**
   * Get all flags for a project
   */
  async getFlagsForProject(projectId: string): Promise<ProgrammeTaskFlag[]> {
    try {
      const { data, error } = await supabase
        .from('programme_task_flags')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Clear existing flags and add new ones
      this.flags.clear();
      if (data) {
        data.forEach(flag => {
          this.flags.set(flag.task_id, {
            ...flag,
            taskId: flag.task_id,
            flagColor: flag.flag_color,
            createdBy: flag.created_by,
            createdAt: new Date(flag.created_at),
            demo: flag.demo || false,
          });
        });
      }

      return Array.from(this.flags.values());
    } catch (error) {
      console.error('Error loading programme task flags:', error);
      return [];
    }
  }

  /**
   * Get flag for a specific task
   */
  async getFlagForTask(taskId: string): Promise<ProgrammeTaskFlag | null> {
    try {
      const { data, error } = await supabase
        .from('programme_task_flags')
        .select('*')
        .eq('task_id', taskId)
        .single();

      if (error || !data) return null;

      const flag: ProgrammeTaskFlag = {
        ...data,
        taskId: data.task_id,
        flagColor: data.flag_color,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        demo: data.demo || false,
      };

      // Update local cache
      this.flags.set(taskId, flag);

      return flag;
    } catch (error) {
      console.error('Error loading flag for task:', error);
      return null;
    }
  }

  /**
   * Add or update a flag for a task
   */
  async addOrUpdateFlag(
    taskId: string,
    projectId: string,
    flagColor: 'red' | 'yellow' | 'green' | 'blue',
    note: string
  ): Promise<{ error?: string; flag?: ProgrammeTaskFlag; success: boolean }> {
    try {
      // Check demo mode restrictions
      if (this.isDemoMode) {
        const existingFlags = Array.from(this.flags.values());
        if (existingFlags.length >= DEMO_MODE_CONFIG.maxFlagsPerProject) {
          return {
            success: false,
            error:
              'Maximum flags reached in demo mode. Upgrade for unlimited flags.',
          };
        }

        if (note.length > DEMO_MODE_CONFIG.maxNoteLength) {
          return {
            success: false,
            error: `Note too long. Maximum ${DEMO_MODE_CONFIG.maxNoteLength} characters in demo mode.`,
          };
        }
      }

      const now = new Date();
      const flagData = {
        task_id: taskId,
        project_id: projectId,
        flag_color: flagColor,
        note: note.trim(),
        created_by: 'current-user', // This should come from auth context
        created_at: now.toISOString(),
        demo: this.isDemoMode,
      };

      const { data, error } = await supabase
        .from('programme_task_flags')
        .upsert(flagData, {
          onConflict: 'task_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) throw error;

      const flag: ProgrammeTaskFlag = {
        ...data,
        taskId: data.task_id,
        flagColor: data.flag_color,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        demo: data.demo || false,
      };

      // Update local cache
      this.flags.set(taskId, flag);

      return { success: true, flag };
    } catch (error) {
      console.error('Error adding/updating flag:', error);
      return { success: false, error: 'Failed to save flag' };
    }
  }

  /**
   * Remove a flag from a task
   */
  async removeFlag(
    taskId: string
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const { error } = await supabase
        .from('programme_task_flags')
        .delete()
        .eq('task_id', taskId);

      if (error) throw error;

      // Remove from local cache
      this.flags.delete(taskId);

      return { success: true };
    } catch (error) {
      console.error('Error removing flag:', error);
      return { success: false, error: 'Failed to remove flag' };
    }
  }

  /**
   * Get flag count for a project
   */
  async getFlagCount(projectId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('programme_task_flags')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting flag count:', error);
      return 0;
    }
  }

  /**
   * Check if a task has a flag
   */
  hasFlag(taskId: string): boolean {
    return this.flags.has(taskId);
  }

  /**
   * Get flag for a task from cache
   */
  getFlagByTaskId(taskId: string): ProgrammeTaskFlag | null {
    return this.flags.get(taskId) || null;
  }

  /**
   * Get demo mode configuration
   */
  getDemoModeConfig() {
    return DEMO_MODE_CONFIG;
  }

  /**
   * Check if in demo mode
   */
  isInDemoMode(): boolean {
    return this.isDemoMode;
  }

  /**
   * Get flag color display name
   */
  getFlagColorDisplayName(color: 'red' | 'yellow' | 'green' | 'blue'): string {
    const colorNames = {
      red: 'Red',
      yellow: 'Yellow',
      green: 'Green',
      blue: 'Blue',
    };
    return colorNames[color];
  }

  /**
   * Get flag color emoji
   */
  getFlagColorEmoji(color: 'red' | 'yellow' | 'green' | 'blue'): string {
    const colorEmojis = {
      red: '🟥',
      yellow: '🟨',
      green: '🟩',
      blue: '🔵',
    };
    return colorEmojis[color];
  }

  /**
   * Format flag tooltip text
   */
  formatFlagTooltip(flag: ProgrammeTaskFlag, isDemoMode: boolean): string {
    const emoji = this.getFlagColorEmoji(flag.flagColor);
    const author = isDemoMode ? 'Demo User' : flag.createdBy;
    const note =
      isDemoMode && flag.note.length > 50
        ? flag.note.substring(0, 50) + '...'
        : flag.note;

    return `${emoji} Note by ${author} – "${note}"`;
  }

  /**
   * Get demo mode restrictions for display
   */
  getDemoModeRestrictions(): string[] {
    return [
      `Only ${DEMO_MODE_CONFIG.maxFlagsPerProject} flag per 5 tasks`,
      `Note length capped to ${DEMO_MODE_CONFIG.maxNoteLength} characters`,
      'Markdown not supported',
      'Tooltip shows limited information',
    ];
  }

  /**
   * Clear local cache
   */
  clearCache(): void {
    this.flags.clear();
  }

  /**
   * Destroy service
   */
  destroy(): void {
    this.clearCache();
  }
}

// Export singleton instance
export const programmeTaskFlagsService = new ProgrammeTaskFlagsService();
