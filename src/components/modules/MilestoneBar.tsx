import React, { useState, useRef, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { milestoneService } from '../services/milestoneService';
import { Milestone } from '../services/milestoneService';

interface MilestoneBarProps {
  milestone: Milestone;
  projectId: string;
  rowHeight: number;
  dayWidth: number;
  startDate: Date;
  onMilestoneClick: (milestoneId: string) => void;
  onMilestoneUpdate: (milestoneId: string, updates: any) => void;
  isSelected?: boolean;
  isCritical?: boolean;
  isInSelectedPath?: boolean;
}

const MilestoneBar: React.FC<MilestoneBarProps> = ({
  milestone,
  projectId,
  rowHeight,
  dayWidth,
  startDate,
  onMilestoneClick,
  onMilestoneUpdate,
  isSelected = false,
  isCritical = false,
  isInSelectedPath = false
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [milestoneCount, setMilestoneCount] = useState(0);

  const barRef = useRef<HTMLDivElement>(null);

  const canEdit = canAccess('programme.task.edit');
  const canView = canAccess('programme.task.view');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
      
      if (isDemo) {
        const count = await milestoneService.getMilestoneCount();
        setMilestoneCount(count);
      }
    };
    checkDemoMode();
  }, []);

  // Calculate milestone position
  const calculatePosition = () => {
    const daysFromStart = Math.floor((milestone.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const left = daysFromStart * dayWidth;
    const top = (rowHeight - 16) / 2; // Center the diamond vertically
    
    return { left, top };
  };

  const { left, top } = calculatePosition();

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canEdit && !(isDemoMode && milestoneCount >= 2)) {
      onMilestoneClick(milestone.id);
    }
  };

  // Handle mouse enter for tooltip
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!canView) return;
    
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

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if (!canEdit || (isDemoMode && milestoneCount >= 2)) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartDate(new Date(milestone.startDate));
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  // Handle drag move
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || !dragStartDate) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaDays = Math.round(deltaX / dayWidth);
    const newDate = new Date(dragStartDate.getTime() + deltaDays * 24 * 60 * 60 * 1000);
    
    // Update milestone position visually
    if (barRef.current) {
      const newLeft = Math.floor((newDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth;
      barRef.current.style.left = `${newLeft}px`;
    }
  };

  // Handle drag end
  const handleDragEnd = async (e: MouseEvent) => {
    if (!isDragging || !dragStartDate) return;
    
    setIsDragging(false);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    
    // Calculate new date
    const deltaX = e.clientX - dragStartX;
    const deltaDays = Math.round(deltaX / dayWidth);
    const newDate = new Date(dragStartDate.getTime() + deltaDays * 24 * 60 * 60 * 1000);
    
    // Demo mode restrictions
    if (isDemoMode) {
      const maxDays = 5; // 5-day drag limit in demo mode
      if (Math.abs(deltaDays) > maxDays) {
        // Reset position
        if (barRef.current) {
          const originalLeft = Math.floor((dragStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth;
          barRef.current.style.left = `${originalLeft}px`;
        }
        return;
      }
    }
    
    // Update milestone
    const result = await milestoneService.updateMilestone(milestone.id, {
      startDate: newDate
    });
    
    if (result.success) {
      onMilestoneUpdate(milestone.id, {
        startDate: newDate,
        endDate: newDate // Keep endDate same as startDate for milestones
      });
    } else {
      // Reset position on error
      if (barRef.current) {
        const originalLeft = Math.floor((dragStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth;
        barRef.current.style.left = `${originalLeft}px`;
      }
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (): string => {
    switch (milestone.statusId) {
      case 'completed': return '#10b981'; // Green
      case 'in-progress': return '#3b82f6'; // Blue
      case 'on-hold': return '#f59e0b'; // Yellow
      case 'cancelled': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  // Get milestone icon
  const getMilestoneIcon = (): string => {
    return milestoneService.getMilestoneIcon();
  };

  // Check if milestone is disabled
  const isDisabled = !canEdit || (isDemoMode && milestoneCount >= 2);

  return (
    <>
      <div
        ref={barRef}
        className={`
          absolute cursor-pointer transition-all duration-200
          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
          ${isCritical ? 'ring-2 ring-red-500 ring-offset-1' : ''}
          ${isInSelectedPath ? 'ring-2 ring-green-500 ring-offset-1' : ''}
          ${isDragging ? 'opacity-50 z-50' : ''}
          ${isDisabled ? 'cursor-not-allowed opacity-75' : ''}
        `}
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: '16px',
          height: '16px'
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleDragStart}
        title={canView ? `${milestone.name} (${formatDate(milestone.startDate)})` : ''}
      >
        {/* Milestone Diamond */}
        <div
          className={`
            w-full h-full transform rotate-45 transition-all duration-200
            ${isDisabled ? 'opacity-50' : 'hover:scale-110'}
          `}
          style={{
            backgroundColor: getStatusColor(),
            border: `2px solid ${getStatusColor()}dd`,
            boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Milestone Icon */}
          <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
            <span className="text-white text-xs font-bold">
              {getMilestoneIcon()}
            </span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && canView && (
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
            
            {/* Milestone name */}
            <div className="font-semibold">{milestone.name}</div>
            
            {/* Date */}
            <div className="text-gray-300">
              Date: {formatDate(milestone.startDate)}
            </div>
            
            {/* Status */}
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor() }}
              />
              <span>{milestone.statusId}</span>
            </div>
            
            {/* Tags */}
            {milestone.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {milestone.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded text-xs bg-blue-600 text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Type */}
            <div className="text-gray-300">
              Type: {milestoneService.getMilestoneDisplayName()}
            </div>
            
            {/* Description */}
            {milestone.description && (
              <div className="text-gray-300 text-xs">
                {milestone.description}
              </div>
            )}
            
            {isDemoMode && (
              <div className="text-yellow-400 text-xs">
                Drag: 5-day max | Max 2 milestones
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ghost diamond for drag feedback */}
      {isDragging && dragStartDate && (
        <div
          className="absolute w-4 h-4 transform rotate-45 border-2 border-dashed border-blue-500 bg-blue-500 bg-opacity-20"
          style={{
            left: `${Math.floor((dragStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth}px`,
            top: `${top}px`
          }}
        />
      )}
    </>
  );
};

export default MilestoneBar; 