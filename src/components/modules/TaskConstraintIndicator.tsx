import React, { useState, useEffect } from 'react';
import { 
  LockClosedIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { taskConstraintService } from '../services/taskConstraintService';
import type { TaskConstraint, ConstraintType } from './TaskConstraintsTab';

interface TaskConstraintIndicatorProps {
  taskId: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
  onViolationClick?: (violations: any[]) => void;
}

const TaskConstraintIndicator: React.FC<TaskConstraintIndicatorProps> = ({
  taskId,
  position = 'top-right',
  size = 'sm',
  showTooltip = true,
  className = '',
  onViolationClick
}) => {
  const [constraint, setConstraint] = useState<TaskConstraint | null>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [showTooltipContent, setShowTooltipContent] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Load constraint data
  useEffect(() => {
    const loadConstraint = async () => {
      try {
        const taskConstraint = await taskConstraintService.getTaskConstraint(taskId);
        setConstraint(taskConstraint);
        
        if (taskConstraint) {
          const constraintViolations = await taskConstraintService.checkConstraintViolations(taskId);
          setViolations(constraintViolations);
        }
      } catch (error) {
        console.error('Error loading constraint indicator:', error);
      }
    };
    
    loadConstraint();
  }, [taskId]);

  // Handle mouse enter for tooltip
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!showTooltip || !constraint) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setShowTooltipContent(true);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setShowTooltipContent(false);
  };

  // Handle click on violation indicator
  const handleViolationClick = () => {
    if (violations.length > 0 && onViolationClick) {
      onViolationClick(violations);
    }
  };

  if (!constraint) return null;

  const getConstraintIcon = (type: ConstraintType) => {
    const hasViolations = violations.length > 0;
    
    switch (type) {
      case 'MSO':
      case 'MFO':
        return hasViolations ? (
          <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
        ) : (
          <LockClosedIcon className="w-4 h-4 text-red-500" />
        );
      case 'SNET':
      case 'SNLT':
      case 'FNET':
      case 'FNLT':
        return hasViolations ? (
          <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
        ) : (
          <CalendarIcon className="w-4 h-4 text-orange-500" />
        );
      default:
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-1 left-1';
      case 'top-right':
        return 'top-1 right-1';
      case 'bottom-left':
        return 'bottom-1 left-1';
      case 'bottom-right':
        return 'bottom-1 right-1';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-1 right-1';
    }
  };

  const IconComponent = getConstraintIcon(constraint.constraintType);
  const hasViolations = violations.length > 0;

  return (
    <>
      <div
        className={`absolute ${getPositionClasses()} ${getSizeClasses()} ${className} ${
          hasViolations ? 'cursor-pointer' : 'cursor-help'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={hasViolations ? handleViolationClick : undefined}
        title={hasViolations ? 'Constraint violation detected' : 'Task constraint'}
      >
        {IconComponent}
      </div>

      {/* Tooltip */}
      {showTooltip && showTooltipContent && constraint && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-md px-2 py-1 shadow-lg max-w-xs"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="font-medium mb-1">
            {taskConstraintService.getConstraintTypeLabel(constraint.constraintType)}
          </div>
          <div className="text-gray-300">
            {new Date(constraint.constraintDate).toLocaleDateString()}
          </div>
          {constraint.constraintReason && (
            <div className="text-gray-400 mt-1">
              Reason: {constraint.constraintReason}
            </div>
          )}
          {hasViolations && (
            <div className="text-red-400 mt-1 font-medium">
              ⚠️ Constraint violation detected
            </div>
          )}
          {constraint.demo && (
            <div className="text-yellow-400 mt-1 text-xs">
              Demo constraint
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TaskConstraintIndicator; 