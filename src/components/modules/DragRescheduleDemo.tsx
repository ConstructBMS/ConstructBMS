import React, { useState, useEffect } from 'react';
import { 
  ArrowPathIcon, 
  CogIcon, 
  ArrowUturnLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { dragRescheduleService, type SnapConfig } from '../../services/dragRescheduleService';
import DraggableGanttBar from './DraggableGanttBar';
import UndoButton from './UndoButton';
import SnapToGridSettings from './SnapToGridSettings';
import { toastService } from './ToastNotification';

// Sample task data for demo
const sampleTasks = [
  {
    id: '1',
    name: 'Project Planning',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-15'),
    progress: 100,
    isCritical: true
  },
  {
    id: '2',
    name: 'Requirements Analysis',
    startDate: new Date('2024-01-16'),
    endDate: new Date('2024-01-25'),
    progress: 80,
    isCritical: true
  },
  {
    id: '3',
    name: 'Design Phase',
    startDate: new Date('2024-01-26'),
    endDate: new Date('2024-02-10'),
    progress: 60,
    isCritical: false
  },
  {
    id: '4',
    name: 'Development',
    startDate: new Date('2024-02-11'),
    endDate: new Date('2024-03-15'),
    progress: 30,
    isCritical: false
  },
  {
    id: '5',
    name: 'Testing',
    startDate: new Date('2024-03-16'),
    endDate: new Date('2024-03-30'),
    progress: 10,
    isCritical: false
  }
];

const DragRescheduleDemo: React.FC = () => {
  const [tasks, setTasks] = useState(sampleTasks);
  const [snapConfig, setSnapConfig] = useState<SnapConfig>({
    enabled: true,
    type: 'day',
    gridWidth: 20
  });
  const [dayWidth, setDayWidth] = useState(20);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  // Toggle demo mode
  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
    console.log('Demo mode:', !isDemoMode);
  };

  // Handle task reschedule
  const handleTaskReschedule = (taskId: string, newStart: Date, newEnd: Date) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, startDate: newStart, endDate: newEnd }
          : task
      )
    );
  };

  // Handle dependency recalculation
  const handleDependencyRecalculate = () => {
    // This would trigger dependency recalculation in a real app
    console.log('Dependencies recalculated');
  };

  // Handle undo action
  const handleUndo = (message: string) => {
    setMessages(prev => [message, ...prev.slice(0, 4)]); // Keep last 5 messages
    
    // Show toast notification
    if (message.includes('DEMO LIMIT')) {
      toastService.warning('Demo Mode', message);
    } else if (message.startsWith('Error:')) {
      toastService.error('Undo Failed', message);
    } else {
      toastService.success('Undo Successful', message);
    }
  };

  // Handle progress change
  const handleProgressChange = (taskId: string, newProgress: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, progress: newProgress }
          : task
      )
    );
  };

  // Handle task click
  const handleTaskClick = (taskId: string) => {
    console.log('Task clicked:', taskId);
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ArrowPathIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Drag-to-Reschedule Demo
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemoMode}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isDemoMode 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            {isDemoMode ? 'Demo Mode' : 'Normal Mode'}
          </button>

          {/* Undo Button */}
          <UndoButton onUndo={handleUndo} />

          {/* Snap-to-Grid Settings */}
          <SnapToGridSettings
            snapConfig={snapConfig}
            onSnapConfigChange={setSnapConfig}
            dayWidth={dayWidth}
          />
        </div>
      </div>

      {/* Demo Info */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
            Demo Mode Active
          </h3>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Drag only enabled for first 3 tasks</li>
            <li>• Snap-to-grid fixed to Day</li>
            <li>• Undo limited to 1 action</li>
            <li>• All actions tagged as demo</li>
          </ul>
        </div>
      )}

      {/* Settings Panel */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day Width (pixels)
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={dayWidth}
              onChange={(e) => setDayWidth(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{dayWidth}px per day</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Snap-to-Grid
            </label>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {snapConfig.enabled ? 'Enabled' : 'Disabled'} - {snapConfig.type}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Undo Buffer
            </label>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {dragRescheduleService.getUndoBuffer().length} actions available
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Gantt Chart - Drag Tasks to Reschedule
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task.id} className="flex items-center space-x-4">
                <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {task.name}
                </div>
                <div className="flex-1 relative">
                  <DraggableGanttBar
                    taskId={task.id}
                    taskName={task.name}
                    startDate={task.startDate}
                    endDate={task.endDate}
                    progress={task.progress}
                    isCritical={task.isCritical}
                    isDemo={isDemoMode}
                    showProgress={true}
                    height={24}
                    dayWidth={dayWidth}
                    snapConfig={snapConfig}
                    onProgressChange={handleProgressChange}
                    onTaskClick={handleTaskClick}
                    onTaskReschedule={handleTaskReschedule}
                    onDependencyRecalculate={handleDependencyRecalculate}
                  />
                </div>
                <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                  {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                </div>
                <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                  {task.progress}%
                </div>
                {task.isCritical && (
                  <div className="w-20">
                    <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded">
                      Critical
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Messages
          </h2>
          <button
            onClick={clearMessages}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear
          </button>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-32 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No messages yet. Try dragging a task or using the undo button.
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 text-sm ${
                    message.startsWith('Error:') 
                      ? 'text-red-600 dark:text-red-400' 
                      : message.includes('DEMO LIMIT')
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {message.startsWith('Error:') ? (
                    <ExclamationTriangleIcon className="w-4 h-4" />
                  ) : message.includes('DEMO LIMIT') ? (
                    <ExclamationTriangleIcon className="w-4 h-4" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4" />
                  )}
                  <span>{message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          How to Use
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Click and drag any task bar horizontally to reschedule</li>
          <li>• Tasks will snap to grid boundaries when snap-to-grid is enabled</li>
          <li>• Use the Undo button to revert the last reschedule action</li>
          <li>• Configure snap-to-grid settings using the Snap button</li>
          <li>• Toggle demo mode to see limitations and restrictions</li>
        </ul>
      </div>
    </div>
  );
};

export default DragRescheduleDemo; 