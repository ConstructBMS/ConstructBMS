import React from 'react';
import BarLabelButton from './BarLabelButton';
import BarLabelDropdown from './BarLabelDropdown';
import type { BarLabelPreset } from '../../../services/barLabelService';

interface BarLabelsSectionProps {
  activePreset: BarLabelPreset | null;
  disabled?: boolean;
  loading?: {
    configure?: boolean;
    preset?: boolean;
    reset?: boolean;
  };
  onApplyPreset: (preset: BarLabelPreset) => void;
  onConfigureLabels: () => void;
  onResetLabels: () => void;
  presets: BarLabelPreset[];
}

const BarLabelsSection: React.FC<BarLabelsSectionProps> = ({
  presets,
  activePreset,
  onConfigureLabels,
  onApplyPreset,
  onResetLabels,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <BarLabelButton
          type="configure"
          onClick={onConfigureLabels}
          disabled={disabled}
          loading={loading.configure || false}
        />
        <BarLabelDropdown
          presets={presets}
          activePreset={activePreset}
          onApplyPreset={onApplyPreset}
          disabled={disabled}
          loading={loading.preset || false}
        />
        <BarLabelButton
          type="reset"
          onClick={onResetLabels}
          disabled={disabled}
          loading={loading.reset || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Bar Labels
      </div>
    </section>
  );
};

export default BarLabelsSection; 