import React, { useMemo } from 'react';
import { zoomService } from '../../services/zoomService';

interface TimelineGridProps {
  startDate: Date;
  endDate: Date;
  containerWidth: number;
  height?: number;
  showLabels?: boolean;
  className?: string;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
  startDate,
  endDate,
  containerWidth,
  height = 40,
  showLabels = true,
  className = ''
}) => {
  const zoomState = zoomService.getZoomState();
  const effectiveWidthPerDay = zoomService.getEffectiveWidthPerDay();
  const gridInterval = zoomService.getGridInterval();
  const labelFormat = zoomService.getLabelFormat();

  // Calculate grid lines and labels
  const gridData = useMemo(() => {
    const gridLines: Array<{
      date: Date;
      position: number;
      label: string;
      isMajor: boolean;
    }> = [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate grid interval based on zoom level
    let interval = gridInterval;
    if (effectiveWidthPerDay < 2) {
      interval = Math.max(interval, 7); // At least weekly for very zoomed out
    } else if (effectiveWidthPerDay > 20) {
      interval = Math.max(interval, 1); // Daily for very zoomed in
    }

    // Generate grid lines
    for (let i = 0; i <= totalDays; i += interval) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      if (date > end) break;

      const position = i * effectiveWidthPerDay;
      const isMajor = i % (interval * 4) === 0; // Major lines every 4 intervals

      // Format label based on zoom level
      let label = '';
      if (showLabels) {
        switch (labelFormat) {
          case 'DD MMM':
            label = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
            break;
          case 'Wk ##':
            const weekNumber = Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7));
            label = `Wk ${weekNumber}`;
            break;
          case 'MMM YYYY':
            label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            break;
          case 'Q# YYYY':
            const quarter = Math.ceil((date.getMonth() + 1) / 3);
            label = `Q${quarter} ${date.getFullYear()}`;
            break;
          default:
            label = date.toLocaleDateString();
        }
      }

      gridLines.push({
        date,
        position,
        label,
        isMajor
      });
    }

    return gridLines;
  }, [startDate, endDate, effectiveWidthPerDay, gridInterval, labelFormat, showLabels]);

  // Calculate grid line styles
  const getGridLineStyle = (isMajor: boolean) => ({
    borderColor: isMajor ? 'rgb(156 163 175)' : 'rgb(229 231 235)',
    borderWidth: isMajor ? '1px' : '1px',
    borderStyle: 'solid' as const
  });

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: containerWidth,
        height,
        overflow: 'hidden'
      }}
    >
      {/* Grid Lines */}
      {gridData.map((gridLine, index) => (
        <div
          key={index}
          className="absolute top-0 bottom-0"
          style={{
            left: gridLine.position,
            ...getGridLineStyle(gridLine.isMajor)
          }}
        />
      ))}

      {/* Labels */}
      {showLabels && (
        <div className="absolute top-0 left-0 right-0 h-full flex items-center">
          {gridData.map((gridLine, index) => (
            <div
              key={`label-${index}`}
              className="absolute text-xs text-gray-600 dark:text-gray-400 font-medium"
              style={{
                left: gridLine.position + 4,
                transform: 'translateY(-50%)'
              }}
            >
              {gridLine.label}
            </div>
          ))}
        </div>
      )}

      {/* Demo Mode Watermark */}
      {zoomService.isInDemoMode() && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-xs text-orange-500/30 font-bold transform -rotate-45">
            DEMO VIEW
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineGrid; 