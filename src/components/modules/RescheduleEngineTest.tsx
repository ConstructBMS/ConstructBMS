import React, { useState } from 'react';
import { Card } from '../ui';
import { rescheduleEngineService } from '../../services/rescheduleEngineService';
import type { RescheduleSettings, RescheduleResult } from '../../services/rescheduleEngineService';

const RescheduleEngineTest: React.FC = () => {
  const [demoProjectId] = useState('demo-project-123');
  const [lastResult, setLastResult] = useState<RescheduleResult | null>(null);
  const [testSettings, setTestSettings] = useState<RescheduleSettings>({
    skipWeekends: true,
    respectConstraints: true,
    forwardPass: true,
    backwardPass: false,
    levelResources: false
  });

  const handleRescheduleComplete = (result: RescheduleResult) => {
    setLastResult(result);
    console.log('Reschedule completed:', result);
  };

  const resetDemoData = () => {
    setLastResult(null);
    console.log('Demo data reset');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Project Reschedule Engine Test</h2>
        <p className="text-blue-100">
          Test the reschedule engine with demo project data. The engine will recalculate task dates based on dependencies, constraints, and working calendars.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Controls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demo Project ID
                </label>
                <input
                  type="text"
                  value={demoProjectId}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Settings
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testSettings.skipWeekends}
                      onChange={(e) => setTestSettings(prev => ({ ...prev, skipWeekends: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Skip weekends</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testSettings.respectConstraints}
                      onChange={(e) => setTestSettings(prev => ({ ...prev, respectConstraints: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Respect constraints</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testSettings.forwardPass}
                      onChange={(e) => setTestSettings(prev => ({ ...prev, forwardPass: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Forward pass</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testSettings.backwardPass}
                      onChange={(e) => setTestSettings(prev => ({ ...prev, backwardPass: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Backward pass</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetDemoData}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Reset Demo Data
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Reschedule Engine */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reschedule Engine</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Engine Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Forward/backward pass calculations</li>
                  <li>• Dependency resolution</li>
                  <li>• Constraint handling (ASAP, Start No Earlier, Must Finish)</li>
                  <li>• Weekend skipping</li>
                  <li>• Lag time support</li>
                  <li>• Change tracking and history</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <RescheduleEngine
                  projectId={demoProjectId}
                  onRescheduleComplete={handleRescheduleComplete}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Results Display */}
      {lastResult && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reschedule Results</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{lastResult.summary.tasksProcessed}</div>
                  <div className="text-sm text-blue-600">Tasks Processed</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{lastResult.summary.tasksChanged}</div>
                  <div className="text-sm text-green-600">Tasks Changed</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{lastResult.summary.totalDaysShifted}</div>
                  <div className="text-sm text-purple-600">Days Shifted</div>
                </div>
              </div>

              {lastResult.changes.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Changes Made:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {lastResult.changes.map((change, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Task {change.taskId}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            change.changeType === 'moved_forward' ? 'bg-blue-100 text-blue-800' :
                            change.changeType === 'moved_backward' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {change.changeType.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {change.fieldName}: {change.oldValue} → {change.newValue}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Reason: {change.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lastResult.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800">
                    <div className="font-medium">Error:</div>
                    <div className="text-sm mt-1">{lastResult.error}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Demo Data Info */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Data Information</h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-800">
              <div className="font-medium mb-2">Demo Mode Active</div>
              <div className="text-sm space-y-1">
                <p>• Using demo project data with sample tasks and dependencies</p>
                <p>• Changes are simulated and not saved to database</p>
                <p>• Real reschedule operations require actual project data</p>
                <p>• Check console for detailed operation logs</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RescheduleEngineTest; 