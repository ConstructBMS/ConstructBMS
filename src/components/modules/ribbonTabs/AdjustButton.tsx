import React from 'react';
import {
  ScaleIcon,
  CurrencyPoundIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type AdjustButtonType = 'units' | 'rate' | 'fixedCost';

interface AdjustButtonProps {
  type: AdjustButtonType;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const AdjustButton: React.FC<AdjustButtonProps> = ({
  type,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  const buttonConfig = {
    units: {
      icon: ScaleIcon,
      label: 'Units',
      tooltip: 'Change quantity or time unit of a resource',
      permission: 'programme.resource.edit'
    },
    rate: {
      icon: CurrencyPoundIcon,
      label: 'Rate',
      tooltip: 'Override hourly/daily rate',
      permission: 'programme.resource.edit'
    },
    fixedCost: {
      icon: WalletIcon,
      label: 'Fixed Cost',
      tooltip: 'Add a one-off flat fee for the resource',
      permission: 'programme.resource.edit'
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
        ${loading ? 'animate-pulse' : ''}
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
      `}
      title={config.tooltip}
    >
      <IconComponent
        className={`w-5 h-5 ${
          isDisabled
            ? 'text-gray-400'
            : type === 'units'
              ? 'text-blue-600'
              : type === 'rate'
                ? 'text-green-600'
                : 'text-purple-600'
        }`}
      />
      <span className={`text-xs font-medium mt-1 ${
        isDisabled
          ? 'text-gray-400'
          : type === 'units'
            ? 'text-blue-600'
            : type === 'rate'
              ? 'text-green-600'
              : 'text-purple-600'
      }`}>
        {config.label}
      </span>
    </button>
  );
};

export default AdjustButton; 