import { persistentStorage } from './persistentStorage';

export type ProjectStatus = 'draft' | 'active' | 'on-hold' | 'completed' | 'archived';

export interface ProjectProperties {
  title: string;
  client: string;
  address: string;
  notes: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  manager: string;
  budget: number;
}

export interface ProjectSettings {
  autoSaveEnabled: boolean;
  demo?: boolean;
}

export interface SyncLog {
  id: string;
  projectId: string;
  type: 'import' | 'export';
  result: 'success' | 'error' | 'pending';
  timestamp: Date;
  userId: string;
  details?: string;
  demo?: boolean;
}

export interface FileTabConfig {
  enabled: boolean;
  maxSyncLogs: number;
  demo?: boolean;
}

// Default ConstructBMS file tab settings
const defaultProjectSettings: ProjectSettings = {
  autoSaveEnabled: true
};

class FileTabService {
  private configKey = 'fileTabConfig';
  private projectSettingsKey = 'projectSettings';
  private syncLogsKey = 'syncLogs';

  // Default configuration
  private defaultConfig: FileTabConfig = {
    enabled: true,
    maxSyncLogs: 100,
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<FileTabConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting file tab config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<FileTabConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('File tab config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating file tab config:', error);
      throw error;
    }
  }

  /**
   * Get project settings
   */
  async getProjectSettings(projectId: string): Promise<ProjectSettings> {
    try {
      const config = await this.getConfig();
      const settings = await persistentStorage.get(`${this.projectSettingsKey}_${projectId}`);
      
      if (settings) {
        return settings;
      }
      
      // Return default settings if none exist
      return defaultProjectSettings;
    } catch (error) {
      console.error('Error getting project settings:', error);
      return defaultProjectSettings;
    }
  }

  /**
   * Save project settings
   */
  async saveProjectSettings(projectId: string, settings: Partial<ProjectSettings>): Promise<void> {
    try {
      const config = await this.getConfig();
      const currentSettings = await this.getProjectSettings(projectId);
      
      // Apply demo mode restrictions
      if (config.demo) {
        const limitedSettings = { ...currentSettings, ...settings };
        
        // Auto-save always disabled in demo mode
        limitedSettings.autoSaveEnabled = false;
        
        await persistentStorage.set(`${this.projectSettingsKey}_${projectId}`, {
          ...limitedSettings,
          demo: true
        });
      } else {
        await persistentStorage.set(`${this.projectSettingsKey}_${projectId}`, {
          ...currentSettings,
          ...settings
        });
      }
      
      console.log('Project settings saved for project:', projectId);
    } catch (error) {
      console.error('Error saving project settings:', error);
      throw error;
    }
  }

  /**
   * Save project changes
   */
  async saveProjectChanges(projectId: string, changes: any): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Save all unsaved task, style, and layout data to Supabase
      const saveData = {
        projectId,
        changes,
        timestamp: new Date(),
        userId: 'current-user', // This would come from auth context
        demo: config.demo
      };
      
      await persistentStorage.set(`project_changes_${projectId}`, saveData);
      console.log('Project changes saved for project:', projectId);
    } catch (error) {
      console.error('Error saving project changes:', error);
      throw error;
    }
  }

  /**
   * Save project as template
   */
  async saveProjectAsTemplate(projectId: string, templateName: string): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Clone project into reusable template
      const templateData = {
        originalProjectId: projectId,
        templateName,
        timestamp: new Date(),
        userId: 'current-user', // This would come from auth context
        demo: config.demo
      };
      
      await persistentStorage.set(`project_template_${Date.now()}`, templateData);
      console.log('Project saved as template:', templateName);
    } catch (error) {
      console.error('Error saving project as template:', error);
      throw error;
    }
  }

  /**
   * Import project from file
   */
  async importProject(file: File, options: any): Promise<void> {
    try {
      const config = await this.getConfig();
      
      if (config.demo) {
        throw new Error('Import is disabled in demo mode');
      }
      
      // Map imported fields into ConstructBMS Gantt structure
      const importData = {
        fileName: file.name,
        fileSize: file.size,
        importOptions: options,
        timestamp: new Date(),
        userId: 'current-user', // This would come from auth context
        demo: config.demo
      };
      
      await persistentStorage.set(`project_import_${Date.now()}`, importData);
      console.log('Project imported:', file.name);
    } catch (error) {
      console.error('Error importing project:', error);
      throw error;
    }
  }

  /**
   * Export project
   */
  async exportProject(projectId: string, format: 'pdf' | 'csv' | 'image', exportSettings: any): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Uses export settings from Format tab
      // Rendered view → downloadable asset
      const exportData = {
        projectId,
        format,
        exportSettings,
        timestamp: new Date(),
        userId: 'current-user', // This would come from auth context
        demo: config.demo
      };
      
      await persistentStorage.set(`project_export_${Date.now()}`, exportData);
      console.log('Project exported as:', format);
    } catch (error) {
      console.error('Error exporting project:', error);
      throw error;
    }
  }

  /**
   * Sync with Asta
   */
  async syncWithAsta(projectId: string): Promise<void> {
    try {
      const config = await this.getConfig();
      
      if (config.demo) {
        throw new Error('Sync is disabled in demo mode');
      }
      
      // Attempts to connect with external Asta source via REST API or file watcher
      const syncData = {
        projectId,
        type: 'export' as const,
        result: 'pending' as const,
        timestamp: new Date(),
        userId: 'current-user', // This would come from auth context
        demo: config.demo
      };
      
      await this.addSyncLog(syncData);
      console.log('Sync with Asta initiated for project:', projectId);
    } catch (error) {
      console.error('Error syncing with Asta:', error);
      throw error;
    }
  }

  /**
   * Get sync logs
   */
  async getSyncLogs(projectId: string): Promise<SyncLog[]> {
    try {
      const config = await this.getConfig();
      const logs = await persistentStorage.get(`${this.syncLogsKey}_${projectId}`);
      
      if (logs) {
        return logs;
      }
      
      // Return empty array if none exist
      return [];
    } catch (error) {
      console.error('Error getting sync logs:', error);
      return [];
    }
  }

  /**
   * Add sync log
   */
  async addSyncLog(log: Omit<SyncLog, 'id'>): Promise<void> {
    try {
      const config = await this.getConfig();
      const logs = await this.getSyncLogs(log.projectId);
      
      const newLog: SyncLog = {
        ...log,
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        demo: config.demo
      };
      
      const updatedLogs = [newLog, ...logs].slice(0, config.maxSyncLogs);
      await persistentStorage.set(`${this.syncLogsKey}_${log.projectId}`, updatedLogs);
      
      console.log('Sync log added:', newLog.id);
    } catch (error) {
      console.error('Error adding sync log:', error);
      throw error;
    }
  }

  /**
   * Update project properties
   */
  async updateProjectProperties(projectId: string, properties: ProjectProperties): Promise<void> {
    try {
      const config = await this.getConfig();
      
      const propertiesData = {
        projectId,
        properties,
        timestamp: new Date(),
        userId: 'current-user', // This would come from auth context
        demo: config.demo
      };
      
      await persistentStorage.set(`project_properties_${projectId}`, propertiesData);
      console.log('Project properties updated for project:', projectId);
    } catch (error) {
      console.error('Error updating project properties:', error);
      throw error;
    }
  }

  /**
   * Archive project
   */
  async archiveProject(projectId: string): Promise<void> {
    try {
      const config = await this.getConfig();
      
      if (config.demo) {
        throw new Error('Archive is disabled in demo mode');
      }
      
      const archiveData = {
        projectId,
        archivedAt: new Date(),
        userId: 'current-user', // This would come from auth context
        demo: config.demo
      };
      
      await persistentStorage.set(`project_archive_${projectId}`, archiveData);
      console.log('Project archived:', projectId);
    } catch (error) {
      console.error('Error archiving project:', error);
      throw error;
    }
  }

  /**
   * Get project properties
   */
  async getProjectProperties(projectId: string): Promise<ProjectProperties | null> {
    try {
      const propertiesData = await persistentStorage.get(`project_properties_${projectId}`);
      
      if (propertiesData) {
        return propertiesData.properties;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting project properties:', error);
      return null;
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: ProjectStatus): string {
    const labels = {
      draft: 'Draft',
      active: 'Active',
      'on-hold': 'On Hold',
      completed: 'Completed',
      archived: 'Archived'
    };
    return labels[status];
  }

  /**
   * Get status description
   */
  getStatusDescription(status: ProjectStatus): string {
    const descriptions = {
      draft: 'Project in planning phase',
      active: 'Project currently in progress',
      'on-hold': 'Project temporarily paused',
      completed: 'Project finished successfully',
      archived: 'Project archived for reference'
    };
    return descriptions[status];
  }

  /**
   * Get status color
   */
  getStatusColor(status: ProjectStatus): string {
    const colors = {
      draft: 'text-gray-600 dark:text-gray-400',
      active: 'text-green-600 dark:text-green-400',
      'on-hold': 'text-yellow-600 dark:text-yellow-400',
      completed: 'text-blue-600 dark:text-blue-400',
      archived: 'text-gray-500 dark:text-gray-500'
    };
    return colors[status];
  }

  /**
   * Validate project properties
   */
  validateProjectProperties(properties: ProjectProperties): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate title
    if (!properties.title.trim()) {
      errors.push('Project title is required');
    }
    
    // Validate dates
    if (properties.startDate && properties.endDate) {
      const startDate = new Date(properties.startDate);
      const endDate = new Date(properties.endDate);
      
      if (startDate > endDate) {
        errors.push('End date must be after start date');
      }
    }
    
    // Validate budget
    if (properties.budget < 0) {
      errors.push('Budget cannot be negative');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear all file tab settings
   */
  async clearAllFileTabSettings(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All file tab settings cleared');
    } catch (error) {
      console.error('Error clearing file tab settings:', error);
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
        await this.clearAllFileTabSettings();
        await this.updateConfig({ demo: false });
        console.log('Demo file tab data reset');
      }
    } catch (error) {
      console.error('Error resetting demo file tab data:', error);
      throw error;
    }
  }
}

export const fileTabService = new FileTabService(); 