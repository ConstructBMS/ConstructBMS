import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export type ConstraintType = 
  | 'none' // No constraint
  | 'SNET' // Start No Earlier Than
  | 'FNLT' // Finish No Later Than
  | 'MSO'  // Must Start On
  | 'MFO'; // Must Finish On

export interface TaskConstraint {
  date: string;
  demo?: boolean;
  type: ConstraintType;
}

interface SetConstraintModalProps {
  isDemoMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (constraint: TaskConstraint) => void;
  selectedTasks: string[];
}

const SetConstraintModal: React.FC<SetConstraintModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedTasks,
  isDemoMode = false
}) => {
  const [constraintType, setConstraintType] = useState<ConstraintType>('SNET');
  const [constraintDate, setConstraintDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');

  useEffect(() => {
    if (isOpen) {
      // Set default date to today
      setConstraintDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const constraintTypes = [
    {
      value: 'none' as ConstraintType,
      label: 'No Constraint',
      description: 'Remove constraint from tasks'
    },
    {
      value: 'SNET' as ConstraintType,
      label: 'Start No Earlier Than',
      description: 'Task cannot start before the specified date'
    },
    {
      value: 'FNLT' as ConstraintType,
      label: 'Finish No Later Than',
      description: 'Task cannot finish after the specified date'
    },
    {
      value: 'MSO' as ConstraintType,
      label: 'Must Start On',
      description: 'Task must start on the specified date'
    },
    {
      value: 'MFO' as ConstraintType,
      label: 'Must Finish On',
      description: 'Task must finish on the specified date'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    // Demo mode restrictions
    if (isDemoMode && constraintType !== 'SNET') {
      alert('DEMO LIMIT - Only "Start No Earlier Than" constraint allowed in demo mode');
      return;
    }

    // Require date for non-none constraints
    if (constraintType !== 'none' && !constraintDate) {
      alert('Please select a constraint date');
      return;
    }

    setIsLoading(true);
    try {
      const constraint: TaskConstraint = {
        type: constraintType,
        date: constraintDate,
        demo: isDemoMode
      };

      await onSave(constraint);
      onClose();
    } catch (error) {
      console.error('Failed to set constraint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setConstraintType('SNET');
    setConstraintDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Set Constraint</h2>
              <p className="text-sm text-gray-500">
                Assign constraint to {selectedTasks.length} selected task{selectedTasks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isDemoMode && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                Demo Mode
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Constraint Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Constraint Type *
              </label>
              <select
                value={constraintType}
                onChange={(e) => setConstraintType(e.target.value as ConstraintType)}
                disabled={!canEdit}
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
                `}
                required
              >
                {constraintTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {constraintTypes.find(t => t.value === constraintType)?.description}
              </p>
            </div>

            {/* Constraint Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Constraint Date *
              </label>
              <input
                type="date"
                value={constraintDate}
                onChange={(e) => setConstraintDate(e.target.value)}
                disabled={!canEdit}
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${!canEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
                `}
                required
              />
            </div>

            {/* Selected Tasks Info */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Tasks to be constrained ({selectedTasks.length})
              </h4>
              <div className="text-xs text-gray-600">
                {selectedTasks.length > 0 ? (
                  <p>Task IDs: {selectedTasks.slice(0, 3).join(', ')}
                    {selectedTasks.length > 3 && ` and ${selectedTasks.length - 3} more`}
                  </p>
                ) : (
                  <p className="text-orange-600">No tasks selected</p>
                )}
              </div>
            </div>

            {/* Permission Notice */}
            {!canEdit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  You don't have permission to set constraints.
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading || !constraintDate || selectedTasks.length === 0}
                className={`
                  px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isLoading || !constraintDate || selectedTasks.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Setting...' : 'Set Constraint'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetConstraintModal; 