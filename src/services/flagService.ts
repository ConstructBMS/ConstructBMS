import { supabase } from './supabase';

// Flag interfaces
export interface TaskFlag {
  id: string;
  taskId: string;
  type: 'risk' | 'priority' | 'issue' | 'info' | 'custom';
  color: string; // Tailwind class (e.g., 'red-600')
  icon: string; // Heroicon name or custom icon
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  demo?: boolean;
}

export interface FlagType {
  value: string;
  label: string;
  defaultColor: string;
  defaultIcon: string;
  description: string;
}

export interface FlagPreferences {
  userId: string;
  projectId: string;
  showOnlyFlagged: boolean;
  selectedFlagTypes: string[];
  demo: boolean;
}

// Flag type definitions
export const FLAG_TYPES: FlagType[] = [
  {
    value: 'risk',
    label: 'Risk',
    defaultColor: 'red-600',
    defaultIcon: 'ExclamationTriangleIcon',
    description: 'High-risk tasks requiring attention'
  },
  {
    value: 'priority',
    label: 'Priority',
    defaultColor: 'yellow-600',
    defaultIcon: 'ExclamationCircleIcon',
    description: 'High-priority tasks'
  },
  {
    value: 'issue',
    label: 'Issue',
    defaultColor: 'orange-600',
    defaultIcon: 'XCircleIcon',
    description: 'Tasks with issues or blockers'
  },
  {
    value: 'info',
    label: 'Info',
    defaultColor: 'blue-600',
    defaultIcon: 'InformationCircleIcon',
    description: 'Informational notes'
  },
  {
    value: 'custom',
    label: 'Custom',
    defaultColor: 'purple-600',
    defaultIcon: 'FlagIcon',
    description: 'Custom flag type'
  }
];

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxFlagsPerProject: 2,
  allowedTypes: ['info', 'priority'],
  maxNoteLength: 60,
  tooltipMessage: 'DEMO FLAG',
  flagStateTag: 'demo'
};

class FlagService {
  private flags: Map<string, TaskFlag> = new Map();
  private preferences: FlagPreferences;
  private isDemoMode = false;

  constructor() {
    this.isDemoMode = this.checkDemoMode();
    this.preferences = {
      userId: 'current-user',
      projectId: 'current-project',
      showOnlyFlagged: false,
      selectedFlagTypes: [],
      demo: this.isDemoMode
    };
  }

  private checkDemoMode(): boolean {
    // Check user role or environment to determine demo mode
    return false; // Set to true for demo mode testing
  }

  /**
   * Get all flag types
   */
  getFlagTypes(): FlagType[] {
    if (this.isDemoMode) {
      return FLAG_TYPES.filter(type => 
        DEMO_MODE_CONFIG.allowedTypes.includes(type.value)
      );
    }
    return FLAG_TYPES;
  }

  /**
   * Get flag by task ID
   */
  getFlagByTaskId(taskId: string): TaskFlag | null {
    return this.flags.get(taskId) || null;
  }

  /**
   * Get all flags for a project
   */
  async getFlagsForProject(projectId: string): Promise<TaskFlag[]> {
    try {
      const { data, error } = await supabase
        .from('task_flags')
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
            createdAt: new Date(flag.created_at),
            updatedAt: new Date(flag.updated_at)
          });
        });
      }

      return Array.from(this.flags.values());
    } catch (error) {
      console.error('Error loading flags:', error);
      return [];
    }
  }

  /**
   * Add or update a flag
   */
  async addFlag(flag: Omit<TaskFlag, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<boolean> {
    // Check demo mode restrictions
    if (this.isDemoMode) {
      const existingFlags = Array.from(this.flags.values());
      if (existingFlags.length >= DEMO_MODE_CONFIG.maxFlagsPerProject) {
        console.warn('Maximum flags reached in demo mode');
        return false;
      }
      if (!DEMO_MODE_CONFIG.allowedTypes.includes(flag.type)) {
        console.warn('Flag type not allowed in demo mode');
        return false;
      }
      if (flag.note && flag.note.length > DEMO_MODE_CONFIG.maxNoteLength) {
        console.warn('Note too long for demo mode');
        return false;
      }
    }

    try {
      const now = new Date();
      const newFlag: TaskFlag = {
        ...flag,
        id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        createdBy: 'current-user', // This should come from auth context
        updatedBy: 'current-user', // This should come from auth context
        demo: this.isDemoMode
      };

      const { error } = await supabase
        .from('task_flags')
        .upsert({
          id: newFlag.id,
          task_id: newFlag.taskId,
          project_id: 'current-project', // This should come from project context
          flag_type: newFlag.type,
          color: newFlag.color,
          icon: newFlag.icon,
          note: newFlag.note,
          created_at: newFlag.createdAt.toISOString(),
          updated_at: newFlag.updatedAt.toISOString(),
          created_by: newFlag.createdBy,
          updated_by: newFlag.updatedBy,
          demo: newFlag.demo
        });

      if (error) throw error;

      // Update local cache
      this.flags.set(newFlag.taskId, newFlag);

      return true;
    } catch (error) {
      console.error('Error adding flag:', error);
      return false;
    }
  }

  /**
   * Update an existing flag
   */
  async updateFlag(taskId: string, updates: Partial<Pick<TaskFlag, 'type' | 'color' | 'icon' | 'note'>>): Promise<boolean> {
    const existingFlag = this.flags.get(taskId);
    if (!existingFlag) return false;

    // Check demo mode restrictions
    if (this.isDemoMode) {
      if (updates.type && !DEMO_MODE_CONFIG.allowedTypes.includes(updates.type)) {
        console.warn('Flag type not allowed in demo mode');
        return false;
      }
      if (updates.note && updates.note.length > DEMO_MODE_CONFIG.maxNoteLength) {
        console.warn('Note too long for demo mode');
        return false;
      }
    }

    try {
      const updatedFlag: TaskFlag = {
        ...existingFlag,
        ...updates,
        updatedAt: new Date(),
        updatedBy: 'current-user' // This should come from auth context
      };

      const { error } = await supabase
        .from('task_flags')
        .update({
          flag_type: updatedFlag.type,
          color: updatedFlag.color,
          icon: updatedFlag.icon,
          note: updatedFlag.note,
          updated_at: updatedFlag.updatedAt.toISOString(),
          updated_by: updatedFlag.updatedBy
        })
        .eq('task_id', taskId);

      if (error) throw error;

      // Update local cache
      this.flags.set(taskId, updatedFlag);

      return true;
    } catch (error) {
      console.error('Error updating flag:', error);
      return false;
    }
  }

  /**
   * Remove a flag
   */
  async removeFlag(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_flags')
        .delete()
        .eq('task_id', taskId);

      if (error) throw error;

      // Remove from local cache
      this.flags.delete(taskId);

      return true;
    } catch (error) {
      console.error('Error removing flag:', error);
      return false;
    }
  }

  /**
   * Get flag count for project
   */
  getFlagCount(projectId?: string): number {
    if (projectId) {
      return Array.from(this.flags.values()).filter(flag => 
        flag.demo === this.isDemoMode
      ).length;
    }
    return this.flags.size;
  }

  /**
   * Check if task has flag
   */
  hasFlag(taskId: string): boolean {
    return this.flags.has(taskId);
  }

  /**
   * Get flag type by value
   */
  getFlagTypeByValue(value: string): FlagType | undefined {
    return FLAG_TYPES.find(type => type.value === value);
  }

  /**
   * Get default flag settings
   */
  getDefaultFlagSettings(type: string): { color: string; icon: string } {
    const flagType = this.getFlagTypeByValue(type);
    if (flagType) {
      return {
        color: flagType.defaultColor,
        icon: flagType.defaultIcon
      };
    }
    return {
      color: 'gray-600',
      icon: 'FlagIcon'
    };
  }

  /**
   * Load flag preferences
   */
  async loadPreferences(userId: string, projectId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('flag_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single();

      if (error || !data) {
        return;
      }

      this.preferences = {
        userId: data.user_id,
        projectId: data.project_id,
        showOnlyFlagged: data.show_only_flagged || false,
        selectedFlagTypes: data.selected_flag_types || [],
        demo: this.isDemoMode
      };
    } catch (error) {
      console.error('Error loading flag preferences:', error);
    }
  }

  /**
   * Save flag preferences
   */
  async savePreferences(): Promise<void> {
    try {
      const { error } = await supabase
        .from('flag_preferences')
        .upsert({
          user_id: this.preferences.userId,
          project_id: this.preferences.projectId,
          show_only_flagged: this.preferences.showOnlyFlagged,
          selected_flag_types: this.preferences.selectedFlagTypes,
          demo: this.isDemoMode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving flag preferences:', error);
    }
  }

  /**
   * Update preferences
   */
  async updatePreferences(updates: Partial<FlagPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...updates };
    await this.savePreferences();
  }

  /**
   * Get current preferences
   */
  getPreferences(): FlagPreferences {
    return { ...this.preferences };
  }

  /**
   * Filter tasks by flags
   */
  filterTasksByFlags(tasks: any[]): any[] {
    if (!this.preferences.showOnlyFlagged) {
      return tasks;
    }

    return tasks.filter(task => this.hasFlag(task.id));
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
   * Get flag change callback
   */
  onFlagChange?: (flags: TaskFlag[]) => void;

  /**
   * Cleanup
   */
  destroy(): void {
    this.flags.clear();
  }
}

// Export singleton instance
export const flagService = new FlagService(); 