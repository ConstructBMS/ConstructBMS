import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface WeekendShadingToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const WeekendShadingToggle: React.FC<WeekendShadingToggleProps> = ({
  isEnabled,
  onToggle,
  disabled = false
}) => {
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.format.view') || canAccess('programme.format.edit');
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
          ? 'bg-orange-50 dark:bg-orange-900 border-orange-300 dark:border-orange-600'
          : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
        }
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer'
        }
      `}
      title="Toggle shading for Saturday/Sunday"
    >
      <CalendarDaysIcon className={`w-5 h-5 ${
        isEnabled
          ? 'text-orange-600 dark:text-orange-400'
          : 'text-gray-600 dark:text-gray-400'
      }`} />
      <span className={`text-xs font-medium mt-1 ${
        isEnabled
          ? 'text-orange-600 dark:text-orange-400'
          : 'text-gray-600 dark:text-gray-400'
      }`}>
        Weekend
      </span>
    </button>
  );
};

export default WeekendShadingToggle; 