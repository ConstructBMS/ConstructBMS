import React from 'react';
import SecondaryToolsButton from './SecondaryToolsButton';
import type { SecondaryToolType } from './SecondaryToolsButton';

interface SecondaryToolsSectionProps {
  disabled?: boolean;
  loading?: {
    clearConstraints?: boolean;
    recalculateSlack?: boolean;
    validateLogic?: boolean;
  };
  onClearConstraints: () => void;
  onRecalculateSlack: () => void;
  onValidateLogic: () => void;
}

const SecondaryToolsSection: React.FC<SecondaryToolsSectionProps> = ({
  onRecalculateSlack,
  onClearConstraints,
  onValidateLogic,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <SecondaryToolsButton
          type="recalculateSlack"
          onClick={onRecalculateSlack}
          disabled={disabled}
          loading={loading.recalculateSlack || false}
        />
        <SecondaryToolsButton
          type="clearConstraints"
          onClick={onClearConstraints}
          disabled={disabled}
          loading={loading.clearConstraints || false}
        />
        <SecondaryToolsButton
          type="validateLogic"
          onClick={onValidateLogic}
          disabled={disabled}
          loading={loading.validateLogic || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Tools
      </div>
    </section>
  );
};

export default SecondaryToolsSection; 