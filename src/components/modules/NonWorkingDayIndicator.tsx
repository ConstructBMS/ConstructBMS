import React, { useState, useEffect } from 'react';
import { programmeWorkingCalendarService, type WorkingTime } from '../../services/programmeWorkingCalendarService';

interface NonWorkingDayIndicatorProps {
  date: Date;
  projectId: string;
  className?: string;
  showTooltip?: boolean;
}

const NonWorkingDayIndicator: React.FC<NonWorkingDayIndicatorProps> = ({
  date,
  projectId,
  className = '',
  showTooltip = true
}) => {
  const [workingTime, setWorkingTime] = useState<WorkingTime | null>(null);
  const [showTooltipContent, setShowTooltipContent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load working time data on mount
  useEffect(() => {
    loadWorkingTime();
  }, [date, projectId]);

  const loadWorkingTime = async () => {
    try {
      setLoading(true);
      const timeData = await programmeWorkingCalendarService.isWorkingDay(date, projectId);
      setWorkingTime(timeData);
    } catch (error) {
      console.error('Error loading working time:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 h-full w-1 ${className}`} />
    );
  }

  if (!workingTime || workingTime.isWorkingDay) {
    return null;
  }

  const getTooltipContent = (): string => {
    if (workingTime.isHoliday) {
      return `Non-working day (Bank Holiday)`;
    } else if (workingTime.description) {
      return `Non-working day: ${workingTime.description}`;
    } else {
      return 'Non-working day';
    }
  };

  const getVisualStyle = () => {
    if (workingTime.isHoliday) {
      return 'bg-red-300 opacity-60';
    } else if (workingTime.isCustomShift) {
      return 'bg-yellow-300 opacity-50';
    } else {
      return 'bg-gray-300 opacity-40';
    }
  };

  return (
    <div className="relative inline-block">
      <div
        className={`absolute h-full w-1 ${getVisualStyle()} ${className}`}
        onMouseEnter={() => showTooltip && setShowTooltipContent(true)}
        onMouseLeave={() => showTooltip && setShowTooltipContent(false)}
        title={showTooltip ? getTooltipContent() : undefined}
      />
      
      {/* Tooltip */}
      {showTooltip && showTooltipContent && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-700 text-white text-xs rounded-lg shadow-lg z-50 p-3">
          {/* Tooltip Arrow */}
          <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-700" />
          
          <div className="space-y-1">
            <div className="font-medium">
              {date.toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-slate-300">
              {getTooltipContent()}
            </div>
            {workingTime.isCustomShift && workingTime.customShiftStart && workingTime.customShiftEnd && (
              <div className="text-slate-300">
                Custom hours: {workingTime.customShiftStart} - {workingTime.customShiftEnd}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NonWorkingDayIndicator; 