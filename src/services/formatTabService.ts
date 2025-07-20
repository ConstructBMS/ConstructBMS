import { supabase } from './supabase';
import type { FormatOperation, FormatState } from '../components/modules/ribbonTabs/FormatTab';

class FormatTabService {
  // Handle format operations
  async handleFormatOperation(operation: FormatOperation): Promise<void> {
    try {
      switch (operation.type) {
        case 'bar-coloring':
          await this.handleBarColoring(operation.data);
          break;
        case 'font-settings':
          await this.handleFontSettings(operation.data);
          break;
        case 'bar-height':
          await this.handleBarHeight(operation.data);
          break;
        case 'milestone-style':
          await this.handleMilestoneStyle(operation.data);
          break;
        case 'float-style':
          await this.handleFloatStyle(operation.data);
          break;
        case 'save-preferences':
          await this.handleSavePreferences(operation.data);
          break;
        case 'display-options':
          await this.handleDisplayOptions(operation.data);
          break;
        case 'advanced-formatting':
          await this.handleAdvancedFormatting(operation.data);
          break;
        default:
          console.warn('Unknown format operation:', operation.type);
      }
    } catch (error) {
      console.error('Format operation failed:', error);
      throw error;
    }
  }

  // Handle bar coloring
  private async handleBarColoring(data: any): Promise<void> {
    console.log('Setting bar coloring:', data);
    
    try {
      if (data.action === 'custom-colors') {
        // Open color picker modal
        console.log('Opening custom color picker');
        return;
      }

      // Update user settings in database
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: this.getCurrentUserId(),
          format_settings: {
            barColoring: data.scheme,
            colors: data.colors
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.warn('Failed to update bar coloring in database:', error);
        // Continue with local update
      }

      // Update local state
      this.updateBarColoring(data.scheme, data.colors);
    } catch (error) {
      console.warn('Bar coloring update failed, using local state only:', error);
      this.updateBarColoring(data.scheme, data.colors);
    }
  }

  // Handle font settings
  private async handleFontSettings(data: any): Promise<void> {
    console.log('Setting font settings:', data);
    
    try {
      if (data.action === 'text-color') {
        // Open color picker for text
        console.log('Opening text color picker');
        return;
      }

      // Update user settings in database
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: this.getCurrentUserId(),
          format_settings: {
            fontFamily: data.family,
            fontSize: data.size
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.warn('Failed to update font settings in database:', error);
        // Continue with local update
      }

      // Update local state
      this.updateFontSettings(data.family, data.size);
    } catch (error) {
      console.warn('Font settings update failed, using local state only:', error);
      this.updateFontSettings(data.family, data.size);
    }
  }

  // Handle bar height
  private async handleBarHeight(data: any): Promise<void> {
    console.log('Setting bar height:', data.height);
    
    try {
      // Update user settings in database
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: this.getCurrentUserId(),
          format_settings: {
            barHeight: data.height
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.warn('Failed to update bar height in database:', error);
        // Continue with local update
      }

      // Update local state
      this.updateBarHeight(data.height);
    } catch (error) {
      console.warn('Bar height update failed, using local state only:', error);
      this.updateBarHeight(data.height);
    }
  }

  // Handle milestone style
  private async handleMilestoneStyle(data: any): Promise<void> {
    console.log('Setting milestone style:', data.showAsDiamond);
    
    try {
      // Update user settings in database
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: this.getCurrentUserId(),
          format_settings: {
            showMilestoneAsDiamond: data.showAsDiamond
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.warn('Failed to update milestone style in database:', error);
        // Continue with local update
      }

      // Update local state
      this.updateMilestoneStyle(data.showAsDiamond);
    } catch (error) {
      console.warn('Milestone style update failed, using local state only:', error);
      this.updateMilestoneStyle(data.showAsDiamond);
    }
  }

  // Handle float style
  private async handleFloatStyle(data: any): Promise<void> {
    console.log('Setting float style:', data.showAsTrail);
    
    try {
      // Update user settings in database
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: this.getCurrentUserId(),
          format_settings: {
            showFloatAsTrail: data.showAsTrail
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.warn('Failed to update float style in database:', error);
        // Continue with local update
      }

      // Update local state
      this.updateFloatStyle(data.showAsTrail);
    } catch (error) {
      console.warn('Float style update failed, using local state only:', error);
      this.updateFloatStyle(data.showAsTrail);
    }
  }

  // Handle save preferences
  private async handleSavePreferences(data: any): Promise<void> {
    console.log('Handling save preferences:', data);
    
    try {
      switch (data.action) {
        case 'save-preset':
          await this.saveFormatPreset(data.presetName);
          break;
        case 'load-preset':
          await this.loadFormatPreset(data.preset);
          break;
        case 'reset-formatting':
          await this.resetFormatting();
          break;
        default:
          console.warn('Unknown save preference action:', data.action);
      }
    } catch (error) {
      console.warn('Save preferences failed:', error);
    }
  }

  // Handle display options
  private async handleDisplayOptions(data: any): Promise<void> {
    console.log('Handling display options:', data);
    
    try {
      if (data.action === 'toggle-progress') {
        // Toggle progress bar display
        console.log('Toggling progress bar display');
        // Update local state
        this.updateDisplayOptions({ showProgress: !this.getCurrentDisplayOptions().showProgress });
      }
    } catch (error) {
      console.warn('Display options update failed:', error);
    }
  }

  // Handle advanced formatting
  private async handleAdvancedFormatting(data: any): Promise<void> {
    console.log('Handling advanced formatting:', data);
    
    try {
      switch (data.action) {
        case 'grid-styling':
          console.log('Opening grid styling options');
          break;
        case 'timeline-styling':
          console.log('Opening timeline styling options');
          break;
        case 'legend-styling':
          console.log('Opening legend styling options');
          break;
        default:
          console.warn('Unknown advanced formatting action:', data.action);
      }
    } catch (error) {
      console.warn('Advanced formatting failed:', error);
    }
  }

  // Save format preset
  private async saveFormatPreset(presetName: string): Promise<void> {
    try {
      const currentSettings = await this.getCurrentFormatSettings();
      
      const { error } = await supabase
        .from('view_config')
        .upsert({
          user_id: this.getCurrentUserId(),
          preset_name: presetName,
          format_settings: currentSettings,
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id,preset_name' });

      if (error) {
        console.warn('Failed to save format preset in database:', error);
      } else {
        console.log(`Format preset '${presetName}' saved successfully`);
      }
    } catch (error) {
      console.warn('Save format preset failed:', error);
    }
  }

  // Load format preset
  private async loadFormatPreset(presetName: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('view_config')
        .select('format_settings')
        .eq('user_id', this.getCurrentUserId())
        .eq('preset_name', presetName)
        .single();

      if (error) {
        console.warn('Failed to load format preset from database:', error);
        return;
      }

      if (data?.format_settings) {
        // Apply the preset settings
        this.applyFormatSettings(data.format_settings);
        console.log(`Format preset '${presetName}' loaded successfully`);
      }
    } catch (error) {
      console.warn('Load format preset failed:', error);
    }
  }

  // Reset formatting to defaults
  private async resetFormatting(): Promise<void> {
    try {
      const defaultSettings = this.getDefaultFormatSettings();
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: this.getCurrentUserId(),
          format_settings: defaultSettings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.warn('Failed to reset formatting in database:', error);
      }

      // Apply default settings locally
      this.applyFormatSettings(defaultSettings);
      console.log('Formatting reset to defaults');
    } catch (error) {
      console.warn('Reset formatting failed:', error);
    }
  }

  // Get current format settings
  async getCurrentFormatSettings(): Promise<FormatState> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('format_settings')
        .eq('user_id', this.getCurrentUserId())
        .single();

      if (error) {
        console.warn('Failed to get current format settings from database:', error);
        return this.getDefaultFormatSettings();
      }

      return data?.format_settings || this.getDefaultFormatSettings();
    } catch (error) {
      console.warn('Get current format settings failed:', error);
      return this.getDefaultFormatSettings();
    }
  }

  // Get default format settings
  private getDefaultFormatSettings(): FormatState {
    return {
      barColoring: 'critical',
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
      barHeight: 20,
      showMilestoneAsDiamond: true,
      showFloatAsTrail: false,
      customColors: {
        critical: '#ef4444',
        normal: '#3b82f6',
        completed: '#10b981',
        delayed: '#f59e0b',
        resource1: '#7c3aed',
        resource2: '#0891b2',
        resource3: '#16a34a'
      }
    };
  }

  // Get current display options
  private getCurrentDisplayOptions(): any {
    // This would come from local state or context
    return { showProgress: true };
  }

  // Helper methods for local state updates
  private updateBarColoring(scheme: string, colors: any): void {
    // TODO: Update local bar coloring state
    console.log('Updated bar coloring locally:', { scheme, colors });
  }

  private updateFontSettings(family: string, size: number): void {
    // TODO: Update local font settings state
    console.log('Updated font settings locally:', { family, size });
  }

  private updateBarHeight(height: number): void {
    // TODO: Update local bar height state
    console.log('Updated bar height locally:', height);
  }

  private updateMilestoneStyle(showAsDiamond: boolean): void {
    // TODO: Update local milestone style state
    console.log('Updated milestone style locally:', showAsDiamond);
  }

  private updateFloatStyle(showAsTrail: boolean): void {
    // TODO: Update local float style state
    console.log('Updated float style locally:', showAsTrail);
  }

  private updateDisplayOptions(options: any): void {
    // TODO: Update local display options state
    console.log('Updated display options locally:', options);
  }

  private applyFormatSettings(settings: FormatState): void {
    // TODO: Apply format settings to local state
    console.log('Applied format settings locally:', settings);
  }

  // Helper methods
  private getCurrentUserId(): string {
    // TODO: Get current user ID from auth context
    return 'current-user-id';
  }

  // Apply format settings to Gantt chart
  applyFormatToGantt(formatState: FormatState): void {
    console.log('Applying format to Gantt chart:', formatState);
    
    // This would apply the format settings to the actual Gantt chart SVG
    // For now, just log the settings
    const {
      barColoring,
      fontFamily,
      fontSize,
      barHeight,
      showMilestoneAsDiamond,
      showFloatAsTrail,
      customColors
    } = formatState;

    // Apply bar coloring
    this.applyBarColoring(barColoring, customColors);
    
    // Apply font settings
    this.applyFontSettings(fontFamily, fontSize);
    
    // Apply bar height
    this.applyBarHeight(barHeight);
    
    // Apply milestone style
    this.applyMilestoneStyle(showMilestoneAsDiamond);
    
    // Apply float style
    this.applyFloatStyle(showFloatAsTrail);
  }

  private applyBarColoring(scheme: string, colors: any): void {
    console.log('Applying bar coloring:', { scheme, colors });
    // TODO: Update Gantt chart bar colors
  }

  private applyFontSettings(family: string, size: number): void {
    console.log('Applying font settings:', { family, size });
    // TODO: Update Gantt chart fonts
  }

  private applyBarHeight(height: number): void {
    console.log('Applying bar height:', height);
    // TODO: Update Gantt chart bar heights
  }

  private applyMilestoneStyle(showAsDiamond: boolean): void {
    console.log('Applying milestone style:', showAsDiamond);
    // TODO: Update Gantt chart milestone appearance
  }

  private applyFloatStyle(showAsTrail: boolean): void {
    console.log('Applying float style:', showAsTrail);
    // TODO: Update Gantt chart float appearance
  }
}

export const formatTabService = new FormatTabService(); 