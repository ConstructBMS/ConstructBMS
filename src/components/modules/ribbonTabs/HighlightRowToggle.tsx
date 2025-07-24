import React from 'react';
import { CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface HighlightRowToggleProps {
  disabled?: boolean;
  isEnabled: boolean;
  onToggle: () => void;
}

const HighlightRowToggle: React.FC<HighlightRowToggleProps> = ({
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
          ? 'bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-600'
          : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
        }
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer'
        }
      `}
      title="Highlight the selected task in the left pane"
    >
      <CursorArrowRaysIcon className={`w-5 h-5 ${
        isEnabled
          ? 'text-green-600 dark:text-green-400'
          : 'text-gray-600 dark:text-gray-400'
      }`} />
      <span className={`text-xs font-medium mt-1 ${
        isEnabled
          ? 'text-green-600 dark:text-green-400'
          : 'text-gray-600 dark:text-gray-400'
      }`}>
        Highlight
      </span>
    </button>
  );
};

export default HighlightRowToggle; 