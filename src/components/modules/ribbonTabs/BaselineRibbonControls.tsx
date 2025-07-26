import React, { useState, useEffect } from 'react';
import {
  BookmarkIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { demoModeService } from '../../../services/demoModeService';
import {
  baselineService,
  type Baseline,
} from '../../../services/baselineService';

interface BaselineRibbonControlsProps {
  currentTasks: Array<{
    endDate: Date;
    id: string;
    isMilestone?: boolean;
    name: string;
    parentId?: string;
    percentComplete?: number;
    startDate: Date;
  }>;
  onBaselineSelect: (baseline: Baseline | null) => void;
  onOpenBaselineManager: () => void;
  onShowBaselineChange: (show: boolean) => void;
  projectId: string;
  showBaseline: boolean;
}

const BaselineRibbonControls: React.FC<BaselineRibbonControlsProps> = ({
  projectId,
  showBaseline,
  onShowBaselineChange,
  onBaselineSelect,
  onOpenBaselineManager,
  currentTasks,
}) => {
  const { hasPermission } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [baselines, setBaselines] = useState<Baseline[]>([]);
  const [activeBaseline, setActiveBaseline] = useState<Baseline | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingBaseline, setCreatingBaseline] = useState(false);

  const canView = hasPermission('programme.baseline.view');
  const canCreate = hasPermission('programme.baseline.create');
  const canManage = hasPermission('programme.baseline.manage');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load baselines
  useEffect(() => {
    loadBaselines();
  }, [projectId]);

  const loadBaselines = async () => {
    try {
      setLoading(true);
      const projectBaselines =
        await baselineService.getBaselinesForProject(projectId);
      setBaselines(projectBaselines);

      // Find active baseline
      const active = projectBaselines.find(b => b.isActive);
      setActiveBaseline(active || null);
      onBaselineSelect(active || null);
    } catch (error) {
      console.error('Error loading baselines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBaselineSelect = (baseline: Baseline | null) => {
    setActiveBaseline(baseline);
    onBaselineSelect(baseline);
    setShowDropdown(false);
  };

  const handleCreateBaseline = async () => {
    if (isDemoMode && baselines.length >= 1) {
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
      setCreatingBaseline(true);

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
        await loadBaselines();
        alert(`Baseline "${baselineName}" created successfully!`);
      } else {
        alert('Failed to create baseline');
      }
    } catch (error) {
      console.error('Error creating baseline:', error);
      alert('Failed to create baseline');
    } finally {
      setCreatingBaseline(false);
    }
  };

  const handleToggleBaseline = () => {
    onShowBaselineChange(!showBaseline);
  };

  if (!canView) {
    return null;
  }

  return (
    <div className='flex items-center space-x-2'>
      {/* Create Baseline Button */}
      <button
        onClick={handleCreateBaseline}
        disabled={
          !canCreate ||
          creatingBaseline ||
          (isDemoMode && baselines.length >= 1)
        }
        className={`
          flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded transition-colors
          ${
            canCreate &&
            !creatingBaseline &&
            !(isDemoMode && baselines.length >= 1)
              ? 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/40'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
          }
        `}
        title={
          isDemoMode && baselines.length >= 1
            ? 'DEMO LIMIT: Maximum 1 baseline allowed'
            : 'Create new baseline'
        }
      >
        <PlusIcon className='w-3 h-3' />
        <span>Create Baseline</span>
        {creatingBaseline && (
          <div className='animate-spin w-3 h-3 border border-current border-t-transparent rounded-full' />
        )}
      </button>

      {/* Baseline Selector */}
      <div className='relative'>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={loading}
          className='flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
        >
          <BookmarkIcon className='w-3 h-3' />
          <span>
            {activeBaseline ? activeBaseline.name : 'Select Baseline'}
          </span>
          <ChevronDownIcon className='w-3 h-3' />
          {loading && (
            <div className='animate-spin w-3 h-3 border border-current border-t-transparent rounded-full' />
          )}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className='absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50'>
            <div className='p-2'>
              <div className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2'>
                Available Baselines
              </div>

              {baselines.length === 0 ? (
                <div className='text-xs text-gray-500 dark:text-gray-400 px-2 py-1'>
                  No baselines available
                </div>
              ) : (
                <div className='space-y-1'>
                  {baselines.map(baseline => (
                    <button
                      key={baseline.id}
                      onClick={() => handleBaselineSelect(baseline)}
                      className={`
                        w-full text-left px-2 py-1.5 text-xs rounded transition-colors
                        ${
                          activeBaseline?.id === baseline.id
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='truncate'>{baseline.name}</span>
                        {baseline.isActive && (
                          <div className='w-2 h-2 bg-green-500 rounded-full' />
                        )}
                      </div>
                      <div className='text-xs text-gray-500 dark:text-gray-400'>
                        {new Date(baseline.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className='border-t border-gray-200 dark:border-gray-700 mt-2 pt-2'>
                <button
                  onClick={() => handleBaselineSelect(null)}
                  className='w-full text-left px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors'
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
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
        <span>Show Baseline</span>
      </button>

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className='flex items-center space-x-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-400'>
          <ExclamationTriangleIcon className='w-3 h-3' />
          <span>DEMO MODE</span>
        </div>
      )}
    </div>
  );
};

export default BaselineRibbonControls;
