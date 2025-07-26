import { persistentStorage } from './persistentStorage';
import { demoModeService } from './demoModeService';

export interface TimelineFilters {
  assignees: string[];
  status: string[];
  tags: string[];
  type: string[];
}

export interface FilterPreferences {
  demo?: boolean;
  filters: TimelineFilters;
  id: string;
  projectId: string;
  type: 'timeline';
  updatedAt: Date;
  userId: string;
}

export interface FilterOption {
  color?: string;
  count: number;
  id: string;
  label: string;
}

class TimelineFiltersService {
  private readonly filterPreferencesKey = 'programme_filters';
  private readonly maxDemoFilters = 2;
  private saveTimeout: NodeJS.Timeout | null = null;

  /**
   * Get filter preferences for a project
   */
  async getFilterPreferences(projectId: string): Promise<TimelineFilters> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      const allPreferences = await this.getAllFilterPreferences();

      let projectPreferences = allPreferences.find(
        p => p.projectId === projectId && p.type === 'timeline'
      );

      if (!projectPreferences) {
        projectPreferences = {
          id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          projectId,
          userId: 'current-user',
          type: 'timeline',
          filters: {
            status: [],
            type: [],
            tags: [],
            assignees: [],
          },
          updatedAt: new Date(),
          demo: isDemoMode,
        };
        allPreferences.push(projectPreferences);
        await persistentStorage.set(this.filterPreferencesKey, allPreferences);
      }

      return projectPreferences.filters;
    } catch (error) {
      console.error('Error getting filter preferences:', error);
      return {
        status: [],
        type: [],
        tags: [],
        assignees: [],
      };
    }
  }

  /**
   * Update filter preferences
   */
  async updateFilterPreferences(
    projectId: string,
    filters: Partial<TimelineFilters>
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      const allPreferences = await this.getAllFilterPreferences();

      let projectPreferences = allPreferences.find(
        p => p.projectId === projectId && p.type === 'timeline'
      );

      if (!projectPreferences) {
        projectPreferences = {
          id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          projectId,
          userId: 'current-user',
          type: 'timeline',
          filters: {
            status: [],
            type: [],
            tags: [],
            assignees: [],
          },
          updatedAt: new Date(),
          demo: isDemoMode,
        };
        allPreferences.push(projectPreferences);
      }

      // Apply updates
      projectPreferences.filters = {
        ...projectPreferences.filters,
        ...filters,
      };
      projectPreferences.updatedAt = new Date();
      projectPreferences.demo = isDemoMode;

      // Demo mode restrictions
      if (isDemoMode) {
        // Limit to max 2 filters
        const totalFilters = Object.values(projectPreferences.filters).reduce(
          (sum, arr) => sum + arr.length,
          0
        );
        if (totalFilters > this.maxDemoFilters) {
          return {
            success: false,
            error: `Maximum ${this.maxDemoFilters} filters allowed in demo mode`,
          };
        }

        // Disable assignee filters in demo mode
        projectPreferences.filters.assignees = [];
      }

      await persistentStorage.set(this.filterPreferencesKey, allPreferences);

      console.log('Filter preferences updated:', filters);
      return { success: true };
    } catch (error) {
      console.error('Error updating filter preferences:', error);
      return { success: false, error: 'Failed to update filter preferences' };
    }
  }

  /**
   * Save filter preferences with debouncing
   */
  async saveFilterPreferencesDebounced(
    projectId: string,
    filters: Partial<TimelineFilters>
  ): Promise<void> {
    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Set new timeout for debounced save
    this.saveTimeout = setTimeout(async () => {
      await this.updateFilterPreferences(projectId, filters);
    }, 500); // 500ms debounce
  }

  /**
   * Clear all filters for a project
   */
  async clearFilters(
    projectId: string
  ): Promise<{ error?: string; success: boolean }> {
    try {
      const emptyFilters: TimelineFilters = {
        status: [],
        type: [],
        tags: [],
        assignees: [],
      };

      return await this.updateFilterPreferences(projectId, emptyFilters);
    } catch (error) {
      console.error('Error clearing filters:', error);
      return { success: false, error: 'Failed to clear filters' };
    }
  }

  /**
   * Get available filter options from tasks
   */
  getFilterOptions(tasks: any[]): {
    assignees: FilterOption[];
    status: FilterOption[];
    tags: FilterOption[];
    type: FilterOption[];
  } {
    const statusMap = new Map<
      string,
      { color?: string; count: number; label: string }
    >();
    const typeMap = new Map<string, { count: number; label: string }>();
    const tagMap = new Map<
      string,
      { color?: string; count: number; label: string }
    >();
    const assigneeMap = new Map<string, { count: number; label: string }>();

    tasks.forEach(task => {
      // Status options
      if (task.statusId) {
        const status = statusMap.get(task.statusId) || {
          label: task.statusId,
          count: 0,
        };
        status.count++;
        statusMap.set(task.statusId, status);
      }

      // Type options
      if (task.type) {
        const type = typeMap.get(task.type) || { label: task.type, count: 0 };
        type.count++;
        typeMap.set(task.type, type);
      }

      // Tag options
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach((tagId: string) => {
          const tag = tagMap.get(tagId) || { label: tagId, count: 0 };
          tag.count++;
          tagMap.set(tagId, tag);
        });
      }

      // Assignee options
      if (task.assigneeId) {
        const assignee = assigneeMap.get(task.assigneeId) || {
          label: task.assigneeId,
          count: 0,
        };
        assignee.count++;
        assigneeMap.set(task.assigneeId, assignee);
      }
    });

    return {
      status: Array.from(statusMap.entries()).map(([id, data]) => ({
        id,
        label: data.label,
        count: data.count,
        color: data.color,
      })),
      type: Array.from(typeMap.entries()).map(([id, data]) => ({
        id,
        label: data.label,
        count: data.count,
      })),
      tags: Array.from(tagMap.entries()).map(([id, data]) => ({
        id,
        label: data.label,
        count: data.count,
        color: data.color,
      })),
      assignees: Array.from(assigneeMap.entries()).map(([id, data]) => ({
        id,
        label: data.label,
        count: data.count,
      })),
    };
  }

  /**
   * Apply filters to tasks
   */
  applyFilters(tasks: any[], filters: TimelineFilters): any[] {
    return tasks.filter(task => {
      // Status filter
      if (
        filters.status.length > 0 &&
        !filters.status.includes(task.statusId)
      ) {
        return false;
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(task.type)) {
        return false;
      }

      // Tags filter (task must have ALL selected tags)
      if (filters.tags.length > 0) {
        const taskTags = task.tags || [];
        const hasAllTags = filters.tags.every(tagId =>
          taskTags.includes(tagId)
        );
        if (!hasAllTags) {
          return false;
        }
      }

      // Assignee filter
      if (
        filters.assignees.length > 0 &&
        !filters.assignees.includes(task.assigneeId)
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(filters: TimelineFilters): boolean {
    return (
      filters.status.length > 0 ||
      filters.type.length > 0 ||
      filters.tags.length > 0 ||
      filters.assignees.length > 0
    );
  }

  /**
   * Get active filter count
   */
  getActiveFilterCount(filters: TimelineFilters): number {
    return (
      filters.status.length +
      filters.type.length +
      filters.tags.length +
      filters.assignees.length
    );
  }

  /**
   * Get filter display name
   */
  getFilterDisplayName(filterType: string): string {
    switch (filterType) {
      case 'status':
        return 'Status';
      case 'type':
        return 'Type';
      case 'tags':
        return 'Tags';
      case 'assignees':
        return 'Assignee';
      default:
        return filterType;
    }
  }

  /**
   * Get filter description
   */
  getFilterDescription(filterType: string): string {
    switch (filterType) {
      case 'status':
        return 'Filter by task status';
      case 'type':
        return 'Filter by task type';
      case 'tags':
        return 'Filter by task tags';
      case 'assignees':
        return 'Filter by assigned user';
      default:
        return `Filter by ${filterType}`;
    }
  }

  /**
   * Get all filter preferences
   */
  private async getAllFilterPreferences(): Promise<FilterPreferences[]> {
    try {
      const preferences = await persistentStorage.get(
        this.filterPreferencesKey
      );
      return preferences || [];
    } catch (error) {
      console.error('Error getting all filter preferences:', error);
      return [];
    }
  }

  /**
   * Clear all filter data (for demo mode reset)
   */
  async clearAllFilterData(): Promise<void> {
    try {
      await persistentStorage.remove(this.filterPreferencesKey);
      console.log('All filter data cleared');
    } catch (error) {
      console.error('Error clearing filter data:', error);
      throw error;
    }
  }

  /**
   * Reset demo data
   */
  async resetDemoData(): Promise<void> {
    try {
      const isDemoMode = await demoModeService.getDemoMode();
      if (isDemoMode) {
        await this.clearAllFilterData();
        console.log('Demo filter data reset');
      }
    } catch (error) {
      console.error('Error resetting demo filter data:', error);
      throw error;
    }
  }
}

export const timelineFiltersService = new TimelineFiltersService();
