import { persistentStorage } from './persistentStorage';

export type CriticalPathColorOption = 'red' | 'orange' | 'purple';

export interface CriticalPathHighlightingSettings {
  showCriticalPath: boolean;
  criticalPathColor: CriticalPathColorOption;
  demo?: boolean;
}

export interface CriticalPathHighlightingConfig {
  enabled: boolean;
  autoApply: boolean;
  demo?: boolean;
}

// Default ConstructBMS critical path highlighting settings
const defaultSettings: CriticalPathHighlightingSettings = {
  showCriticalPath: false,
  criticalPathColor: 'red'
};

class CriticalPathHighlightingService {
  private configKey = 'criticalPathHighlightingConfig';
  private settingsKey = 'criticalPathHighlightingSettings';

  // Default configuration
  private defaultConfig: CriticalPathHighlightingConfig = {
    enabled: true,
    autoApply: true,
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<CriticalPathHighlightingConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting critical path highlighting config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<CriticalPathHighlightingConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Critical path highlighting config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating critical path highlighting config:', error);
      throw error;
    }
  }

  /**
   * Get critical path highlighting settings for project
   */
  async getCriticalPathHighlightingSettings(projectId: string): Promise<CriticalPathHighlightingSettings> {
    try {
      const config = await this.getConfig();
      const settings = await persistentStorage.get(`${this.settingsKey}_${projectId}`);
      
      if (settings) {
        return settings;
      }
      
      // Return default settings if none exist
      return defaultSettings;
    } catch (error) {
      console.error('Error getting critical path highlighting settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Save critical path highlighting settings for project
   */
  async saveCriticalPathHighlightingSettings(projectId: string, settings: CriticalPathHighlightingSettings): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Limit color choices in demo mode
      if (config.demo) {
        const limitedSettings = { ...settings };
        
        // Only allow red color in demo mode
        if (limitedSettings.criticalPathColor !== 'red') {
          limitedSettings.criticalPathColor = 'red';
        }
        
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, {
          ...limitedSettings,
          demo: true
        });
      } else {
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, settings);
      }
      
      console.log('Critical path highlighting settings saved for project:', projectId);
    } catch (error) {
      console.error('Error saving critical path highlighting settings:', error);
      throw error;
    }
  }

  /**
   * Reset critical path highlighting settings to defaults
   */
  async resetCriticalPathHighlightingSettings(projectId: string): Promise<void> {
    try {
      await persistentStorage.set(`${this.settingsKey}_${projectId}`, defaultSettings);
      console.log('Critical path highlighting settings reset to defaults for project:', projectId);
    } catch (error) {
      console.error('Error resetting critical path highlighting settings:', error);
      throw error;
    }
  }

  /**
   * Get CSS classes for critical path highlighting
   */
  generateCriticalPathCSS(settings: CriticalPathHighlightingSettings): string {
    if (!settings.showCriticalPath) {
      return `
        .gantt-task-critical {
          /* Critical path highlighting disabled */
        }
      `;
    }

    const colorMap = {
      red: {
        background: '#DC2626',
        border: '#B91C1C',
        text: '#FFFFFF'
      },
      orange: {
        background: '#EA580C',
        border: '#C2410C',
        text: '#FFFFFF'
      },
      purple: {
        background: '#7C3AED',
        border: '#6D28D9',
        text: '#FFFFFF'
      }
    };

    const colors = colorMap[settings.criticalPathColor];

    return `
      .gantt-task-critical {
        background-color: ${colors.background} !important;
        border-color: ${colors.border} !important;
        color: ${colors.text} !important;
        font-weight: 600 !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }
      
      .gantt-task-critical::before {
        content: "⚠";
        position: absolute;
        left: -8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        color: ${colors.background};
        background: white;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      .gantt-task-critical:hover {
        background-color: ${colors.border} !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
      }
      
      .gantt-critical-path-indicator {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, ${colors.background}, ${colors.border});
        z-index: 10;
      }
    `;
  }

  /**
   * Apply critical path highlighting to DOM
   */
  applyCriticalPathHighlighting(settings: CriticalPathHighlightingSettings): void {
    try {
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById('constructbms-critical-path');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const styleTag = document.createElement('style');
      styleTag.id = 'constructbms-critical-path';
      styleTag.textContent = this.generateCriticalPathCSS(settings);
      
      document.head.appendChild(styleTag);
      
      console.log('Critical path highlighting applied to DOM');
    } catch (error) {
      console.error('Error applying critical path highlighting to DOM:', error);
    }
  }

  /**
   * Get color value for critical path
   */
  getCriticalPathColorValue(color: CriticalPathColorOption): string {
    const colorMap = {
      red: '#DC2626',
      orange: '#EA580C',
      purple: '#7C3AED'
    };
    return colorMap[color];
  }

  /**
   * Validate critical path highlighting settings
   */
  validateCriticalPathHighlightingSettings(settings: CriticalPathHighlightingSettings): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate show critical path
    if (typeof settings.showCriticalPath !== 'boolean') {
      errors.push('Invalid show critical path value');
    }
    
    // Validate critical path color
    if (!['red', 'orange', 'purple'].includes(settings.criticalPathColor)) {
      errors.push('Invalid critical path color option');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get preview HTML for critical path highlighting
   */
  getCriticalPathPreview(settings: CriticalPathHighlightingSettings): string {
    if (!settings.showCriticalPath) {
      return `
        <div class="critical-path-preview" style="
          width: 200px;
          height: 40px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          background-color: #3b82f6;
          margin: 8px 0;
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 12px;
            font-weight: 500;
          ">
            Critical Path Disabled
          </div>
        </div>
      `;
    }

    const colorValue = this.getCriticalPathColorValue(settings.criticalPathColor);
    
    return `
      <div class="critical-path-preview" style="
        width: 200px;
        height: 40px;
        border: 2px solid ${colorValue};
        border-radius: 4px;
        background-color: ${colorValue};
        margin: 8px 0;
        position: relative;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      ">
        <div style="
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: ${colorValue};
          background: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        ">
          ⚠
        </div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: 600;
        ">
          Critical Task
        </div>
      </div>
    `;
  }

  /**
   * Export critical path highlighting as CSS
   */
  exportCriticalPathHighlightingAsCSS(settings: CriticalPathHighlightingSettings): string {
    return `/* ConstructBMS Critical Path Highlighting */
${this.generateCriticalPathCSS(settings)}

/* Usage Examples */
.gantt-task.critical {
  /* Apply critical path styling */
}

/* Custom Variables */
:root {
  --critical-path-enabled: ${settings.showCriticalPath ? 'true' : 'false'};
  --critical-path-color: ${this.getCriticalPathColorValue(settings.criticalPathColor)};
}
`;
  }

  /**
   * Clear all critical path highlighting settings
   */
  async clearAllCriticalPathHighlightingSettings(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All critical path highlighting settings cleared');
    } catch (error) {
      console.error('Error clearing critical path highlighting settings:', error);
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
        await this.clearAllCriticalPathHighlightingSettings();
        await this.updateConfig({ demo: false });
        console.log('Demo critical path highlighting data reset');
      }
    } catch (error) {
      console.error('Error resetting demo critical path highlighting data:', error);
      throw error;
    }
  }
}

export const criticalPathHighlightingService = new CriticalPathHighlightingService(); 