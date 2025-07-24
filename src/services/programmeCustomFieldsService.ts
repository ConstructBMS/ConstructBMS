import { supabase } from './supabase';
import { demoModeService } from './demoModeService';

export interface ProgrammeCustomField {
  createdAt: Date;
  createdBy: string;
  demo: boolean;
  id: string;
  isRequired: boolean;
  isVisibleInGrid: boolean;
  isVisibleInModal: boolean;
  label: string;
  options?: string[];
  projectId: string;
  type: 'text' | 'number' | 'date' | 'dropdown';
  updatedAt: Date;
}

export interface ProgrammeTaskCustomValue {
  createdAt: Date;
  customFieldId: string;
  id: string;
  taskId: string;
  updatedAt: Date;
  value: string;
}

export interface CustomFieldWithValue extends ProgrammeCustomField {
  value?: string;
}

class ProgrammeCustomFieldsService {
  private readonly maxDemoFields = 2;

  /**
   * Get all custom fields for a project
   */
  async getProjectCustomFields(projectId: string): Promise<ProgrammeCustomField[]> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      const { data, error } = await supabase
        .from('programme_custom_fields')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching custom fields:', error);
        return [];
      }

      const fields = data.map(this.mapDatabaseToCustomField);
      
      // Demo mode restrictions
      if (isDemoMode) {
        return fields
          .filter(field => field.demo)
          .filter(field => field.type === 'text' || field.type === 'dropdown')
          .slice(0, this.maxDemoFields);
      }

      return fields;
    } catch (error) {
      console.error('Error getting project custom fields:', error);
      return [];
    }
  }

  /**
   * Get visible custom fields for a project
   */
  async getVisibleProjectCustomFields(projectId: string): Promise<ProgrammeCustomField[]> {
    try {
      const fields = await this.getProjectCustomFields(projectId);
      return fields.filter(field => field.isVisibleInModal);
    } catch (error) {
      console.error('Error getting visible custom fields:', error);
      return [];
    }
  }

  /**
   * Get custom fields visible in grid for a project
   */
  async getGridVisibleCustomFields(projectId: string): Promise<ProgrammeCustomField[]> {
    try {
      const fields = await this.getProjectCustomFields(projectId);
      return fields.filter(field => field.isVisibleInGrid);
    } catch (error) {
      console.error('Error getting grid visible custom fields:', error);
      return [];
    }
  }

  /**
   * Create a new custom field
   */
  async createCustomField(field: Omit<ProgrammeCustomField, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ error?: string; field?: ProgrammeCustomField, success: boolean; }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      // Demo mode restrictions
      if (isDemoMode) {
        const existingFields = await this.getProjectCustomFields(field.projectId);
        if (existingFields.length >= this.maxDemoFields) {
          return { success: false, error: 'Maximum 2 custom fields allowed in demo mode' };
        }
        
        if (field.type !== 'text' && field.type !== 'dropdown') {
          return { success: false, error: 'Only text and dropdown types allowed in demo mode' };
        }
      }

      const { data, error } = await supabase
        .from('programme_custom_fields')
        .insert([this.mapCustomFieldToDatabase(field)])
        .select()
        .single();

      if (error) {
        console.error('Error creating custom field:', error);
        return { success: false, error: error.message };
      }

      const createdField = this.mapDatabaseToCustomField(data);
      console.log('Custom field created:', createdField.label);
      return { success: true, field: createdField };
    } catch (error) {
      console.error('Error creating custom field:', error);
      return { success: false, error: 'Failed to create custom field' };
    }
  }

  /**
   * Update a custom field
   */
  async updateCustomField(fieldId: string, updates: Partial<ProgrammeCustomField>): Promise<{ error?: string; field?: ProgrammeCustomField, success: boolean; }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      // Demo mode restrictions
      if (isDemoMode && updates.type && updates.type !== 'text' && updates.type !== 'dropdown') {
        return { success: false, error: 'Only text and dropdown types allowed in demo mode' };
      }

      const { data, error } = await supabase
        .from('programme_custom_fields')
        .update(this.mapCustomFieldToDatabase(updates))
        .eq('id', fieldId)
        .select()
        .single();

      if (error) {
        console.error('Error updating custom field:', error);
        return { success: false, error: error.message };
      }

      const updatedField = this.mapDatabaseToCustomField(data);
      console.log('Custom field updated:', updatedField.label);
      return { success: true, field: updatedField };
    } catch (error) {
      console.error('Error updating custom field:', error);
      return { success: false, error: 'Failed to update custom field' };
    }
  }

  /**
   * Delete a custom field
   */
  async deleteCustomField(fieldId: string): Promise<{ error?: string, success: boolean; }> {
    try {
      const { error } = await supabase
        .from('programme_custom_fields')
        .delete()
        .eq('id', fieldId);

      if (error) {
        console.error('Error deleting custom field:', error);
        return { success: false, error: error.message };
      }

      console.log('Custom field deleted:', fieldId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting custom field:', error);
      return { success: false, error: 'Failed to delete custom field' };
    }
  }

  /**
   * Get custom field values for a task
   */
  async getTaskCustomFieldValues(taskId: string): Promise<CustomFieldWithValue[]> {
    try {
      const { data, error } = await supabase
        .from('programme_task_custom_values')
        .select(`
          *,
          programme_custom_fields (*)
        `)
        .eq('task_id', taskId);

      if (error) {
        console.error('Error fetching task custom field values:', error);
        return [];
      }

      return data.map(item => ({
        ...this.mapDatabaseToCustomField(item.programme_custom_fields),
        value: item.value
      }));
    } catch (error) {
      console.error('Error getting task custom field values:', error);
      return [];
    }
  }

  /**
   * Save a custom field value for a task
   */
  async saveTaskCustomFieldValue(taskId: string, customFieldId: string, value: string): Promise<{ error?: string, success: boolean; }> {
    try {
      const { error } = await supabase
        .from('programme_task_custom_values')
        .upsert({
          task_id: taskId,
          custom_field_id: customFieldId,
          value: value
        });

      if (error) {
        console.error('Error saving task custom field value:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving task custom field value:', error);
      return { success: false, error: 'Failed to save custom field value' };
    }
  }

  /**
   * Delete a custom field value for a task
   */
  async deleteTaskCustomFieldValue(taskId: string, customFieldId: string): Promise<{ error?: string, success: boolean; }> {
    try {
      const { error } = await supabase
        .from('programme_task_custom_values')
        .delete()
        .eq('task_id', taskId)
        .eq('custom_field_id', customFieldId);

      if (error) {
        console.error('Error deleting task custom field value:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting task custom field value:', error);
      return { success: false, error: 'Failed to delete custom field value' };
    }
  }

  /**
   * Get field type display name
   */
  getFieldTypeDisplayName(type: string): string {
    const labels = {
      text: 'Text',
      number: 'Number',
      date: 'Date',
      dropdown: 'Dropdown'
    };
    return labels[type as keyof typeof labels] || type;
  }

  /**
   * Validate custom field
   */
  validateCustomField(field: Partial<ProgrammeCustomField>): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];

    if (!field.label || field.label.trim().length === 0) {
      errors.push('Field label is required');
    }

    if (!field.type || !['text', 'number', 'date', 'dropdown'].includes(field.type)) {
      errors.push('Valid field type is required');
    }

    if (field.type === 'dropdown' && (!field.options || field.options.length === 0)) {
      errors.push('Dropdown fields must have at least one option');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Map database record to custom field object
   */
  private mapDatabaseToCustomField(data: any): ProgrammeCustomField {
    return {
      id: data.id,
      projectId: data.project_id,
      label: data.label,
      type: data.type,
      options: data.options || [],
      createdBy: data.created_by,
      isRequired: data.is_required,
      isVisibleInGrid: data.is_visible_in_grid,
      isVisibleInModal: data.is_visible_in_modal,
      demo: data.demo,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  /**
   * Map custom field object to database record
   */
  private mapCustomFieldToDatabase(field: Partial<ProgrammeCustomField>): any {
    const record: any = {};
    
    if (field.projectId !== undefined) record.project_id = field.projectId;
    if (field.label !== undefined) record.label = field.label;
    if (field.type !== undefined) record.type = field.type;
    if (field.options !== undefined) record.options = field.options;
    if (field.createdBy !== undefined) record.created_by = field.createdBy;
    if (field.isRequired !== undefined) record.is_required = field.isRequired;
    if (field.isVisibleInGrid !== undefined) record.is_visible_in_grid = field.isVisibleInGrid;
    if (field.isVisibleInModal !== undefined) record.is_visible_in_modal = field.isVisibleInModal;
    if (field.demo !== undefined) record.demo = field.demo;
    
    return record;
  }
}

export const programmeCustomFieldsService = new ProgrammeCustomFieldsService(); 