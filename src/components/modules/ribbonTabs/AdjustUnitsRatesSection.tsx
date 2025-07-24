import React from 'react';
import AdjustButton from './AdjustButton';

interface AdjustUnitsRatesSectionProps {
  disabled?: boolean;
  loading?: {
    fixedCost?: boolean;
    rate?: boolean;
    units?: boolean;
  };
  onAdjustRate: () => void;
  onAdjustUnits: () => void;
  onSetFixedCost: () => void;
}

const AdjustUnitsRatesSection: React.FC<AdjustUnitsRatesSectionProps> = ({
  onAdjustUnits,
  onAdjustRate,
  onSetFixedCost,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <AdjustButton
          type="units"
          onClick={onAdjustUnits}
          disabled={disabled}
          loading={loading.units || false}
        />
        <AdjustButton
          type="rate"
          onClick={onAdjustRate}
          disabled={disabled}
          loading={loading.rate || false}
        />
        <AdjustButton
          type="fixedCost"
          onClick={onSetFixedCost}
          disabled={disabled}
          loading={loading.fixedCost || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Adjust Units & Rates
      </div>
    </section>
  );
};

export default AdjustUnitsRatesSection; 