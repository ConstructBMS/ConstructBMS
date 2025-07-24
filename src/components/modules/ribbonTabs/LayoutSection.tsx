import React from 'react';
import LayoutButton from './LayoutButton';

interface LayoutSectionProps {
  disabled?: boolean;
  fullscreen: boolean;
  loading?: {
    fullscreen?: boolean;
    reset?: boolean;
    split?: boolean;
  };
  onResetLayout: () => void;
  onToggleFullscreen: () => void;
  onToggleSplit: () => void;
  splitView: boolean;
}

const LayoutSection: React.FC<LayoutSectionProps> = ({
  splitView,
  fullscreen,
  onToggleSplit,
  onResetLayout,
  onToggleFullscreen,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <LayoutButton
          type="split"
          isActive={splitView}
          onClick={onToggleSplit}
          disabled={disabled}
          loading={loading.split || false}
        />
        <LayoutButton
          type="reset"
          onClick={onResetLayout}
          disabled={disabled}
          loading={loading.reset || false}
        />
        <LayoutButton
          type="fullscreen"
          isActive={fullscreen}
          onClick={onToggleFullscreen}
          disabled={disabled}
          loading={loading.fullscreen || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Layout
      </div>
    </section>
  );
};

export default LayoutSection; 