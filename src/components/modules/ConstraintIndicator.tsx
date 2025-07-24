import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { constraintsService, TaskConstraint } from '../services/constraintsService';

interface ConstraintIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  taskId: string;
}

const ConstraintIndicator: React.FC<ConstraintIndicatorProps> = ({
  taskId,
  position = 'top-right',
  size = 'sm',
  showTooltip = true
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [constraint, setConstraint] = useState<TaskConstraint | null>(null);
  const [hasViolations, setHasViolations] = useState(false);
  const [showTooltipContent, setShowTooltipContent] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const canView = canAccess('programme.task.view');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load constraint data
  useEffect(() => {
    const loadConstraint = async () => {
      try {
        const taskConstraint = await constraintsService.getTaskConstraint(taskId);
        setConstraint(taskConstraint);
        
        if (taskConstraint) {
          const violations = await constraintsService.hasConstraintViolations(taskId);
          setHasViolations(violations);
        }
      } catch (error) {
        console.error('Error loading constraint:', error);
      }
    };
    
    loadConstraint();
  }, [taskId]);

  // Handle mouse enter for tooltip
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!canView || !showTooltip || !constraint) return;
    
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

  if (!canView || !constraint) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3 text-xs';
      case 'md': return 'w-4 h-4 text-sm';
      case 'lg': return 'w-5 h-5 text-base';
      default: return 'w-3 h-3 text-xs';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-0 left-0';
      case 'top-right': return 'top-0 right-0';
      case 'bottom-left': return 'bottom-0 left-0';
      case 'bottom-right': return 'bottom-0 right-0';
      default: return 'top-0 right-0';
    }
  };

  const getConstraintIcon = () => {
    return constraintsService.getConstraintIcon(constraint.type);
  };

  const getConstraintColor = () => {
    if (hasViolations) {
      return 'text-red-500';
    }
    return isDemoMode ? 'text-yellow-500' : 'text-blue-500';
  };

  const getBorderColor = () => {
    if (hasViolations) {
      return 'border-red-500';
    }
    return isDemoMode ? 'border-yellow-500' : 'border-blue-500';
  };

  return (
    <>
      <div
        className={`
          absolute ${getPositionClasses()} ${getSizeClasses()}
          flex items-center justify-center rounded-full
          bg-white dark:bg-gray-800 border-2 ${getBorderColor()}
          cursor-pointer transition-all duration-200
          ${hasViolations ? 'animate-pulse' : ''}
          ${showTooltipContent ? 'scale-110' : 'hover:scale-110'}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={
          canView 
            ? `${constraintsService.getConstraintTypeName(constraint.type)}: ${constraint.constraintDate.toLocaleDateString()}${hasViolations ? ' (VIOLATED)' : ''}${isDemoMode ? ' (DEMO)' : ''}`
            : ''
        }
      >
        {hasViolations ? (
          <ExclamationTriangleIcon className={`w-full h-full ${getConstraintColor()}`} />
        ) : (
          <span className={`${getConstraintColor()} font-bold`}>
            {getConstraintIcon()}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltipContent && canView && constraint && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 max-w-xs"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="space-y-2">
            {/* Demo watermark */}
            {isDemoMode && (
              <div className="text-yellow-400 font-semibold text-xs border-b border-yellow-400 pb-1">
                DEMO MODE
              </div>
            )}
            
            {/* Constraint type */}
            <div className="font-semibold">
              {constraintsService.getConstraintTypeName(constraint.type)}
            </div>
            
            {/* Constraint date */}
            <div className="text-gray-300">
              Date: {constraint.constraintDate.toLocaleDateString()}
            </div>
            
            {/* Description */}
            <div className="text-gray-300 text-xs">
              {constraintsService.getConstraintTypeDescription(constraint.type)}
            </div>
            
            {/* Violation warning */}
            {hasViolations && (
              <div className="text-red-400 font-semibold text-xs border-t border-red-400 pt-1">
                ⚠️ CONSTRAINT VIOLATED
              </div>
            )}
            
            {/* Demo restrictions info */}
            {isDemoMode && (
              <div className="text-yellow-400 text-xs">
                Demo: 1 constraint per task, max 3 tasks
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConstraintIndicator; 