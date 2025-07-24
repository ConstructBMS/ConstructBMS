import React from 'react';
import CriticalPathToggle from './CriticalPathToggle';
import CriticalPathColorDropdown from './CriticalPathColorDropdown';
import CriticalPathLegendIcon from './CriticalPathLegendIcon';

export type CriticalPathColorOption = 'red' | 'orange' | 'purple';

interface CriticalPathHighlightingSectionProps {
  showCriticalPath: boolean;
  onToggleCriticalPath: () => void;
  criticalPathColor: CriticalPathColorOption;
  onCriticalPathColorChange: (color: CriticalPathColorOption) => void;
  disabled?: boolean;
  loading?: {
    toggle?: boolean;
    color?: boolean;
  };
}

const CriticalPathHighlightingSection: React.FC<CriticalPathHighlightingSectionProps> = ({
  showCriticalPath,
  onToggleCriticalPath,
  criticalPathColor,
  onCriticalPathColorChange,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-52">
      <div className="ribbon-buttons flex space-x-2">
        <CriticalPathToggle
          isEnabled={showCriticalPath}
          onToggle={onToggleCriticalPath}
          disabled={disabled || loading.toggle}
        />
        <CriticalPathColorDropdown
          currentColor={criticalPathColor}
          onColorChange={onCriticalPathColorChange}
          disabled={disabled || loading.color}
        />
        <CriticalPathLegendIcon
          disabled={disabled}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Critical Path Highlighting
      </div>
    </section>
  );
};

export default CriticalPathHighlightingSection; 