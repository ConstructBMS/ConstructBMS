import React from 'react';
import RowStripingToggle from './RowStripingToggle';
import RowBorderDropdown from './RowBorderDropdown';
import HighlightRowToggle from './HighlightRowToggle';

export type RowBorderStyle = 'none' | 'bottom' | 'full';

interface TaskRowStylingSectionProps {
  rowStriping: boolean;
  onToggleRowStriping: () => void;
  rowBorder: RowBorderStyle;
  onRowBorderChange: (border: RowBorderStyle) => void;
  highlightActiveRow: boolean;
  onToggleHighlightActiveRow: () => void;
  disabled?: boolean;
  loading?: {
    striping?: boolean;
    border?: boolean;
    highlight?: boolean;
  };
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