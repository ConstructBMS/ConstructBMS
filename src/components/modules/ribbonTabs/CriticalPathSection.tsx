import React from 'react';
import {
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { criticalPathService } from '../../../services/criticalPathService';
import { demoModeService } from '../../../services/demoModeService';

interface CriticalPathSectionProps {
  showCriticalPath: boolean;
  criticalOnly: boolean;
  onToggleCriticalPath: () => void;
  onToggleCriticalOnly: () => void;
  disabled?: boolean;
  loading?: {
    toggle?: boolean;
    criticalOnly?: boolean;
  };
}

const CriticalPathSection: React.FC<CriticalPathSectionProps> = ({
  showCriticalPath,
  criticalOnly,
  onToggleCriticalPath,
  onToggleCriticalOnly,
  disabled = false,
  loading = {}
}) => {
  const [isDemoMode, setIsDemoMode] = React.useState(false);
  const [demoConfig, setDemoConfig] = React.useState(criticalPathService.getDemoModeConfig());

  React.useEffect(() => {
    const checkDemoMode = async () => {
      const demo = await demoModeService.isDemoMode();
      setIsDemoMode(demo);
    };
    checkDemoMode();
  }, []);

  return (
    <section className="ribbon-section">
      <div className="ribbon-section-header flex items-center space-x-2 mb-2">
        <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Critical Path
        </h3>
      </div>
      
      <div className="ribbon-buttons flex space-x-2">
        {/* Show Critical Path Toggle */}
        <button
          onClick={onToggleCriticalPath}
          disabled={disabled || loading.toggle}
          className={`ribbon-button flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            disabled || loading.toggle
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : showCriticalPath
              ? 'bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
              : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          title={showCriticalPath ? 'Hide Critical Path' : 'Show Critical Path'}
        >
          {loading.toggle ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : showCriticalPath ? (
            <EyeSlashIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
          <span>Critical Path</span>
        </button>

        {/* Critical Only Toggle */}
        <button
          onClick={onToggleCriticalOnly}
          disabled={disabled || loading.criticalOnly || !showCriticalPath || isDemoMode}
          className={`ribbon-button flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            disabled || loading.criticalOnly || !showCriticalPath || isDemoMode
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : criticalOnly
              ? 'bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
              : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          title={isDemoMode ? 'Critical Only view disabled in demo mode' : (criticalOnly ? 'Show All Tasks' : 'Show Critical Only')}
        >
          {loading.criticalOnly ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <ExclamationTriangleIcon className="w-4 h-4" />
          )}
          <span>Critical Only</span>
        </button>
      </div>

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className="ribbon-info mt-2 px-2 py-1 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded text-xs">
          <div className="flex items-center space-x-1">
            <InformationCircleIcon className="w-3 h-3 text-pink-600 dark:text-pink-400" />
            <span className="text-pink-800 dark:text-pink-200">
              Demo Mode: Max {demoConfig.maxCriticalTasks} critical tasks
            </span>
          </div>
          <div className="text-pink-600 dark:text-pink-300 mt-1">
            {demoConfig.watermark}
          </div>
        </div>
      )}

      {/* Critical Path Info */}
      {showCriticalPath && (
        <div className="ribbon-info mt-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
          <div className="flex items-center space-x-1">
            <ExclamationTriangleIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200">
              Critical Path Active
            </span>
          </div>
          <div className="text-blue-600 dark:text-blue-300 mt-1">
            Red bars indicate critical tasks (0 days float)
          </div>
        </div>
      )}
    </section>
  );
};

export default CriticalPathSection; 