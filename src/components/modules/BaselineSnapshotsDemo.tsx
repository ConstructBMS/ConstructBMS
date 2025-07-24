import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { baselineService, type Baseline, type BaselineVariance } from '../../services/baselineService';
import BaselineBar from './BaselineBar';
import BaselineModal from './BaselineModal';
import { toastService } from './ToastNotification';

// Sample task data
const sampleTasks = [
  {
    id: '1',
    name: 'Project Planning',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-15'),
    progress: 100,
    status: 'completed'
  },
  {
    id: '2',
    name: 'Requirements Analysis',
    start: new Date('2024-01-16'),
    end: new Date('2024-02-15'),
    progress: 75,
    status: 'in_progress'
  },
  {
    id: '3',
    name: 'System Design',
    start: new Date('2024-02-16'),
    end: new Date('2024-03-31'),
    progress: 50,
    status: 'in_progress'
  },
  {
    id: '4',
    name: 'Development Phase',
    start: new Date('2024-04-01'),
    end: new Date('2024-06-30'),
    progress: 25,
    status: 'in_progress'
  },
  {
    id: '5',
    name: 'Testing Phase',
    start: new Date('2024-07-01'),
    end: new Date('2024-08-15'),
    progress: 0,
    status: 'not_started'
  },
  {
    id: '6',
    name: 'Deployment',
    start: new Date('2024-08-16'),
    end: new Date('2024-08-31'),
    progress: 0,
    status: 'not_started'
  }
];

// Simulated current tasks with some variance from baseline
const currentTasks = [
  {
    id: '1',
    name: 'Project Planning',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-20'), // +5 days delay
    progress: 100,
    status: 'completed'
  },
  {
    id: '2',
    name: 'Requirements Analysis',
    start: new Date('2024-01-21'),
    end: new Date('2024-02-20'), // +5 days delay
    progress: 75,
    status: 'in_progress'
  },
  {
    id: '3',
    name: 'System Design',
    start: new Date('2024-02-21'),
    end: new Date('2024-04-15'), // +15 days delay
    progress: 50,
    status: 'in_progress'
  },
  {
    id: '4',
    name: 'Development Phase',
    start: new Date('2024-04-16'),
    end: new Date('2024-07-15'), // +15 days delay
    progress: 25,
    status: 'in_progress'
  },
  {
    id: '5',
    name: 'Testing Phase',
    start: new Date('2024-07-16'),
    end: new Date('2024-08-30'), // +15 days delay
    progress: 0,
    status: 'not_started'
  },
  {
    id: '6',
    name: 'Deployment',
    start: new Date('2024-08-31'),
    end: new Date('2024-09-15'), // +15 days delay
    progress: 0,
    status: 'not_started'
  }
];

const BaselineSnapshotsDemo: React.FC = () => {
  const [baselines, setBaselines] = useState<Baseline[]>([]);
  const [activeBaseline, setActiveBaseline] = useState<Baseline | null>(null);
  const [showBaselineBars, setShowBaselineBars] = useState(true);
  const [comparisonMode, setComparisonMode] = useState<'bars' | 'variance' | 'delta'>('bars');
  const [isDemoMode, setIsDemoMode] = useState(baselineService.isInDemoMode());
  const [showBaselineModal, setShowBaselineModal] = useState(false);
  const [variances, setVariances] = useState<BaselineVariance[]>([]);

  // Load baselines on mount
  useEffect(() => {
    loadBaselines();
  }, []);

  // Load baselines and calculate variances
  const loadBaselines = async () => {
    const projectBaselines = await baselineService.getBaselinesForProject('demo-project');
    setBaselines(projectBaselines);
    setIsDemoMode(baselineService.isInDemoMode());
    
    const active = projectBaselines.find(b => b.isActive);
    setActiveBaseline(active || null);
    
    if (active) {
      const varianceData = await baselineService.getVarianceForActiveBaseline(
        currentTasks.map(task => ({
          id: task.id,
          start: task.start,
          end: task.end
        }))
      );
      setVariances(varianceData);
    }
  };

  // Handle baseline change
  const handleBaselineChange = () => {
    loadBaselines();
  };

  // Toggle baseline bars visibility
  const toggleBaselineBars = () => {
    setShowBaselineBars(!showBaselineBars);
    baselineService.updatePreferences({ showBaselineBars: !showBaselineBars });
  };

  // Get demo mode configuration
  const demoConfig = baselineService.getDemoModeConfig();

  // Calculate variance statistics
  const calculateVarianceStats = () => {
    if (variances.length === 0) return null;

    const totalStartVariance = variances.reduce((sum, v) => sum + v.startVariance, 0);
    const totalEndVariance = variances.reduce((sum, v) => sum + v.endVariance, 0);
    const totalDurationVariance = variances.reduce((sum, v) => sum + v.durationVariance, 0);
    
    const delayedTasks = variances.filter(v => v.startVariance > 0 || v.endVariance > 0).length;
    const earlyTasks = variances.filter(v => v.startVariance < 0 || v.endVariance < 0).length;
    const onTimeTasks = variances.filter(v => Math.abs(v.startVariance) <= 1 && Math.abs(v.endVariance) <= 1).length;

    return {
      totalStartVariance,
      totalEndVariance,
      totalDurationVariance,
      delayedTasks,
      earlyTasks,
      onTimeTasks,
      averageStartVariance: totalStartVariance / variances.length,
      averageEndVariance: totalEndVariance / variances.length,
      averageDurationVariance: totalDurationVariance / variances.length
    };
  };

  const varianceStats = calculateVarianceStats();

  // Render timeline with baseline bars
  const renderTimeline = () => {
    const dayWidth = 20; // 20px per day
    const rowHeight = 40;
    const startDate = new Date('2024-01-01');

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Timeline Header */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Timeline with Baseline Comparison
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleBaselineBars}
                className={`flex items-center px-3 py-1 rounded text-sm ${
                  showBaselineBars
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {showBaselineBars ? (
                  <EyeIcon className="w-4 h-4 mr-1" />
                ) : (
                  <EyeSlashIcon className="w-4 h-4 mr-1" />
                )}
                {showBaselineBars ? 'Hide' : 'Show'} Baseline
              </button>
              
              <select
                value={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
              >
                <option value="bars">Bars</option>
                <option value="variance">Variance %</option>
                <option value="delta">Delta Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="relative" style={{ height: `${currentTasks.length * rowHeight + 60}px` }}>
          {/* Date labels */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex h-full">
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + i);
                return (
                  <div
                    key={i}
                    className="flex-1 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700"
                  >
                    {date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task rows */}
          {currentTasks.map((task, index) => {
            const daysFromStart = Math.floor((task.start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const duration = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));
            
            const left = daysFromStart * dayWidth;
            const width = Math.max(1, duration * dayWidth);
            const top = 60 + index * rowHeight;

            // Find baseline data for this task
            const baselineTask = sampleTasks.find(t => t.id === task.id);
            const variance = variances.find(v => v.taskId === task.id);

            return (
              <div key={task.id} className="absolute" style={{ top: `${top}px`, left: '0', right: '0' }}>
                {/* Task name */}
                <div className="absolute left-0 w-48 h-full flex items-center px-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                  {task.name}
                </div>

                {/* Baseline bar */}
                {showBaselineBars && baselineTask && (
                  <BaselineBar
                    taskId={task.id}
                    currentStart={task.start}
                    currentEnd={task.end}
                    baselineStart={baselineTask.start}
                    baselineEnd={baselineTask.end}
                    width={Math.max(1, Math.ceil((baselineTask.end.getTime() - baselineTask.start.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth)}
                    height={rowHeight - 8}
                    left={left + 192} // 192px for task name column
                    top={top}
                    isDemoMode={isDemoMode}
                  />
                )}

                {/* Current task bar */}
                <div
                  className="absolute bg-blue-600 rounded transition-all duration-200"
                  style={{
                    left: `${left + 192}px`,
                    top: `${top + 4}px`,
                    width: `${width}px`,
                    height: `${rowHeight - 8}px`
                  }}
                />

                {/* Variance indicator */}
                {variance && (variance.startVariance !== 0 || variance.endVariance !== 0) && (
                  <div
                    className="absolute text-xs font-medium px-1 rounded"
                    style={{
                      left: `${left + 192 + width + 4}px`,
                      top: `${top + 8}px`,
                      color: variance.startVariance > 0 || variance.endVariance > 0 ? '#dc2626' : '#16a34a',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    {variance.startVariance > 0 || variance.endVariance > 0 ? '+' : ''}
                    {Math.max(variance.startVariance, variance.endVariance)}d
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CalendarIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Baseline Snapshots Demo
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Demo Mode Toggle */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isDemoMode 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            {isDemoMode ? 'Demo Mode' : 'Normal Mode'}
          </button>

          {/* Create Baseline Button */}
          <button
            onClick={() => setShowBaselineModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Manage Baselines
          </button>
        </div>
      </div>

      {/* Demo Info */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
            Demo Mode Active
          </h3>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Maximum baselines per project: {demoConfig.maxBaselinesPerProject}</li>
            <li>• Maximum tasks per baseline: {demoConfig.maxTasksPerBaseline}</li>
            <li>• Tooltip message: "{demoConfig.tooltipMessage}"</li>
            <li>• All data tagged: {demoConfig.baselineStateTag}</li>
            <li>• Bars non-interactive in demo mode</li>
          </ul>
        </div>
      )}

      {/* Baseline Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Baseline Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Active Baseline
            </label>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {activeBaseline ? activeBaseline.name : 'None'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {activeBaseline ? `${baselines.length} total baselines` : 'No baseline selected'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tasks with Variance
            </label>
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
              {variances.filter(v => v.startVariance !== 0 || v.endVariance !== 0).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              out of {currentTasks.length} tasks
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Average Delay
            </label>
            <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              {varianceStats ? Math.round(varianceStats.averageEndVariance) : 0} days
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {varianceStats && varianceStats.averageEndVariance > 0 ? 'Behind schedule' : 'On schedule'}
            </div>
          </div>
        </div>
      </div>

      {/* Variance Statistics */}
      {varianceStats && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Variance Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delayed Tasks
              </label>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {varianceStats.delayedTasks}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Behind schedule
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Early Tasks
              </label>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {varianceStats.earlyTasks}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Ahead of schedule
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                On Time Tasks
              </label>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {varianceStats.onTimeTasks}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Within ±1 day
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Delay
              </label>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {varianceStats.totalEndVariance} days
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Cumulative variance
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Timeline Comparison
        </h2>
        {renderTimeline()}
      </div>

      {/* Variance Details */}
      {variances.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Variance Details
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Task</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Start Variance</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">End Variance</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Duration Variance</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {variances.map((variance) => {
                  const task = currentTasks.find(t => t.id === variance.taskId);
                  const isDelayed = variance.startVariance > 0 || variance.endVariance > 0;
                  const isEarly = variance.startVariance < 0 || variance.endVariance < 0;
                  
                  return (
                    <tr key={variance.taskId} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                        {task?.name || 'Unknown Task'}
                      </td>
                      <td className={`px-4 py-2 text-sm ${variance.startVariance > 0 ? 'text-red-600 dark:text-red-400' : variance.startVariance < 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {variance.startVariance > 0 ? '+' : ''}{variance.startVariance} days
                      </td>
                      <td className={`px-4 py-2 text-sm ${variance.endVariance > 0 ? 'text-red-600 dark:text-red-400' : variance.endVariance < 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {variance.endVariance > 0 ? '+' : ''}{variance.endVariance} days
                      </td>
                      <td className={`px-4 py-2 text-sm ${variance.durationVariance > 0 ? 'text-red-600 dark:text-red-400' : variance.durationVariance < 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {variance.durationVariance > 0 ? '+' : ''}{variance.durationVariance} days
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          isDelayed ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          isEarly ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {isDelayed ? 'Delayed' : isEarly ? 'Early' : 'On Time'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Baseline Features */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Baseline Features
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Create baseline snapshots of task start/end dates</li>
          <li>• Compare current dates to baseline with visual variance bars</li>
          <li>• Multiple named baselines per project with active selection</li>
          <li>• Supabase persistence for all baseline data</li>
          <li>• Demo mode support with limitations and restrictions</li>
          <li>• Grey baseline bars drawn behind task bars with offset</li>
          <li>• Variance tooltips showing start, end, and duration differences</li>
          <li>• Color-coded indicators for delays (red) and early completion (green)</li>
          <li>• Comprehensive variance statistics and reporting</li>
          <li>• Toggle controls for baseline visibility and comparison modes</li>
        </ul>
      </div>

      {/* Baseline Modal */}
      <BaselineModal
        isOpen={showBaselineModal}
        onClose={() => setShowBaselineModal(false)}
        projectId="demo-project"
        currentTasks={currentTasks}
        onBaselineChange={handleBaselineChange}
      />
    </div>
  );
};

export default BaselineSnapshotsDemo; 