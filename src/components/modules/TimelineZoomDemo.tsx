import React, { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  CursorArrowRaysIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import TimelineZoomControls from './TimelineZoomControls';
import { useScrollZoom } from '../../hooks/useScrollZoom';
import { timelineZoomService, type TimelineZoomSettings } from '../../services/timelineZoomService';
import { demoModeService } from '../../services/demoModeService';

// Sample project data
const sampleProjectStartDate = new Date('2024-01-01');
const sampleProjectEndDate = new Date('2024-12-31');

const TimelineZoomDemo: React.FC = () => {
  const [zoomSettings, setZoomSettings] = useState<TimelineZoomSettings | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const projectId = 'demo-project-1';

  // Set up scroll zoom
  const { 
    containerRef: scrollContainerRef, 
    isScrollZoomEnabled, 
    isDemoMode: scrollDemoMode,
    zoomLevel,
    scrollPosition
  } = useScrollZoom({
    enabled: true,
    debounceMs: 50,
    onZoomChange: setZoomSettings,
    onScrollChange: (position) => {
      console.log('Scroll position changed:', position);
    },
    projectId
  });

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load initial zoom settings
  useEffect(() => {
    const loadZoomSettings = async () => {
      try {
        setLoading(true);
        const settings = await timelineZoomService.getProjectZoomSettings(projectId);
        setZoomSettings(settings);
      } catch (error) {
        console.error('Error loading zoom settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadZoomSettings();
  }, [projectId]);

  // Handle zoom change
  const handleZoomChange = (settings: TimelineZoomSettings) => {
    setZoomSettings(settings);
    console.log('Zoom settings updated:', settings);
  };

  // Handle scroll change
  const handleScrollChange = (position: { x: number; y: number }) => {
    console.log('Scroll position updated:', position);
  };

  // Toggle demo mode
  const toggleDemoMode = () => {
    // This would typically be controlled by user role or environment
    console.log('Demo mode toggle - would change user role in real app');
    setIsDemoMode(!isDemoMode);
  };

  // Get demo mode configuration
  const demoConfig = {
    maxZoomLevel: 'week',
    scrollZoomDisabled: true,
    tooltipMessage: 'Upgrade to unlock more detail',
    watermark: 'DEMO VIEW'
  };

  // Render timeline grid based on zoom level
  const renderTimelineGrid = () => {
    if (!zoomSettings) return null;

    const { zoomLevel } = zoomSettings;
    const gridItems = [];
    
    // Generate grid items based on zoom level
    let itemCount = 0;
    let itemWidth = 0;
    let itemLabel = '';

    switch (zoomLevel) {
      case 'hour':
        itemCount = 24;
        itemWidth = 60;
        itemLabel = 'Hour';
        break;
      case 'day':
        itemCount = 7;
        itemWidth = 120;
        itemLabel = 'Day';
        break;
      case 'week':
        itemCount = 4;
        itemWidth = 200;
        itemLabel = 'Week';
        break;
      case 'month':
        itemCount = 12;
        itemWidth = 300;
        itemLabel = 'Month';
        break;
    }

    for (let i = 0; i < itemCount; i++) {
      gridItems.push(
        <div
          key={i}
          className="timeline-grid-item border-r border-gray-200 flex-shrink-0 flex items-center justify-center text-xs text-gray-600 bg-gray-50"
          style={{ width: `${itemWidth}px` }}
        >
          {itemLabel} {i + 1}
        </div>
      );
    }

    return (
      <div className="timeline-grid flex border-b border-gray-300 bg-white">
        {gridItems}
      </div>
    );
  };

  // Render sample tasks
  const renderSampleTasks = () => {
    if (!zoomSettings) return null;

    const tasks = [
      { id: 1, name: 'Project Planning', start: 0, duration: 2, color: 'bg-blue-500' },
      { id: 2, name: 'Design Phase', start: 2, duration: 3, color: 'bg-green-500' },
      { id: 3, name: 'Development', start: 5, duration: 4, color: 'bg-orange-500' },
      { id: 4, name: 'Testing', start: 9, duration: 2, color: 'bg-purple-500' },
      { id: 5, name: 'Deployment', start: 11, duration: 1, color: 'bg-red-500' }
    ];

    const { zoomLevel } = zoomSettings;
    let itemWidth = 0;

    switch (zoomLevel) {
      case 'hour': itemWidth = 60; break;
      case 'day': itemWidth = 120; break;
      case 'week': itemWidth = 200; break;
      case 'month': itemWidth = 300; break;
    }

    return (
      <div className="timeline-tasks space-y-2 p-4">
        {tasks.map(task => (
          <div key={task.id} className="task-row flex items-center space-x-4">
            <div className="task-name w-32 text-sm font-medium text-gray-700">
              {task.name}
            </div>
            <div className="task-bar-container flex-1 relative h-8 bg-gray-100 rounded">
              <div
                className={`task-bar h-6 rounded ${task.color} flex items-center justify-center text-white text-xs font-medium transition-all duration-300`}
                style={{
                  left: `${task.start * itemWidth}px`,
                  width: `${task.duration * itemWidth}px`
                }}
              >
                {task.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="timeline-zoom-demo bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Timeline Zoom & Scroll Controls Demo
          </h2>
          <p className="text-gray-600">
            Interactive demonstration of timeline zoom and navigation features
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDemoMode}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isDemoMode
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {isDemoMode ? 'Demo Mode' : 'Full Mode'}
          </button>
          
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {showInstructions ? 'Hide' : 'Show'} Instructions
          </button>
        </div>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Keyboard Shortcuts:</h4>
              <ul className="space-y-1">
                <li>• <kbd className="px-2 py-1 bg-white rounded border">Ctrl/Cmd + +</kbd> Zoom In</li>
                <li>• <kbd className="px-2 py-1 bg-white rounded border">Ctrl/Cmd + -</kbd> Zoom Out</li>
                <li>• <kbd className="px-2 py-1 bg-white rounded border">T</kbd> Scroll to Today</li>
                <li>• <kbd className="px-2 py-1 bg-white rounded border">F</kbd> Fit to View</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Mouse/Touch Controls:</h4>
              <ul className="space-y-1">
                <li>• <kbd className="px-2 py-1 bg-white rounded border">Ctrl/Cmd + Scroll</kbd> Zoom</li>
                <li>• <kbd className="px-2 py-1 bg-white rounded border">Drag</kbd> Pan timeline</li>
                <li>• <kbd className="px-2 py-1 bg-white rounded border">Pinch</kbd> Zoom (mobile)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Zoom Controls</h3>
        <TimelineZoomControls
          projectId={projectId}
          onZoomChange={handleZoomChange}
          onScrollChange={handleScrollChange}
          className="mb-4"
        />
      </div>

      {/* Demo Mode Warning */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Demo Mode Active</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Zoom range limited to Day and Week views. Upgrade to unlock full functionality.
          </p>
        </div>
      )}

      {/* Timeline Container */}
      <div 
        ref={containerRef}
        className="timeline-container border border-gray-300 rounded-lg overflow-hidden"
      >
        {/* Timeline Header */}
        <div className="timeline-header bg-gray-50 border-b border-gray-300 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Project Timeline</h4>
              <p className="text-sm text-gray-600">
                Current Zoom: {zoomSettings?.zoomLevel || 'Loading...'} | 
                Scroll Position: X: {scrollPosition.x}, Y: {scrollPosition.y}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ComputerDesktopIcon className="w-4 h-4" />
              <span>Container Width: {containerWidth}px</span>
            </div>
          </div>
        </div>

        {/* Timeline Grid */}
        <div 
          ref={scrollContainerRef}
          className="timeline-content overflow-auto"
          style={{ height: '400px' }}
        >
          {renderTimelineGrid()}
          {renderSampleTasks()}
        </div>

        {/* Scroll Indicators */}
        <div className="timeline-footer bg-gray-50 border-t border-gray-300 p-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <CursorArrowRaysIcon className="w-4 h-4" />
                <span>Drag to pan</span>
              </div>
              <div className="flex items-center space-x-1">
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span>Ctrl/Cmd + Scroll to zoom</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Press T for Today</span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>Scroll to Date</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Zoom Status</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Level: {zoomLevel}</div>
            <div>Scroll Enabled: {isScrollZoomEnabled ? 'Yes' : 'No'}</div>
            <div>Demo Mode: {scrollDemoMode ? 'Yes' : 'No'}</div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Current Settings</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Zoom Level: {zoomSettings?.zoomLevel || 'Loading...'}</div>
            <div>Scroll X: {zoomSettings?.scrollPosition.x || 0}</div>
            <div>Scroll Y: {zoomSettings?.scrollPosition.y || 0}</div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Demo Configuration</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Max Zoom: {demoConfig.maxZoomLevel}</div>
            <div>Scroll Disabled: {demoConfig.scrollZoomDisabled ? 'Yes' : 'No'}</div>
            <div>Watermark: {demoConfig.watermark}</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-800">Loading zoom settings...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineZoomDemo; 