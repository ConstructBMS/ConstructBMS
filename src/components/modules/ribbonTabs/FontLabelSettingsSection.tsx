import React from 'react';
import FontStyleDropdown from './FontStyleDropdown';
import LabelPositionDropdown from './LabelPositionDropdown';
import ToggleTaskLabels from './ToggleTaskLabels';

export type FontStyleOption = 'default' | 'serif' | 'sans' | 'mono';
export type LabelPositionOption = 'insideLeft' | 'insideRight' | 'above' | 'below' | 'hidden';

interface FontLabelSettingsSectionProps {
  disabled?: boolean;
  fontStyle: FontStyleOption;
  labelPosition: LabelPositionOption;
  loading?: {
    fontStyle?: boolean;
    labelPosition?: boolean;
    taskLabels?: boolean;
  };
  onFontStyleChange: (font: FontStyleOption) => void;
  onLabelPositionChange: (position: LabelPositionOption) => void;
  onTaskLabelsToggle: () => void;
  showTaskLabels: boolean;
}

const FontLabelSettingsSection: React.FC<FontLabelSettingsSectionProps> = ({
  fontStyle,
  onFontStyleChange,
  labelPosition,
  onLabelPositionChange,
  showTaskLabels,
  onTaskLabelsToggle,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex items-center space-x-2">
        <FontStyleDropdown
          currentFont={fontStyle}
          onFontChange={onFontStyleChange}
          disabled={disabled || loading.fontStyle}
        />
        <LabelPositionDropdown
          currentPosition={labelPosition}
          onPositionChange={onLabelPositionChange}
          disabled={disabled || loading.labelPosition}
        />
        <ToggleTaskLabels
          isVisible={showTaskLabels}
          onToggle={onTaskLabelsToggle}
          disabled={disabled || loading.taskLabels}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Font & Label Settings
      </div>
    </section>
  );
};

export default FontLabelSettingsSection; 