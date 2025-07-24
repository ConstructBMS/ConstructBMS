import { persistentStorage } from './persistentStorage';

export type FontStyleOption = 'default' | 'serif' | 'sans' | 'mono';
export type LabelPositionOption = 'insideLeft' | 'insideRight' | 'above' | 'below' | 'hidden';

export interface FontLabelSettings {
  demo?: boolean;
  fontStyle: FontStyleOption;
  labelPosition: LabelPositionOption;
  showTaskLabels: boolean;
}

export interface FontLabelConfig {
  autoApply: boolean;
  demo?: boolean;
  enabled: boolean;
}

// Default ConstructBMS font and label settings
const defaultSettings: FontLabelSettings = {
  fontStyle: 'default',
  labelPosition: 'insideLeft',
  showTaskLabels: true
};

class FontLabelSettingsService {
  private configKey = 'fontLabelConfig';
  private settingsKey = 'fontLabelSettings';

  // Default configuration
  private defaultConfig: FontLabelConfig = {
    enabled: true,
    autoApply: true,
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<FontLabelConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting font label config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<FontLabelConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Font label config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating font label config:', error);
      throw error;
    }
  }

  /**
   * Get font and label settings for project
   */
  async getFontLabelSettings(projectId: string): Promise<FontLabelSettings> {
    try {
      const config = await this.getConfig();
      const settings = await persistentStorage.get(`${this.settingsKey}_${projectId}`);
      
      if (settings) {
        return settings;
      }
      
      // Return default settings if none exist
      return defaultSettings;
    } catch (error) {
      console.error('Error getting font label settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Save font and label settings for project
   */
  async saveFontLabelSettings(projectId: string, settings: FontLabelSettings): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Limit options in demo mode
      if (config.demo) {
        const limitedSettings = { ...settings };
        
        // Limit to 2 font styles and 2 positions in demo
        const demoFontStyles: FontStyleOption[] = ['default', 'sans'];
        const demoLabelPositions: LabelPositionOption[] = ['insideLeft', 'above'];
        
        if (!demoFontStyles.includes(limitedSettings.fontStyle)) {
          limitedSettings.fontStyle = 'default';
        }
        
        if (!demoLabelPositions.includes(limitedSettings.labelPosition)) {
          limitedSettings.labelPosition = 'insideLeft';
        }
        
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, {
          ...limitedSettings,
          demo: true
        });
      } else {
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, settings);
      }
      
      console.log('Font label settings saved for project:', projectId);
    } catch (error) {
      console.error('Error saving font label settings:', error);
      throw error;
    }
  }

  /**
   * Reset font and label settings to defaults
   */
  async resetFontLabelSettings(projectId: string): Promise<void> {
    try {
      await persistentStorage.set(`${this.settingsKey}_${projectId}`, defaultSettings);
      console.log('Font label settings reset to defaults for project:', projectId);
    } catch (error) {
      console.error('Error resetting font label settings:', error);
      throw error;
    }
  }

  /**
   * Get CSS classes for font and label settings
   */
  generateFontLabelCSS(settings: FontLabelSettings): string {
    const cssRules = [];
    
    // Font family styles
    const fontFamilyMap = {
      default: 'font-sans',
      serif: 'font-serif',
      sans: 'font-sans',
      mono: 'font-mono'
    };
    
    cssRules.push(`
      .gantt-task-label {
        font-family: ${this.getFontFamilyValue(settings.fontStyle)} !important;
      }
    `);
    
    // Label position styles
    if (settings.showTaskLabels) {
      switch (settings.labelPosition) {
        case 'insideLeft':
          cssRules.push(`
            .gantt-task-label {
              position: absolute !important;
              left: 4px !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              z-index: 10 !important;
            }
          `);
          break;
        case 'insideRight':
          cssRules.push(`
            .gantt-task-label {
              position: absolute !important;
              right: 4px !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              z-index: 10 !important;
            }
          `);
          break;
        case 'above':
          cssRules.push(`
            .gantt-task-label {
              position: absolute !important;
              left: 50% !important;
              top: -20px !important;
              transform: translateX(-50%) !important;
              z-index: 10 !important;
            }
          `);
          break;
        case 'below':
          cssRules.push(`
            .gantt-task-label {
              position: absolute !important;
              left: 50% !important;
              bottom: -20px !important;
              transform: translateX(-50%) !important;
              z-index: 10 !important;
            }
          `);
          break;
        case 'hidden':
        default:
          cssRules.push(`
            .gantt-task-label {
              display: none !important;
            }
          `);
          break;
      }
    } else {
      cssRules.push(`
        .gantt-task-label {
          display: none !important;
        }
      `);
    }
    
    return cssRules.join('\n');
  }

  /**
   * Apply font and label settings to DOM
   */
  applyFontLabelSettings(settings: FontLabelSettings): void {
    try {
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById('constructbms-font-label-settings');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const styleTag = document.createElement('style');
      styleTag.id = 'constructbms-font-label-settings';
      styleTag.textContent = this.generateFontLabelCSS(settings);
      
      document.head.appendChild(styleTag);
      
      console.log('Font label settings applied to DOM');
    } catch (error) {
      console.error('Error applying font label settings to DOM:', error);
    }
  }

  /**
   * Get font family value
   */
  getFontFamilyValue(fontStyle: FontStyleOption): string {
    const fontMap = {
      default: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
    };
    return fontMap[fontStyle];
  }

  /**
   * Get Tailwind font class
   */
  getFontClass(fontStyle: FontStyleOption): string {
    const classMap = {
      default: 'font-sans',
      serif: 'font-serif',
      sans: 'font-sans',
      mono: 'font-mono'
    };
    return classMap[fontStyle];
  }

  /**
   * Validate font and label settings
   */
  validateFontLabelSettings(settings: FontLabelSettings): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];
    
    // Validate font style
    if (!['default', 'serif', 'sans', 'mono'].includes(settings.fontStyle)) {
      errors.push('Invalid font style option');
    }
    
    // Validate label position
    if (!['insideLeft', 'insideRight', 'above', 'below', 'hidden'].includes(settings.labelPosition)) {
      errors.push('Invalid label position option');
    }
    
    // Validate show task labels
    if (typeof settings.showTaskLabels !== 'boolean') {
      errors.push('Invalid show task labels value');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get preview HTML for font and label settings
   */
  getFontLabelPreview(settings: FontLabelSettings): string {
    const fontClass = this.getFontClass(settings.fontStyle);
    const labelStyle = settings.showTaskLabels ? 'block' : 'none';
    const positionStyle = this.getLabelPositionStyle(settings.labelPosition);
    
    return `
      <div class="font-label-preview" style="
        position: relative;
        width: 200px;
        height: 60px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        background-color: #3b82f6;
        margin: 8px 0;
      ">
        <div class="task-label" style="
          display: ${labelStyle};
          position: absolute;
          color: white;
          font-size: 12px;
          font-weight: 500;
          ${positionStyle}
        ">
          Sample Task
        </div>
      </div>
    `;
  }

  /**
   * Get label position style
   */
  getLabelPositionStyle(position: LabelPositionOption): string {
    switch (position) {
      case 'insideLeft':
        return 'left: 4px; top: 50%; transform: translateY(-50%);';
      case 'insideRight':
        return 'right: 4px; top: 50%; transform: translateY(-50%);';
      case 'above':
        return 'left: 50%; top: -20px; transform: translateX(-50%);';
      case 'below':
        return 'left: 50%; bottom: -20px; transform: translateX(-50%);';
      case 'hidden':
      default:
        return 'display: none;';
    }
  }

  /**
   * Export font and label settings as CSS
   */
  exportFontLabelSettingsAsCSS(settings: FontLabelSettings): string {
    return `/* ConstructBMS Font & Label Settings */
${this.generateFontLabelCSS(settings)}

/* Usage Examples */
.gantt-task {
  /* Apply font and label settings */
}

/* Custom Variables */
:root {
  --task-label-font: ${this.getFontFamilyValue(settings.fontStyle)};
  --task-label-position: ${settings.labelPosition};
  --task-label-visible: ${settings.showTaskLabels ? 'block' : 'none'};
}
`;
  }

  /**
   * Clear all font and label settings
   */
  async clearAllFontLabelSettings(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All font label settings cleared');
    } catch (error) {
      console.error('Error clearing font label settings:', error);
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
        await this.clearAllFontLabelSettings();
        await this.updateConfig({ demo: false });
        console.log('Demo font label data reset');
      }
    } catch (error) {
      console.error('Error resetting demo font label data:', error);
      throw error;
    }
  }
}

export const fontLabelSettingsService = new FontLabelSettingsService(); 