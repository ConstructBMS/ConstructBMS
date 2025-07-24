import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ResetBarStylesButtonProps {
  onReset: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ResetBarStylesButton: React.FC<ResetBarStylesButtonProps> = ({
  onReset,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.format.edit');
  const isDisabled = disabled || loading || !canEdit;

  const handleClick = () => {
    if (!isDisabled) {
      // Show confirmation dialog
      if (window.confirm('Are you sure you want to reset all custom bar styles and rules to default? This action cannot be undone.')) {
        onReset();
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        flex flex-col items-center justify-center w-12 h-12
        border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-700 rounded
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
        }
      `}
      title="Remove all custom styles and return to base"
    >
      <ArrowPathIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

export default ResetBarStylesButton; 