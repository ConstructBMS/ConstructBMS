import { supabase } from './supabase';
import { demoModeService } from './demoModeService';

export interface ProgrammeTag {
  color: string;
  createdAt: Date;
  createdBy?: string;
  demo?: boolean;
  id: string;
  isGlobal: boolean;
  label: string;
  projectId?: string;
  updatedAt: Date;
}

export interface CreateTagData {
  color: string;
  isGlobal?: boolean;
  label: string;
  projectId: string;
}

export interface UpdateTagData {
  color?: string;
  label?: string;
}

class TaskTagsService {
  private isDemoMode = false;

  constructor() {
    this.checkDemoMode();
  }

  private async checkDemoMode() {
    this.isDemoMode = await demoModeService.isDemoMode();
  }

  /**
   * Get all tags for a project
   */
  async getProjectTags(projectId: string): Promise<ProgrammeTag[]> {
    try {
      await this.checkDemoMode();

      const { data, error } = await supabase
        .from('programme_tags')
        .select('*')
        .or(`project_id.eq.${projectId},is_global.eq.true`)
        .eq('demo', this.isDemoMode)
        .order('label');

      if (error) throw error;

      return data?.map(this.mapDatabaseTagToTag) || [];
    } catch (error) {
      console.error('Error fetching project tags:', error);
      return [];
    }
  }

  /**
   * Get a single tag by ID
   */
  async getTag(tagId: string): Promise<ProgrammeTag | null> {
    try {
      const { data, error } = await supabase
        .from('programme_tags')
        .select('*')
        .eq('id', tagId)
        .single();

      if (error) throw error;

      return data ? this.mapDatabaseTagToTag(data) : null;
    } catch (error) {
      console.error('Error fetching tag:', error);
      return null;
    }
  }

  /**
   * Create a new tag
   */
  async createTag(tagData: CreateTagData): Promise<ProgrammeTag | null> {
    try {
      await this.checkDemoMode();

      // Demo mode restrictions
      if (this.isDemoMode) {
        const existingTags = await this.getProjectTags(tagData.projectId);
        if (existingTags.length >= 3) {
          throw new Error('Tag limit - Upgrade to add custom tags');
        }
      }

      const { data, error } = await supabase
        .from('programme_tags')
        .insert({
          label: tagData.label,
          color: tagData.color,
          project_id: tagData.projectId,
          is_global: tagData.isGlobal || false,
          demo: this.isDemoMode
        })
        .select()
        .single();

      if (error) throw error;

      return data ? this.mapDatabaseTagToTag(data) : null;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }

  /**
   * Update an existing tag
   */
  async updateTag(tagId: string, updateData: UpdateTagData): Promise<ProgrammeTag | null> {
    try {
      const updateFields: any = {};
      if (updateData.label) updateFields.label = updateData.label;
      if (updateData.color) updateFields.color = updateData.color;

      const { data, error } = await supabase
        .from('programme_tags')
        .update(updateFields)
        .eq('id', tagId)
        .select()
        .single();

      if (error) throw error;

      return data ? this.mapDatabaseTagToTag(data) : null;
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  }

  /**
   * Delete a tag
   */
  async deleteTag(tagId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('programme_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }

  /**
   * Get tags for a specific task
   */
  async getTaskTags(taskId: string): Promise<ProgrammeTag[]> {
    try {
      const { data, error } = await supabase
        .from('asta_tasks')
        .select(`
          tag_id,
          programme_tags (*)
        `)
        .eq('id', taskId)
        .single();

      if (error) throw error;

      if (data?.programme_tags) {
        return [this.mapDatabaseTagToTag(data.programme_tags)];
      }

      return [];
    } catch (error) {
      console.error('Error fetching task tags:', error);
      return [];
    }
  }

  /**
   * Assign a tag to a task
   */
  async assignTagToTask(taskId: string, tagId: string | null): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('asta_tasks')
        .update({ tag_id: tagId })
        .eq('id', taskId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error assigning tag to task:', error);
      throw error;
    }
  }

  /**
   * Get demo tags for testing
   */
  async getDemoTags(): Promise<ProgrammeTag[]> {
    return [
      {
        id: 'demo-1',
        label: 'Client Hold',
        color: '#ef4444',
        isGlobal: false,
        demo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'demo-2',
        label: 'Snagging',
        color: '#f59e0b',
        isGlobal: false,
        demo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'demo-3',
        label: 'Procurement',
        color: '#10b981',
        isGlobal: false,
        demo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Map database tag to ProgrammeTag interface
   */
  private mapDatabaseTagToTag(data: any): ProgrammeTag {
    return {
      id: data.id,
      label: data.label,
      color: data.color,
      createdBy: data.created_by,
      isGlobal: data.is_global,
      projectId: data.project_id,
      demo: data.demo,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  /**
   * Get available colors for tags
   */
  getAvailableColors(): string[] {
    return [
      '#ef4444', // red
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
      '#f97316', // orange
      '#6366f1'  // indigo
    ];
  }
}

export const taskTagsService = new TaskTagsService(); 