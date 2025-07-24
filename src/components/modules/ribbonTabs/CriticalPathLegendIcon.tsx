import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface CriticalPathLegendIconProps {
  disabled?: boolean;
}

const CriticalPathLegendIcon: React.FC<CriticalPathLegendIconProps> = ({
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [showTooltip, setShowTooltip] = useState(false);

  const canView = canAccess('programme.format.view') || canAccess('programme.format.edit');
  const isDisabled = disabled || !canView;

  const handleMouseEnter = () => {
    if (!isDisabled) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center w-12 h-12
          border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-700 rounded
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-help hover:bg-gray-50 dark:hover:bg-gray-600'
          }
        `}
        title="Learn how critical path highlighting works"
      >
        <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-medium mt-1 text-blue-600 dark:text-blue-400">
          Legend
        </span>
      </button>

      {showTooltip && !isDisabled && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 p-3">
          <div className="text-sm">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Critical Path Highlighting
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Critical tasks have zero float and define the shortest project duration.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Critical task bar
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Non-critical task bar
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong>Tip:</strong> Critical path tasks cannot be delayed without extending the project duration.
              </p>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute -top-1 left-6 w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-300 dark:border-gray-600 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default CriticalPathLegendIcon; 