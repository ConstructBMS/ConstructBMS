import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  LockClosedIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { taskConstraintService } from '../services/taskConstraintService';

export type ConstraintType = 
  | 'none' // No constraint
  | 'MSO'  // Must Start On
  | 'MFO'  // Must Finish On
  | 'SNET' // Start No Earlier Than
  | 'FNLT'; // Finish No Later Than

export interface TaskConstraint {
  constraintDate: string;
  constraintReason?: string;
  constraintType: ConstraintType;
  createdAt?: Date;
  demo?: boolean;
  id?: string;
  taskId: string;
  updatedAt?: Date;
}

interface TaskConstraintsTabProps {
  isDemoMode?: boolean;
  onConstraintChange?: (constraint: TaskConstraint | null) => void;
  projectId: string;
  taskId: string;
}

const TaskConstraintsTab: React.FC<TaskConstraintsTabProps> = ({
  taskId,
  projectId,
  isDemoMode = false,
  onConstraintChange
}) => {
  const { canAccess } = usePermissions();
  const [constraint, setConstraint] = useState<TaskConstraint | null>(null);
  const [constraintType, setConstraintType] = useState<ConstraintType>('SNET');
  const [constraintDate, setConstraintDate] = useState<string>('');
  const [constraintReason, setConstraintReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [constraintCount, setConstraintCount] = useState(0);

  const canEdit = canAccess('programme.constraint.edit');
  const canView = canAccess('programme.constraint.view');

  const constraintTypes = [
    {
      value: 'none' as ConstraintType,
      label: 'No Constraint',
      description: 'No constraint applied'
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
    }
  ];

  // Load existing constraint and check demo mode restrictions
  useEffect(() => {
    const loadConstraint = async () => {
      try {
        setLoading(true);
        
        // Load existing constraint
        const existingConstraint = await taskConstraintService.getTaskConstraint(taskId);
        setConstraint(existingConstraint);
        
        if (existingConstraint) {
          setConstraintType(existingConstraint.constraintType);
          setConstraintDate(existingConstraint.constraintDate);
          setConstraintReason(existingConstraint.constraintReason || '');
        } else {
          // Set default date to today
          setConstraintDate(new Date().toISOString().split('T')[0]);
        }

        // Check demo mode restrictions
        if (isDemoMode) {
          const count = await taskConstraintService.getConstraintCount(projectId);
          setConstraintCount(count);
        }
      } catch (error) {
        console.error('Error loading constraint:', error);
        setError('Failed to load constraint data');
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      loadConstraint();
    }
  }, [taskId, projectId, isDemoMode]);

  const handleSaveConstraint = async () => {
    if (!canEdit || !constraintDate) return;

    try {
      setSaving(true);
      setError(null);

      // Check demo mode restrictions
      if (isDemoMode) {
        if (constraintType !== 'MSO') {
          setError('DEMO LIMIT - Only "Must Start On" constraint allowed in demo mode');
          return;
        }

        if (constraintCount >= 3 && !constraint) {
          setError('DEMO LIMIT - Maximum 3 tasks with constraints allowed in demo mode');
          return;
        }
      }

      const constraintData: TaskConstraint = {
        taskId,
        constraintType,
        constraintDate,
        constraintReason: constraintReason.trim() || undefined,
        demo: isDemoMode
      };

      const result = await taskConstraintService.saveTaskConstraint(constraintData);
      
      if (result.success) {
        setConstraint(result.constraint);
        onConstraintChange?.(result.constraint);
        
        // Update constraint count for demo mode
        if (isDemoMode) {
          const newCount = await taskConstraintService.getConstraintCount(projectId);
          setConstraintCount(newCount);
        }
      } else {
        setError(result.error || 'Failed to save constraint');
      }
    } catch (error) {
      console.error('Error saving constraint:', error);
      setError('Failed to save constraint');
    } finally {
      setSaving(false);
    }
  };

  const handleClearConstraint = async () => {
    if (!canEdit || !constraint) return;

    try {
      setSaving(true);
      setError(null);

      const result = await taskConstraintService.clearTaskConstraint(taskId);
      
      if (result.success) {
        setConstraint(null);
        setConstraintType('SNET');
        setConstraintDate(new Date().toISOString().split('T')[0]);
        setConstraintReason('');
        onConstraintChange?.(null);
        
        // Update constraint count for demo mode
        if (isDemoMode) {
          const newCount = await taskConstraintService.getConstraintCount(projectId);
          setConstraintCount(newCount);
        }
      } else {
        setError(result.error || 'Failed to clear constraint');
      }
    } catch (error) {
      console.error('Error clearing constraint:', error);
      setError('Failed to clear constraint');
    } finally {
      setSaving(false);
    }
  };

  const getConstraintIcon = (type: ConstraintType) => {
    switch (type) {
      case 'MSO':
      case 'MFO':
        return <LockClosedIcon className="w-4 h-4 text-red-500" />;
      case 'SNET':
      case 'SNLT':
      case 'FNET':
      case 'FNLT':
        return <CalendarIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading constraints...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Task Constraints
        </h3>
        {isDemoMode && (
          <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>Demo Mode - {constraintCount}/3 constraints used</span>
          </div>
        )}
      </div>

      {/* Current Constraint Display */}
      {constraint && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getConstraintIcon(constraint.constraintType)}
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  {constraintTypes.find(t => t.value === constraint.constraintType)?.label}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {new Date(constraint.constraintDate).toLocaleDateString()}
                </div>
                {constraint.constraintReason && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Reason: {constraint.constraintReason}
                  </div>
                )}
              </div>
            </div>
            {canEdit && (
              <button
                onClick={handleClearConstraint}
                disabled={saving}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                title="Clear constraint"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Constraint Form */}
      {canEdit && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            {constraint ? 'Edit Constraint' : 'Set Constraint'}
          </h4>

          {/* Constraint Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Constraint Type *
            </label>
            <select
              value={constraintType}
              onChange={(e) => setConstraintType(e.target.value as ConstraintType)}
              disabled={saving || (isDemoMode && constraintType !== 'MSO')}
              className={`
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                ${(isDemoMode && constraintType !== 'MSO') ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
              `}
            >
              {constraintTypes.map(type => (
                <option 
                  key={type.value} 
                  value={type.value}
                  disabled={isDemoMode && type.value !== 'MSO'}
                >
                  {type.label}
                  {isDemoMode && type.value !== 'MSO' ? ' (Demo Locked)' : ''}
                </option>
              ))}
            </select>
            {isDemoMode && constraintType !== 'MSO' && (
              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                DEMO LIMIT - Only "Must Start On" constraint available
              </p>
            )}
          </div>

          {/* Constraint Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Constraint Date *
            </label>
            <input
              type="date"
              value={constraintDate}
              onChange={(e) => setConstraintDate(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          {/* Constraint Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason/Note (Optional)
            </label>
            <textarea
              value={constraintReason}
              onChange={(e) => setConstraintReason(e.target.value)}
              disabled={saving}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter reason for this constraint..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSaveConstraint}
              disabled={saving || !constraintDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : constraint ? 'Update Constraint' : 'Set Constraint'}
            </button>
            {constraint && (
              <button
                onClick={handleClearConstraint}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Constraint
              </button>
            )}
          </div>
        </div>
      )}

      {/* Permission Notice */}
      {!canEdit && (
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You don't have permission to edit task constraints.
          </p>
        </div>
      )}

      {/* Demo Mode Info */}
      {isDemoMode && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-3">
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <div className="font-semibold">DEMO MODE RESTRICTIONS</div>
            <ul className="mt-1 text-xs space-y-1">
              <li>• Only "Must Start On" constraint allowed</li>
              <li>• Maximum 3 tasks with constraints</li>
              <li>• All constraint metadata tagged as demo</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskConstraintsTab; 