import React, { useState } from 'react';
import { progressTrackingService } from '../../services/progressTrackingService';

interface ProgressBarProps {
  className?: string;
  height?: string; // 0-100
  isDemo?: boolean;
  onProgressChange?: ((newProgress: number) => void) | undefined;
  progress: number;
  readOnly?: boolean;
  showLabel?: boolean;
  taskId: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  taskId,
  progress,
  isDemo = false,
  showLabel = true,
  className = '',
  height = 'h-4',
  onProgressChange,
  readOnly = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(progress.toString());

  // Get progress bar styling from service
  const { width, color, tooltip } = progressTrackingService.getProgressBarStyle(progress, isDemo);

  const handleClick = () => {
    if (!readOnly && !isDemo) {
      setIsEditing(true);
      setEditValue(progress.toString());
    }
  };

  const handleEditSubmit = () => {
    const newProgress = parseInt(editValue, 10);
    if (progressTrackingService.validateProgress(newProgress) && onProgressChange) {
      const limitedProgress = progressTrackingService.applyDemoLimits(newProgress);
      onProgressChange(limitedProgress);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditValue(progress.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background bar */}
      <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 rounded transition-all duration-300`}>
        {/* Progress overlay */}
        <div 
          className={`${color} ${height} rounded transition-all duration-300 ease-out`}
          style={{ width }}
        />
        
        {/* Progress label */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white drop-shadow-sm">
              {progress}%
            </span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap">
          {tooltip}
          {!readOnly && !isDemo && (
            <div className="text-gray-300 text-xs mt-1">
              Click to edit
            </div>
          )}
        </div>
      )}

      {/* Inline edit input */}
      {isEditing && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded border-2 border-blue-500">
          <input
            type="number"
            min="0"
            max={isDemo ? 60 : 100}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleEditSubmit}
            className="w-16 text-center text-sm border-none bg-transparent focus:outline-none"
            autoFocus
          />
          <span className="text-sm text-gray-500 ml-1">%</span>
        </div>
      )}

      {/* Click overlay for editing */}
      {!readOnly && !isDemo && !isEditing && (
        <div 
          className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-10 hover:bg-blue-500 transition-opacity duration-200"
          onClick={handleClick}
        />
      )}
    </div>
  );
};

export default ProgressBar; 