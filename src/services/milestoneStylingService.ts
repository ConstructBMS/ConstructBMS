import { persistentStorage } from './persistentStorage';

export type MilestoneIconType = 'diamond' | 'flag' | 'dot' | 'star';
export type MilestoneColorOption = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';

export interface MilestoneStylingSettings {
  color: MilestoneColorOption;
  demo?: boolean;
  icon: MilestoneIconType;
  showLabel: boolean;
}

export interface MilestoneStylingConfig {
  autoApply: boolean;
  demo?: boolean;
  enabled: boolean;
}

// Default ConstructBMS milestone styling settings
const defaultSettings: MilestoneStylingSettings = {
  icon: 'diamond',
  color: 'gray',
  showLabel: true
};

class MilestoneStylingService {
  private configKey = 'milestoneStylingConfig';
  private settingsKey = 'milestoneStylingSettings';

  // Default configuration
  private defaultConfig: MilestoneStylingConfig = {
    enabled: true,
    autoApply: true,
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<MilestoneStylingConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting milestone styling config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<MilestoneStylingConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Milestone styling config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating milestone styling config:', error);
      throw error;
    }
  }

  /**
   * Get milestone styling settings for project
   */
  async getMilestoneStylingSettings(projectId: string): Promise<MilestoneStylingSettings> {
    try {
      const config = await this.getConfig();
      const settings = await persistentStorage.get(`${this.settingsKey}_${projectId}`);
      
      if (settings) {
        return settings;
      }
      
      // Return default settings if none exist
      return defaultSettings;
    } catch (error) {
      console.error('Error getting milestone styling settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Save milestone styling settings for project
   */
  async saveMilestoneStylingSettings(projectId: string, settings: MilestoneStylingSettings): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Limit options in demo mode
      if (config.demo) {
        const limitedSettings = { ...settings };
        
        // Only allow diamond icon and gray color in demo mode
        if (limitedSettings.icon !== 'diamond') {
          limitedSettings.icon = 'diamond';
        }
        if (limitedSettings.color !== 'gray') {
          limitedSettings.color = 'gray';
        }
        // Labels are disabled in demo mode
        limitedSettings.showLabel = false;
        
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, {
          ...limitedSettings,
          demo: true
        });
      } else {
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, settings);
      }
      
      console.log('Milestone styling settings saved for project:', projectId);
    } catch (error) {
      console.error('Error saving milestone styling settings:', error);
      throw error;
    }
  }

  /**
   * Reset milestone styling settings to defaults
   */
  async resetMilestoneStylingSettings(projectId: string): Promise<void> {
    try {
      await persistentStorage.set(`${this.settingsKey}_${projectId}`, defaultSettings);
      console.log('Milestone styling settings reset to defaults for project:', projectId);
    } catch (error) {
      console.error('Error resetting milestone styling settings:', error);
      throw error;
    }
  }

  /**
   * Get CSS classes for milestone styling
   */
  generateMilestoneCSS(settings: MilestoneStylingSettings): string {
    const colorMap = {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#8B5CF6',
      orange: '#F59E0B',
      red: '#EF4444',
      gray: '#6B7280'
    };

    const iconMap = {
      diamond: '◇',
      flag: '⚑',
      dot: '●',
      star: '★'
    };

    const color = colorMap[settings.color];
    const icon = iconMap[settings.icon];

    return `
      .gantt-milestone {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        background-color: ${color};
        border: 2px solid ${color};
        border-radius: ${settings.icon === 'dot' ? '50%' : '0'};
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        z-index: 10;
      }
      
      .gantt-milestone::before {
        content: "${icon}";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 10px;
        line-height: 1;
      }
      
      .gantt-milestone:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
      }
      
      .gantt-milestone-label {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        white-space: nowrap;
        z-index: 20;
        ${settings.showLabel ? 'display: block;' : 'display: none;'}
      }
      
      .gantt-milestone-label::before {
        content: '';
        position: absolute;
        left: -4px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        border-right: 4px solid rgba(0, 0, 0, 0.8);
      }
      
      .gantt-milestone-container {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      
      /* Specific icon styles */
      .gantt-milestone.diamond {
        transform: rotate(45deg);
      }
      
      .gantt-milestone.diamond::before {
        transform: translate(-50%, -50%) rotate(-45deg);
      }
      
      .gantt-milestone.flag {
        border-radius: 2px 8px 8px 2px;
      }
      
      .gantt-milestone.star {
        background: radial-gradient(circle, ${color} 30%, transparent 30%);
      }
    `;
  }

  /**
   * Apply milestone styling to DOM
   */
  applyMilestoneStyling(settings: MilestoneStylingSettings): void {
    try {
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById('constructbms-milestone-styling');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const styleTag = document.createElement('style');
      styleTag.id = 'constructbms-milestone-styling';
      styleTag.textContent = this.generateMilestoneCSS(settings);
      
      document.head.appendChild(styleTag);
      
      console.log('Milestone styling applied to DOM');
    } catch (error) {
      console.error('Error applying milestone styling to DOM:', error);
    }
  }

  /**
   * Get color value for milestone
   */
  getMilestoneColorValue(color: MilestoneColorOption): string {
    const colorMap = {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#8B5CF6',
      orange: '#F59E0B',
      red: '#EF4444',
      gray: '#6B7280'
    };
    return colorMap[color];
  }

  /**
   * Get icon symbol for milestone
   */
  getMilestoneIconSymbol(icon: MilestoneIconType): string {
    const iconMap = {
      diamond: '◇',
      flag: '⚑',
      dot: '●',
      star: '★'
    };
    return iconMap[icon];
  }

  /**
   * Validate milestone styling settings
   */
  validateMilestoneStylingSettings(settings: MilestoneStylingSettings): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];
    
    // Validate icon
    if (!['diamond', 'flag', 'dot', 'star'].includes(settings.icon)) {
      errors.push('Invalid milestone icon option');
    }
    
    // Validate color
    if (!['blue', 'green', 'purple', 'orange', 'red', 'gray'].includes(settings.color)) {
      errors.push('Invalid milestone color option');
    }
    
    // Validate show label
    if (typeof settings.showLabel !== 'boolean') {
      errors.push('Invalid show label value');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get preview HTML for milestone styling
   */
  getMilestonePreview(settings: MilestoneStylingSettings): string {
    const color = this.getMilestoneColorValue(settings.color);
    const icon = this.getMilestoneIconSymbol(settings.icon);
    
    return `
      <div class="milestone-preview" style="
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        background-color: white;
        margin: 8px 0;
      ">
        <div style="
          width: 16px;
          height: 16px;
          background-color: ${color};
          border: 2px solid ${color};
          border-radius: ${settings.icon === 'dot' ? '50%' : '0'};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
          ${settings.icon === 'diamond' ? 'transform: rotate(45deg);' : ''}
        ">
          ${settings.icon === 'diamond' ? `<span style="transform: rotate(-45deg);">${icon}</span>` : icon}
        </div>
        ${settings.showLabel ? `
          <span style="
            font-size: 12px;
            color: #374151;
            font-weight: 500;
          ">
            Project Milestone
          </span>
        ` : ''}
      </div>
    `;
  }

  /**
   * Export milestone styling as CSS
   */
  exportMilestoneStylingAsCSS(settings: MilestoneStylingSettings): string {
    return `/* ConstructBMS Milestone Styling */
${this.generateMilestoneCSS(settings)}

/* Usage Examples */
.gantt-task.milestone {
  /* Apply milestone styling */
}

/* Custom Variables */
:root {
  --milestone-icon: "${settings.icon}";
  --milestone-color: "${this.getMilestoneColorValue(settings.color)}";
  --milestone-show-label: ${settings.showLabel ? 'true' : 'false'};
}
`;
  }

  /**
   * Clear all milestone styling settings
   */
  async clearAllMilestoneStylingSettings(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All milestone styling settings cleared');
    } catch (error) {
      console.error('Error clearing milestone styling settings:', error);
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
        await this.clearAllMilestoneStylingSettings();
        await this.updateConfig({ demo: false });
        console.log('Demo milestone styling data reset');
      }
    } catch (error) {
      console.error('Error resetting demo milestone styling data:', error);
      throw error;
    }
  }
}

export const milestoneStylingService = new MilestoneStylingService(); 