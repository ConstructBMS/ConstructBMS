import React, { useMemo } from 'react';
import { ChartBarIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ResourceUsageData {
  cost: number;
  date: string;
  labour: number;
  material: number;
  total: number;
}

interface TaskUsageData {
  cost: number;
  labour: number;
  material: number;
  taskId: string;
  taskName: string;
  total: number;
}

interface ResourceUsagePanelProps {
  assignedResources: Record<string, any[]>;
  groupBy: 'type' | 'task';
  isVisible: boolean;
  onClose: () => void;
  tasks: any[];
}

const ResourceUsagePanel: React.FC<ResourceUsagePanelProps> = ({
  isVisible,
  groupBy,
  assignedResources,
  tasks,
  onClose
}) => {
  // Calculate usage data based on assigned resources
  const usageData = useMemo(() => {
    if (groupBy === 'type') {
      return calculateUsageByType(assignedResources);
    } else {
      return calculateUsageByTask(assignedResources, tasks);
    }
  }, [groupBy, assignedResources, tasks]);

  const maxValue = useMemo(() => {
    if (groupBy === 'type') {
      return Math.max(...usageData.map((d: ResourceUsageData) => d.total));
    } else {
      return Math.max(...usageData.map((d: TaskUsageData) => d.total));
    }
  }, [usageData, groupBy]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-64 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Resource Usage {groupBy === 'type' ? 'by Type' : 'by Task'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 h-48 overflow-y-auto">
        {groupBy === 'type' ? (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Usage by Resource Type
            </h4>
            {usageData.map((data: ResourceUsageData, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{data.date}</span>
                  <span>£{data.total.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="w-16 text-xs text-blue-600">Labour</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(data.labour / maxValue) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-xs text-gray-500">£{data.labour.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 text-xs text-green-600">Material</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(data.material / maxValue) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-xs text-gray-500">£{data.material.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 text-xs text-purple-600">Cost</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(data.cost / maxValue) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-xs text-gray-500">£{data.cost.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Usage by Task
            </h4>
            {usageData.map((data: TaskUsageData, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span className="truncate max-w-32">{data.taskName}</span>
                  <span>£{data.total.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="w-16 text-xs text-blue-600">Labour</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(data.labour / maxValue) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-xs text-gray-500">£{data.labour.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 text-xs text-green-600">Material</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(data.material / maxValue) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-xs text-gray-500">£{data.material.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 text-xs text-purple-600">Cost</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(data.cost / maxValue) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-xs text-gray-500">£{data.cost.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions to calculate usage data
const calculateUsageByType = (assignedResources: Record<string, any[]>): ResourceUsageData[] => {
  const usageByDate: Record<string, { cost: number, labour: number; material: number; }> = {};
  
  Object.values(assignedResources).flat().forEach((resource: any) => {
    const date = new Date().toISOString().split('T')[0]; // Simplified - use current date
    if (!usageByDate[date]) {
      usageByDate[date] = { labour: 0, material: 0, cost: 0 };
    }
    
    const totalCost = resource.quantity * resource.rate;
    switch (resource.type) {
      case 'labour':
        usageByDate[date].labour += totalCost;
        break;
      case 'material':
        usageByDate[date].material += totalCost;
        break;
      case 'cost':
        usageByDate[date].cost += totalCost;
        break;
    }
  });

  return Object.entries(usageByDate).map(([date, usage]) => ({
    date,
    labour: usage.labour,
    material: usage.material,
    cost: usage.cost,
    total: usage.labour + usage.material + usage.cost
  }));
};

const calculateUsageByTask = (assignedResources: Record<string, any[]>, tasks: any[]): TaskUsageData[] => {
  return Object.entries(assignedResources).map(([taskId, resources]) => {
    const task = tasks.find(t => t.id === taskId);
    const usage = { labour: 0, material: 0, cost: 0 };
    
    resources.forEach((resource: any) => {
      const totalCost = resource.quantity * resource.rate;
      switch (resource.type) {
        case 'labour':
          usage.labour += totalCost;
          break;
        case 'material':
          usage.material += totalCost;
          break;
        case 'cost':
          usage.cost += totalCost;
          break;
      }
    });

    return {
      taskId,
      taskName: task?.name || `Task ${taskId}`,
      labour: usage.labour,
      material: usage.material,
      cost: usage.cost,
      total: usage.labour + usage.material + usage.cost
    };
  }).filter(data => data.total > 0);
};

export default ResourceUsagePanel; 