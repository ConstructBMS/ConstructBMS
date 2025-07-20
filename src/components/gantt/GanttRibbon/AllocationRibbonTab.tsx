import React, { useState } from 'react';
import { 
  UserPlusIcon,
  UserMinusIcon,
  ClockIcon,
  PlusIcon,
  MinusIcon,
  Cog6ToothIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Task } from '../../../services/ganttTaskService';

export const AllocationRibbonTab: React.FC = () => {
  const { state } = useProjectView();
  const { selectedTasks } = state;
  const { canAccess } = usePermissions();
  
  // Modal and state management
  const [modal, setModal] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string>('Site Labourer');
  const [workAdjustment, setWorkAdjustment] = useState<number>(4);
  const [tasks, setTasks] = useState<Task[]>([]);

  const can = (key: string) => canAccess(`gantt.allocation.${key}`);

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

  // Initialize tasks with mock data
  React.useEffect(() => {
    setTasks(mockTasks);
  }, []);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleAllocationAction = (action: string, payload?: any) => {
    if (!can(action)) {
      console.log('Permission denied for allocation action:', action);
      return;
    }

    switch (action) {
      case 'assign-resource':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              assignedTo: payload || selectedResource
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Assigned resource:', payload || selectedResource, 'to tasks:', selectedTasks);
        break;

      case 'remove-resource':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const { assignedTo, ...updatedTask } = task;
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Removed resources from tasks:', selectedTasks);
        break;

      case 'adjust-work':
        const direction = payload || 'increase';
        const adjustment = workAdjustment;
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const currentWork = task.workHours || 0;
            let newWork = currentWork;
            
            if (direction === 'increase') {
              newWork += adjustment;
            } else if (direction === 'decrease' && currentWork > adjustment) {
              newWork -= adjustment;
            }
            
            const updatedTask = {
              ...task,
              workHours: newWork
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Adjusted work by', adjustment, 'hours for tasks:', selectedTasks);
        break;

      case 'set-effort-type':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            const updatedTask = {
              ...task,
              effortType: payload
            };
            updateTask(taskId, updatedTask);
          }
        });
        console.log('Set effort type to', payload, 'for tasks:', selectedTasks);
        break;
    }
  };

  const openModal = (id: string) => setModal(id);

  const getAllocationInfo = () => {
    const selectedTask = tasks?.find(t => t.id === selectedTasks[0]);
    return {
      selectedCount: selectedTasks.length,
      assignedResource: selectedTask?.assignedTo || 'None',
      workHours: selectedTask?.workHours || 0,
      effortType: selectedTask?.effortType || 'fixed-duration'
    };
  };

  const allocationInfo = getAllocationInfo();

  const resourceOptions = [
    'Site Labourer',
    'Carpenter',
    'Electrician',
    'Plumber',
    'Project Manager',
    'Site Engineer',
    'Safety Officer',
    'Quality Inspector'
  ];

  const effortTypes = [
    { id: 'fixed-work', name: 'Fixed Work', description: 'Work hours remain constant, duration adjusts' },
    { id: 'fixed-duration', name: 'Fixed Duration', description: 'Duration remains constant, work adjusts' },
    { id: 'fixed-units', name: 'Fixed Units', description: 'Resource units remain constant' }
  ];

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Resources */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleAllocationAction('assign-resource')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Assign Resource"
            >
              <UserPlusIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Assign</span>
            </button>
            <button
              onClick={() => handleAllocationAction('remove-resource')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove Resource"
            >
              <UserMinusIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Remove</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Resources</div>
        </div>

        {/* Work/Duration Adjustments */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleAllocationAction('adjust-work', 'increase')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Increase Work"
            >
              <PlusIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">+ Work</span>
            </button>
            <button
              onClick={() => handleAllocationAction('adjust-work', 'decrease')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Decrease Work"
            >
              <MinusIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">− Work</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Work</div>
        </div>

        {/* Allocation Options */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleAllocationAction('set-effort-type', 'fixed-work')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Set Fixed Work"
            >
              <ClockIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Fixed Work</span>
            </button>
            <button
              onClick={() => handleAllocationAction('set-effort-type', 'fixed-duration')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Set Fixed Duration"
            >
              <ClockIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Fixed Duration</span>
            </button>
            <button
              onClick={() => openModal('allocation-manager')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-indigo-50 rounded transition-colors"
              title="Allocation Manager"
            >
              <Cog6ToothIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Manage</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Effort Type</div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Selected: {allocationInfo.selectedCount} task{allocationInfo.selectedCount !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-500">
            Resource: {allocationInfo.assignedResource}
          </div>
          <div className="text-xs text-gray-500">
            Work: {allocationInfo.workHours} hours
          </div>
          <div className="text-xs text-gray-500">
            Type: {allocationInfo.effortType}
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
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {modal === 'allocation-manager' && (
              <div className="space-y-6">
                {/* Resource Selection */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Resource Selection</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {resourceOptions.map((resource) => (
                      <button
                        key={resource}
                        onClick={() => {
                          handleAllocationAction('assign-resource', resource);
                          setModal(null);
                        }}
                        disabled={!selectedTasks.length}
                        className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserPlusIcon className="h-4 w-4 mr-2 text-gray-600" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700">{resource}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Effort Types */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Effort Types</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {effortTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          handleAllocationAction('set-effort-type', type.id);
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

                {/* Work Adjustment */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Work Adjustment</h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={workAdjustment}
                      onChange={(e) => setWorkAdjustment(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-700 w-16">
                      {workAdjustment} hours
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          handleAllocationAction('adjust-work', 'increase');
                          setModal(null);
                        }}
                        disabled={!selectedTasks.length}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + Work
                      </button>
                      <button
                        onClick={() => {
                          handleAllocationAction('adjust-work', 'decrease');
                          setModal(null);
                        }}
                        disabled={!selectedTasks.length}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        - Work
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modal === 'allocation-info' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <InformationCircleIcon className="h-5 w-5" />
                  <span className="text-sm">Allocation Management Information</span>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Resources:</strong> Assign or remove resources from selected tasks.</p>
                  <p><strong>Work Adjustments:</strong> Increase or decrease work hours for tasks.</p>
                  <p><strong>Effort Types:</strong> Choose how work, duration, and resources relate.</p>
                  <p><strong>Fixed Work:</strong> Work hours remain constant, duration adjusts.</p>
                  <p><strong>Fixed Duration:</strong> Duration remains constant, work adjusts.</p>
                  <p><strong>Fixed Units:</strong> Resource units remain constant.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 