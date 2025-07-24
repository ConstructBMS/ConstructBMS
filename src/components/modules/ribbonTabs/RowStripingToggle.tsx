import React from 'react';
import { ViewColumnsIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface RowStripingToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const RowStripingToggle: React.FC<RowStripingToggleProps> = ({
  isEnabled,
  onToggle,
  disabled = false
}) => {
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const handleClick = () => {
    if (!isDisabled) {
      onToggle();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        flex flex-col items-center justify-center w-12 h-12
        border border-gray-300 dark:border-gray-600
        rounded transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${isEnabled
          ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600'
          : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
        }
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer'
        }
      `}
      title="Show alternating background colours for rows"
    >
      <ViewColumnsIcon className={`w-5 h-5 ${
        isEnabled
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400'
      }`} />
      <span className={`text-xs font-medium mt-1 ${
        isEnabled
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400'
      }`}>
        Striping
      </span>
    </button>
  );
};

export default RowStripingToggle; 