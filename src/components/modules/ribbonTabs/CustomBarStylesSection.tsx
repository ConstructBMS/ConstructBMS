import React from 'react';
import ManageBarStylesButton from './ManageBarStylesButton';
import AssignStyleRulesButton from './AssignStyleRulesButton';
import ResetBarStylesButton from './ResetBarStylesButton';

interface CustomBarStylesSectionProps {
  disabled?: boolean;
  loading?: {
    assign?: boolean;
    manage?: boolean;
    reset?: boolean;
  };
  onOpenAssignStyleRules: () => void;
  onOpenManageBarStyles: () => void;
  onResetBarStyles: () => void;
}

const CustomBarStylesSection: React.FC<CustomBarStylesSectionProps> = ({
  onOpenManageBarStyles,
  onOpenAssignStyleRules,
  onResetBarStyles,
  disabled = false,
  loading = {}
}) => {
  return (
    <section className="ribbon-section w-64">
      <div className="ribbon-buttons flex space-x-2">
        <ManageBarStylesButton
          onOpenModal={onOpenManageBarStyles}
          disabled={disabled}
          loading={loading.manage}
        />
        <AssignStyleRulesButton
          onOpenModal={onOpenAssignStyleRules}
          disabled={disabled}
          loading={loading.assign}
        />
        <ResetBarStylesButton
          onReset={onResetBarStyles}
          disabled={disabled}
          loading={loading.reset}
        />
      </div>
      <div className="ribbon-label text-xs text-center mt-1 text-gray-500">
        Custom Bar Styles
      </div>
    </section>
  );
};

export default CustomBarStylesSection; 