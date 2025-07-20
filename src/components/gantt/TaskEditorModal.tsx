import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  LinkIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  CheckIcon,
  XMarkIcon as XMarkIconSolid
} from '@heroicons/react/24/outline';
import type { Task, Dependency } from '../../services/ganttTaskService';

interface TaskEditorModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  allTasks: Task[];
}

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  allTasks
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Define tabs
  const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: DocumentTextIcon },
    { id: 'predecessors', label: 'Predecessors', icon: LinkIcon },
    { id: 'resources', label: 'Resources', icon: UserGroupIcon },
    { id: 'advanced', label: 'Advanced', icon: CogIcon },
    { id: 'notes', label: 'Notes', icon: DocumentTextIcon }
  ];

  // Initialize edited task when modal opens
  useEffect(() => {
    if (task && isOpen) {
      setEditedTask({ ...task });
      setIsDirty(false);
    }
  }, [task, isOpen]);

  // Handle field changes
  const handleFieldChange = (field: keyof Task, value: any) => {
    if (!editedTask) return;

    setEditedTask(prev => {
      if (!prev) return prev;
      
      const updated = { ...prev, [field]: value };
      
      // Update end date when duration changes
      if (field === 'duration') {
        const newEndDate = new Date(updated.startDate);
        newEndDate.setDate(newEndDate.getDate() + value - 1); // Duration is inclusive
        updated.endDate = newEndDate;
      }
      
      // Update duration when dates change
      if (field === 'startDate' || field === 'endDate') {
        const start = new Date(updated.startDate);
        const end = new Date(updated.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        updated.duration = diffDays;
      }
      
      return updated;
    });
    setIsDirty(true);
  };

  // Handle save
  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      setIsDirty(false);
      onClose();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Get available predecessors (excluding current task and its descendants)
  const getAvailablePredecessors = () => {
    if (!editedTask) return allTasks;
    
    const excludeIds = [editedTask.id];
    const addDescendants = (taskId: string) => {
      const task = allTasks.find(t => t.id === taskId);
      if (task?.children) {
        task.children.forEach(childId => {
          excludeIds.push(childId);
          addDescendants(childId);
        });
      }
    };
    addDescendants(editedTask.id);
    
    return allTasks.filter(t => !excludeIds.includes(t.id));
  };

  // Render General tab
  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Name *
          </label>
          <input
            type="text"
            value={editedTask?.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Type
          </label>
          <select
            value={editedTask?.taskType || 'task'}
            onChange={(e) => handleFieldChange('taskType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="task">Task</option>
            <option value="milestone">Milestone</option>
            <option value="summary">Summary</option>
          </select>
        </div>
      </div>

      {/* Dates and Duration */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <div className="relative">
            <input
              type="date"
              value={editedTask?.startDate.toISOString().split('T')[0] || ''}
              onChange={(e) => handleFieldChange('startDate', new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date *
          </label>
          <div className="relative">
            <input
              type="date"
              value={editedTask?.endDate.toISOString().split('T')[0] || ''}
              onChange={(e) => handleFieldChange('endDate', new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (days)
          </label>
          <div className="relative">
            <input
              type="number"
              value={editedTask?.duration || 0}
              onChange={(e) => handleFieldChange('duration', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
            <ClockIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={editedTask?.status || 'not-started'}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={editedTask?.priority || 'medium'}
            onChange={(e) => handleFieldChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Progress */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Progress (%)
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="100"
            value={editedTask?.percentComplete || 0}
            onChange={(e) => handleFieldChange('percentComplete', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-12">
            {editedTask?.percentComplete || 0}%
          </span>
        </div>
      </div>

      {/* Assigned To */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assigned To
        </label>
        <input
          type="text"
          value={editedTask?.assignedTo || ''}
          onChange={(e) => handleFieldChange('assignedTo', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter assignee name"
        />
      </div>
    </div>
  );

  // Render Predecessors tab
  const renderPredecessorsTab = () => {
    const availablePredecessors = getAvailablePredecessors();
    const currentDependencies = editedTask?.dependencies || [];
    const currentPredecessors = editedTask?.predecessors || [];

    const addDependency = (fromTaskId: string, type: 'FS' | 'SS' | 'FF' | 'SF' = 'FS', lag: number = 0) => {
      const newDependency = { from: fromTaskId, type, lag };
      const updatedDependencies = [...currentDependencies, newDependency];
      handleFieldChange('dependencies', updatedDependencies);
    };

    const updateDependency = (index: number, updates: Partial<Dependency>) => {
      const updatedDependencies = [...currentDependencies];
      const currentDep = updatedDependencies[index];
      if (currentDep) {
        updatedDependencies[index] = { 
          from: currentDep.from,
          type: currentDep.type,
          lag: currentDep.lag,
          ...updates 
        };
        handleFieldChange('dependencies', updatedDependencies);
      }
    };

    const removeDependency = (index: number) => {
      const updatedDependencies = currentDependencies.filter((_, i) => i !== index);
      handleFieldChange('dependencies', updatedDependencies);
    };

    const addPredecessor = (taskId: string) => {
      if (!currentPredecessors.includes(taskId)) {
        handleFieldChange('predecessors', [...currentPredecessors, taskId]);
      }
    };

    const removePredecessor = (taskId: string) => {
      handleFieldChange('predecessors', currentPredecessors.filter(id => id !== taskId));
    };

    return (
      <div className="space-y-6">
        {/* Enhanced Dependencies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dependencies (Enhanced)
          </label>
          {currentDependencies.length === 0 ? (
            <p className="text-gray-500 text-sm">No dependencies assigned</p>
          ) : (
            <div className="space-y-3">
              {currentDependencies.map((dep, index) => {
                const fromTask = allTasks.find(t => t.id === dep.from);
                return fromTask ? (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded border">
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-sm font-medium">{fromTask.name}</span>
                      </div>
                      <select
                        value={dep.type}
                        onChange={(e) => updateDependency(index, { type: e.target.value as 'FS' | 'SS' | 'FF' | 'SF' })}
                        className="text-xs border px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="FS">Finish-to-Start</option>
                        <option value="SS">Start-to-Start</option>
                        <option value="FF">Finish-to-Finish</option>
                        <option value="SF">Start-to-Finish</option>
                      </select>
                      <input
                        type="number"
                        value={dep.lag}
                        onChange={(e) => updateDependency(index, { lag: parseInt(e.target.value) || 0 })}
                        className="text-xs border px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Lag"
                        title="Lag/Lead in days (positive = lag, negative = lead)"
                      />
                      <div className="text-xs text-gray-500">
                        {dep.lag === 0 ? 'No lag' : dep.lag > 0 ? `+${dep.lag}d lag` : `${dep.lag}d lead`}
                      </div>
                    </div>
                    <button
                      onClick={() => removeDependency(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove dependency"
                    >
                      <XMarkIconSolid className="h-4 w-4" />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Add New Dependency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Dependency
          </label>
          <div className="grid grid-cols-4 gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addDependency(e.target.value);
                  e.target.value = '';
                }
              }}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a task...</option>
              {availablePredecessors.map(task => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const [taskId, type] = e.target.value.split('|');
                  if (taskId && type) {
                    addDependency(taskId, type as 'FS' | 'SS' | 'FF' | 'SF');
                    e.target.value = '';
                  }
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Quick add...</option>
              {availablePredecessors.map(task => (
                <optgroup key={task.id} label={task.name}>
                  <option value={`${task.id}|FS`}>Finish-to-Start</option>
                  <option value={`${task.id}|SS`}>Start-to-Start</option>
                  <option value={`${task.id}|FF`}>Finish-to-Finish</option>
                  <option value={`${task.id}|SF`}>Start-to-Finish</option>
                </optgroup>
              ))}
            </select>
            <button
              onClick={() => {
                const taskId = prompt('Enter task ID:');
                if (taskId && availablePredecessors.find(t => t.id === taskId)) {
                  const type = prompt('Enter dependency type (FS/SS/FF/SF):', 'FS') as 'FS' | 'SS' | 'FF' | 'SF';
                  const lag = parseInt(prompt('Enter lag/lead in days:', '0') || '0');
                  if (type && ['FS', 'SS', 'FF', 'SF'].includes(type)) {
                    addDependency(taskId, type, lag);
                  }
                }
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              Advanced
            </button>
          </div>
        </div>

        {/* Legacy Predecessors (for backward compatibility) */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Legacy Predecessors
          </label>
          {currentPredecessors.length === 0 ? (
            <p className="text-gray-500 text-sm">No legacy predecessors</p>
          ) : (
            <div className="space-y-2">
              {currentPredecessors.map(predId => {
                const predTask = allTasks.find(t => t.id === predId);
                return predTask ? (
                  <div key={predId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{predTask.name}</span>
                    <button
                      onClick={() => removePredecessor(predId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIconSolid className="h-4 w-4" />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Add Legacy Predecessor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Legacy Predecessor
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addPredecessor(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a task...</option>
            {availablePredecessors.map(task => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  // Render Resources tab
  const renderResourcesTab = () => {
    const currentResources = editedTask?.resources || [];

    const addResource = (resourceId: string) => {
      if (!currentResources.includes(resourceId)) {
        handleFieldChange('resources', [...currentResources, resourceId]);
      }
    };

    const removeResource = (resourceId: string) => {
      handleFieldChange('resources', currentResources.filter(id => id !== resourceId));
    };

    // Mock resources - in a real app, this would come from a resource service
    const availableResources = [
      { id: 'resource-1', name: 'Site Team', type: 'Labor' },
      { id: 'resource-2', name: 'Excavator', type: 'Equipment' },
      { id: 'resource-3', name: 'Concrete', type: 'Material' },
      { id: 'resource-4', name: 'Project Manager', type: 'Labor' },
      { id: 'resource-5', name: 'Crane', type: 'Equipment' }
    ];

    return (
      <div className="space-y-6">
        {/* Current Resources */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned Resources
          </label>
          {currentResources.length === 0 ? (
            <p className="text-gray-500 text-sm">No resources assigned</p>
          ) : (
            <div className="space-y-2">
              {currentResources.map(resourceId => {
                const resource = availableResources.find(r => r.id === resourceId);
                return resource ? (
                  <div key={resourceId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium">{resource.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({resource.type})</span>
                    </div>
                    <button
                      onClick={() => removeResource(resourceId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIconSolid className="h-4 w-4" />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Add Resource */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Resource
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addResource(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a resource...</option>
            {availableResources.map(resource => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.type})
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  // Render Advanced tab
  const renderAdvancedTab = () => (
    <div className="space-y-6">
      {/* Constraints */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Constraints
        </label>
        <select
          value={editedTask?.constraints?.type || ''}
          onChange={(e) => {
            const constraintType = e.target.value;
            if (constraintType) {
              handleFieldChange('constraints', {
                type: constraintType as any,
                date: editedTask?.constraints?.date || new Date()
              });
            } else {
              handleFieldChange('constraints', undefined);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No constraint</option>
          <option value="start-no-earlier-than">Start No Earlier Than</option>
          <option value="finish-no-later-than">Finish No Later Than</option>
          <option value="must-start-on">Must Start On</option>
          <option value="must-finish-on">Must Finish On</option>
        </select>
        
        {editedTask?.constraints?.type && (
          <div className="mt-2">
            <input
              type="date"
              value={editedTask.constraints.date.toISOString().split('T')[0]}
              onChange={(e) => handleFieldChange('constraints', {
                ...editedTask.constraints!,
                date: new Date(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Cost */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cost (£)
        </label>
        <input
          type="number"
          value={editedTask?.cost || 0}
          onChange={(e) => handleFieldChange('cost', parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.01"
        />
      </div>

      {/* Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hierarchy Level
        </label>
        <input
          type="number"
          value={editedTask?.level || 0}
          onChange={(e) => handleFieldChange('level', parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          max="10"
        />
      </div>
    </div>
  );

  // Render Notes tab
  const renderNotesTab = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Task Notes
      </label>
      <textarea
        value={editedTask?.notes || ''}
        onChange={(e) => handleFieldChange('notes', e.target.value)}
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter task notes, comments, or additional information..."
      />
    </div>
  );

  if (!isOpen || !editedTask) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Task Properties - {editedTask.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Edit task details and properties
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'predecessors' && renderPredecessorsTab()}
          {activeTab === 'resources' && renderResourcesTab()}
          {activeTab === 'advanced' && renderAdvancedTab()}
          {activeTab === 'notes' && renderNotesTab()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            {isDirty && (
              <div className="flex items-center space-x-1 text-orange-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 