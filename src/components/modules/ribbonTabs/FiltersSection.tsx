import React from 'react';
import FilterDropdown from './FilterDropdown';
import FilterToolsButton from './FilterToolsButton';
import type { Filter } from './FilterDropdown';

interface FiltersSectionProps {
  filters: Filter[];
  activeFilter: Filter | null;
  onApplyFilter: (filter: Filter) => void;
  onManageFilters: () => void;
  onClearFilter: () => void;
  onCreateFilter: () => void;
  disabled?: boolean;
  loading?: {
    apply?: boolean;
    manage?: boolean;
    clear?: boolean;
  };
}

const FiltersSection: React.FC<FiltersSectionProps> = ({
  filters,
  activeFilter,
  onApplyFilter,
  onManageFilters,
  onClearFilter,
  onCreateFilter,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <FilterDropdown
          filters={filters}
          activeFilter={activeFilter}
          onApplyFilter={onApplyFilter}
          onCreateFilter={onCreateFilter}
          disabled={disabled}
          loading={loading.apply || false}
        />
        <FilterToolsButton
          type="manage"
          onClick={onManageFilters}
          disabled={disabled}
          loading={loading.manage || false}
        />
        <FilterToolsButton
          type="clear"
          onClick={onClearFilter}
          disabled={disabled}
          loading={loading.clear || false}
          hasActiveFilter={!!activeFilter}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Filters
      </div>
    </section>
  );
};

export default FiltersSection; 