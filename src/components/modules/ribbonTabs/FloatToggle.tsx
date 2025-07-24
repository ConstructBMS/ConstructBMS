import React from 'react';
import {
  Bars3BottomLeftIcon,
  Bars3Icon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type FloatToggleType = 'total' | 'free' | 'negative';

interface FloatToggleProps {
  disabled?: boolean;
  isActive: boolean;
  loading?: boolean;
  onClick: () => void;
  type: FloatToggleType;
}

const FloatToggle: React.FC<FloatToggleProps> = ({
  type,
  isActive,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  // Define toggle configurations
  const toggleConfig = {
    total: {
      icon: Bars3BottomLeftIcon,
      label: 'Total Float',
      tooltip: 'Display slack between earliest and latest start',
      permission: 'programme.view'
    },
    free: {
      icon: Bars3Icon,
      label: 'Free Float',
      tooltip: 'Display time before task delays successor',
      permission: 'programme.view'
    },
    negative: {
      icon: ExclamationCircleIcon,
      label: 'Negative Float',
      tooltip: 'Highlight tasks with negative float',
      permission: 'programme.view'
    }
  };

  const config = toggleConfig[type];
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
        ${isActive ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:border-gray-400'
        }
        ${loading ? 'animate-pulse' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      `}
      title={config.tooltip}
    >
      <IconComponent 
        className={`w-5 h-5 ${
          isActive 
            ? 'text-blue-600' 
            : isDisabled 
              ? 'text-gray-400' 
              : 'text-gray-700'
        }`} 
      />
      <span className={`text-xs font-medium mt-1 ${
        isActive 
          ? 'text-blue-600' 
          : isDisabled 
            ? 'text-gray-400' 
            : 'text-gray-600'
      }`}>
        {config.label}
      </span>
    </button>
  );
};

export default FloatToggle; 