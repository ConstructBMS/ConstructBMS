import { useState, useEffect, useRef, useCallback } from 'react';
import { useScrollZoom } from '../../../hooks/useScrollZoom';

const TimelinePane = ({ 
  projectId = 'demo-project',
  tasks = [],
  startDate = new Date('2024-01-01'),
  endDate = new Date('2024-12-31'),
  onTaskSelect,
  selectedTasks = [],
  className = ''
}) => {
  // State for scroll and zoom
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState('week');
  const [containerDimensions, setContainerDimensions] = useState({
    width: 800,
    height: 600
  });

  // Refs
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const taskListRef = useRef(null);
  const barsRef = useRef(null);

  // Use the scroll zoom hook
  const {
    containerRef: scrollContainerRef,
    isScrollZoomEnabled
  } = useScrollZoom({
    enabled: true,
    debounceMs: 50,
    onZoomChange: (settings) => {
      setZoomLevel(settings.zoomLevel);
      setScrollPosition(settings.scrollPosition);
    },
    onScrollChange: (position) => {
      setScrollPosition(position);
      syncScrollAcrossComponents(position);
    },
    projectId
  });

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Sync scroll across all components
  const syncScrollAcrossComponents = useCallback((position) => {
    // Sync horizontal scroll for task list and bars
    if (taskListRef.current) {
      taskListRef.current.scrollLeft = position.x;
    }
    if (barsRef.current) {
      barsRef.current.scrollLeft = position.x;
    }
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = position.x;
    }
  }, []);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    const levels = ['month', 'week', 'day', 'hour'];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex < levels.length - 1) {
      setZoomLevel(levels[currentIndex + 1]);
    }
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    const levels = ['month', 'week', 'day', 'hour'];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(levels[currentIndex - 1]);
    }
  }, [zoomLevel]);

  const handleFitToView = useCallback(() => {
    // Calculate optimal zoom level based on project duration and container width
    const projectDuration = endDate.getTime() - startDate.getTime();
    const daysDuration = projectDuration / (1000 * 60 * 60 * 24);
    const optimalZoom = daysDuration > 365 ? 'month' : daysDuration > 90 ? 'week' : 'day';
    setZoomLevel(optimalZoom);
  }, [startDate, endDate]);

  const handleScrollToToday = useCallback(() => {
    const today = new Date();
    const projectStart = new Date(startDate);
    const daysFromStart = (today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
    
    // Calculate scroll position to center today
    const pixelsPerDay = getPixelsPerDay();
    const newScrollX = Math.max(0, daysFromStart * pixelsPerDay - containerDimensions.width / 2);
    
    setScrollPosition(prev => {
      const newPosition = { ...prev, x: newScrollX };
      syncScrollAcrossComponents(newPosition);
      return newPosition;
    });
  }, [startDate, containerDimensions.width]);

  // Calculate pixels per day based on zoom level
  const getPixelsPerDay = useCallback(() => {
    const basePixelsPerDay = 20;
    const zoomMultipliers = {
      'hour': 24,
      'day': 1,
      'week': 1/7,
      'month': 1/30
    };
    return basePixelsPerDay * zoomMultipliers[zoomLevel];
  }, [zoomLevel]);

  // Handle mouse wheel for horizontal scrolling
  const handleWheel = useCallback((e) => {
    if (e.shiftKey || e.deltaX !== 0) {
      e.preventDefault();
      const delta = e.deltaX || e.deltaY;
      const newScrollX = Math.max(0, scrollPosition.x - delta);
      setScrollPosition(prev => {
        const newPosition = { ...prev, x: newScrollX };
        syncScrollAcrossComponents(newPosition);
        return newPosition;
      });
    }
  }, [scrollPosition, syncScrollAcrossComponents, getPixelsPerDay]);

  // Handle drag scrolling
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Only left mouse button
    
    let isDragging = false;
    let startX = e.clientX;
    let startY = e.clientY;
    let startScrollX = scrollPosition.x;
    let startScrollY = scrollPosition.y;

    const handleMouseMove = (moveEvent) => {
      if (!isDragging) {
        isDragging = true;
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grabbing';
        }
      }

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newScrollX = Math.max(0, startScrollX - deltaX);
      const newScrollY = Math.max(0, startScrollY - deltaY);
      
      setScrollPosition({ x: newScrollX, y: newScrollY });
      syncScrollAcrossComponents({ x: newScrollX, y: newScrollY });
    };

    const handleMouseUp = () => {
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [scrollPosition, syncScrollAcrossComponents]);

  // Calculate timeline dimensions
  const timelineWidth = Math.max(
    containerDimensions.width,
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) * getPixelsPerDay()
  );

  return (
    <div 
      ref={containerRef}
      className={`timeline-pane flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}
      style={{ height: containerDimensions.height }}
    >
      {/* Timeline Controls */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50">
        <TimelineControls
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToView={handleFitToView}
          onScrollToToday={handleScrollToToday}
          isScrollZoomEnabled={isScrollZoomEnabled}
        />
      </div>

      {/* Timeline Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Task List Column */}
        <div 
          ref={taskListRef}
          className="flex-shrink-0 w-64 border-r border-gray-200 overflow-y-auto"
          style={{ height: containerDimensions.height - 60 }}
        >
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Tasks</h3>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedTasks.includes(task.id)
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onTaskSelect?.(task.id, !selectedTasks.includes(task.id))}
                >
                  <div className="font-medium text-sm">{task.name}</div>
                  <div className="text-xs text-gray-500">
                    {task.startDate?.toLocaleDateString()} - {task.endDate?.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Grid and Bars */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-auto"
          style={{ height: containerDimensions.height - 60 }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
        >
          <div 
            ref={timelineRef}
            className="relative"
            style={{ 
              width: timelineWidth,
              minHeight: containerDimensions.height - 60
            }}
          >
            {/* Timeline Grid */}
            <GanttGrid
              startDate={startDate}
              endDate={endDate}
              zoomLevel={zoomLevel}
              containerWidth={timelineWidth}
              scrollPosition={scrollPosition}
            />

            {/* Gantt Bars */}
            <GanttBars
              ref={barsRef}
              tasks={tasks}
              startDate={startDate}
              endDate={endDate}
              zoomLevel={zoomLevel}
              containerWidth={timelineWidth}
              scrollPosition={scrollPosition}
              onTaskSelect={onTaskSelect}
              selectedTasks={selectedTasks}
            />
          </div>
        </div>
      </div>

      {/* Scroll Position Indicator */}
      <div className="flex-shrink-0 p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Zoom: {zoomLevel}</span>
          <span>Scroll: X: {Math.round(scrollPosition.x)}, Y: {Math.round(scrollPosition.y)}</span>
          <span>Width: {Math.round(timelineWidth)}px</span>
        </div>
      </div>
    </div>
  );
};

export default TimelinePane; 