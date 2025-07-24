import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { baselineService, Baseline, BaselineComparison } from '../services/baselineService';

interface BaselineManagerModalProps {
  currentTasks: Array<{
    duration: number;
    endDate: Date;
    id: string;
    name: string;
    startDate: Date;
  }>;
  isOpen: boolean;
  onBaselineChange?: (baseline: Baseline | null) => void;
  onClose: () => void;
  projectId: string;
}

interface CreateBaselineFormData {
  name: string;
}

const BaselineManagerModal: React.FC<BaselineManagerModalProps> = ({
  isOpen,
  onClose,
  projectId,
  currentTasks,
  onBaselineChange
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [baselines, setBaselines] = useState<Baseline[]>([]);
  const [activeBaseline, setActiveBaseline] = useState<Baseline | null>(null);
  const [baselineComparison, setBaselineComparison] = useState<BaselineComparison | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateBaselineFormData>({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canView = canAccess('programme.baseline.view');
  const canCreate = canAccess('programme.baseline.create');
  const canManage = canAccess('programme.baseline.manage');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load baselines and comparison data
  useEffect(() => {
    if (isOpen) {
      loadBaselines();
    }
  }, [isOpen, projectId]);

  // Calculate baseline comparison when active baseline changes
  useEffect(() => {
    if (activeBaseline && currentTasks.length > 0) {
      calculateBaselineComparison();
    }
  }, [activeBaseline, currentTasks]);

  const loadBaselines = async () => {
    try {
      setLoading(true);
      const [projectBaselines, active] = await Promise.all([
        baselineService.getProjectBaselines(projectId),
        baselineService.getActiveBaseline(projectId)
      ]);
      setBaselines(projectBaselines);
      setActiveBaseline(active);
    } catch (error) {
      console.error('Error loading baselines:', error);
      setError('Failed to load baselines');
    } finally {
      setLoading(false);
    }
  };

  const calculateBaselineComparison = async () => {
    try {
      const comparison = await baselineService.calculateBaselineDeltas(projectId, currentTasks);
      setBaselineComparison(comparison);
    } catch (error) {
      console.error('Error calculating baseline comparison:', error);
    }
  };

  const handleCreateBaseline = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await baselineService.createBaseline({
        projectId,
        name: formData.name.trim() || undefined,
        tasks: currentTasks
      });

      if (result.success && result.baseline) {
        setBaselines(prev => [...prev, result.baseline!]);
        setActiveBaseline(result.baseline);
        setFormData({ name: '' });
        setShowCreateForm(false);
        onBaselineChange?.(result.baseline);
      } else {
        setError(result.error || 'Failed to create baseline');
      }
    } catch (error) {
      console.error('Error creating baseline:', error);
      setError('Failed to create baseline');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActiveBaseline = async (baselineId: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await baselineService.setBaselineActive(baselineId);
      if (result.success) {
        const baseline = baselines.find(b => b.id === baselineId);
        setActiveBaseline(baseline || null);
        onBaselineChange?.(baseline || null);
      } else {
        setError(result.error || 'Failed to set baseline active');
      }
    } catch (error) {
      console.error('Error setting baseline active:', error);
      setError('Failed to set baseline active');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBaseline = async (baselineId: string) => {
    if (!confirm('Are you sure you want to delete this baseline? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await baselineService.deleteBaseline(baselineId);
      if (result.success) {
        setBaselines(prev => prev.filter(b => b.id !== baselineId));
        if (activeBaseline?.id === baselineId) {
          setActiveBaseline(null);
          onBaselineChange?.(null);
        }
      } else {
        setError(result.error || 'Failed to delete baseline');
      }
    } catch (error) {
      console.error('Error deleting baseline:', error);
      setError('Failed to delete baseline');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setFormData({ name: '' });
    setError(null);
  };

  const getDefaultBaselineName = (): string => {
    return `Baseline ${new Date().toLocaleDateString()}`;
  };

  if (!isOpen || !canView) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Baseline Manager
            </h2>
            {isDemoMode && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-md font-medium">
                DEMO MODE
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Create Baseline Form */}
          {showCreateForm && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
                Create New Baseline
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Baseline Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={getDefaultBaselineName()}
                    className="w-full p-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={loading}
                  />
                </div>

                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p>This will create a snapshot of {currentTasks.length} current tasks.</p>
                  {isDemoMode && (
                    <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                      Demo mode: Only first {3} tasks will be included
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCreateBaseline}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? 'Creating...' : 'Create Baseline'}
                  </button>
                  <button
                    onClick={handleCancelCreate}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Baselines List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Project Baselines ({baselines.length})
              </h3>
              {canCreate && !showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={isDemoMode && baselines.length >= 1}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create Baseline</span>
                </button>
              )}
            </div>

            {loading && !baselines.length ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading baselines...</p>
              </div>
            ) : baselines.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No baselines created yet</p>
                {canCreate && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Create your first baseline to start tracking changes
                  </p>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {baselines.map(baseline => (
                  <div
                    key={baseline.id}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      baseline.isActive
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {baseline.name}
                            {isDemoMode && baseline.demo && (
                              <span className="ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                                DEMO
                              </span>
                            )}
                          </h4>
                          {baseline.isActive && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Created {baseline.createdAt.toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!baseline.isActive && canManage && (
                          <button
                            onClick={() => handleSetActiveBaseline(baseline.id)}
                            disabled={loading}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            title="Set as active baseline"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => handleDeleteBaseline(baseline.id)}
                            disabled={loading || (isDemoMode && !baseline.demo)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            title="Delete baseline"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Baseline Comparison Summary */}
          {baselineComparison && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Comparison Summary
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {baselineComparison.onTimeTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">On Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {baselineComparison.delayedTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Delayed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {baselineComparison.earlyTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Early</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {baselineComparison.totalDurationChange > 0 ? '+' : ''}{baselineComparison.totalDurationChange}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Drift (days)</div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Mode Restrictions */}
          {isDemoMode && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start space-x-2">
                <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Demo Mode Restrictions:</p>
                  <ul className="mt-1 space-y-1">
                    {baselineService.getDemoModeRestrictions().map((restriction, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                        <span>{restriction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaselineManagerModal; 