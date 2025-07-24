// Gantt Pop-out Window Component
// Opens the enterprise Gantt chart in a separate window with full controls

import React, { useState, useEffect } from 'react';
import EnterpriseGanttChart from './EnterpriseGanttChart';
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';

interface GanttPopoutWindowProps {
  onClose: () => void;
  onMarkChanged?: () => void;
  project: any;
}

const GanttPopoutWindow: React.FC<GanttPopoutWindowProps> = ({ project, onClose, onMarkChanged }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1400, height: 900 });

  useEffect(() => {
    // Set initial window size
    const handleResize = () => {
      if (!isFullscreen) {
        setWindowSize({
          width: Math.min(window.innerWidth - 100, 1400),
          height: Math.min(window.innerHeight - 100, 900)
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 gantt-popout-overlay">
      <div 
        className={`bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col gantt-popout-window ${
          isFullscreen ? 'w-full h-full' : ''
        }`}
        style={{
          width: isFullscreen ? '100%' : `${windowSize.width}px`,
          height: isFullscreen ? '100%' : `${windowSize.height}px`,
          maxWidth: isFullscreen ? '100%' : '95vw',
          maxHeight: isFullscreen ? '100%' : '95vh'
        }}
      >
        {/* Window Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 gantt-popout-header rounded-t-lg">
          <div className="flex items-center gap-3 gantt-popout-controls">
            <button 
              className="gantt-popout-button close"
              onClick={handleClose}
              title="Close"
            ></button>
            <button 
              className="gantt-popout-button minimize"
              title="Minimize"
            ></button>
            <button 
              className="gantt-popout-button maximize"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            ></button>
          </div>
          
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Gantt Chart - {project.name}
            </h2>
            <span className="text-xs text-gray-500 ml-2">
              (Press ESC to close, F11 for fullscreen)
            </span>
          </div>
        </div>

        {/* Gantt Chart Content */}
        <div className="flex-1 overflow-hidden">
          <EnterpriseGanttChart 
            project={project} 
            onMarkChanged={onMarkChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default GanttPopoutWindow; 