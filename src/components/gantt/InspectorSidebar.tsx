import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import type { Task } from '../../services/ganttTaskService';

interface InspectorSidebarProps {
  task?: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onClose?: () => void;
  isVisible?: boolean;
}

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ 
  task, 
  onUpdate, 
  onClose,
  isVisible = true 
}) => {
  const [localTask, setLocalTask] = useState<Partial<Task>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Sync local state with task prop
  useEffect(() => {
    if (task) {
      setLocalTask(task);
    }
  }, [task]);

  const handleChange = (field: keyof Task, value: any) => {
    const updatedTask = { ...localTask, [field]: value };
    setLocalTask(updatedTask);
    
    if (task) {
      onUpdate(task.id, { [field]: value });
    }
  };

  const handleSave = () => {
    if (task && isEditing) {
      onUpdate(task.id, localTask);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (task) {
      setLocalTask(task);
      setIsEditing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogicTypeColor = (type: string) => {
    switch (type) {
      case 'FS': return 'bg-blue-100 text-blue-800';
      case 'SS': return 'bg-green-100 text-green-800';
      case 'FF': return 'bg-purple-100 text-purple-800';
      case 'SF': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!task || !isVisible) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-800">Task Inspector</h2>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing && (
            <>
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Save Changes"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                title="Cancel Changes"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title={isEditing ? 'View Mode' : 'Edit Mode'}
          >
            {isEditing ? <EyeIcon className="h-4 w-4" /> : <ArrowPathIcon className="h-4 w-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
              title="Close Inspector"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Task ID */}
        <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
          ID: {task.id}
        </div>

        {/* Basic Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Basic Information
          </h3>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Task Name</label>
            <input 
              type="text" 
              value={localTask.name || ''} 
              onChange={e => handleChange('name', e.target.value)} 
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea 
              value={localTask.notes || ''} 
              onChange={e => handleChange('notes', e.target.value)} 
              disabled={!isEditing}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 resize-none"
              placeholder="Enter task notes..."
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input 
                type="date" 
                value={localTask.startDate ? new Date(localTask.startDate).toISOString().split('T')[0] : ''} 
                onChange={e => handleChange('startDate', new Date(e.target.value))} 
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input 
                type="date" 
                value={localTask.endDate ? new Date(localTask.endDate).toISOString().split('T')[0] : ''} 
                onChange={e => handleChange('endDate', new Date(e.target.value))} 
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Duration (days)</label>
            <input 
              type="number" 
              value={localTask.duration || 0} 
              onChange={e => handleChange('duration', +e.target.value)} 
              disabled={!isEditing}
              min="0"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Progress (%)</label>
            <div className="flex items-center space-x-2">
              <input 
                type="range" 
                value={localTask.percentComplete || 0} 
                onChange={e => handleChange('percentComplete', +e.target.value)} 
                disabled={!isEditing}
                min="0"
                max="100"
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <span className="text-sm text-gray-600 w-12">{localTask.percentComplete ?? 0}%</span>
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <UserIcon className="h-4 w-4 mr-2" />
            Assignment
          </h3>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Assigned To</label>
            <input 
              type="text" 
              value={localTask.assignedTo || ''} 
              onChange={e => handleChange('assignedTo', e.target.value)} 
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter assignee name..."
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Resources</label>
            <input 
              type="text" 
              value={localTask.resources?.join(', ') || ''} 
              onChange={e => handleChange('resources', e.target.value.split(',').map(s => s.trim()))} 
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter resource IDs separated by commas..."
            />
          </div>
        </div>

        {/* Status & Priority */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <FlagIcon className="h-4 w-4 mr-2" />
            Status & Priority
          </h3>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select 
              value={localTask.status || 'not-started'} 
              onChange={e => handleChange('status', e.target.value)} 
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
              <option value="on-hold">On Hold</option>
            </select>
            <div className="mt-1">
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(localTask.status || 'not-started')}`}>
                {localTask.status?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not Started'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Priority</label>
            <select 
              value={localTask.priority || 'medium'} 
              onChange={e => handleChange('priority', e.target.value)} 
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <div className="mt-1">
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPriorityColor(localTask.priority || 'medium')}`}>
                {localTask.priority?.charAt(0).toUpperCase() + localTask.priority?.slice(1) || 'Medium'}
              </span>
            </div>
          </div>
        </div>

        {/* Dependencies */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Dependencies
          </h3>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Predecessors</label>
            <div className="space-y-1">
              {localTask.predecessors?.map((pred, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-xs">{pred.id}</span>
                  <span className={`px-2 py-1 text-xs rounded ${getLogicTypeColor(pred.type)}`}>
                    {pred.type}
                  </span>
                </div>
              )) || <span className="text-xs text-gray-400">No predecessors</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Successors</label>
            <div className="space-y-1">
              {localTask.successors?.map((succ, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-xs">{succ.id}</span>
                  <span className={`px-2 py-1 text-xs rounded ${getLogicTypeColor(succ.type)}`}>
                    {succ.type}
                  </span>
                </div>
              )) || <span className="text-xs text-gray-400">No successors</span>}
            </div>
          </div>
        </div>

        {/* Constraints */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <LockClosedIcon className="h-4 w-4 mr-2" />
            Constraints
          </h3>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Constraint Type</label>
            <select 
              value={localTask.constraintType || ''} 
              onChange={e => handleChange('constraintType', e.target.value || null)} 
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">None</option>
              <option value="asap">As Soon As Possible</option>
              <option value="must-start-on">Must Start On</option>
              <option value="must-finish-on">Must Finish On</option>
              <option value="finish-no-later">Finish No Later Than</option>
            </select>
          </div>

          {['must-start-on', 'must-finish-on', 'finish-no-later'].includes(localTask.constraintType || '') && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Constraint Date</label>
              <input 
                type="date" 
                value={localTask.constraintDate ? new Date(localTask.constraintDate).toISOString().split('T')[0] : ''} 
                onChange={e => handleChange('constraintDate', e.target.value ? new Date(e.target.value) : null)} 
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1">Deadline</label>
            <input 
              type="date" 
              value={localTask.deadline ? new Date(localTask.deadline).toISOString().split('T')[0] : ''} 
              onChange={e => handleChange('deadline', e.target.value ? new Date(e.target.value) : null)} 
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
              Notes
            </h3>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
            >
              {showNotes ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          
          {showNotes && (
            <div>
              <textarea 
                value={localTask.notes || ''} 
                onChange={e => handleChange('notes', e.target.value)} 
                disabled={!isEditing}
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                placeholder="Add notes about this task..."
              />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <ClockIcon className="h-4 w-4 mr-2" />
            Task Info
          </h3>
          
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Level:</span>
              <span>{task.level || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span>{task.taskType || 'normal'}</span>
            </div>
            <div className="flex justify-between">
              <span>Position:</span>
              <span>{task.position || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Cost:</span>
              <span>{task.cost ? `$${task.cost.toLocaleString()}` : 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {isEditing && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 