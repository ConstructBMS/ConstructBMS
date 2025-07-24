import { persistentStorage } from './persistentStorage';

export type TimeScaleOption = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface GanttZoomScaleSettings {
  demo?: boolean;
  timeScale: TimeScaleOption;
  zoomLevel: number;
}

export interface GanttZoomScaleConfig {
  autoApply: boolean;
  demo?: boolean;
  enabled: boolean;
  maxZoomLevel: number;
  minZoomLevel: number;
}

// Default ConstructBMS Gantt zoom and scale settings
const defaultSettings: GanttZoomScaleSettings = {
  zoomLevel: 1,
  timeScale: 'daily'
};

class GanttZoomScaleService {
  private configKey = 'ganttZoomScaleConfig';
  private settingsKey = 'ganttZoomScaleSettings';

  // Default configuration
  private defaultConfig: GanttZoomScaleConfig = {
    enabled: true,
    autoApply: true,
    maxZoomLevel: 5,
    minZoomLevel: 0.1,
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<GanttZoomScaleConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting Gantt zoom scale config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<GanttZoomScaleConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Gantt zoom scale config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating Gantt zoom scale config:', error);
      throw error;
    }
  }

  /**
   * Get Gantt zoom and scale settings for project
   */
  async getGanttZoomScaleSettings(projectId: string): Promise<GanttZoomScaleSettings> {
    try {
      const config = await this.getConfig();
      const settings = await persistentStorage.get(`${this.settingsKey}_${projectId}`);
      
      if (settings) {
        return settings;
      }
      
      // Return default settings if none exist
      return defaultSettings;
    } catch (error) {
      console.error('Error getting Gantt zoom scale settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Save Gantt zoom and scale settings for project
   */
  async saveGanttZoomScaleSettings(projectId: string, settings: GanttZoomScaleSettings): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Apply demo mode limits
      if (config.demo) {
        const limitedSettings = { ...settings };
        
        // Limit zoom level to daily maximum in demo
        if (limitedSettings.zoomLevel > 1) {
          limitedSettings.zoomLevel = 1;
        }
        
        // Only allow Daily, Weekly, and Monthly scales in demo
        if (!['daily', 'weekly', 'monthly'].includes(limitedSettings.timeScale)) {
          limitedSettings.timeScale = 'daily';
        }
        
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, {
          ...limitedSettings,
          demo: true
        });
      } else {
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, settings);
      }
      
      console.log('Gantt zoom scale settings saved for project:', projectId);
    } catch (error) {
      console.error('Error saving Gantt zoom scale settings:', error);
      throw error;
    }
  }

  /**
   * Reset Gantt zoom and scale settings to defaults
   */
  async resetGanttZoomScaleSettings(projectId: string): Promise<void> {
    try {
      await persistentStorage.set(`${this.settingsKey}_${projectId}`, defaultSettings);
      console.log('Gantt zoom scale settings reset to defaults for project:', projectId);
    } catch (error) {
      console.error('Error resetting Gantt zoom scale settings:', error);
      throw error;
    }
  }

  /**
   * Calculate zoom level based on time scale
   */
  calculateZoomLevel(timeScale: TimeScaleOption): number {
    const zoomMap = {
      hourly: 3,
      daily: 1,
      weekly: 0.5,
      monthly: 0.2,
      quarterly: 0.1
    };
    return zoomMap[timeScale];
  }

  /**
   * Calculate time scale based on zoom level
   */
  calculateTimeScale(zoomLevel: number): TimeScaleOption {
    if (zoomLevel >= 2.5) return 'hourly';
    if (zoomLevel >= 0.8) return 'daily';
    if (zoomLevel >= 0.3) return 'weekly';
    if (zoomLevel >= 0.15) return 'monthly';
    return 'quarterly';
  }

  /**
   * Get CSS variables for Gantt zoom and scale
   */
  generateGanttZoomScaleCSS(settings: GanttZoomScaleSettings): string {
    const zoomLevel = settings.zoomLevel;
    const timeScale = settings.timeScale;
    
    // Calculate column width based on zoom level
    const columnWidth = Math.max(50, 100 * zoomLevel);
    
    // Calculate header height based on time scale
    const headerHeight = timeScale === 'hourly' ? 60 : timeScale === 'daily' ? 40 : 30;
    
    return `
      :root {
        --gantt-zoom-level: ${zoomLevel};
        --gantt-time-scale: "${timeScale}";
        --gantt-column-width: ${columnWidth}px;
        --gantt-header-height: ${headerHeight}px;
        --gantt-grid-spacing: ${Math.max(10, 20 * zoomLevel)}px;
      }
      
      .gantt-timeline {
        --column-width: var(--gantt-column-width);
        --header-height: var(--gantt-header-height);
        --grid-spacing: var(--gantt-grid-spacing);
      }
      
      .gantt-header-cell {
        width: var(--column-width);
        height: var(--header-height);
        border-right: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${Math.max(10, 12 * zoomLevel)}px;
        font-weight: 500;
        background-color: #f9fafb;
        color: #374151;
      }
      
      .gantt-grid-cell {
        width: var(--column-width);
        height: 30px;
        border-right: 1px solid #f3f4f6;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .gantt-task-bar {
        height: 20px;
        border-radius: 3px;
        position: relative;
        transition: all 0.2s ease;
      }
      
      .gantt-task-bar:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      /* Time scale specific styles */
      .gantt-timeline[data-scale="hourly"] .gantt-header-cell {
        font-size: 10px;
        padding: 2px;
      }
      
      .gantt-timeline[data-scale="daily"] .gantt-header-cell {
        font-size: 12px;
        padding: 4px;
      }
      
      .gantt-timeline[data-scale="weekly"] .gantt-header-cell {
        font-size: 14px;
        padding: 6px;
      }
      
      .gantt-timeline[data-scale="monthly"] .gantt-header-cell {
        font-size: 16px;
        padding: 8px;
      }
      
      .gantt-timeline[data-scale="quarterly"] .gantt-header-cell {
        font-size: 18px;
        padding: 10px;
      }
    `;
  }

  /**
   * Apply Gantt zoom and scale to DOM
   */
  applyGanttZoomScale(settings: GanttZoomScaleSettings): void {
    try {
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById('constructbms-gantt-zoom-scale');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const styleTag = document.createElement('style');
      styleTag.id = 'constructbms-gantt-zoom-scale';
      styleTag.textContent = this.generateGanttZoomScaleCSS(settings);
      
      document.head.appendChild(styleTag);
      
      // Update timeline data attributes
      const timelineElements = document.querySelectorAll('.gantt-timeline');
      timelineElements.forEach(element => {
        element.setAttribute('data-scale', settings.timeScale);
        element.setAttribute('data-zoom', settings.zoomLevel.toString());
      });
      
      console.log('Gantt zoom scale applied to DOM');
    } catch (error) {
      console.error('Error applying Gantt zoom scale to DOM:', error);
    }
  }

  /**
   * Get time scale label
   */
  getTimeScaleLabel(timeScale: TimeScaleOption): string {
    const labels = {
      hourly: 'Hourly',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly'
    };
    return labels[timeScale];
  }

  /**
   * Get time scale description
   */
  getTimeScaleDescription(timeScale: TimeScaleOption): string {
    const descriptions = {
      hourly: 'Show hours on timeline',
      daily: 'Show days on timeline',
      weekly: 'Show weeks on timeline',
      monthly: 'Show months on timeline',
      quarterly: 'Show quarters on timeline'
    };
    return descriptions[timeScale];
  }

  /**
   * Validate Gantt zoom and scale settings
   */
  validateGanttZoomScaleSettings(settings: GanttZoomScaleSettings): { errors: string[], isValid: boolean; } {
    const errors: string[] = [];
    
    // Validate zoom level
    if (typeof settings.zoomLevel !== 'number' || settings.zoomLevel < 0) {
      errors.push('Invalid zoom level value');
    }
    
    // Validate time scale
    if (!['hourly', 'daily', 'weekly', 'monthly', 'quarterly'].includes(settings.timeScale)) {
      errors.push('Invalid time scale option');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get preview HTML for Gantt zoom and scale
   */
  getGanttZoomScalePreview(settings: GanttZoomScaleSettings): string {
    const timeScaleLabel = this.getTimeScaleLabel(settings.timeScale);
    const zoomPercentage = Math.round(settings.zoomLevel * 100);
    
    return `
      <div class="gantt-zoom-scale-preview" style="
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        background-color: white;
        margin: 8px 0;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 500; color: #374151;">Timeline Preview</span>
          <span style="font-size: 12px; color: #6b7280;">${zoomPercentage}% zoom</span>
        </div>
        <div style="
          height: 40px;
          background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 20px;
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #6b7280;
            font-weight: 500;
          ">
            ${timeScaleLabel} Scale
          </div>
          <div style="
            position: absolute;
            top: 20px;
            left: 0;
            right: 0;
            height: 20px;
            display: flex;
            align-items: center;
            padding: 0 8px;
          ">
            <div style="
              width: ${Math.max(20, 60 * settings.zoomLevel)}px;
              height: 12px;
              background-color: #3b82f6;
              border-radius: 2px;
              margin-right: 8px;
            "></div>
            <span style="font-size: 10px; color: #6b7280;">Task Bar</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Export Gantt zoom and scale as CSS
   */
  exportGanttZoomScaleAsCSS(settings: GanttZoomScaleSettings): string {
    return `/* ConstructBMS Gantt Zoom & Scale */
${this.generateGanttZoomScaleCSS(settings)}

/* Usage Examples */
.gantt-timeline {
  /* Apply zoom and scale settings */
}

/* Custom Variables */
:root {
  --gantt-zoom-level: ${settings.zoomLevel};
  --gantt-time-scale: "${settings.timeScale}";
  --gantt-column-width: ${Math.max(50, 100 * settings.zoomLevel)}px;
  --gantt-header-height: ${settings.timeScale === 'hourly' ? 60 : settings.timeScale === 'daily' ? 40 : 30}px;
}
`;
  }

  /**
   * Clear all Gantt zoom and scale settings
   */
  async clearAllGanttZoomScaleSettings(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All Gantt zoom scale settings cleared');
    } catch (error) {
      console.error('Error clearing Gantt zoom scale settings:', error);
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
        await this.clearAllGanttZoomScaleSettings();
        await this.updateConfig({ demo: false });
        console.log('Demo Gantt zoom scale data reset');
      }
    } catch (error) {
      console.error('Error resetting demo Gantt zoom scale data:', error);
      throw error;
    }
  }
}

export const ganttZoomScaleService = new GanttZoomScaleService(); 