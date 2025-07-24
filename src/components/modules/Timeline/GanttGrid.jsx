import { useMemo } from 'react';

const GanttGrid = ({
  startDate,
  endDate,
  zoomLevel = 'week',
  containerWidth = 800,
  scrollPosition = { x: 0, y: 0 },
  className = ''
}) => {
  // Calculate grid data based on zoom level
  const gridData = useMemo(() => {
    const gridLines = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate pixels per day based on zoom level
    const basePixelsPerDay = 20;
    const zoomMultipliers = {
      'hour': 24,
      'day': 1,
      'week': 1/7,
      'month': 1/30
    };
    const pixelsPerDay = basePixelsPerDay * zoomMultipliers[zoomLevel];
    
    // Determine grid interval based on zoom level
    let interval = 1; // days
    let labelFormat = 'MMM dd';
    
    switch (zoomLevel) {
      case 'hour':
        interval = 1; // 1 hour
        labelFormat = 'HH:mm';
        break;
      case 'day':
        interval = 1; // 1 day
        labelFormat = 'MMM dd';
        break;
      case 'week':
        interval = 7; // 1 week
        labelFormat = 'MMM dd';
        break;
      case 'month':
        interval = 30; // 1 month
        labelFormat = 'MMM yyyy';
        break;
      default:
        interval = 7;
        labelFormat = 'MMM dd';
    }
    
    // Generate grid lines
    let currentDate = new Date(start);
    let position = 0;
    
    while (currentDate <= end) {
      const isMajor = zoomLevel === 'day' ? currentDate.getDate() === 1 : 
                     zoomLevel === 'week' ? currentDate.getDay() === 0 :
                     zoomLevel === 'month' ? currentDate.getMonth() === 0 : true;
      
      gridLines.push({
        date: new Date(currentDate),
        position,
        label: formatDate(currentDate, labelFormat),
        isMajor
      });
      
      // Move to next interval
      if (zoomLevel === 'hour') {
        currentDate.setHours(currentDate.getHours() + interval);
      } else {
        currentDate.setDate(currentDate.getDate() + interval);
      }
      
      position += pixelsPerDay * interval;
    }
    
    return gridLines;
  }, [startDate, endDate, zoomLevel]);

  // Format date helper
  const formatDate = (date, format) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    switch (format) {
      case 'HH:mm':
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      case 'MMM dd':
        return `${months[date.getMonth()]} ${date.getDate()}`;
      case 'MMM yyyy':
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
      default:
        return date.toLocaleDateString();
    }
  };

  // Get grid line style
  const getGridLineStyle = (isMajor) => ({
    width: isMajor ? '2px' : '1px',
    backgroundColor: isMajor ? '#6b7280' : '#e5e7eb',
    borderLeft: isMajor ? '2px solid #6b7280' : '1px solid #e5e7eb'
  });

  return (
    <div 
      className={`absolute top-0 left-0 right-0 ${className}`}
      style={{ 
        width: containerWidth,
        height: '100%',
        pointerEvents: 'none'
      }}
    >
      {/* Grid Lines */}
      {gridData.map((gridLine, index) => (
        <div
          key={`grid-${index}`}
          className="absolute top-0 bottom-0"
          style={{
            left: gridLine.position,
            ...getGridLineStyle(gridLine.isMajor)
          }}
        />
      ))}

      {/* Grid Labels */}
      <div className="absolute top-2 left-0 right-0 h-8 flex items-center">
        {gridData.map((gridLine, index) => (
          <div
            key={`label-${index}`}
            className="absolute text-xs text-gray-600 font-medium"
            style={{
              left: gridLine.position + 4,
              transform: 'translateY(-50%)'
            }}
          >
            {gridLine.label}
          </div>
        ))}
      </div>

      {/* Today Marker */}
      <TodayMarker 
        startDate={startDate}
        zoomLevel={zoomLevel}
        containerWidth={containerWidth}
      />

      {/* Scroll Position Indicator */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-blue-500 opacity-50"
        style={{
          left: scrollPosition.x,
          transform: 'translateX(-50%)'
        }}
      />
    </div>
  );
};

// Today Marker Component
const TodayMarker = ({ startDate, zoomLevel, containerWidth }) => {
  const today = new Date();
  const projectStart = new Date(startDate);
  
  // Calculate pixels per day
  const basePixelsPerDay = 20;
  const zoomMultipliers = {
    'hour': 24,
    'day': 1,
    'week': 1/7,
    'month': 1/30
  };
  const pixelsPerDay = basePixelsPerDay * zoomMultipliers[zoomLevel];
  
  // Calculate today's position
  const daysFromStart = (today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
  const todayPosition = daysFromStart * pixelsPerDay;
  
  // Only show if today is within the project timeline
  if (todayPosition < 0 || todayPosition > containerWidth) {
    return null;
  }

  return (
    <div 
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
      style={{
        left: todayPosition,
        transform: 'translateX(-50%)'
      }}
    >
      {/* Today label */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Today
        </div>
      </div>
    </div>
  );
};

export default GanttGrid; 