import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { timelineFiltersService, TimelineFilters, FilterOption } from '../services/timelineFiltersService';

interface TimelineFiltersProps {
  projectId: string;
  tasks: any[];
  onFiltersChange: (filters: TimelineFilters) => void;
}

const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  projectId,
  tasks,
  onFiltersChange
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [filters, setFilters] = useState<TimelineFilters>({
    status: [],
    type: [],
    tags: [],
    assignees: []
  });
  const [filterOptions, setFilterOptions] = useState<{
    status: FilterOption[];
    type: FilterOption[];
    tags: FilterOption[];
    assignees: FilterOption[];
  }>({
    status: [],
    type: [],
    tags: [],
    assignees: []
  });
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [showAssigneesDropdown, setShowAssigneesDropdown] = useState(false);

  const canView = canAccess('programme.task.view');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load filter preferences
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const savedFilters = await timelineFiltersService.getFilterPreferences(projectId);
        setFilters(savedFilters);
        onFiltersChange(savedFilters);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    
    loadFilters();
  }, [projectId, onFiltersChange]);

  // Update filter options when tasks change
  useEffect(() => {
    const options = timelineFiltersService.getFilterOptions(tasks);
    setFilterOptions(options);
  }, [tasks]);

  // Handle filter change
  const handleFilterChange = async (filterType: keyof TimelineFilters, value: string, checked: boolean) => {
    try {
      const newFilters = { ...filters };
      
      if (checked) {
        newFilters[filterType] = [...newFilters[filterType], value];
      } else {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      }
      
      setFilters(newFilters);
      onFiltersChange(newFilters);
      
      // Save with debouncing
      await timelineFiltersService.saveFilterPreferencesDebounced(projectId, newFilters);
    } catch (error) {
      console.error('Error updating filter:', error);
    }
  };

  // Clear all filters
  const handleClearAllFilters = async () => {
    try {
      const emptyFilters: TimelineFilters = {
        status: [],
        type: [],
        tags: [],
        assignees: []
      };
      
      setFilters(emptyFilters);
      onFiltersChange(emptyFilters);
      
      const result = await timelineFiltersService.clearFilters(projectId);
      if (!result.success) {
        console.error('Error clearing filters:', result.error);
      }
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  // Get filter display name
  const getFilterDisplayName = (filterType: string): string => {
    return timelineFiltersService.getFilterDisplayName(filterType);
  };

  // Get active filter count
  const getActiveFilterCount = (): number => {
    return timelineFiltersService.getActiveFilterCount(filters);
  };

  // Check if any filters are active
  const hasActiveFilters = (): boolean => {
    return timelineFiltersService.hasActiveFilters(filters);
  };

  // Render filter dropdown
  const renderFilterDropdown = (
    filterType: keyof TimelineFilters,
    options: FilterOption[],
    isOpen: boolean,
    onToggle: () => void,
    disabled: boolean = false
  ) => {
    const selectedValues = filters[filterType];
    const selectedCount = selectedValues.length;
    
    return (
      <div className="relative">
        <button
          onClick={onToggle}
          disabled={disabled || !canView}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
            ${disabled || !canView
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : selectedCount > 0
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <FunnelIcon className="w-4 h-4" />
          <span>{getFilterDisplayName(filterType)}</span>
          {selectedCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {selectedCount}
            </span>
          )}
        </button>
        
        {isOpen && !disabled && canView && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {getFilterDisplayName(filterType)}
                </h3>
                {selectedCount > 0 && (
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      newFilters[filterType] = [];
                      setFilters(newFilters);
                      onFiltersChange(newFilters);
                      timelineFiltersService.saveFilterPreferencesDebounced(projectId, newFilters);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {options.length > 0 ? (
                  options.map(option => {
                    const isSelected = selectedValues.includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleFilterChange(filterType, option.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="flex-1 text-sm text-gray-900 dark:text-white">
                          {option.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({option.count})
                        </span>
                        {option.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: option.color }}
                          />
                        )}
                      </label>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    No options available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!canView) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center space-x-2">
        <FunnelIcon className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
        {isDemoMode && (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-md">
            DEMO MODE
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap items-center space-x-2">
        {/* Status Filter */}
        {renderFilterDropdown(
          'status',
          filterOptions.status,
          showStatusDropdown,
          () => setShowStatusDropdown(!showStatusDropdown)
        )}
        
        {/* Type Filter */}
        {renderFilterDropdown(
          'type',
          filterOptions.type,
          showTypeDropdown,
          () => setShowTypeDropdown(!showTypeDropdown)
        )}
        
        {/* Tags Filter */}
        {renderFilterDropdown(
          'tags',
          filterOptions.tags,
          showTagsDropdown,
          () => setShowTagsDropdown(!showTagsDropdown)
        )}
        
        {/* Assignees Filter */}
        {renderFilterDropdown(
          'assignees',
          filterOptions.assignees,
          showAssigneesDropdown,
          () => setShowAssigneesDropdown(!showAssigneesDropdown),
          isDemoMode // Disabled in demo mode
        )}
        
        {/* Clear All Button */}
        {hasActiveFilters() && (
          <button
            onClick={handleClearAllFilters}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>
      
      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          
          {filters.status.map(statusId => {
            const option = filterOptions.status.find(s => s.id === statusId);
            return (
              <span
                key={`status-${statusId}`}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
              >
                <span>{option?.label || statusId}</span>
                <button
                  onClick={() => handleFilterChange('status', statusId, false)}
                  className="hover:text-blue-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          
          {filters.type.map(typeId => {
            const option = filterOptions.type.find(t => t.id === typeId);
            return (
              <span
                key={`type-${typeId}`}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
              >
                <span>{option?.label || typeId}</span>
                <button
                  onClick={() => handleFilterChange('type', typeId, false)}
                  className="hover:text-green-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          
          {filters.tags.map(tagId => {
            const option = filterOptions.tags.find(t => t.id === tagId);
            return (
              <span
                key={`tag-${tagId}`}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md"
              >
                <span>{option?.label || tagId}</span>
                <button
                  onClick={() => handleFilterChange('tags', tagId, false)}
                  className="hover:text-purple-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          
          {filters.assignees.map(assigneeId => {
            const option = filterOptions.assignees.find(a => a.id === assigneeId);
            return (
              <span
                key={`assignee-${assigneeId}`}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-md"
              >
                <span>{option?.label || assigneeId}</span>
                <button
                  onClick={() => handleFilterChange('assignees', assigneeId, false)}
                  className="hover:text-orange-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      
      {/* Demo Mode Restrictions */}
      {isDemoMode && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md">
          <div className="flex items-start space-x-2">
            <FunnelIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Demo Mode Restrictions:</p>
              <ul className="mt-1 space-y-1">
                <li>• Maximum 2 filters selectable at once</li>
                <li>• Assignee filter disabled</li>
                <li>• Filter preferences reset on logout</li>
                <li>• All filters tagged as demo</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Summary */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {tasks.length} tasks
        {hasActiveFilters() && (
          <span className="ml-2">
            (filtered from {tasks.length + getActiveFilterCount()} total)
          </span>
        )}
      </div>
    </div>
  );
};

export default TimelineFilters; 