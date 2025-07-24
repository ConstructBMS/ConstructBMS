import React from 'react';
import {
  ExclamationCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ConflictButtonType = 'toggle' | 'resolve';

interface ConflictButtonProps {
  type: ConflictButtonType;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ConflictButton: React.FC<ConflictButtonProps> = ({
  type,
  isActive = false,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const buttonConfig = {
    toggle: {
      icon: ExclamationCircleIcon,
      label: 'Toggle Conflicts',
      tooltip: 'Show all overallocated resources',
      permission: 'programme.resource.view',
      color: 'text-red-600',
      activeColor: 'text-red-700 bg-red-50 dark:bg-red-900/20'
    },
    resolve: {
      icon: WrenchScrewdriverIcon,
      label: 'Resolve',
      tooltip: 'Open conflict resolution suggestions',
      permission: 'programme.resource.edit',
      color: 'text-orange-600',
      activeColor: 'text-orange-700 bg-orange-50 dark:bg-orange-900/20'
    }
  };

  const config = buttonConfig[type];
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
        ${isActive ? config.activeColor : ''}
        ${loading ? 'animate-pulse' : ''}
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
      `}
      title={config.tooltip}
    >
      <IconComponent
        className={`w-5 h-5 ${
          isDisabled
            ? 'text-gray-400'
            : isActive
              ? config.color.replace('text-', 'text-').replace('-600', '-700')
              : config.color
        }`}
      />
      <span className={`text-xs font-medium mt-1 ${
        isDisabled
          ? 'text-gray-400'
          : isActive
            ? config.color.replace('text-', 'text-').replace('-600', '-700')
            : config.color
      }`}>
        {config.label}
      </span>
    </button>
  );
};

export default ConflictButton; 