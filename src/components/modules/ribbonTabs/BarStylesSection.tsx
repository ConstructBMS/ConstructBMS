import React from 'react';
import BarStylesButton from './BarStylesButton';

interface BarStylesSectionProps {
  onEditStyles: () => void;
  onResetStyles: () => void;
  disabled?: boolean;
  loading?: {
    edit?: boolean;
    reset?: boolean;
  };
}

const BarStylesSection: React.FC<BarStylesSectionProps> = ({
  onEditStyles,
  onResetStyles,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-60">
      <div className="ribbon-buttons flex space-x-2">
        <BarStylesButton
          type="edit"
          onClick={onEditStyles}
          disabled={disabled}
          loading={loading.edit || false}
        />
        <BarStylesButton
          type="reset"
          onClick={onResetStyles}
          disabled={disabled}
          loading={loading.reset || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Bar Styles
      </div>
    </section>
  );
};

export default BarStylesSection; 