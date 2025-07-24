import React from 'react';
import RowStripingToggle from './RowStripingToggle';
import RowBorderDropdown from './RowBorderDropdown';
import HighlightRowToggle from './HighlightRowToggle';

export type RowBorderStyle = 'none' | 'bottom' | 'full';

interface TaskRowStylingSectionProps {
  disabled?: boolean;
  highlightActiveRow: boolean;
  loading?: {
    border?: boolean;
    highlight?: boolean;
    striping?: boolean;
  };
  onRowBorderChange: (border: RowBorderStyle) => void;
  onToggleHighlightActiveRow: () => void;
  onToggleRowStriping: () => void;
  rowBorder: RowBorderStyle;
  rowStriping: boolean;
}

const TaskRowStylingSection: React.FC<TaskRowStylingSectionProps> = ({
  rowStriping,
  onToggleRowStriping,
  rowBorder,
  onRowBorderChange,
  highlightActiveRow,
  onToggleHighlightActiveRow,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-60">
      <div className="ribbon-buttons flex space-x-2">
        <RowStripingToggle
          isEnabled={rowStriping}
          onToggle={onToggleRowStriping}
          disabled={disabled || loading.striping}
        />
        <RowBorderDropdown
          currentBorder={rowBorder}
          onBorderChange={onRowBorderChange}
          disabled={disabled || loading.border}
        />
        <HighlightRowToggle
          isEnabled={highlightActiveRow}
          onToggle={onToggleHighlightActiveRow}
          disabled={disabled || loading.highlight}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Task Row Styling
      </div>
    </section>
  );
};

export default TaskRowStylingSection; 