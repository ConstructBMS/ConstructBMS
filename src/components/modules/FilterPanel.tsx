import React, { useState, useEffect, useRef } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { filterService, type FilterCriteria, type FilterState } from '../../services/filterService';
import { toastService } from './ToastNotification';

interface FilterPanelProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onFilterChange?: ((filterState: FilterState) => void) | undefined;
  tasks?: any[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  onFilterChange,
  tasks = [],
  className = ''
}) => {
  const [filterState, setFilterState] = useState<FilterState>(filterService.getFilterState());
  const [filterOptions, setFilterOptions] = useState(filterService.getFilterOptions());
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedOperator, setSelectedOperator] = useState<string>('equals');
  const [selectedValue, setSelectedValue] = useState<any>('');
  const [isDemoMode, setIsDemoMode] = useState(filterService.isInDemoMode());
  const panelRef = useRef<HTMLDivElement>(null);

  // Update filter counts when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      filterService.updateFilterCounts(tasks);
      setFilterOptions(filterService.getFilterOptions());
    }
  }, [tasks]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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

  // Get operators for selected field type
  const getOperators = (type: string) => {
    switch (type) {
      case 'status':
      case 'role':
      case 'phase':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_in', label: 'Not In' },
          { value: 'is_null', label: 'Is Empty' },
          { value: 'is_not_null', label: 'Is Not Empty' }
        ];
      case 'tag':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'not_in', label: 'Not In' },
          { value: 'is_null', label: 'Is Empty' },
          { value: 'is_not_null', label: 'Is Not Empty' }
        ];
      case 'custom':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' },
          { value: 'is_null', label: 'Is Empty' },
          { value: 'is_not_null', label: 'Is Not Empty' }
        ];
      default:
        return [{ value: 'equals', label: 'Equals' }];
    }
  };

  // Get values for selected field
  const getFieldValues = (type: string, field: string) => {
    switch (type) {
      case 'status':
        return filterOptions.statuses;
      case 'tag':
        return filterOptions.tags;
      case 'role':
        return filterOptions.roles;
      case 'phase':
        return filterOptions.phases;
      case 'custom':
        const customField = filterOptions.customFields.find(f => f.field === field);
        return customField?.options?.map(opt => ({ value: opt, label: opt, count: 0 })) || [];
      default:
        return [];
    }
  };

  // Handle adding a filter
  const handleAddFilter = async () => {
    if (!selectedType || !selectedField || selectedValue === '') {
      toastService.error('Error', 'Please fill in all filter fields');
      return;
    }

    const success = await filterService.addFilter({
      type: selectedType as any,
      field: selectedField,
      operator: selectedOperator as any,
      value: selectedValue,
      label: `${selectedType} filter`
    });

    if (success) {
      // Reset form
      setSelectedType('');
      setSelectedField('');
      setSelectedOperator('equals');
      setSelectedValue('');
      toastService.success('Success', 'Filter added successfully');
    } else {
      if (isDemoMode) {
        toastService.warning('Demo Mode', 'Upgrade to use advanced filters');
      } else {
        toastService.error('Error', 'Failed to add filter');
      }
    }
  };

  // Handle removing a filter
  const handleRemoveFilter = async (filterId: string) => {
    const success = await filterService.removeFilter(filterId);
    if (success) {
      toastService.success('Success', 'Filter removed successfully');
    } else {
      toastService.error('Error', 'Failed to remove filter');
    }
  };

  // Handle clearing all filters
  const handleClearAll = async () => {
    await filterService.clearAllFilters();
    toastService.success('Success', 'All filters cleared');
  };

  // Handle inverting filters
  const handleInvert = async () => {
    await filterService.invertFilters();
    toastService.info('Info', 'Filters inverted');
  };

  // Get demo mode configuration
  const demoConfig = filterService.getDemoModeConfig();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div 
        ref={panelRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-96 max-h-[80vh] overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Timeline Filters
            </h3>
            {isDemoMode && (
              <div className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs rounded-md">
                Demo
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Warning */}
        {isDemoMode && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800">
            <div className="flex items-center text-sm text-orange-700 dark:text-orange-300">
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              <span>Demo Mode: Max {demoConfig.maxActiveFilters} filter, no custom fields</span>
            </div>
          </div>
        )}

        {/* Active Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Active Filters ({filterState.activeFilters.length})
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Clear All
              </button>
              <button
                onClick={handleInvert}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Invert
              </button>
            </div>
          </div>
          
          {filterState.activeFilters.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No active filters
            </div>
          ) : (
            <div className="space-y-2">
              {filterState.activeFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {filter.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {filter.displayValue}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFilter(filter.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Filter */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Add New Filter
          </h4>
          
          <div className="space-y-3">
            {/* Filter Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setSelectedField('');
                  setSelectedValue('');
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select type...</option>
                <option value="status">Status</option>
                <option value="tag">Tag</option>
                <option value="role">Role</option>
                <option value="phase">Phase</option>
                {!isDemoMode && <option value="custom">Custom Field</option>}
              </select>
            </div>

            {/* Field Selection */}
            {selectedType && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field
                </label>
                <select
                  value={selectedField}
                  onChange={(e) => {
                    setSelectedField(e.target.value);
                    setSelectedValue('');
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select field...</option>
                  {selectedType === 'custom' && filterOptions.customFields.map((field) => (
                    <option key={field.field} value={field.field}>
                      {field.label}
                    </option>
                  ))}
                  {selectedType !== 'custom' && (
                    <option value={selectedType === 'status' ? 'status' : 
                                  selectedType === 'tag' ? 'tags' :
                                  selectedType === 'role' ? 'assignedTo' :
                                  'parentPhaseId'}>
                      {selectedType === 'status' ? 'Status' :
                       selectedType === 'tag' ? 'Tags' :
                       selectedType === 'role' ? 'Assigned To' :
                       'Phase'}
                    </option>
                  )}
                </select>
              </div>
            )}

            {/* Operator */}
            {selectedField && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Operator
                </label>
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {getOperators(selectedType).map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Value */}
            {selectedField && selectedOperator && !['is_null', 'is_not_null'].includes(selectedOperator) && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value
                </label>
                {selectedType === 'custom' && filterOptions.customFields.find(f => f.field === selectedField)?.type === 'text' ? (
                  <input
                    type="text"
                    value={selectedValue}
                    onChange={(e) => setSelectedValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter value..."
                  />
                ) : (
                  <select
                    value={selectedValue}
                    onChange={(e) => setSelectedValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select value...</option>
                    {getFieldValues(selectedType, selectedField).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleAddFilter}
              disabled={!selectedType || !selectedField || (selectedValue === '' && !['is_null', 'is_not_null'].includes(selectedOperator))}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              Add Filter
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {filterState.activeFilters.length > 0 ? (
              <span>Showing filtered results</span>
            ) : (
              <span>No filters applied - showing all tasks</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel; 