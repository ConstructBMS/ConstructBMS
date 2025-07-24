import { supabase } from './supabase';

// Multi-project interfaces
export interface ProjectInfo {
  client: string;
  color: string;
  demo?: boolean;
  endDate: Date;
  id: string;
  isVisible: boolean;
  name: string;
  startDate: Date;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  totalTasks: number;
}

export interface MultiProjectTask {
  assignedTo: string;
  demo?: boolean;
  end: Date;
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  projectColor: string;
  projectId: string;
  projectName: string;
  start: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
}

export interface MultiProjectPreferences {
  demo: boolean;
  groupByProject: boolean;
  selectedProjects: string[];
  timelineMode: 'single' | 'multi';
  userId: string;
  visibleProjects: string[];
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxProjectsViewable: 2,
  tooltipMessage: 'Upgrade for multi-project scheduling',
  projectStateTag: 'demo'
};

// Default project colors
const PROJECT_COLORS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
  '#6366F1'  // indigo-500
];

class MultiProjectService {
  private projects: Map<string, ProjectInfo> = new Map();
  private tasks: Map<string, MultiProjectTask[]> = new Map();
  private preferences: MultiProjectPreferences;
  private isDemoMode = false;

  constructor() {
    this.isDemoMode = this.checkDemoMode();
    this.preferences = {
      userId: 'current-user',
      timelineMode: 'single',
      selectedProjects: [],
      groupByProject: true,
      visibleProjects: [],
      demo: this.isDemoMode
    };
  }

  private checkDemoMode(): boolean {
    // Check user role or environment to determine demo mode
    return false; // Set to true for demo mode testing
  }

  /**
   * Get all projects user has access to
   */
  async getAccessibleProjects(): Promise<ProjectInfo[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Clear existing projects and add new ones
      this.projects.clear();
      if (data) {
        data.forEach((project, index) => {
          const projectInfo: ProjectInfo = {
            ...project,
            startDate: new Date(project.start_date),
            endDate: new Date(project.end_date),
            color: PROJECT_COLORS[index % PROJECT_COLORS.length],
            isVisible: true,
            demo: this.isDemoMode
          };
          this.projects.set(project.id, projectInfo);
        });
      }

      return Array.from(this.projects.values());
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  /**
   * Get tasks for multiple projects
   */
  async getTasksForProjects(projectIds: string[]): Promise<MultiProjectTask[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .in('project_id', projectIds)
        .order('start_date', { ascending: true });

      if (error) throw error;

      // Clear existing tasks and add new ones
      this.tasks.clear();
      const allTasks: MultiProjectTask[] = [];

      if (data) {
        data.forEach(task => {
          const project = this.projects.get(task.project_id);
          if (project) {
            const multiProjectTask: MultiProjectTask = {
              ...task,
              projectName: project.name,
              projectColor: project.color,
              start: new Date(task.start_date),
              end: new Date(task.end_date),
              demo: this.isDemoMode
            };
            
            // Group tasks by project
            if (!this.tasks.has(task.project_id)) {
              this.tasks.set(task.project_id, []);
            }
            this.tasks.get(task.project_id)!.push(multiProjectTask);
            allTasks.push(multiProjectTask);
          }
        });
      }

      return allTasks;
    } catch (error) {
      console.error('Error loading tasks for projects:', error);
      return [];
    }
  }

  /**
   * Set timeline mode
   */
  async setTimelineMode(mode: 'single' | 'multi'): Promise<boolean> {
    try {
      this.preferences.timelineMode = mode;
      await this.savePreferences();
      return true;
    } catch (error) {
      console.error('Error setting timeline mode:', error);
      return false;
    }
  }

  /**
   * Add project to comparison
   */
  async addProjectToComparison(projectId: string): Promise<boolean> {
    // Check demo mode restrictions
    if (this.isDemoMode && this.preferences.selectedProjects.length >= DEMO_MODE_CONFIG.maxProjectsViewable) {
      console.warn('Maximum projects reached in demo mode');
      return false;
    }

    try {
      if (!this.preferences.selectedProjects.includes(projectId)) {
        this.preferences.selectedProjects.push(projectId);
        this.preferences.visibleProjects.push(projectId);
        await this.savePreferences();
      }
      return true;
    } catch (error) {
      console.error('Error adding project to comparison:', error);
      return false;
    }
  }

  /**
   * Remove project from comparison
   */
  async removeProjectFromComparison(projectId: string): Promise<boolean> {
    try {
      this.preferences.selectedProjects = this.preferences.selectedProjects.filter(id => id !== projectId);
      this.preferences.visibleProjects = this.preferences.visibleProjects.filter(id => id !== projectId);
      await this.savePreferences();
      return true;
    } catch (error) {
      console.error('Error removing project from comparison:', error);
      return false;
    }
  }

  /**
   * Toggle project visibility
   */
  async toggleProjectVisibility(projectId: string): Promise<boolean> {
    try {
      const isVisible = this.preferences.visibleProjects.includes(projectId);
      if (isVisible) {
        this.preferences.visibleProjects = this.preferences.visibleProjects.filter(id => id !== projectId);
      } else {
        this.preferences.visibleProjects.push(projectId);
      }
      await this.savePreferences();
      return true;
    } catch (error) {
      console.error('Error toggling project visibility:', error);
      return false;
    }
  }

  /**
   * Toggle group by project
   */
  async toggleGroupByProject(): Promise<boolean> {
    try {
      this.preferences.groupByProject = !this.preferences.groupByProject;
      await this.savePreferences();
      return true;
    } catch (error) {
      console.error('Error toggling group by project:', error);
      return false;
    }
  }

  /**
   * Get selected projects
   */
  getSelectedProjects(): ProjectInfo[] {
    return this.preferences.selectedProjects
      .map(id => this.projects.get(id))
      .filter(Boolean) as ProjectInfo[];
  }

  /**
   * Get visible projects
   */
  getVisibleProjects(): ProjectInfo[] {
    return this.preferences.visibleProjects
      .map(id => this.projects.get(id))
      .filter(Boolean) as ProjectInfo[];
  }

  /**
   * Get visible tasks
   */
  getVisibleTasks(): MultiProjectTask[] {
    const visibleTasks: MultiProjectTask[] = [];
    
    this.preferences.visibleProjects.forEach(projectId => {
      const projectTasks = this.tasks.get(projectId);
      if (projectTasks) {
        visibleTasks.push(...projectTasks);
      }
    });
    
    return visibleTasks;
  }

  /**
   * Get tasks grouped by project
   */
  getTasksGroupedByProject(): { project: ProjectInfo; tasks: MultiProjectTask[] }[] {
    return this.preferences.visibleProjects
      .map(projectId => {
        const project = this.projects.get(projectId);
        const tasks = this.tasks.get(projectId) || [];
        return { project, tasks };
      })
      .filter(group => group.project) as { project: ProjectInfo; tasks: MultiProjectTask[] }[];
  }

  /**
   * Get project by ID
   */
  getProject(projectId: string): ProjectInfo | null {
    return this.projects.get(projectId) || null;
  }

  /**
   * Get project color
   */
  getProjectColor(projectId: string): string {
    const project = this.projects.get(projectId);
    return project?.color ?? PROJECT_COLORS[0];
  }

  /**
   * Check if project is visible
   */
  isProjectVisible(projectId: string): boolean {
    return this.preferences.visibleProjects.includes(projectId);
  }

  /**
   * Check if timeline mode is multi-project
   */
  isMultiProjectMode(): boolean {
    return this.preferences.timelineMode === 'multi';
  }

  /**
   * Check if grouping is enabled
   */
  isGroupByProjectEnabled(): boolean {
    return this.preferences.groupByProject;
  }

  /**
   * Get current preferences
   */
  getPreferences(): MultiProjectPreferences {
    return { ...this.preferences };
  }

  /**
   * Load multi-project preferences
   */
  async loadPreferences(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('multi_project_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return;
      }

      this.preferences = {
        userId: data.user_id ?? 'current-user',
        timelineMode: (data.timeline_mode as 'single' | 'multi') ?? 'single',
        selectedProjects: data.selected_projects ?? [],
        groupByProject: data.group_by_project ?? true,
        visibleProjects: data.visible_projects ?? [],
        demo: this.isDemoMode
      };
    } catch (error) {
      console.error('Error loading multi-project preferences:', error);
    }
  }

  /**
   * Save multi-project preferences
   */
  async savePreferences(): Promise<void> {
    try {
      const { error } = await supabase
        .from('multi_project_preferences')
        .upsert({
          user_id: this.preferences.userId,
          timeline_mode: this.preferences.timelineMode,
          selected_projects: this.preferences.selectedProjects,
          group_by_project: this.preferences.groupByProject,
          visible_projects: this.preferences.visibleProjects,
          demo: this.isDemoMode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving multi-project preferences:', error);
    }
  }

  /**
   * Update preferences
   */
  async updatePreferences(updates: Partial<MultiProjectPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...updates };
    await this.savePreferences();
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
   * Check if project can be added (demo mode restrictions)
   */
  canAddProject(): boolean {
    if (!this.isDemoMode) return true;
    return this.preferences.selectedProjects.length < DEMO_MODE_CONFIG.maxProjectsViewable;
  }

  /**
   * Get multi-project change callback
   */
  onMultiProjectChange?: (projects: ProjectInfo[]) => void;

  /**
   * Cleanup
   */
  destroy(): void {
    this.projects.clear();
    this.tasks.clear();
  }
}

// Export singleton instance
export const multiProjectService = new MultiProjectService(); 