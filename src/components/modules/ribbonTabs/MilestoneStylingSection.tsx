import React from 'react';
import MilestoneIconDropdown from './MilestoneIconDropdown';
import MilestoneColourDropdown from './MilestoneColourDropdown';
import MilestoneLabelToggle from './MilestoneLabelToggle';

export type MilestoneIconType = 'diamond' | 'flag' | 'dot' | 'star';
export type MilestoneColorOption = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';

interface MilestoneStylingSectionProps {
  milestoneIcon: MilestoneIconType;
  onMilestoneIconChange: (icon: MilestoneIconType) => void;
  milestoneColor: MilestoneColorOption;
  onMilestoneColorChange: (color: MilestoneColorOption) => void;
  showMilestoneLabels: boolean;
  onToggleMilestoneLabels: () => void;
  disabled?: boolean;
  loading?: {
    icon?: boolean;
    color?: boolean;
    labels?: boolean;
  };
}

const MilestoneStylingSection: React.FC<MilestoneStylingSectionProps> = ({
  milestoneIcon,
  onMilestoneIconChange,
  milestoneColor,
  onMilestoneColorChange,
  showMilestoneLabels,
  onToggleMilestoneLabels,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-56">
      <div className="ribbon-buttons flex space-x-2">
        <MilestoneIconDropdown
          currentIcon={milestoneIcon}
          onIconChange={onMilestoneIconChange}
          disabled={disabled || loading.icon}
        />
        <MilestoneColourDropdown
          currentColor={milestoneColor}
          onColorChange={onMilestoneColorChange}
          disabled={disabled || loading.color}
        />
        <MilestoneLabelToggle
          showLabels={showMilestoneLabels}
          onToggleLabels={onToggleMilestoneLabels}
          disabled={disabled || loading.labels}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Milestone Styling
      </div>
    </section>
  );
};

export default MilestoneStylingSection; 