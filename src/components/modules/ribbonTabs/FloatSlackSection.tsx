import React from 'react';
import FloatToggle from './FloatToggle';

interface FloatSlackSectionProps {
  showTotalFloat: boolean;
  showFreeFloat: boolean;
  highlightNegativeFloat: boolean;
  onToggleTotalFloat: () => void;
  onToggleFreeFloat: () => void;
  onToggleNegativeFloat: () => void;
  disabled?: boolean;
  loading?: {
    total?: boolean;
    free?: boolean;
    negative?: boolean;
  };
}

const FloatSlackSection: React.FC<FloatSlackSectionProps> = ({
  showTotalFloat,
  showFreeFloat,
  highlightNegativeFloat,
  onToggleTotalFloat,
  onToggleFreeFloat,
  onToggleNegativeFloat,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <FloatToggle
          type="total"
          isActive={showTotalFloat}
          onClick={onToggleTotalFloat}
          disabled={disabled}
          loading={loading.total || false}
        />
        <FloatToggle
          type="free"
          isActive={showFreeFloat}
          onClick={onToggleFreeFloat}
          disabled={disabled}
          loading={loading.free || false}
        />
        <FloatToggle
          type="negative"
          isActive={highlightNegativeFloat}
          onClick={onToggleNegativeFloat}
          disabled={disabled}
          loading={loading.negative || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Float / Slack
      </div>
    </section>
  );
};

export default FloatSlackSection; 