import React from 'react';
import {
  PaperClipIcon,
  DocumentTextIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type GridOptionToggleType = 'pin' | 'wrapText' | 'stripeRows';

interface GridOptionToggleProps {
  disabled?: boolean;
  isActive: boolean;
  loading?: boolean;
  onClick: () => void;
  type: GridOptionToggleType;
}

const GridOptionToggle: React.FC<GridOptionToggleProps> = ({
  type,
  isActive,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const buttonConfig = {
    pin: {
      icon: PaperClipIcon,
      label: 'Pin Column',
      tooltip: 'Freeze the first grid column',
      permission: 'programme.view'
    },
    wrapText: {
      icon: DocumentTextIcon,
      label: 'Wrap Text',
      tooltip: 'Enable line wrapping in grid cells',
      permission: 'programme.view'
    },
    stripeRows: {
      icon: ListBulletIcon,
      label: 'Stripe Rows',
      tooltip: 'Alternate row background colours',
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
        border border-gray-300 transition-colors duration-200 rounded
        ${isActive 
          ? 'bg-blue-50 border-blue-300 text-blue-700' 
          : 'bg-white hover:bg-gray-50'
        }
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

export default GridOptionToggle; 