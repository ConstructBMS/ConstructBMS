import React, { useState } from 'react';
import { 
  ArrowPathIcon, 
  CalendarIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { rescheduleEngineService } from '../../services/rescheduleEngineService';
import type { RescheduleSettings, RescheduleResult } from '../../services/rescheduleEngineService';
import { useAuth } from '../../contexts/AuthContext';

interface RescheduleEngineProps {
  disabled?: boolean;
  onRescheduleComplete?: (result: RescheduleResult) => void;
  projectId: string;
}

const RescheduleEngine: React.FC<RescheduleEngineProps> = ({ 
  projectId, 
  onRescheduleComplete,
  disabled = false 
}) => {
  const { user } = useAuth();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<RescheduleSettings>({
    skipWeekends: true,
    respectConstraints: true,
    forwardPass: true,
    backwardPass: false,
    levelResources: false
  });
  const [lastResult, setLastResult] = useState<RescheduleResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleReschedule = async () => {
    if (!user || disabled) return;

    setIsRescheduling(true);
    setShowSettings(false);
    setLastResult(null);

    try {
      const result = await rescheduleEngineService.rescheduleProject(projectId, settings);
      setLastResult(result);
      setShowResults(true);
      
      if (onRescheduleComplete) {
        onRescheduleComplete(result);
      }
    } catch (error) {
      console.error('Reschedule failed:', error);
      setLastResult({
        success: false,
        operationId: '',
        changes: [],
        summary: { tasksProcessed: 0, tasksChanged: 0, totalDaysShifted: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setShowResults(true);
    } finally {
      setIsRescheduling(false);
    }
  };

  const getStatusIcon = () => {
    if (isRescheduling) {
      return <ArrowPathIcon className="h-4 w-4 animate-spin" />;
    }
    if (lastResult?.success) {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    }
    if (lastResult && !lastResult.success) {
      return <XCircleIcon className="h-4 w-4 text-red-500" />;
    }
    return <ArrowPathIcon className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isRescheduling) return 'Rescheduling...';
    if (lastResult?.success) return 'Rescheduled';
    if (lastResult && !lastResult.success) return 'Failed';
    return 'Reschedule';
  };

  const getStatusColor = () => {
    if (isRescheduling) return 'text-blue-600';
    if (lastResult?.success) return 'text-green-600';
    if (lastResult && !lastResult.success) return 'text-red-600';
    return 'text-gray-700';
  };

  return (
    <div className="relative">
      {/* Main Reschedule Button */}
      <button
        onClick={() => setShowSettings(true)}
        disabled={disabled || isRescheduling}
        className={`
          flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md
          ${disabled || isRescheduling 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
          }
          transition-colors duration-200
        `}
        title="Reschedule Project"
      >
        {getStatusIcon()}
        <span className={getStatusColor()}>{getStatusText()}</span>
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ArrowPathIcon className="h-5 w-5" />
                Project Reschedule Settings
              </h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Calendar Settings */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CalendarIcon className="h-4 w-4" />
                  Calendar Settings
                </label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.skipWeekends}
                      onChange={(e) => setSettings(prev => ({ ...prev, skipWeekends: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Skip weekends</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.respectConstraints}
                      onChange={(e) => setSettings(prev => ({ ...prev, respectConstraints: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Respect task constraints</span>
                  </label>
                </div>
              </div>

              {/* Reschedule Direction */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ClockIcon className="h-4 w-4" />
                  Reschedule Direction
                </label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.forwardPass}
                      onChange={(e) => setSettings(prev => ({ ...prev, forwardPass: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Forward pass (earliest start)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.backwardPass}
                      onChange={(e) => setSettings(prev => ({ ...prev, backwardPass: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Backward pass (latest finish)</span>
                  </label>
                </div>
              </div>

              {/* Resource Leveling */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.levelResources}
                    onChange={(e) => setSettings(prev => ({ ...prev, levelResources: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Level resources (future feature)</span>
                </label>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Warning</p>
                    <p>This will modify task dates based on dependencies and constraints. Changes cannot be undone automatically.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={isRescheduling}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
              >
                {isRescheduling ? 'Rescheduling...' : 'Reschedule Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && lastResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {lastResult.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
                Reschedule {lastResult.success ? 'Completed' : 'Failed'}
              </h3>
            </div>

            <div className="px-6 py-4">
              {lastResult.success ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{lastResult.summary.tasksProcessed}</div>
                      <div className="text-sm text-gray-600">Tasks Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{lastResult.summary.tasksChanged}</div>
                      <div className="text-sm text-gray-600">Tasks Changed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{lastResult.summary.totalDaysShifted}</div>
                      <div className="text-sm text-gray-600">Days Shifted</div>
                    </div>
                  </div>

                  {lastResult.changes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Changes Made:</h4>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {lastResult.changes.slice(0, 10).map((change, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <span className="font-medium">Task {change.taskId}:</span> {change.fieldName} changed from {change.oldValue} to {change.newValue}
                            <div className="text-xs text-gray-500 mt-1">Reason: {change.reason}</div>
                          </div>
                        ))}
                        {lastResult.changes.length > 10 && (
                          <div className="text-sm text-gray-500 italic">
                            ... and {lastResult.changes.length - 10} more changes
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="font-medium">Reschedule failed:</p>
                  <p className="text-sm mt-1">{lastResult.error}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowResults(false)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescheduleEngine; 