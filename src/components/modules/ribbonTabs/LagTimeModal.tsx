import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { TaskData } from './TaskEditModal';

export interface TaskDependency {
  demo?: boolean;
  id: string;
  lag: string;
  targetId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
}

interface LagTimeModalProps {
  dependencies: TaskDependency[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (dependency: TaskDependency) => void;
  selectedTasks: TaskData[];
}

const LagTimeModal: React.FC<LagTimeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedTasks,
  dependencies
}) => {
  const [selectedDependency, setSelectedDependency] = useState<TaskDependency | null>(null);
  const [lagValue, setLagValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedTasks.length === 2) {
      // Find existing dependency between the two selected tasks
      const task1 = selectedTasks[0];
      const task2 = selectedTasks[1];
      
      if (!task1 || !task2) return;
      
      const existingDependency = dependencies.find(dep => 
        (dep.id === task1.id && dep.targetId === task2.id) ||
        (dep.id === task2.id && dep.targetId === task1.id)
      );
      
      if (existingDependency) {
        setSelectedDependency(existingDependency);
        setLagValue(existingDependency.lag);
      } else {
        setSelectedDependency(null);
        setLagValue('0d');
      }
    }
  }, [selectedTasks, dependencies]);

  const validateLagFormat = (lag: string): boolean => {
    // Format: +2d, -1d, 0d, +0.5d, -0.5d
    const lagRegex = /^[+-]?\d+(\.\d+)?d$/;
    return lagRegex.test(lag);
  };

  const handleSave = () => {
    if (!validateLagFormat(lagValue)) {
      setError('Invalid lag format. Use format like +2d, -1d, 0d');
      return;
    }

    if (selectedTasks.length !== 2) {
      setError('Please select exactly 2 tasks');
      return;
    }

    const task1 = selectedTasks[0];
    const task2 = selectedTasks[1];
    
    if (!task1 || !task2) return;
    
    const dependency: TaskDependency = {
      id: task1.id,
      targetId: task2.id,
      type: 'FS', // Default to Finish-to-Start
      lag: lagValue,
      demo: true
    };

    onSave(dependency);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedDependency ? 'Edit Lag Time' : 'Add Lag Time'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {selectedTasks.length !== 2 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Please select exactly 2 tasks to manage lag time.
            </p>
          </div>
        )}

        {selectedTasks.length === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Relationship
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedTasks[0]?.name || 'Unknown Task'}
                  </span>
                  <span className="text-xs text-gray-500">→</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedTasks[1]?.name || 'Unknown Task'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Finish-to-Start (FS) dependency
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lag Time
              </label>
              <input
                type="text"
                value={lagValue}
                onChange={(e) => {
                  setLagValue(e.target.value);
                  setError('');
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+2d, -1d, 0d"
              />
              <div className="text-xs text-gray-500 mt-1">
                Format: +2d (2 days after), -1d (1 day before), 0d (no lag)
              </div>
              {error && (
                <div className="text-xs text-red-600 mt-1">
                  {error}
                </div>
              )}
            </div>

            {selectedDependency && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Existing dependency found:</strong> Current lag is {selectedDependency.lag}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <button
            onClick={handleSave}
            disabled={selectedTasks.length !== 2 || !!error}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedDependency ? 'Update Lag' : 'Add Lag'}
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

export default LagTimeModal; 