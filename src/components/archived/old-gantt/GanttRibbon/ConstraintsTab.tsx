import React, { useState } from 'react';
import { 
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  LockOpenIcon,
  CalendarDaysIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { useProjectView } from '../../../contexts/ProjectViewContext';

export const ConstraintsTab: React.FC = () => {
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
  const [constraintDate, setConstraintDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [showConstraintWarnings, setShowConstraintWarnings] = useState(false);

  const can = (key: string) => canAccess(`gantt.constraints.${key}`);

  // Constraint types
  const constraintTypes = [
    { 
      id: 'asap', 
      name: 'As Soon As Possible', 
      description: 'Task starts as early as possible',
      icon: ArrowRightIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      id: 'must-start-on', 
      name: 'Must Start On', 
      description: 'Task must start on specific date',
      icon: LockClosedIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      id: 'must-finish-on', 
      name: 'Must Finish On', 
      description: 'Task must finish on specific date',
      icon: LockClosedIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      id: 'finish-no-later', 
      name: 'Finish No Later Than', 
      description: 'Task must finish by specific date',
      icon: ExclamationTriangleIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  // Event handlers
  const handleConstraintAction = (action: string, payload?: any) => {
    if (!selectedTasks.length) {
      console.log('No tasks selected');
      return;
    }

    selectedTasks.forEach(taskId => {
      const task = tasks?.find(t => t.id === taskId);
      if (task) {
        switch (action) {
          case 'set-asap':
            updateTask?.(taskId, { 
              constraintType: 'asap',
              constraintDate: null
            });
            break;
          case 'set-must-start-on':
          case 'set-must-finish-on':
          case 'set-finish-no-later':
            const constraintType = action.replace('set-', '');
            updateTask?.(taskId, { 
              constraintType,
              constraintDate: payload || constraintDate
            });
            break;
          case 'set-deadline':
            updateTask?.(taskId, { deadline: payload || deadlineDate });
            break;
          case 'clear-deadline':
            updateTask?.(taskId, { deadline: null });
            break;
          case 'clear-constraint':
            updateTask?.(taskId, { 
              constraintType: null,
              constraintDate: null
            });
            break;
        }
      }
    });
  };

  const openModal = (id: string) => setModal(id);

  const getConstraintInfo = () => {
    if (!selectedTasks.length) return null;
    
    const selectedTask = tasks?.find(t => t.id === selectedTasks[0]);
    if (!selectedTask) return null;

    return {
      constraintType: selectedTask.constraintType,
      constraintDate: selectedTask.constraintDate,
      deadline: selectedTask.deadline
    };
  };

  const constraintInfo = getConstraintInfo();

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Constraint Types */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            {constraintTypes.map((constraint) => (
              <button
                key={constraint.id}
                onClick={() => {
                  if (['must-start-on', 'must-finish-on', 'finish-no-later'].includes(constraint.id)) {
                    openModal(`constraint-${constraint.id}`);
                  } else {
                    handleConstraintAction(`set-${constraint.id}`);
                  }
                }}
                className={`flex flex-col items-center justify-center px-3 py-2 w-20 h-16 border rounded transition-colors ${
                  constraintInfo?.constraintType === constraint.id
                    ? `${constraint.bgColor} ${constraint.borderColor} ${constraint.color}`
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
                title={constraint.description}
              >
                <constraint.icon className="h-5 w-5 mb-1" />
                <span className="text-xs text-center leading-tight">{constraint.name}</span>
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-600 font-medium">Apply Constraint</div>
        </div>

        {/* Deadline Management */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-4 w-4 text-gray-600" />
                <span className="text-xs text-gray-600">Deadline</span>
              </div>
              <input 
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                placeholder="Select date"
              />
              <div className="flex space-x-1">
                <button
                  onClick={() => handleConstraintAction('set-deadline', deadlineDate)}
                  disabled={!deadlineDate || !selectedTasks.length}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Set
                </button>
                <button
                  onClick={() => handleConstraintAction('clear-deadline')}
                  disabled={!selectedTasks.length}
                  className="px-2 py-1 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-600 font-medium">Deadline</div>
        </div>

        {/* Constraint Management */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => openModal('constraint-manager')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors"
              title="Manage Constraints"
            >
              <LockClosedIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Manage</span>
            </button>
            <button
              onClick={() => handleConstraintAction('clear-constraint')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear All Constraints"
            >
              <XMarkIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Clear</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Management</div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Selected: {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
          </div>
          {constraintInfo && (
            <>
              <div className="text-xs text-gray-500">
                Constraint: {constraintInfo.constraintType || 'None'}
              </div>
              {constraintInfo.deadline && (
                <div className="text-xs text-red-500">
                  Deadline: {new Date(constraintInfo.deadline).toLocaleDateString()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal System */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
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

            {/* Constraint Date Modal */}
            {modal.startsWith('constraint-') && (
              <div className="space-y-4">
                {(() => {
                  const constraintType = modal.replace('constraint-', '');
                  const constraint = constraintTypes.find(c => c.id === constraintType);
                  
                  return (
                    <>
                      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                        {constraint?.icon && React.createElement(constraint.icon, { className: "h-8 w-8 text-blue-600" })}
                        <div>
                          <h3 className="font-medium text-blue-900">{constraint?.name}</h3>
                          <p className="text-sm text-blue-700">{constraint?.description}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Constraint Date</label>
                        <input 
                          type="date" 
                          value={constraintDate}
                          onChange={(e) => setConstraintDate(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Warning</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          This constraint will override the task's natural scheduling and may affect the critical path.
                        </p>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            handleConstraintAction(`set-${constraintType}`, constraintDate);
                            setModal('');
                          }}
                          disabled={!constraintDate}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Apply Constraint
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Constraint Manager Modal */}
            {modal === 'constraint-manager' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <LockClosedIcon className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-purple-900">Constraint Manager</h3>
                    <p className="text-sm text-purple-700">Manage all task constraints and deadlines</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Current Constraints</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tasks?.filter(task => task.constraintType || task.deadline).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div>
                          <div className="font-medium text-sm">{task.name}</div>
                          <div className="text-xs text-gray-500 space-x-2">
                            {task.constraintType && (
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {task.constraintType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </span>
                            )}
                            {task.deadline && (
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                Deadline: {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              updateTask?.(task.id, { constraintType: null, constraintDate: null });
                            }}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 text-xs rounded"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    ))}
                    {!tasks?.some(task => task.constraintType || task.deadline) && (
                      <div className="text-sm text-gray-500 text-center py-4">
                        No constraints applied to any tasks
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      // Clear all constraints
                      tasks?.forEach(task => {
                        if (task.constraintType || task.deadline) {
                          updateTask?.(task.id, { 
                            constraintType: null, 
                            constraintDate: null,
                            deadline: null
                          });
                        }
                      });
                      setModal('');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Clear All Constraints
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