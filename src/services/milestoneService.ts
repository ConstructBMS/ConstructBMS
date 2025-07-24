import { supabase } from './supabase';
import { demoModeService } from './demoModeService';

// Milestone interfaces
export interface Milestone {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  projectId: string;
  status?: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tag?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;
  demoMode?: boolean;
  isCritical?: boolean;
  isMilestone: boolean; // Standard task with isMilestone: true
  critical: boolean; // For critical path highlighting
  tag: string | null; // For key date tagging
  demo: boolean; // All entries tagged demo: true in demo mode
}

export interface MilestoneConstraint {
  enforceDependencies: boolean;
  allowOverlap: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export interface MilestoneResult {
  success: boolean;
  milestone?: Milestone;
  message: string;
  demoMode?: boolean;
  constraintViolations?: string[] | undefined;
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxMilestonesPerProject: 3, // Max 3 milestones per project
  dateRangeDays: 7,
  fixedColor: 'fuchsia-500',
  toastPrefix: 'DEMO MILESTONE: ',
  fixedTag: 'Demo Event', // Tag field fixed to "Demo Event"
  watermark: 'DEMO MILESTONE' // Watermark in tooltip
};

class MilestoneService {
  private isDemoMode = false;

  constructor() {
    this.checkDemoMode();
  }

  private async checkDemoMode(): Promise<void> {
    this.isDemoMode = await demoModeService.isDemoMode();
  }

  /**
   * Create a new milestone
   */
  async createMilestone(
    name: string,
    milestoneDate: Date,
    projectId: string,
    options?: {
      tag?: string;
      notes?: string;
      status?: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
      isCritical?: boolean;
    }
  ): Promise<MilestoneResult> {
    try {
      await this.checkDemoMode();

      // Check demo mode limits
      if (this.isDemoMode) {
        const milestoneCount = await this.getMilestoneCount(projectId);
        if (milestoneCount >= DEMO_MODE_CONFIG.maxMilestonesPerProject) {
          return {
            success: false,
            message: `${DEMO_MODE_CONFIG.toastPrefix}Maximum ${DEMO_MODE_CONFIG.maxMilestonesPerProject} milestones allowed per project`
          };
        }

        // Check date range in demo mode
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() - DEMO_MODE_CONFIG.dateRangeDays);
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + DEMO_MODE_CONFIG.dateRangeDays);

        if (milestoneDate < minDate || milestoneDate > maxDate) {
          return {
            success: false,
            message: `${DEMO_MODE_CONFIG.toastPrefix}Date must be within ±${DEMO_MODE_CONFIG.dateRangeDays} days of today`
          };
        }
      }

      // Validate milestone date
      const validation = await this.validateMilestoneDate(milestoneDate, projectId);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
          constraintViolations: validation.violations
        };
      }

      // Create milestone data - standard task with isMilestone: true
      const milestoneData = {
        name,
        start_date: milestoneDate.toISOString().split('T')[0],
        end_date: milestoneDate.toISOString().split('T')[0],
        duration: 0, // Zero duration for milestones
        project_id: projectId,
        status: options?.status || 'not-started',
        priority: options?.isCritical ? 'critical' : 'medium',
        is_milestone: true, // Standard task with isMilestone: true
        critical: options?.isCritical || false, // For critical path highlighting
        tag: this.isDemoMode ? DEMO_MODE_CONFIG.fixedTag : (options?.tag || null), // Tag field fixed to "Demo Event" in demo mode
        demo: this.isDemoMode, // All entries tagged demo: true in demo mode
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add optional fields if they exist in the database
      if (options?.notes) {
        (milestoneData as any).notes = options.notes;
      }

      // Insert into Supabase
      const { data, error } = await supabase
        .from('asta_tasks')
        .insert(milestoneData)
        .select()
        .single();

      if (error) throw error;

      const milestone: Milestone = {
        id: data.id,
        name: data.name,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        projectId: data.project_id,
        status: data.status,
        priority: data.priority,
        tag: data.tag,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        demoMode: this.isDemoMode,
        isCritical: data.priority === 'critical',
        isMilestone: true,
        critical: data.critical || false,
        demo: data.demo || false
      };

      return {
        success: true,
        milestone,
        message: this.isDemoMode 
          ? `${DEMO_MODE_CONFIG.toastPrefix}Milestone "${name}" created`
          : `Milestone "${name}" created successfully`
      };

    } catch (error) {
      console.error('Error creating milestone:', error);
      return {
        success: false,
        message: 'Failed to create milestone'
      };
    }
  }

  /**
   * Update an existing milestone
   */
  async updateMilestone(
    milestoneId: string,
    updates: {
      name?: string;
      milestoneDate?: Date;
      status?: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
      tag?: string;
      notes?: string;
      isCritical?: boolean;
    }
  ): Promise<MilestoneResult> {
    try {
      await this.checkDemoMode();

      // Get current milestone
      const { data: currentMilestone, error: fetchError } = await supabase
        .from('asta_tasks')
        .select('*')
        .eq('id', milestoneId)
        .eq('is_milestone', true)
        .single();

      if (fetchError || !currentMilestone) {
        return {
          success: false,
          message: 'Milestone not found'
        };
      }

      // Check demo mode restrictions
      if (this.isDemoMode) {
        if (updates.milestoneDate) {
          const today = new Date();
          const minDate = new Date(today);
          minDate.setDate(today.getDate() - DEMO_MODE_CONFIG.dateRangeDays);
          const maxDate = new Date(today);
          maxDate.setDate(today.getDate() + DEMO_MODE_CONFIG.dateRangeDays);

          if (updates.milestoneDate < minDate || updates.milestoneDate > maxDate) {
            return {
              success: false,
              message: `${DEMO_MODE_CONFIG.toastPrefix}Date must be within ±${DEMO_MODE_CONFIG.dateRangeDays} days of today`
            };
          }
        }

        // In demo mode, critical toggle is disabled
        if (updates.isCritical !== undefined) {
          return {
            success: false,
            message: `${DEMO_MODE_CONFIG.toastPrefix}Critical toggle is disabled in demo mode`
          };
        }
      }

      // Validate milestone date if being updated
      if (updates.milestoneDate) {
        const validation = await this.validateMilestoneDate(
          updates.milestoneDate, 
          currentMilestone.project_id,
          milestoneId
        );
        if (!validation.valid) {
          return {
            success: false,
            message: validation.message,
            constraintViolations: validation.violations
          };
        }
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name) updateData.name = updates.name;
      if (updates.status) updateData.status = updates.status;
      if (updates.notes) updateData.notes = updates.notes;

      if (updates.milestoneDate) {
        updateData.start_date = updates.milestoneDate.toISOString().split('T')[0];
        updateData.end_date = updates.milestoneDate.toISOString().split('T')[0];
      }

      // Handle critical flag (disabled in demo mode)
      if (updates.isCritical !== undefined && !this.isDemoMode) {
        updateData.priority = updates.isCritical ? 'critical' : 'medium';
        updateData.critical = updates.isCritical;
      }

      // Handle tag (fixed in demo mode)
      if (updates.tag !== undefined) {
        updateData.tag = this.isDemoMode ? DEMO_MODE_CONFIG.fixedTag : updates.tag;
      }

      // Update in Supabase
      const { data, error } = await supabase
        .from('asta_tasks')
        .update(updateData)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;

      const milestone: Milestone = {
        id: data.id,
        name: data.name,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        projectId: data.project_id,
        status: data.status,
        priority: data.priority,
        tag: data.tag,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        demoMode: this.isDemoMode,
        isCritical: data.priority === 'critical',
        isMilestone: true,
        critical: data.critical || false,
        demo: data.demo || false
      };

      return {
        success: true,
        milestone,
        message: this.isDemoMode 
          ? `${DEMO_MODE_CONFIG.toastPrefix}Milestone updated`
          : 'Milestone updated successfully'
      };

    } catch (error) {
      console.error('Error updating milestone:', error);
      return {
        success: false,
        message: 'Failed to update milestone'
      };
    }
  }

  /**
   * Get milestones for a project
   */
  async getProjectMilestones(projectId: string): Promise<Milestone[]> {
    try {
      const { data, error } = await supabase
        .from('asta_tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_milestone', true)
        .order('start_date', { ascending: true });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        name: item.name,
        startDate: new Date(item.start_date),
        endDate: new Date(item.end_date),
        projectId: item.project_id,
        status: item.status,
        priority: item.priority,
        tag: item.tag,
        notes: item.notes,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        demoMode: item.demo || false,
        isCritical: item.priority === 'critical',
        isMilestone: true,
        critical: item.critical || false,
        demo: item.demo || false
      }));

    } catch (error) {
      console.error('Error fetching milestones:', error);
      return [];
    }
  }

  /**
   * Delete a milestone
   */
  async deleteMilestone(milestoneId: string): Promise<MilestoneResult> {
    try {
      const { error } = await supabase
        .from('asta_tasks')
        .delete()
        .eq('id', milestoneId)
        .eq('is_milestone', true);

      if (error) throw error;

      return {
        success: true,
        message: this.isDemoMode 
          ? `${DEMO_MODE_CONFIG.toastPrefix}Milestone deleted`
          : 'Milestone deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting milestone:', error);
      return {
        success: false,
        message: 'Failed to delete milestone'
      };
    }
  }

  /**
   * Validate milestone date against constraints
   */
  private async validateMilestoneDate(
    milestoneDate: Date,
    projectId: string,
    excludeMilestoneId?: string
  ): Promise<{ valid: boolean; message: string; violations?: string[] }> {
    try {
      const violations: string[] = [];

      // Check for negative dates
      if (milestoneDate < new Date('2020-01-01')) {
        violations.push('Milestone date cannot be before 2020');
      }

      // Check for overlaps if not allowed
      const { data: overlappingMilestones, error } = await supabase
        .from('asta_tasks')
        .select('name')
        .eq('project_id', projectId)
        .eq('is_milestone', true)
        .eq('start_date', milestoneDate.toISOString().split('T')[0])
        .neq('id', excludeMilestoneId || '');

      if (error) throw error;

      if (overlappingMilestones && overlappingMilestones.length > 0) {
        violations.push(`Milestone date conflicts with: ${overlappingMilestones.map(m => m.name).join(', ')}`);
      }

      // Check dependency constraints
      const dependencyViolations = await this.checkMilestoneDependencies(milestoneDate, projectId, excludeMilestoneId);
      violations.push(...dependencyViolations);

      return {
        valid: violations.length === 0,
        message: violations.length > 0 ? violations.join('; ') : 'Valid',
        violations
      };

    } catch (error) {
      console.error('Error validating milestone date:', error);
      return {
        valid: false,
        message: 'Error validating milestone date'
      };
    }
  }

  /**
   * Check milestone dependencies
   */
  private async checkMilestoneDependencies(
    milestoneDate: Date,
    projectId: string,
    excludeMilestoneId?: string
  ): Promise<string[]> {
    try {
      const violations: string[] = [];

      // Get all task dependencies for this project
      const { data: dependencies, error } = await supabase
        .from('asta_task_links')
        .select('source_task_id, target_task_id, link_type')
        .or(`source_task_id.eq.${excludeMilestoneId || ''},target_task_id.eq.${excludeMilestoneId || ''}`);

      if (error) throw error;

      for (const dep of dependencies || []) {
        // Get the other task in the dependency
        const otherTaskId = dep.source_task_id === excludeMilestoneId ? dep.target_task_id : dep.source_task_id;
        
        const { data: otherTask } = await supabase
          .from('asta_tasks')
          .select('name, is_milestone, start_date, end_date')
          .eq('id', otherTaskId)
          .single();

        if (!otherTask) continue;

        const otherDate = otherTask.is_milestone 
          ? new Date(otherTask.start_date)
          : new Date(otherTask.end_date);

        // Check dependency constraints
        if (dep.link_type === 'finish-to-start') {
          if (milestoneDate <= otherDate) {
            violations.push(`Violates finish-to-start dependency with "${otherTask.name}"`);
          }
        } else if (dep.link_type === 'start-to-start') {
          if (milestoneDate < otherDate) {
            violations.push(`Violates start-to-start dependency with "${otherTask.name}"`);
          }
        }
        // Add more dependency type checks as needed
      }

      return violations;

    } catch (error) {
      console.error('Error checking milestone dependencies:', error);
      return [];
    }
  }

  /**
   * Get milestone color based on status and custom settings
   */
  getMilestoneColor(milestone: Milestone): string {
    // Return demo color if in demo mode
    if (milestone.demoMode || milestone.demo || this.isDemoMode) {
      return '#ec4899'; // Pink for demo
    }

    // Return critical color if milestone is critical
    if (milestone.isCritical || milestone.critical || milestone.priority === 'critical') {
      return '#ef4444'; // Red
    }

    // Return status-based color
    switch (milestone.status) {
      case 'completed':
        return '#10b981'; // Green
      case 'cancelled':
        return '#6b7280'; // Gray
      case 'on-hold':
        return '#f59e0b'; // Yellow
      case 'in-progress':
        return '#3b82f6'; // Blue
      case 'not-started':
      default:
        return '#3b82f6'; // Blue
    }
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
  async isInDemoMode(): Promise<boolean> {
    await this.checkDemoMode();
    return this.isDemoMode;
  }
}

// Export singleton instance
export const milestoneService = new MilestoneService(); 