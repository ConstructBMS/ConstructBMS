import React, { useState, useEffect } from 'react';
import { XMarkIcon, UsersIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface ResourceSummary {
  resourceId: string;
  resourceName: string;
  type: string;
  tasksAssigned: number;
  totalQuantity: number;
  totalCost: number;
  peakUsage: number;
  tasks: Array<{
    taskId: string;
    taskName: string;
    quantity: number;
    unit: string;
    rate: number;
    cost: number;
  }>;
}

interface ResourceSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedResources: Record<string, any[]>;
  tasks: any[];
  disabled?: boolean;
}

const ResourceSummaryModal: React.FC<ResourceSummaryModalProps> = ({
  isOpen,
  onClose,
  assignedResources,
  tasks,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [resourceSummaries, setResourceSummaries] = useState<ResourceSummary[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'usage'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<string>('all');

  const canView = canAccess('programme.resource.view');
  const isDisabled = disabled || !canView;

  useEffect(() => {
    if (isOpen) {
      generateResourceSummaries();
    }
  }, [isOpen, assignedResources, tasks, filterType]);

  const generateResourceSummaries = () => {
    const resourceMap = new Map<string, ResourceSummary>();

    Object.entries(assignedResources).forEach(([taskId, resources]) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      resources.forEach((resource: any) => {
        const resourceId = resource.resourceId;
        const resourceName = resource.name || `Resource ${resourceId}`;
        const type = resource.type;
        
        // Apply filter
        if (filterType !== 'all' && type !== filterType) return;

        if (!resourceMap.has(resourceId)) {
          resourceMap.set(resourceId, {
            resourceId,
            resourceName,
            type,
            tasksAssigned: 0,
            totalQuantity: 0,
            totalCost: 0,
            peakUsage: 0,
            tasks: []
          });
        }

        const summary = resourceMap.get(resourceId)!;
        const cost = resource.quantity * resource.rate;

        summary.tasksAssigned++;
        summary.totalQuantity += resource.quantity;
        summary.totalCost += cost;
        summary.peakUsage = Math.max(summary.peakUsage, resource.quantity);

        summary.tasks.push({
          taskId,
          taskName: task.name,
          quantity: resource.quantity,
          unit: resource.unit,
          rate: resource.rate,
          cost
        });
      });
    });

    const summaries = Array.from(resourceMap.values());

    // Sort summaries
    const sortedSummaries = summaries.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.resourceName.localeCompare(b.resourceName);
          break;
        case 'cost':
          comparison = a.totalCost - b.totalCost;
          break;
        case 'usage':
          comparison = a.peakUsage - b.peakUsage;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setResourceSummaries(sortedSummaries);
  };

  const handleSort = (field: 'name' | 'cost' | 'usage') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: 'name' | 'cost' | 'usage') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'labour': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'material': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'cost': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <UsersIcon className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Allocation Summary by Resource
            </h2>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              {resourceSummaries.length} resource(s) assigned
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Type:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Types</option>
              <option value="labour">Labour</option>
              <option value="material">Material</option>
              <option value="cost">Cost</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-900 dark:text-gray-100">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('name')}
                  >
                    Resource Name {getSortIcon('name')}
                  </th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Tasks Assigned</th>
                  <th className="px-4 py-3">Total Quantity</th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('cost')}
                  >
                    Total Cost {getSortIcon('cost')}
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('usage')}
                  >
                    Peak Usage {getSortIcon('usage')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {resourceSummaries.map((summary) => (
                  <tr key={summary.resourceId} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium">{summary.resourceName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(summary.type)}`}>
                        {summary.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">{summary.tasksAssigned}</td>
                    <td className="px-4 py-3">{summary.totalQuantity.toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(summary.totalCost)}</td>
                    <td className="px-4 py-3">{summary.peakUsage.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700 font-bold">
                <tr>
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">
                    {resourceSummaries.reduce((sum, s) => sum + s.tasksAssigned, 0)}
                  </td>
                  <td className="px-4 py-3">
                    {resourceSummaries.reduce((sum, s) => sum + s.totalQuantity, 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(resourceSummaries.reduce((sum, s) => sum + s.totalCost, 0))}
                  </td>
                  <td className="px-4 py-3"></td>
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
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceSummaryModal; 