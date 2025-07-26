import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import {
  constraintsService,
  TaskConstraint,
} from '../services/constraintsService';

interface ConstraintSelectorProps {
  disabled?: boolean;
  onConstraintChange?: (constraint: TaskConstraint | null) => void;
  projectId: string;
  taskId: string;
}

const ConstraintSelector: React.FC<ConstraintSelectorProps> = ({
  taskId,
  projectId,
  onConstraintChange,
  disabled = false,
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [constraint, setConstraint] = useState<TaskConstraint | null>(null);
  const [hasViolations, setHasViolations] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedType, setSelectedType] = useState<
    'SNET' | 'FNLT' | 'MSO' | 'MFO' | 'ASAP'
  >('SNET');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [constraintCount, setConstraintCount] = useState(0);

  const canEdit = canAccess('programme.task.edit');
  const canView = canAccess('programme.task.view');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);

      if (isDemo) {
        const count = await constraintsService.getConstraintCount();
        setConstraintCount(count);
      }
    };
    checkDemoMode();
  }, []);

  // Load existing constraint
  useEffect(() => {
    const loadConstraint = async () => {
      try {
        const taskConstraint =
          await constraintsService.getTaskConstraint(taskId);
        setConstraint(taskConstraint);

        if (taskConstraint) {
          setSelectedType(taskConstraint.type);
          setSelectedDate(
            taskConstraint.constraintDate.toISOString().split('T')[0]
          );

          const violations =
            await constraintsService.hasConstraintViolations(taskId);
          setHasViolations(violations);
        }
      } catch (error) {
        console.error('Error loading constraint:', error);
      }
    };

    loadConstraint();
  }, [taskId]);

  // Handle constraint type change
  const handleTypeChange = (type: 'SNET' | 'FNLT' | 'MSO' | 'MFO' | 'ASAP') => {
    setSelectedType(type);

    // For ASAP, we don't need a date
    if (type === 'ASAP') {
      setShowDatePicker(false);
    } else {
      setShowDatePicker(true);
    }
  };

  // Handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  // Handle save constraint
  const handleSaveConstraint = async () => {
    if (!canEdit || disabled) return;

    try {
      if (selectedType === 'ASAP') {
        // Remove constraint for ASAP
        const result = await constraintsService.removeConstraint(taskId);
        if (result.success) {
          setConstraint(null);
          setHasViolations(false);
          setShowDatePicker(false);
          onConstraintChange?.(null);
        }
      } else {
        // Set constraint with date
        const constraintDate = new Date(selectedDate);
        const result = await constraintsService.setConstraint(
          taskId,
          selectedType,
          constraintDate
        );

        if (result.success && result.constraint) {
          setConstraint(result.constraint);
          setShowDatePicker(false);
          onConstraintChange?.(result.constraint);

          // Check for violations
          const violations =
            await constraintsService.hasConstraintViolations(taskId);
          setHasViolations(violations);
        }
      }
    } catch (error) {
      console.error('Error saving constraint:', error);
    }
  };

  // Handle clear constraint
  const handleClearConstraint = async () => {
    if (!canEdit || disabled) return;

    try {
      const result = await constraintsService.removeConstraint(taskId);
      if (result.success) {
        setConstraint(null);
        setHasViolations(false);
        setShowDatePicker(false);
        onConstraintChange?.(null);
      }
    } catch (error) {
      console.error('Error clearing constraint:', error);
    }
  };

  // Check if constraint can be added
  const canAddConstraint = () => {
    if (!canEdit || disabled) return false;
    if (isDemoMode && constraintCount >= 3) return false;
    if (isDemoMode && constraint) return false; // Only one constraint per task in demo mode
    return true;
  };

  // Get constraint type options
  const getConstraintTypeOptions = () => {
    const options = [
      {
        value: 'ASAP',
        label: 'As Soon As Possible',
        description: 'No specific date constraint',
      },
      {
        value: 'SNET',
        label: 'Start No Earlier Than',
        description: 'Cannot start before date',
      },
      {
        value: 'FNLT',
        label: 'Finish No Later Than',
        description: 'Cannot finish after date',
      },
      {
        value: 'MSO',
        label: 'Must Start On',
        description: 'Must start exactly on date',
      },
      {
        value: 'MFO',
        label: 'Must Finish On',
        description: 'Must finish exactly on date',
      },
    ];

    // Demo mode only allows SNET
    if (isDemoMode) {
      return options.filter(
        option => option.value === 'SNET' || option.value === 'ASAP'
      );
    }

    return options;
  };

  if (!canView) return null;

  return (
    <div className='space-y-4'>
      {/* Current Constraint Display */}
      {constraint && (
        <div
          className={`
          p-3 rounded-lg border-2 transition-colors duration-200
          ${
            hasViolations
              ? 'border-red-300 bg-red-50 dark:bg-red-900 dark:border-red-700'
              : isDemoMode
                ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-700'
                : 'border-blue-300 bg-blue-50 dark:bg-blue-900 dark:border-blue-700'
          }
        `}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <span className='text-lg'>
                {constraintsService.getConstraintIcon(constraint.type)}
              </span>
              <div>
                <div className='font-semibold text-sm'>
                  {constraintsService.getConstraintTypeName(constraint.type)}
                </div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>
                  {constraint.constraintDate.toLocaleDateString()}
                </div>
              </div>
            </div>

            {hasViolations && (
              <div className='flex items-center space-x-1 text-red-600 dark:text-red-400'>
                <ExclamationTriangleIcon className='w-4 h-4' />
                <span className='text-xs font-semibold'>VIOLATED</span>
              </div>
            )}

            {canEdit && !disabled && (
              <button
                onClick={handleClearConstraint}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                title='Clear constraint'
              >
                <XMarkIcon className='w-4 h-4' />
              </button>
            )}
          </div>

          {isDemoMode && (
            <div className='mt-2 text-xs text-yellow-600 dark:text-yellow-400 font-semibold'>
              DEMO MODE
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Constraint */}
      {canAddConstraint() && (
        <div className='space-y-3'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Task Constraint
            </label>

            {/* Constraint Type Selector */}
            <select
              value={selectedType}
              onChange={e => handleTypeChange(e.target.value as any)}
              className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              disabled={disabled}
            >
              {getConstraintTypeOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Constraint Type Description */}
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              {
                getConstraintTypeOptions().find(
                  opt => opt.value === selectedType
                )?.description
              }
            </p>
          </div>

          {/* Date Picker */}
          {showDatePicker && selectedType !== 'ASAP' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Constraint Date
              </label>
              <div className='relative'>
                <input
                  type='date'
                  value={selectedDate}
                  onChange={e => handleDateChange(e.target.value)}
                  className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  disabled={disabled}
                />
                <CalendarIcon className='absolute right-3 top-3 w-5 h-5 text-gray-400' />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex space-x-2'>
            <button
              onClick={handleSaveConstraint}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                ${
                  disabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {constraint ? 'Update Constraint' : 'Add Constraint'}
            </button>

            {constraint && (
              <button
                onClick={handleClearConstraint}
                disabled={disabled}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${
                    disabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }
                `}
              >
                Clear Constraint
              </button>
            )}
          </div>
        </div>
      )}

      {/* Demo Mode Restrictions */}
      {isDemoMode && !canAddConstraint() && (
        <div className='p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg'>
          <div className='text-sm text-yellow-800 dark:text-yellow-200'>
            <div className='font-semibold'>Demo Mode Restrictions:</div>
            <ul className='mt-1 list-disc list-inside text-xs'>
              <li>Maximum 3 tasks with constraints</li>
              <li>Only one constraint per task</li>
              <li>Only "Start No Earlier Than" type allowed</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstraintSelector;
