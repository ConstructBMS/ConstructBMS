import React, { useState } from 'react';
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  FlagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { flagService } from '../../services/flagService';
import type { TaskFlag } from '../../services/flagService';
import { toastService } from './ToastNotification';

interface TaskFlagProps {
  className?: string;
  flag: TaskFlag;
  onRemove?: () => void;
  taskId: string;
}

const TaskFlagComponent: React.FC<TaskFlagProps> = ({
  taskId,
  flag,
  onRemove,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Get icon component based on flag icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ExclamationTriangleIcon':
        return ExclamationTriangleIcon;
      case 'ExclamationCircleIcon':
        return ExclamationCircleIcon;
      case 'XCircleIcon':
        return XCircleIcon;
      case 'InformationCircleIcon':
        return InformationCircleIcon;
      case 'FlagIcon':
        return FlagIcon;
      default:
        return FlagIcon;
    }
  };

  const IconComponent = getIconComponent(flag.icon);

  // Handle flag removal
  const handleRemove = async () => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    try {
      const success = await flagService.removeFlag(taskId);
      if (success) {
        toastService.success('Success', 'Flag removed successfully');
        if (onRemove) {
          onRemove();
        }
      } else {
        toastService.error('Error', 'Failed to remove flag');
      }
    } catch (error) {
      console.error('Error removing flag:', error);
      toastService.error('Error', 'Failed to remove flag');
    } finally {
      setIsRemoving(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get demo mode configuration
  const demoConfig = flagService.getDemoModeConfig();
  const isDemoMode = flagService.isInDemoMode();

  return (
    <div className={`relative ${className}`}>
      {/* Flag Icon */}
      <div
        className={`relative w-4 h-4 cursor-pointer transition-all duration-200 hover:scale-110 ${
          isRemoving ? 'opacity-50' : ''
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleRemove}
        title={isDemoMode ? demoConfig.tooltipMessage : 'Click to remove flag'}
      >
        <IconComponent 
          className={`w-full h-full text-${flag.color}`}
        />
        
        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border border-white"></div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 p-3">
          {/* Tooltip Arrow */}
          <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          
          {/* Flag Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <IconComponent className={`w-4 h-4 text-${flag.color} mr-2`} />
              <span className="font-medium capitalize">{flag.type}</span>
              {isDemoMode && (
                <span className="ml-2 px-1 py-0.5 bg-orange-500 text-white text-xs rounded">
                  DEMO
                </span>
              )}
            </div>
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-white transition-colors"
              title="Remove flag"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>

          {/* Note */}
          {flag.note && (
            <div className="mb-2">
              <div className="text-gray-300 mb-1">Note:</div>
              <div className="text-white bg-gray-800 rounded p-2">
                {flag.note}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Updated:</span>
              <span>{formatTimestamp(flag.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>By:</span>
              <span>{flag.updatedBy}</span>
            </div>
            {isDemoMode && (
              <div className="text-orange-400 text-center text-xs">
                {demoConfig.tooltipMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFlagComponent; 