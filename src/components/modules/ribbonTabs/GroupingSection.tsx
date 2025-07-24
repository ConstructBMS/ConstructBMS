import React from 'react';
import GroupingButton from './GroupingButton';

interface GroupingSectionProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onToggleSummaryBars: () => void;
  isSummaryBarsVisible?: boolean;
  hasSummaryTasks?: boolean;
}

const GroupingSection: React.FC<GroupingSectionProps> = ({
  onExpandAll,
  onCollapseAll,
  onToggleSummaryBars,
  isSummaryBarsVisible = true,
  hasSummaryTasks = false
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <GroupingButton 
          type="expand" 
          onClick={onExpandAll}
          disabled={!hasSummaryTasks}
        />
        <GroupingButton 
          type="collapse" 
          onClick={onCollapseAll}
          disabled={!hasSummaryTasks}
        />
        <GroupingButton 
          type="toggleSummaryBars" 
          onClick={onToggleSummaryBars}
          isActive={isSummaryBarsVisible}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Grouping
      </div>
    </section>
  );
};

export default GroupingSection; 