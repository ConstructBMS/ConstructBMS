import { persistentStorage } from './persistentStorage';
import { demoModeService } from './demoModeService';

export interface ProjectCustomField {
  createdAt: Date;
  demo?: boolean;
  id: string;
  isRequired: boolean;
  isVisible: boolean;
  name: string;
  options?: string[];
  projectId: string;
  type: 'text' | 'number' | 'date' | 'dropdown';
  updatedAt: Date;
  userId: string;
}

export interface TaskCustomField {
  createdAt: Date;
  demo?: boolean;
  fieldId: string;
  id: string;
  taskId: string;
  updatedAt: Date;
  userId: string;
  value: string | number | Date | null;
}

export interface CustomFieldValue {
  fieldId: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'dropdown';
  isRequired: boolean;
  options?: string[];
  value: string | number | Date | null;
}

class CustomFieldsService {
  private readonly projectCustomFieldsKey = 'project_custom_fields';
  private readonly taskCustomFieldsKey = 'task_custom_fields';
  private readonly maxDemoFields = 3;

  /**
   * Get all custom field definitions for a project
   */
  async getProjectCustomFields(projectId: string): Promise<ProjectCustomField[]> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      const allFields = await this.getAllProjectCustomFields();
      
      let projectFields = allFields.filter(field => field.projectId === projectId);
      
      // Demo mode: limit to max fields and only allow text/dropdown types
      if (isDemoMode) {
        projectFields = projectFields
          .filter(field => field.type === 'text' || field.type === 'dropdown')
          .slice(0, this.maxDemoFields);
      }
      
      return projectFields;
    } catch (error) {
      console.error('Error getting project custom fields:', error);
      return [];
    }
  }

  /**
   * Get visible custom field definitions for a project
   */
  async getVisibleProjectCustomFields(projectId: string): Promise<ProjectCustomField[]> {
    try {
      const fields = await this.getProjectCustomFields(projectId);
      return fields.filter(field => field.isVisible);
    } catch (error) {
      console.error('Error getting visible project custom fields:', error);
      return [];
    }
  }

  /**
   * Create a new custom field definition
   */
  async createProjectCustomField(field: Omit<ProjectCustomField, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ error?: string; field?: ProjectCustomField, success: boolean; }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      // Demo mode restrictions
      if (isDemoMode) {
        const existingFields = await this.getProjectCustomFields(field.projectId);
        if (existingFields.length >= this.maxDemoFields) {
          return { success: false, error: 'Maximum 3 custom fields allowed in demo mode' };
        }
        
        if (field.type !== 'text' && field.type !== 'dropdown') {
          return { success: false, error: 'Only text and dropdown types allowed in demo mode' };
        }
      }
      
      const newField: ProjectCustomField = {
        ...field,
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        demo: isDemoMode
      };
      
      const allFields = await this.getAllProjectCustomFields();
      allFields.push(newField);
      
      await persistentStorage.set(this.projectCustomFieldsKey, allFields);
      
      console.log('Custom field created:', newField.name);
      return { success: true, field: newField };
    } catch (error) {
      console.error('Error creating project custom field:', error);
      return { success: false, error: 'Failed to create custom field' };
    }
  }

  /**
   * Update a custom field definition
   */
  async updateProjectCustomField(fieldId: string, updates: Partial<ProjectCustomField>): Promise<{ error?: string, success: boolean; }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      // Demo mode: no editing of field definitions
      if (isDemoMode) {
        return { success: false, error: 'Cannot edit field definitions in demo mode' };
      }
      
      const allFields = await this.getAllProjectCustomFields();
      const fieldIndex = allFields.findIndex(field => field.id === fieldId);
      
      if (fieldIndex === -1) {
        return { success: false, error: 'Custom field not found' };
      }
      
      allFields[fieldIndex] = {
        ...allFields[fieldIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      await persistentStorage.set(this.projectCustomFieldsKey, allFields);
      
      console.log('Custom field updated:', fieldId);
      return { success: true };
    } catch (error) {
      console.error('Error updating project custom field:', error);
      return { success: false, error: 'Failed to update custom field' };
    }
  }

  /**
   * Delete a custom field definition
   */
  async deleteProjectCustomField(fieldId: string): Promise<{ error?: string, success: boolean; }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      
      // Demo mode: no deletion of field definitions
      if (isDemoMode) {
        return { success: false, error: 'Cannot delete field definitions in demo mode' };
      }
      
      const allFields = await this.getAllProjectCustomFields();
      const filteredFields = allFields.filter(field => field.id !== fieldId);
      
      await persistentStorage.set(this.projectCustomFieldsKey, filteredFields);
      
      // Also delete all task custom field values for this field
      await this.deleteTaskCustomFieldsByFieldId(fieldId);
      
      console.log('Custom field deleted:', fieldId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting project custom field:', error);
      return { success: false, error: 'Failed to delete custom field' };
    }
  }

  /**
   * Get custom field values for a task
   */
  async getTaskCustomFields(taskId: string): Promise<TaskCustomField[]> {
    try {
      const allTaskFields = await this.getAllTaskCustomFields();
      return allTaskFields.filter(field => field.taskId === taskId);
    } catch (error) {
      console.error('Error getting task custom fields:', error);
      return [];
    }
  }

  /**
   * Get custom field values with field definitions for a task
   */
  async getTaskCustomFieldValues(taskId: string, projectId: string): Promise<CustomFieldValue[]> {
    try {
      const [taskFields, projectFields] = await Promise.all([
        this.getTaskCustomFields(taskId),
        this.getVisibleProjectCustomFields(projectId)
      ]);
      
      return projectFields.map(projectField => {
        const taskField = taskFields.find(tf => tf.fieldId === projectField.id);
        return {
          fieldId: projectField.id,
          fieldName: projectField.name,
          fieldType: projectField.type,
          value: taskField?.value || null,
          isRequired: projectField.isRequired,
          options: projectField.options
        };
      });
    } catch (error) {
      console.error('Error getting task custom field values:', error);
      return [];
    }
  }

  /**
   * Save a custom field value for a task
   */
  async saveTaskCustomField(taskId: string, fieldId: string, value: string | number | Date | null): Promise<{ error?: string, success: boolean; }> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      const allTaskFields = await this.getAllTaskCustomFields();
      
      // Find existing field value
      const existingIndex = allTaskFields.findIndex(field => field.taskId === taskId && field.fieldId === fieldId);
      
      if (existingIndex >= 0) {
        // Update existing value
        allTaskFields[existingIndex] = {
          ...allTaskFields[existingIndex],
          value,
          updatedAt: new Date()
        };
      } else {
        // Create new field value
        const newTaskField: TaskCustomField = {
          id: `task_field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          taskId,
          fieldId,
          value,
          userId: 'current-user',
          createdAt: new Date(),
          updatedAt: new Date(),
          demo: isDemoMode
        };
        allTaskFields.push(newTaskField);
      }
      
      await persistentStorage.set(this.taskCustomFieldsKey, allTaskFields);
      
      console.log('Task custom field saved:', fieldId, value);
      return { success: true };
    } catch (error) {
      console.error('Error saving task custom field:', error);
      return { success: false, error: 'Failed to save custom field value' };
    }
  }

  /**
   * Delete all custom field values for a task
   */
  async deleteTaskCustomFields(taskId: string): Promise<{ error?: string, success: boolean; }> {
    try {
      const allTaskFields = await this.getAllTaskCustomFields();
      const filteredFields = allTaskFields.filter(field => field.taskId !== taskId);
      
      await persistentStorage.set(this.taskCustomFieldsKey, filteredFields);
      
      console.log('Task custom fields deleted for task:', taskId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting task custom fields:', error);
      return { success: false, error: 'Failed to delete task custom fields' };
    }
  }

  /**
   * Delete all custom field values for a specific field definition
   */
  async deleteTaskCustomFieldsByFieldId(fieldId: string): Promise<{ error?: string, success: boolean; }> {
    try {
      const allTaskFields = await this.getAllTaskCustomFields();
      const filteredFields = allTaskFields.filter(field => field.fieldId !== fieldId);
      
      await persistentStorage.set(this.taskCustomFieldsKey, filteredFields);
      
      console.log('Task custom fields deleted for field:', fieldId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting task custom fields by field ID:', error);
      return { success: false, error: 'Failed to delete task custom fields' };
    }
  }

  /**
   * Get custom field count for a project
   */
  async getProjectCustomFieldCount(projectId: string): Promise<number> {
    try {
      const fields = await this.getProjectCustomFields(projectId);
      return fields.length;
    } catch (error) {
      console.error('Error getting project custom field count:', error);
      return 0;
    }
  }

  /**
   * Validate custom field value
   */
  validateCustomFieldValue(field: ProjectCustomField, value: any): { error?: string, isValid: boolean; } {
    // Required field validation
    if (field.isRequired && (value === null || value === undefined || value === '')) {
      return { isValid: false, error: `${field.name} is required` };
    }
    
    // Type-specific validation
    switch (field.type) {
      case 'number':
        if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
          return { isValid: false, error: `${field.name} must be a number` };
        }
        break;
      case 'date':
        if (value !== null && value !== undefined && value !== '') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return { isValid: false, error: `${field.name} must be a valid date` };
          }
        }
        break;
      case 'dropdown':
        if (value !== null && value !== undefined && value !== '' && field.options && !field.options.includes(value)) {
          return { isValid: false, error: `${field.name} must be one of the available options` };
        }
        break;
    }
    
    return { isValid: true };
  }

  /**
   * Get field type display name
   */
  getFieldTypeDisplayName(type: string): string {
    switch (type) {
      case 'text': return 'Text';
      case 'number': return 'Number';
      case 'date': return 'Date';
      case 'dropdown': return 'Dropdown';
      default: return type;
    }
  }

  /**
   * Get field type description
   */
  getFieldTypeDescription(type: string): string {
    switch (type) {
      case 'text': return 'Single line text input';
      case 'number': return 'Numeric value input';
      case 'date': return 'Date picker input';
      case 'dropdown': return 'Select from predefined options';
      default: return 'Unknown field type';
    }
  }

  /**
   * Get all project custom fields
   */
  private async getAllProjectCustomFields(): Promise<ProjectCustomField[]> {
    try {
      const fields = await persistentStorage.get(this.projectCustomFieldsKey);
      return fields || [];
    } catch (error) {
      console.error('Error getting all project custom fields:', error);
      return [];
    }
  }

  /**
   * Get all task custom fields
   */
  private async getAllTaskCustomFields(): Promise<TaskCustomField[]> {
    try {
      const fields = await persistentStorage.get(this.taskCustomFieldsKey);
      return fields || [];
    } catch (error) {
      console.error('Error getting all task custom fields:', error);
      return [];
    }
  }

  /**
   * Clear all custom fields data (for demo mode reset)
   */
  async clearAllCustomFieldsData(): Promise<void> {
    try {
      await persistentStorage.remove(this.projectCustomFieldsKey);
      await persistentStorage.remove(this.taskCustomFieldsKey);
      console.log('All custom fields data cleared');
    } catch (error) {
      console.error('Error clearing custom fields data:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const isDemoMode = await demoModeService.isDemoMode();
      if (isDemoMode) {
        await this.clearAllCustomFieldsData();
        console.log('Demo custom fields data reset');
      }
    } catch (error) {
      console.error('Error resetting demo custom fields data:', error);
      throw error;
    }
  }
}

export const customFieldsService = new CustomFieldsService(); 