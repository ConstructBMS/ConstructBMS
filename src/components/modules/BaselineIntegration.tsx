import React, { useState, useEffect, useCallback } from 'react';
import {
  BookmarkIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  baselineService,
  type Baseline,
  type BaselineTask,
  type BaselineVariance,
} from '../../services/baselineService';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../../services/demoModeService';
import BaselineBar from './BaselineBar';
import BaselineManagerModal from './BaselineManagerModal';

interface BaselineIntegrationProps {
  children: React.ReactNode;
  currentTasks: Array<{
    endDate: Date;
    id: string;
    isMilestone?: boolean;
    name: string;
    parentId?: string;
    percentComplete?: number;
    startDate: Date;
  }>;
  onBaselineChange?: (baseline: Baseline | null) => void;
  projectId: string;
}

const BaselineIntegration: React.FC<BaselineIntegrationProps> = ({
  projectId,
  currentTasks,
  onBaselineChange,
  children,
}) => {
  const { hasPermission } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);
  const [activeBaseline, setActiveBaseline] = useState<Baseline | null>(null);
  const [baselineTasks, setBaselineTasks] = useState<BaselineTask[]>([]);
  const [variances, setVariances] = useState<BaselineVariance[]>([]);
  const [showBaselineManager, setShowBaselineManager] = useState(false);
  const [loading, setLoading] = useState(false);

  const canView = hasPermission('programme.baseline.view');
  const canCreate = hasPermission('programme.baseline.create');
  const canManage = hasPermission('programme.baseline.manage');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load baseline data when project changes
  useEffect(() => {
    if (projectId) {
      loadBaselineData();
    }
  }, [projectId]);

  // Load baseline tasks when active baseline changes
  useEffect(() => {
    if (activeBaseline) {
      loadBaselineTasks(activeBaseline.id);
      calculateVariances();
    } else {
      setBaselineTasks([]);
      setVariances([]);
    }
  }, [activeBaseline, currentTasks]);

  const loadBaselineData = async () => {
    try {
      setLoading(true);
      const projectBaselines =
        await baselineService.getBaselinesForProject(projectId);
      const active = projectBaselines.find(b => b.isActive);
      setActiveBaseline(active || null);
      onBaselineChange?.(active || null);
    } catch (error) {
      console.error('Error loading baseline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBaselineTasks = async (baselineId: string) => {
    try {
      const tasks = await baselineService.getBaselineTasks(baselineId);
      setBaselineTasks(tasks);
    } catch (error) {
      console.error('Error loading baseline tasks:', error);
    }
  };

  const calculateVariances = async () => {
    if (!activeBaseline || currentTasks.length === 0) return;

    try {
      const varianceData = await baselineService.getVarianceForActiveBaseline(
        currentTasks.map(task => ({
          id: task.id,
          start: task.startDate,
          end: task.endDate,
        }))
      );
      setVariances(varianceData);
    } catch (error) {
      console.error('Error calculating variances:', error);
    }
  };

  const handleCreateBaseline = async () => {
    if (isDemoMode && activeBaseline) {
      alert('DEMO LIMIT: Maximum 1 baseline allowed in demo mode');
      return;
    }

    if (!canCreate) {
      alert('You do not have permission to create baselines');
      return;
    }

    const baselineName = prompt('Enter baseline name:');
    if (!baselineName?.trim()) return;

    try {
      setLoading(true);

      const baseline = await baselineService.createBaseline(
        projectId,
        baselineName.trim(),
        currentTasks.map(task => ({
          id: task.id,
          start: task.startDate,
          end: task.endDate,
          percentComplete: task.percentComplete || 0,
          isMilestone: task.isMilestone || false,
          parentId: task.parentId,
          name: task.name,
        }))
      );

      if (baseline) {
        await loadBaselineData();
        alert(`Baseline "${baselineName}" created successfully!`);
      } else {
        alert('Failed to create baseline');
      }
    } catch (error) {
      console.error('Error creating baseline:', error);
      alert('Failed to create baseline');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBaseline = () => {
    setShowBaseline(!showBaseline);
  };

  const handleBaselineSelect = (baseline: Baseline | null) => {
    setActiveBaseline(baseline);
    onBaselineChange?.(baseline);
  };

  const handleOpenBaselineManager = () => {
    setShowBaselineManager(true);
  };

  const handleBaselineManagerClose = () => {
    setShowBaselineManager(false);
    loadBaselineData(); // Refresh data when modal closes
  };

  // Render baseline bars for tasks
  const renderBaselineBars = useCallback(() => {
    if (!showBaseline || !activeBaseline || baselineTasks.length === 0) {
      return null;
    }

    return baselineTasks.map(baselineTask => {
      const currentTask = currentTasks.find(t => t.id === baselineTask.taskId);
      if (!currentTask) return null;

      const variance = variances.find(v => v.taskId === baselineTask.taskId);

      return (
        <BaselineBar
          key={`baseline-${baselineTask.taskId}`}
          taskId={baselineTask.taskId}
          currentStart={currentTask.startDate}
          currentEnd={currentTask.endDate}
          baselineStart={baselineTask.baselineStart}
          baselineEnd={baselineTask.baselineEnd}
          width={Math.max(
            1,
            Math.ceil(
              (baselineTask.baselineEnd.getTime() -
                baselineTask.baselineStart.getTime()) /
                (1000 * 60 * 60 * 24)
            ) * 20
          )}
          height={32}
          left={0}
          top={0}
          isDemoMode={isDemoMode}
        />
      );
    });
  }, [
    showBaseline,
    activeBaseline,
    baselineTasks,
    currentTasks,
    variances,
    isDemoMode,
  ]);

  if (!canView) {
    return <>{children}</>;
  }

  return (
    <div className='relative'>
      {/* Baseline Controls */}
      <div className='flex items-center space-x-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
        {/* Create Baseline Button */}
        <button
          onClick={handleCreateBaseline}
          disabled={!canCreate || loading || (isDemoMode && activeBaseline)}
          className={`
            flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded transition-colors
            ${
              canCreate && !loading && !(isDemoMode && activeBaseline)
                ? 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/40'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            }
          `}
          title={
            isDemoMode && activeBaseline
              ? 'DEMO LIMIT: Maximum 1 baseline allowed'
              : 'Create new baseline'
          }
        >
          <PlusIcon className='w-3 h-3' />
          <span>Set Baseline</span>
          {loading && (
            <div className='animate-spin w-3 h-3 border border-current border-t-transparent rounded-full' />
          )}
        </button>

        {/* Baseline Selector */}
        <div className='relative'>
          <button
            onClick={handleOpenBaselineManager}
            disabled={loading}
            className='flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
          >
            <BookmarkIcon className='w-3 h-3' />
            <span>
              {activeBaseline ? activeBaseline.name : 'Manage Baselines'}
            </span>
            <ChevronDownIcon className='w-3 h-3' />
          </button>
        </div>

        {/* Show/Hide Baseline Toggle */}
        <button
          onClick={handleToggleBaseline}
          disabled={!activeBaseline}
          className={`
            flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded transition-colors
            ${
              activeBaseline
                ? showBaseline
                  ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/40'
                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            }
          `}
          title={
            activeBaseline
              ? showBaseline
                ? 'Hide baseline bars'
                : 'Show baseline bars'
              : 'No baseline selected'
          }
        >
          {showBaseline ? (
            <EyeSlashIcon className='w-3 h-3' />
          ) : (
            <EyeIcon className='w-3 h-3' />
          )}
          <span>Toggle Baseline View</span>
        </button>

        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className='flex items-center space-x-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-400'>
            <ExclamationTriangleIcon className='w-3 h-3' />
            <span>DEMO MODE</span>
          </div>
        )}

        {/* Baseline Status */}
        {activeBaseline && (
          <div className='flex items-center space-x-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'>
            <ClockIcon className='w-3 h-3' />
            <span>Active: {activeBaseline.name}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className='relative'>
        {children}

        {/* Baseline Bars Overlay */}
        {renderBaselineBars()}
      </div>

      {/* Baseline Manager Modal */}
      <BaselineManagerModal
        isOpen={showBaselineManager}
        onClose={handleBaselineManagerClose}
        projectId={projectId}
        currentTasks={currentTasks}
        onBaselineChange={handleBaselineSelect}
      />
    </div>
  );
};

export default BaselineIntegration;
