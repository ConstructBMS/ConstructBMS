import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  LockClosedIcon, 
  SignalIcon,
  SignalSlashIcon,
  ClockIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { useProgrammeCollaboration } from '../../contexts/ProgrammeCollaborationContext';
import ProgrammePresenceIndicator from './ProgrammePresenceIndicator';
import TaskLockIndicator from './TaskLockIndicator';
import TaskLockConflictModal from './TaskLockConflictModal';
import type { TaskLock } from '../../services/programmeCollaborationService';

interface ProgrammeCollaborationDemoProps {
  projectId: string;
}

const ProgrammeCollaborationDemo: React.FC<ProgrammeCollaborationDemoProps> = ({
  projectId
}) => {
  const {
    presence,
    taskLocks,
    isConnected,
    error,
    isLoading,
    lockTask,
    unlockTask,
    isTaskLocked,
    getTaskLockInfo,
    getOtherUsers,
    getCurrentUserPresence
  } = useProgrammeCollaboration();

  const [selectedTaskId, setSelectedTaskId] = useState<string>('task-1');
  const [showLockConflictModal, setShowLockConflictModal] = useState(false);
  const [conflictLockInfo, setConflictLockInfo] = useState<TaskLock | null>(null);
  const [lockResult, setLockResult] = useState<string>('');

  const otherUsers = getOtherUsers();
  const currentUser = getCurrentUserPresence();
  const isTaskLockedState = isTaskLocked(selectedTaskId);
  const taskLockInfo = getTaskLockInfo(selectedTaskId);

  const demoTasks = [
    { id: 'task-1', name: 'Foundation Work', status: 'in-progress' },
    { id: 'task-2', name: 'Structural Steel', status: 'not-started' },
    { id: 'task-3', name: 'Electrical Installation', status: 'completed' },
    { id: 'task-4', name: 'Plumbing Work', status: 'on-hold' }
  ];

  const handleLockTask = async () => {
    const result = await lockTask(selectedTaskId);
    if (result.success) {
      setLockResult('Task locked successfully!');
    } else {
      setLockResult(`Failed to lock task: ${result.error}`);
      if (result.error?.includes('currently being edited')) {
        setConflictLockInfo(taskLockInfo);
        setShowLockConflictModal(true);
      }
    }
  };

  const handleUnlockTask = async () => {
    const result = await unlockTask(selectedTaskId);
    if (result.success) {
      setLockResult('Task unlocked successfully!');
    } else {
      setLockResult(`Failed to unlock task: ${result.error}`);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Programme Manager v2 - Live Collaboration Demo
          </h1>
          <ProgrammePresenceIndicator projectId={projectId} />
        </div>

        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            {isConnected ? (
              <SignalIcon className="w-5 h-5 text-green-500" />
            ) : (
              <SignalSlashIcon className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">
              Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {error && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Task Management */}
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Task Locking Demo
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Task
                  </label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {demoTasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.name} ({task.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleLockTask}
                    disabled={isTaskLockedState || !isConnected}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LockClosedIcon className="w-4 h-4 inline mr-2" />
                    Lock Task
                  </button>
                  <button
                    onClick={handleUnlockTask}
                    disabled={!isTaskLockedState || !isConnected}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Unlock Task
                  </button>
                </div>

                {lockResult && (
                  <div className="p-3 bg-gray-100 dark:bg-gray-600 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{lockResult}</p>
                  </div>
                )}

                {/* Task Lock Status */}
                <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Task Lock Status
                  </h3>
                  {isTaskLockedState && taskLockInfo ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <LockClosedIcon className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Locked by: {taskLockInfo.lockedByUser}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Expires: {formatTimeAgo(taskLockInfo.expiresAt)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <SignalIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Task is available for editing
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Task Bar Demo */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Task Bar with Lock Indicator
              </h3>
              
              <div className="space-y-3">
                {demoTasks.map(task => (
                  <div
                    key={task.id}
                    className={`relative p-3 rounded-md border-2 transition-all ${
                      task.id === selectedTaskId
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    
                    {/* Lock Indicator */}
                    <TaskLockIndicator taskId={task.id} position="top-right" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Presence and Locks */}
          <div className="space-y-6">
            {/* Current User */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current User
              </h2>
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {currentUser.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {currentUser.userName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentUser.userEmail}
                    </p>
                    {currentUser.demo && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                        DEMO
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Not connected</p>
              )}
            </div>

            {/* Other Users */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Other Users ({otherUsers.length})
              </h2>
              {otherUsers.length > 0 ? (
                <div className="space-y-3">
                  {otherUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.userName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatTimeAgo(user.lastSeen)}
                        </p>
                      </div>
                      {user.demo && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                          DEMO
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No other users online</p>
              )}
            </div>

            {/* Active Task Locks */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Active Task Locks ({taskLocks.length})
              </h2>
              {taskLocks.length > 0 ? (
                <div className="space-y-3">
                  {taskLocks.map(lock => {
                    const task = demoTasks.find(t => t.id === lock.taskId);
                    return (
                      <div key={lock.id} className="p-3 bg-white dark:bg-gray-800 rounded-md border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {task?.name || 'Unknown Task'}
                          </span>
                          <LockClosedIcon className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Locked by: {lock.lockedByUser}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Expires: {formatTimeAgo(lock.expiresAt)}
                          </p>
                          {lock.demo && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                              DEMO
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No active task locks</p>
              )}
            </div>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              Demo Mode Limitations
            </h3>
          </div>
          <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Maximum 1 other user shown in presence list</li>
            <li>• Maximum 1 task lock allowed at a time</li>
            <li>• All entries tagged with "DEMO" watermark</li>
            <li>• Task locking disabled (always editable)</li>
          </ul>
        </div>
      </div>

      {/* Task Lock Conflict Modal */}
      {showLockConflictModal && conflictLockInfo && (
        <TaskLockConflictModal
          isOpen={showLockConflictModal}
          onClose={() => setShowLockConflictModal(false)}
          lockInfo={conflictLockInfo}
          taskName={demoTasks.find(t => t.id === selectedTaskId)?.name || 'Unknown Task'}
        />
      )}
    </div>
  );
};

export default ProgrammeCollaborationDemo; 