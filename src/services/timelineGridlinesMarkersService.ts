import { persistentStorage } from './persistentStorage';

export type GridlineStyle = 'none' | 'solid' | 'dotted' | 'dashed';

export interface CustomDateMarker {
  id: string;
  date: Date;
  label: string;
  color: string;
  projectId: string;
  userId: string;
  demo?: boolean;
}

export interface TimelineGridlinesMarkersSettings {
  showTodayMarker: boolean;
  gridlineStyle: GridlineStyle;
  demo?: boolean;
}

export interface TimelineGridlinesMarkersConfig {
  enabled: boolean;
  autoApply: boolean;
  maxCustomMarkers: number;
  demo?: boolean;
}

// Default ConstructBMS timeline gridlines and markers settings
const defaultSettings: TimelineGridlinesMarkersSettings = {
  showTodayMarker: true,
  gridlineStyle: 'dotted'
};

class TimelineGridlinesMarkersService {
  private configKey = 'timelineGridlinesMarkersConfig';
  private settingsKey = 'timelineGridlinesMarkersSettings';
  private markersKey = 'timelineCustomMarkers';

  // Default configuration
  private defaultConfig: TimelineGridlinesMarkersConfig = {
    enabled: true,
    autoApply: true,
    maxCustomMarkers: 10,
    demo: false
  };

  /**
   * Get current configuration
   */
  async getConfig(): Promise<TimelineGridlinesMarkersConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || this.defaultConfig;
    } catch (error) {
      console.error('Error getting timeline gridlines markers config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<TimelineGridlinesMarkersConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Timeline gridlines markers config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating timeline gridlines markers config:', error);
      throw error;
    }
  }

  /**
   * Get timeline gridlines and markers settings for project
   */
  async getTimelineGridlinesMarkersSettings(projectId: string): Promise<TimelineGridlinesMarkersSettings> {
    try {
      const config = await this.getConfig();
      const settings = await persistentStorage.get(`${this.settingsKey}_${projectId}`);
      
      if (settings) {
        return settings;
      }
      
      // Return default settings if none exist
      return defaultSettings;
    } catch (error) {
      console.error('Error getting timeline gridlines markers settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Save timeline gridlines and markers settings for project
   */
  async saveTimelineGridlinesMarkersSettings(projectId: string, settings: Partial<TimelineGridlinesMarkersSettings>): Promise<void> {
    try {
      const config = await this.getConfig();
      const currentSettings = await this.getTimelineGridlinesMarkersSettings(projectId);
      
      // Apply demo mode limits
      if (config.demo) {
        const limitedSettings = { ...currentSettings, ...settings };
        
        // Fix gridline style to dotted in demo mode
        if (limitedSettings.gridlineStyle !== 'dotted') {
          limitedSettings.gridlineStyle = 'dotted';
        }
        
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, {
          ...limitedSettings,
          demo: true
        });
      } else {
        await persistentStorage.set(`${this.settingsKey}_${projectId}`, {
          ...currentSettings,
          ...settings
        });
      }
      
      console.log('Timeline gridlines markers settings saved for project:', projectId);
    } catch (error) {
      console.error('Error saving timeline gridlines markers settings:', error);
      throw error;
    }
  }

  /**
   * Get custom date markers for project
   */
  async getCustomDateMarkers(projectId: string): Promise<CustomDateMarker[]> {
    try {
      const config = await this.getConfig();
      const markers = await persistentStorage.get(`${this.markersKey}_${projectId}`);
      
      if (markers) {
        return markers;
      }
      
      // Return empty array if none exist
      return [];
    } catch (error) {
      console.error('Error getting custom date markers:', error);
      return [];
    }
  }

  /**
   * Save custom date marker
   */
  async saveCustomDateMarker(projectId: string, marker: Omit<CustomDateMarker, 'id' | 'userId'>): Promise<void> {
    try {
      const config = await this.getConfig();
      const markers = await this.getCustomDateMarkers(projectId);
      
      // Apply demo mode limits
      if (config.demo) {
        if (markers.length >= 1) {
          throw new Error('Only one custom marker allowed in demo mode');
        }
      } else {
        if (markers.length >= config.maxCustomMarkers) {
          throw new Error(`Maximum ${config.maxCustomMarkers} custom markers allowed`);
        }
      }
      
      const newMarker: CustomDateMarker = {
        ...marker,
        id: `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'current-user', // This would come from auth context
        demo: config.demo
      };
      
      const updatedMarkers = [...markers, newMarker];
      await persistentStorage.set(`${this.markersKey}_${projectId}`, updatedMarkers);
      
      console.log('Custom date marker saved:', newMarker.label);
    } catch (error) {
      console.error('Error saving custom date marker:', error);
      throw error;
    }
  }

  /**
   * Delete custom date marker
   */
  async deleteCustomDateMarker(projectId: string, markerId: string): Promise<void> {
    try {
      const markers = await this.getCustomDateMarkers(projectId);
      const filteredMarkers = markers.filter(marker => marker.id !== markerId);
      
      await persistentStorage.set(`${this.markersKey}_${projectId}`, filteredMarkers);
      console.log('Custom date marker deleted:', markerId);
    } catch (error) {
      console.error('Error deleting custom date marker:', error);
      throw error;
    }
  }

  /**
   * Reset timeline gridlines and markers settings to defaults
   */
  async resetTimelineGridlinesMarkersSettings(projectId: string): Promise<void> {
    try {
      await persistentStorage.set(`${this.settingsKey}_${projectId}`, defaultSettings);
      console.log('Timeline gridlines markers settings reset to defaults for project:', projectId);
    } catch (error) {
      console.error('Error resetting timeline gridlines markers settings:', error);
      throw error;
    }
  }

  /**
   * Get CSS for timeline gridlines and markers
   */
  generateTimelineGridlinesMarkersCSS(settings: TimelineGridlinesMarkersSettings, markers: CustomDateMarker[]): string {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    return `
      /* Timeline Gridlines & Markers */
      
      /* Gridlines */
      .timeline-gridlines {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 1;
      }
      
      .timeline-gridline {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background-color: ${settings.gridlineStyle === 'none' ? 'transparent' : 
          settings.gridlineStyle === 'solid' ? '#e5e7eb' :
          settings.gridlineStyle === 'dotted' ? '#f3f4f6' : '#f9fafb'};
        ${settings.gridlineStyle === 'dotted' ? 'border-left: 1px dotted #d1d5db;' : ''}
        ${settings.gridlineStyle === 'dashed' ? 'border-left: 1px dashed #d1d5db;' : ''}
      }
      
      .dark .timeline-gridline {
        background-color: ${settings.gridlineStyle === 'none' ? 'transparent' : 
          settings.gridlineStyle === 'solid' ? '#4b5563' :
          settings.gridlineStyle === 'dotted' ? '#374151' : '#1f2937'};
        ${settings.gridlineStyle === 'dotted' ? 'border-left: 1px dotted #6b7280;' : ''}
        ${settings.gridlineStyle === 'dashed' ? 'border-left: 1px dashed #6b7280;' : ''}
      }
      
      /* Today Marker */
      ${settings.showTodayMarker ? `
        .timeline-today-marker {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: #ef4444;
          z-index: 10;
          pointer-events: none;
        }
        
        .timeline-today-marker::before {
          content: '';
          position: absolute;
          top: 0;
          left: -4px;
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #ef4444;
        }
        
        .timeline-today-marker::after {
          content: 'Today';
          position: absolute;
          top: 8px;
          left: 8px;
          background-color: #ef4444;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 500;
          white-space: nowrap;
        }
      ` : ''}
      
      /* Custom Date Markers */
      .timeline-custom-marker {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        z-index: 10;
        pointer-events: none;
        transition: all 0.2s ease;
      }
      
      .timeline-custom-marker:hover {
        width: 4px;
        cursor: pointer;
      }
      
      .timeline-custom-marker::before {
        content: '';
        position: absolute;
        top: 0;
        left: -3px;
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid currentColor;
      }
      
      .timeline-custom-marker::after {
        content: attr(data-label);
        position: absolute;
        top: 8px;
        left: 8px;
        background-color: currentColor;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: 500;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .timeline-custom-marker:hover::after {
        opacity: 1;
      }
      
      /* Marker positioning */
      ${markers.map(marker => `
        .timeline-custom-marker[data-marker-id="${marker.id}"] {
          color: ${marker.color};
        }
      `).join('')}
      
      /* Timeline container */
      .timeline-container {
        position: relative;
        overflow: hidden;
      }
      
      /* Ensure markers render above task bars but below tooltips */
      .timeline-task-bar {
        z-index: 5;
      }
      
      .timeline-tooltip {
        z-index: 20;
      }
    `;
  }

  /**
   * Apply timeline gridlines and markers to DOM
   */
  applyTimelineGridlinesMarkers(settings: TimelineGridlinesMarkersSettings, markers: CustomDateMarker[]): void {
    try {
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById('constructbms-timeline-gridlines-markers');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const styleTag = document.createElement('style');
      styleTag.id = 'constructbms-timeline-gridlines-markers';
      styleTag.textContent = this.generateTimelineGridlinesMarkersCSS(settings, markers);
      
      document.head.appendChild(styleTag);
      
      // Update timeline data attributes
      const timelineElements = document.querySelectorAll('.timeline, .gantt-timeline');
      timelineElements.forEach(element => {
        element.setAttribute('data-show-today', settings.showTodayMarker.toString());
        element.setAttribute('data-gridline-style', settings.gridlineStyle);
        element.setAttribute('data-custom-markers', markers.length.toString());
      });
      
      console.log('Timeline gridlines and markers applied to DOM');
    } catch (error) {
      console.error('Error applying timeline gridlines and markers to DOM:', error);
    }
  }

  /**
   * Get gridline style label
   */
  getGridlineStyleLabel(style: GridlineStyle): string {
    const labels = {
      none: 'None',
      solid: 'Solid',
      dotted: 'Dotted',
      dashed: 'Dashed'
    };
    return labels[style];
  }

  /**
   * Get gridline style description
   */
  getGridlineStyleDescription(style: GridlineStyle): string {
    const descriptions = {
      none: 'No gridlines',
      solid: 'Full contrast lines',
      dotted: 'Lower contrast dots',
      dashed: 'Broken line pattern'
    };
    return descriptions[style];
  }

  /**
   * Validate timeline gridlines and markers settings
   */
  validateTimelineGridlinesMarkersSettings(settings: TimelineGridlinesMarkersSettings): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate show today marker
    if (typeof settings.showTodayMarker !== 'boolean') {
      errors.push('Invalid show today marker value');
    }
    
    // Validate gridline style
    if (!['none', 'solid', 'dotted', 'dashed'].includes(settings.gridlineStyle)) {
      errors.push('Invalid gridline style option');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get preview HTML for timeline gridlines and markers
   */
  getTimelineGridlinesMarkersPreview(settings: TimelineGridlinesMarkersSettings, markers: CustomDateMarker[]): string {
    return `
      <div class="timeline-gridlines-markers-preview" style="
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
          Timeline Preview
        </div>
        <div style="
          position: relative;
          height: 60px;
          background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
          overflow: hidden;
        ">
          <!-- Gridlines -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: space-between;
          ">
            ${Array.from({ length: 5 }, (_, i) => `
              <div style="
                width: 1px;
                height: 100%;
                background-color: ${settings.gridlineStyle === 'none' ? 'transparent' : 
                  settings.gridlineStyle === 'solid' ? '#e5e7eb' :
                  settings.gridlineStyle === 'dotted' ? '#f3f4f6' : '#f9fafb'};
                ${settings.gridlineStyle === 'dotted' ? 'border-left: 1px dotted #d1d5db;' : ''}
                ${settings.gridlineStyle === 'dashed' ? 'border-left: 1px dashed #d1d5db;' : ''}
              "></div>
            `).join('')}
          </div>
          
          <!-- Today Marker -->
          ${settings.showTodayMarker ? `
            <div style="
              position: absolute;
              top: 0;
              bottom: 0;
              left: 50%;
              width: 2px;
              background-color: #ef4444;
              transform: translateX(-50%);
            ">
              <div style="
                position: absolute;
                top: 0;
                left: -4px;
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 5px solid #ef4444;
              "></div>
              <div style="
                position: absolute;
                top: 8px;
                left: 8px;
                background-color: #ef4444;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: 500;
              ">
                Today
              </div>
            </div>
          ` : ''}
          
          <!-- Custom Markers -->
          ${markers.map((marker, index) => `
            <div style="
              position: absolute;
              top: 0;
              bottom: 0;
              left: ${20 + (index * 15)}%;
              width: 2px;
              background-color: ${marker.color};
            ">
              <div style="
                position: absolute;
                top: 0;
                left: -3px;
                width: 0;
                height: 0;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 4px solid ${marker.color};
              "></div>
            </div>
          `).join('')}
          
          <!-- Task Bar Example -->
          <div style="
            position: absolute;
            top: 50%;
            left: 10%;
            right: 10%;
            height: 20px;
            background-color: #3b82f6;
            border-radius: 3px;
            transform: translateY(-50%);
          "></div>
        </div>
      </div>
    `;
  }

  /**
   * Export timeline gridlines and markers as CSS
   */
  exportTimelineGridlinesMarkersAsCSS(settings: TimelineGridlinesMarkersSettings, markers: CustomDateMarker[]): string {
    return `/* ConstructBMS Timeline Gridlines & Markers */
${this.generateTimelineGridlinesMarkersCSS(settings, markers)}

/* Usage Examples */
.timeline {
  /* Apply timeline gridlines and markers */
}

/* Custom Variables */
:root {
  --timeline-show-today: ${settings.showTodayMarker ? 'true' : 'false'};
  --timeline-gridline-style: "${settings.gridlineStyle}";
  --timeline-custom-markers-count: ${markers.length};
}
`;
  }

  /**
   * Clear all timeline gridlines and markers settings
   */
  async clearAllTimelineGridlinesMarkersSettings(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All timeline gridlines markers settings cleared');
    } catch (error) {
      console.error('Error clearing timeline gridlines markers settings:', error);
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
        await this.clearAllTimelineGridlinesMarkersSettings();
        await this.updateConfig({ demo: false });
        console.log('Demo timeline gridlines markers data reset');
      }
    } catch (error) {
      console.error('Error resetting demo timeline gridlines markers data:', error);
      throw error;
    }
  }
}

export const timelineGridlinesMarkersService = new TimelineGridlinesMarkersService(); 