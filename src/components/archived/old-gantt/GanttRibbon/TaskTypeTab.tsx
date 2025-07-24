import React, { useState } from 'react';
import { 
  Square3Stack3DIcon,
  FlagIcon,
  RectangleStackIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { useProjectView } from '../../../contexts/ProjectViewContext';

export const TaskTypeTab: React.FC = () => {
  const { canAccess } = usePermissions();
  const { state } = useProjectView();
  const { selectedTasks } = state;
  
  // Mock tasks and updateTask for now - these should come from your task service
  const tasks: any[] = []; // Replace with actual task service
  const updateTask = (taskId: string, updates: any) => {
    console.log('Update task:', taskId, updates);
    // Replace with actual task update logic
  };
  
  // Modal and state management
  const [modal, setModal] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const can = (key: string) => canAccess(`gantt.tasktype.${key}`);

  // Task type definitions
  const taskTypes = [
    { 
      id: 'normal', 
      name: 'Normal Task', 
      description: 'Standard project task with duration and resources',
      icon: Square3Stack3DIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      symbol: '■',
      symbolColor: 'text-blue-600'
    },
    { 
      id: 'milestone', 
      name: 'Milestone', 
      description: 'Zero-duration marker for project events',
      icon: FlagIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      symbol: '◆',
      symbolColor: 'text-yellow-600'
    },
    { 
      id: 'summary', 
      name: 'Summary', 
      description: 'Parent task that groups child tasks',
      icon: FolderIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      symbol: '▣',
      symbolColor: 'text-green-600'
    },
    { 
      id: 'hammock', 
      name: 'Hammock', 
      description: 'Task that spans multiple other tasks',
      icon: RectangleStackIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      symbol: '▭',
      symbolColor: 'text-purple-600'
    },
    { 
      id: 'level-of-effort', 
      name: 'Level of Effort', 
      description: 'Ongoing effort that spans project duration',
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      symbol: '◐',
      symbolColor: 'text-orange-600'
    }
  ];

  // Advanced task types (for future use)
  const advancedTaskTypes = [
    { 
      id: 'wbs', 
      name: 'WBS Summary', 
      description: 'Work Breakdown Structure summary element',
      icon: FolderIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      symbol: '◈',
      symbolColor: 'text-indigo-600'
    },
    { 
      id: 'deliverable', 
      name: 'Deliverable', 
      description: 'Task that produces a specific deliverable',
      icon: CheckCircleIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      symbol: '✓',
      symbolColor: 'text-emerald-600'
    }
  ];

  // Event handlers
  const handleTaskTypeAction = (taskType: string) => {
    if (!selectedTasks.length) {
      console.log('No tasks selected');
      return;
    }

    selectedTasks.forEach(taskId => {
      const task = tasks?.find(t => t.id === taskId);
      if (task) {
        updateTask(taskId, { taskType });
      }
    });
  };

  const openModal = (id: string) => setModal(id);

  const getTaskTypeInfo = () => {
    if (!selectedTasks.length) return null;
    
    const selectedTask = tasks?.find(t => t.id === selectedTasks[0]);
    if (!selectedTask) return null;

    return {
      taskType: selectedTask.taskType || 'normal'
    };
  };

  const taskTypeInfo = getTaskTypeInfo();
  const currentTaskType = taskTypes.find(t => t.id === taskTypeInfo?.taskType) || taskTypes[0];

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Task Type Options */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            {taskTypes.map((taskType) => (
              <button
                key={taskType.id}
                onClick={() => handleTaskTypeAction(taskType.id)}
                className={`flex flex-col items-center justify-center px-3 py-2 w-20 h-16 border rounded transition-colors ${
                  taskTypeInfo?.taskType === taskType.id
                    ? `${taskType.bgColor} ${taskType.borderColor} ${taskType.color}`
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
                title={taskType.description}
              >
                <taskType.icon className="h-5 w-5 mb-1" />
                <span className="text-xs text-center leading-tight">{taskType.name}</span>
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-600 font-medium">Set Task Type</div>
        </div>

        {/* Advanced Task Types */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 font-medium">Advanced Types</span>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
            >
              {showAdvanced ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>
          </div>
          
          {showAdvanced && (
            <div className="flex space-x-1 mb-2">
              {advancedTaskTypes.map((taskType) => (
                <button
                  key={taskType.id}
                  onClick={() => handleTaskTypeAction(taskType.id)}
                  className={`flex flex-col items-center justify-center px-3 py-2 w-20 h-16 border rounded transition-colors ${
                    taskTypeInfo?.taskType === taskType.id
                      ? `${taskType.bgColor} ${taskType.borderColor} ${taskType.color}`
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                  title={taskType.description}
                >
                  <taskType.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs text-center leading-tight">{taskType.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Task Type Management */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => openModal('task-type-manager')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Manage Task Types"
            >
              <Square3Stack3DIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Manage</span>
            </button>
            <button
              onClick={() => openModal('task-type-info')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors"
              title="Task Type Information"
            >
              <InformationCircleIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Info</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Management</div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Selected: {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
          </div>
          {taskTypeInfo && currentTaskType && (
            <>
              <div className="text-xs text-gray-500">
                Type: {currentTaskType.name}
              </div>
              <div className="flex items-center space-x-1">
                <span className={`text-sm ${currentTaskType.symbolColor}`}>
                  {currentTaskType.symbol}
                </span>
                <span className="text-xs text-gray-500">
                  {currentTaskType.description}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal System */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {modal.replace(/([A-Z])/g, ' $1').replace('-', ' ').trim()}
              </h2>
              <button
                onClick={() => setModal('')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <InformationCircleIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Task Type Manager Modal */}
            {modal === 'task-type-manager' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Square3Stack3DIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Task Type Manager</h3>
                    <p className="text-sm text-blue-700">Manage and view task types across the project</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Current Task Types</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tasks?.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <span className={`text-lg ${taskTypes.find(t => t.id === task.taskType)?.symbolColor || 'text-gray-400'}`}>
                            {taskTypes.find(t => t.id === task.taskType)?.symbol || '■'}
                          </span>
                          <div>
                            <div className="font-medium text-sm">{task.name}</div>
                            <div className="text-xs text-gray-500">
                              {taskTypes.find(t => t.id === task.taskType)?.name || 'Normal Task'}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <select
                            value={task.taskType || 'normal'}
                            onChange={(e) => updateTask(task.id, { taskType: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            {taskTypes.map(type => (
                              <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    {!tasks?.length && (
                      <div className="text-sm text-gray-500 text-center py-4">
                        No tasks found in the project
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Task Type Information Modal */}
            {modal === 'task-type-info' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <InformationCircleIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Task Type Information</h3>
                    <p className="text-sm text-green-700">Learn about different task types and their uses</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {taskTypes.map((taskType) => (
                    <div key={taskType.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded ${taskType.bgColor}`}>
                        <span className={`text-lg ${taskType.symbolColor}`}>
                          {taskType.symbol}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{taskType.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{taskType.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <strong>Use cases:</strong>
                          {taskType.id === 'normal' && ' Standard project activities, work packages, deliverables'}
                          {taskType.id === 'milestone' && ' Project events, phase completions, key decision points'}
                          {taskType.id === 'summary' && ' Grouping related tasks, project phases, work packages'}
                          {taskType.id === 'hammock' && ' Spanning multiple tasks, overhead activities, management'}
                          {taskType.id === 'level-of-effort' && ' Ongoing activities, support tasks, maintenance'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Important Notes</span>
                  </div>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Milestones have zero duration and represent events</li>
                    <li>• Summary tasks automatically calculate from child tasks</li>
                    <li>• Hammock tasks span the duration of their linked tasks</li>
                    <li>• Level of Effort tasks are ongoing throughout the project</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 