import React from 'react';
import { 
  CalendarIcon, 
  TrashIcon, 
  TableCellsIcon 
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ConstraintButtonType = 'set' | 'clear' | 'report';

interface ConstraintButtonProps {
  type: ConstraintButtonType;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ConstraintButton: React.FC<ConstraintButtonProps> = ({
  type,
  onClick,
  disabled = false,
  loading = false
}) => {
  const { canAccess } = usePermissions();

  // Define button configurations
  const buttonConfig = {
    set: {
      icon: CalendarIcon,
      label: 'Set Constraint',
      tooltip: 'Assign a constraint to selected task(s)',
      permission: 'programme.edit'
    },
    clear: {
      icon: TrashIcon,
      label: 'Clear Constraint',
      tooltip: 'Remove constraint(s) from selected task(s)',
      permission: 'programme.edit'
    },
    report: {
      icon: TableCellsIcon,
      label: 'Constraint Report',
      tooltip: 'View all current task constraints',
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

export default ConstraintButton; 