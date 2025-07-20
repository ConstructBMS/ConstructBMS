import React, { useState } from 'react';
import { 
  LinkIcon, 
  NoSymbolIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Task } from '../../../services/ganttTaskService';

export const TaskTab: React.FC = () => {
  const { state } = useProjectView();
  const { selectedTasks } = state;
  const { canAccess } = usePermissions();
  const [modal, setModal] = useState<string | null>(null);
  const [constraintType, setConstraintType] = useState<string>('must-start-on');
  const [progressValue, setProgressValue] = useState<number>(100);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Mock tasks data - in real implementation this would come from a service
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      name: 'Sample Task 1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 7,
      percentComplete: 0,
      status: 'not-started',
      level: 0,
      position: 0,
      taskType: 'normal',
      priority: 'medium',
      predecessors: [],
      successors: []
    }
  ];

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  // Initialize tasks with mock data
  React.useEffect(() => {
    setTasks(mockTasks);
  }, []);

  const can = (key: string) => canAccess(`gantt.task.${key}`);

  const handleTaskAction = (action: string, payload?: any) => {
    if (!can(action)) {
      console.log('Permission denied for task action:', action);
      return;
    }

    switch (action) {
      case 'link-tasks':
        if (selectedTasks.length >= 2) {
          // Link first task to all others
          const sourceTask = tasks?.find(t => t.id === selectedTasks[0]);
          const targetTasks = selectedTasks.slice(1);
          
                     if (sourceTask) {
             const updatedTask = {
               ...sourceTask,
               successors: [
                 ...(sourceTask.successors || []),
                 ...targetTasks.map(id => ({
                   id,
                   type: 'FS' as const
                 }))
               ]
             };
             updateTask(sourceTask.id, updatedTask);
             console.log('Linked tasks:', selectedTasks);
           }
        }
        break;

      case 'unlink-tasks':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              predecessors: [],
              successors: []
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Unlinked tasks:', selectedTasks);
        break;

             case 'set-constraint':
         selectedTasks.forEach(taskId => {
           const task = tasks?.find(t => t.id === taskId);
           if (task) {
             const updatedTask = {
               ...task,
               constraintType: payload || constraintType
             };
             updateTask(taskId, updatedTask);
           }
         });
         console.log('Set constraint:', payload || constraintType, 'on tasks:', selectedTasks);
         break;

       case 'clear-constraint':
         selectedTasks.forEach(taskId => {
           const task = tasks?.find(t => t.id === taskId);
           if (task) {
             const { constraintType, ...updatedTask } = task;
             updateTask(taskId, updatedTask);
           }
         });
         console.log('Cleared constraints on tasks:', selectedTasks);
         break;

             case 'mark-complete':
         selectedTasks.forEach(taskId => {
           const task = tasks?.find(t => t.id === taskId);
           if (task) {
             const updatedTask = {
               ...task,
               percentComplete: 100,
               status: 'completed' as const
             };
             updateTask(taskId, updatedTask);
           }
         });
         console.log('Marked tasks as 100% complete:', selectedTasks);
         break;

       case 'reset-progress':
         selectedTasks.forEach(taskId => {
           const task = tasks?.find(t => t.id === taskId);
           if (task) {
             const updatedTask = {
               ...task,
               percentComplete: 0,
               status: 'not-started' as const
             };
             updateTask(taskId, updatedTask);
           }
         });
         console.log('Reset progress to 0% on tasks:', selectedTasks);
         break;

       case 'set-progress':
         const progress = payload || progressValue;
         selectedTasks.forEach(taskId => {
           const task = tasks?.find(t => t.id === taskId);
           if (task) {
             let status: 'not-started' | 'in-progress' | 'completed';
             if (progress === 100) status = 'completed';
             else if (progress > 0) status = 'in-progress';
             else status = 'not-started';
             
             const updatedTask = {
               ...task,
               percentComplete: progress,
               status
             };
             updateTask(taskId, updatedTask);
           }
         });
         console.log('Set progress to', progress, '% on tasks:', selectedTasks);
         break;

      case 'set-task-type':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              taskType: payload
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Set task type to', payload, 'on tasks:', selectedTasks);
        break;
    }
  };

  const openModal = (id: string) => setModal(id);

  const getTaskInfo = () => {
    const selectedTask = tasks?.find(t => t.id === selectedTasks[0]);
    return {
      selectedCount: selectedTasks.length,
      canLink: selectedTasks.length >= 2,
      canUnlink: selectedTasks.length >= 1,
      hasConstraint: selectedTask?.constraintType,
      constraintType: selectedTask?.constraintType,
      progress: selectedTask?.percentComplete || 0,
      taskType: selectedTask?.taskType || 'normal',
      status: selectedTask?.status || 'not-started'
    };
  };

  const taskInfo = getTaskInfo();

  const constraintTypes = [
    { id: 'must-start-on', name: 'Must Start On', icon: CalendarIcon, description: 'Task must start on a specific date' },
    { id: 'must-finish-on', name: 'Must Finish On', icon: CalendarIcon, description: 'Task must finish on a specific date' },
    { id: 'start-no-earlier-than', name: 'Start No Earlier Than', icon: ClockIcon, description: 'Task cannot start before a specific date' },
    { id: 'finish-no-later-than', name: 'Finish No Later Than', icon: ClockIcon, description: 'Task cannot finish after a specific date' },
    { id: 'as-soon-as-possible', name: 'As Soon As Possible', icon: ExclamationTriangleIcon, description: 'Task should start as early as possible' },
    { id: 'as-late-as-possible', name: 'As Late As Possible', icon: ExclamationTriangleIcon, description: 'Task should start as late as possible' }
  ];

  const taskTypes = [
    { id: 'normal', name: 'Normal', description: 'Standard task with flexible duration' },
    { id: 'fixed-duration', name: 'Fixed Duration', description: 'Task with fixed duration regardless of resources' },
    { id: 'fixed-work', name: 'Fixed Work', description: 'Task with fixed work effort' },
    { id: 'milestone', name: 'Milestone', description: 'Zero-duration task marking a significant point' },
    { id: 'summary', name: 'Summary', description: 'Parent task that summarizes child tasks' },
    { id: 'level-of-effort', name: 'Level of Effort', description: 'Task that spans the duration of other tasks' }
  ];

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Relationships */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleTaskAction('link-tasks')}
              disabled={!taskInfo.canLink}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Link Selected Tasks"
            >
              <LinkIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Link</span>
            </button>
            <button
              onClick={() => handleTaskAction('unlink-tasks')}
              disabled={!taskInfo.canUnlink}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Unlink Selected Tasks"
            >
              <NoSymbolIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Unlink</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Relationships</div>
        </div>

        {/* Constraints */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleTaskAction('set-constraint', 'must-start-on')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-orange-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Must Start On"
            >
              <CalendarIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Must Start</span>
            </button>
            <button
              onClick={() => handleTaskAction('clear-constraint')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear Constraint"
            >
              <NoSymbolIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Clear</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Constraints</div>
        </div>

        {/* Progress */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleTaskAction('mark-complete')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mark 100% Complete"
            >
              <CheckCircleIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">100%</span>
            </button>
            <button
              onClick={() => handleTaskAction('reset-progress')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset to 0% Complete"
            >
              <ArrowPathIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">0%</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Progress</div>
        </div>

        {/* Task Types */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleTaskAction('set-task-type', 'fixed-duration')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Set Fixed Duration"
            >
              <ClockIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Fixed</span>
            </button>
            <button
              onClick={() => openModal('task-manager')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-indigo-50 rounded transition-colors"
              title="Task Manager"
            >
              <Cog6ToothIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Manage</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Task Type</div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Selected: {taskInfo.selectedCount} task{taskInfo.selectedCount !== 1 ? 's' : ''}
          </div>
          {taskInfo.hasConstraint && (
            <div className="text-xs text-gray-500">
              Constraint: {taskInfo.constraintType}
            </div>
          )}
          <div className="text-xs text-gray-500">
            Progress: {taskInfo.progress}% ({taskInfo.status})
          </div>
          <div className="text-xs text-gray-500">
            Type: {taskInfo.taskType}
          </div>
        </div>
      </div>

      {/* Modal System */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {modal.replace('-', ' ')} Manager
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <NoSymbolIcon className="h-6 w-6" />
              </button>
            </div>

            {modal === 'task-manager' && (
              <div className="space-y-6">
                {/* Constraint Types */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Constraint Types</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {constraintTypes.map((constraint) => (
                      <button
                        key={constraint.id}
                        onClick={() => {
                          handleTaskAction('set-constraint', constraint.id);
                          setModal(null);
                        }}
                        disabled={!selectedTasks.length}
                        className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <constraint.icon className="h-4 w-4 mr-2 text-gray-600" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">{constraint.name}</div>
                          <div className="text-xs text-gray-500">{constraint.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Task Types */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Task Types</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {taskTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          handleTaskAction('set-task-type', type.id);
                          setModal(null);
                        }}
                        disabled={!selectedTasks.length}
                        className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-600" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">{type.name}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Control */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Progress Control</h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressValue}
                      onChange={(e) => setProgressValue(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-700 w-12">
                      {progressValue}%
                    </span>
                    <button
                      onClick={() => {
                        handleTaskAction('set-progress', progressValue);
                        setModal(null);
                      }}
                      disabled={!selectedTasks.length}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modal === 'task-info' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">Task Management Information</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Linking:</strong> Select multiple tasks and use Link to create dependencies between them.</p>
                  <p><strong>Constraints:</strong> Apply scheduling constraints to control when tasks can start or finish.</p>
                  <p><strong>Progress:</strong> Set completion percentage to track task progress.</p>
                  <p><strong>Task Types:</strong> Choose appropriate task type for accurate scheduling.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 