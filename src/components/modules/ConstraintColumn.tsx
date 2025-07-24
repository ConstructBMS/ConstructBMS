import React, { useState, useEffect } from 'react';
import { 
  LockClosedIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { taskConstraintService } from '../services/taskConstraintService';
import type { TaskConstraint, ConstraintType } from './TaskConstraintsTab';

interface ConstraintColumnProps {
  className?: string;
  onViolationClick?: (violations: any[]) => void;
  taskId: string;
}

const ConstraintColumn: React.FC<ConstraintColumnProps> = ({
  taskId,
  className = '',
  onViolationClick
}) => {
  const [constraint, setConstraint] = useState<TaskConstraint | null>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
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
        console.error('Error loading constraint for column:', error);
      }
    };
    
    loadConstraint();
  }, [taskId]);

  // Handle mouse enter for tooltip
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!constraint) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setShowTooltip(true);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Handle click on violation indicator
  const handleViolationClick = () => {
    if (violations.length > 0 && onViolationClick) {
      onViolationClick(violations);
    }
  };

  if (!constraint) {
    return (
      <div className={`text-center text-gray-400 ${className}`}>
        —
      </div>
    );
  }

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

  const getConstraintText = (type: ConstraintType) => {
    const labels = {
      MSO: 'MSO',
      MFO: 'MFO',
      SNET: 'SNET',
      SNLT: 'SNLT',
      FNET: 'FNET',
      FNLT: 'FNLT'
    };
    return labels[type] || type;
  };

  const IconComponent = getConstraintIcon(constraint.constraintType);
  const hasViolations = violations.length > 0;

  return (
    <>
      <div
        className={`flex items-center justify-center space-x-1 ${className} ${
          hasViolations ? 'cursor-pointer' : 'cursor-help'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={hasViolations ? handleViolationClick : undefined}
        title={hasViolations ? 'Constraint violation detected' : 'Task constraint'}
      >
        {IconComponent}
        <span className={`text-xs font-medium ${
          hasViolations ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {getConstraintText(constraint.constraintType)}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && constraint && (
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

export default ConstraintColumn; 