import React from 'react';
import ConstraintButton from './ConstraintButton';

interface ConstraintsSectionProps {
  onSetConstraint: () => void;
  onClearConstraint: () => void;
  onConstraintReport: () => void;
  disabled?: boolean;
  loading?: {
    set?: boolean;
    clear?: boolean;
    report?: boolean;
  };
  hasSelectedTasks?: boolean;
}

const ConstraintsSection: React.FC<ConstraintsSectionProps> = ({
  onSetConstraint,
  onClearConstraint,
  onConstraintReport,
  disabled = false,
  loading = {},
  hasSelectedTasks = false
}) => {
  return (
    <section className="ribbon-section">
      <div className="ribbon-buttons flex space-x-2">
        <ConstraintButton
          type="set"
          onClick={onSetConstraint}
          disabled={disabled || !hasSelectedTasks}
          loading={loading.set || false}
        />
        <ConstraintButton
          type="clear"
          onClick={onClearConstraint}
          disabled={disabled || !hasSelectedTasks}
          loading={loading.clear || false}
        />
        <ConstraintButton
          type="report"
          onClick={onConstraintReport}
          disabled={disabled}
          loading={loading.report || false}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Constraints
      </div>
    </section>
  );
};

export default ConstraintsSection; 