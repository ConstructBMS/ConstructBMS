import { supabase } from './supabase';

export interface AutoSaveState {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  lastError: string | null;
  pendingChanges: Map<string, any>;
}

export interface AutoSaveConfig {
  debounceMs: number;
  autoSaveIntervalMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

export interface TableConfig {
  tableName: string;
  primaryKey: string;
  updateFields: string[];
  transformData?: (data: any) => any;
  validateData?: (data: any) => string[] | null;
}

export type AutoSaveCallback = (state: AutoSaveState) => void;

class AutoSaveService {
  private state: AutoSaveState = {
    isDirty: false,
    isSaving: false,
    lastSaved: null,
    lastError: null,
    pendingChanges: new Map()
  };

  private config: AutoSaveConfig = {
    debounceMs: 1000,
    autoSaveIntervalMs: 30000,
    maxRetries: 3,
    retryDelayMs: 1000
  };

  private tableConfigs: Map<string, TableConfig> = new Map();
  private callbacks: Set<AutoSaveCallback> = new Set();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private retryCount: number = 0;

  constructor() {
    this.startAutoSaveInterval();
  }

  // Configure table settings
  configureTable(tableName: string, config: TableConfig): void {
    this.tableConfigs.set(tableName, config);
  }

  // Set auto-save configuration
  setConfig(config: Partial<AutoSaveConfig>): void {
    this.config = { ...this.config, ...config };
    this.restartAutoSaveInterval();
  }

  // Subscribe to auto-save state changes
  subscribe(callback: AutoSaveCallback): () => void {
    this.callbacks.add(callback);
    callback(this.state);
    
    return () => {
      this.callbacks.delete(callback);
    };
  }

  // Mark data as dirty and trigger save
  markDirty(tableName: string, recordId: string, data: any): void {
    const key = `${tableName}:${recordId}`;
    this.state.pendingChanges.set(key, data);
    this.state.isDirty = true;
    this.state.lastError = null;
    
    this.notifyCallbacks();
    this.debounceSave(key);
  }

  // Force immediate save
  async forceSave(): Promise<boolean> {
    if (this.state.pendingChanges.size === 0) {
      return true;
    }

    return this.performSave();
  }

  // Clear dirty state
  clearDirty(): void {
    this.state.pendingChanges.clear();
    this.state.isDirty = false;
    this.state.lastError = null;
    this.notifyCallbacks();
  }

  // Get current state
  getState(): AutoSaveState {
    return { ...this.state };
  }

  // Private methods
  private debounceSave(key: string): void {
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.performSave();
      this.debounceTimers.delete(key);
    }, this.config.debounceMs);

    this.debounceTimers.set(key, timer);
  }

  private startAutoSaveInterval(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      if (this.state.isDirty && !this.state.isSaving) {
        this.performSave();
      }
    }, this.config.autoSaveIntervalMs);
  }

  private restartAutoSaveInterval(): void {
    this.startAutoSaveInterval();
  }

  private async performSave(): Promise<boolean> {
    if (this.state.isSaving || this.state.pendingChanges.size === 0) {
      return true;
    }

    this.state.isSaving = true;
    this.notifyCallbacks();

    try {
      const results = await Promise.allSettled(
        Array.from(this.state.pendingChanges.entries()).map(([key, data]) => 
          this.saveRecord(key, data)
        )
      );

      const failedSaves = results.filter(result => result.status === 'rejected');
      
      if (failedSaves.length === 0) {
        // All saves successful
        this.state.pendingChanges.clear();
        this.state.isDirty = false;
        this.state.lastSaved = new Date();
        this.state.lastError = null;
        this.retryCount = 0;
      } else {
        // Some saves failed
        this.state.lastError = `Failed to save ${failedSaves.length} records`;
        
        // Retry logic
        if (this.retryCount < this.config.maxRetries) {
          this.retryCount++;
          setTimeout(() => {
            this.performSave();
          }, this.config.retryDelayMs);
          return false;
        } else {
          // Max retries reached, keep failed changes in pending
          this.retryCount = 0;
        }
      }

      return failedSaves.length === 0;
    } catch (error) {
      this.state.lastError = error instanceof Error ? error.message : 'Save failed';
      this.retryCount = 0;
      return false;
    } finally {
      this.state.isSaving = false;
      this.notifyCallbacks();
    }
  }

  private async saveRecord(key: string, data: any): Promise<void> {
    const [tableName, recordId] = key.split(':');
    const config = this.tableConfigs.get(tableName);
    
    if (!config) {
      throw new Error(`No configuration found for table: ${tableName}`);
    }

    // Validate data if validator exists
    if (config.validateData) {
      const errors = config.validateData(data);
      if (errors && errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
    }

    // Transform data if transformer exists
    const transformedData = config.transformData ? config.transformData(data) : data;

    // Prepare update data
    const updateData: any = {
      [config.primaryKey]: recordId,
      updated_at: new Date().toISOString()
    };

    // Only include configured fields
    config.updateFields.forEach(field => {
      if (transformedData[field] !== undefined) {
        updateData[field] = transformedData[field];
      }
    });

    // Perform Supabase update
    const { error } = await supabase
      .from(config.tableName)
      .update(updateData)
      .eq(config.primaryKey, recordId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback({ ...this.state });
      } catch (error) {
        console.error('Auto-save callback error:', error);
      }
    });
  }

  // Cleanup
  destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    this.callbacks.clear();
  }
}

// Default table configurations
const defaultTableConfigs: Record<string, TableConfig> = {
  'asta_tasks': {
    tableName: 'asta_tasks',
    primaryKey: 'id',
    updateFields: ['name', 'description', 'start_date', 'end_date', 'duration', 'progress', 'status', 'priority', 'assigned_to', 'constraint_type', 'constraint_date', 'deadline', 'wbs_number', 'level'],
    validateData: (data) => {
      const errors: string[] = [];
      if (data.name && data.name.trim().length === 0) {
        errors.push('Task name cannot be empty');
      }
      if (data.duration && data.duration < 0) {
        errors.push('Duration cannot be negative');
      }
      if (data.progress && (data.progress < 0 || data.progress > 100)) {
        errors.push('Progress must be between 0 and 100');
      }
      return errors.length > 0 ? errors : null;
    }
  },
  'asta_projects': {
    tableName: 'asta_projects',
    primaryKey: 'id',
    updateFields: ['name', 'description', 'start_date', 'end_date', 'status', 'assigned_to'],
    validateData: (data) => {
      const errors: string[] = [];
      if (data.name && data.name.trim().length === 0) {
        errors.push('Project name cannot be empty');
      }
      if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
        errors.push('Start date cannot be after end date');
      }
      return errors.length > 0 ? errors : null;
    }
  },
  'asta_task_links': {
    tableName: 'asta_task_links',
    primaryKey: 'id',
    updateFields: ['source_task_id', 'target_task_id', 'link_type', 'lag'],
    validateData: (data) => {
      const errors: string[] = [];
      if (data.source_task_id === data.target_task_id) {
        errors.push('Source and target tasks cannot be the same');
      }
      if (data.lag && data.lag < 0) {
        errors.push('Lag cannot be negative');
      }
      return errors.length > 0 ? errors : null;
    }
  },
  'asta_resources': {
    tableName: 'asta_resources',
    primaryKey: 'id',
    updateFields: ['name', 'type', 'max_units', 'cost_per_unit', 'availability', 'current_utilization'],
    validateData: (data) => {
      const errors: string[] = [];
      if (data.name && data.name.trim().length === 0) {
        errors.push('Resource name cannot be empty');
      }
      if (data.max_units && data.max_units < 0) {
        errors.push('Max units cannot be negative');
      }
      if (data.availability && (data.availability < 0 || data.availability > 100)) {
        errors.push('Availability must be between 0 and 100');
      }
      return errors.length > 0 ? errors : null;
    }
  }
};

// Create and configure the auto-save service
export const autoSaveService = new AutoSaveService();

// Configure default tables
Object.entries(defaultTableConfigs).forEach(([tableName, config]) => {
  autoSaveService.configureTable(tableName, config);
});

// Demo data for testing
export const getDemoAutoSaveState = (): AutoSaveState => ({
  isDirty: false,
  isSaving: false,
  lastSaved: new Date(),
  lastError: null,
  pendingChanges: new Map()
});

export const getDemoAutoSaveConfig = (): AutoSaveConfig => ({
  debounceMs: 1000,
  autoSaveIntervalMs: 30000,
  maxRetries: 3,
  retryDelayMs: 1000
}); 