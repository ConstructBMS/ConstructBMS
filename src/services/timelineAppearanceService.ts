import { persistentStorage } from './persistentStorage';

export type RowHeightOption = 'small' | 'medium' | 'large';
export type BackgroundColorOption = 'light' | 'dark' | 'system' | 'custom';

export interface TimelineAppearanceSettings {
  rowHeight: RowHeightOption;
  showGridLines: boolean;
  showWeekendShading: boolean;
  backgroundColor: BackgroundColorOption;
  customBackgroundColor?: string;
  demo?: boolean;
}

export interface TimelineAppearanceConfig {
  enabled: boolean;
  autoApply: boolean;
  demo?: boolean;
}

// Default ConstructBMS timeline appearance settings
const defaultSettings: TimelineAppearanceSettings = {
  rowHeight: 'medium',
  showGridLines: true,
  showWeekendShading: true,
  backgroundColor: 'system',
  customBackgroundColor: '#ffffff'
};

class TimelineAppearanceService {
  private configKey = 'timelineAppearanceConfig';
  private settingsKey = 'timelineAppearanceSettings';

  // Default configuration
  private defaultConfig: TimelineAppearanceConfig = {
    enabled: true,
    autoApply: true,
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<TimelineAppearanceConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting timeline appearance config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<TimelineAppearanceConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Timeline appearance config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating timeline appearance config:', error);
      throw error;
    }
  }

  /**
   * Get timeline appearance settings for project
   */
  async getTimelineAppearanceSettings(projectId: string): Promise<TimelineAppearanceSettings> {
    try {
      const config = await this.getConfig();
      const settings = await persistentStorage.get(`${this.settingsKey}_${projectId}`);
      
      if (settings) {
        return settings;
      }
      
      // Return default settings if none exist
      return defaultSettings;
    } catch (error) {
      console.error('Error getting timeline appearance settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Save timeline appearance settings for project
   */
  async saveTimelineAppearanceSettings(projectId: string, settings: TimelineAppearanceSettings): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Limit options in demo mode
      if (config.demo) {
        const limitedSettings = { ...settings };
        
        // Only allow default + 1 alternate style in demo
        if (limitedSettings.backgroundColor === 'custom') {
          limitedSettings.backgroundColor = 'light';
          limitedSettings.customBackgroundColor = undefined;
        }
        
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, {
          ...limitedSettings,
          demo: true
        });
      } else {
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, settings);
      }
      
      console.log('Timeline appearance settings saved for project:', projectId);
    } catch (error) {
      console.error('Error saving timeline appearance settings:', error);
      throw error;
    }
  }

  /**
   * Reset timeline appearance settings to defaults
   */
  async resetTimelineAppearanceSettings(projectId: string): Promise<void> {
    try {
      await persistentStorage.set(`${this.settingsKey}_${projectId}`, defaultSettings);
      console.log('Timeline appearance settings reset to defaults for project:', projectId);
    } catch (error) {
      console.error('Error resetting timeline appearance settings:', error);
      throw error;
    }
  }

  /**
   * Get CSS classes for timeline appearance
   */
  generateTimelineCSS(settings: TimelineAppearanceSettings): string {
    const cssRules = [];
    
    // Row height styles
    const rowHeightMap = {
      small: '24px',
      medium: '32px',
      large: '40px'
    };
    
    cssRules.push(`
      .gantt-timeline-row {
        height: ${rowHeightMap[settings.rowHeight]} !important;
        min-height: ${rowHeightMap[settings.rowHeight]} !important;
      }
    `);
    
    // Grid lines styles
    if (settings.showGridLines) {
      cssRules.push(`
        .gantt-timeline-grid {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .dark .gantt-timeline-grid {
          background-image: 
            linear-gradient(to right, #374151 1px, transparent 1px),
            linear-gradient(to bottom, #374151 1px, transparent 1px);
        }
      `);
    } else {
      cssRules.push(`
        .gantt-timeline-grid {
          background-image: none !important;
        }
      `);
    }
    
    // Weekend shading styles
    if (settings.showWeekendShading) {
      cssRules.push(`
        .gantt-weekend-cell {
          background-color: #f3f4f6 !important;
        }
        .dark .gantt-weekend-cell {
          background-color: #374151 !important;
        }
      `);
    } else {
      cssRules.push(`
        .gantt-weekend-cell {
          background-color: transparent !important;
        }
      `);
    }
    
    // Background color styles
    switch (settings.backgroundColor) {
      case 'light':
        cssRules.push(`
          .gantt-timeline {
            background-color: #ffffff !important;
          }
        `);
        break;
      case 'dark':
        cssRules.push(`
          .gantt-timeline {
            background-color: #1f2937 !important;
          }
        `);
        break;
      case 'custom':
        if (settings.customBackgroundColor) {
          cssRules.push(`
            .gantt-timeline {
              background-color: ${settings.customBackgroundColor} !important;
            }
          `);
        }
        break;
      case 'system':
      default:
        cssRules.push(`
          .gantt-timeline {
            background-color: var(--timeline-bg, #ffffff) !important;
          }
          .dark .gantt-timeline {
            background-color: var(--timeline-bg-dark, #1f2937) !important;
          }
        `);
        break;
    }
    
    return cssRules.join('\n');
  }

  /**
   * Apply timeline appearance to DOM
   */
  applyTimelineAppearance(settings: TimelineAppearanceSettings): void {
    try {
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById('constructbms-timeline-appearance');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const styleTag = document.createElement('style');
      styleTag.id = 'constructbms-timeline-appearance';
      styleTag.textContent = this.generateTimelineCSS(settings);
      
      document.head.appendChild(styleTag);
      
      console.log('Timeline appearance applied to DOM');
    } catch (error) {
      console.error('Error applying timeline appearance to DOM:', error);
    }
  }

  /**
   * Get row height value in pixels
   */
  getRowHeightValue(settings: TimelineAppearanceSettings): number {
    const heightMap = {
      small: 24,
      medium: 32,
      large: 40
    };
    return heightMap[settings.rowHeight];
  }

  /**
   * Validate timeline appearance settings
   */
  validateTimelineAppearanceSettings(settings: TimelineAppearanceSettings): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate row height
    if (!['small', 'medium', 'large'].includes(settings.rowHeight)) {
      errors.push('Invalid row height option');
    }
    
    // Validate background color
    if (!['light', 'dark', 'system', 'custom'].includes(settings.backgroundColor)) {
      errors.push('Invalid background color option');
    }
    
    // Validate custom background color
    if (settings.backgroundColor === 'custom' && settings.customBackgroundColor) {
      if (!settings.customBackgroundColor.match(/^#[0-9A-F]{6}$/i)) {
        errors.push('Invalid custom background color format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get preview HTML for timeline appearance
   */
  getTimelinePreview(settings: TimelineAppearanceSettings): string {
    const rowHeight = this.getRowHeightValue(settings);
    const bgColor = settings.backgroundColor === 'custom' && settings.customBackgroundColor 
      ? settings.customBackgroundColor 
      : (settings.backgroundColor === 'light' ? '#ffffff' : '#1f2937');
    
    return `
      <div class="timeline-preview" style="
        background-color: ${bgColor};
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        padding: 8px;
        width: 200px;
        height: 120px;
        position: relative;
      ">
        <div class="timeline-row" style="
          height: ${rowHeight}px;
          background-color: #3b82f6;
          margin-bottom: 2px;
          border-radius: 2px;
        "></div>
        <div class="timeline-row" style="
          height: ${rowHeight}px;
          background-color: #10b981;
          margin-bottom: 2px;
          border-radius: 2px;
        "></div>
        <div class="timeline-row" style="
          height: ${rowHeight}px;
          background-color: #f59e0b;
          border-radius: 2px;
        "></div>
        ${settings.showGridLines ? `
          <div class="grid-overlay" style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
            background-size: 20px 20px;
            pointer-events: none;
          "></div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Export timeline appearance as CSS
   */
  exportTimelineAppearanceAsCSS(settings: TimelineAppearanceSettings): string {
    return `/* ConstructBMS Timeline Appearance */
${this.generateTimelineCSS(settings)}

/* Usage Examples */
.gantt-container {
  /* Apply timeline appearance */
}

/* Custom Variables */
:root {
  --timeline-row-height: ${this.getRowHeightValue(settings)}px;
  --timeline-bg: ${settings.backgroundColor === 'custom' && settings.customBackgroundColor ? settings.customBackgroundColor : '#ffffff'};
  --timeline-bg-dark: ${settings.backgroundColor === 'custom' && settings.customBackgroundColor ? settings.customBackgroundColor : '#1f2937'};
}
`;
  }

  /**
   * Clear all timeline appearance settings
   */
  async clearAllTimelineAppearanceSettings(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All timeline appearance settings cleared');
    } catch (error) {
      console.error('Error clearing timeline appearance settings:', error);
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
        await this.clearAllTimelineAppearanceSettings();
        await this.updateConfig({ demo: false });
        console.log('Demo timeline appearance data reset');
      }
    } catch (error) {
      console.error('Error resetting demo timeline appearance data:', error);
      throw error;
    }
  }
}

export const timelineAppearanceService = new TimelineAppearanceService(); 