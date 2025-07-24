import React, { useState } from 'react';
import { 
  LockClosedIcon, 
  UserIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { useProgrammeCollaboration } from '../../contexts/ProgrammeCollaborationContext';
import type { TaskLock } from '../../services/programmeCollaborationService';

interface TaskLockIndicatorProps {
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  taskId: string;
}

const TaskLockIndicator: React.FC<TaskLockIndicatorProps> = ({
  taskId,
  className = '',
  position = 'top-right'
}) => {
  const { isTaskLocked, getTaskLockInfo } = useProgrammeCollaboration();
  const [showTooltip, setShowTooltip] = useState(false);

  const isLocked = isTaskLocked(taskId);
  const lockInfo = getTaskLockInfo(taskId);

  if (!isLocked || !lockInfo) {
    return null;
  }

  const formatTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return 'Expired';
    if (diffMins < 60) return `${diffMins}m left`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m left`;
  };

  const getPositionClasses = (): string => {
    switch (position) {
      case 'top-left':
        return 'absolute top-0 left-0';
      case 'bottom-right':
        return 'absolute bottom-0 right-0';
      case 'bottom-left':
        return 'absolute bottom-0 left-0';
      case 'top-right':
      default:
        return 'absolute top-0 right-0';
    }
  };

  const isExpired = lockInfo.expiresAt < new Date();

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Lock icon */}
        <div className={`
          w-4 h-4 rounded-full flex items-center justify-center
          ${isExpired 
            ? 'bg-red-100 text-red-600' 
            : 'bg-orange-100 text-orange-600'
          }
          shadow-sm
        `}>
          <LockClosedIcon className="w-3 h-3" />
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute z-50 mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
            <div className="flex items-center space-x-1 mb-1">
              <UserIcon className="w-3 h-3" />
              <span className="font-medium">Being edited by {lockInfo.lockedByUser}</span>
              {lockInfo.demo && (
                <span className="text-yellow-300 text-xs">DEMO</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>{formatTimeRemaining(lockInfo.expiresAt)}</span>
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskLockIndicator; 