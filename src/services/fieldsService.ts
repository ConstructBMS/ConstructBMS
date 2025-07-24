import { persistentStorage } from './persistentStorage';
import type { FieldConfig } from '../components/modules/ribbonTabs/FieldsDropdown';

export interface FieldsState {
  visibleFields: string[];
  fieldOrder: string[];
}

export interface FieldsResult {
  success: boolean;
  fields: FieldConfig[];
  errors: string[];
}

export class FieldsService {
  private static readonly DEFAULT_FIELDS: FieldConfig[] = [
    { id: 'taskName', label: 'Task Name', isVisible: true, isRequired: true },
    { id: 'startDate', label: 'Start Date', isVisible: true },
    { id: 'endDate', label: 'End Date', isVisible: true },
    { id: 'duration', label: 'Duration', isVisible: true },
    { id: 'percentComplete', label: '% Complete', isVisible: true },
    { id: 'assignedResource', label: 'Assigned Resource', isVisible: false },
    { id: 'notes', label: 'Notes', isVisible: false },
    { id: 'taskId', label: 'Task ID', isVisible: false },
    { id: 'constraintType', label: 'Constraint Type', isVisible: false },
    { id: 'slack', label: 'Slack', isVisible: false }
  ];

  private static readonly DEFAULT_STATE: FieldsState = {
    visibleFields: ['taskName', 'startDate', 'endDate', 'duration', 'percentComplete'],
    fieldOrder: ['taskName', 'startDate', 'endDate', 'duration', 'percentComplete', 'assignedResource', 'notes', 'taskId', 'constraintType', 'slack']
  };

  /**
   * Get fields configuration for a project
   */
  static async getFieldsConfig(projectId: string = 'default'): Promise<FieldConfig[]> {
    try {
      const savedState = await persistentStorage.getSetting(`fields_${projectId}`, 'fields');
      
      if (savedState && typeof savedState === 'object' && 'visibleFields' in savedState) {
        const state = savedState as FieldsState;
        return this.DEFAULT_FIELDS.map(field => ({
          ...field,
          isVisible: state.visibleFields.includes(field.id)
        }));
      }
      
      return [...this.DEFAULT_FIELDS];
    } catch (error) {
      console.error('Failed to load fields config:', error);
      return [...this.DEFAULT_FIELDS];
    }
  }

  /**
   * Save fields configuration for a project
   */
  static async saveFieldsConfig(
    fields: FieldConfig[], 
    projectId: string = 'default'
  ): Promise<boolean> {
    try {
      const state: FieldsState = {
        visibleFields: fields.filter(field => field.isVisible).map(field => field.id),
        fieldOrder: fields.map(field => field.id)
      };
      
      await persistentStorage.setSetting(`fields_${projectId}`, state, 'fields');
      
      // Log demo state changes
      if (projectId.includes('demo')) {
        console.log('Demo fields config updated:', state);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save fields config:', error);
      return false;
    }
  }

  /**
   * Toggle field visibility
   */
  static async toggleField(
    fieldId: string, 
    projectId: string = 'default'
  ): Promise<{ success: boolean; fields: FieldConfig[] }> {
    try {
      const currentFields = await this.getFieldsConfig(projectId);
      const field = currentFields.find(f => f.id === fieldId);
      
      if (!field) {
        return {
          success: false,
          fields: currentFields
        };
      }

      // Don't allow toggling required fields
      if (field.isRequired) {
        return {
          success: false,
          fields: currentFields
        };
      }

      // Toggle the field visibility
      const updatedFields = currentFields.map(f => 
        f.id === fieldId ? { ...f, isVisible: !f.isVisible } : f
      );

      const success = await this.saveFieldsConfig(updatedFields, projectId);
      
      // Log demo state changes
      if (projectId.includes('demo')) {
        console.log('Demo field toggled:', fieldId, !field.isVisible);
      }

      return {
        success,
        fields: updatedFields
      };
    } catch (error) {
      console.error('Failed to toggle field:', error);
      return {
        success: false,
        fields: await this.getFieldsConfig(projectId)
      };
    }
  }

  /**
   * Show all fields
   */
  static async showAllFields(projectId: string = 'default'): Promise<{ success: boolean; fields: FieldConfig[] }> {
    try {
      const currentFields = await this.getFieldsConfig(projectId);
      const updatedFields = currentFields.map(field => ({
        ...field,
        isVisible: true
      }));

      const success = await this.saveFieldsConfig(updatedFields, projectId);
      
      // Log demo state changes
      if (projectId.includes('demo')) {
        console.log('Demo fields: show all');
      }

      return {
        success,
        fields: updatedFields
      };
    } catch (error) {
      console.error('Failed to show all fields:', error);
      return {
        success: false,
        fields: await this.getFieldsConfig(projectId)
      };
    }
  }

  /**
   * Hide all optional fields
   */
  static async hideAllFields(projectId: string = 'default'): Promise<{ success: boolean; fields: FieldConfig[] }> {
    try {
      const currentFields = await this.getFieldsConfig(projectId);
      const updatedFields = currentFields.map(field => ({
        ...field,
        isVisible: field.isRequired || false
      }));

      const success = await this.saveFieldsConfig(updatedFields, projectId);
      
      // Log demo state changes
      if (projectId.includes('demo')) {
        console.log('Demo fields: hide all optional');
      }

      return {
        success,
        fields: updatedFields
      };
    } catch (error) {
      console.error('Failed to hide all fields:', error);
      return {
        success: false,
        fields: await this.getFieldsConfig(projectId)
      };
    }
  }

  /**
   * Reset fields to default configuration
   */
  static async resetFields(projectId: string = 'default'): Promise<{ success: boolean; fields: FieldConfig[] }> {
    try {
      const success = await this.saveFieldsConfig(this.DEFAULT_FIELDS, projectId);
      
      // Log demo state changes
      if (projectId.includes('demo')) {
        console.log('Demo fields: reset to default');
      }

      return {
        success,
        fields: [...this.DEFAULT_FIELDS]
      };
    } catch (error) {
      console.error('Failed to reset fields:', error);
      return {
        success: false,
        fields: await this.getFieldsConfig(projectId)
      };
    }
  }

  /**
   * Get visible fields only
   */
  static async getVisibleFields(projectId: string = 'default'): Promise<FieldConfig[]> {
    const allFields = await this.getFieldsConfig(projectId);
    return allFields.filter(field => field.isVisible);
  }

  /**
   * Check if a field is visible
   */
  static async isFieldVisible(fieldId: string, projectId: string = 'default'): Promise<boolean> {
    const fields = await this.getFieldsConfig(projectId);
    const field = fields.find(f => f.id === fieldId);
    return field?.isVisible || false;
  }

  /**
   * Get field by ID
   */
  static async getField(fieldId: string, projectId: string = 'default'): Promise<FieldConfig | null> {
    const fields = await this.getFieldsConfig(projectId);
    return fields.find(f => f.id === fieldId) || null;
  }

  /**
   * Get all available field IDs
   */
  static getAvailableFieldIds(): string[] {
    return this.DEFAULT_FIELDS.map(field => field.id);
  }

  /**
   * Get field label by ID
   */
  static getFieldLabel(fieldId: string): string {
    const field = this.DEFAULT_FIELDS.find(f => f.id === fieldId);
    return field?.label || fieldId;
  }

  /**
   * Check if field is required
   */
  static isFieldRequired(fieldId: string): boolean {
    const field = this.DEFAULT_FIELDS.find(f => f.id === fieldId);
    return field?.isRequired || false;
  }

  /**
   * Get default field configuration
   */
  static getDefaultFields(): FieldConfig[] {
    return [...this.DEFAULT_FIELDS];
  }

  /**
   * Validate field configuration
   */
  static validateFieldsConfig(fields: FieldConfig[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if all required fields are present
    const requiredFields = this.DEFAULT_FIELDS.filter(field => field.isRequired);
    for (const requiredField of requiredFields) {
      const field = fields.find(f => f.id === requiredField.id);
      if (!field) {
        errors.push(`Required field "${requiredField.label}" is missing`);
      } else if (!field.isVisible) {
        errors.push(`Required field "${requiredField.label}" cannot be hidden`);
      }
    }

    // Check for duplicate field IDs
    const fieldIds = fields.map(field => field.id);
    const uniqueIds = new Set(fieldIds);
    if (fieldIds.length !== uniqueIds.size) {
      errors.push('Duplicate field IDs found');
    }

    // Check for unknown field IDs
    const availableIds = this.getAvailableFieldIds();
    for (const field of fields) {
      if (!availableIds.includes(field.id)) {
        errors.push(`Unknown field ID: ${field.id}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 