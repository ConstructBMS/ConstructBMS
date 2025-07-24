import { persistentStorage } from './persistentStorage';

export type LabelType = 'none' | 'taskName' | 'taskId' | 'startDate' | 'finishDate' | 'duration' | 'percentComplete' | 'customField1' | 'customField2' | 'customField3';

export interface BarLabelConfig {
  bottom: LabelType;
  center: LabelType;
  demo?: boolean;
  top: LabelType;
}

export interface BarLabelPreset {
  config: BarLabelConfig;
  createdBy?: string;
  demo?: boolean;
  description: string;
  id: string;
  name: string;
  type: 'system' | 'custom';
}

export interface BarLabelResult {
  data?: any;
  errors: string[];
  success: boolean;
}

export class BarLabelService {
  private static readonly DEFAULT_CONFIG: BarLabelConfig = {
    top: 'taskId',
    center: 'taskName',
    bottom: 'none'
  };

  private static readonly SYSTEM_PRESETS: BarLabelPreset[] = [
    {
      id: 'default',
      name: 'Default',
      description: 'Standard bar label layout',
      config: {
        top: 'taskId',
        center: 'taskName',
        bottom: 'none'
      },
      type: 'system'
    },
    {
      id: 'compact',
      name: 'Compact View',
      description: 'Minimal labels for dense timelines',
      config: {
        top: 'none',
        center: 'taskName',
        bottom: 'none'
      },
      type: 'system'
    },
    {
      id: 'detailed-dates',
      name: 'Detailed with Dates',
      description: 'Full information including dates',
      config: {
        top: 'taskId',
        center: 'taskName',
        bottom: 'startDate'
      },
      type: 'system'
    },
    {
      id: 'id-name',
      name: 'Task ID + Name',
      description: 'ID above, name on bar',
      config: {
        top: 'taskId',
        center: 'taskName',
        bottom: 'none'
      },
      type: 'system'
    },
    {
      id: 'critical-only',
      name: 'Critical Tasks Only',
      description: 'Highlight critical path tasks',
      config: {
        top: 'taskId',
        center: 'taskName',
        bottom: 'percentComplete'
      },
      type: 'system'
    }
  ];

  /**
   * Get bar label configuration
   */
  static async getBarLabelConfig(projectId: string = 'demo'): Promise<BarLabelConfig> {
    try {
      const config = await persistentStorage.getSetting(`barLabelConfig_${projectId}`, 'barLabels') as BarLabelConfig;
      
      if (!config) {
        // Return default config if none exists
        const defaultConfig = { ...this.DEFAULT_CONFIG, demo: projectId.includes('demo') };
        await this.saveBarLabelConfig(defaultConfig, projectId);
        return defaultConfig;
      }

      return config;
    } catch (error) {
      console.error('Failed to get bar label config:', error);
      return { ...this.DEFAULT_CONFIG, demo: projectId.includes('demo') };
    }
  }

  /**
   * Save bar label configuration
   */
  static async saveBarLabelConfig(config: BarLabelConfig, projectId: string = 'demo'): Promise<BarLabelResult> {
    try {
      const configWithDemo = {
        ...config,
        demo: projectId.includes('demo')
      };

      await persistentStorage.setSetting(`barLabelConfig_${projectId}`, configWithDemo, 'barLabels');
      
      if (projectId.includes('demo')) {
        console.log('Demo bar label config saved:', configWithDemo);
      }

      return { success: true, data: configWithDemo, errors: [] };
    } catch (error) {
      console.error('Failed to save bar label config:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get bar label presets
   */
  static async getBarLabelPresets(projectId: string = 'demo'): Promise<BarLabelPreset[]> {
    try {
      const customPresets = await persistentStorage.getSetting(`barLabelPresets_${projectId}`, 'barLabels') as BarLabelPreset[] || [];
      return [...this.SYSTEM_PRESETS, ...customPresets];
    } catch (error) {
      console.error('Failed to get bar label presets:', error);
      return this.SYSTEM_PRESETS;
    }
  }

  /**
   * Save bar label preset
   */
  static async saveBarLabelPreset(
    preset: Omit<BarLabelPreset, 'id' | 'type'>,
    projectId: string = 'demo',
    userId: string = 'demo-user'
  ): Promise<BarLabelResult> {
    try {
      const customPresets = await persistentStorage.getSetting(`barLabelPresets_${projectId}`, 'barLabels') as BarLabelPreset[] || [];
      
      // Check if name already exists
      if (customPresets.some(p => p.name === preset.name)) {
        return {
          success: false,
          errors: ['A preset with this name already exists']
        };
      }

      const newPreset: BarLabelPreset = {
        ...preset,
        id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'custom',
        createdBy: userId,
        demo: projectId.includes('demo')
      };

      customPresets.push(newPreset);
      await persistentStorage.setSetting(`barLabelPresets_${projectId}`, customPresets, 'barLabels');

      // Log activity
      await this.logBarLabelActivity('save_preset', {
        presetName: preset.name,
        presetId: newPreset.id
      }, projectId);

      return { success: true, data: newPreset, errors: [] };
    } catch (error) {
      console.error('Failed to save bar label preset:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Delete bar label preset
   */
  static async deleteBarLabelPreset(presetId: string, projectId: string = 'demo'): Promise<BarLabelResult> {
    try {
      const customPresets = await persistentStorage.getSetting(`barLabelPresets_${projectId}`, 'barLabels') as BarLabelPreset[] || [];
      const presetIndex = customPresets.findIndex(p => p.id === presetId);
      
      if (presetIndex === -1) {
        return {
          success: false,
          errors: ['Preset not found']
        };
      }

      const deletedPreset = customPresets[presetIndex];
      customPresets.splice(presetIndex, 1);
      await persistentStorage.setSetting(`barLabelPresets_${projectId}`, customPresets, 'barLabels');

      // Log activity
      await this.logBarLabelActivity('delete_preset', {
        presetName: deletedPreset.name,
        presetId: presetId
      }, projectId);

      return { success: true, errors: [] };
    } catch (error) {
      console.error('Failed to delete bar label preset:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Apply bar label preset
   */
  static async applyBarLabelPreset(preset: BarLabelPreset, projectId: string = 'demo'): Promise<BarLabelResult> {
    try {
      const result = await this.saveBarLabelConfig(preset.config, projectId);
      
      if (result.success) {
        // Log activity
        await this.logBarLabelActivity('apply_preset', {
          presetName: preset.name,
          presetId: preset.id
        }, projectId);
      }

      return result;
    } catch (error) {
      console.error('Failed to apply bar label preset:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Reset bar labels to default
   */
  static async resetBarLabels(projectId: string = 'demo'): Promise<BarLabelResult> {
    try {
      const result = await this.saveBarLabelConfig(this.DEFAULT_CONFIG, projectId);
      
      if (result.success) {
        // Log activity
        await this.logBarLabelActivity('reset_to_default', {
          resetTo: 'default'
        }, projectId);
      }

      return result;
    } catch (error) {
      console.error('Failed to reset bar labels:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get active preset for current configuration
   */
  static async getActivePreset(config: BarLabelConfig, projectId: string = 'demo'): Promise<BarLabelPreset | null> {
    try {
      const presets = await this.getBarLabelPresets(projectId);
      
      return presets.find(preset => 
        preset.config.top === config.top &&
        preset.config.center === config.center &&
        preset.config.bottom === config.bottom
      ) || null;
    } catch (error) {
      console.error('Failed to get active preset:', error);
      return null;
    }
  }

  /**
   * Get label display name
   */
  static getLabelDisplayName(labelType: LabelType): string {
    const labelNames: Record<LabelType, string> = {
      none: '(None)',
      taskName: 'Task Name',
      taskId: 'Task ID',
      startDate: 'Start Date',
      finishDate: 'Finish Date',
      duration: 'Duration',
      percentComplete: '% Complete',
      customField1: 'Custom Field 1',
      customField2: 'Custom Field 2',
      customField3: 'Custom Field 3'
    };

    return labelNames[labelType] || labelType;
  }

  /**
   * Get label value for a task
   */
  static getLabelValue(labelType: LabelType, task: any): string {
    switch (labelType) {
      case 'taskName':
        return task.name || '';
      case 'taskId':
        return task.id || '';
      case 'startDate':
        return task.startDate ? new Date(task.startDate).toLocaleDateString() : '';
      case 'finishDate':
        return task.finishDate ? new Date(task.finishDate).toLocaleDateString() : '';
      case 'duration':
        return task.duration ? `${task.duration}d` : '';
      case 'percentComplete':
        return task.percentComplete ? `${task.percentComplete}%` : '';
      case 'customField1':
        return task.customField1 || '';
      case 'customField2':
        return task.customField2 || '';
      case 'customField3':
        return task.customField3 || '';
      case 'none':
      default:
        return '';
    }
  }

  /**
   * Validate bar label configuration
   */
  static validateBarLabelConfig(config: BarLabelConfig): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];

    const validLabelTypes: LabelType[] = [
      'none', 'taskName', 'taskId', 'startDate', 'finishDate', 
      'duration', 'percentComplete', 'customField1', 'customField2', 'customField3'
    ];

    if (!validLabelTypes.includes(config.top)) {
      errors.push('Invalid top label type');
    }

    if (!validLabelTypes.includes(config.center)) {
      errors.push('Invalid center label type');
    }

    if (!validLabelTypes.includes(config.bottom)) {
      errors.push('Invalid bottom label type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear demo bar label data
   */
  static async clearDemoBarLabelData(projectId: string = 'demo'): Promise<BarLabelResult> {
    try {
      // Remove demo bar label config
      await persistentStorage.removeSetting(`barLabelConfig_${projectId}`, 'barLabels');
      
      // Remove demo presets
      const customPresets = await persistentStorage.getSetting(`barLabelPresets_${projectId}`, 'barLabels') as BarLabelPreset[] || [];
      const nonDemoPresets = customPresets.filter(p => !p.demo);
      await persistentStorage.setSetting(`barLabelPresets_${projectId}`, nonDemoPresets, 'barLabels');
      
      console.log('Demo bar label data cleared');
      
      return { success: true, errors: [] };
    } catch (error) {
      console.error('Failed to clear demo bar label data:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get bar label activity history
   */
  static async getBarLabelHistory(projectId: string = 'demo'): Promise<{
    activities: any[];
  }> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      const activities = activityLog.filter((log: any) => log.type === 'bar_label_activity');

      return { activities };
    } catch (error) {
      console.error('Failed to get bar label history:', error);
      return { activities: [] };
    }
  }

  /**
   * Log bar label activity
   */
  static async logBarLabelActivity(
    action: string, 
    details: any, 
    projectId: string = 'demo'
  ): Promise<void> {
    try {
      const activityLog = await persistentStorage.getSetting(`activityLog_${projectId}`, 'activity') || [];
      
      activityLog.push({
        id: `bar_label_${Date.now()}`,
        type: 'bar_label_activity',
        action,
        details,
        timestamp: new Date().toISOString(),
        demo: projectId.includes('demo')
      });

      await persistentStorage.setSetting(`activityLog_${projectId}`, activityLog, 'activity');
    } catch (error) {
      console.error('Failed to log bar label activity:', error);
    }
  }
} 