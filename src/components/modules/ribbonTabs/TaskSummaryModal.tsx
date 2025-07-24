import React, { useState, useEffect } from 'react';
import { XMarkIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface TaskSummary {
  assignedResources: number;
  endDate: Date;
  resources: Array<{
    cost: number;
    quantity: number;
    rate: number;
    resourceId: string;
    resourceName: string;
    type: string;
    unit: string;
  }>;
  startDate: Date;
  taskId: string;
  taskName: string;
  totalCost: number;
  totalQuantity: number;
}

interface TaskSummaryModalProps {
  assignedResources: Record<string, any[]>;
  disabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
}

const TaskSummaryModal: React.FC<TaskSummaryModalProps> = ({
  isOpen,
  onClose,
  assignedResources,
  tasks,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [taskSummaries, setTaskSummaries] = useState<TaskSummary[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'resources'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const canView = canAccess('programme.resource.view');
  const isDisabled = disabled || !canView;

  useEffect(() => {
    if (isOpen) {
      generateTaskSummaries();
    }
  }, [isOpen, assignedResources, tasks]);

  const generateTaskSummaries = () => {
    const summaries: TaskSummary[] = [];

    Object.entries(assignedResources).forEach(([taskId, resources]) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task || resources.length === 0) return;

      const taskResources = resources.map((resource: any) => ({
        resourceId: resource.resourceId,
        resourceName: resource.name || `Resource ${resource.resourceId}`,
        type: resource.type,
        quantity: resource.quantity,
        unit: resource.unit,
        rate: resource.rate,
        cost: resource.quantity * resource.rate
      }));

      const totalQuantity = taskResources.reduce((sum, r) => sum + r.quantity, 0);
      const totalCost = taskResources.reduce((sum, r) => sum + r.cost, 0);

      summaries.push({
        taskId,
        taskName: task.name,
        assignedResources: resources.length,
        totalQuantity,
        totalCost,
        startDate: task.startDate,
        endDate: task.endDate,
        resources: taskResources
      });
    });

    // Sort summaries
    const sortedSummaries = summaries.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.taskName.localeCompare(b.taskName);
          break;
        case 'cost':
          comparison = a.totalCost - b.totalCost;
          break;
        case 'resources':
          comparison = a.assignedResources - b.assignedResources;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setTaskSummaries(sortedSummaries);
  };

  const handleSort = (field: 'name' | 'cost' | 'resources') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: 'name' | 'cost' | 'resources') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ListBulletIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Allocation Summary by Task
            </h2>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              {taskSummaries.length} task(s) with resources
            </span>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-900 dark:text-gray-100">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('name')}
                  >
                    Task Name {getSortIcon('name')}
                  </th>
                  <th className="px-4 py-3">Resources</th>
                  <th className="px-4 py-3">Total Quantity</th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('cost')}
                  >
                    Total Cost {getSortIcon('cost')}
                  </th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('resources')}
                  >
                    Resource Count {getSortIcon('resources')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {taskSummaries.map((summary) => (
                  <tr key={summary.taskId} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium">{summary.taskName}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {summary.resources.map((resource) => (
                          <div key={resource.resourceId} className="text-xs">
                            {resource.resourceName} ({resource.quantity} {resource.unit})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">{summary.totalQuantity.toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(summary.totalCost)}</td>
                    <td className="px-4 py-3">{summary.startDate.toLocaleDateString()}</td>
                    <td className="px-4 py-3">{summary.endDate.toLocaleDateString()}</td>
                    <td className="px-4 py-3">{summary.assignedResources}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700 font-bold">
                <tr>
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">
                    {taskSummaries.reduce((sum, s) => sum + s.totalQuantity, 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(taskSummaries.reduce((sum, s) => sum + s.totalCost, 0))}
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">
                    {taskSummaries.reduce((sum, s) => sum + s.assignedResources, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskSummaryModal; 