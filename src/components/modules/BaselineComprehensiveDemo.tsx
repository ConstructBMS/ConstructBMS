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
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { baselineService, type Baseline, type BaselineTask, type BaselineVariance } from '../../services/baselineService';
import BaselineBar from './BaselineBar';
import BaselineIntegration from './BaselineIntegration';
import { demoModeService } from '../../services/demoModeService';

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

// Simulated current tasks with some variance from baseline
const currentTasks = [
  {
    id: '1',
    name: 'Project Planning',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-20'), // +5 days delay
    percentComplete: 100,
    isMilestone: false,
    parentId: undefined
  },
  {
    id: '2',
    name: 'Requirements Analysis',
    startDate: new Date('2024-01-21'),
    endDate: new Date('2024-02-20'), // +5 days delay
    percentComplete: 75,
    isMilestone: false,
    parentId: undefined
  },
  {
    id: '3',
    name: 'System Design',
    startDate: new Date('2024-02-21'),
    endDate: new Date('2024-04-15'), // +15 days delay
    percentComplete: 50,
    isMilestone: false,
    parentId: undefined
  },
  {
    id: '4',
    name: 'Development Phase',
    startDate: new Date('2024-04-16'),
    endDate: new Date('2024-07-15'), // +15 days delay
    percentComplete: 25,
    isMilestone: false,
    parentId: undefined
  },
  {
    id: '5',
    name: 'Testing Phase',
    startDate: new Date('2024-07-16'),
    endDate: new Date('2024-08-30'), // +15 days delay
    percentComplete: 0,
    isMilestone: false,
    parentId: undefined
  },
  {
    id: '6',
    name: 'Deployment',
    startDate: new Date('2024-08-31'),
    endDate: new Date('2024-09-15'), // +15 days delay
    percentComplete: 0,
    isMilestone: true,
    parentId: undefined
  }
];

const BaselineComprehensiveDemo: React.FC = () => {
  const [currentTaskData, setCurrentTaskData] = useState(currentTasks);
  const [showBaseline, setShowBaseline] = useState(false);
  const [activeBaseline, setActiveBaseline] = useState<Baseline | null>(null);
  const [baselineTasks, setBaselineTasks] = useState<BaselineTask[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [variances, setVariances] = useState<BaselineVariance[]>([]);
  const [showVarianceDetails, setShowVarianceDetails] = useState(false);

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

  const calculateVariances = async () => {
    if (!activeBaseline || currentTaskData.length === 0) return;

    try {
      const varianceData = await baselineService.getVarianceForActiveBaseline(
        currentTaskData.map(task => ({
          id: task.id,
          start: task.startDate,
          end: task.endDate
        }))
      );
      setVariances(varianceData);
    } catch (error) {
      console.error('Error calculating variances:', error);
    }
  };

  const handleBaselineChange = (baseline: Baseline | null) => {
    setActiveBaseline(baseline);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatVariance = (variance: number) => {
    if (variance === 0) return '0 days';
    return `${variance > 0 ? '+' : ''}${variance} days`;
  };

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) <= 1) return 'text-gray-600 dark:text-gray-400';
    return variance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  };

  const getVarianceIcon = (variance: number) => {
    if (Math.abs(variance) <= 1) return null;
    return variance > 0 ? <ArrowTrendingDownIcon className="w-4 h-4" /> : <ArrowTrendingUpIcon className="w-4 h-4" />;
  };

  const renderTimeline = () => {
    return (
      <div className="relative" style={{ height: `${(currentTaskData.length + 1) * rowHeight + 60}px` }}>
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
        {currentTaskData.map((task, index) => {
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
                  {variance && Math.abs(variance.startVariance) > 1 && (
                    <div className={`flex items-center space-x-1 ${getVarianceColor(variance.startVariance)}`}>
                      {getVarianceIcon(variance.startVariance)}
                      <span className="text-xs">{formatVariance(variance.startVariance)}</span>
                    </div>
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
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {task.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderVarianceSummary = () => {
    if (variances.length === 0) return null;

    const onTimeTasks = variances.filter(v => Math.abs(v.startVariance) <= 1 && Math.abs(v.endVariance) <= 1).length;
    const delayedTasks = variances.filter(v => v.startVariance > 1 || v.endVariance > 1).length;
    const earlyTasks = variances.filter(v => v.startVariance < -1 || v.endVariance < -1).length;
    const totalDurationChange = variances.reduce((sum, v) => sum + v.durationVariance, 0);

    return (
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2" />
          Baseline Variance Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {onTimeTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">On Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {delayedTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Delayed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {earlyTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Early</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${totalDurationChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {totalDurationChange > 0 ? '+' : ''}{totalDurationChange}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Drift (days)</div>
          </div>
        </div>

        {/* Variance Details */}
        <div className="mt-4">
          <button
            onClick={() => setShowVarianceDetails(!showVarianceDetails)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showVarianceDetails ? 'Hide' : 'Show'} detailed variance analysis
          </button>
          
          {showVarianceDetails && (
            <div className="mt-3 space-y-2">
              {variances.map((variance) => {
                const task = currentTaskData.find(t => t.id === variance.taskId);
                const baselineTask = baselineTasks.find(bt => bt.taskId === variance.taskId);
                
                return (
                  <div key={variance.taskId} className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">{task?.name}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={getVarianceColor(variance.startVariance)}>
                          Start: {formatVariance(variance.startVariance)}
                        </span>
                        <span className={getVarianceColor(variance.endVariance)}>
                          End: {formatVariance(variance.endVariance)}
                        </span>
                        <span className={getVarianceColor(variance.durationVariance)}>
                          Duration: {formatVariance(variance.durationVariance)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Baseline: {baselineTask ? `${formatDate(baselineTask.baselineStart)} - ${formatDate(baselineTask.baselineEnd)}` : 'N/A'} | 
                      Current: {task ? `${formatDate(task.startDate)} - ${formatDate(task.endDate)}` : 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Baseline Management Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Store and show reference lines for original programme dates. Track slippage and compression over time.
        </p>
      </div>

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Demo Mode Active
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Limited to 1 baseline per project. All data is tagged as demo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Baseline Integration */}
      <BaselineIntegration
        projectId={projectId}
        currentTasks={currentTaskData}
        onBaselineChange={handleBaselineChange}
      >
        {/* Timeline */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Timeline with Baseline Comparison
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current schedule vs baseline dates. Hover over baseline bars for variance details.
            </p>
          </div>
          <div className="p-4">
            {renderTimeline()}
          </div>
        </div>

        {/* Variance Summary */}
        {renderVarianceSummary()}
      </BaselineIntegration>

      {/* Feature Overview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <BookmarkIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Set Baseline</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Capture current task dates as a reference baseline for future comparison.
          </p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <EyeIcon className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Visual Comparison</h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            See baseline bars beneath live tasks to instantly identify schedule changes.
          </p>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
          <ChartBarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Variance Analysis</h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Detailed analysis of start, end, and duration variances with color coding.
          </p>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
          <ClockIcon className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
          <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Multiple Baselines</h3>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Manage multiple baselines per project for different approval stages.
          </p>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400 mb-3" />
          <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Demo Restrictions</h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            Demo mode limits: 1 baseline per project, 10 tasks per baseline.
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <InformationCircleIcon className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Permissions</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Role-based access: view, create, and manage baselines with proper permissions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BaselineComprehensiveDemo; 