import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface MilestoneLabelToggleProps {
  disabled?: boolean;
  onToggleLabels: () => void;
  showLabels: boolean;
}

const MilestoneLabelToggle: React.FC<MilestoneLabelToggleProps> = ({
  showLabels,
  onToggleLabels,
  disabled = false
}) => {
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const handleClick = () => {
    if (!isDisabled) {
      onToggleLabels();
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
        ${showLabels
          ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600'
          : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
        }
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer'
        }
      `}
      title="Toggle milestone name visibility"
    >
      {showLabels ? (
        <EyeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      ) : (
        <EyeSlashIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      )}
      <span className={`text-xs font-medium mt-1 ${
        showLabels
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400'
      }`}>
        Labels
      </span>
    </button>
  );
};

export default MilestoneLabelToggle; 