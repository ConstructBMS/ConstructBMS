import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { programmeTaskFlagsService, type ProgrammeTaskFlag } from '../../services/programmeTaskFlagsService';

interface TaskFlagIndicatorProps {
  taskId: string;
  projectId: string;
  isDemoMode: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TaskFlagIndicator: React.FC<TaskFlagIndicatorProps> = ({
  taskId,
  projectId,
  isDemoMode,
  showTooltip = true,
  size = 'md',
  className = ''
}) => {
  const [flag, setFlag] = useState<ProgrammeTaskFlag | null>(null);
  const [showTooltipContent, setShowTooltipContent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load flag on mount
  useEffect(() => {
    loadFlag();
  }, [taskId]);

  const loadFlag = async () => {
    try {
      setLoading(true);
      const existingFlag = await programmeTaskFlagsService.getFlagForTask(taskId);
      setFlag(existingFlag);
    } catch (error) {
      console.error('Error loading flag:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-full ${getSizeClasses(size)} ${className}`} />
    );
  }

  if (!flag) {
    return null;
  }

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    const sizes = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4'
    };
    return sizes[size];
  };

  const getFlagColorClass = (color: 'red' | 'yellow' | 'green' | 'blue') => {
    const classes = {
      red: 'ring-red-500 bg-red-500',
      yellow: 'ring-yellow-500 bg-yellow-500',
      green: 'ring-green-500 bg-green-500',
      blue: 'ring-blue-500 bg-blue-500'
    };
    return classes[color];
  };

  const getFlagIcon = (color: 'red' | 'yellow' | 'green' | 'blue') => {
    const icons = {
      red: ExclamationTriangleIcon,
      yellow: ClockIcon,
      green: CheckCircleIcon,
      blue: InformationCircleIcon
    };
    return icons[color];
  };

  const IconComponent = getFlagIcon(flag.flagColor);

  return (
    <div className="relative inline-block">
      <div
        className={`${getSizeClasses(size)} ${getFlagColorClass(flag.flagColor)} rounded-full ring-2 ${className}`}
        onMouseEnter={() => showTooltip && setShowTooltipContent(true)}
        onMouseLeave={() => showTooltip && setShowTooltipContent(false)}
        title={showTooltip ? programmeTaskFlagsService.formatFlagTooltip(flag, isDemoMode) : undefined}
      />
      
      {/* Tooltip */}
      {showTooltip && showTooltipContent && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-700 text-white text-xs rounded-lg shadow-lg z-50 p-3">
          {/* Tooltip Arrow */}
          <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-700"></div>
          
          {/* Flag Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <IconComponent className={`w-4 h-4 text-${flag.flagColor}-400 mr-2`} />
              <span className="font-medium capitalize">{flag.flagColor}</span>
              {flag.demo && (
                <span className="ml-2 px-1 py-0.5 bg-orange-500 text-white text-xs rounded">
                  DEMO
                </span>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="mb-2">
            <div className="text-gray-300 mb-1">Note:</div>
            <div className="text-white bg-slate-800 rounded p-2">
              {isDemoMode && flag.note.length > 50 
                ? flag.note.substring(0, 50) + '...' 
                : flag.note}
            </div>
          </div>

          {/* Metadata */}
          <div className="text-gray-300 text-xs">
            <div>By {isDemoMode ? 'Demo User' : flag.createdBy}</div>
            <div>{flag.createdAt.toLocaleDateString()} at {flag.createdAt.toLocaleTimeString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFlagIndicator; 