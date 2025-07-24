import { persistentStorage } from './persistentStorage';

export interface ProjectTag {
  id: string;
  projectId: string;
  tagName: string;
  tagColor: string;
  scope: 'global' | 'project';
  userId: string;
  demo?: boolean;
}

export interface TaskStatus {
  id: string;
  projectId: string;
  statusName: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  userId: string;
  demo?: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  demo?: boolean;
}

export interface CustomField {
  id: string;
  projectId: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'dropdown' | 'boolean';
  defaultValue?: any;
  required: boolean;
  order: number;
  options?: string[]; // For dropdown type
  userId: string;
  demo?: boolean;
}

export interface AdminTabConfig {
  enabled: boolean;
  maxTags: number;
  maxStatuses: number;
  maxThemes: number;
  maxCustomFields: number;
  demo?: boolean;
}

// Default ConstructBMS admin tab settings
const defaultConfig: AdminTabConfig = {
  enabled: true,
  maxTags: 20,
  maxStatuses: 10,
  maxThemes: 5,
  maxCustomFields: 15,
  demo: false
};

class AdminTabService {
  private configKey = 'adminTabConfig';
  private tagsKey = 'projectTags';
  private statusesKey = 'taskStatuses';
  private themesKey = 'themePresets';
  private customFieldsKey = 'customFields';

  // Default task statuses
  private defaultTaskStatuses: TaskStatus[] = [
    {
      id: 'not-started',
      projectId: 'system',
      statusName: 'Not Started',
      color: '#6B7280',
      icon: 'circle',
      isDefault: true,
      userId: 'system'
    },
    {
      id: 'in-progress',
      projectId: 'system',
      statusName: 'In Progress',
      color: '#3B82F6',
      icon: 'play',
      isDefault: false,
      userId: 'system'
    },
    {
      id: 'completed',
      projectId: 'system',
      statusName: 'Completed',
      color: '#10B981',
      icon: 'check',
      isDefault: false,
      userId: 'system'
    },
    {
      id: 'on-hold',
      projectId: 'system',
      statusName: 'On Hold',
      color: '#F59E0B',
      icon: 'pause',
      isDefault: false,
      userId: 'system'
    }
  ];

  // Default theme presets
  private defaultThemePresets: ThemePreset[] = [
    {
      id: 'default',
      name: 'Default',
      description: 'Standard ConstructBMS theme',
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#10B981',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827'
      }
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Dark mode theme',
      colors: {
        primary: '#60A5FA',
        secondary: '#9CA3AF',
        accent: '#34D399',
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB'
      }
    }
  ];

  /**
   * Get current configuration
   */
  async getConfig(): Promise<AdminTabConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || defaultConfig;
    } catch (error) {
      console.error('Error getting admin tab config:', error);
      return defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<AdminTabConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Admin tab config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating admin tab config:', error);
      throw error;
    }
  }

  /**
   * Get project tags
   */
  async getProjectTags(projectId: string): Promise<ProjectTag[]> {
    try {
      const config = await this.getConfig();
      const tags = await persistentStorage.get(`${this.tagsKey}_${projectId}`);
      
      if (tags) {
        return tags;
      }
      
      // Return empty array if none exist
      return [];
    } catch (error) {
      console.error('Error getting project tags:', error);
      return [];
    }
  }

  /**
   * Save project tags
   */
  async saveProjectTags(projectId: string, tags: ProjectTag[]): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Apply demo mode limits
      if (config.demo) {
        if (tags.length > 3) {
          throw new Error('Maximum 3 tags allowed in demo mode');
        }
      } else {
        if (tags.length > config.maxTags) {
          throw new Error(`Maximum ${config.maxTags} tags allowed`);
        }
      }
      
      // Tag all tags with demo flag
      const taggedTags = tags.map(tag => ({
        ...tag,
        demo: config.demo
      }));
      
      await persistentStorage.set(`${this.tagsKey}_${projectId}`, taggedTags);
      console.log('Project tags saved for project:', projectId);
    } catch (error) {
      console.error('Error saving project tags:', error);
      throw error;
    }
  }

  /**
   * Get task statuses
   */
  async getTaskStatuses(projectId: string): Promise<TaskStatus[]> {
    try {
      const config = await this.getConfig();
      const statuses = await persistentStorage.get(`${this.statusesKey}_${projectId}`);
      
      if (statuses) {
        return statuses;
      }
      
      // Return default statuses if none exist
      return this.defaultTaskStatuses;
    } catch (error) {
      console.error('Error getting task statuses:', error);
      return this.defaultTaskStatuses;
    }
  }

  /**
   * Save task statuses
   */
  async saveTaskStatuses(projectId: string, statuses: TaskStatus[]): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Apply demo mode limits
      if (config.demo) {
        if (statuses.length > 3) {
          throw new Error('Maximum 3 statuses allowed in demo mode');
        }
      } else {
        if (statuses.length > config.maxStatuses) {
          throw new Error(`Maximum ${config.maxStatuses} statuses allowed`);
        }
      }
      
      // Ensure only one default status
      const defaultCount = statuses.filter(status => status.isDefault).length;
      if (defaultCount !== 1) {
        throw new Error('Exactly one status must be marked as default');
      }
      
      // Tag all statuses with demo flag
      const taggedStatuses = statuses.map(status => ({
        ...status,
        demo: config.demo
      }));
      
      await persistentStorage.set(`${this.statusesKey}_${projectId}`, taggedStatuses);
      console.log('Task statuses saved for project:', projectId);
    } catch (error) {
      console.error('Error saving task statuses:', error);
      throw error;
    }
  }

  /**
   * Get theme presets
   */
  async getThemePresets(): Promise<ThemePreset[]> {
    try {
      const config = await this.getConfig();
      const presets = await persistentStorage.get(this.themesKey);
      
      if (presets) {
        return presets;
      }
      
      // Return default presets if none exist
      return this.defaultThemePresets;
    } catch (error) {
      console.error('Error getting theme presets:', error);
      return this.defaultThemePresets;
    }
  }

  /**
   * Save theme presets
   */
  async saveThemePresets(presets: ThemePreset[]): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Apply demo mode limits
      if (config.demo) {
        if (presets.length > 1) {
          throw new Error('Maximum 1 theme allowed in demo mode');
        }
      } else {
        if (presets.length > config.maxThemes) {
          throw new Error(`Maximum ${config.maxThemes} themes allowed`);
        }
      }
      
      // Tag all presets with demo flag
      const taggedPresets = presets.map(preset => ({
        ...preset,
        demo: config.demo
      }));
      
      await persistentStorage.set(this.themesKey, taggedPresets);
      console.log('Theme presets saved');
    } catch (error) {
      console.error('Error saving theme presets:', error);
      throw error;
    }
  }

  /**
   * Get custom fields
   */
  async getCustomFields(projectId: string): Promise<CustomField[]> {
    try {
      const config = await this.getConfig();
      const fields = await persistentStorage.get(`${this.customFieldsKey}_${projectId}`);
      
      if (fields) {
        return fields;
      }
      
      // Return empty array if none exist
      return [];
    } catch (error) {
      console.error('Error getting custom fields:', error);
      return [];
    }
  }

  /**
   * Save custom fields
   */
  async saveCustomFields(projectId: string, fields: CustomField[]): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Apply demo mode limits
      if (config.demo) {
        if (fields.length > 2) {
          throw new Error('Maximum 2 custom fields allowed in demo mode');
        }
      } else {
        if (fields.length > config.maxCustomFields) {
          throw new Error(`Maximum ${config.maxCustomFields} custom fields allowed`);
        }
      }
      
      // Ensure proper ordering
      const orderedFields = fields.map((field, index) => ({
        ...field,
        order: index + 1
      }));
      
      // Tag all fields with demo flag
      const taggedFields = orderedFields.map(field => ({
        ...field,
        demo: config.demo
      }));
      
      await persistentStorage.set(`${this.customFieldsKey}_${projectId}`, taggedFields);
      console.log('Custom fields saved for project:', projectId);
    } catch (error) {
      console.error('Error saving custom fields:', error);
      throw error;
    }
  }

  /**
   * Get field type label
   */
  getFieldTypeLabel(type: string): string {
    const labels = {
      text: 'Text',
      number: 'Number',
      date: 'Date',
      dropdown: 'Dropdown',
      boolean: 'Yes/No'
    };
    return labels[type as keyof typeof labels] || type;
  }

  /**
   * Get field type description
   */
  getFieldTypeDescription(type: string): string {
    const descriptions = {
      text: 'Single line text input',
      number: 'Numeric value input',
      date: 'Date picker input',
      dropdown: 'Selection from predefined options',
      boolean: 'True/false checkbox input'
    };
    return descriptions[type as keyof typeof descriptions] || type;
  }

  /**
   * Validate custom field
   */
  validateCustomField(field: CustomField): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate field name
    if (!field.fieldName.trim()) {
      errors.push('Field name is required');
    }
    
    // Validate field type
    if (!['text', 'number', 'date', 'dropdown', 'boolean'].includes(field.fieldType)) {
      errors.push('Invalid field type');
    }
    
    // Validate dropdown options
    if (field.fieldType === 'dropdown' && (!field.options || field.options.length === 0)) {
      errors.push('Dropdown fields must have at least one option');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get scope label
   */
  getScopeLabel(scope: string): string {
    const labels = {
      global: 'Global',
      project: 'Project-only'
    };
    return labels[scope as keyof typeof labels] || scope;
  }

  /**
   * Get scope description
   */
  getScopeDescription(scope: string): string {
    const descriptions = {
      global: 'Available across all projects',
      project: 'Available only in this project'
    };
    return descriptions[scope as keyof typeof descriptions] || scope;
  }

  /**
   * Clear all admin tab settings
   */
  async clearAllAdminTabSettings(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All admin tab settings cleared');
    } catch (error) {
      console.error('Error clearing admin tab settings:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const config = await this.getConfig();
      if (config.demo) {
        await this.clearAllAdminTabSettings();
        await this.updateConfig({ demo: false });
        console.log('Demo admin tab data reset');
      }
    } catch (error) {
      console.error('Error resetting demo admin tab data:', error);
      throw error;
    }
  }
}

export const adminTabService = new AdminTabService(); 