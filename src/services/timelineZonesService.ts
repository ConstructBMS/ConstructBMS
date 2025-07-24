import { persistentStorage } from './persistentStorage';

export interface TimelineZone {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  color: string;
  tag?: string;
  demo?: boolean;
}

export interface TimelineZonesConfig {
  enabled: boolean;
  maxZones: number;
  demo?: boolean;
}

// Default ConstructBMS timeline zones configuration
const defaultConfig: TimelineZonesConfig = {
  enabled: true,
  maxZones: 10,
  demo: false
};

class TimelineZonesService {
  private configKey = 'timelineZonesConfig';
  private zonesKey = 'timelineZones';

  /**
   * Get current configuration
   */
  async getConfig(): Promise<TimelineZonesConfig> {
    try {
      const config = await persistentStorage.get(this.configKey);
      return config || defaultConfig;
    } catch (error) {
      console.error('Error getting timeline zones config:', error);
      return defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<TimelineZonesConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      await persistentStorage.set(this.configKey, updatedConfig);
      
      console.log('Timeline zones config updated:', updatedConfig);
    } catch (error) {
      console.error('Error updating timeline zones config:', error);
      throw error;
    }
  }

  /**
   * Get timeline zones for project
   */
  async getTimelineZones(projectId: string): Promise<TimelineZone[]> {
    try {
      const zones = await persistentStorage.get(`${this.zonesKey}_${projectId}`);
      return zones || [];
    } catch (error) {
      console.error('Error getting timeline zones:', error);
      return [];
    }
  }

  /**
   * Add timeline zone to project
   */
  async addTimelineZone(projectId: string, zone: Omit<TimelineZone, 'id'>): Promise<TimelineZone> {
    try {
      const config = await this.getConfig();
      const zones = await this.getTimelineZones(projectId);
      
      // Limit zones in demo mode
      if (config.demo && zones.length >= 2) {
        throw new Error('Demo mode limited to 2 zones maximum');
      }
      
      const newZone: TimelineZone = {
        ...zone,
        id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        demo: config.demo
      };
      
      const updatedZones = [...zones, newZone];
      await persistentStorage.set(`${this.zonesKey}_${projectId}`, updatedZones);
      
      console.log('Timeline zone added:', newZone);
      return newZone;
    } catch (error) {
      console.error('Error adding timeline zone:', error);
      throw error;
    }
  }

  /**
   * Update timeline zone
   */
  async updateTimelineZone(projectId: string, zoneId: string, updates: Partial<TimelineZone>): Promise<void> {
    try {
      const zones = await this.getTimelineZones(projectId);
      const zoneIndex = zones.findIndex(zone => zone.id === zoneId);
      
      if (zoneIndex === -1) {
        throw new Error('Zone not found');
      }
      
      zones[zoneIndex] = { ...zones[zoneIndex], ...updates };
      await persistentStorage.set(`${this.zonesKey}_${projectId}`, zones);
      
      console.log('Timeline zone updated:', zones[zoneIndex]);
    } catch (error) {
      console.error('Error updating timeline zone:', error);
      throw error;
    }
  }

  /**
   * Delete timeline zone
   */
  async deleteTimelineZone(projectId: string, zoneId: string): Promise<void> {
    try {
      const zones = await this.getTimelineZones(projectId);
      const updatedZones = zones.filter(zone => zone.id !== zoneId);
      await persistentStorage.set(`${this.zonesKey}_${projectId}`, updatedZones);
      
      console.log('Timeline zone deleted:', zoneId);
    } catch (error) {
      console.error('Error deleting timeline zone:', error);
      throw error;
    }
  }

  /**
   * Clear all timeline zones for project
   */
  async clearAllTimelineZones(projectId: string): Promise<void> {
    try {
      const config = await this.getConfig();
      
      // Disallow clear all in demo mode
      if (config.demo) {
        throw new Error('Clear all zones is not allowed in demo mode');
      }
      
      await persistentStorage.set(`${this.zonesKey}_${projectId}`, []);
      console.log('All timeline zones cleared for project:', projectId);
    } catch (error) {
      console.error('Error clearing timeline zones:', error);
      throw error;
    }
  }

  /**
   * Get CSS classes for timeline zones
   */
  generateTimelineZonesCSS(zones: TimelineZone[]): string {
    const cssRules = [];
    
    zones.forEach((zone, index) => {
      const startDate = new Date(zone.startDate);
      const endDate = new Date(zone.endDate);
      
      // Calculate position based on dates
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      cssRules.push(`
        .timeline-zone-${zone.id} {
          position: absolute;
          top: 0;
          bottom: 0;
          left: ${this.calculateZonePosition(startDate)}%;
          width: ${this.calculateZoneWidth(startDate, endDate)}%;
          background-color: ${zone.color}20;
          border-left: 3px solid ${zone.color};
          z-index: 1;
          pointer-events: none;
        }
        
        .timeline-zone-${zone.id}::before {
          content: "${zone.name}";
          position: absolute;
          top: 4px;
          left: 8px;
          font-size: 10px;
          font-weight: 500;
          color: ${zone.color};
          background-color: white;
          padding: 2px 6px;
          border-radius: 3px;
          white-space: nowrap;
          pointer-events: auto;
        }
        
        .timeline-zone-${zone.id}:hover::before {
          background-color: ${zone.color};
          color: white;
        }
      `);
    });
    
    return cssRules.join('\n');
  }

  /**
   * Calculate zone position percentage
   */
  private calculateZonePosition(startDate: Date): number {
    // This is a simplified calculation - in a real implementation,
    // you'd need to calculate based on the project's start date and timeline scale
    const projectStart = new Date('2024-01-01'); // Example project start
    const daysFromStart = Math.ceil((startDate.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(100, (daysFromStart / 365) * 100));
  }

  /**
   * Calculate zone width percentage
   */
  private calculateZoneWidth(startDate: Date, endDate: Date): number {
    const daysDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(100, (daysDuration / 365) * 100));
  }

  /**
   * Apply timeline zones to DOM
   */
  applyTimelineZones(zones: TimelineZone[]): void {
    try {
      // Remove existing style tag if it exists
      const existingStyle = document.getElementById('constructbms-timeline-zones');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style tag
      const styleTag = document.createElement('style');
      styleTag.id = 'constructbms-timeline-zones';
      styleTag.textContent = this.generateTimelineZonesCSS(zones);
      
      document.head.appendChild(styleTag);
      
      console.log('Timeline zones applied to DOM');
    } catch (error) {
      console.error('Error applying timeline zones to DOM:', error);
    }
  }

  /**
   * Validate timeline zone
   */
  validateTimelineZone(zone: Omit<TimelineZone, 'id'>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate name
    if (!zone.name.trim()) {
      errors.push('Zone name is required');
    }
    
    // Validate dates
    if (!zone.startDate) {
      errors.push('Start date is required');
    }
    
    if (!zone.endDate) {
      errors.push('End date is required');
    }
    
    if (zone.startDate && zone.endDate) {
      const startDate = new Date(zone.startDate);
      const endDate = new Date(zone.endDate);
      
      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
    }
    
    // Validate color
    if (!zone.color.match(/^#[0-9A-F]{6}$/i)) {
      errors.push('Invalid color format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get zones for date range
   */
  getZonesForDateRange(zones: TimelineZone[], startDate: Date, endDate: Date): TimelineZone[] {
    return zones.filter(zone => {
      const zoneStart = new Date(zone.startDate);
      const zoneEnd = new Date(zone.endDate);
      
      // Check if zones overlap with the date range
      return zoneStart <= endDate && zoneEnd >= startDate;
    });
  }

  /**
   * Get zone tooltip content
   */
  getZoneTooltip(zone: TimelineZone): string {
    let tooltip = `${zone.name}\n${zone.startDate} to ${zone.endDate}`;
    
    if (zone.tag) {
      tooltip += `\nTag: ${zone.tag}`;
    }
    
    return tooltip;
  }

  /**
   * Export timeline zones as JSON
   */
  exportTimelineZones(zones: TimelineZone[]): string {
    return JSON.stringify(zones, null, 2);
  }

  /**
   * Import timeline zones from JSON
   */
  importTimelineZones(jsonData: string): TimelineZone[] {
    try {
      const zones = JSON.parse(jsonData);
      return zones.map((zone: any) => ({
        id: zone.id || `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: zone.name,
        startDate: zone.startDate,
        endDate: zone.endDate,
        color: zone.color,
        tag: zone.tag
      }));
    } catch (error) {
      console.error('Error importing timeline zones:', error);
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Clear all timeline zones data
   */
  async clearAllTimelineZonesData(): Promise<void> {
    try {
      await persistentStorage.remove(this.configKey);
      console.log('All timeline zones data cleared');
    } catch (error) {
      console.error('Error clearing timeline zones data:', error);
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
        await this.clearAllTimelineZonesData();
        await this.updateConfig({ demo: false });
        console.log('Demo timeline zones data reset');
      }
    } catch (error) {
      console.error('Error resetting demo timeline zones data:', error);
      throw error;
    }
  }
}

export const timelineZonesService = new TimelineZonesService(); 