import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import AllocationTab from './ribbonTabs/AllocationTab';
import { allocationTabService } from '../../services/allocationTabService';
import type { AllocationOperation, Resource, TaskAllocation } from './ribbonTabs/AllocationTab';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const AllocationTabTest: React.FC = () => {
  const [userRole, setUserRole] = useState<string>('project_manager');
  const [selectedTasks, setSelectedTasks] = useState<string[]>(['task-1', 'task-2']);
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [currentAllocations, setCurrentAllocations] = useState<TaskAllocation[]>([]);
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [operationLog, setOperationLog] = useState<string[]>([]);

  // Demo resources
  const demoResources: Resource[] = [
    {
      id: 'resource-1',
      name: 'John Smith',
      type: 'work',
      max_units: 100,
      cost_per_unit: 50,
      availability: 80,
      current_utilization: 60,
      skills: ['Construction', 'Project Management'],
      hourly_rate: 75
    },
    {
      id: 'resource-2',
      name: 'Sarah Johnson',
      type: 'work',
      max_units: 100,
      cost_per_unit: 45,
      availability: 90,
      current_utilization: 40,
      skills: ['Architecture', 'Design'],
      hourly_rate: 65
    },
    {
      id: 'resource-3',
      name: 'Excavator',
      type: 'material',
      max_units: 1,
      cost_per_unit: 200,
      availability: 100,
      current_utilization: 30,
      skills: ['Excavation', 'Heavy Equipment']
    },
    {
      id: 'resource-4',
      name: 'Concrete Mix',
      type: 'material',
      max_units: 1000,
      cost_per_unit: 150,
      availability: 95,
      current_utilization: 20
    }
  ];

  // Demo task allocations
  const demoAllocations: TaskAllocation[] = [
    {
      id: 'allocation-1',
      task_id: 'task-1',
      resource_id: 'resource-1',
      allocation_rate: 100,
      delay: 0,
      work_type: 'effort-driven',
      units: 100,
      start_date: new Date('2024-01-15'),
      end_date: new Date('2024-01-30')
    },
    {
      id: 'allocation-2',
      task_id: 'task-2',
      resource_id: 'resource-2',
      allocation_rate: 75,
      delay: 2,
      work_type: 'fixed-units',
      units: 75,
      start_date: new Date('2024-02-01'),
      end_date: new Date('2024-02-15')
    }
  ];

  useEffect(() => {
    // Load demo data
    setAvailableResources(demoResources);
    setCurrentAllocations(demoAllocations);
  }, []);

  const handleAllocationOperation = async (operation: AllocationOperation) => {
    try {
      // Log the operation
      const logEntry = `[${new Date().toLocaleTimeString()}] ${operation.type}: ${JSON.stringify(operation.data)}`;
      setOperationLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 entries

      // Handle the operation
      await allocationTabService.handleAllocationOperation(operation);

      // Update local state based on operation
      switch (operation.type) {
        case 'assign-resource':
          if (operation.data?.action === 'remove') {
            setCurrentAllocations(prev => 
              prev.filter(allocation => !operation.data.taskIds.includes(allocation.task_id))
            );
          } else if (operation.data?.resourceId) {
            const newAllocation: TaskAllocation = {
              id: `allocation-${Date.now()}`,
              task_id: operation.data.taskIds[0],
              resource_id: operation.data.resourceId,
              allocation_rate: 100,
              delay: 0,
              work_type: 'effort-driven',
              units: 100
            };
            setCurrentAllocations(prev => [...prev, newAllocation]);
          }
          break;

        case 'combine-work-rate':
          // Toggle combine work rate setting
          console.log('Combine work rate toggled');
          break;

        case 'set-delay':
          if (operation.data?.action === 'clear') {
            setCurrentAllocations(prev => 
              prev.map(allocation => 
                operation.data.taskIds.includes(allocation.task_id)
                  ? { ...allocation, delay: 0 }
                  : allocation
              )
            );
          } else if (operation.data?.action === 'set') {
            // In a real app, this would prompt for delay value
            const delayDays = 3; // Demo value
            setCurrentAllocations(prev => 
              prev.map(allocation => 
                operation.data.taskIds.includes(allocation.task_id)
                  ? { ...allocation, delay: delayDays }
                  : allocation
              )
            );
          }
          break;

        case 'update-allocation':
          if (operation.data?.workType) {
            setCurrentAllocations(prev => 
              prev.map(allocation => 
                operation.data.taskIds.includes(allocation.task_id)
                  ? { ...allocation, work_type: operation.data.workType }
                  : allocation
              )
            );
          }
          break;

        default:
          console.log('Operation handled:', operation);
      }
    } catch (error) {
      console.error('Allocation operation failed:', error);
      const errorLog = `[${new Date().toLocaleTimeString()}] ERROR: ${error}`;
      setOperationLog(prev => [errorLog, ...prev.slice(0, 9)]);
    }
  };

  const allocationTab = AllocationTab(
    handleAllocationOperation,
    userRole,
    selectedTasks,
    canEdit,
    currentAllocations,
    availableResources
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Allocation Tab Test</h1>
            <p className="text-green-100 mt-1">Test the Asta PowerProject Allocation ribbon tab</p>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="team_member">Team Member</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Tasks
                </label>
                <div className="space-y-2">
                  {['task-1', 'task-2', 'task-3'].map(taskId => (
                    <label key={taskId} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(taskId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTasks(prev => [...prev, taskId]);
                          } else {
                            setSelectedTasks(prev => prev.filter(id => id !== taskId));
                          }
                        }}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      {taskId}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edit Permissions
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={canEdit}
                    onChange={(e) => setCanEdit(e.target.checked)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  Can Edit
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actions
                </label>
                <div className="space-y-2">
                  <Button
                    onClick={() => setSelectedTasks(['task-1', 'task-2'])}
                    variant="outline"
                    size="sm"
                  >
                    Select Tasks 1 & 2
                  </Button>
                  <Button
                    onClick={() => setSelectedTasks([])}
                    variant="outline"
                    size="sm"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Ribbon Tab */}
          <div className="p-6">
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Allocation Tab Configuration
              </h3>
              
                             {/* Tab Header */}
               <div className="flex items-center space-x-2 mb-4">
                 {allocationTab.icon && <allocationTab.icon className="w-5 h-5 text-green-600" />}
                 <span className="font-medium text-gray-700">{allocationTab.label}</span>
               </div>

              {/* Tab Groups */}
              <div className="space-y-6">
                {allocationTab.groups.map(group => (
                  <div key={group.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{group.title}</h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {group.buttons.map(button => (
                        <div key={button.id} className="relative">
                          <button
                            onClick={button.action}
                            disabled={button.disabled}
                            className={`
                              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                              transition-colors duration-200
                              ${button.disabled
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400'
                              }
                              ${button.isActive ? 'bg-green-100 border-green-500 text-green-700' : ''}
                            `}
                            title={button.tooltip}
                          >
                            <button.icon className="w-4 h-4" />
                            <span>{button.label}</span>
                            {button.type === 'dropdown' && (
                              <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </button>

                          {/* Dropdown Menu */}
                          {button.type === 'dropdown' && button.dropdownItems && (
                            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10 hidden group-hover:block">
                              <div className="py-1">
                                {button.dropdownItems.map((item: any) => (
                                  <button
                                    key={item.id}
                                    onClick={item.action}
                                    disabled={item.disabled}
                                    className={`
                                      w-full text-left px-4 py-2 text-sm
                                      ${item.disabled
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
                                      }
                                    `}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <item.icon className="w-4 h-4" />
                                      <span>{item.label}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current State */}
          <div className="p-6 border-t border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Resources */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Resources</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {availableResources.map(resource => (
                    <div key={resource.id} className="mb-3 p-3 bg-white rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{resource.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{resource.type}</p>
                          <p className="text-sm text-gray-500">
                            Max: {resource.max_units} | Available: {resource.availability}% | 
                            Utilized: {resource.current_utilization}%
                          </p>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          ${resource.cost_per_unit}/unit
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Allocations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Allocations</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {currentAllocations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No allocations found</p>
                  ) : (
                    currentAllocations.map(allocation => (
                      <div key={allocation.id} className="mb-3 p-3 bg-white rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800">
                              Task {allocation.task_id}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Resource: {availableResources.find(r => r.id === allocation.resource_id)?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Rate: {allocation.allocation_rate}% | Delay: {allocation.delay} days | 
                              Type: {allocation.work_type}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-blue-600">
                            {allocation.units} units
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Operation Log */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Operation Log</h3>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-sm">
              {operationLog.length === 0 ? (
                <p className="text-gray-500">No operations logged yet</p>
              ) : (
                operationLog.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationTabTest; 