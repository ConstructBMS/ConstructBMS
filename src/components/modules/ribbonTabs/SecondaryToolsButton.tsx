import React from 'react';
import { 
  ArrowPathIcon, 
  TrashIcon, 
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type SecondaryToolType = 'recalculateSlack' | 'clearConstraints' | 'validateLogic';

interface SecondaryToolsButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  type: SecondaryToolType;
}

const SecondaryToolsButton: React.FC<SecondaryToolsButtonProps> = ({
  type,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  // Define tool configurations
  const toolConfig = {
    recalculateSlack: {
      icon: ArrowPathIcon,
      label: 'Recalculate Slack',
      tooltip: 'Refresh slack values across the project',
      permission: 'programme.edit'
    },
    clearConstraints: {
      icon: TrashIcon,
      label: 'Clear Constraints',
      tooltip: 'Remove date constraints from tasks',
      permission: 'programme.edit'
    },
    validateLogic: {
      icon: MagnifyingGlassIcon,
      label: 'Validate Logic',
      tooltip: 'Analyse task logic for errors',
      permission: 'programme.view'
    }
  };

  const config = toolConfig[type];
  const IconComponent = config.icon;
  const hasPermission = canAccess(config.permission);
  const isDisabled = disabled || !hasPermission || loading;

  const handleClick = () => {
    if (!isDisabled) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        flex flex-col items-center justify-center w-12 h-12 
        border border-gray-300 bg-white hover:bg-gray-50 
        transition-colors duration-200 rounded
        ${isDisabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:border-gray-400'
        }
        ${loading ? 'animate-pulse' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      `}
      title={config.tooltip}
    >
      <IconComponent className={`w-5 h-5 ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`} />
      <span className={`text-xs font-medium mt-1 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
        {config.label}
      </span>
    </button>
  );
};

export default SecondaryToolsButton; 