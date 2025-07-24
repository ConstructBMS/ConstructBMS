import React from 'react';
import ResourceUsageToggle from './ResourceUsageToggle';

interface ResourceUsageViewSectionProps {
  usageViewActive: boolean;
  groupByTypeActive: boolean;
  groupByTaskActive: boolean;
  onToggleUsageView: () => void;
  onToggleGroupByType: () => void;
  onToggleGroupByTask: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ResourceUsageViewSection: React.FC<ResourceUsageViewSectionProps> = ({
  usageViewActive,
  groupByTypeActive,
  groupByTaskActive,
  onToggleUsageView,
  onToggleGroupByType,
  onToggleGroupByTask,
  disabled = false,
  loading = false
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <ResourceUsageToggle
          type="usageView"
          isActive={usageViewActive}
          onClick={onToggleUsageView}
          disabled={disabled}
          loading={loading}
        />
        <ResourceUsageToggle
          type="groupByType"
          isActive={groupByTypeActive}
          onClick={onToggleGroupByType}
          disabled={disabled || !usageViewActive}
          loading={loading}
        />
        <ResourceUsageToggle
          type="groupByTask"
          isActive={groupByTaskActive}
          onClick={onToggleGroupByTask}
          disabled={disabled || !usageViewActive}
          loading={loading}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Resource Usage View
      </div>
    </section>
  );
};

export default ResourceUsageViewSection; 