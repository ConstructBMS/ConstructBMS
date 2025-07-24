import React, { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { baselineService, type BaselineVariance } from '../../services/baselineService';

interface BaselineBarProps {
  baselineEnd: Date;
  baselineStart: Date;
  className?: string;
  currentEnd: Date;
  currentStart: Date;
  height: number;
  isDemoMode?: boolean;
  left: number;
  taskId: string;
  top: number;
  width: number;
}

const BaselineBar: React.FC<BaselineBarProps> = ({
  taskId,
  currentStart,
  currentEnd,
  baselineStart,
  baselineEnd,
  width,
  height,
  left,
  top,
  isDemoMode = false,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate variance
  const startVariance = Math.round((currentStart.getTime() - baselineStart.getTime()) / (1000 * 60 * 60 * 24));
  const endVariance = Math.round((currentEnd.getTime() - baselineEnd.getTime()) / (1000 * 60 * 60 * 24));
  const durationVariance = Math.round((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)) - 
                           Math.round((baselineEnd.getTime() - baselineStart.getTime()) / (1000 * 60 * 60 * 24));

  // Determine variance colors
  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) <= 1) return 'text-gray-600 dark:text-gray-400'; // On time
    return variance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  };

  const getVarianceIcon = (variance: number) => {
    if (Math.abs(variance) <= 1) return null; // On time
    return variance > 0 ? '🔴' : '🟢'; // Red for delay, green for early
  };

  // Format variance for display
  const formatVariance = (variance: number) => {
    if (variance === 0) return '0 days';
    return `${variance > 0 ? '+' : ''}${variance} days`;
  };

  // Get demo mode configuration
  const demoConfig = baselineService.getDemoModeConfig();

  // Generate tooltip content
  const generateTooltipContent = () => {
    const hasVariance = startVariance !== 0 || endVariance !== 0 || durationVariance !== 0;
    
    if (isDemoMode) {
      return (
        <div className="text-xs">
          <div className="font-medium text-orange-600 mb-1">
            {demoConfig.tooltipMessage}
          </div>
          {hasVariance ? (
            <div className="space-y-1">
              <div>Start: {formatVariance(startVariance)}</div>
              <div>End: {formatVariance(endVariance)}</div>
              <div>Duration: {formatVariance(durationVariance)}</div>
            </div>
          ) : (
            <div>No variance detected</div>
          )}
        </div>
      );
    }

    return (
      <div className="text-xs">
        <div className="font-medium mb-2">Baseline vs Current</div>
        <div className="space-y-1">
          <div className={`flex items-center justify-between ${getVarianceColor(startVariance)}`}>
            <span>Start:</span>
            <span className="flex items-center">
              {getVarianceIcon(startVariance)}
              <span className="ml-1">{formatVariance(startVariance)}</span>
            </span>
          </div>
          <div className={`flex items-center justify-between ${getVarianceColor(endVariance)}`}>
            <span>End:</span>
            <span className="flex items-center">
              {getVarianceIcon(endVariance)}
              <span className="ml-1">{formatVariance(endVariance)}</span>
            </span>
          </div>
          <div className={`flex items-center justify-between ${getVarianceColor(durationVariance)}`}>
            <span>Duration:</span>
            <span className="flex items-center">
              {getVarianceIcon(durationVariance)}
              <span className="ml-1">{formatVariance(durationVariance)}</span>
            </span>
          </div>
        </div>
        {hasVariance && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {startVariance > 0 || endVariance > 0 ? '🔴 Delayed' : '🟢 Ahead of schedule'}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calculate baseline bar position and width
  const baselineWidth = Math.max(1, width); // Minimum 1px width
  const baselineLeft = left;

  return (
    <div className={`relative ${className}`}>
      {/* Baseline Bar */}
      <div
        className="absolute bg-gray-400 opacity-60 rounded transition-all duration-200"
        style={{
          left: `${baselineLeft}px`,
          top: `${top + 4}px`, // Offset downward by 4px
          width: `${baselineWidth}px`,
          height: `${height}px`
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div
          className="absolute top-0 right-0 transform translate-x-1 -translate-y-1"
          title={demoConfig.tooltipMessage}
        >
          <ExclamationTriangleIcon className="w-3 h-3 text-orange-500" />
        </div>
      )}

      {/* Variance Indicator */}
      {(startVariance !== 0 || endVariance !== 0 || durationVariance !== 0) && (
        <div
          className="absolute top-0 right-0 transform translate-x-1 -translate-y-1"
          style={{
            left: `${baselineLeft + baselineWidth + 2}px`,
            top: `${top + 2}px`
          }}
        >
          <div className={`text-xs font-medium ${getVarianceColor(Math.max(startVariance, endVariance))}`}>
            {getVarianceIcon(Math.max(startVariance, endVariance))}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-50 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          style={{
            left: `${baselineLeft + baselineWidth + 10}px`,
            top: `${top - 10}px`,
            minWidth: '200px'
          }}
        >
          {generateTooltipContent()}
          
          {/* Tooltip Arrow */}
          <div
            className="absolute w-2 h-2 bg-white dark:bg-gray-800 border-l border-b border-gray-200 dark:border-gray-700 transform rotate-45"
            style={{
              left: '-6px',
              top: '10px'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BaselineBar; 