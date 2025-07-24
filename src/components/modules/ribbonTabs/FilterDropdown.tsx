import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface Filter {
  createdAt?: string;
  createdBy?: string;
  demo?: boolean;
  id: string;
  name: string;
  rules: FilterRule[];
  shared?: boolean;
  type: 'built-in' | 'custom';
}

export interface FilterRule {
  field: string;
  operator: string;
  value: string | number | Date;
}

interface FilterDropdownProps {
  activeFilter: Filter | null;
  disabled?: boolean;
  filters: Filter[];
  loading?: boolean;
  onApplyFilter: (filter: Filter) => void;
  onCreateFilter: () => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  filters,
  activeFilter,
  onApplyFilter,
  onCreateFilter,
  disabled = false,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { canAccess } = usePermissions();

  const canView = canAccess('programme.view');
  const canEdit = canAccess('programme.edit');
  const isDisabled = disabled || !canView || loading;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterSelect = (filter: Filter) => {
    if (!isDisabled) {
      onApplyFilter(filter);
      setIsOpen(false);
    }
  };

  const handleCreateFilter = () => {
    if (!isDisabled && canEdit) {
      onCreateFilter();
      setIsOpen(false);
    }
  };

  // Built-in filters
  const builtInFilters: Filter[] = [
    {
      id: 'critical-path',
      name: 'Critical Path',
      type: 'built-in',
      rules: [{ field: 'isCritical', operator: 'equals', value: true }]
    },
    {
      id: 'starting-this-week',
      name: 'Tasks Starting This Week',
      type: 'built-in',
      rules: [
        { 
          field: 'startDate', 
          operator: 'greaterThanOrEqual', 
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        { 
          field: 'startDate', 
          operator: 'lessThanOrEqual', 
          value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]
    },
    {
      id: 'with-constraints',
      name: 'Tasks with Constraints',
      type: 'built-in',
      rules: [{ field: 'hasConstraints', operator: 'equals', value: true }]
    },
    {
      id: 'incomplete',
      name: 'Incomplete Tasks',
      type: 'built-in',
      rules: [{ field: 'percentComplete', operator: 'lessThan', value: 100 }]
    },
    {
      id: 'milestones',
      name: 'Milestones Only',
      type: 'built-in',
      rules: [{ field: 'isMilestone', operator: 'equals', value: true }]
    },
    {
      id: 'overdue',
      name: 'Overdue Tasks',
      type: 'built-in',
      rules: [
        { field: 'finishDate', operator: 'lessThan', value: new Date().toISOString().split('T')[0] },
        { field: 'percentComplete', operator: 'lessThan', value: 100 }
      ]
    }
  ];

  const customFilters = filters.filter(f => f.type === 'custom');
  const allFilters = [...builtInFilters, ...customFilters];

  const getFilterDisplayName = () => {
    if (activeFilter) {
      return activeFilter.name;
    }
    return 'Apply Filter';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center w-12 h-12
          border border-gray-300 bg-white hover:bg-gray-50
          transition-colors duration-200 rounded
          ${activeFilter ? 'bg-blue-50 border-blue-300' : ''}
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-gray-400'
          }
          ${loading ? 'animate-pulse' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Apply a built-in or saved filter"
      >
        <FunnelIcon className={`w-5 h-5 ${activeFilter ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-700'}`} />
        <div className="flex items-center">
          <span className={`text-xs font-medium mt-1 ${activeFilter ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
            {getFilterDisplayName()}
          </span>
          <ChevronDownIcon className={`w-3 h-3 ml-1 ${activeFilter ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {/* Built-in Filters */}
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Built-in Filters</div>
            </div>
            {builtInFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterSelect(filter)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                  activeFilter?.id === filter.id ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <span className="text-sm">{filter.name}</span>
                {activeFilter?.id === filter.id && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}

            {/* Custom Filters */}
            {customFilters.length > 0 && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <div className="px-3 py-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Custom Filters</div>
                </div>
                {customFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterSelect(filter)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                      activeFilter?.id === filter.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-sm">{filter.name}</span>
                      {filter.demo && (
                        <span className="ml-2 px-1 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                          Demo
                        </span>
                      )}
                    </div>
                    {activeFilter?.id === filter.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                ))}
              </>
            )}

            {/* Create New Filter */}
            {canEdit && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleCreateFilter}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Create New Filter</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown; 