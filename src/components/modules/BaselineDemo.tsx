import React, { useState, useEffect } from 'react';
import { 
  BookmarkIcon, 
  ChartBarIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PlusIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { baselineService, type Baseline, type BaselineTask } from '../../services/baselineService';
import BaselineBar from './BaselineBar';
import BaselineRibbonControls from './ribbonTabs/BaselineRibbonControls';

// Sample task data for demo
const sampleTasks = [
  {
    id: '1',
    name: 'Project Planning',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-15'),
    percentComplete: 100,
    isMilestone: false,
    parentId: undefined
  },
  {
    id: '2',
    name: 'Requirements Analysis',
    startDate: new Date('2024-01-16'),
    endDate: new Date('2024-02-15'),
    percentComplete: 75,
    isMilestone: false,
    parentId: undefined
  },
  {
    id: '3',
    name: 'System Design',
    startDate: new Date('2024-02-16'),
    endDate: new Date('2024-03-31'),
    percentComplete: 50,
    isMilestone: false,
    parentId: undefined
  },
  {
    id: '4',
    name: 'Development Phase',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-06-30'),
    percentComplete: 25,
    isMilestone: false,
    parentId: undefined
  },
  {
    id: '5',
    name: 'Testing Phase',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-08-15'),
    percentComplete: 0,
    isMilestone: false,
    parentId: undefined
  },
  {
    id: '6',
    name: 'Deployment',
    startDate: new Date('2024-08-16'),
    endDate: new Date('2024-08-31'),
    percentComplete: 0,
    isMilestone: true,
    parentId: undefined
  }
];

const BaselineDemo: React.FC = () => {
  const [currentTasks, setCurrentTasks] = useState(sampleTasks);
  const [showBaseline, setShowBaseline] = useState(false);
  const [activeBaseline, setActiveBaseline] = useState<Baseline | null>(null);
  const [baselineTasks, setBaselineTasks] = useState<BaselineTask[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [showBaselineManager, setShowBaselineManager] = useState(false);
  const [variances, setVariances] = useState<Array<{
    durationVariance: number;
    endVariance: number;
    startVariance: number;
    taskId: string;
  }>>([]);

  const projectId = 'demo-project';
  const dayWidth = 20;
  const rowHeight = 40;
  const startDate = new Date('2024-01-01');

  // Load baseline data when active baseline changes
  useEffect(() => {
    if (activeBaseline) {
      loadBaselineTasks(activeBaseline.id);
      calculateVariances();
    } else {
      setBaselineTasks([]);
      setVariances([]);
    }
  }, [activeBaseline]);

  const loadBaselineTasks = async (baselineId: string) => {
    try {
      const tasks = await baselineService.getBaselineTasks(baselineId);
      setBaselineTasks(tasks);
    } catch (error) {
      console.error('Error loading baseline tasks:', error);
    }
  };

  const calculateVariances = () => {
    if (!activeBaseline || baselineTasks.length === 0) return;

    const newVariances = currentTasks.map(currentTask => {
      const baselineTask = baselineTasks.find(bt => bt.taskId === currentTask.id);
      if (!baselineTask) return null;

      const startVariance = Math.round((currentTask.startDate.getTime() - baselineTask.baselineStart.getTime()) / (1000 * 60 * 60 * 24));
      const endVariance = Math.round((currentTask.endDate.getTime() - baselineTask.baselineEnd.getTime()) / (1000 * 60 * 60 * 24));
      const durationVariance = Math.round((currentTask.endDate.getTime() - currentTask.startDate.getTime()) / (1000 * 60 * 60 * 24)) - 
                               Math.round((baselineTask.baselineEnd.getTime() - baselineTask.baselineStart.getTime()) / (1000 * 60 * 60 * 24));

      return {
        taskId: currentTask.id,
        startVariance,
        endVariance,
        durationVariance
      };
    }).filter(Boolean);

    setVariances(newVariances);
  };

  const handleBaselineSelect = (baseline: Baseline | null) => {
    setActiveBaseline(baseline);
  };

  const handleShowBaselineChange = (show: boolean) => {
    setShowBaseline(show);
  };

  const handleOpenBaselineManager = () => {
    setShowBaselineManager(true);
  };

  const formatVariance = (variance: number) => {
    if (variance === 0) return '0 days';
    return `${variance > 0 ? '+' : ''}${variance} days`;
  };

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) <= 1) return 'text-gray-600';
    return variance > 0 ? 'text-red-600' : 'text-green-600';
  };

  const renderTimeline = () => {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Timeline Header */}
        <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Timeline with Baseline Comparison
            </h3>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {startDate.toLocaleDateString()} - {new Date('2024-08-31').toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="relative" style={{ height: `${(currentTasks.length + 1) * rowHeight + 60}px` }}>
          {/* Date Headers */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex">
            <div className="w-48 flex-shrink-0 border-r border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
              Task Name
            </div>
            <div className="flex-1 flex">
              {Array.from({ length: 8 }, (_, i) => {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + i);
                return (
                  <div
                    key={i}
                    className="flex-1 border-r border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400"
                    style={{ minWidth: `${dayWidth * 30}px` }}
                  >
                    {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Rows */}
          {currentTasks.map((task, index) => {
            const daysFromStart = Math.floor((task.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
            
            const left = daysFromStart * dayWidth;
            const width = Math.max(1, duration * dayWidth);
            const top = 60 + index * rowHeight;

            // Find baseline data for this task
            const baselineTask = baselineTasks.find(bt => bt.taskId === task.id);
            const variance = variances.find(v => v.taskId === task.id);

            return (
              <div key={task.id} className="absolute" style={{ top: `${top}px`, left: '0', right: '0' }}>
                {/* Task name */}
                <div className="absolute left-0 w-48 h-full flex items-center px-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="truncate">{task.name}</span>
                    {task.isMilestone && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    )}
                  </div>
                </div>

                {/* Baseline bar */}
                {showBaseline && baselineTask && (
                  <BaselineBar
                    taskId={task.id}
                    currentStart={task.startDate}
                    currentEnd={task.endDate}
                    baselineStart={baselineTask.baselineStart}
                    baselineEnd={baselineTask.baselineEnd}
                    width={Math.max(1, Math.ceil((baselineTask.baselineEnd.getTime() - baselineTask.baselineStart.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth)}
                    height={rowHeight - 8}
                    left={left + 192} // 192px for task name column
                    top={top}
                    isDemoMode={isDemoMode}
                  />
                )}

                {/* Current task bar */}
                <div
                  className={`absolute rounded transition-all duration-200 ${
                    task.percentComplete === 100 
                      ? 'bg-green-500 dark:bg-green-600' 
                      : task.percentComplete > 0 
                        ? 'bg-blue-500 dark:bg-blue-600' 
                        : 'bg-gray-400 dark:bg-gray-500'
                  }`}
                  style={{
                    left: `${left + 192}px`, // 192px for task name column
                    top: `${top + 4}px`,
                    width: `${width}px`,
                    height: `${rowHeight - 8}px`
                  }}
                >
                  {/* Progress overlay */}
                  {task.percentComplete > 0 && (
                    <div
                      className="absolute left-0 top-0 h-full bg-white bg-opacity-30 rounded transition-all duration-300"
                      style={{ width: `${task.percentComplete}%` }}
                    />
                  )}
                  
                  {/* Task label */}
                  <div className="absolute inset-0 flex items-center justify-center px-1">
                    <span className="text-xs font-medium text-white truncate">
                      {task.percentComplete > 0 ? `${task.percentComplete}%` : task.name}
                    </span>
                  </div>
                </div>

                {/* Variance indicator */}
                {variance && (variance.startVariance !== 0 || variance.endVariance !== 0) && (
                  <div
                    className="absolute top-0 right-0 transform translate-x-1 -translate-y-1"
                    style={{
                      left: `${left + 192 + width + 2}px`,
                      top: `${top + 2}px`
                    }}
                  >
                    <div className={`text-xs font-medium ${getVarianceColor(Math.max(variance.startVariance, variance.endVariance))}`}>
                      {variance.startVariance > 0 || variance.endVariance > 0 ? '🔴' : '🟢'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Variance Summary */}
        {showBaseline && variances.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Baseline Variance Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Start Variance:</span>
                <span className={`ml-1 font-medium ${getVarianceColor(variances.reduce((sum, v) => sum + v.startVariance, 0))}`}>
                  {formatVariance(variances.reduce((sum, v) => sum + v.startVariance, 0))}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">End Variance:</span>
                <span className={`ml-1 font-medium ${getVarianceColor(variances.reduce((sum, v) => sum + v.endVariance, 0))}`}>
                  {formatVariance(variances.reduce((sum, v) => sum + v.endVariance, 0))}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Duration Change:</span>
                <span className={`ml-1 font-medium ${getVarianceColor(variances.reduce((sum, v) => sum + v.durationVariance, 0))}`}>
                  {formatVariance(variances.reduce((sum, v) => sum + v.durationVariance, 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Baseline Management Demo
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Save, compare, and display original programme versions
            </p>
          </div>
          {isDemoMode && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs text-orange-700 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-400">
              <ExclamationTriangleIcon className="w-3 h-3" />
              <span>DEMO MODE</span>
            </div>
          )}
        </div>

        {/* Baseline Controls */}
        <BaselineRibbonControls
          projectId={projectId}
          showBaseline={showBaseline}
          onShowBaselineChange={handleShowBaselineChange}
          onBaselineSelect={handleBaselineSelect}
          onOpenBaselineManager={handleOpenBaselineManager}
          currentTasks={currentTasks}
        />
      </div>

      {/* Timeline */}
      {renderTimeline()}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          How to use Baseline Management:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Create Baseline:</strong> Click "Create Baseline" to save the current schedule as a snapshot</li>
          <li>• <strong>Select Baseline:</strong> Choose a baseline from the dropdown to compare with current schedule</li>
          <li>• <strong>Show/Hide:</strong> Toggle "Show Baseline" to display baseline bars below current task bars</li>
          <li>• <strong>Variance Analysis:</strong> View start, end, and duration variances in the summary below</li>
          <li>• <strong>Demo Limitations:</strong> Demo mode allows only 1 baseline per project with up to 10 tasks</li>
        </ul>
      </div>
    </div>
  );
};

export default BaselineDemo; 