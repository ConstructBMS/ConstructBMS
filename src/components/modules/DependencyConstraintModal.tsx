import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, PencilIcon, TrashIcon, LinkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { dependencyConstraintsService, TaskDependency, ConstraintViolation } from '../services/dependencyConstraintsService';

interface DependencyConstraintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDependenciesChange?: (dependencies: TaskDependency[]) => void;
  projectId: string;
  tasks: Array<{ endDate: Date, id: string; name: string; startDate: Date; }>;
}

interface DependencyFormData {
  lag: number;
  sourceTaskId: string;
  targetTaskId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
}

const DependencyConstraintModal: React.FC<DependencyConstraintModalProps> = ({
  isOpen,
  onClose,
  projectId,
  tasks,
  onDependenciesChange
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [violations, setViolations] = useState<ConstraintViolation[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDependency, setEditingDependency] = useState<TaskDependency | null>(null);
  const [formData, setFormData] = useState<DependencyFormData>({
    sourceTaskId: '',
    targetTaskId: '',
    type: 'FS',
    lag: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enforceConstraints, setEnforceConstraints] = useState(false);

  const canEdit = canAccess('programme.task.edit');
  const canToggleEnforcement = canAccess('programme.settings.toggle');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load dependencies and check violations
  useEffect(() => {
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen, projectId]);

  // Check violations when dependencies or tasks change
  useEffect(() => {
    if (dependencies.length > 0 && tasks.length > 0) {
      checkViolations();
    }
  }, [dependencies, tasks, enforceConstraints]);

  const loadDependencies = async () => {
    try {
      setLoading(true);
      const deps = await dependencyConstraintsService.getProjectDependencies(projectId);
      setDependencies(deps);
    } catch (error) {
      console.error('Error loading dependencies:', error);
      setError('Failed to load dependencies');
    } finally {
      setLoading(false);
    }
  };

  const checkViolations = async () => {
    try {
      const taskSchedules = tasks.map(task => ({
        id: task.id,
        startDate: task.startDate,
        endDate: task.endDate,
        duration: Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24))
      }));
      
      const violations = await dependencyConstraintsService.checkConstraintViolations(
        taskSchedules,
        dependencies,
        enforceConstraints
      );
      setViolations(violations);
    } catch (error) {
      console.error('Error checking violations:', error);
    }
  };

  const handleCreateDependency = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await dependencyConstraintsService.createDependency({
        sourceTaskId: formData.sourceTaskId,
        targetTaskId: formData.targetTaskId,
        type: formData.type,
        lag: formData.lag,
        projectId
      });

      if (result.success && result.dependency) {
        setDependencies(prev => [...prev, result.dependency!]);
        setFormData({
          sourceTaskId: '',
          targetTaskId: '',
          type: 'FS',
          lag: 0
        });
        setShowCreateForm(false);
        onDependenciesChange?.(dependencies);
      } else {
        setError(result.error || 'Failed to create dependency');
      }
    } catch (error) {
      console.error('Error creating dependency:', error);
      setError('Failed to create dependency');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDependency = async () => {
    if (!editingDependency) return;

    try {
      setLoading(true);
      setError(null);

      const result = await dependencyConstraintsService.updateDependency(editingDependency.id, {
        type: formData.type,
        lag: formData.lag
      });

      if (result.success && result.dependency) {
        setDependencies(prev => prev.map(dep => 
          dep.id === editingDependency.id ? result.dependency! : dep
        ));
        setFormData({
          sourceTaskId: '',
          targetTaskId: '',
          type: 'FS',
          lag: 0
        });
        setEditingDependency(null);
        onDependenciesChange?.(dependencies);
      } else {
        setError(result.error || 'Failed to update dependency');
      }
    } catch (error) {
      console.error('Error updating dependency:', error);
      setError('Failed to update dependency');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDependency = async (dependencyId: string) => {
    if (!confirm('Are you sure you want to delete this dependency?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await dependencyConstraintsService.deleteDependency(dependencyId);

      if (result.success) {
        setDependencies(prev => prev.filter(dep => dep.id !== dependencyId));
        onDependenciesChange?.(dependencies);
      } else {
        setError(result.error || 'Failed to delete dependency');
      }
    } catch (error) {
      console.error('Error deleting dependency:', error);
      setError('Failed to delete dependency');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDependency = (dependency: TaskDependency) => {
    setEditingDependency(dependency);
    setFormData({
      sourceTaskId: dependency.sourceTaskId,
      targetTaskId: dependency.targetTaskId,
      type: dependency.type,
      lag: dependency.lag
    });
  };

  const handleCancelEdit = () => {
    setEditingDependency(null);
    setFormData({
      sourceTaskId: '',
      targetTaskId: '',
      type: 'FS',
      lag: 0
    });
    setShowCreateForm(false);
    setError(null);
  };

  const getTaskName = (taskId: string): string => {
    return tasks.find(task => task.id === taskId)?.name || 'Unknown Task';
  };

  const getViolationForDependency = (dependencyId: string): ConstraintViolation | undefined => {
    return violations.find(v => v.dependencyId === dependencyId);
  };

  if (!isOpen || !canEdit) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Dependency Constraints
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

          {/* Constraint Enforcement Toggle */}
          {canToggleEnforcement && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                    Constraint Enforcement
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Automatically correct constraint violations when tasks are modified
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enforceConstraints}
                    onChange={(e) => setEnforceConstraints(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Create/Edit Form */}
          {(showCreateForm || editingDependency) && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingDependency ? 'Edit Dependency' : 'Create New Dependency'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source Task (Predecessor)
                  </label>
                  <select
                    value={formData.sourceTaskId}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceTaskId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={loading || !!editingDependency}
                  >
                    <option value="">Select source task</option>
                    {tasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Task (Successor)
                  </label>
                  <select
                    value={formData.targetTaskId}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetTaskId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={loading || !!editingDependency}
                  >
                    <option value="">Select target task</option>
                    {tasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Constraint Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={loading || (isDemoMode && !['FS', 'SS'].includes(formData.type))}
                  >
                    <option value="FS">FS - Finish to Start</option>
                    <option value="SS">SS - Start to Start</option>
                    {!isDemoMode && (
                      <>
                        <option value="FF">FF - Finish to Finish</option>
                        <option value="SF">SF - Start to Finish</option>
                      </>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {dependencyConstraintsService.getConstraintTypeDescription(formData.type)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lag/Lead (days)
                  </label>
                  <input
                    type="number"
                    value={formData.lag}
                    onChange={(e) => setFormData(prev => ({ ...prev, lag: parseInt(e.target.value) || 0 }))}
                    min={isDemoMode ? 0 : -30}
                    max={isDemoMode ? 2 : 30}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Positive = lag (delay), Negative = lead (overlap)
                    {isDemoMode && ` (Demo: 0-${2} days only)`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <button
                  onClick={editingDependency ? handleUpdateDependency : handleCreateDependency}
                  disabled={loading || !formData.sourceTaskId || !formData.targetTaskId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Saving...' : (editingDependency ? 'Update Dependency' : 'Create Dependency')}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Dependencies List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Project Dependencies ({dependencies.length})
              </h3>
              {!showCreateForm && !editingDependency && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={isDemoMode && dependencies.length >= 3}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Dependency</span>
                </button>
              )}
            </div>

            {loading && !dependencies.length ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading dependencies...</p>
              </div>
            ) : dependencies.length === 0 ? (
              <div className="text-center py-8">
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No dependencies created yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Create dependencies to establish task relationships
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {dependencies.map(dependency => {
                  const violation = getViolationForDependency(dependency.id);
                  return (
                    <div
                      key={dependency.id}
                      className={`p-4 border rounded-lg transition-all duration-200 ${
                        violation
                          ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {getTaskName(dependency.sourceTaskId)}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {getTaskName(dependency.targetTaskId)}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              dependency.type === 'FS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              dependency.type === 'SS' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              dependency.type === 'FF' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            }`}>
                              {dependency.type}
                            </span>
                            {dependency.lag !== 0 && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                dependency.lag > 0 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              }`}>
                                {dependency.lag > 0 ? `+${dependency.lag}d` : `${dependency.lag}d`}
                              </span>
                            )}
                            {isDemoMode && dependency.demo && (
                              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                                DEMO
                              </span>
                            )}
                          </div>
                          
                          {violation && (
                            <div className="mt-2 flex items-center space-x-2 text-red-600 dark:text-red-400">
                              <ExclamationTriangleIcon className="w-4 h-4" />
                              <span className="text-sm">{violation.violation}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditDependency(dependency)}
                            disabled={loading || (isDemoMode && !dependency.demo)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            title="Edit dependency"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDependency(dependency.id)}
                            disabled={loading || (isDemoMode && !dependency.demo)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            title="Delete dependency"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Demo Mode Restrictions */}
          {isDemoMode && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Demo Mode Restrictions:</p>
                  <ul className="mt-1 space-y-1">
                    {dependencyConstraintsService.getDemoModeRestrictions().map((restriction, index) => (
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

export default DependencyConstraintModal; 