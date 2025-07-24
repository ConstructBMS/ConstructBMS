import { supabase } from './supabase';

// Filter interfaces
export interface FilterCriteria {
  displayValue: string;
  field: string;
  id: string;
  label: string;
  operator: 'equals' | 'contains' | 'in' | 'not_in' | 'is_null' | 'is_not_null';
  type: 'status' | 'tag' | 'role' | 'phase' | 'custom';
  value: any;
}

export interface FilterState {
  activeFilters: FilterCriteria[];
  isDemoMode: boolean;
  lastUpdated: Date;
}

export interface FilterOptions {
  customFields: Array<{ field: string; label: string; options?: string[], type: string; }>;
  phases: Array<{ count: number; label: string; level: number, value: string; }>;
  roles: Array<{ count: number, label: string; value: string; }>;
  statuses: Array<{ count: number, label: string; value: string; }>;
  tags: Array<{ count: number, label: string; value: string; }>;
}

export interface FilterPreferences {
  demo: boolean;
  filters: FilterCriteria[];
  lastUsed: Date;
  projectId: string;
  userId: string;
}

// Demo mode configuration
const DEMO_MODE_CONFIG = {
  maxActiveFilters: 1,
  customFieldsDisabled: true,
  tooltipMessage: 'Upgrade to use advanced filters',
  filterStateTag: 'demo'
};

class FilterService {
  private filterState: FilterState;
  private filterOptions: FilterOptions;
  private isDemoMode = false;
  private filterCache = new Map<string, boolean>();
  private lastFilterTime = 0;
  private filterDebounceMs = 100;

  constructor() {
    this.isDemoMode = this.checkDemoMode();
    this.filterState = {
      activeFilters: [],
      isDemoMode: this.isDemoMode,
      lastUpdated: new Date()
    };
    this.filterOptions = this.initializeFilterOptions();
  }

  private checkDemoMode(): boolean {
    // Check user role or environment to determine demo mode
    return false; // Set to true for demo mode testing
  }

  /**
   * Initialize filter options
   */
  private initializeFilterOptions(): FilterOptions {
    return {
      statuses: [
        { value: 'not_started', label: 'Not Started', count: 0 },
        { value: 'in_progress', label: 'In Progress', count: 0 },
        { value: 'completed', label: 'Completed', count: 0 },
        { value: 'on_hold', label: 'On Hold', count: 0 },
        { value: 'cancelled', label: 'Cancelled', count: 0 }
      ],
      tags: [
        { value: 'critical', label: 'Critical', count: 0 },
        { value: 'high_priority', label: 'High Priority', count: 0 },
        { value: 'low_priority', label: 'Low Priority', count: 0 },
        { value: 'blocked', label: 'Blocked', count: 0 },
        { value: 'review_required', label: 'Review Required', count: 0 }
      ],
      roles: [
        { value: 'project_manager', label: 'Project Manager', count: 0 },
        { value: 'team_lead', label: 'Team Lead', count: 0 },
        { value: 'developer', label: 'Developer', count: 0 },
        { value: 'designer', label: 'Designer', count: 0 },
        { value: 'tester', label: 'Tester', count: 0 },
        { value: 'analyst', label: 'Analyst', count: 0 }
      ],
      phases: [
        { value: 'planning', label: 'Planning', count: 0, level: 0 },
        { value: 'design', label: 'Design', count: 0, level: 1 },
        { value: 'development', label: 'Development', count: 0, level: 1 },
        { value: 'testing', label: 'Testing', count: 0, level: 1 },
        { value: 'deployment', label: 'Deployment', count: 0, level: 1 }
      ],
      customFields: [
        { field: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
        { field: 'department', label: 'Department', type: 'select', options: ['Engineering', 'Design', 'Marketing', 'Sales'] },
        { field: 'location', label: 'Location', type: 'text' },
        { field: 'budget', label: 'Budget', type: 'number' }
      ]
    };
  }

  /**
   * Get current filter state
   */
  getFilterState(): FilterState {
    return { ...this.filterState };
  }

  /**
   * Get filter options
   */
  getFilterOptions(): FilterOptions {
    if (this.isDemoMode) {
      // In demo mode, disable custom fields
      return {
        ...this.filterOptions,
        customFields: []
      };
    }
    return this.filterOptions;
  }

  /**
   * Add a filter
   */
  async addFilter(filter: Omit<FilterCriteria, 'id' | 'displayValue'>): Promise<boolean> {
    // Check demo mode restrictions
    if (this.isDemoMode) {
      if (this.filterState.activeFilters.length >= DEMO_MODE_CONFIG.maxActiveFilters) {
        console.warn('Maximum filters reached in demo mode');
        return false;
      }
      if (filter.type === 'custom') {
        console.warn('Custom field filters disabled in demo mode');
        return false;
      }
    }

    const newFilter: FilterCriteria = {
      ...filter,
      id: this.generateFilterId(),
      displayValue: this.formatDisplayValue(filter)
    };

    this.filterState.activeFilters.push(newFilter);
    this.filterState.lastUpdated = new Date();
    this.filterState.isDemoMode = this.isDemoMode;

    // Clear cache when filters change
    this.filterCache.clear();

    // Save preferences if not demo mode
    if (!this.isDemoMode) {
      await this.savePreferences();
    }

    return true;
  }

  /**
   * Remove a filter
   */
  async removeFilter(filterId: string): Promise<boolean> {
    const index = this.filterState.activeFilters.findIndex(f => f.id === filterId);
    if (index === -1) return false;

    this.filterState.activeFilters.splice(index, 1);
    this.filterState.lastUpdated = new Date();

    // Clear cache when filters change
    this.filterCache.clear();

    // Save preferences if not demo mode
    if (!this.isDemoMode) {
      await this.savePreferences();
    }

    return true;
  }

  /**
   * Clear all filters
   */
  async clearAllFilters(): Promise<void> {
    this.filterState.activeFilters = [];
    this.filterState.lastUpdated = new Date();
    this.filterCache.clear();

    if (!this.isDemoMode) {
      await this.savePreferences();
    }
  }

  /**
   * Invert current filters
   */
  async invertFilters(): Promise<void> {
    // This would create inverse filters for the current selection
    // For now, we'll just clear and add a "not" filter
    console.log('Invert filters functionality would be implemented here');
  }

  /**
   * Apply filters to tasks
   */
  applyFilters(tasks: any[]): any[] {
    if (this.filterState.activeFilters.length === 0) {
      return tasks;
    }

    // Use cached results if available
    const cacheKey = this.generateCacheKey(tasks);
    if (this.filterCache.has(cacheKey)) {
      return this.filterCache.get(cacheKey) ? tasks : [];
    }

    const filteredTasks = tasks.filter(task => this.taskMatchesFilters(task));
    
    // Cache the result
    this.filterCache.set(cacheKey, filteredTasks.length > 0);

    return filteredTasks;
  }

  /**
   * Check if a task matches all active filters
   */
  private taskMatchesFilters(task: any): boolean {
    return this.filterState.activeFilters.every(filter => {
      return this.matchesFilter(task, filter);
    });
  }

  /**
   * Check if a task matches a specific filter
   */
  private matchesFilter(task: any, filter: FilterCriteria): boolean {
    const fieldValue = this.getFieldValue(task, filter.field);

    switch (filter.operator) {
      case 'equals':
        return fieldValue === filter.value;
      
      case 'contains':
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(filter.value.toLowerCase());
        }
        return false;
      
      case 'in':
        if (Array.isArray(filter.value)) {
          return filter.value.includes(fieldValue);
        }
        return fieldValue === filter.value;
      
      case 'not_in':
        if (Array.isArray(filter.value)) {
          return !filter.value.includes(fieldValue);
        }
        return fieldValue !== filter.value;
      
      case 'is_null':
        return fieldValue === null || fieldValue === undefined;
      
      case 'is_not_null':
        return fieldValue !== null && fieldValue !== undefined;
      
      default:
        return true;
    }
  }

  /**
   * Get field value from task object
   */
  private getFieldValue(task: any, field: string): any {
    const fieldParts = field.split('.');
    let value = task;

    for (const part of fieldParts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Generate unique filter ID
   */
  private generateFilterId(): string {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate cache key for tasks
   */
  private generateCacheKey(tasks: any[]): string {
    const taskIds = tasks.map(t => t.id).sort().join(',');
    const filterIds = this.filterState.activeFilters.map(f => f.id).sort().join(',');
    return `${taskIds}|${filterIds}`;
  }

  /**
   * Format display value for filter
   */
  private formatDisplayValue(filter: Omit<FilterCriteria, 'id' | 'displayValue'>): string {
    switch (filter.type) {
      case 'status':
        const statusOption = this.filterOptions.statuses.find(s => s.value === filter.value);
        return statusOption ? statusOption.label : filter.value;
      
      case 'tag':
        const tagOption = this.filterOptions.tags.find(t => t.value === filter.value);
        return tagOption ? tagOption.label : filter.value;
      
      case 'role':
        const roleOption = this.filterOptions.roles.find(r => r.value === filter.value);
        return roleOption ? roleOption.label : filter.value;
      
      case 'phase':
        const phaseOption = this.filterOptions.phases.find(p => p.value === filter.value);
        return phaseOption ? phaseOption.label : filter.value;
      
      case 'custom':
        return `${filter.field}: ${filter.value}`;
      
      default:
        return filter.value;
    }
  }

  /**
   * Load filter preferences from Supabase
   */
  async loadPreferences(userId: string, projectId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('programme_filter_prefs')
        .select('filters')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single();

      if (error || !data) {
        return;
      }

      // Validate and apply filters
      if (data.filters && Array.isArray(data.filters)) {
        const validFilters = data.filters.filter((f: any) => 
          f.type && f.field && f.operator && f.value !== undefined
        );

        // Apply demo mode restrictions
        if (this.isDemoMode) {
          this.filterState.activeFilters = validFilters.slice(0, DEMO_MODE_CONFIG.maxActiveFilters);
        } else {
          this.filterState.activeFilters = validFilters;
        }

        this.filterState.lastUpdated = new Date();
      }
    } catch (error) {
      console.error('Error loading filter preferences:', error);
    }
  }

  /**
   * Save filter preferences to Supabase
   */
  private async savePreferences(): Promise<void> {
    try {
      const { error } = await supabase
        .from('programme_filter_prefs')
        .upsert({
          user_id: 'current-user', // This should come from auth context
          project_id: 'current-project', // This should come from project context
          filters: this.filterState.activeFilters,
          demo: this.isDemoMode,
          last_used: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving filter preferences:', error);
    }
  }

  /**
   * Update filter counts based on current tasks
   */
  updateFilterCounts(tasks: any[]): void {
    // Update status counts
    this.filterOptions.statuses.forEach(status => {
      status.count = tasks.filter(task => task.status === status.value).length;
    });

    // Update tag counts
    this.filterOptions.tags.forEach(tag => {
      tag.count = tasks.filter(task => 
        task.tags && task.tags.includes(tag.value)
      ).length;
    });

    // Update role counts
    this.filterOptions.roles.forEach(role => {
      role.count = tasks.filter(task => task.assignedTo === role.value).length;
    });

    // Update phase counts
    this.filterOptions.phases.forEach(phase => {
      phase.count = tasks.filter(task => task.parentPhaseId === phase.value).length;
    });
  }

  /**
   * Get demo mode configuration
   */
  getDemoModeConfig() {
    return DEMO_MODE_CONFIG;
  }

  /**
   * Check if current mode is demo
   */
  isInDemoMode(): boolean {
    return this.isDemoMode;
  }

  /**
   * Check if custom fields are enabled
   */
  areCustomFieldsEnabled(): boolean {
    return !this.isDemoMode;
  }

  /**
   * Get active filter count
   */
  getActiveFilterCount(): number {
    return this.filterState.activeFilters.length;
  }

  /**
   * Check if filters are active
   */
  hasActiveFilters(): boolean {
    return this.filterState.activeFilters.length > 0;
  }

  /**
   * Get filter change callback
   */
  onFilterChange?: (filterState: FilterState) => void;

  /**
   * Cleanup
   */
  destroy(): void {
    this.filterCache.clear();
  }
}

// Export singleton instance
export const filterService = new FilterService(); 