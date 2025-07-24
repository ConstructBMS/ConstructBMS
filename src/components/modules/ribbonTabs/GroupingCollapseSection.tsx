import React from 'react';
import GroupingButton from './GroupingButton';

interface GroupingCollapseSectionProps {
  summariesCollapsed: boolean;
  onExpandSelected: () => void;
  onCollapseSelected: () => void;
  onToggleAll: () => void;
  disabled?: boolean;
  loading?: {
    expand?: boolean;
    collapse?: boolean;
    toggle?: boolean;
  };
}

const GroupingCollapseSection: React.FC<GroupingCollapseSectionProps> = ({
  summariesCollapsed,
  onExpandSelected,
  onCollapseSelected,
  onToggleAll,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <GroupingButton
          type="expandSelected"
          onClick={onExpandSelected}
          disabled={disabled}
          loading={loading.expand || false}
        />
        <GroupingButton
          type="collapseSelected"
          onClick={onCollapseSelected}
          disabled={disabled}
          loading={loading.collapse || false}
        />
        <GroupingButton
          type="toggleAll"
          isActive={summariesCollapsed}
          onClick={onToggleAll}
          disabled={disabled}
          loading={loading.toggle || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Grouping & Collapse
      </div>
    </section>
  );
};

export default GroupingCollapseSection; 