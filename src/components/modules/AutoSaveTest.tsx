import React, { useState } from 'react';
import { Card } from '../ui';
import AutoSaveStatus from './AutoSaveStatus';
import AutoSaveInput from './AutoSaveInput';
import AutoSaveTextarea from './AutoSaveTextarea';
import { useAutoSave } from '../../contexts/AutoSaveContext';

const AutoSaveTest: React.FC = () => {
  const { state, forceSave, clearDirty, setConfig } = useAutoSave();
  const [demoTask, setDemoTask] = useState({
    id: 'demo-task-1',
    name: 'Sample Task',
    description: 'This is a sample task for testing auto-save functionality.',
    duration: 5,
    progress: 25
  });

  const [demoProject, setDemoProject] = useState({
    id: 'demo-project-1',
    name: 'Sample Project',
    description: 'This is a sample project for testing auto-save functionality.',
    status: 'active'
  });

  const [autoSaveConfig, setAutoSaveConfig] = useState({
    debounceMs: 1000,
    autoSaveIntervalMs: 30000,
    maxRetries: 3,
    retryDelayMs: 1000
  });

  const handleConfigChange = (field: string, value: number) => {
    const newConfig = { ...autoSaveConfig, [field]: value };
    setAutoSaveConfig(newConfig);
    setConfig(newConfig);
  };

  const handleForceSave = async () => {
    const success = await forceSave();
    console.log('Force save result:', success);
  };

  const handleClearDirty = () => {
    clearDirty();
  };

  const handleSimulateError = () => {
    // This would trigger an error in a real scenario
    console.log('Simulating save error...');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Auto-Save Engine Test</h2>
        <p className="text-blue-100">
          Test the auto-save functionality with real-time feedback. Changes are automatically saved on blur and every 30 seconds.
        </p>
      </div>

      {/* Auto-Save Status */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Save Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Status:</span>
              <AutoSaveStatus showTimestamp={true} showError={true} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Compact Status:</span>
              <AutoSaveStatus compact={true} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Is Dirty:</span>
                <span className={`ml-2 ${state.isDirty ? 'text-yellow-600' : 'text-green-600'}`}>
                  {state.isDirty ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Is Saving:</span>
                <span className={`ml-2 ${state.isSaving ? 'text-blue-600' : 'text-gray-600'}`}>
                  {state.isSaving ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Pending Changes:</span>
                <span className="ml-2 text-gray-600">{state.pendingChanges.size}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Saved:</span>
                <span className="ml-2 text-gray-600">
                  {state.lastSaved ? state.lastSaved.toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Form */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Auto-Save</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Name
                </label>
                <AutoSaveInput
                  tableName="asta_tasks"
                  recordId={demoTask.id}
                  fieldName="name"
                  initialValue={demoTask.name}
                  placeholder="Enter task name"
                  required={true}
                  maxLength={100}
                  onValueChange={(value) => setDemoTask(prev => ({ ...prev, name: value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <AutoSaveTextarea
                  tableName="asta_tasks"
                  recordId={demoTask.id}
                  fieldName="description"
                  initialValue={demoTask.description}
                  placeholder="Enter task description"
                  rows={3}
                  maxLength={500}
                  onValueChange={(value) => setDemoTask(prev => ({ ...prev, description: value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days)
                </label>
                <AutoSaveInput
                  tableName="asta_tasks"
                  recordId={demoTask.id}
                  fieldName="duration"
                  initialValue={demoTask.duration.toString()}
                  type="number"
                  minLength={1}
                  onValueChange={(value) => setDemoTask(prev => ({ ...prev, duration: parseInt(value) || 0 }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress (%)
                </label>
                <AutoSaveInput
                  tableName="asta_tasks"
                  recordId={demoTask.id}
                  fieldName="progress"
                  initialValue={demoTask.progress.toString()}
                  type="number"
                  minLength={0}
                  maxLength={100}
                  onValueChange={(value) => setDemoTask(prev => ({ ...prev, progress: parseInt(value) || 0 }))}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Project Form */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Auto-Save</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <AutoSaveInput
                  tableName="asta_projects"
                  recordId={demoProject.id}
                  fieldName="name"
                  initialValue={demoProject.name}
                  placeholder="Enter project name"
                  required={true}
                  maxLength={100}
                  onValueChange={(value) => setDemoProject(prev => ({ ...prev, name: value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <AutoSaveTextarea
                  tableName="asta_projects"
                  recordId={demoProject.id}
                  fieldName="description"
                  initialValue={demoProject.description}
                  placeholder="Enter project description"
                  rows={3}
                  maxLength={500}
                  onValueChange={(value) => setDemoProject(prev => ({ ...prev, description: value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <AutoSaveInput
                  tableName="asta_projects"
                  recordId={demoProject.id}
                  fieldName="status"
                  initialValue={demoProject.status}
                  placeholder="Enter project status"
                  maxLength={50}
                  onValueChange={(value) => setDemoProject(prev => ({ ...prev, status: value }))}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Configuration */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Save Configuration</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Debounce (ms)
              </label>
              <input
                type="number"
                value={autoSaveConfig.debounceMs}
                onChange={(e) => handleConfigChange('debounceMs', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={100}
                max={10000}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Save Interval (ms)
              </label>
              <input
                type="number"
                value={autoSaveConfig.autoSaveIntervalMs}
                onChange={(e) => handleConfigChange('autoSaveIntervalMs', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={5000}
                max={300000}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Retries
              </label>
              <input
                type="number"
                value={autoSaveConfig.maxRetries}
                onChange={(e) => handleConfigChange('maxRetries', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={0}
                max={10}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retry Delay (ms)
              </label>
              <input
                type="number"
                value={autoSaveConfig.retryDelayMs}
                onChange={(e) => handleConfigChange('retryDelayMs', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={100}
                max={10000}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Save Controls</h3>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleForceSave}
              disabled={!state.isDirty || state.isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Force Save Now
            </button>
            
            <button
              onClick={handleClearDirty}
              disabled={!state.isDirty}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Clear Dirty State
            </button>
            
            <button
              onClick={handleSimulateError}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Simulate Error
            </button>
          </div>
        </div>
      </Card>

      {/* Demo Data Info */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Data Information</h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-800">
              <div className="font-medium mb-2">Demo Mode Active</div>
              <div className="text-sm space-y-1">
                <p>• Using demo task and project data</p>
                <p>• Changes are simulated and not saved to database</p>
                <p>• Real auto-save operations require actual database tables</p>
                <p>• Check console for detailed operation logs</p>
                <p>• Auto-save triggers on blur and every 30 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AutoSaveTest; 