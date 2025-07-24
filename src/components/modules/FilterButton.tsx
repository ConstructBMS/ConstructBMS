import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { filterService, type FilterState } from '../../services/filterService';
import FilterPanel from './FilterPanel';
import { toastService } from './ToastNotification';

interface FilterButtonProps {
  className?: string;
  onFilterChange?: (filterState: FilterState) => void;
  tasks?: any[];
}

const FilterButton: React.FC<FilterButtonProps> = ({
  tasks = [],
  onFilterChange,
  className = ''
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>(filterService.getFilterState());
  const [isDemoMode, setIsDemoMode] = useState(filterService.isInDemoMode());

  // Set up filter change listener
  useEffect(() => {
    filterService.onFilterChange = (newFilterState) => {
      setFilterState(newFilterState);
      setIsDemoMode(filterService.isInDemoMode());
      if (onFilterChange) {
        onFilterChange(newFilterState);
      }
    };

    return () => {
      filterService.onFilterChange = undefined as any;
    };
  }, [onFilterChange]);

  // Handle removing a filter chip
  const handleRemoveFilter = async (filterId: string) => {
    const success = await filterService.removeFilter(filterId);
    if (success) {
      toastService.success('Success', 'Filter removed');
    } else {
      toastService.error('Error', 'Failed to remove filter');
    }
  };

  // Handle clearing all filters
  const handleClearAll = async () => {
    await filterService.clearAllFilters();
    toastService.success('Success', 'All filters cleared');
  };

  // Get demo mode configuration
  const demoConfig = filterService.getDemoModeConfig();

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsPanelOpen(true)}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            filterState.activeFilters.length > 0
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
          title={isDemoMode ? 'Upgrade to use advanced filters' : 'Open filter panel'}
        >
          <FunnelIcon className="w-4 h-4 mr-1" />
          Filters
          {filterState.activeFilters.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
              {filterState.activeFilters.length}
            </span>
          )}
          {isDemoMode && (
            <ExclamationTriangleIcon className="w-3 h-3 ml-1 text-orange-500" />
          )}
        </button>

        {/* Clear All Button */}
        {filterState.activeFilters.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-2 py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Clear all filters"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {filterState.activeFilters.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filterState.activeFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md border border-blue-200 dark:border-blue-800"
            >
              <span className="mr-1">{filter.displayValue}</span>
              <button
                onClick={() => handleRemoveFilter(filter.id)}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                title="Remove filter"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Demo Mode Warning */}
      {isDemoMode && filterState.activeFilters.length >= demoConfig.maxActiveFilters && (
        <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
          <div className="flex items-center text-xs text-orange-700 dark:text-orange-300">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            <span>Demo Mode: Max {demoConfig.maxActiveFilters} filter</span>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onFilterChange={onFilterChange || undefined}
        tasks={tasks}
      />
    </div>
  );
};

export default FilterButton; 