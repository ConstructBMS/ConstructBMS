import React, { useState } from 'react';
import { FireIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { CriticalPathResult } from '../services/criticalPathService';

interface CriticalPathIndicatorProps {
  criticalPath: CriticalPathResult;
  isDemoMode?: boolean;
  className?: string;
}

const CriticalPathIndicator: React.FC<CriticalPathIndicatorProps> = ({
  criticalPath,
  isDemoMode = false,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (criticalPath.criticalTasks.length === 0) {
    return null;
  }

  const criticalTaskCount = criticalPath.criticalTasks.length;
  const criticalDependencyCount = criticalPath.criticalDependencies.length;
  const projectDuration = criticalPath.projectDuration;

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className="flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium cursor-help"
        style={{
          backgroundColor: isDemoMode ? '#fef2f2' : '#dc2626',
          color: 'white',
          border: `1px solid ${isDemoMode ? '#fecaca' : '#dc2626'}`
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <FireIcon className="w-4 h-4" />
        <span>
          {criticalTaskCount} Critical Task{criticalTaskCount !== 1 ? 's' : ''}
          {isDemoMode && (
            <span className="ml-1 text-xs opacity-75">DEMO</span>
          )}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded shadow-lg z-50 max-w-md">
          <div className="space-y-2">
            <div className="font-medium flex items-center space-x-2">
              <FireIcon className="w-4 h-4" />
              <span>Critical Path</span>
              {isDemoMode && (
                <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">
                  DEMO
                </span>
              )}
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Critical Tasks:</span>
                <span className="font-medium">{criticalTaskCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Critical Dependencies:</span>
                <span className="font-medium">{criticalDependencyCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Project Duration:</span>
                <span className="font-medium">{projectDuration} days</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-300 pt-1 border-t border-gray-700">
              {isDemoMode ? (
                <div>
                  <p className="font-medium text-yellow-400">Demo Mode Restrictions:</p>
                  <p>• Limited critical path display</p>
                  <p>• Lighter styling applied</p>
                  <p>• No persistent caching</p>
                </div>
              ) : (
                <p>Tasks with zero float time that determine project duration</p>
              )}
            </div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default CriticalPathIndicator; 