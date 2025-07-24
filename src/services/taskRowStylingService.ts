import { persistentStorage } from './persistentStorage';

export type RowBorderStyle = 'none' | 'bottom' | 'full';

export interface TaskRowStylingSettings {
  demo?: boolean;
  highlightActive: boolean;
  rowBorder: RowBorderStyle;
  striping: boolean;
}

export interface TaskRowStylingConfig {
  autoApply: boolean;
  demo?: boolean;
  enabled: boolean;
}

// Default ConstructBMS task row styling settings
const defaultSettings: TaskRowStylingSettings = {
  striping: true,
  rowBorder: 'bottom',
  highlightActive: true
};

class TaskRowStylingService {
  private configKey = 'taskRowStylingConfig';
  private settingsKey = 'taskRowStylingSettings';

  // Default configuration
  private defaultConfig: TaskRowStylingConfig = {
    enabled: true,
    autoApply: true,
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<TaskRowStylingConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting task row styling config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<TaskRowStylingConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Task row styling config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating task row styling config:', error);
      throw error;
    }
  }

  /**
   * Get task row styling settings for project
   */
  async getTaskRowStylingSettings(projectId: string): Promise<TaskRowStylingSettings> {
    try {
      const config = await this.getConfig();
      const settings = await persistentStorage.get(`${this.settingsKey}_${projectId}`);
      
      if (settings) {
        return settings;
      }
      
      // Return default settings if none exist
      return defaultSettings;
    } catch (error) {
      console.error('Error getting task row styling settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Save task row styling settings for project
   */
  async saveTaskRowStylingSettings(projectId: string, settings: TaskRowStylingSettings): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Apply demo mode limits
      if (config.demo) {
        const limitedSettings = { ...settings };
        
        // Only allow one border style in demo mode
        if (limitedSettings.rowBorder !== 'bottom') {
          limitedSettings.rowBorder = 'bottom';
        }
        
        // Only allow one toggle in demo mode
        if (limitedSettings.striping && limitedSettings.highlightActive) {
          limitedSettings.highlightActive = false;
        }
        
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, {
          ...limitedSettings,
          demo: true
        });
      } else {
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, settings);
      }
      
      console.log('Task row styling settings saved for project:', projectId);
    } catch (error) {
      console.error('Error saving task row styling settings:', error);
      throw error;
    }
  }

  /**
   * Reset task row styling settings to defaults
   */
  async resetTaskRowStylingSettings(projectId: string): Promise<void> {
    try {
      await persistentStorage.set(`${this.settingsKey}_${projectId}`, defaultSettings);
      console.log('Task row styling settings reset to defaults for project:', projectId);
    } catch (error) {
      console.error('Error resetting task row styling settings:', error);
      throw error;
    }
  }

  /**
   * Get CSS classes for task row styling
   */
  generateTaskRowStylingCSS(settings: TaskRowStylingSettings): string {
    return `
      /* Task Row Styling */
      .task-row {
        transition: all 0.2s ease;
      }
      
      /* Row Striping */
      ${settings.striping ? `
        .task-row:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .task-row:nth-child(odd) {
          background-color: #ffffff;
        }
        
        .dark .task-row:nth-child(even) {
          background-color: #374151;
        }
        
        .dark .task-row:nth-child(odd) {
          background-color: #1f2937;
        }
      ` : `
        .task-row {
          background-color: #ffffff;
        }
        
        .dark .task-row {
          background-color: #1f2937;
        }
      `}
      
      /* Row Border Styles */
      ${settings.rowBorder === 'none' ? `
        .task-row {
          border: none;
        }
      ` : settings.rowBorder === 'bottom' ? `
        .task-row {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .dark .task-row {
          border-bottom: 1px solid #4b5563;
        }
      ` : `
        .task-row {
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        
        .task-row:first-child {
          border-top: 1px solid #e5e7eb;
        }
        
        .dark .task-row {
          border: 1px solid #4b5563;
          border-top: none;
        }
        
        .dark .task-row:first-child {
          border-top: 1px solid #4b5563;
        }
      `}
      
      /* Active Row Highlighting */
      ${settings.highlightActive ? `
        .task-row.active,
        .task-row.selected {
          background-color: #dbeafe !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 1px #3b82f6;
        }
        
        .dark .task-row.active,
        .dark .task-row.selected {
          background-color: #1e3a8a !important;
          border-color: #60a5fa !important;
          box-shadow: 0 0 0 1px #60a5fa;
        }
        
        .task-row.active:hover,
        .task-row.selected:hover {
          background-color: #bfdbfe !important;
        }
        
        .dark .task-row.active:hover,
        .dark .task-row.selected:hover {
          background-color: #1e40af !important;
        }
      ` : `
        .task-row.active,
        .task-row.selected {
          background-color: #f3f4f6 !important;
        }
        
        .dark .task-row.active,
        .dark .task-row.selected {
          background-color: #4b5563 !important;
        }
      `}
      
      /* Hover Effects */
      .task-row:hover {
        background-color: #f3f4f6;
        cursor: pointer;
      }
      
      .dark .task-row:hover {
        background-color: #4b5563;
      }
      
      /* Row Spacing */
      .task-row {
        padding: 8px 12px;
        min-height: 40px;
        display: flex;
        align-items: center;
      }
      
      /* Task Row Content */
      .task-row-content {
        display: flex;
        align-items: center;
        width: 100%;
        gap: 8px;
      }
      
      /* Task Name */
      .task-name {
        font-weight: 500;
        color: #111827;
        flex: 1;
      }
      
      .dark .task-name {
        color: #f9fafb;
      }
      
      /* Task Status */
      .task-status {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
      }
      
      .task-status.not-started {
        background-color: #fef3c7;
        color: #92400e;
      }
      
      .task-status.in-progress {
        background-color: #dbeafe;
        color: #1e40af;
      }
      
      .task-status.completed {
        background-color: #d1fae5;
        color: #065f46;
      }
      
      .task-status.on-hold {
        background-color: #fecaca;
        color: #991b1b;
      }
      
      .task-status.cancelled {
        background-color: #f3f4f6;
        color: #6b7280;
      }
      
      /* Task Progress */
      .task-progress {
        width: 60px;
        height: 6px;
        background-color: #e5e7eb;
        border-radius: 3px;
        overflow: hidden;
      }
      
      .task-progress-bar {
        height: 100%;
        background-color: #3b82f6;
        transition: width 0.3s ease;
      }
      
      /* Task Duration */
      .task-duration {
        font-size: 12px;
        color: #6b7280;
        min-width: 40px;
        text-align: right;
      }
      
      .dark .task-duration {
        color: #9ca3af;
      }
    `;
  }

  /**
   * Apply task row styling to DOM
   */
  applyTaskRowStyling(settings: TaskRowStylingSettings): void {
    try {
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById('constructbms-task-row-styling');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const styleTag = document.createElement('style');
      styleTag.id = 'constructbms-task-row-styling';
      styleTag.textContent = this.generateTaskRowStylingCSS(settings);
      
      document.head.appendChild(styleTag);
      
      // Update task list data attributes
      const taskListElements = document.querySelectorAll('.task-list, .gantt-task-grid');
      taskListElements.forEach(element => {
        element.setAttribute('data-striping', settings.striping.toString());
        element.setAttribute('data-border', settings.rowBorder);
        element.setAttribute('data-highlight', settings.highlightActive.toString());
      });
      
      console.log('Task row styling applied to DOM');
    } catch (error) {
      console.error('Error applying task row styling to DOM:', error);
    }
  }

  /**
   * Get border style label
   */
  getBorderStyleLabel(borderStyle: RowBorderStyle): string {
    const labels = {
      none: 'None',
      bottom: 'Bottom Border',
      full: 'Full Border'
    };
    return labels[borderStyle];
  }

  /**
   * Get border style description
   */
  getBorderStyleDescription(borderStyle: RowBorderStyle): string {
    const descriptions = {
      none: 'No borders',
      bottom: 'Bottom border only',
      full: 'Border on all sides'
    };
    return descriptions[borderStyle];
  }

  /**
   * Validate task row styling settings
   */
  validateTaskRowStylingSettings(settings: TaskRowStylingSettings): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];
    
    // Validate striping
    if (typeof settings.striping !== 'boolean') {
      errors.push('Invalid striping value');
    }
    
    // Validate row border
    if (!['none', 'bottom', 'full'].includes(settings.rowBorder)) {
      errors.push('Invalid row border option');
    }
    
    // Validate highlight active
    if (typeof settings.highlightActive !== 'boolean') {
      errors.push('Invalid highlight active value');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get preview HTML for task row styling
   */
  getTaskRowStylingPreview(settings: TaskRowStylingSettings): string {
    const stripingClass = settings.striping ? 'striped' : '';
    const borderClass = settings.rowBorder;
    const highlightClass = settings.highlightActive ? 'highlight' : '';
    
    return `
      <div class="task-row-styling-preview" style="
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        background-color: white;
        margin: 8px 0;
        overflow: hidden;
      ">
        <div style="
          padding: 8px 12px;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 500;
          font-size: 12px;
          color: #374151;
        ">
          Task Row Preview
        </div>
        <div class="preview-rows" style="
          ${settings.striping ? `
            .preview-row:nth-child(even) { background-color: #f9fafb; }
            .preview-row:nth-child(odd) { background-color: #ffffff; }
          ` : `
            .preview-row { background-color: #ffffff; }
          `}
        ">
          <div class="preview-row" style="
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            ${settings.rowBorder === 'bottom' ? 'border-bottom: 1px solid #e5e7eb;' : ''}
            ${settings.rowBorder === 'full' ? 'border: 1px solid #e5e7eb; border-top: none;' : ''}
            ${settings.highlightActive ? 'background-color: #dbeafe; border-color: #3b82f6;' : ''}
          ">
            <div style="width: 12px; height: 12px; background-color: #3b82f6; border-radius: 2px;"></div>
            <span style="flex: 1; font-size: 12px;">Project Planning</span>
            <span style="font-size: 11px; color: #6b7280;">5 days</span>
          </div>
          <div class="preview-row" style="
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            ${settings.rowBorder === 'bottom' ? 'border-bottom: 1px solid #e5e7eb;' : ''}
            ${settings.rowBorder === 'full' ? 'border: 1px solid #e5e7eb; border-top: none;' : ''}
          ">
            <div style="width: 12px; height: 12px; background-color: #10b981; border-radius: 2px;"></div>
            <span style="flex: 1; font-size: 12px;">Resource Allocation</span>
            <span style="font-size: 11px; color: #6b7280;">3 days</span>
          </div>
          <div class="preview-row" style="
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            ${settings.rowBorder === 'bottom' ? 'border-bottom: 1px solid #e5e7eb;' : ''}
            ${settings.rowBorder === 'full' ? 'border: 1px solid #e5e7eb; border-top: none;' : ''}
          ">
            <div style="width: 12px; height: 12px; background-color: #f59e0b; border-radius: 2px;"></div>
            <span style="flex: 1; font-size: 12px;">Implementation</span>
            <span style="font-size: 11px; color: #6b7280;">10 days</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Export task row styling as CSS
   */
  exportTaskRowStylingAsCSS(settings: TaskRowStylingSettings): string {
    return `/* ConstructBMS Task Row Styling */
${this.generateTaskRowStylingCSS(settings)}

/* Usage Examples */
.task-row {
  /* Apply task row styling */
}

/* Custom Variables */
:root {
  --task-row-striping: ${settings.striping ? 'true' : 'false'};
  --task-row-border: "${settings.rowBorder}";
  --task-row-highlight: ${settings.highlightActive ? 'true' : 'false'};
}
`;
  }

  /**
   * Clear all task row styling settings
   */
  async clearAllTaskRowStylingSettings(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All task row styling settings cleared');
    } catch (error) {
      console.error('Error clearing task row styling settings:', error);
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
        await this.clearAllTaskRowStylingSettings();
        await this.updateConfig({ demo: false });
        console.log('Demo task row styling data reset');
      }
    } catch (error) {
      console.error('Error resetting demo task row styling data:', error);
      throw error;
    }
  }
}

export const taskRowStylingService = new TaskRowStylingService(); 