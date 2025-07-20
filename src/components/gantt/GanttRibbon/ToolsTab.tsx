import React, { useState } from 'react';
import { 
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  LinkIcon,
  NoSymbolIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Task } from '../../../services/ganttTaskService';

export const ToolsTab: React.FC = () => {
  const { state } = useProjectView();
  const { selectedTasks } = state;
  const { canAccess } = usePermissions();
  
  // Modal and state management
  const [modal, setModal] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const can = (key: string) => canAccess(`gantt.tools.${key}`);

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
    },
    {
      id: 'task-2',
      name: 'Sample Task 2',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
      duration: 7,
      percentComplete: 0,
      status: 'not-started',
      level: 0,
      position: 1,
      taskType: 'normal',
      priority: 'medium',
      predecessors: [],
      successors: []
    }
  ];

  // Initialize tasks with mock data
  React.useEffect(() => {
    setTasks(mockTasks);
  }, []);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleToolsAction = (action: string, payload?: any) => {
    if (!can(action)) {
      setOperationStatus({
        type: 'error',
        message: 'Permission denied for tools action: ' + action
      });
      return;
    }

    if (!selectedTasks.length) {
      setOperationStatus({
        type: 'error',
        message: 'No tasks selected for operation'
      });
      return;
    }

    switch (action) {
      case 'move-to-start':
        const projectStart = new Date();
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              startDate: projectStart,
              endDate: new Date(projectStart.getTime() + task.duration * 24 * 60 * 60 * 1000)
            };
            updateTask(taskId, updatedTask);
          }
        });
        setOperationStatus({
          type: 'success',
          message: `Moved ${selectedTasks.length} task(s) to project start date`
        });
        break;

      case 'move-to-end':
        const projectEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              endDate: projectEnd,
              startDate: new Date(projectEnd.getTime() - task.duration * 24 * 60 * 60 * 1000)
            };
            updateTask(taskId, updatedTask);
          }
        });
        setOperationStatus({
          type: 'success',
          message: `Moved ${selectedTasks.length} task(s) to project end date`
        });
        break;

      case 'align-starts':
        const alignStartDate = tasks?.find(t => t.id === selectedTasks[0])?.startDate || new Date();
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              startDate: alignStartDate,
              endDate: new Date(alignStartDate.getTime() + task.duration * 24 * 60 * 60 * 1000)
            };
            updateTask(taskId, updatedTask);
          }
        });
        setOperationStatus({
          type: 'success',
          message: `Aligned start dates for ${selectedTasks.length} task(s)`
        });
        break;

      case 'align-ends':
        const alignEndDate = tasks?.find(t => t.id === selectedTasks[0])?.endDate || new Date();
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              endDate: alignEndDate,
              startDate: new Date(alignEndDate.getTime() - task.duration * 24 * 60 * 60 * 1000)
            };
            updateTask(taskId, updatedTask);
          }
        });
        setOperationStatus({
          type: 'success',
          message: `Aligned end dates for ${selectedTasks.length} task(s)`
        });
        break;

      case 'link-tasks':
        // Create finish-to-start dependencies between selected tasks
        for (let i = 0; i < selectedTasks.length - 1; i++) {
          const currentTask = tasks?.find(t => t.id === selectedTasks[i]);
          const nextTask = tasks?.find(t => t.id === selectedTasks[i + 1]);
          if (currentTask && nextTask) {
                         const updatedCurrentTask = {
               ...currentTask,
               successors: [...(currentTask.successors || []), { id: nextTask.id, type: 'FS' as const }]
             };
             const updatedNextTask = {
               ...nextTask,
               predecessors: [...(nextTask.predecessors || []), { id: currentTask.id, type: 'FS' as const }]
             };
            updateTask(currentTask.id, updatedCurrentTask);
            updateTask(nextTask.id, updatedNextTask);
          }
        }
        setOperationStatus({
          type: 'success',
          message: `Linked ${selectedTasks.length} task(s) with finish-to-start dependencies`
        });
        break;

      case 'unlink-tasks':
        // Remove all dependencies between selected tasks
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              predecessors: task.predecessors?.filter(p => !selectedTasks.includes(p.id)) || [],
              successors: task.successors?.filter(s => !selectedTasks.includes(s.id)) || []
            };
            updateTask(taskId, updatedTask);
          }
        });
        setOperationStatus({
          type: 'success',
          message: `Unlinked ${selectedTasks.length} task(s)`
        });
        break;

      case 'remove-gaps':
        // Sort tasks by start date and remove gaps
        const sortedTasks = tasks
          ?.filter(t => selectedTasks.includes(t.id))
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        
                 if (sortedTasks && sortedTasks.length > 1) {
           for (let i = 1; i < sortedTasks.length; i++) {
             const prevTask = sortedTasks[i - 1];
             const currTask = sortedTasks[i];
             if (prevTask && currTask) {
               const gap = currTask.startDate.getTime() - prevTask.endDate.getTime();
               
               if (gap > 0) {
                 const updatedTask = {
                   ...currTask,
                   startDate: new Date(prevTask.endDate),
                   endDate: new Date(prevTask.endDate.getTime() + currTask.duration * 24 * 60 * 60 * 1000)
                 };
                 updateTask(currTask.id, updatedTask);
               }
             }
           }
         }
        setOperationStatus({
          type: 'success',
          message: `Removed gaps between ${selectedTasks.length} task(s)`
        });
        break;

      case 'clear-slack':
        // Remove slack by adjusting task dates to critical path
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task && task.predecessors?.length) {
            // Find the latest predecessor end date
            const latestPredecessorEnd = Math.max(
              ...task.predecessors.map(p => {
                const predTask = tasks?.find(t => t.id === p.id);
                return predTask ? predTask.endDate.getTime() : 0;
              })
            );
            
            if (latestPredecessorEnd > task.startDate.getTime()) {
              const updatedTask = {
                ...task,
                startDate: new Date(latestPredecessorEnd),
                endDate: new Date(latestPredecessorEnd + task.duration * 24 * 60 * 60 * 1000)
              };
              updateTask(taskId, updatedTask);
            }
          }
        });
        setOperationStatus({
          type: 'success',
          message: `Cleared slack for ${selectedTasks.length} task(s)`
        });
        break;

      case 'check-links':
        // Validate task dependencies
        const linkErrors: string[] = [];
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            // Check for circular dependencies
            if (task.predecessors?.some(p => p.id === taskId)) {
              linkErrors.push(`Circular dependency detected in task: ${task.name}`);
            }
            
            // Check for invalid predecessor references
            task.predecessors?.forEach(pred => {
              const predTask = tasks?.find(t => t.id === pred.id);
              if (!predTask) {
                linkErrors.push(`Invalid predecessor reference in task: ${task.name}`);
              }
            });
          }
        });
        
        if (linkErrors.length > 0) {
          setOperationStatus({
            type: 'error',
            message: `Link validation found ${linkErrors.length} error(s): ${linkErrors.join(', ')}`
          });
        } else {
          setOperationStatus({
            type: 'success',
            message: `Link validation passed for ${selectedTasks.length} task(s)`
          });
        }
        break;
    }
  };

  const openModal = (id: string) => setModal(id);

  const getToolsInfo = () => {
    const selectedTask = tasks?.find(t => t.id === selectedTasks[0]);
    return {
      selectedCount: selectedTasks.length,
      hasDependencies: selectedTask?.predecessors?.length || selectedTask?.successors?.length,
      startDate: selectedTask?.startDate,
      endDate: selectedTask?.endDate,
      duration: selectedTask?.duration
    };
  };

  const toolsInfo = getToolsInfo();

  // Clear status message after 3 seconds
  React.useEffect(() => {
    if (operationStatus) {
      const timer = setTimeout(() => setOperationStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [operationStatus]);

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Task Manipulation Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleToolsAction('move-to-start')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move to Start"
            >
              <ArrowsPointingInIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">To Start</span>
            </button>
            <button
              onClick={() => handleToolsAction('move-to-end')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move to End"
            >
              <ArrowsPointingOutIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">To End</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Align / Move</div>
        </div>

        {/* Alignment Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleToolsAction('align-starts')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Align Starts"
            >
              <ArrowsPointingInIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Align Starts</span>
            </button>
            <button
              onClick={() => handleToolsAction('align-ends')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Align Ends"
            >
              <ArrowsPointingOutIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Align Ends</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Alignment</div>
        </div>

        {/* Linking Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleToolsAction('link-tasks')}
              disabled={selectedTasks.length < 2}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Link Tasks"
            >
              <LinkIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Link</span>
            </button>
            <button
              onClick={() => handleToolsAction('unlink-tasks')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Unlink Tasks"
            >
              <NoSymbolIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Unlink</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Dependencies</div>
        </div>

        {/* Clean-up Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleToolsAction('remove-gaps')}
              disabled={selectedTasks.length < 2}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-yellow-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove Gaps"
            >
              <ArrowsPointingInIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Remove Gaps</span>
            </button>
            <button
              onClick={() => handleToolsAction('clear-slack')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-orange-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear Slack"
            >
              <TrashIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Clear Slack</span>
            </button>
            <button
              onClick={() => handleToolsAction('check-links')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Check Links"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Check Links</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Clean</div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Selected: {toolsInfo.selectedCount} task{toolsInfo.selectedCount !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-500">
            Dependencies: {toolsInfo.hasDependencies ? 'Yes' : 'No'}
          </div>
          <div className="text-xs text-gray-500">
            Duration: {toolsInfo.duration || 0} days
          </div>
        </div>
      </div>

      {/* Status Message */}
      {operationStatus && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
          operationStatus.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
          operationStatus.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
          'bg-blue-100 border border-blue-300 text-blue-800'
        }`}>
          <div className="flex items-center space-x-2">
            {operationStatus.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : operationStatus.type === 'error' ? (
              <ExclamationTriangleIcon className="h-5 w-5" />
            ) : (
              <InformationCircleIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{operationStatus.message}</span>
            <button
              onClick={() => setOperationStatus(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {modal === 'tools-info' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">Tools Management Information</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Align / Move:</strong> Reposition tasks within the project timeline.</p>
                  <p><strong>Alignment:</strong> Synchronize start or end dates of multiple tasks.</p>
                  <p><strong>Dependencies:</strong> Create or remove task relationships and links.</p>
                  <p><strong>Clean:</strong> Optimize task scheduling and validate project integrity.</p>
                  <p><strong>Task Manipulation:</strong> Essential tools for project scheduling and adjustment.</p>
                  <p><strong>Link Management:</strong> Control task dependencies and critical path analysis.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 