import { supabase } from './supabase';

// Structure interfaces
export interface TaskStructure {
  id: string;
  parentId: string | null;
  type: 'task' | 'milestone' | 'phase';
  collapsed: boolean;
  sortOrder: number;
  projectId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  demo?: boolean;
}

export interface StructurePreferences {
  userId: string;
  projectId: string;
  collapseAll: boolean;
  showPhases: boolean;
  demo: boolean;
}

export interface PhaseInfo {
  id: string;
  name: string;
  level: number;
  collapsed: boolean;
  children: string[];
  progress: number;
  startDate: Date | null;
  endDate: Date | null;
  duration: number;
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxPhasesPerProject: 1,
  maxTasksPerPhase: 3,
  allowNestedPhases: false,
  tooltipMessage: 'DEMO STRUCTURE',
  structureStateTag: 'demo'
};

class StructureService {
  private structures: Map<string, TaskStructure> = new Map();
  private preferences: StructurePreferences;
  private isDemoMode = false;

  constructor() {
    this.isDemoMode = this.checkDemoMode();
    this.preferences = {
      userId: 'current-user',
      projectId: 'current-project',
      collapseAll: false,
      showPhases: true,
      demo: this.isDemoMode
    };
  }

  private checkDemoMode(): boolean {
    // Check user role or environment to determine demo mode
    return false; // Set to true for demo mode testing
  }

  /**
   * Get structure for task
   */
  getTaskStructure(taskId: string): TaskStructure | null {
    return this.structures.get(taskId) || null;
  }

  /**
   * Get all structures for project
   */
  async getStructuresForProject(projectId: string): Promise<TaskStructure[]> {
    try {
      const { data, error } = await supabase
        .from('task_structures')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Clear existing structures and add new ones
      this.structures.clear();
      if (data) {
        data.forEach(structure => {
          this.structures.set(structure.task_id, {
            ...structure,
            id: structure.task_id,
            createdAt: new Date(structure.created_at),
            updatedAt: new Date(structure.updated_at)
          });
        });
      }

      return Array.from(this.structures.values());
    } catch (error) {
      console.error('Error loading structures:', error);
      return [];
    }
  }

  /**
   * Save structure for task
   */
  async saveStructure(structure: Omit<TaskStructure, 'createdAt' | 'updatedAt'>): Promise<boolean> {
    // Check demo mode restrictions
    if (this.isDemoMode) {
      const existingStructures = Array.from(this.structures.values());
      const phases = existingStructures.filter(s => s.type === 'phase');
      
      if (structure.type === 'phase' && phases.length >= DEMO_MODE_CONFIG.maxPhasesPerProject) {
        console.warn('Maximum phases reached in demo mode');
        return false;
      }
      
      if (structure.parentId) {
        const parentStructure = this.structures.get(structure.parentId);
        if (parentStructure && parentStructure.type === 'phase') {
          const siblings = existingStructures.filter(s => s.parentId === structure.parentId);
          if (siblings.length >= DEMO_MODE_CONFIG.maxTasksPerPhase) {
            console.warn('Maximum tasks per phase reached in demo mode');
            return false;
          }
        }
        
        if (DEMO_MODE_CONFIG.allowNestedPhases === false) {
          const parentStructure = this.structures.get(structure.parentId);
          if (parentStructure && parentStructure.type === 'phase') {
            console.warn('Nested phases not allowed in demo mode');
            return false;
          }
        }
      }
    }

    try {
      const now = new Date();
      const structureData = {
        task_id: structure.id,
        project_id: structure.projectId,
        parent_id: structure.parentId,
        task_type: structure.type,
        collapsed: structure.collapsed,
        sort_order: structure.sortOrder,
        created_by: structure.createdBy,
        updated_by: structure.updatedBy,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        demo: this.isDemoMode
      };

      const { error } = await supabase
        .from('task_structures')
        .upsert(structureData);

      if (error) throw error;

      // Update local cache
      const savedStructure: TaskStructure = {
        ...structure,
        createdAt: now,
        updatedAt: now,
        demo: this.isDemoMode
      };
      this.structures.set(structure.id, savedStructure);

      return true;
    } catch (error) {
      console.error('Error saving structure:', error);
      return false;
    }
  }

  /**
   * Update structure
   */
  async updateStructure(taskId: string, updates: Partial<Pick<TaskStructure, 'parentId' | 'type' | 'collapsed' | 'sortOrder'>>): Promise<boolean> {
    const existingStructure = this.structures.get(taskId);
    if (!existingStructure) return false;

    // Check demo mode restrictions
    if (this.isDemoMode) {
      if (updates.type === 'phase') {
        const phases = Array.from(this.structures.values()).filter(s => s.type === 'phase');
        if (phases.length >= DEMO_MODE_CONFIG.maxPhasesPerProject) {
          console.warn('Maximum phases reached in demo mode');
          return false;
        }
      }
      
      if (updates.parentId) {
        const parentStructure = this.structures.get(updates.parentId);
        if (parentStructure && parentStructure.type === 'phase') {
          const siblings = Array.from(this.structures.values()).filter(s => s.parentId === updates.parentId);
          if (siblings.length >= DEMO_MODE_CONFIG.maxTasksPerPhase) {
            console.warn('Maximum tasks per phase reached in demo mode');
            return false;
          }
        }
      }
    }

    try {
      const updatedStructure: TaskStructure = {
        ...existingStructure,
        ...updates,
        updatedAt: new Date(),
        updatedBy: 'current-user' // This should come from auth context
      };

      const { error } = await supabase
        .from('task_structures')
        .update({
          parent_id: updatedStructure.parentId,
          task_type: updatedStructure.type,
          collapsed: updatedStructure.collapsed,
          sort_order: updatedStructure.sortOrder,
          updated_at: updatedStructure.updatedAt.toISOString(),
          updated_by: updatedStructure.updatedBy
        })
        .eq('task_id', taskId);

      if (error) throw error;

      // Update local cache
      this.structures.set(taskId, updatedStructure);

      return true;
    } catch (error) {
      console.error('Error updating structure:', error);
      return false;
    }
  }

  /**
   * Toggle collapse state
   */
  async toggleCollapse(taskId: string): Promise<boolean> {
    const structure = this.structures.get(taskId);
    if (!structure || structure.type !== 'phase') return false;

    return await this.updateStructure(taskId, {
      collapsed: !structure.collapsed
    });
  }

  /**
   * Get children of a task
   */
  getChildren(taskId: string): TaskStructure[] {
    return Array.from(this.structures.values())
      .filter(structure => structure.parentId === taskId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Get all descendants of a task
   */
  getDescendants(taskId: string): string[] {
    const descendants: string[] = [];
    const children = this.getChildren(taskId);
    
    children.forEach(child => {
      descendants.push(child.id);
      descendants.push(...this.getDescendants(child.id));
    });
    
    return descendants;
  }

  /**
   * Get parent of a task
   */
  getParent(taskId: string): TaskStructure | null {
    const structure = this.structures.get(taskId);
    if (!structure || !structure.parentId) return null;
    
    return this.structures.get(structure.parentId) || null;
  }

  /**
   * Get level of a task
   */
  getLevel(taskId: string): number {
    let level = 0;
    let currentId = taskId;
    
    while (true) {
      const parent = this.getParent(currentId);
      if (!parent) break;
      level++;
      currentId = parent.id;
    }
    
    return level;
  }

  /**
   * Check if task is visible (not collapsed by any parent)
   */
  isVisible(taskId: string): boolean {
    let currentId = taskId;
    
    while (true) {
      const parent = this.getParent(currentId);
      if (!parent) break;
      
      if (parent.collapsed) return false;
      currentId = parent.id;
    }
    
    return true;
  }

  /**
   * Get visible tasks
   */
  getVisibleTasks(allTaskIds: string[]): string[] {
    return allTaskIds.filter(taskId => this.isVisible(taskId));
  }

  /**
   * Build hierarchical structure
   */
  buildHierarchy(tasks: any[]): any[] {
    const taskMap = new Map(tasks.map(task => [task.id, { ...task, children: [] }]));
    const rootTasks: any[] = [];
    
    tasks.forEach(task => {
      const structure = this.structures.get(task.id);
      if (structure && structure.parentId) {
        const parent = taskMap.get(structure.parentId);
        if (parent) {
          parent.children.push(taskMap.get(task.id));
        }
      } else {
        rootTasks.push(taskMap.get(task.id));
      }
    });
    
    return this.sortHierarchy(rootTasks);
  }

  /**
   * Sort hierarchy by sort order
   */
  private sortHierarchy(tasks: any[]): any[] {
    return tasks.sort((a, b) => {
      const structureA = this.structures.get(a.id);
      const structureB = this.structures.get(b.id);
      const orderA = structureA?.sortOrder || 0;
      const orderB = structureB?.sortOrder || 0;
      return orderA - orderB;
    }).map(task => ({
      ...task,
      children: this.sortHierarchy(task.children)
    }));
  }

  /**
   * Calculate aggregated progress for phase
   */
  calculatePhaseProgress(phaseId: string, tasks: any[]): { progress: number; startDate: Date | null; endDate: Date | null; duration: number } {
    const children = this.getChildren(phaseId);
    const childTasks = children.map(child => tasks.find(t => t.id === child.id)).filter(Boolean);
    
    if (childTasks.length === 0) {
      return { progress: 0, startDate: null, endDate: null, duration: 0 };
    }
    
    // Calculate average progress
    const totalProgress = childTasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    const progress = totalProgress / childTasks.length;
    
    // Calculate date range
    const startDates = childTasks.map(task => task.start).filter(Boolean);
    const endDates = childTasks.map(task => task.end).filter(Boolean);
    
    const startDate = startDates.length > 0 ? new Date(Math.min(...startDates.map(d => d.getTime()))) : null;
    const endDate = endDates.length > 0 ? new Date(Math.max(...endDates.map(d => d.getTime()))) : null;
    
    // Calculate duration in working days
    const duration = startDate && endDate 
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    return { progress, startDate, endDate, duration };
  }

  /**
   * Load structure preferences
   */
  async loadPreferences(userId: string, projectId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('structure_preferences')
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
        collapseAll: data.collapse_all || false,
        showPhases: data.show_phases ?? true,
        demo: this.isDemoMode
      };
    } catch (error) {
      console.error('Error loading structure preferences:', error);
    }
  }

  /**
   * Save structure preferences
   */
  async savePreferences(): Promise<void> {
    try {
      const { error } = await supabase
        .from('structure_preferences')
        .upsert({
          user_id: this.preferences.userId,
          project_id: this.preferences.projectId,
          collapse_all: this.preferences.collapseAll,
          show_phases: this.preferences.showPhases,
          demo: this.isDemoMode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving structure preferences:', error);
    }
  }

  /**
   * Update preferences
   */
  async updatePreferences(updates: Partial<StructurePreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...updates };
    await this.savePreferences();
  }

  /**
   * Get current preferences
   */
  getPreferences(): StructurePreferences {
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
   * Get structure change callback
   */
  onStructureChange?: (structures: TaskStructure[]) => void;

  /**
   * Cleanup
   */
  destroy(): void {
    this.structures.clear();
  }
}

// Export singleton instance
export const structureService = new StructureService(); 