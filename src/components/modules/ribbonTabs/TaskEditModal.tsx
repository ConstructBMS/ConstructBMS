import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskData) => void;
  selectedTasks: TaskData[];
}

export interface TaskData {
  children?: string[];
  demo?: boolean;
  dependencies?: any[];
  duration: number;
  endDate: Date;
  id: string;
  isCollapsed?: boolean;
  isSummary?: boolean;
  level?: number;
  name: string;
  notes: string;
  parentId?: string;
  startDate: Date;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedTasks
}) => {
  const [taskData, setTaskData] = useState<TaskData>({
    id: '',
    name: '',
    duration: 1,
    startDate: new Date(),
    endDate: new Date(),
    notes: '',
    demo: true
  });

  const [hasMultipleSelection, setHasMultipleSelection] = useState(false);
  const [inconsistentValues, setInconsistentValues] = useState<string[]>([]);

  useEffect(() => {
    if (selectedTasks.length === 0) {
      setTaskData({
        id: '',
        name: '',
        duration: 1,
        startDate: new Date(),
        endDate: new Date(),
        notes: '',
        demo: true
      });
      return;
    }

    if (selectedTasks.length === 1) {
      const task = selectedTasks[0];
      if (!task) return;
      setTaskData({
        ...task,
        notes: task.notes || ''
      });
      setHasMultipleSelection(false);
      setInconsistentValues([]);
    } else {
      // Multiple selection - check for inconsistencies
      const firstTask = selectedTasks[0];
      if (!firstTask) return;
      
      const inconsistencies: string[] = [];
      
      const allSameName = selectedTasks.every(task => task.name === firstTask.name);
      const allSameDuration = selectedTasks.every(task => task.duration === firstTask.duration);
      const allSameStartDate = selectedTasks.every(task => 
        task.startDate.toDateString() === firstTask.startDate.toDateString()
      );
      const allSameEndDate = selectedTasks.every(task => 
        task.endDate.toDateString() === firstTask.endDate.toDateString()
      );

      if (!allSameName) inconsistencies.push('Name');
      if (!allSameDuration) inconsistencies.push('Duration');
      if (!allSameStartDate) inconsistencies.push('Start Date');
      if (!allSameEndDate) inconsistencies.push('End Date');

      setTaskData({
        ...firstTask,
        notes: firstTask.notes || ''
      });
      setHasMultipleSelection(true);
      setInconsistentValues(inconsistencies);
    }
  }, [selectedTasks]);

  const handleSave = () => {
    if (selectedTasks.length === 1) {
      onSave(taskData);
    } else {
      // For multiple tasks, apply the changes to all selected tasks
      selectedTasks.forEach(task => {
        const updatedTask = {
          ...task,
          name: taskData.name,
          duration: taskData.duration,
          startDate: taskData.startDate,
          endDate: taskData.endDate,
          notes: taskData.notes
        };
        onSave(updatedTask);
      });
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedTasks.length === 1 ? 'Edit Task' : `Edit ${selectedTasks.length} Tasks`}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {hasMultipleSelection && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Multiple tasks selected:</strong> Changes will apply to all {selectedTasks.length} selected tasks.
            </p>
            {inconsistentValues.length > 0 && (
              <p className="text-sm text-yellow-700 mt-1">
                <strong>Inconsistent values:</strong> {inconsistentValues.join(', ')} - using first task's values.
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              type="text"
              value={taskData.name}
              onChange={(e) => setTaskData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={taskData.duration}
              onChange={(e) => {
                const duration = parseFloat(e.target.value) || 1;
                const startDate = new Date(taskData.startDate);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + duration - 1);
                
                setTaskData(prev => ({ 
                  ...prev, 
                  duration,
                  endDate
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={taskData.startDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const startDate = new Date(e.target.value);
                  const endDate = new Date(startDate);
                  endDate.setDate(startDate.getDate() + taskData.duration - 1);
                  
                  setTaskData(prev => ({ 
                    ...prev, 
                    startDate,
                    endDate
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={taskData.endDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const endDate = new Date(e.target.value);
                  const startDate = new Date(taskData.startDate);
                  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  
                  setTaskData(prev => ({ 
                    ...prev, 
                    endDate,
                    duration: Math.max(1, duration)
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={taskData.notes || ''}
              onChange={(e) => setTaskData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task notes..."
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal; 