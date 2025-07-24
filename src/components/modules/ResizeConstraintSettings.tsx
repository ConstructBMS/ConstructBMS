import React, { useState, useEffect } from 'react';
import { CogIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { type ResizeConstraint } from '../../services/taskResizeService';

interface ResizeConstraintSettingsProps {
  constraints: ResizeConstraint;
  onConstraintsChange: (constraints: ResizeConstraint) => void;
  className?: string;
}

const ResizeConstraintSettings: React.FC<ResizeConstraintSettingsProps> = ({
  constraints,
  onConstraintsChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localConstraints, setLocalConstraints] = useState<ResizeConstraint>(constraints);

  useEffect(() => {
    setLocalConstraints(constraints);
  }, [constraints]);

  const handleMinDurationChange = (value: number) => {
    const newConstraints = {
      ...localConstraints,
      minDuration: Math.max(1, value)
    };
    setLocalConstraints(newConstraints);
    onConstraintsChange(newConstraints);
  };

  const handleMaxDurationChange = (value: number) => {
    const newConstraints = {
      ...localConstraints,
      maxDuration: Math.max(localConstraints.minDuration, value)
    };
    setLocalConstraints(newConstraints);
    onConstraintsChange(newConstraints);
  };

  const handleEnforceDependenciesToggle = () => {
    const newConstraints = {
      ...localConstraints,
      enforceDependencies: !localConstraints.enforceDependencies
    };
    setLocalConstraints(newConstraints);
    onConstraintsChange(newConstraints);
  };

  const handleAllowOverlapToggle = () => {
    const newConstraints = {
      ...localConstraints,
      allowOverlap: !localConstraints.allowOverlap
    };
    setLocalConstraints(newConstraints);
    onConstraintsChange(newConstraints);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          localConstraints.enforceDependencies || !localConstraints.allowOverlap
            ? 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
        title="Resize Constraint Settings"
      >
        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
        Constraints
        {(localConstraints.enforceDependencies || !localConstraints.allowOverlap) && (
          <CheckIcon className="w-4 h-4 ml-2 text-orange-600" />
        )}
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Resize Constraint Settings
            </h3>

            {/* Duration Constraints */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration Constraints
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Minimum Duration (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={localConstraints.maxDuration}
                      value={localConstraints.minDuration}
                      onChange={(e) => handleMinDurationChange(parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Maximum Duration (days)
                    </label>
                    <input
                      type="number"
                      min={localConstraints.minDuration}
                      value={localConstraints.maxDuration}
                      onChange={(e) => handleMaxDurationChange(parseInt(e.target.value) || localConstraints.minDuration)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Dependency Constraints */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enforce Dependencies
                  </label>
                  <button
                    onClick={handleEnforceDependenciesToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localConstraints.enforceDependencies ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localConstraints.enforceDependencies ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Prevent resizing that would violate task dependencies
                </p>
              </div>

              {/* Overlap Constraints */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allow Task Overlap
                  </label>
                  <button
                    onClick={handleAllowOverlapToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localConstraints.allowOverlap ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localConstraints.allowOverlap ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow tasks to overlap in time (disable for strict scheduling)
                </p>
              </div>
            </div>

            {/* Constraint Summary */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Current Constraints
              </div>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Duration: {localConstraints.minDuration}-{localConstraints.maxDuration} days</li>
                <li>• Dependencies: {localConstraints.enforceDependencies ? 'Enforced' : 'Not enforced'}</li>
                <li>• Overlap: {localConstraints.allowOverlap ? 'Allowed' : 'Not allowed'}</li>
              </ul>
            </div>

            {/* Warning for strict constraints */}
            {localConstraints.enforceDependencies && !localConstraints.allowOverlap && (
              <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-xs text-orange-700 dark:text-orange-300">
                    Strict constraints enabled - resize operations may be limited
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ResizeConstraintSettings; 