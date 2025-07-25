import React from 'react';
import {
  Squares2X2Icon,
  ArrowPathIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type LayoutButtonType = 'split' | 'reset' | 'fullscreen';

interface LayoutButtonProps {
  disabled?: boolean;
  isActive?: boolean;
  loading?: boolean;
  onClick: () => void;
  type: LayoutButtonType;
}

const LayoutButton: React.FC<LayoutButtonProps> = ({
  type,
  isActive = false,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  // Define button configurations
  const buttonConfig = {
    split: {
      icon: Squares2X2Icon,
      label: 'Split View',
      tooltip: 'Toggle split task/timeline layout',
      permission: 'programme.view'
    },
    reset: {
      icon: ArrowPathIcon,
      label: 'Reset Layout',
      tooltip: 'Reset view layout to defaults',
      permission: 'programme.view'
    },
    fullscreen: {
      icon: ArrowsPointingOutIcon,
      label: 'Fullscreen',
      tooltip: 'Toggle fullscreen editing mode',
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

export default LayoutButton; 