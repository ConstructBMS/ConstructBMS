import React from 'react';
import { progressTrackingService } from '../../services/progressTrackingService';

interface TimelineProgressBarProps {
  actualFinishDate?: string | null;
  actualStartDate?: string | null;
  className?: string;
  height?: string;
  isDemo?: boolean;
  progress: number;
  showActualMarkers?: boolean;
  taskId: string;
}

const TimelineProgressBar: React.FC<TimelineProgressBarProps> = ({
  taskId,
  progress,
  isDemo = false,
  showActualMarkers = true,
  actualStartDate,
  actualFinishDate,
  className = '',
  height = 'h-full'
}) => {
  const { width, color, tooltip, watermarkClass } = progressTrackingService.getProgressBarStyle(progress, isDemo);
  
  const startMarker = progressTrackingService.getActualDateMarkerStyle(actualStartDate, 'start');
  const finishMarker = progressTrackingService.getActualDateMarkerStyle(actualFinishDate, 'finish');

  return (
    <div className={`relative ${className}`}>
      {/* Main progress bar */}
      <div className={`relative bg-gray-200 rounded ${height} overflow-hidden`}>
        <div
          className={`${color} ${watermarkClass || ''} transition-all duration-300 ${height}`}
          style={{ width }}
          title={tooltip}
        />
      </div>

      {/* Actual date markers */}
      {showActualMarkers && (
        <>
          {/* Start marker */}
          <div 
            className={`absolute top-0 left-0 transform -translate-x-1/2 ${startMarker.color} text-xs cursor-help`}
            title={startMarker.tooltip}
          >
            {startMarker.icon}
          </div>

          {/* Finish marker */}
          <div 
            className={`absolute top-0 right-0 transform translate-x-1/2 ${finishMarker.color} text-xs cursor-help`}
            title={finishMarker.tooltip}
          >
            {finishMarker.icon}
          </div>
        </>
      )}

      {/* Demo mode indicator */}
      {isDemo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-blue-600 font-medium opacity-75">
            DEMO
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineProgressBar; 