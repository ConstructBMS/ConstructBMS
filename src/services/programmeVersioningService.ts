import { supabase } from './supabase';
import { demoModeService } from './demoModeService';

export interface ProgrammeVersion {
  createdAt: Date;
  createdBy: string;
  demo: boolean;
  id: string;
  isAutoSnapshot: boolean;
  label: string;
  notes?: string;
  projectId: string;
}

export interface ProgrammeVersionData {
  createdAt: Date;
  demo: boolean;
  id: string;
  snapshot: TaskSnapshot;
  taskId: string;
  versionId: string;
}

export interface TaskSnapshot {
  actualFinishDate?: Date;
  actualStartDate?: Date;
  assignedTo?: string;
  calendarId?: string;
  constraintDate?: Date;
  constraintType?: string;
  cost: number;
  customFields: Record<string, any>;
  dependencies: string[];
  description?: string;
  duration: number;
  finishDate: Date;
  isMilestone: boolean;
  name: string;
  notes?: string;
  percentComplete: number;
  priority: string;
  resourceAssignments: Array<{
    cost: number;
    resourceId: string;
    units: number;
    work: number;
  }>;
  startDate: Date;
  status: string;
  structure: {
    level: number;
    parentId?: string;
    wbsNumber?: string;
  };
  tagId?: string;
  work: number;
}

export interface VersionComparison {
  differences: TaskDifference[];
  summary: {
    addedTasks: number;
    modifiedTasks: number;
    removedTasks: number;
    unchangedTasks: number;
  };
  versionA: ProgrammeVersion;
  versionB: ProgrammeVersion;
}

export interface TaskDifference {
  changes: {
    field: string;
    newValue: any;
    oldValue: any;
  }[];
  taskId: string;
  taskName: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
}

export interface VersionPreferences {
  autoSnapshotEnabled: boolean;
  autoSnapshotInterval: number;
  demo: boolean;
  // hours
  maxVersionsPerProject: number; 
  projectId: string;
  updatedAt: Date;
  userId: string;
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxVersionsPerProject: 2,
  maxTasksPerVersion: 10,
  tooltipMessage: 'DEMO LIMIT – Version restore disabled',
  versionStateTag: 'demo'
};

class ProgrammeVersioningService {
  private isDemoMode = false;

  constructor() {
    this.isDemoMode = this.checkDemoMode();
  }

  private checkDemoMode(): boolean {
    return demoModeService.isInDemoMode();
  }

  /**
   * Get all versions for a project
   */
  async getProjectVersions(projectId: string): Promise<ProgrammeVersion[]> {
    try {
      const { data, error } = await supabase
        .from('programme_versions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(version => ({
        id: version.id,
        projectId: version.project_id,
        label: version.label,
        createdBy: version.created_by,
        createdAt: new Date(version.created_at),
        isAutoSnapshot: version.is_auto_snapshot,
        notes: version.notes,
        demo: version.demo
      }));
    } catch (error) {
      console.error('Error loading programme versions:', error);
      return [];
    }
  }

  /**
   * Create a new version snapshot
   */
  async createVersion(
    projectId: string,
    label: string,
    tasks: Array<{ [key: string]: any, id: string; }>,
    notes?: string,
    isAutoSnapshot: boolean = false
  ): Promise<ProgrammeVersion | null> {
    try {
      // Check demo mode limits
      if (this.isDemoMode) {
        const existingVersions = await this.getProjectVersions(projectId);
        if (existingVersions.length >= DEMO_MODE_CONFIG.maxVersionsPerProject) {
          throw new Error(`DEMO LIMIT: Maximum ${DEMO_MODE_CONFIG.maxVersionsPerProject} versions allowed in demo mode`);
        }
      }

      const now = new Date();
      const versionData = {
        project_id: projectId,
        label: label,
        created_by: 'current-user', // This should come from auth context
        created_at: now.toISOString(),
        is_auto_snapshot: isAutoSnapshot,
        notes: notes,
        demo: this.isDemoMode
      };

      // Create version
      const { data: version, error: versionError } = await supabase
        .from('programme_versions')
        .insert(versionData)
        .select()
        .single();

      if (versionError) throw versionError;

      // Create version data for each task
      const versionDataEntries = tasks.map(task => ({
        version_id: version.id,
        task_id: task.id,
        snapshot: this.createTaskSnapshot(task),
        demo: this.isDemoMode
      }));

      const { error: dataError } = await supabase
        .from('programme_version_data')
        .insert(versionDataEntries);

      if (dataError) throw dataError;

      return {
        id: version.id,
        projectId: version.project_id,
        label: version.label,
        createdBy: version.created_by,
        createdAt: new Date(version.created_at),
        isAutoSnapshot: version.is_auto_snapshot,
        notes: version.notes,
        demo: version.demo
      };
    } catch (error) {
      console.error('Error creating programme version:', error);
      throw error;
    }
  }

  /**
   * Get version data for a specific version
   */
  async getVersionData(versionId: string): Promise<ProgrammeVersionData[]> {
    try {
      const { data, error } = await supabase
        .from('programme_version_data')
        .select('*')
        .eq('version_id', versionId);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        versionId: item.version_id,
        taskId: item.task_id,
        snapshot: item.snapshot,
        demo: item.demo,
        createdAt: new Date(item.created_at)
      }));
    } catch (error) {
      console.error('Error loading version data:', error);
      return [];
    }
  }

  /**
   * Compare two versions
   */
  async compareVersions(versionAId: string, versionBId: string): Promise<VersionComparison | null> {
    try {
      const [versionA, versionB, dataA, dataB] = await Promise.all([
        this.getVersion(versionAId),
        this.getVersion(versionBId),
        this.getVersionData(versionAId),
        this.getVersionData(versionBId)
      ]);

      if (!versionA || !versionB) {
        throw new Error('One or both versions not found');
      }

      const differences = this.calculateDifferences(dataA, dataB);
      const summary = this.calculateSummary(differences);

      return {
        versionA,
        versionB,
        differences,
        summary
      };
    } catch (error) {
      console.error('Error comparing versions:', error);
      return null;
    }
  }

  /**
   * Restore a version (replace current tasks with version data)
   */
  async restoreVersion(versionId: string, projectId: string): Promise<boolean> {
    try {
      // Check demo mode restrictions
      if (this.isDemoMode) {
        throw new Error('DEMO LIMIT – Version restore disabled');
      }

      const versionData = await this.getVersionData(versionId);
      if (versionData.length === 0) {
        throw new Error('No data found for this version');
      }

      // Update current tasks with version data
      for (const data of versionData) {
        const taskUpdate = this.snapshotToTaskUpdate(data.snapshot);
        
        const { error } = await supabase
          .from('asta_tasks')
          .update(taskUpdate)
          .eq('id', data.taskId)
          .eq('project_id', projectId);

        if (error) {
          console.error(`Error updating task ${data.taskId}:`, error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error restoring version:', error);
      throw error;
    }
  }

  /**
   * Delete a version
   */
  async deleteVersion(versionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('programme_versions')
        .delete()
        .eq('id', versionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting version:', error);
      return false;
    }
  }

  /**
   * Update version metadata
   */
  async updateVersion(versionId: string, updates: Partial<Pick<ProgrammeVersion, 'label' | 'notes'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('programme_versions')
        .update({
          label: updates.label,
          notes: updates.notes
        })
        .eq('id', versionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating version:', error);
      return false;
    }
  }

  /**
   * Get version preferences
   */
  async getVersionPreferences(userId: string, projectId: string): Promise<VersionPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('programme_version_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        userId: data.user_id,
        projectId: data.project_id,
        autoSnapshotEnabled: data.auto_snapshot_enabled,
        autoSnapshotInterval: data.auto_snapshot_interval,
        maxVersionsPerProject: data.max_versions_per_project,
        demo: data.demo,
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error loading version preferences:', error);
      return null;
    }
  }

  /**
   * Save version preferences
   */
  async saveVersionPreferences(preferences: Omit<VersionPreferences, 'updatedAt'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('programme_version_preferences')
        .upsert({
          user_id: preferences.userId,
          project_id: preferences.projectId,
          auto_snapshot_enabled: preferences.autoSnapshotEnabled,
          auto_snapshot_interval: preferences.autoSnapshotInterval,
          max_versions_per_project: preferences.maxVersionsPerProject,
          demo: preferences.demo,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving version preferences:', error);
      return false;
    }
  }

  /**
   * Get a single version
   */
  private async getVersion(versionId: string): Promise<ProgrammeVersion | null> {
    try {
      const { data, error } = await supabase
        .from('programme_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        projectId: data.project_id,
        label: data.label,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        isAutoSnapshot: data.is_auto_snapshot,
        notes: data.notes,
        demo: data.demo
      };
    } catch (error) {
      console.error('Error loading version:', error);
      return null;
    }
  }

  /**
   * Create task snapshot from task data
   */
  private createTaskSnapshot(task: any): TaskSnapshot {
    return {
      name: task.name || '',
      startDate: new Date(task.start_date || task.startDate || new Date()),
      finishDate: new Date(task.finish_date || task.finishDate || new Date()),
      percentComplete: task.percent_complete || task.percentComplete || 0,
      dependencies: task.dependencies || [],
      calendarId: task.calendar_id || task.calendarId,
      constraintType: task.constraint_type || task.constraintType,
      constraintDate: task.constraint_date || task.constraintDate ? new Date(task.constraint_date || task.constraintDate) : undefined,
      customFields: task.custom_fields || task.customFields || {},
      structure: {
        level: task.level || 0,
        parentId: task.parent_task_id || task.parentId,
        wbsNumber: task.wbs_number || task.wbsNumber
      },
      tagId: task.tag_id || task.tagId,
      status: task.status || 'not-started',
      priority: task.priority || 'medium',
      assignedTo: task.assigned_to || task.assignedTo,
      description: task.description || '',
      notes: task.notes || '',
      isMilestone: task.is_milestone || task.isMilestone || false,
      actualStartDate: task.actual_start_date || task.actualStartDate ? new Date(task.actual_start_date || task.actualStartDate) : undefined,
      actualFinishDate: task.actual_finish_date || task.actualFinishDate ? new Date(task.actual_finish_date || task.actualFinishDate) : undefined,
      duration: task.duration || 0,
      work: task.work || 0,
      cost: task.cost || 0,
      resourceAssignments: task.resource_assignments || task.resourceAssignments || []
    };
  }

  /**
   * Convert snapshot back to task update format
   */
  private snapshotToTaskUpdate(snapshot: TaskSnapshot): any {
    return {
      name: snapshot.name,
      start_date: snapshot.startDate.toISOString().split('T')[0],
      finish_date: snapshot.finishDate.toISOString().split('T')[0],
      percent_complete: snapshot.percentComplete,
      calendar_id: snapshot.calendarId,
      constraint_type: snapshot.constraintType,
      constraint_date: snapshot.constraintDate?.toISOString().split('T')[0],
      custom_fields: snapshot.customFields,
      level: snapshot.structure.level,
      parent_task_id: snapshot.structure.parentId,
      wbs_number: snapshot.structure.wbsNumber,
      tag_id: snapshot.tagId,
      status: snapshot.status,
      priority: snapshot.priority,
      assigned_to: snapshot.assignedTo,
      description: snapshot.description,
      notes: snapshot.notes,
      is_milestone: snapshot.isMilestone,
      actual_start_date: snapshot.actualStartDate?.toISOString().split('T')[0],
      actual_finish_date: snapshot.actualFinishDate?.toISOString().split('T')[0],
      duration: snapshot.duration,
      work: snapshot.work,
      cost: snapshot.cost
    };
  }

  /**
   * Calculate differences between two versions
   */
  private calculateDifferences(dataA: ProgrammeVersionData[], dataB: ProgrammeVersionData[]): TaskDifference[] {
    const differences: TaskDifference[] = [];
    const tasksA = new Map(dataA.map(d => [d.taskId, d]));
    const tasksB = new Map(dataB.map(d => [d.taskId, d]));

    // Find added tasks
    for (const [taskId, dataB] of tasksB) {
      if (!tasksA.has(taskId)) {
        differences.push({
          taskId,
          taskName: dataB.snapshot.name,
          type: 'added',
          changes: []
        });
      }
    }

    // Find removed tasks
    for (const [taskId, dataA] of tasksA) {
      if (!tasksB.has(taskId)) {
        differences.push({
          taskId,
          taskName: dataA.snapshot.name,
          type: 'removed',
          changes: []
        });
      }
    }

    // Find modified tasks
    for (const [taskId, dataA] of tasksA) {
      const dataB = tasksB.get(taskId);
      if (dataB) {
        const changes = this.compareTaskSnapshots(dataA.snapshot, dataB.snapshot);
        if (changes.length > 0) {
          differences.push({
            taskId,
            taskName: dataA.snapshot.name,
            type: 'modified',
            changes
          });
        } else {
          differences.push({
            taskId,
            taskName: dataA.snapshot.name,
            type: 'unchanged',
            changes: []
          });
        }
      }
    }

    return differences;
  }

  /**
   * Compare two task snapshots
   */
  private compareTaskSnapshots(snapshotA: TaskSnapshot, snapshotB: TaskSnapshot): Array<{ field: string; newValue: any, oldValue: any; }> {
    const changes: Array<{ field: string; newValue: any, oldValue: any; }> = [];
    const fields = [
      'name', 'startDate', 'finishDate', 'percentComplete', 'status', 'priority',
      'assignedTo', 'description', 'notes', 'isMilestone', 'duration', 'work', 'cost'
    ];

    for (const field of fields) {
      const valueA = (snapshotA as any)[field];
      const valueB = (snapshotB as any)[field];
      
      if (valueA !== valueB) {
        changes.push({
          field,
          oldValue: valueA,
          newValue: valueB
        });
      }
    }

    return changes;
  }

  /**
   * Calculate summary of differences
   */
  private calculateSummary(differences: TaskDifference[]): VersionComparison['summary'] {
    return {
      addedTasks: differences.filter(d => d.type === 'added').length,
      removedTasks: differences.filter(d => d.type === 'removed').length,
      modifiedTasks: differences.filter(d => d.type === 'modified').length,
      unchangedTasks: differences.filter(d => d.type === 'unchanged').length
    };
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
}

export const programmeVersioningService = new ProgrammeVersioningService(); 