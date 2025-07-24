import React from 'react';
import RowHeightDropdown from './RowHeightDropdown';
import GridLinesToggle from './GridLinesToggle';
import WeekendShadingToggle from './WeekendShadingToggle';
import BackgroundColorPicker from './BackgroundColorPicker';

export type RowHeightOption = 'small' | 'medium' | 'large';
export type BackgroundColorOption = 'light' | 'dark' | 'system' | 'custom';

interface TimelineAppearanceSectionProps {
  rowHeight: RowHeightOption;
  onRowHeightChange: (height: RowHeightOption) => void;
  showGridLines: boolean;
  onGridLinesToggle: () => void;
  showWeekendShading: boolean;
  onWeekendShadingToggle: () => void;
  backgroundColor: BackgroundColorOption;
  customBackgroundColor?: string;
  onBackgroundColorChange: (color: BackgroundColorOption, customColor?: string) => void;
  disabled?: boolean;
  loading?: {
    rowHeight?: boolean;
    gridLines?: boolean;
    weekendShading?: boolean;
    backgroundColor?: boolean;
  };
}

const TimelineAppearanceSection: React.FC<TimelineAppearanceSectionProps> = ({
  rowHeight,
  onRowHeightChange,
  showGridLines,
  onGridLinesToggle,
  showWeekendShading,
  onWeekendShadingToggle,
  backgroundColor,
  customBackgroundColor,
  onBackgroundColorChange,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex items-center space-x-2">
        <RowHeightDropdown
          currentHeight={rowHeight}
          onHeightChange={onRowHeightChange}
          disabled={disabled || loading.rowHeight}
        />
        <GridLinesToggle
          isEnabled={showGridLines}
          onToggle={onGridLinesToggle}
          disabled={disabled || loading.gridLines}
        />
        <WeekendShadingToggle
          isEnabled={showWeekendShading}
          onToggle={onWeekendShadingToggle}
          disabled={disabled || loading.weekendShading}
        />
        <BackgroundColorPicker
          currentColor={backgroundColor}
          customColor={customBackgroundColor}
          onColorChange={onBackgroundColorChange}
          disabled={disabled || loading.backgroundColor}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Timeline Appearance
      </div>
    </section>
  );
};

export default TimelineAppearanceSection; 