import React from 'react';
import { 
  LockClosedIcon, 
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import type { TaskLock } from '../../services/programmeCollaborationService';

interface TaskLockConflictModalProps {
  isOpen: boolean;
  lockInfo: TaskLock;
  onClose: () => void;
  taskName: string;
}

const TaskLockConflictModal: React.FC<TaskLockConflictModalProps> = ({
  isOpen,
  onClose,
  lockInfo,
  taskName
}) => {
  if (!isOpen) return null;

  const formatTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return 'Expired';
    if (diffMins < 60) return `${diffMins} minutes`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hours ${diffMins % 60} minutes`;
  };

  const isExpired = lockInfo.expiresAt < new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center space-x-3 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
            <LockClosedIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Task is Locked
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This task is currently being edited
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Task: {taskName}
            </h3>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium mb-1">
                  Currently being edited by:
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {lockInfo.lockedByUser}
                  </span>
                  {lockInfo.demo && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                      DEMO
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Locked at:</span>
              <span className="text-gray-900 dark:text-white">
                {lockInfo.lockedAt.toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Expires in:</span>
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className={`font-medium ${
                  isExpired 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {isExpired ? 'Expired' : formatTimeRemaining(lockInfo.expiresAt)}
                </span>
              </div>
            </div>
          </div>

          {isExpired && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                This lock has expired. You may be able to edit the task now.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskLockConflictModal; 