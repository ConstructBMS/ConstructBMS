import React from 'react';
import GridOptionToggle from './GridOptionToggle';
import GridOptionButton from './GridOptionButton';

interface GridOptionsSectionProps {
  disabled?: boolean;
  loading?: {
    pin?: boolean;
    reset?: boolean;
    stripeRows?: boolean;
    wrapText?: boolean;
  };
  onResetColumns: () => void;
  onTogglePin: () => void;
  onToggleStripeRows: () => void;
  onToggleWrapText: () => void;
  pinnedColumn: boolean;
  stripeRows: boolean;
  wrapText: boolean;
}

const GridOptionsSection: React.FC<GridOptionsSectionProps> = ({
  pinnedColumn,
  wrapText,
  stripeRows,
  onTogglePin,
  onToggleWrapText,
  onToggleStripeRows,
  onResetColumns,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <GridOptionToggle
          type="pin"
          isActive={pinnedColumn}
          onClick={onTogglePin}
          disabled={disabled}
          loading={loading.pin || false}
        />
        <GridOptionToggle
          type="wrapText"
          isActive={wrapText}
          onClick={onToggleWrapText}
          disabled={disabled}
          loading={loading.wrapText || false}
        />
        <GridOptionToggle
          type="stripeRows"
          isActive={stripeRows}
          onClick={onToggleStripeRows}
          disabled={disabled}
          loading={loading.stripeRows || false}
        />
        <GridOptionButton
          type="resetColumns"
          onClick={onResetColumns}
          disabled={disabled}
          loading={loading.reset || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Grid Options
      </div>
    </section>
  );
};

export default GridOptionsSection; 