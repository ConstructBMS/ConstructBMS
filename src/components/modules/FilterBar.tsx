import React from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { demoModeService } from '../services/demoModeService';
import { timelineFiltersService, TimelineFilters, FilterOption } from '../services/timelineFiltersService';

interface FilterBarProps {
  filterOptions: {
    assignees: FilterOption[];
    status: FilterOption[];
    tags: FilterOption[];
    type: FilterOption[];
  };
  filters: TimelineFilters;
  onClearAll: () => void;
  onFilterRemove: (filterType: keyof TimelineFilters, value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  filterOptions,
  onFilterRemove,
  onClearAll
}) => {
  const hasActiveFilters = timelineFiltersService.hasActiveFilters(filters);
  const activeFilterCount = timelineFiltersService.getActiveFilterCount(filters);

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Filters
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              {activeFilterCount}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center space-x-2">
            {/* Status Filters */}
            {filters.status.map(statusId => {
              const option = filterOptions.status.find(s => s.id === statusId);
              return (
                <span
                  key={`status-${statusId}`}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                >
                  <span className="font-medium">Status:</span>
                  <span>{option?.label || statusId}</span>
                  <button
                    onClick={() => onFilterRemove('status', statusId)}
                    className="hover:text-blue-600 transition-colors duration-150"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            
            {/* Type Filters */}
            {filters.type.map(typeId => {
              const option = filterOptions.type.find(t => t.id === typeId);
              return (
                <span
                  key={`type-${typeId}`}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                >
                  <span className="font-medium">Type:</span>
                  <span>{option?.label || typeId}</span>
                  <button
                    onClick={() => onFilterRemove('type', typeId)}
                    className="hover:text-green-600 transition-colors duration-150"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            
            {/* Tags Filters */}
            {filters.tags.map(tagId => {
              const option = filterOptions.tags.find(t => t.id === tagId);
              return (
                <span
                  key={`tag-${tagId}`}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md"
                >
                  <span className="font-medium">Tag:</span>
                  <span>{option?.label || tagId}</span>
                  <button
                    onClick={() => onFilterRemove('tags', tagId)}
                    className="hover:text-purple-600 transition-colors duration-150"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            
            {/* Assignees Filters */}
            {filters.assignees.map(assigneeId => {
              const option = filterOptions.assignees.find(a => a.id === assigneeId);
              return (
                <span
                  key={`assignee-${assigneeId}`}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-md"
                >
                  <span className="font-medium">Assignee:</span>
                  <span>{option?.label || assigneeId}</span>
                  <button
                    onClick={() => onFilterRemove('assignees', assigneeId)}
                    className="hover:text-orange-600 transition-colors duration-150"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onClearAll}
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors duration-150"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar; 