import { persistentStorage } from './persistentStorage';
import type { CustomField, FieldTemplate } from '../components/modules/ribbonTabs/FieldTemplateDropdown';

export interface PropertiesResult {
  data?: any;
  errors: string[];
  success: boolean;
}

export interface FieldValueResult {
  errors: string[];
  fieldId: string;
  success: boolean;
  taskId: string;
  value: any;
}

export class PropertiesService {
  /**
   * Get custom fields for a project
   */
  static async getCustomFields(projectId: string = 'demo'): Promise<CustomField[]> {
    try {
      const customFields = await persistentStorage.getSetting(`customFields_${projectId}`, 'properties') || [];
      return customFields;
    } catch (error) {
      console.error('Failed to get custom fields:', error);
      return [];
    }
  }

  /**
   * Save custom fields for a project
   */
  static async saveCustomFields(
    fields: CustomField[],
    projectId: string = 'demo'
  ): Promise<PropertiesResult> {
    try {
      await persistentStorage.setSetting(`customFields_${projectId}`, fields, 'properties');
      
      if (projectId.includes('demo')) {
        console.log('Demo custom fields saved:', fields.length, 'fields');
      }

      return {
        success: true,
        data: fields,
        errors: []
      };
    } catch (error) {
      console.error('Failed to save custom fields:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get field templates
   */
  static async getFieldTemplates(projectId: string = 'demo'): Promise<FieldTemplate[]> {
    try {
      const templates = await persistentStorage.getSetting(`fieldTemplates_${projectId}`, 'properties') || [];
      return templates;
    } catch (error) {
      console.error('Failed to get field templates:', error);
      return [];
    }
  }

  /**
   * Save field template
   */
  static async saveFieldTemplate(
    template: Omit<FieldTemplate, 'id'>,
    projectId: string = 'demo'
  ): Promise<PropertiesResult> {
    try {
      const templates = await this.getFieldTemplates(projectId);
      const newTemplate: FieldTemplate = {
        ...template,
        id: `template_${Date.now()}`
      };
      
      const updatedTemplates = [...templates, newTemplate];
      await persistentStorage.setSetting(`fieldTemplates_${projectId}`, updatedTemplates, 'properties');
      
      if (projectId.includes('demo')) {
        console.log('Demo field template saved:', newTemplate.name);
      }

      return {
        success: true,
        data: newTemplate,
        errors: []
      };
    } catch (error) {
      console.error('Failed to save field template:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Apply field template to project
   */
  static async applyFieldTemplate(
    template: FieldTemplate,
    projectId: string = 'demo'
  ): Promise<PropertiesResult> {
    try {
      const existingFields = await this.getCustomFields(projectId);
      
      // Check for field ID conflicts
      const conflictingFields = existingFields.filter(field => 
        template.fields.some(templateField => templateField.id === field.id)
      );

      if (conflictingFields.length > 0) {
        const confirmed = window.confirm(
          `Template contains ${conflictingFields.length} field(s) that already exist. Do you want to replace them?`
        );
        
        if (!confirmed) {
          return {
            success: false,
            errors: ['Template application cancelled by user']
          };
        }
      }

      // Merge fields, replacing conflicts
      const templateFieldIds = new Set(template.fields.map(f => f.id));
      const nonConflictingFields = existingFields.filter(field => !templateFieldIds.has(field.id));
      const mergedFields = [...nonConflictingFields, ...template.fields];

      await this.saveCustomFields(mergedFields, projectId);
      
      if (projectId.includes('demo')) {
        console.log('Demo field template applied:', template.name, 'added', template.fields.length, 'fields');
      }

      return {
        success: true,
        data: mergedFields,
        errors: []
      };
    } catch (error) {
      console.error('Failed to apply field template:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get field values for tasks
   */
  static async getTaskFieldValues(
    taskIds: string[],
    projectId: string = 'demo'
  ): Promise<Record<string, Record<string, any>>> {
    try {
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const fieldValues: Record<string, Record<string, any>> = {};

      for (const taskId of taskIds) {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.customProperties) {
          fieldValues[taskId] = { ...task.customProperties };
        } else {
          fieldValues[taskId] = {};
        }
      }

      return fieldValues;
    } catch (error) {
      console.error('Failed to get task field values:', error);
      return {};
    }
  }

  /**
   * Update field value for a task
   */
  static async updateFieldValue(
    taskId: string,
    fieldId: string,
    value: any,
    projectId: string = 'demo'
  ): Promise<FieldValueResult> {
    try {
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      const taskIndex = tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        return {
          success: false,
          taskId,
          fieldId,
          value,
          errors: ['Task not found']
        };
      }

      // Update task's custom properties
      if (!tasks[taskIndex].customProperties) {
        tasks[taskIndex].customProperties = {};
      }

      tasks[taskIndex].customProperties[fieldId] = value;
      tasks[taskIndex].demo = projectId.includes('demo');

      await persistentStorage.setSetting(`tasks_${projectId}`, tasks, 'tasks');
      
      if (projectId.includes('demo')) {
        console.log('Demo field value updated:', taskId, fieldId, value);
      }

      return {
        success: true,
        taskId,
        fieldId,
        value,
        errors: []
      };
    } catch (error) {
      console.error('Failed to update field value:', error);
      return {
        success: false,
        taskId,
        fieldId,
        value,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Batch update field values for multiple tasks
   */
  static async batchUpdateFieldValues(
    updates: Array<{ fieldId: string; taskId: string; value: any }>,
    projectId: string = 'demo'
  ): Promise<PropertiesResult> {
    try {
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      let updatedCount = 0;
      const errors: string[] = [];

      for (const update of updates) {
        const taskIndex = tasks.findIndex(t => t.id === update.taskId);
        
        if (taskIndex === -1) {
          errors.push(`Task ${update.taskId} not found`);
          continue;
        }

        // Update task's custom properties
        if (!tasks[taskIndex].customProperties) {
          tasks[taskIndex].customProperties = {};
        }

        tasks[taskIndex].customProperties[update.fieldId] = update.value;
        tasks[taskIndex].demo = projectId.includes('demo');
        updatedCount++;
      }

      await persistentStorage.setSetting(`tasks_${projectId}`, tasks, 'tasks');
      
      if (projectId.includes('demo')) {
        console.log('Demo batch field values updated:', updatedCount, 'updates');
      }

      return {
        success: true,
        data: { updatedCount, errors },
        errors
      };
    } catch (error) {
      console.error('Failed to batch update field values:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Delete custom field and remove all its values
   */
  static async deleteCustomField(
    fieldId: string,
    projectId: string = 'demo'
  ): Promise<PropertiesResult> {
    try {
      // Remove field from custom fields
      const customFields = await this.getCustomFields(projectId);
      const updatedFields = customFields.filter(field => field.id !== fieldId);
      await this.saveCustomFields(updatedFields, projectId);

      // Remove field values from all tasks
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      let tasksUpdated = 0;

      for (const task of tasks) {
        if (task.customProperties && task.customProperties[fieldId] !== undefined) {
          delete task.customProperties[fieldId];
          task.demo = projectId.includes('demo');
          tasksUpdated++;
        }
      }

      await persistentStorage.setSetting(`tasks_${projectId}`, tasks, 'tasks');
      
      if (projectId.includes('demo')) {
        console.log('Demo custom field deleted:', fieldId, 'removed from', tasksUpdated, 'tasks');
      }

      return {
        success: true,
        data: { tasksUpdated },
        errors: []
      };
    } catch (error) {
      console.error('Failed to delete custom field:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get properties statistics
   */
  static async getPropertiesStatistics(projectId: string = 'demo'): Promise<{
    demoFields: number;
    demoTemplates: number;
    fieldsByType: Record<string, number>;
    totalCustomFields: number;
    totalTemplates: number;
  }> {
    try {
      const customFields = await this.getCustomFields(projectId);
      const templates = await this.getFieldTemplates(projectId);

      const fieldsByType: Record<string, number> = {
        string: 0,
        number: 0,
        date: 0,
        boolean: 0,
        dropdown: 0
      };

      let demoFields = 0;
      let demoTemplates = 0;

      for (const field of customFields) {
        fieldsByType[field.type]++;
        if (field.demo) demoFields++;
      }

      for (const template of templates) {
        if (template.demo) demoTemplates++;
      }

      return {
        totalCustomFields: customFields.length,
        totalTemplates: templates.length,
        fieldsByType,
        demoFields,
        demoTemplates
      };
    } catch (error) {
      console.error('Failed to get properties statistics:', error);
      return {
        totalCustomFields: 0,
        totalTemplates: 0,
        fieldsByType: {
          string: 0,
          number: 0,
          date: 0,
          boolean: 0,
          dropdown: 0
        },
        demoFields: 0,
        demoTemplates: 0
      };
    }
  }

  /**
   * Clear all demo properties
   */
  static async clearDemoProperties(projectId: string = 'demo'): Promise<PropertiesResult> {
    try {
      // Clear demo custom fields
      const customFields = await this.getCustomFields(projectId);
      const liveFields = customFields.filter(field => !field.demo);
      await this.saveCustomFields(liveFields, projectId);

      // Clear demo templates
      const templates = await this.getFieldTemplates(projectId);
      const liveTemplates = templates.filter(template => !template.demo);
      await persistentStorage.setSetting(`fieldTemplates_${projectId}`, liveTemplates, 'properties');

      // Clear demo field values from tasks
      const tasks = await persistentStorage.getSetting(`tasks_${projectId}`, 'tasks') || [];
      let tasksUpdated = 0;

      for (const task of tasks) {
        if (task.customProperties) {
          const originalLength = Object.keys(task.customProperties).length;
          const liveProperties: Record<string, any> = {};
          
          for (const [fieldId, value] of Object.entries(task.customProperties)) {
            const field = liveFields.find(f => f.id === fieldId);
            if (field) {
              liveProperties[fieldId] = value;
            }
          }
          
          task.customProperties = liveProperties;
          if (Object.keys(liveProperties).length !== originalLength) {
            tasksUpdated++;
          }
        }
      }

      await persistentStorage.setSetting(`tasks_${projectId}`, tasks, 'tasks');

      console.log('Demo properties cleared:', 
        customFields.length - liveFields.length, 'fields,',
        templates.length - liveTemplates.length, 'templates,',
        tasksUpdated, 'tasks updated'
      );

      return {
        success: true,
        data: {
          fieldsRemoved: customFields.length - liveFields.length,
          templatesRemoved: templates.length - liveTemplates.length,
          tasksUpdated
        },
        errors: []
      };
    } catch (error) {
      console.error('Failed to clear demo properties:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Export properties data
   */
  static async exportPropertiesData(projectId: string = 'demo'): Promise<{
    customFields: CustomField[];
    exportDate: string;
    statistics: any;
    templates: FieldTemplate[];
  }> {
    try {
      const customFields = await this.getCustomFields(projectId);
      const templates = await this.getFieldTemplates(projectId);
      const statistics = await this.getPropertiesStatistics(projectId);

      return {
        customFields,
        templates,
        statistics,
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to export properties data:', error);
      return {
        customFields: [],
        templates: [],
        statistics: {
          totalCustomFields: 0,
          totalTemplates: 0,
          fieldsByType: {
            string: 0,
            number: 0,
            date: 0,
            boolean: 0,
            dropdown: 0
          },
          demoFields: 0,
          demoTemplates: 0
        },
        exportDate: new Date().toISOString()
      };
    }
  }

  /**
   * Validate custom field
   */
  static validateCustomField(field: Partial<CustomField>): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];

    if (!field.label || field.label.trim() === '') {
      errors.push('Field label is required');
    }

    if (!field.type) {
      errors.push('Field type is required');
    } else {
      const validTypes: CustomField['type'][] = ['string', 'number', 'date', 'boolean', 'dropdown'];
      if (!validTypes.includes(field.type)) {
        errors.push('Invalid field type');
      }
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
   * Validate field template
   */
  static validateFieldTemplate(template: Partial<FieldTemplate>): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];

    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required');
    }

    if (!template.fields || template.fields.length === 0) {
      errors.push('Template must contain at least one field');
    } else {
      for (const field of template.fields) {
        const fieldValidation = this.validateCustomField(field);
        if (!fieldValidation.isValid) {
          errors.push(`Field "${field.label}": ${fieldValidation.errors.join(', ')}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 