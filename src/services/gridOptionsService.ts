import { persistentStorage } from './persistentStorage';
import { demoDataService } from './demoDataService';

export interface GridOptions {
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  columnWidths: Record<string, number>;
  demo?: boolean;
  pinnedColumn: boolean;
  stripeRows: boolean;
  wrapText: boolean;
}

export interface GridOptionsConfig {
  demo?: boolean;
  options: GridOptions;
}

export interface GridOptionsResult {
  data?: any;
  errors: string[];
  success: boolean;
}

const DEFAULT_GRID_OPTIONS: GridOptions = {
  pinnedColumn: false,
  wrapText: false,
  stripeRows: true,
  columnOrder: ['id', 'name', 'startDate', 'endDate', 'duration', 'progress', 'status'],
  columnWidths: {
    id: 80,
    name: 200,
    startDate: 120,
    endDate: 120,
    duration: 100,
    progress: 100,
    status: 120
  },
  columnVisibility: {
    id: true,
    name: true,
    startDate: true,
    endDate: true,
    duration: true,
    progress: true,
    status: true
  }
};

const DEFAULT_CONFIG: GridOptionsConfig = {
  options: DEFAULT_GRID_OPTIONS
};

class GridOptionsService {
  private config: GridOptionsConfig = DEFAULT_CONFIG;

  async initialize(projectId: string): Promise<void> {
    try {
      const stored = await persistentStorage.get(`gridOptions_${projectId}`);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...stored };
      }
    } catch (error) {
      console.error('Failed to initialize grid options service:', error);
    }
  }

  async getGridOptionsConfig(projectId: string): Promise<GridOptionsConfig> {
    try {
      const stored = await persistentStorage.get(`gridOptions_${projectId}`);
      return stored ? { ...DEFAULT_CONFIG, ...stored } : DEFAULT_CONFIG;
    } catch (error) {
      console.error('Failed to get grid options config:', error);
      return DEFAULT_CONFIG;
    }
  }

  async saveGridOptionsConfig(projectId: string, config: Partial<GridOptionsConfig>): Promise<GridOptionsResult> {
    try {
      const updatedConfig = { ...this.config, ...config };
      
      // Add demo flag if in demo mode
      if (demoDataService.isDemoMode()) {
        updatedConfig.demo = true;
      }

      this.config = updatedConfig;
      
      await persistentStorage.set(`gridOptions_${projectId}`, updatedConfig);
      
      this.logGridOptionsActivity('config_updated', { config: updatedConfig });
      
      return { success: true, data: updatedConfig, errors: [] };
    } catch (error) {
      console.error('Failed to save grid options config:', error);
      return { success: false, errors: ['Failed to save grid options configuration'] };
    }
  }

  async toggleGridOption(projectId: string, option: keyof GridOptions): Promise<GridOptionsResult> {
    try {
      if (typeof this.config.options[option] !== 'boolean') {
        return { success: false, errors: ['Invalid grid option'] };
      }

      const newOptions = {
        ...this.config.options,
        [option]: !this.config.options[option]
      };

      const result = await this.saveGridOptionsConfig(projectId, {
        options: newOptions
      });
      
      this.logGridOptionsActivity('option_toggled', { 
        option, 
        value: newOptions[option] 
      });
      
      return result;
    } catch (error) {
      console.error('Failed to toggle grid option:', error);
      return { success: false, errors: ['Failed to toggle grid option'] };
    }
  }

  async resetGridColumns(projectId: string): Promise<GridOptionsResult> {
    try {
      const resetOptions = {
        ...this.config.options,
        columnOrder: DEFAULT_GRID_OPTIONS.columnOrder,
        columnWidths: DEFAULT_GRID_OPTIONS.columnWidths,
        columnVisibility: DEFAULT_GRID_OPTIONS.columnVisibility
      };

      const result = await this.saveGridOptionsConfig(projectId, {
        options: resetOptions
      });
      
      this.logGridOptionsActivity('columns_reset', { 
        previousConfig: this.config.options 
      });
      
      return result;
    } catch (error) {
      console.error('Failed to reset grid columns:', error);
      return { success: false, errors: ['Failed to reset grid columns'] };
    }
  }

  async updateColumnOrder(projectId: string, columnOrder: string[]): Promise<GridOptionsResult> {
    try {
      const newOptions = {
        ...this.config.options,
        columnOrder
      };

      const result = await this.saveGridOptionsConfig(projectId, {
        options: newOptions
      });
      
      this.logGridOptionsActivity('column_order_updated', { columnOrder });
      
      return result;
    } catch (error) {
      console.error('Failed to update column order:', error);
      return { success: false, errors: ['Failed to update column order'] };
    }
  }

  async updateColumnWidth(projectId: string, columnId: string, width: number): Promise<GridOptionsResult> {
    try {
      const newWidths = {
        ...this.config.options.columnWidths,
        [columnId]: width
      };

      const newOptions = {
        ...this.config.options,
        columnWidths: newWidths
      };

      const result = await this.saveGridOptionsConfig(projectId, {
        options: newOptions
      });
      
      this.logGridOptionsActivity('column_width_updated', { 
        columnId, 
        width 
      });
      
      return result;
    } catch (error) {
      console.error('Failed to update column width:', error);
      return { success: false, errors: ['Failed to update column width'] };
    }
  }

  async toggleColumnVisibility(projectId: string, columnId: string): Promise<GridOptionsResult> {
    try {
      const newVisibility = {
        ...this.config.options.columnVisibility,
        [columnId]: !this.config.options.columnVisibility[columnId]
      };

      const newOptions = {
        ...this.config.options,
        columnVisibility: newVisibility
      };

      const result = await this.saveGridOptionsConfig(projectId, {
        options: newOptions
      });
      
      this.logGridOptionsActivity('column_visibility_toggled', { 
        columnId, 
        visible: newVisibility[columnId] 
      });
      
      return result;
    } catch (error) {
      console.error('Failed to toggle column visibility:', error);
      return { success: false, errors: ['Failed to toggle column visibility'] };
    }
  }

  getGridOptions(): GridOptions {
    return this.config.options;
  }

  isOptionEnabled(option: keyof GridOptions): boolean {
    return this.config.options[option] as boolean;
  }

  getColumnOrder(): string[] {
    return this.config.options.columnOrder;
  }

  getColumnWidth(columnId: string): number {
    return this.config.options.columnWidths[columnId] || 100;
  }

  isColumnVisible(columnId: string): boolean {
    return this.config.options.columnVisibility[columnId] !== false;
  }

  async clearDemoGridOptionsData(projectId: string): Promise<void> {
    try {
      if (this.config.demo) {
        await persistentStorage.remove(`gridOptions_${projectId}`);
        this.config = DEFAULT_CONFIG;
      }
    } catch (error) {
      console.error('Failed to clear demo grid options data:', error);
    }
  }

  async getGridOptionsHistory(projectId: string): Promise<any[]> {
    try {
      const history = await persistentStorage.get(`gridOptions_history_${projectId}`);
      return history || [];
    } catch (error) {
      console.error('Failed to get grid options history:', error);
      return [];
    }
  }

  private async logGridOptionsActivity(action: string, data: any): Promise<void> {
    try {
      const activity = {
        action,
        data,
        timestamp: new Date().toISOString(),
        demo: demoDataService.isDemoMode()
      };
      
      // Store in history
      const history = await this.getGridOptionsHistory('current');
      history.push(activity);
      
      // Keep only last 100 activities
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      await persistentStorage.set('gridOptions_history_current', history);
    } catch (error) {
      console.error('Failed to log grid options activity:', error);
    }
  }

  validateGridOptionsConfig(config: GridOptionsConfig): string[] {
    const errors: string[] = [];
    
    if (!config.options) {
      errors.push('Grid options configuration is required');
      return errors;
    }

    if (typeof config.options.pinnedColumn !== 'boolean') {
      errors.push('Pinned column must be a boolean value');
    }

    if (typeof config.options.wrapText !== 'boolean') {
      errors.push('Wrap text must be a boolean value');
    }

    if (typeof config.options.stripeRows !== 'boolean') {
      errors.push('Stripe rows must be a boolean value');
    }

    if (!Array.isArray(config.options.columnOrder)) {
      errors.push('Column order must be an array');
    }

    if (typeof config.options.columnWidths !== 'object') {
      errors.push('Column widths must be an object');
    }

    if (typeof config.options.columnVisibility !== 'object') {
      errors.push('Column visibility must be an object');
    }

    return errors;
  }
}

export const gridOptionsService = new GridOptionsService(); 