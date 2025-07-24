import React from 'react';
import {
  BoltIcon,
  Cog6ToothIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type CriticalPathButtonType = 'toggleHighlight' | 'settings' | 'showPathFromSelection';

interface CriticalPathButtonProps {
  disabled?: boolean;
  isActive?: boolean;
  loading?: boolean;
  onClick: () => void;
  type: CriticalPathButtonType;
}

const CriticalPathButton: React.FC<CriticalPathButtonProps> = ({
  type,
  isActive = false,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const buttonConfig = {
    toggleHighlight: {
      icon: BoltIcon,
      label: 'Highlight',
      tooltip: 'Visually mark tasks on the critical path',
      permission: 'programme.view'
    },
    settings: {
      icon: Cog6ToothIcon,
      label: 'Settings',
      tooltip: 'Configure what counts as "critical"',
      permission: 'programme.view'
    },
    showPathFromSelection: {
      icon: MapIcon,
      label: 'Show Path',
      tooltip: 'Trace chain of tasks from selected one',
      permission: 'programme.view'
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
        ${isActive ? 'bg-red-50 border-red-300 text-red-700' : ''}
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:border-gray-400'
        }
        ${loading ? 'animate-pulse' : ''}
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
      `}
      title={config.tooltip}
    >
      <IconComponent
        className={`w-5 h-5 ${
          isActive
            ? 'text-red-600'
            : isDisabled
              ? 'text-gray-400'
              : 'text-gray-700'
        }`}
      />
      <span className={`text-xs font-medium mt-1 ${
        isActive
          ? 'text-red-600'
          : isDisabled
            ? 'text-gray-400'
            : 'text-gray-600'
      }`}>
        {config.label}
      </span>
    </button>
  );
};

export default CriticalPathButton; 