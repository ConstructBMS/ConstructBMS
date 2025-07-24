import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { TaskData } from './TaskEditModal';

interface TaskPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTasks: TaskData[];
}

const TaskPropertiesModal: React.FC<TaskPropertiesModalProps> = ({
  isOpen,
  onClose,
  selectedTasks
}) => {
  if (!isOpen || selectedTasks.length === 0) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderTaskProperties = (task: TaskData, index: number) => (
    <div key={task.id} className="border border-gray-200 rounded-lg p-4 mb-4">
      {selectedTasks.length > 1 && (
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Task {index + 1}: {task.name}
        </h3>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task ID
          </label>
          <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
            {task.id}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UID
          </label>
          <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
            {task.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <p className="text-sm text-gray-900">{task.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <p className="text-sm text-gray-900">{task.duration} day{task.duration !== 1 ? 's' : ''}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <p className="text-sm text-gray-900">{formatDate(task.startDate)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <p className="text-sm text-gray-900">{formatDate(task.endDate)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Demo Task
          </label>
          <p className="text-sm text-gray-900">
            {task.demo ? 'Yes' : 'No'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <p className="text-sm text-gray-900">Not Started</p>
        </div>
      </div>

      {task.notes && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
            {task.notes}
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Advanced Properties</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Constraints
            </label>
            <p className="text-gray-900">None</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Baseline Data
            </label>
            <p className="text-gray-900">Not set</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Dependencies
            </label>
            <p className="text-gray-900">None</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Parent Summary
            </label>
            <p className="text-gray-900">Top level</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedTasks.length === 1 ? 'Task Properties' : `Properties (${selectedTasks.length} Tasks)`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {selectedTasks.length > 1 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Multiple tasks selected:</strong> Showing properties for {selectedTasks.length} tasks.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {selectedTasks.map((task, index) => renderTaskProperties(task, index))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskPropertiesModal; 