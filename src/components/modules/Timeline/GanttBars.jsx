import { forwardRef, useMemo, useCallback } from 'react';

const GanttBars = forwardRef(({
  tasks = [],
  startDate,
  zoomLevel = 'week',
  containerWidth = 800,
  scrollPosition = { x: 0, y: 0 },
  onTaskSelect,
  selectedTasks = [],
  className = ''
}, ref) => {
  // Calculate pixels per day based on zoom level
  const pixelsPerDay = useMemo(() => {
    const basePixelsPerDay = 20;
    const zoomMultipliers = {
      'hour': 24,
      'day': 1,
      'week': 1/7,
      'month': 1/30
    };
    return basePixelsPerDay * zoomMultipliers[zoomLevel];
  }, [zoomLevel]);

  // Convert date to pixel position
  const dateToPixel = useCallback((date) => {
    const projectStart = new Date(startDate);
    const daysFromStart = (date.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
    return daysFromStart * pixelsPerDay;
  }, [startDate, pixelsPerDay]);

  // Calculate task bar dimensions
  const taskBars = useMemo(() => {
    return tasks.map((task, index) => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      
      const left = dateToPixel(taskStart);
      const width = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24) * pixelsPerDay;
      const top = index * 40 + 50; // 40px per task row, 50px offset for header
      
      return {
        ...task,
        left,
        width: Math.max(width, 4), // Minimum width of 4px
        top,
        height: 30,
        isSelected: selectedTasks.includes(task.id)
      };
    });
  }, [tasks, selectedTasks, dateToPixel, pixelsPerDay]);

  // Handle task bar click
  const handleTaskClick = (taskId, event) => {
    event.stopPropagation();
    onTaskSelect?.(taskId, !selectedTasks.includes(taskId));
  };

  // Handle task bar drag (placeholder for future implementation)
  const handleTaskDrag = (taskId) => {
    // TODO: Implement drag functionality
    console.log('Drag task:', taskId);
  };

  return (
    <div 
      ref={ref}
      className={`absolute top-0 left-0 ${className}`}
      style={{ 
        width: containerWidth,
        height: '100%',
        pointerEvents: 'auto'
      }}
    >
      {/* Task Bars */}
      {taskBars.map((task) => (
        <div
          key={task.id}
          className={`
            absolute rounded cursor-pointer transition-all duration-200
            ${task.isSelected 
              ? 'ring-2 ring-blue-500 ring-offset-2' 
              : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
            }
          `}
          style={{
            left: task.left,
            top: task.top,
            width: task.width,
            height: task.height,
            backgroundColor: task.color || '#3b82f6',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}
          onClick={(e) => handleTaskClick(task.id, e)}
          onMouseDown={(e) => handleTaskDrag(task.id, e)}
          title={`${task.name} (${task.startDate?.toLocaleDateString()} - ${task.endDate?.toLocaleDateString()})`}
        >
          {/* Task Label */}
          {task.width > 60 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium px-2 overflow-hidden">
              {task.name}
            </div>
          )}
          
          {/* Progress Indicator */}
          {task.progress && task.progress > 0 && (
            <div 
              className="absolute top-0 left-0 bottom-0 bg-green-500 rounded-l"
              style={{ 
                width: `${task.progress}%`,
                opacity: 0.8
              }}
            />
          )}
          
          {/* Milestone Indicator */}
          {task.type === 'milestone' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full border-2 border-current" />
            </div>
          )}
        </div>
      ))}

      {/* Task Dependencies (placeholder) */}
      {tasks.map((task) => {
        if (!task.dependencies || task.dependencies.length === 0) return null;
        
        return task.dependencies.map((depId) => {
          const dependentTask = tasks.find(t => t.id === depId);
          if (!dependentTask) return null;
          
          const sourceTask = taskBars.find(t => t.id === task.id);
          const targetTask = taskBars.find(t => t.id === depId);
          
          if (!sourceTask || !targetTask) return null;
          
          // Calculate dependency line
          const startX = sourceTask.left;
          const startY = sourceTask.top + sourceTask.height / 2;
          const endX = targetTask.left + targetTask.width;
          const endY = targetTask.top + targetTask.height / 2;
          
          return (
            <svg
              key={`dep-${task.id}-${depId}`}
              className="absolute top-0 left-0 pointer-events-none"
              style={{ width: containerWidth, height: '100%' }}
            >
              <defs>
                <marker
                  id={`arrow-${task.id}-${depId}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0,0 0,6 9,3"
                    fill="#6b7280"
                  />
                </marker>
              </defs>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#6b7280"
                strokeWidth="2"
                markerEnd={`url(#arrow-${task.id}-${depId})`}
                strokeDasharray="5,5"
              />
            </svg>
          );
        });
      })}

      {/* Hover Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {taskBars.map((task) => (
          <div
            key={`hover-${task.id}`}
            className="absolute rounded opacity-0 hover:opacity-20 transition-opacity duration-200"
            style={{
              left: task.left,
              top: task.top,
              width: task.width,
              height: task.height,
              backgroundColor: '#000'
            }}
          />
        ))}
      </div>

      {/* Scroll Position Indicator */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-blue-500 opacity-30 pointer-events-none"
        style={{
          left: scrollPosition.x,
          transform: 'translateX(-50%)'
        }}
      />
    </div>
  );
});

GanttBars.displayName = 'GanttBars';

export default GanttBars; 