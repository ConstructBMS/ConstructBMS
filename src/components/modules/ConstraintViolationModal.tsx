import React, { useState } from 'react';
import { 
  XMarkIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { taskConstraintService } from '../services/taskConstraintService';
import type { ConstraintViolation } from '../services/taskConstraintService';

interface ConstraintViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve?: () => void;
  taskId: string;
  violations: ConstraintViolation[];
}

const ConstraintViolationModal: React.FC<ConstraintViolationModalProps> = ({
  isOpen,
  onClose,
  violations,
  taskId,
  onResolve
}) => {
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);

  const handleResolveViolations = async () => {
    try {
      setResolving(true);
      
      // Enforce constraint logic to resolve violations
      const result = await taskConstraintService.enforceConstraintLogic(taskId);
      
      if (result.success) {
        setResolved(true);
        onResolve?.();
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
          setResolved(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error resolving violations:', error);
    } finally {
      setResolving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Constraint Violations
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {resolved ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Violations Resolved
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Task dates have been adjusted to comply with constraints.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The following constraint violations have been detected for this task:
                </p>
                
                <div className="space-y-3">
                  {violations.map((violation, index) => (
                    <div 
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md"
                    >
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-red-900 dark:text-red-100">
                          {taskConstraintService.getConstraintTypeLabel(violation.constraintType)}
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300">
                          {violation.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Auto-Resolve Available
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Click "Resolve Violations" to automatically adjust task dates to comply with constraints.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          {!resolved && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={handleResolveViolations}
                disabled={resolving}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resolving ? 'Resolving...' : 'Resolve Violations'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstraintViolationModal; 