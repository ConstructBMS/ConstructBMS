import React, { useState } from 'react';
import { 
  LinkIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { useProjectView } from '../../../contexts/ProjectViewContext';

export const LogicTab: React.FC = () => {
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
  const [showLogicVisibility, setShowLogicVisibility] = useState(true);
  const [selectedLogicType, setSelectedLogicType] = useState<'FS' | 'SS' | 'FF' | 'SF'>('FS');

  const can = (key: string) => canAccess(`gantt.logic.${key}`);

  // Logic type definitions
  const logicTypes = [
    { 
      id: 'FS', 
      name: 'Finish-to-Start', 
      description: 'Task B starts after Task A finishes',
      icon: ArrowRightIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      symbol: '→',
      symbolColor: 'text-blue-600'
    },
    { 
      id: 'SS', 
      name: 'Start-to-Start', 
      description: 'Task B starts after Task A starts',
      icon: ArrowUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      symbol: '↗',
      symbolColor: 'text-green-600'
    },
    { 
      id: 'FF', 
      name: 'Finish-to-Finish', 
      description: 'Task B finishes after Task A finishes',
      icon: ArrowDownIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      symbol: '↘',
      symbolColor: 'text-purple-600'
    },
    { 
      id: 'SF', 
      name: 'Start-to-Finish', 
      description: 'Task B finishes after Task A starts',
      icon: ArrowLeftIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      symbol: '↖',
      symbolColor: 'text-orange-600'
    }
  ];

  // Event handlers
  const handleLogicAction = (action: string, payload?: any) => {
    if (!selectedTasks.length) {
      console.log('No tasks selected');
      return;
    }

    switch (action) {
      case 'link-tasks':
        if (selectedTasks.length === 2) {
          const [fromId, toId] = selectedTasks;
          const logicType = payload || selectedLogicType;
          
                     // Add dependency
           const fromTask = tasks?.find(t => t.id === fromId);
           const toTask = tasks?.find(t => t.id === toId);
           
           if (fromTask && toTask && fromId && toId) {
             // Update from task (add successor)
             const fromSuccessors = fromTask.successors || [];
             fromSuccessors.push({ id: toId, type: logicType });
             updateTask(fromId, { successors: fromSuccessors });
             
             // Update to task (add predecessor)
             const toPredecessors = toTask.predecessors || [];
             toPredecessors.push({ id: fromId, type: logicType });
             updateTask(toId, { predecessors: toPredecessors });
           }
        } else {
          console.log('Need exactly 2 tasks selected for linking');
        }
        break;
        
      case 'unlink-tasks':
        if (selectedTasks.length === 2) {
          const [fromId, toId] = selectedTasks;
          
                     // Remove dependency
           const fromTask = tasks?.find(t => t.id === fromId);
           const toTask = tasks?.find(t => t.id === toId);
           
           if (fromTask && toTask && fromId && toId) {
             // Update from task (remove successor)
             const fromSuccessors = (fromTask.successors || []).filter((s: any) => s.id !== toId);
             updateTask(fromId, { successors: fromSuccessors });
             
             // Update to task (remove predecessor)
             const toPredecessors = (toTask.predecessors || []).filter((p: any) => p.id !== fromId);
             updateTask(toId, { predecessors: toPredecessors });
           }
        } else {
          console.log('Need exactly 2 tasks selected for unlinking');
        }
        break;
        
      case 'toggle-logic-visibility':
        setShowLogicVisibility(!showLogicVisibility);
        break;
        
      case 'clear-all-logic':
        // Clear all dependencies from selected tasks
        selectedTasks.forEach(taskId => {
          updateTask(taskId, { predecessors: [], successors: [] });
        });
        break;
    }
  };

  const openModal = (id: string) => setModal(id);

  const getLogicInfo = () => {
    if (!selectedTasks.length) return null;
    
    const selectedTask = tasks?.find(t => t.id === selectedTasks[0]);
    if (!selectedTask) return null;

    return {
      predecessors: selectedTask.predecessors || [],
      successors: selectedTask.successors || []
    };
  };

  const logicInfo = getLogicInfo();
  const currentLogicType = logicTypes.find(t => t.id === selectedLogicType) || logicTypes[0];

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Link Logic */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            {logicTypes.map((logicType) => (
              <button
                key={logicType.id}
                onClick={() => {
                  setSelectedLogicType(logicType.id as 'FS' | 'SS' | 'FF' | 'SF');
                  if (selectedTasks.length === 2) {
                    handleLogicAction('link-tasks', logicType.id);
                  }
                }}
                className={`flex flex-col items-center justify-center px-3 py-2 w-20 h-16 border rounded transition-colors ${
                  selectedLogicType === logicType.id
                    ? `${logicType.bgColor} ${logicType.borderColor} ${logicType.color}`
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
                title={logicType.description}
              >
                <logicType.icon className="h-5 w-5 mb-1" />
                <span className="text-xs text-center leading-tight">{logicType.name}</span>
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-600 font-medium">Dependencies</div>
        </div>

        {/* Logic Management */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleLogicAction('link-tasks', selectedLogicType)}
              disabled={selectedTasks.length !== 2}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Link Selected Tasks"
            >
              <LinkIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Link</span>
            </button>
            <button
              onClick={() => handleLogicAction('unlink-tasks')}
              disabled={selectedTasks.length !== 2}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Unlink Selected Tasks"
            >
              <XMarkIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Unlink</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Management</div>
        </div>

        {/* Logic Visibility */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleLogicAction('toggle-logic-visibility')}
              className={`flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border rounded transition-colors ${
                showLogicVisibility 
                  ? 'border-green-300 bg-green-50 text-green-700' 
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
              title={showLogicVisibility ? 'Hide Logic' : 'Show Logic'}
            >
              {showLogicVisibility ? (
                <EyeIcon className="h-5 w-5 mb-1" />
              ) : (
                <EyeSlashIcon className="h-5 w-5 mb-1 text-gray-700" />
              )}
              <span className="text-xs">{showLogicVisibility ? 'Hide' : 'Show'}</span>
            </button>
            <button
              onClick={() => handleLogicAction('clear-all-logic')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-orange-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear All Logic"
            >
              <XMarkIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Clear</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Display</div>
        </div>

        {/* Logic Management */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => openModal('logic-manager')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors"
              title="Manage Logic"
            >
              <ChartBarIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Manage</span>
            </button>
            <button
              onClick={() => openModal('logic-info')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors"
              title="Logic Information"
            >
              <InformationCircleIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Info</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Tools</div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Selected: {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
          </div>
          {logicInfo && (
            <>
              <div className="text-xs text-gray-500">
                Logic: {showLogicVisibility ? 'Visible' : 'Hidden'}
              </div>
              <div className="text-xs text-gray-500">
                Predecessors: {logicInfo.predecessors.length}
              </div>
              <div className="text-xs text-gray-500">
                Successors: {logicInfo.successors.length}
              </div>
                             {selectedTasks.length === 2 && currentLogicType && (
                 <div className="text-xs text-blue-600">
                   Ready to link with {currentLogicType.name}
                 </div>
               )}
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
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Logic Manager Modal */}
            {modal === 'logic-manager' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-purple-900">Logic Manager</h3>
                    <p className="text-sm text-purple-700">Manage and view all task dependencies</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Current Dependencies</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tasks?.filter(task => (task.predecessors && task.predecessors.length > 0) || (task.successors && task.successors.length > 0)).map((task) => (
                      <div key={task.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="font-medium text-sm mb-2">{task.name}</div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium text-gray-600">Predecessors:</span>
                            <ul className="mt-1 space-y-1">
                              {task.predecessors?.map((pred: any) => (
                                <li key={pred.id} className="flex items-center justify-between">
                                  <span>{tasks?.find(t => t.id === pred.id)?.name || pred.id}</span>
                                  <span className={`px-2 py-1 rounded text-xs ${logicTypes.find(t => t.id === pred.type)?.bgColor} ${logicTypes.find(t => t.id === pred.type)?.color}`}>
                                    {pred.type}
                                  </span>
                                </li>
                              )) || <li className="text-gray-400">None</li>}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Successors:</span>
                            <ul className="mt-1 space-y-1">
                              {task.successors?.map((succ: any) => (
                                <li key={succ.id} className="flex items-center justify-between">
                                  <span>{tasks?.find(t => t.id === succ.id)?.name || succ.id}</span>
                                  <span className={`px-2 py-1 rounded text-xs ${logicTypes.find(t => t.id === succ.type)?.bgColor} ${logicTypes.find(t => t.id === succ.type)?.color}`}>
                                    {succ.type}
                                  </span>
                                </li>
                              )) || <li className="text-gray-400">None</li>}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!tasks?.some(task => (task.predecessors && task.predecessors.length > 0) || (task.successors && task.successors.length > 0)) && (
                      <div className="text-sm text-gray-500 text-center py-4">
                        No dependencies found in the project
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

            {/* Logic Information Modal */}
            {modal === 'logic-info' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <InformationCircleIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Logic Information</h3>
                    <p className="text-sm text-green-700">Learn about different dependency types and their uses</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {logicTypes.map((logicType) => (
                    <div key={logicType.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded ${logicType.bgColor}`}>
                        <span className={`text-lg ${logicType.symbolColor}`}>
                          {logicType.symbol}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{logicType.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{logicType.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <strong>Use cases:</strong>
                          {logicType.id === 'FS' && ' Most common dependency type, used when Task B cannot start until Task A is complete'}
                          {logicType.id === 'SS' && ' Used when tasks can start simultaneously but Task B requires Task A to have started'}
                          {logicType.id === 'FF' && ' Used when tasks can finish simultaneously but Task B requires Task A to have finished'}
                          {logicType.id === 'SF' && ' Rare dependency type, used when Task B must finish before Task A can start'}
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
                    <li>• FS (Finish-to-Start) is the most common dependency type</li>
                    <li>• Circular dependencies are not allowed and will be prevented</li>
                    <li>• Dependencies affect the critical path calculation</li>
                    <li>• Changes to dependencies may require rescheduling</li>
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